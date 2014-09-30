/**
 * An easy way to create path instructions for arbitrary shapes.
 *
 * @author Joschi <josua.krause@gmail.com>
 */

jkjs = window.jkjs || {}; // init namespace

jkjs.Path = function() {
  this.slack = null;
  this.strs = [];
};
jkjs.Path.prototype.isEmpty = function() {
  return !this.strs.length;
};
jkjs.Path.prototype.move = function(x, y) {
  var str = "M" + x + " " + y;
  if(!this.slack) {
    this.slack = str;
  }
  this.strs.push(str);
};
jkjs.Path.prototype.line = function(x, y) {
  this.strs.push("L" + x + " " + y);
};
jkjs.Path.prototype.quad = function(mx, my, x, y) {
  this.strs.push("Q" + mx + " " + my + " " + x + " " + y);
};
jkjs.Path.prototype.moveBy = function(dx, dy) {
  this.strs.push("m" + dx + " " + dy);
};
jkjs.Path.prototype.lineBy = function(dx, dy) {
  this.strs.push("l" + dx + " " + dy);
};
jkjs.Path.prototype.quadBy = function(dmx, dmy, dx, dy) {
  this.strs.push("q" + dmx + " " + dmy + " " + dx + " " + dy);
};
jkjs.Path.prototype.close = function() {
  this.strs.push("Z");
};
jkjs.Path.prototype.addPoint = function(x, y, size) {
  var s2 = size * 0.5;
  this.move(x - s2, y - s2);
  this.line(x + s2, y - s2);
  this.line(x + s2, y + s2);
  this.line(x - s2, y + s2);
  this.close();
};
jkjs.Path.prototype.toString = function() {
  // we always have a meaningless move before the actual path
  // so transitioning from an empty path will not try to animate
  // from an arbitrary position but will emerge at the correct position
  var str = this.strs.join(' ');
  if(!this.slack) {
    if(!str.length) {
      return "M0 0";
    }
    console.warn("meaningless start of path", str);
    return str;
  }
  // str.length is larger than zero
  return this.slack + " " + str;
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
