// Copyright (C) 2020
// Antonio Cisternino (antonio.cisternino@unipi.it)

'use strict';

let controlButton = document.getElementById('controlButton');
let duration = document.getElementById('duration')
let conf = document.getElementById('configuration')
let runningPanel = document.getElementById('runningPanel')
let notInCallPanel = document.getElementById('notInCallPanel')
let reset = document.getElementById('reset')


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

    tc = { interval: 4000, pinned: null }
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

    tc.rosterParticipants = function () {
      var part = document.getElementsByTagName('calling-roster-section')
      var ret = new Array();
      for (var i = 0; i < part.length; i++) {
        var k = part[i].getAttribute('section-key')
        var tit = part[i].getAttribute('section-title')
        var desc = { 
          section: k, inCall: false, title: tit, target: part[i],
          getParticipants: function () {
            var l = this.target.getElementsByTagName('li')
            var ret = new Array()
            for (var j = 0; j < l.length; j++) {
              if (l[j].id.startsWith('participant')) {
                var n = l[j].getElementsByClassName('name')[0].innerText
                ret.push({name: n, target: l[j], 
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
                })
              }
            }
            return ret
          }
        }
        if (k == 'participantsInCall' || k == 'attendeesInMeeting') { desc.inCall = true }
        ret.push(desc)
      }
      return ret
    }

    tc.updateList = function () {
      if (!tc.isRosterVisible()) {
        //console.log('Showing roster...')
        tc.showRoster()
        setTimeout(() => { tc.updateList() }, 300)
        return;
      }
      //console.log('populating')
      tc.ol = new Array()

      var ps = tc.rosterParticipants()
      //console.log('ps ' + ps.length)
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i]
        if (p.inCall) {
          var ll = p.getParticipants()
          //console.log(ll)
          for (var j = 0; j < ll.length; j++) {
            var part = ll[j]
            //console.log(part)
            tc.ol.push(part)
          }
        }
      }
    }

    tc.switchPin = function (el1, el2) {
      tc.ol[el1].pin()
      setTimeout(() => { tc.ol[el2].pin() }, 300)
    }

    tc.init = function() {
      tc.last = -1;
      tc.next = 1;
    }

    tc.startCarousel = function () {
      tc.updateList()
      tc.cycle = setInterval(function () {
        var len = tc.ol.length
        tc.updateList()
        if (tc.ol.length != len) {
          if (tc.next >= tc.ol.length) {
            tc.next = 1
            tc.last = -1
          }
        }
        if (tc.last > 0) {
          tc.switchPin(tc.last, tc.next)
        } else {
          tc.ol[tc.next].pin();
        }
        setTimeout(function () {
          tc.last = tc.next;
          tc.next = (tc.next + 1);
          if (tc.next == tc.ol.length) tc.next = 1 }, 600)
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

checkInit(function () {
    readInterval(function (i) {
      if (i + "" != "undefined") {
        var n = parseInt(i + "") / 1000
        duration.value = n
      }
    })

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