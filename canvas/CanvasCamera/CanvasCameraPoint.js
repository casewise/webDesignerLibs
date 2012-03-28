var Point = function (x, y) {
  this.x = x;
  this.y = y;
  if (_.isUndefined(this.x)) {
    this.x = 0;
  }
  if (_.isUndefined(this.y)) {
    this.y = 0;
  }
};


var PointAPI = {};
PointAPI.createPointFromPoint = function (p) {
  return new Point(p.x, p.y);
}

Point.prototype.toString = function () {
  return '{x:' + this.x + ', ' + 'y:' + this.y + '}';
};

Point.prototype.copy = function (p) {
  this.x = p.x;
  this.y = p.y;
};

Point.prototype.inverse = function () {
  this.x = -1 * this.x;
  this.y = -1 * this.y;
};


Point.prototype.div = function (divider) {
  this.x /= divider;
  this.y /= divider;
};

Point.prototype.divPoint = function (dividerPoint) {
  this.x /= dividerPoint.x;
  this.y /= dividerPoint.y;
};

Point.prototype.getDivPoint = function (p) {
  var newP = new Point();
  newP.set(this.x / p.x, this.y / p.y);
  return newP;
};

Point.prototype.multiply = function (p) {
  this.x *= p;
  this.y *= p;
};

Point.prototype.multiplyPoint = function (point) {
  this.x *= point.x;
  this.y *= point.y;
};

Point.prototype.set = function (x, y) {
  this.x = x;
  this.y = y;
};

Point.prototype.add = function (p) {
  this.x += p.x;
  this.y += p.y;
};

Point.prototype.sub = function (p) {
  this.x -= p.x;
  this.y -= p.y;
};


Point.prototype.reset = function () {
  this.x = 0;
  this.y = 0;
};

Point.prototype.getSubPoint = function (p) {
  var newP = new Point();
  newP.set(this.x, this.y);
  newP.sub(p);
  return newP;
};

Point.prototype.equals = function (p, distance) {
  if (_.isUndefined(distance)) {
    distance = 0;
  }

  if (Math.abs(p.x - this.x) > distance) {
    return false;
  }
  if (Math.abs(p.y - this.y) > distance) {
    return false;
  }
  return true;
};

Point.prototype.abs = function () {
  this.x = Math.abs(this.x);
  this.y = Math.abs(this.y);
};
