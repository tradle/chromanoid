'use strict';

var manifest = chrome.runtime.getManifest();
var blacklistedIds = [];
var noop = function() {};
var ui;
var queued = [];
var uiClosed;
var canceledResp = {
  error: {
    code: -1,
    message: 'User closed window'
  }
}

// Listens for the app launching then creates the window
// chrome.app.runtime.onLaunched.addListener();

chrome.runtime.onMessageExternal.addListener(function(request, sender, respond) {
  if (blacklistedIds.indexOf(sender.id) !== -1) {
    respond({
      error: {
        code: 401,
        message: 'unauthorized'
      }
    });

    return; // don't allow this extension access
  }
  else if (!request.forApp || request.forApp.name !== manifest.name) return; // not for us

  showUI(function() {
    var callback = function(resp) {
      respond(resp);
      queued.splice(queued.indexOf(callback), 1);
      if (!uiClosed && !queued.length) ui.close();
    };

    queued.push(callback);
    ui.contentWindow.appReady.then(function() {
      var requests = ui.contentWindow.angular
        .element(ui.contentWindow.document)
        .injector()
        .get('requests');

      requests.queue(request, callback);
    });
  });

  return true; // signify that we'll be responding asynchronously
});

function showUI(cb) {
  cb = cb || noop;
  if (ui) {
    setTimeout(cb, 0); // force async for consistency
    return;
  }

  var width;
  var height;
  var left;
  var top;
  var aWidth = screen.availWidth;
  var aHeight = screen.availHeight;
  var minDim = Math.min(aHeight, aHeight);
  if (minDim > 600) {
    width = 600;
    height = 600;
    left = Math.round((aWidth - width) / 2);
    top = Math.round((aHeight - height) / 2);
  }
  else {
    width = aWidth;
    height = aHeight;
    left = 0;
    top = 0;
  }

  var windowId = 'main';
  chrome.app.window.create('index.html', {
    id: windowId,
    outerBounds: {
      width: width,
      height: height,
      left: left,
      top: top
    }
  }, function(child) {
    if (!child) return;

    uiClosed = false;
    ui = child;
    ui.resizeTo(width, height);
    ui.moveTo(left, top);

    ui.onClosed.addListener(function() {
      uiClosed = true;
      while (queued.length) {
        queued[0](canceledResp)
      }

      ui = undefined;
    });

    ui.contentWindow.addEventListener('load', cb);
  });
}

showUI(); // for testing
