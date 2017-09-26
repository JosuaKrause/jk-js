/**
 * An easy way to create path instructions for arbitrary shapes.
 *
 * @author Joschi <josua.krause@gmail.com>
 */

jkjs = window.jkjs || {}; // init namespace

jkjs.Path = function() {
  this.slack = "";
  this.strs = [];
};
jkjs.Path.prototype.clear = function() {
  this.slack = "";
  this.strs = [];
};
jkjs.Path.prototype.isEmpty = function() {
  return !this.strs.length;
};
jkjs.Path.prototype.move = function(x, y) {
  if(!this.slack.length) {
    this.slack = "M".concat(x, " ", y);
  }
  this.strs.push(" M".concat(x, " ", y));
  return this;
};
jkjs.Path.prototype.line = function(x, y) {
  this.strs.push(" L".concat(x, " ", y));
  return this;
};
jkjs.Path.prototype.quad = function(mx, my, x, y) {
  this.strs.push(" Q".concat(mx, " ", my, " ", x, " ", y));
  return this;
};
jkjs.Path.prototype.moveBy = function(dx, dy) {
  this.strs.push(" m".concat(dx, " ", dy));
  return this;
};
jkjs.Path.prototype.lineBy = function(dx, dy) {
  this.strs.push(" l".concat(dx, " ", dy));
  return this;
};
jkjs.Path.prototype.quadBy = function(dmx, dmy, dx, dy) {
  this.strs.push(" q".concat(dmx, " ", dmy, " ", dx, " ", dy));
  return this;
};
jkjs.Path.prototype.close = function() {
  this.strs.push(" Z");
  return this;
};
jkjs.Path.prototype.arcSegment = function(x, y, radIn, radOut, fromAngle, toAngle) {
  var full = false;
  if(toAngle - fromAngle >= 360.0) {
    toAngle = fromAngle + 359.99;
    full = true;
  }
  var startOutX = x + Math.cos(fromAngle * Math.PI / 180.0) * radOut;
  var startOutY = y + Math.sin(fromAngle * Math.PI / 180.0) * radOut;
  var startInX = x + Math.cos(fromAngle * Math.PI / 180.0) * radIn;
  var startInY = y + Math.sin(fromAngle * Math.PI / 180.0) * radIn;
  var endOutX = x + Math.cos(toAngle * Math.PI / 180.0) * radOut;
  var endOutY = y + Math.sin(toAngle * Math.PI / 180.0) * radOut;
  var endInX = x + Math.cos(toAngle * Math.PI / 180.0) * radIn;
  var endInY = y + Math.sin(toAngle * Math.PI / 180.0) * radIn;
  var largeArcFlag = toAngle - fromAngle <= 180.0 ? "0" : "1";
  this.move(startOutX, startOutY);
  this.strs.push(" A".concat(radOut, " ", radOut, " 0 ", largeArcFlag, " 1 ", endOutX, " ", endOutY));
  if(full) {
    this.close();
    this.move(endInX, endInY);
  } else {
    this.line(endInX, endInY);
  }
  this.strs.push(" A".concat(radIn, " ", radIn, " 180 ", largeArcFlag, " 0 ", startInX, " ", startInY));
  this.close();
  return this;
};
jkjs.Path.prototype.addPoly = function(arr) {
  var that = this;
  if(!arr.length) return that;
  var first = true;
  arr.forEach(function(pos) {
    if(first) {
      that.move(pos[0], pos[1]);
      first = false;
    } else {
      that.line(pos[0], pos[1]);
    }
  });
  that.close();
  return that;
};
jkjs.Path.prototype.pointAdder = function(size) {
  // for tight loops
  var that = this;
  var s2 = size * 0.5;
  var down  = " l0 " + size;
  var right = " l" + size + " 0";
  var up    = " l0 " + (-size);
  return function(x, y) {
    that.move(x - s2, y - s2);
    that.strs.push(down, right, up, " Z");
  };
};
jkjs.Path.prototype.fillRect = function(x, y, w, h) {
  this.move(x, y);
  this.lineBy(w, 0);
  this.lineBy(0, h);
  this.lineBy(-w, 0);
  this.close();
  return this;
};
jkjs.Path.prototype.toString = function() {
  // we always have a meaningless move before the actual path
  // so transitioning from an empty path will not try to animate
  // from an arbitrary position but will emerge at the correct position
  if(!this.slack.length) {
    if(!this.strs.length) {
      return "M0 0";
    }
    console.warn("meaningless start of path", this.strs);
  }
  // this.strs.length is larger than zero
  if(this.strs.length <= 100000) {
    return String.prototype.concat.apply(this.slack, this.strs);
  }
  console.warn("slow path");
  // slow concatenation for very long paths
  var res = this.slack;
  this.strs.forEach(function(s) {
    res += s;
  });
  return res;
};
jkjs.Path.prototype.add = function(path) {
  if(path.isEmpty()) return this;
  if(this.isEmpty()) {
    this.slack = path.slack;
  }
  this.strs = this.strs.concat(path.strs);
  return this;
};
// careful when using this method -- it just reverses the order of operations
jkjs.Path.prototype.reverse = function() {
  this.strs.reverse();
  return this;
};
