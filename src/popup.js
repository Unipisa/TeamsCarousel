// Copyright (C) 2020
// Antonio Cisternino (antonio.cisternino@unipi.it)

'use strict';

let controlButton = document.getElementById('controlButton');
let duration = document.getElementById('duration')
let reset = document.getElementById('reset')

let initCode = `

var tc = null;
if (!document.teamscarousel) {
    tc = { interval: 4000 }
    
    tc.isRosterAllocated = function () {
      return document.getElementsByTagName('calling-roster').lenth > 0
    }

    tc.showRoster = function () {
      var rb = document.getElementsByTagName('calling-roster')[0]
      if (rb && rb.className.indexOf('ng-hide') != -1) {
        rb.className = rb.className.replace('ng-hide', '')
      }
    }

    tc.updateList = function () {
      //tc.showRoster()
      var ll = document.getElementsByTagName('li')
      tc.ol = new Array()
      for (i = 0; i < ll.length; i++) if (ll[i].id.startsWith('participant')) { tc.ol.push(ll[i]); }
    }

    tc.init = function() {
      tc.last = -1;
      tc.next = 1;
      if (tc.isRosterAllocated()) {
        tc.updateList()
      } else {
        document.getElementById('roster-button').click()
        setTimeout(function() { tc.updateList() }, 50)  
      }
    }

    tc.pin = function (el) {
      tc.isPinning = true
      el.getElementsByClassName('participant-menu')[0].firstElementChild.firstElementChild.click()
      setTimeout(function() { 
          document.getElementsByClassName('pin-participant-action')[0].click() 
        }, 300)
    }

    tc.switchpin = function (el1, el2) {
      tc.pin(el1);
      setTimeout(function f() { tc.pin(el2); }, 500);
    }

    tc.startCarousel = function () {
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
          tc.switchpin(tc.ol[tc.last], tc.ol[tc.next])
        } else {
          tc.pin(tc.ol[tc.next]);
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
  test("typeof(tc) != \"undefined\" ? true : false", t, e)
}

function checkRunning(t, e) {
  test("typeof(tc) != \"undefined\" ? tc.isRunning() : false", t, e)
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
    function () { setPauseIcon() },
    function () { setPlayIcon() }
  )
}

function switchIcon() {
  if (isPauseIcon()) { setPlayIcon() }
  else { setPauseIcon() }
}

checkInit(function () {
    readInterval(function (i) {
      if (i + "" != "undefined") {
        var n = parseInt(i + "") / 1000
        duration.value = n
      }
    })

    setIcon()

  }, function () {
  exec(initCode, function (r) {
    readInterval(function (i) {
      if (i + "" != "undefined") {
        var n = parseInt(i + "") / 1000
        duration.value = n
      }
    })
    
    setIcon()
  })
})


controlButton.onclick = function(element) {
  let color = element.target.value;

  switchIcon()

  checkInit(
    function () { checkRunning(
      function () { exec("tc.stopCarousel()"); window.close() }, 
      function () { exec("tc.startCarousel()"); window.close() }) },
    function () { exec(initCode, function (r) { exec("setTimeout(function () { tc.startCarousel()}, 1000)"); window.close() }) }
  );

}

duration.onchange = function(element) {
  exec("tc.interval = " + (parseInt(duration.value) * 1000))
}

reset.onclick = function (element) {
  exec(initCode)
  window.close()
}