/**
 * This package provides SVG text functionality.
 *
 * @author Joschi <josua.krause@gmail.com>
 */

var jkjs;
if(typeof module !== "undefined") {
  jkjs = {};
  module.exports = jkjs;
} else {
  window.jkjs = window.jkjs || {}; // init namespace
  jkjs = window.jkjs;
}

jkjs.text = function() {

  /** Left alignment of text. */
  var ALIGN_LEFT = 0;
  /** Middle alignment of text. */
  var ALIGN_MIDDLE = 1;
  /** Right alignment of text. */
  var ALIGN_RIGHT = 2;

  this.align = {
    left: ALIGN_LEFT,
    middle: ALIGN_MIDDLE,
    right: ALIGN_RIGHT,
  };

  /** Top position of text. */
  var POS_TOP = 0;
  /** Center position of text. */
  var POS_CENTER = 1;
  /** Bottom position of text. */
  var POS_BOTTOM = 2;

  this.position = {
    top: POS_TOP,
    center: POS_CENTER,
    bottom: POS_BOTTOM,
  };

  var exact = true;
  this.exact = function(_) {
    if(!arguments.length) return exact;
    exact = _;
  };

  function getBBox(sel) {
    if(sel.node().getBBox) {
      return sel.node().getBBox();
    }
    var fs = sel.attr('font-size');
    var size = 16;
    if(fs) {
      size = +fs.replace(/[a-zA-Z]/g, '');
    }
    return {
      'width': size * 0.75 * sel.text().length,
      'height': size,
    };
  }

  function fit(line, selText, w, h) {
    var ow;
    var oh;
    if(exact || !selText.__textSizeCache) {
      selText.text(line);
      var own = getBBox(selText);
      ow = own.width;
      oh = own.height;
      if(!exact) {
        selText.__textSizeCache = {
          w: ow / line.length,
          h: oh,
        };
      }
    } else {
      ow = line.length * selText.__textSizeCache.w;
      oh = selText.__textSizeCache.h;
    }
    return {
      high: oh > h,
      wide: ow > w,
      height: oh,
    };
  }

  /** The ellipsis string. */
  var hellip = "\u2026";
  /** The short ellipsis string. */
  var shellip = "..";

  function shrink(line, wordwrap, before, noShrink) {
    if(noShrink) {
      return [];
    }
    if(!wordwrap) {
      if(line.length < 4) {
        return [];
      }
      var sl = line.substring(0, line.length - (hellip.length + 1));
      if(sl[sl.length - 1] === ' ') {
        sl = sl.substring(0, sl.length - 1);
      }
      if(line.length < 7) {
        if(line[line.length - 1] === shellip[shellip.length - 1]) {
          return [ line.substring(0, line.length - (shellip.length + 1)) + shellip ];
        }
        return [ sl + shellip ];
      }
      return [ sl + hellip ];
    }
    var space = line.lastIndexOf(" ");
    if(space < 0) {
      return before.length ? [ line, before ] : [ line ];
    }
    var first = line.substring(0, space);
    if(line.length > space + 1) {
      return [ first, line.substring(space + 1) + " " + before ];
    }
    return before.length ? [ first, before ] : [ first ];
  }

  function computeSegments(box, text, wordwrap, textSel, all, noShrink) {
    var segments = [];
    var w = box.width;
    var curY = box.y;
    var maxY = box.y + box.height;
    var height = Math.floor(all.height);
    if(!all.high) {
      if(!all.wide) {
        segments.push(text);
      } else {
        var ww = wordwrap;
        var cur = text;
        var rem = "";
        while(true) {
          var s = shrink(cur, ww, rem, noShrink);
          if(!s.length) {
            break;
          }
          if(s[0] == cur) {
            ww = false;
          }
          var curFit = fit(s[0], textSel, w, maxY - curY);
          if(curFit.high) {
            if(!segments.length) {
              break;
            }
            curY -= height;
            cur = segments.pop() + " " + s[0];
            rem = "";
            ww = false;
            continue;
          }
          if(curFit.wide) {
            cur = s[0];
            rem = s.length > 1 ? s[1] : "";
            continue;
          }
          segments.push(s[0]);
          curY += height;
          if(s.length < 2) {
            break;
          }
          cur = s[1];
          rem = "";
        }
      }
    }
    return segments;
  }

  /**
   * Displays the given text in the given bounding box. If needed the text is wrapped or shortened using ellipses.
   *
   * @param selText
   *          A selection of one text element.
   * @param text
   *          The text to display.
   * @param box
   *          The bounding box. {x, y, width, height}.
   * @param wordwrap
   *          Whether to allow wrapping around word boundaries when the box is too small. If false only ellipses are used.
   * @param horAlign
   *          The horizontal alignment of the text. Defaults to left alignment. Valid values are jkjs.text.align.{left, middle, right}.
   * @param verPos
   *          The vertical positioning. Defaults to top. Valid values are jkjs.text.position.{top, center, bottom}.
   * @param addTitle
   *          Whether to add a title element for tool-tips. Defaults to false.
   *          If a string is passed this string will be used as title.
   * @param guaranteeText
   *          Whether text will be forced even if there is not enough room. Defaults to false.
   * @param noShrink
   *          Whether to shrink the text.
   * @returns
   *          Whether the text element contains any text. This can be used to remove the text element if not needed.
   *          <pre>jkjs.text.display(sel, ...) || sel.remove();</pre>
   */
  this.display = function(selText, text, box, wordwrap, horAlign, verPos, addTitle, guaranteeText, noShrink) {
    // clean previous state
    selText.selectAll("tspan").remove();
    selText.attr("x", null);
    selText.attr("y", null);
    selText.attr("text-anchor", null);
    selText.attr("alignment-baseline", null);
    // compute segments
    var ra = horAlign || ALIGN_LEFT;
    var boxW = box.width;
    var all = fit(text, selText, boxW, box.height);
    var height = Math.floor(all.height);
    var segments = computeSegments(box, text, wordwrap, selText, all, noShrink);
    if(!segments.length && guaranteeText) {
      segments = [ shellip ];
    }
    // produce geometry
    if(ra !== ALIGN_LEFT) {
      selText.style("text-anchor", ra === ALIGN_MIDDLE ? "middle" : "end");
    }
    var backH = 0;
    var vp = verPos || POS_TOP;
    if(vp === POS_CENTER) {
      selText.style("alignment-baseline", "central");
      backH = height * 0.5;
    }
    var x = box.x;
    var y = box.y;
    var anchorX;
    if(ra === ALIGN_LEFT) {
      anchorX = x;
    } else if(ra === ALIGN_MIDDLE) {
      anchorX = x + boxW * 0.5;
    } else {
      anchorX = x + boxW;
    }
    var boxH = box.height;
    var offH;
    if(vp === POS_TOP) {
      offH = y;
    } else if(vp === POS_CENTER) {
      offH = y + (boxH - segments.length * height) * 0.5;
    } else if(vp === POS_BOTTOM) {
      offH = y + boxH - segments.length * height;
    }
    if(segments.length === 1) {
      selText.text(segments[0])
        .attr("x", anchorX)
        .attr("y", offH + height - backH);
    } else {
      selText.text("");
      if(segments.length) {
        var posY = offH;
        segments.forEach(function(seg) {
          posY += height;
          selText.append("tspan")
            .attr("x", anchorX)
            .attr("y", posY - backH)
            .text(seg);
        });
      }
    }
    if(addTitle) {
      selText.selectAll("title").remove();
      selText.append("title").text(!!addTitle !== addTitle ? addTitle : text);
    }
    return segments.length != 0;
  };

}; // jkjs.text

jkjs.text = new jkjs.text(); // create instance
