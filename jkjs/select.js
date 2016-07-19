/**
 * Created by krause on 2016-07-06.
 */
"use strict";

window.jkjs = window.jkjs || {}; // init namespace

window.jkjs.Select = function(sel, cell, label) {
  var that = this;
  var select;
  var text;
  var lbl;
  if(label) {
    lbl = sel.append("label");
    text = lbl.append("span").text(label);
    select = lbl.append("select");
  } else {
    lbl = d3.select();
    text = d3.select();
    select = sel.append("select");
  }
  select.on("change", function() {
    silentChange = true;
    try {
      cell.value = select.node().value;
    } finally {
      silentChange = false;
    }
  });

  var silentChange = true;
  try {
    cell.addChangeListener(function() {
      if(!silentChange) {
        select.node().value = cell.value;
      }
    });
  } finally {
    silentChange = false;
  }

  var options = [];
  this.options = function(_) {
    if(!arguments.length) return options;
    options = _;
    var ixs = options.map(function(_, ix) {
      return ix;
    });
    var osel = select.selectAll("option").data(ixs, function(ix) {
      return ix;
    });
    osel.exit().remove();
    osel.enter().append("option");
    osel.attr({
      "value": function(ix) {
        return options[ix][0];
      }
    }).text(function(ix) {
      return options[ix][1];
    }).order();
    select.node().value = cell.value;
    return that;
  };

  this.select = function() {
    return select;
  };
  this.text = function() {
    return text;
  };
  this.label = function() {
    return lbl;
  };
}; // window.jkjs.Select
