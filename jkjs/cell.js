/**
 * Created by krause on 2016-07-06.
 */
"use strict";

window.jkjs = window.jkjs || {}; // init namespace

window.jkjs.Cell = function(_init) {
  var that = this;
  var value = null;
  var oldValue = null;

  var changePs = {};
  var changePrimed = false;
  function primeChange() {
    if(changePrimed) return;
    setTimeout(function() {
      // gather listeners and reset values beforehand to
      // have defined behavior if some Cell methods are
      // called during execution of listeners
      changePrimed = false;
      var same = Object.is(oldValue, value);
      var listeners = Object.keys(changePs).filter(function(ix) {
        return !same || changePs[ix] > 1;
      }).map(function(ix) {
        return changeListeners[ix];
      });
      changePs = {};
      listeners.forEach(function(l) {
        l(value, oldValue, that);
      });
    }, 0);
    changePrimed = true;
  }

  var updatePs = {};
  var updatePrimed = false;
  function primeUpdate() {
    if(updatePrimed) return;
    setTimeout(function() {
      // gather listeners and reset values beforehand to
      // have defined behavior if some Cell methods are
      // called during execution of listeners
      updatePrimed = false;
      var listeners = Object.keys(updatePs).map(function(ix) {
        return updateListeners[ix];
      });
      updatePs = {};
      listeners.forEach(function(l) {
        l(value, that);
      });
    }, 0);
    updatePrimed = true;
  }

  function set(v) {
    if(!changePrimed) {
      oldValue = value;
    }
    value = v;
    if(changeListeners.length && !Object.is(oldValue, value)) {
      changeListeners.forEach(function(_, ix) {
        changePs[ix] = changePs[ix] || 1;
      });
      primeChange();
    }
    updateListeners.forEach(function(_, ix) {
      updatePs[ix] = true;
    });
    primeUpdate();
  };

  function get() {
    return value;
  };

  var updateListeners = [];
  this.addUpdateListener = function(l) {
    updatePs[updateListeners.length] = true;
    updateListeners.push(l);
    primeUpdate();
    return l;
  };
  this.removeUpdateListener = function(l) {
    var pos = 0;
    var oldUpdatePs = updatePs;
    updatePs = {};
    updateListeners = updateListeners.filter(function(ll, ix) {
      var allow = !Object.is(ll, l);
      if(allow) {
        if(oldUpdatePs[ix]) {
          updatePs[pos] = true;
        }
        pos += 1;
      }
      return allow;
    });
  };

  var changeListeners = [];
  this.addChangeListener = function(l) {
    changePs[changeListeners.length] = 2;
    changeListeners.push(l);
    primeChange();
    return l;
  };
  this.removeChangeListener = function(l) {
    var pos = 0;
    var oldChangePs = changePs;
    changePs = {};
    changeListeners = changeListeners.filter(function(ll, ix) {
      var allow = !Object.is(ll, l);
      if(allow) {
        if(oldChangePs[ix]) {
          changePs[pos] = oldChangePs[ix];
        }
        pos += 1;
      }
      return allow;
    });
  };

  this.createAccessor = function() {
    return function(_) {
      if(!arguments.length) {
        return get();
      }
      set(_);
    };
  };

  Object.defineProperties(this, {
    "value": {
      get: function() { return get(); },
      set: function(v) { set(v); },
    }
  });

  if(arguments.length) {
    value = _init;
    oldValue = _init;
  }
}; // window.jkjs.Cell
window.jkjs.Cell.prototype.toString = function() {
  return "" + this.value;
};
window.jkjs.Cell.anyChange = function(list, cb) {
  list.forEach(function(c) {
    c.addChangeListener(function() {
      cb();
    });
  });
};
window.jkjs.Cell.allChange = function(list, cb) {
  var chgs = list.map(function(c, ix) {
    c.addChangeListener(function() {
      chgs[ix] = true;
      var all = chgs.every(function(b) {
        return b;
      });
      if(all) {
        for(var cix = 0;cix < chgs.length;cix += 1) {
          chgs[cix] = false;
        }
        cb();
      }
    });
    return false;
  });
};

window.jkjs.Event = function(_) {
  var that = this;
  var cell = new window.jkjs.Cell(false);
  this.emit = function() {
    cell.value = !cell.value;
  };
  this.emitter = function() {
    return function() {
      that.emit();
    };
  };
  this.addEventListener = function(cb) {
    cell.addUpdateListener(function() {
      cb();
    });
  };

  if(arguments.length) {
    that.addEventListener(_);
  }
}; // window.jkjs.Event
