/**
 * An easy way to create path instructions for arbitrary shapes.
 *
 * @author Joschi <josua.krause@gmail.com>
 */

jkjs = window.jkjs || {}; // init namespace

jkjs.Path = function() {
  this.slack = "";
  this.strs = [];
  this.gracefulNaN = false; // if true try to gracefully handle NaN values
  this.errState = false; // if true the next correct operation will be converted to a move
};
jkjs.Path.prototype.isEmpty = function() {
  return !this.strs.length;
};
jkjs.Path.prototype.crash_and_burn = function() {
  var gn = this.gracefulNaN;
  this.gracefulNaN = false;
  this.move(Number.NaN, Number.NaN);
  this.gracefulNaN = gn;
};
jkjs.Path.prototype.move = function(x, y) {
  if(this.gracefulNaN && (!Number.isFinite(x) || !Number.isFinite(y))) {
    this.errState = true;
    return;
  }
  if(!this.slack.length) {
    this.slack = "M".concat(x, " ", y);
  }
  this.strs.push(" M".concat(x, " ", y));
  this.errState = false;
};
jkjs.Path.prototype.line = function(x, y) {
  if(this.gracefulNaN && (!Number.isFinite(x) || !Number.isFinite(y))) {
    this.errState = true;
    return;
  }
  if(this.errState) {
    this.move(x, y);
    return;
  }
  this.strs.push(" L".concat(x, " ", y));
};
jkjs.Path.prototype.quad = function(mx, my, x, y) {
  if(this.gracefulNaN && (!Number.isFinite(x) || !Number.isFinite(y))) {
    this.errState = true;
    return;
  }
  if(this.gracefulNaN && (!Number.isFinite(mx) || !Number.isFinite(my))) {
    this.move(x, y);
    return;
  }
  if(this.errState) {
    this.move(x, y);
    return;
  }
  this.strs.push(" Q".concat(mx, " ", my, " ", x, " ", y));
};
jkjs.Path.prototype.moveBy = function(dx, dy) {
  if(this.errState) {
    this.crash_and_burn();
    return;
  }
  if(this.gracefulNaN && (!Number.isFinite(dx) || !Number.isFinite(dy))) {
    this.errState = true;
    return;
  }
  this.strs.push(" m".concat(dx, " ", dy));
};
jkjs.Path.prototype.lineBy = function(dx, dy) {
  if(this.errState) {
    this.crash_and_burn();
    return;
  }
  if(this.gracefulNaN && (!Number.isFinite(dx) || !Number.isFinite(dy))) {
    this.errState = true;
    return;
  }
  this.strs.push(" l".concat(dx, " ", dy));
};
jkjs.Path.prototype.quadBy = function(dmx, dmy, dx, dy) {
  if(this.errState) {
    this.crash_and_burn();
    return;
  }
  if(this.gracefulNaN && (!Number.isFinite(dx) || !Number.isFinite(dy))) {
    this.errState = true;
    return;
  }
  if(this.gracefulNaN && (!Number.isFinite(dmx) || !Number.isFinite(dmy))) {
    this.errState = false;
    this.moveBy(dx, dy);
    return;
  }
  this.strs.push(" q".concat(dmx, " ", dmy, " ", dx, " ", dy));
};
jkjs.Path.prototype.close = function() {
  this.strs.push(" Z");
  this.errState = false; // if no Z is possible we will crash & burn
};
jkjs.Path.prototype.addPoly = function(arr) {
  if(!arr.length) return;
  var that = this;
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
  if (path.isEmpty())
    return this;
  if (this.isEmpty()) {
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
