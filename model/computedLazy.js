/**
 * Syntactic sugar to make a computed knockout property
 * that only evaluated on demand AND only notifies it's
 * subscribers if the evaluated value is different from last time.
 * @param {Function} obj Either a function or an object with read/write properties.
 */
function computedLazy(obj) {
  var config;
  if (typeof obj === 'function') {
    config = { read: obj };
  } else {
    config = obj;
  }
  config.deferEvaluation = true;
  var computed = ko.computed(config);
  computed.extend({ notifyComparer: compareStitch });
  return computed;
}

/*
 * This is a general-purpose "notifyComparer" extender that can be chained
 * onto any observable or computed value. It causes the target only to
 * issue change notifications when the equalityComparer says the value has changed.
 * */
ko.extenders.notifyComparer = function(target, equalityComparer) {
    var valueToNotify = ko.observable();
    valueToNotify.equalityComparer = equalityComparer;
    target.subscribe(valueToNotify);
    var firstRead = true;
    return ko.computed({ read: function(){
        if (firstRead) {
          firstRead = false;
          valueToNotify(target.peek());
        }
        return valueToNotify();
    } });
};


function compareStitch(x, y) {
  if (Array.isArray(x)) {
    if (Array.isArray(y)) {
      if (x.length !== y.length) {
        return false;
      }
      for(var i = 0;i < x.length; i++) {
        if (!compareSingleStitch(x[i], y[i])) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  return compareSingle(x, y)
}

function compareSingleStitch (x, y) {
  return (x === y) || (x.uri && y.uri && x.uri === y.uri);
}


exports.computedLazy = computedLazy;
