
module.exports = function reqHandler() {
  return {
    enqueue: enqueue,
    dequeue: dequeue,
    counts: counts,
    cancelCurrentRequest: function() {
      if (currentReq) currentReq.cancel();
    },
    listen: function(cb) {
      onchange.push(cb);
    },
    stopListening: function(cb) {
      var idx = onchange.indexOf(cb);
      if (idx !== -1) onchange.splice(idx, 1);
    }
  }
};

var currentReq;
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

function dequeue(type) {
  var req = requests[type].shift();
  currentReq = req;
  count(type);
  return req;
}

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

  requests[request.type].push({
    doc: request.data.doc,
    submit: function(resp) {
      cb(resp);
      currentReq = null;
    },
    cancel: function(resp) {
      currentReq = null;
      resp = resp || {
        error: {
          code: -1,
          message: 'User canceled'
        }
      }

      cb(resp);
    }
  });

  count(request.type);
}