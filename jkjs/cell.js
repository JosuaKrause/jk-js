/**
 * Created by krause on 2016-07-06.
 */
"use strict";

window.jkjs = window.jkjs || {}; // init namespace

window.jkjs.Cell = function(_init) {
  var that = this;
  var value = null;

  var changePrimed = false;
  var updatePrimed = false;
  var oldValue = null;
  function set(v) {
    if(!changePrimed) {
      oldValue = value;
    }
    value = v;
    if(changeListeners.length && !Object.is(oldValue, value)) {
      if(!changePrimed) {
        setTimeout(function() {
          changePrimed = false;
          if(Object.is(oldValue, value)) {
            return;
          }
          changeListeners.forEach(function(l) {
            l(value, oldValue, that);
          });
        }, 0);
        changePrimed = true;
      }
    }
    if(!updatePrimed) {
      setTimeout(function() {
        updatePrimed = false;
        updateListeners.forEach(function(l) {
          l(value, that);
        });
      }, 0);
      updatePrimed = true;
    }
  };

  function get() {
    return value;
  };

  var updateListeners = [];
  this.addUpdateListener = function(l) {
    updateListeners.push(l);
    if(!updatePrimed) {
      l(value, that);
    }
    return l;
  };
  this.removeUpdateListener = function(l) {
    updateListeners = updateListeners.filter(function(ll) {
      return !Object.is(ll, l);
    });
  };

  var changeListeners = [];
  this.addChangeListener = function(l) {
    changeListeners.push(l);
    if(!changePrimed) {
      l(value, oldValue, that);
    }
    return l;
  };
  this.removeChangeListener = function(l) {
    changeListeners = changeListeners.filter(function(ll) {
      return !Object.is(ll, l);
    });
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
}; // Cell
