/*global test:true, ok : true, CanvasCamera */

test("create point", function () {
  var p = new Point();
  p.set(2, 3);
  ok(p.x === 2, "x is fine");
  ok(p.y === 3, "y is fine");
});

test("point operations", function () {
  var p1 = new Point();
  p1.set(2, 3);

  var p2 = new Point();
  p2.copy(p1);
  ok(p1.x == p2.x && p1.y == p2.y, "copy ok");
  //console.log();
  ok(p1.equals(p2), "equal ok " + p1 + p2);
//console.log(p2);

  p1.divPoint(p2);
  ok(p1.x === 1, "x is fine after divPoint");
  ok(p1.y === 1, "y is fine after divPoint");
  ok(p2.x === 2, "p2 did not changed");


  p1.copy(p2);
  p1.multiplyPoint(p2);
  ok(p1.x === 4, "x is fine after multiplyPoint");
  ok(p1.y === 9, "y is fine after multiplyPoint");
  ok(p2.x === 2, "p2 did not changed");

  ok(p1.equals(p2, 10), "equal with distance ok " + p1 + p2);

  p1.copy(p2);
  p1.multiply(2);
  ok(p1.x === 4, "x is fine after multiply");
  ok(p1.y === 6, "y is fine after multiply");


});


test("camera canvas", function () {
  var canvas = document.createElement('canvas');

  var size = {"w" : 100, "h": 100};
  canvas.width = size.w;

  var canvasCamera = new CanvasCamera(canvas, size);
  ok(canvasCamera.scale === 1, "scale is ok");

  var p1 = new Point(1, 1);
  var max1 = new Point(10, 10);

  var translate = canvasCamera.translateToKeepFocus(p1, max1, 2);
  ok(translate.x === 1, "x translate is ok for translateToKeepFocus : " + translate.x);
  ok(translate.x === 1, "y translate is ok for translateToKeepFocus : " + translate.y);

  var p1 = new Point(1, 1);
  var max1 = new Point(10, 10);

  var translate = canvasCamera.translateToKeepFocus(p1, max1, 1.5);
  ok(translate.x === 0.5, "x translate is ok for translateToKeepFocus : " + translate.x);

  p1.set(1, 1);
  max1.set(100, 100);

  canvasCamera.update();
  var canvasSize = canvasCamera.getCanvasSizePoint(canvasCamera.canvas);
  ok(canvasSize.x === size.w, "canvas size x is ok on getCanvasSizePoint" + canvasSize.x);
  ok(canvasSize.y === size.h, "canvas size y is ok on getCanvasSizePoint" + canvasSize.y);

});

