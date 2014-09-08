/**
 * This package amends the zoomable user interface of d3 with extended functionality.
 *
 * @author Joschi <josua.krause@gmail.com>
 */

jkjs = window.jkjs || {}; // init namespace

jkjs.zui = function() {
  var that = this;

  this.applyCanvasZoom = function(target, translate, scale) {
      target.attr('transform', 'translate(' + translate + ') scale(' + scale + ')');
  };

  this.animationEase = "easeInOutCubic";

  this.animationDuration = 750;

  this.margin = 10;

  function fitInto(pixWidth, pixHeight, w, h, fit) {
    var rw = pixWidth / w;
    var rh = pixHeight / h;
    return fit ? Math.min(rw, rh) : Math.max(rw, rh);
  }

  function setOffset(x, y, off) {
    off[0] = x;
    off[1] = y;
  }

  function zoomTo(x, y, factor, zoom, off) {
    var f = factor;
    var newZoom = zoom * factor;
    newZoom <= 0 && console.warn("factor: " + factor + " zoom: " + newZoom);
    setOffset((off[0] - x) * f + x, (off[1] - y) * f + y, off);
    return newZoom;
  }

  this.create = function(sel, realSize, viewSize, getCanvasRect, applyZoom) {
    var ease = that.animationEase;
    var duration = that.animationDuration;
    var canvasMargin = that.margin;
    var w = viewSize.width;
    var h = viewSize.height;
    var svg = sel.append("svg").attr({
      "viewBox": "0 0 " + w + " " + h
    }).style({
      "width": realSize.width,
      "height": realSize.height,
      "padding": 0
    });
    // enabling zoom
    var zoom = d3.behavior.zoom();
    var inner = svg.append("g");

    function showRectangle(rect, margin, fit, smooth) {
      var screenW = w - 2 * margin;
      var screenH = h - 2 * margin;
      var factor = fitInto(screenW, screenH, rect.width, rect.height, fit);
      var zoom = 1;
      var off = [ margin + (screenW - rect.width) * 0.5 - rect.x, margin + (screenH - rect.height) * 0.5 - rect.y ];
      zoom = zoomTo(screenW * 0.5 + margin, screenH * 0.5 + margin, factor, zoom, off);
      setZoom(off, zoom, smooth);
    }

    function setZoom(translation, scale, smooth) {
      zoom.translate(translation).scale(scale);
      var target = smooth ? inner.transition().duration(duration).ease(ease) : inner;
      applyZoom(target, zoom.translate(), zoom.scale());
    }

    svg.call(zoom.scaleExtent([ 1 / 6, 12 ]).on("zoom", function() {
      setZoom(d3.event.translate, d3.event.scale, false);
    }, true));

    function showAll(smooth) {
      if (!getCanvasRect)
        return;
      showRectangle(getCanvasRect(), canvasMargin, true, smooth);
    }

    svg.on("dblclick.zoom", function() {
      showAll(true);
    });
    // the object
    return {
      showRectangle: showRectangle,
      setZoom: setZoom,
      showAll: showAll,
      inner: inner,
      svg: svg
    };
  }

}; // jkjs.zui

jkjs.zui = new jkjs.zui(); // create instance
