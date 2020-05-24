// Copyright (C) 2020
// Antonio Cisternino (antonio.cisternino@unipi.it)

'use strict';

let controlButton = document.getElementById('controlButton');
let duration = document.getElementById('duration')
let conf = document.getElementById('configuration')
let runningPanel = document.getElementById('runningPanel')
let notInCallPanel = document.getElementById('notInCallPanel')
let reset = document.getElementById('reset')
let mutedTab = document.getElementById('mutedTab')
let breakn = document.getElementById('breakn')
let breakMax = document.getElementById('breakMax')

let initCode = `

var tc = null;
var obs = null;
// list of { test: fun() -> bool, action: act() -> unit}
var checkList = new Array()

function queue(t, a) {
  checkList.push({ test: t, action: a});
}

if (!document.teamscarousel) {

    obs = new MutationObserver(mutation => {
      var nl = new Array();
      for (var i = 0; i < checkList.length; i++) {
        if (checkList[i].test()) {
          checkList[i].action()
        } else {
          nl.push(checkList[i])
        }
      }
      checkList = nl;
    });
    
    obs.observe(document.body, {
      childList: true,
      attributes: true,
      subtree: true,
      characterData: false 
    });

    tc = { interval: 4000, breakoutPart: 1, breakoutNum: 1 }
    document.teamscarousel = tc;
    
    tc.isInCall = function () {
      if (document.getElementById('roster-button')) {
        return true
      } else {
        return false
      }
    }

    tc.isRosterAllocated = function () {
      return document.getElementsByTagName('calling-roster').length > 0
    }

    tc.isRosterVisible = function () {
      if (tc.isRosterAllocated()) {
        var rb = document.getElementsByTagName('calling-roster')[0]

        return (rb.className.indexOf('ng-hide') == -1)  
      }
      return false
    }

    tc.showRoster = function () {
      if (tc.isRosterAllocated()) {
        var rb = document.getElementsByTagName('calling-roster')[0]
        if (rb && rb.className.indexOf('ng-hide') != -1) {
          document.getElementById('roster-button').click()
        }
      } else if (tc.isInCall()) {
        document.getElementById('roster-button').click()
      }
    }

    function Participant(sect, tgt, bid) {
      return {
        name: tgt.getElementsByClassName('name')[0].innerText, target: tgt, breakout: bid, section: sect,
        isCaller: function () {
          return this.breakout == 0
        },
        next: function () {
          for (var el = this.target.nextElementSibling; el != null; el = el.nextElementSibling) {
            if (el.id.startsWith('participant')) {
              el.scrollIntoViewIfNeeded()
              return Participant(this.section, el, this.breakout + 1)
            }
          }
          return null;
        },
        showMenu: function () { 
          this.target.getElementsByClassName('participant-menu')[0].firstElementChild.firstElementChild.click() 
        },
        pin: function() {
          this.showMenu()
          queue(() => {
                  if (document.getElementsByClassName('pin-participant-action')) {
                    return true
                  } else {
                    return false
                  }
                }, () => {
                  if (document.getElementsByClassName('pin-participant-action')) {
                    setTimeout(() => { document.getElementsByClassName('pin-participant-action')[0].click() }, 0)
                  }
                })  
        }
      }
    }

    tc.rosterParticipants = function () {
      var part = document.getElementsByTagName('calling-roster-section')
      var ret = new Array();
      for (var i = 0; i < part.length; i++) {
        var k = part[i].getAttribute('section-key')
        var tit = part[i].getAttribute('section-title')
        var desc = { 
          section: k, inCall: false, title: tit, target: part[i],
          getParticipantsIterator: function() {
            this.target.scrollIntoViewIfNeeded()
            var l = this.target.getElementsByTagName('li')
            for (var j = 0; j < l.length; j++) {
              if (l[j].id.startsWith('participant')) {
                return Participant(this, l[j], 0)
              }
            }
            return null
          }
        }
        if (k == 'participantsInCall' || k == 'attendeesInMeeting') { desc.inCall = true }
        ret.push(desc)
      }
      return ret
    }

    tc.updateList = function () {
      if (!tc.isRosterVisible()) {
        tc.showRoster()
        setTimeout(() => { tc.updateList() }, 300)
        return;
      }
      if (document.getElementsByClassName('roster-list-more-people').length) {
         document.getElementsByClassName('roster-list-more-people')[0].click()
      }
      
      tc.current = null
      tc.sectionsCalling = new Array()
      tc.currSection = 0

      var ps = tc.rosterParticipants()
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i]
        if (p.inCall) {
          tc.sectionsCalling.push(p)
        }
      }

      tc.current = tc.sectionsCalling[tc.currSection].getParticipantsIterator()
      if (tc.current != null && tc.current.isCaller()) { tc.current = tc.current.next() }
    }

    tc.switchToPin = function (el) {
      var pin = document.getElementsByClassName('pin-icon-filled')
      if (pin.length) {
        pin[0].click()
      }
      setTimeout(() => { el.pin() }, 300)
    }

    tc.init = function() {
      tc.current = null
    }

    tc.moveOffset = function () {
      for (var i = 0; i < tc.breakoutPart - 1; i++) {
        tc.current = tc.current.next()
        if (tc.current == null) {
          return;
        }
      }
    }

    tc.moveNextItem = function () {
      tc.current = tc.current.next()
      if (tc.current != null) { return false }
      while (!tc.current) {
        tc.currSection = tc.currSection + 1
        if (tc.sectionsCalling.length == tc.currSection) { tc.currSection = 0 }
        tc.current = tc.sectionsCalling[tc.currSection].getParticipantsIterator()
        if (tc.current != null && tc.current.isCaller()) { tc.current = tc.current.next() }
        if (tc.current != null && tc.breakoutNum > 1) {
          tc.moveOffset()
        }
      }
      return true
    }

    tc.moveNext = function () {
      if (tc.breakoutNum == 1) {
        tc.moveNextItem()
      } else {
        for (var i = 0; i < tc.breakoutNum; i++) {
          if (tc.moveNextItem()) { break; }
        }
      }
    }

    tc.startCarousel = function () {
      tc.updateList()
      tc.cycle = setInterval(function () {
        tc.switchToPin(tc.current)
        tc.moveNext()
        }, tc.interval)
    }

    tc.stopCarousel = function () { clearInterval(tc.cycle); tc.cycle = null; }

    tc.isRunning = function () { return (tc.cycle ? true : false) }

    tc.init();
} else {
  tc = document.teamscarousel
}
`

function exec(script, result) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
        tabs[0].id,
        {
          code: script
        }, result);
  });
}

function test(cond, t, e) {
  exec(cond, function (r) { if ((r + "") == "true") {t()} else {e()}})
}

function checkInit(t, e) {
  test("typeof(tc) != \"undefined\" && tc ? true : false", t, e)
}

function checkRunning(t, e) {
  test("typeof(tc) != \"undefined\" && tc ? tc.isRunning() : false", t, e)
}

function checkInCall(t, e) {
  test("typeof(tc) != \"undefined\" && tc ? tc.isInCall() : false", t, e)
}

function setPlayIcon() {
  controlButton.style.backgroundImage = "url(\"images/PlayIcon.png\")"
}

function setPauseIcon() {
  controlButton.style.backgroundImage = "url(\"images/PauseIcon.png\")"
}

function isPlayIcon() {
  (controlButton.style.backgroundImage + "").indexOf("Play") != -1
}

function isPauseIcon() {
  (controlButton.style.backgroundImage + "").indexOf("Pause") != -1
}

function readInterval(c) {
  exec("tc.interval", c)
}

function readBreakoutNum(c) {
  exec("tc.breakoutNum", c)
}

function readBreakoutPart(c) {
  exec("tc.breakoutPart", c)
}

var labels =
  {
    'it': {
      'interval-txt-lbl': 'Intervallo',
      'interval-sec-lbl': 'secondi',
      'mute-lbl': 'Muto',
      'breakout-lbl': 'Breakout',
      'notincall-lbl': 'Funzione disponibile durante le chiamate di Microsoft Teams.'
    }
  }

function localize() {
  for (var i = 0; i < navigator.languages.length; i++) {
    if (navigator.languages[i].toLowerCase().startsWith('it')) {
      for (var l in labels['it']) {
        document.getElementById(l).innerText = labels['it'][l]
      }
    }
  }
}

function updateMutedTab() {
  chrome.tabs.query({ active: true }, (t) =>{
    if (t[0].mutedInfo.muted) {
      mutedTab.checked = true
    } else {
      mutedTab.checked = false
    }
  })
}

function setMutedTab(mute) {
  chrome.tabs.query({ active: true }, (t) =>{
    chrome.tabs.update(t[0].id, {muted: mute})
  })
}

function setIcon() {
  checkRunning(
    () => { setPauseIcon() },
    () => { setPlayIcon() }
  )
}

function showRoster() {
  exec("tc.showRoster()")
}

function switchIcon() {
  if (isPauseIcon()) { setPlayIcon() }
  else { setPauseIcon() }
}

function setInCallPanel() {
  checkInCall(() => 
    { 
      runningPanel.style.display = ''
      notInCallPanel.style.display = 'none'
      showRoster()
    }, () => {
      runningPanel.style.display = 'none'
      notInCallPanel.style.display = ''
    })
}

localize()

checkInit(function () {
    readInterval(function (i) {
      if (i + "" != "undefined") {
        var n = parseInt(i + "") / 1000
        duration.value = n
      }
    })
    readBreakoutNum( (n) => { breakMax.value = n } )
    readBreakoutPart( (n) => { breakn.value = n })
    updateMutedTab()
    setIcon()
    setInCallPanel()
  }, function () {
  exec(initCode, function (r) {
    readInterval(function (i) {
      if (i + "" != "undefined") {
        var n = parseInt(i + "") / 1000
        duration.value = n
      }
    })
    updateMutedTab()
    setIcon()
    setInCallPanel()
  })
})


controlButton.onclick = function(element) {
  let color = element.target.value;

  switchIcon()

  checkRunning(
      function () { exec("tc.stopCarousel()"); window.close() }, 
      function () { exec("tc.startCarousel()"); window.close() }
  );

}

duration.onchange = function(element) {
  exec("tc.interval = " + (parseInt(duration.value) * 1000))
}

reset.onclick = function (element) {
  exec("if (tc.isRunning()) { tc.stopCarousel()}; document.teamscarousel = null; tc = null")
  window.close()
}

mutedTab.onchange = function (element) {
  if (mutedTab.checked) {
    setMutedTab(true)
  } else {
    setMutedTab(false)
  }
}

breakMax.onchange = function (element) {
  if (parseInt(breakn.value) > parseInt(breakMax.value)) breakn.value = "1"
  breakn.max = breakMax.value
  exec("tc.breakoutNum = " + breakMax.value + "; tc.updateList()")
}

breakn.onchange = function (element) {
  exec("tc.breakoutPart = " + breakn.value)
}