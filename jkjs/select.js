/**
 * Created by krause on 2016-07-06.
 */
"use strict";

window.jkjs = window.jkjs || {}; // init namespace

(function() { // scope for private helper functions

  function init(that, sel, cell, label, flippedLabel, selectName, changeEventName, valueName) {
    var select;
    var text;
    var lbl;
    if(label) {
      lbl = sel.append("label");
      text = lbl.append("span").text(label);
      select = lbl.append(selectName);
      lbl.style({
        "clear": "both",
        "width": "100%",
      });
      text.style({
        "float": flippedLabel ? "right" : "left",
      });
      select.style({
        "float": flippedLabel ? "left" : "right",
      });
    } else {
      lbl = d3.select();
      text = d3.select();
      select = sel.append(selectName);
    }

    select.on(changeEventName, function() {
      cell.value = select.node()[valueName];
    });

    cell.addChangeListener(function() {
      select.node()[valueName] = cell.value;
    });

    that.select = function() {
      return select;
    };
    that.text = function() {
      return text;
    };
    that.label = function() {
      return lbl;
    };
    that.remove = function() {
      if(!lbl.empty()) {
        lbl.remove();
      } else if(select) {
        select.remove();
      }
      lbl = null;
      text = null;
      select = null;
    };

    return select;
  }

  window.jkjs.Select = function(sel, cell, label, flippedLabel) {
    var that = this;
    var select = init(that, sel, cell, label, flippedLabel, "select", "change", "value");

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
  }; // window.jkjs.Select

  window.jkjs.Spinner = function(sel, cell, label, flippedLabel) {
    var that = this;
    var spinner = init(that, sel, cell, label, flippedLabel, "input", "change", "value");
    spinner.attr({
      "type": "number",
    });

    var range = [ Number.NaN, Number.NaN ];
    var step = 1;
    this.range = function(_) {
      if(!arguments.length) return range.slice();
      range[0] = +_[0];
      range[1] = +_[1];
      if(_.length > 2) {
        step = +_[2];
      }
      spinner.attr({
        "min": range[0],
        "max": range[1],
        "step": step,
      });
      spinner.node().value = +cell.value;
    };
  }; // window.jkjs.Spinner

  window.jkjs.Checkbox = function(sel, cell, label, flippedLabel) {
    var that = this;
    var checkbox = init(that, sel, cell, label, flippedLabel, "input", "change", "checked");
    checkbox.attr({
      "type": "checkbox",
    });
  }; // window.jkjs.Checkbox

})(); // end of scope for private helper functions
