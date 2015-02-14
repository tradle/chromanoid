
var currentReq;
var MAX_QUEUE_LENGTH = 1; // 1 = disallow queueing
var DOC_REQ_TYPES = ['sign', 'verify', 'encrypt', 'decrypt'];
var REQ_TYPES = ['sign', 'verify', 'encrypt', 'decrypt', 'newaccount'];
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

module.exports = function(AccountService, $q, $location, $rootScope) {
  function asyncify(fn) {
    return function() {
      var args = arguments;
      var ctx = this;
      return $q(function(resolve) {
        resolve(fn.apply(ctx, args));
      });
    }
  }

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
      if (REQ_TYPES.indexOf(request.type) === -1) {
        throw new Error('Unsupported request type: ' + request.type);
      }

      if (((currentReq ? 1 : 0) + requests[request.type].length) >= MAX_QUEUE_LENGTH) {
        cb({
          error: httpErr(503, 'Temporarily unavailable')
        });

        return false;
      }

      requireProp(request, 'alias');
      if (DOC_REQ_TYPES.indexOf(request.type) !== -1) {
        requireProp(request, 'doc');
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
    cb = asyncify(cb);
    if (!validateRequest(request, cb)) return;

    request = normalizeRequest(request, cb);
    requests[request.type].push(request);
    count(request.type);

    // TODO: decide if queueing will be allowed at all
    if (!currentReq) {
      $location.path('/' + request.type);
      $rootScope.$apply();
      return;
    }
  }

  function normalizeRequest(request, cb) {
    var req = angular.copy(request);
    req.submit = function submit(resp) {
      currentReq = null;
      cb(resp);
      remove(request.type, req);
    };

    req.cancel = function cancel(resp) {
      currentReq = null;
      resp = resp || {
        error: {
          code: -1,
          message: 'User canceled'
        }
      }

      cb(resp);
      remove(request.type, req);
    };

    return req;
  }

  return {
    queue: enqueue,
    next: peek,
    counts: counts,
    listen: function(cb) {
      onchange.push(cb);
    },
    stopListening: function(cb) {
      var idx = onchange.indexOf(cb);
      if (idx !== -1) onchange.splice(idx, 1);
    }
  }
};
