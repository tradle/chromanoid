
// var currentReq;
var DOC_REQ_TYPES = ['sign', 'verify', 'encrypt', 'decrypt'];
var onchange = [];
var counts = {};
var requests = {
  sign: [],
  verify: [],
  encrypt: [],
  decrypt: []
};

function requireProp(obj, prop) {
  if (!obj[prop]) throw new Error('Missing required property: ' + prop);
}

function httpErr(code, msg) {
  return {
    code: code,
    message: msg
  }
}

module.exports = function(AccountService) {
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

  function validateRequest(request, cb) {
    try {
      requireProp(request, 'type');
      requireProp(request, 'alias');
      if (DOC_REQ_TYPES.indexOf(request.type) !== -1) {
        requireProp(request, 'data');
        requireProp(request.data, 'doc');
        if (!AccountService.withAlias(request.alias)) {
          cb({
            error: httpErr(404, 'No account found with alias: ' + request.alias)
          });

          return false;
        }
      }
    } catch (err) {
      cb({
        error: httpErr(400, err.message)
      });

      return false;
    }

    return true;
  }

  function enqueue(request, cb) {
    if (!validateRequest(request, cb)) return;

    switch (request.type) {
      case 'sign':
      /* fall through */
      case 'verify':
      /* fall through */
      case 'encrypt':
      /* fall through */
      case 'decrypt':
      /* fall through */
      case 'newaccount':
      /* fall through */
      case 'forget':
        break;
      default:
        throw new Error('unsupported request type');
    }

    request = normalizeRequest(request, cb);
    requests[request.type].push(request);
    count(request.type);
  }

  function normalizeRequest(request, cb) {
    var req = {
      type: request.type,
      doc: request.data && request.data.doc,
      alias: request.alias,
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
    }

    return req;
  }

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
