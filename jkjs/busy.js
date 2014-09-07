/**
 * This package provides a layer that can be added to SVG elements showing the current state.
 * States can be normal (the layer is invisible), busy (the layer shows a busy image), and
 * failure (indicates an error). The states must be set manually.
 *
 * @author Joschi <josua.krause@gmail.com>
 */

jkjs = window.jkjs || {}; // init namespace

jkjs.busy = function() {
  var outer = this;

  this.imgBusy = "jkjs/img/busy.gif";

  this.imgWarn = "jkjs/img/warning.png";

  this.busyClass = "busy";

  this.size = 32;

  /**
   * Adds a layer to a selection.
   *
   * @param sel
   *          The selection.
   * @param rect
   *          The size of the layer. {x, y, width, height}
   * @returns The layer. The state can be set with <code>layer.setState(layer.state.{norm, busy, warn})</code> and
   *          the base selection can be retrieved with <code>layer.getSelection()</code>.
   */
  this.layer = function(sel, rect) {
    var that = this;
    this.state = {
      norm: 0,
      busy: 1,
      warn: 2
    };
    var x = rect.x;
    var y = rect.y;
    var w = rect.width;
    var h = rect.height;
    var busyClass = outer.busyClass;
    var imgBusy = outer.imgBusy;
    var imgWarn = outer.imgWarn;
    var size = outer.size;
    var res = sel.append("g");
    var elem = res.append("rect").classed(busyClass, true).style({
      "fill": "white",
      "opacity": 0.5
    });
    var busy = res.append("image").classed(busyClass, true).attr({
      "xlink:href": imgBusy
    }).on("click", resetState);
    var warn = res.append("image").classed(busyClass, true).attr({
      "xlink:href": imgWarn
    }).on("click", resetState);

    function resetState() {
      that.setState(that.state.norm);
    }

    this.setState = function(state) {
      var emptyRect = {
        "x": 0,
        "y": 0,
        "width": 0,
        "height": 0
      };
      if (state === that.state.norm) {
        elem.attr({
          "x": x,
          "y": y,
          "width": 0,
          "height": 0,
        });
        busy.attr(emptyRect);
        warn.attr(emptyRect);
        return;
      }
      elem.attr({
        "x": x,
        "y": y,
        "width": w,
        "height": h
      });
      var imgRect = {
        "x": x + (w - size) * 0.5,
        "y": y + (h - size) * 0.5,
        "width": size,
        "height": size
      };
      if (state === that.state.busy) {
        busy.attr(imgRect);
        warn.attr(emptyRect);
      } else {
        state === that.state.warn || console.warn("unknown state", state, that);
        busy.attr(emptyRect);
        warn.attr(imgRect);
      }
    };

    this.getSelection = function() {
      return res;
    };

    resetState();
  }; // jkjs.busy.layer

}; // jkjs.busy

jkjs.busy = new jkjs.busy(); // create instance
