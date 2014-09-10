/**
 * An easy way to create path instructions for arbitrary shapes.
 *
 * @author Joschi <josua.krause@gmail.com>
 */

jkjs = window.jkjs || {}; // init namespace

jkjs.Path = function() {
  // we always have a meaningless move before the actual path
  // so transitioning from an empty path will not try to animate
  // from an arbitrary position but will emerge at the correct position
  this.str = "M0 0";
  this.realstart = this.str.length;
};
jkjs.Path.prototype.isEmpty = function() {
  return this.str.length <= this.realstart;
};
jkjs.Path.prototype.move = function(x, y) {
  if (this.isEmpty()) {
    // we set the meaningless move to the first move so we do not extent the bounding box
    this.str = "M" + x + " " + y;
    this.realstart = this.str.length;
  }
  this.str += " M" + x + " " + y;
};
jkjs.Path.prototype.line = function(x, y) {
  this.str += " L" + x + " " + y;
};
jkjs.Path.prototype.quad = function(mx, my, x, y) {
  this.str += " Q" + mx + " " + my + " " + x + " " + y;
};
jkjs.Path.prototype.moveBy = function(dx, dy) {
  this.str += " m" + dx + " " + dy;
};
jkjs.Path.prototype.lineBy = function(dx, dy) {
  this.str += " l" + dx + " " + dy;
};
jkjs.Path.prototype.quadBy = function(dmx, dmy, dx, dy) {
  this.str += " q" + dmx + " " + dmy + " " + dx + " " + dy;
};
jkjs.Path.prototype.close = function() {
  this.str += " Z";
};
jkjs.Path.prototype.addPoint = function(x, y) {
  this.move(x, y);
  this.lineBy(0, 0);
};
jkjs.Path.prototype.toString = function() {
  return this.str;
};
jkjs.Path.prototype.add = function(path) {
  if (path.isEmpty())
    return;
  if (this.isEmpty()) {
    this.str = path.str;
    this.realstart = path.realstart;
    return;
  }
  this.str += path.str.substring(path.realstart);
};
