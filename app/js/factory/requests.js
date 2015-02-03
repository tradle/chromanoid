
module.exports = function reqHandler() {
  return {
    enqueue: enqueue,
    // dequeue: dequeue,
    // peek: peek,
    next: peek,
    counts: counts,
    // cancelCurrentRequest: function() {
    //   if (currentReq) currentReq.cancel();
    // },
    listen: function(cb) {
      onchange.push(cb);
    },
    stopListening: function(cb) {
      var idx = onchange.indexOf(cb);
      if (idx !== -1) onchange.splice(idx, 1);
    }
  }
};

// var currentReq;
var onchange = [];
var counts = {};
var requests = {
  sign: [],
  verify: [],
  encrypt: [],
  decrypt: []
};

function count(type) {
  counts[type] = requests[type].length;
  onchange.forEach(function(cb) {
    cb();
  });
}

function remove(type, req) {
  var idx = requests[type].indexOf(req);
  if (idx !== -1) requests[type].splice(idx, 1);
  count(type);
}

function peek(type) {
  return requests[type][0];
}

// function dequeue(type) {
//   var req = requests[type].shift();
//   currentReq = req;
//   count(type);
//   return req;
// }

function enqueue(request, cb) {
  if (!request.type) {
    return cb({
      error: {
        code: 400,
        message: 'Missing required property: type'
      }
    })
  }

  switch (request.type) {
    case 'sign':
    /* fall through */
    case 'verify':
    /* fall through */
    case 'encrypt':
    /* fall through */
    case 'decrypt':
    /* fall through */
    case 'forget':
      break;
    default:
      throw new Error('unsupported request type');
  }

  var req = {
    doc: request.data.doc,
    submit: function(resp) {
      cb(resp);
      // currentReq = null;
      remove(request.type, req);
    },
    cancel: function(resp) {
      // currentReq = null;
      resp = resp || {
        error: {
          code: -1,
          message: 'User canceled'
        }
      }

      cb(resp);
      remove(request.type, req);
    }
  };

  requests[request.type].push(req);
  count(request.type);
}