'use strict';

var manifest = chrome.runtime.getManifest();
var blacklistedIds = [];
var noop = function() {};
var ui;
var currentReq;
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
  else if (request.forApp !== manifest.name) return; // not for us

  var args = arguments;

  showUI(function() {
    var callback = function(resp) {
      respond(resp);
      queued.splice(queued.indexOf(callback), 1);
      if (!uiClosed && !queued.length) ui.close();
    };

    queued.push(callback);
    ui.contentWindow.handleRequest(request, callback);
  });

  return true; // signify that we'll be responding asynchronously
});

function showUI(cb) {
  cb = cb || noop;
  if (ui) {
    setTimeout(cb, 0); // force async for consistency
    return;
  }

  var width = screen.availWidth / 2 | 0;
  var height = screen.availHeight / 2 | 0;

  chrome.app.window.create('index.html', {
    id: 'main',
    bounds: {
      width: width,
      height: height,
      left: Math.round((screen.availWidth - width) / 2),
      top: Math.round((screen.availHeight - height) / 2)
    }
  }, function(child) {
    if (!child) return;

    uiClosed = false;
    ui = child;
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