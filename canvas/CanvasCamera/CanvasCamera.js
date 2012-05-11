/*global cwAPI : true, Point : true */

window.requestAnimFrame = (function () {
  return (
  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function (callback, element) {
    window.setTimeout(callback, 1000 / 60);
  });
}());



var CanvasCamera = function (canvas, diagramSize, tickCallback) {
  this.diagramSize = diagramSize;
  this.tickCallback = tickCallback;
  if (_.isUndefined(this.tickCallback)) {
    this.tickCallback = this.emptyTick;
  }
  this.canvas = canvas;
  this.canvasMousePosition = {
    "x": 0,
    "y": 0
  };
  this.scale = 1;
  this.translate = new Point();
  this.canvasScaledSize = new Point();
  this.focusMouseTranslate = new Point();
  this.mousePosition = new Point();
  this.mouseWheelRepeat = 0;

  this.initialTranslate = new Point();
  this.canvasScaledSize.set(this.canvas.width * this.scale, this.canvas.height * this.scale);

  this.scaleNum = 5;

  this.renderScale = 1;
  if (cwAPI.isUnderIE9()) {
    this.renderScale = 1;
  }


  this.mouseIsDown = false;
  this.mouseInDrawZone = new Point();
  this.mousePourcentageInDrawZone = new Point();

  this.scaleFactor = 0.05;
  if (cwAPI.isUnderIE9()) {
    this.scaleFactor = 0.2;
  }

  this.scaleMax = 60;

  this.scaledCanvasMousePosition = {
    "x": 0,
    "y": 0
  };
  this.mousePourcentagePosition = new Point();

  this.newMousePosition = {
    "x": 0,
    "y": 0
  };

  this.tickCount = 0;
  this.tickStart = 0;

  this.diagramCanvasIsSelected = false;

  $(this.canvas).mousedown(function (e) {
    // stop the scaling
    this.hasBeenSelected();
    this.mouseWheelRepeat = 0;

    this.mouseIsDown = true;
    this.saveMouseDown = this.canvasMousePosition;
    //    this.debug();
    return false;
  }.bind(this));
  $(this.canvas).mouseup(function (e) {
    this.mouseIsDown = false;
    //    this.debug();
    return false;
  }.bind(this));
  $(this.canvas).click(function (e) {
    this.hasBeenSelected();
    this.onClick(e);
    return false;
  }.bind(this));
  $(this.canvas).mousemove(function (e) {
    this.mouseMove(e);
    return false;
  }.bind(this));
  $(this.canvas).bind('mousewheel', function (event, delta) {
    if (!this.isSelected()) {
      return;
    }
    if (this.mouseInDrawZone.x > 0 && this.mouseInDrawZone.y > 0) {
      if (this.mouseInDrawZone.x < this.diagramSize.w * this.renderScale && this.mouseInDrawZone.y < this.diagramSize.h * this.renderScale) {
        this.mouseWheel(event, delta);
        return false;
      }
    }
  }.bind(this));
  $(this.canvas).mouseout(function (e) {
    this.hasBeenReleased();
  }.bind(this));
};


CanvasCamera.prototype.isSelected = function () {
  return this.diagramCanvasIsSelected;
};

CanvasCamera.prototype.hasBeenSelected = function () {
  this.diagramCanvasIsSelected = true;
  $(this.canvas).addClass("isSelected");
  this.customHasBeenSelected();
};

CanvasCamera.prototype.customHasBeenSelected = function() {};
CanvasCamera.prototype.customHasBeenReleased = function() {};

CanvasCamera.prototype.hasBeenReleased = function () {
  this.diagramCanvasIsSelected = false;
  $(this.canvas).removeClass("isSelected");
  this.customHasBeenReleased();
};

CanvasCamera.prototype.onClick = function (e) {};

CanvasCamera.prototype.clearContext = function (ctx) {
  var ctxSize = new Point();
  ctxSize.copy(this.canvasScaledSize);
  if (ctxSize.x < this.canvas.width) {
    ctxSize.x = this.canvas.width;
  }
  if (ctxSize.y < this.canvas.height) {
    ctxSize.y = this.canvas.height;
  }
  ctx.clearRect(0, 0, ctxSize.x, ctxSize.y);
};

CanvasCamera.prototype.debug = function () {

  var output = [];
  output.push("canvassize:", this.canvas.width, ",", this.canvas.height, '<br/>');

  output.push("translate:", this.translate.x, ",", this.translate.y, '<br/>');
  output.push("mousePosition:", this.mousePosition.toString(), ', <br/>');
  output.push("canvasmousepos:", this.canvasMousePosition.x, ",", this.canvasMousePosition.y, '<br/>');
  output.push("mouse%pos:", this.mousePourcentagePosition.x, ",", this.mousePourcentagePosition.y, '<br/>');
  output.push("scaledmouse%pos:", this.scaledCanvasMousePosition.x, ",", this.scaledCanvasMousePosition.y, '<br/>');
  output.push("scale:", this.scale, ', ' + 1 / this.scale + '<br/>');
  output.push("renderScale:", this.renderScale, ",", 1 / this.renderScale, ', <br/>');
  output.push("canvasScaledSize:", this.canvasScaledSize.toString(), ', <br/>');
  output.push("focusMouseTranslate:", this.focusMouseTranslate.toString(), ', <br/>');
  output.push("mouseInDrawZone:", this.mouseInDrawZone.toString(), ', <br/>');
  output.push("mouse%InDrawZone:", this.mousePourcentageInDrawZone.toString(), ', <br/>');
  output.push("mouseIsDown:", this.mouseIsDown, ', <br/>');
  $("#debugger").html(output.join(''));
};


CanvasCamera.prototype.focusOnPoint = function (point, finalScale) {
  var x, y;

  point.multiply(this.renderScale);
  this.scale = finalScale * this.renderScale;
  x = (this.canvas.width / 2) - (point.x * (1 / this.scale));
  y = (this.canvas.height / 2) - (point.y * (1 / this.scale));
  this.translate.set(x, y);
  this.tickCallback();
};


CanvasCamera.prototype.focusOnPointAnimation = function (point, move, delay, finalScale) {
  if (cwAPI.isUnderIE9()) {
    this.focusOnPoint(point, finalScale * this.renderScale);
  } else {
    this.translateToDestination(point, move, finalScale * this.renderScale, delay);
  }
};

CanvasCamera.prototype.close = function () {
  $(this.canvas).unbind('mousewheel');
};


CanvasCamera.prototype.translateToKeepFocus = function (pos1, max1, scale) {
  var pos2, max2, ratio, translate, canvasProjection1, canvasProjection2, canvasSize;
  pos2 = new Point();
  max2 = new Point();
  ratio = new Point();
  translate = new Point();
  canvasProjection1 = new Point();
  canvasProjection2 = new Point();

  canvasSize = new Point(this.canvas.width, this.canvas.height);

  //  console.log(pos1, max1, scale);
  //max2 = max1 * scale;
  max2.copy(max1);
  max2.multiply(scale);

  // ratio = pos1 / max;
  ratio.copy(pos1);
  ratio.divPoint(max1);

  // get canvas project of pos1 using % postion
  canvasProjection1.copy(ratio);
  canvasProjection1.multiplyPoint(canvasSize);

  // get pos2 % pos in the canvas not yet scaled
  canvasProjection2.copy(pos2);
  canvasProjection2.divPoint(max1);


  // pos2 = ration * max2;
  pos2.copy(ratio);
  pos2.multiplyPoint(max2);

  // translate = pos2 - pos1;
  translate.copy(pos2);
  translate.sub(pos1);

  translate.multiply(1 / scale);
  //translate.inverse();
  //max2, ratio, pos2,
  // console.log( translate);
  return translate;
};


CanvasCamera.prototype.focusOnMouseAfterMouseWheel = function (event) {

  /*  translate = this.translateToKeepFocus(this.mouseInDrawZone, this.canvasScaledSize, this.scale);
  this.translate.copy(translate);
  this.translate.inverse();
  this.updateMousePositions(event);*/


  var newMousePourcentageShouldBe, newCanvasPositionShouldBe, oldCanvasPositionShouldBe, newScaledCanvasSize;

  // define the sclaed size of the canvas
  newScaledCanvasSize = new Point();
  newScaledCanvasSize.set(this.scale * this.renderScale * this.canvas.width, this.scale * this.renderScale * this.canvas.height);
  // define where the mouse should be in the scaled canvas using % position
  newMousePourcentageShouldBe = this.mouseInDrawZone.getDivPoint(newScaledCanvasSize);
  // define where the mouse should be after scale
  newCanvasPositionShouldBe = new Point();
  newCanvasPositionShouldBe.copy(newMousePourcentageShouldBe);
  newCanvasPositionShouldBe.x *= this.canvas.width * this.renderScale;
  newCanvasPositionShouldBe.y *= this.canvas.height * this.renderScale;

  // copy the old canvas mouse position %
  oldCanvasPositionShouldBe = new Point();
  oldCanvasPositionShouldBe.copy(this.mousePourcentagePosition);
  // scale it to the canvas size
  oldCanvasPositionShouldBe.x *= this.canvas.width;
  oldCanvasPositionShouldBe.y *= this.canvas.height;
  this.focusMouseTranslate.copy(newCanvasPositionShouldBe);
  // substract the new to old position which the translate to do
  this.focusMouseTranslate.sub(oldCanvasPositionShouldBe);
  // do the translate
  this.translate.copy(this.focusMouseTranslate);
  this.translate.inverse();
  this.updateMousePositions(event);
};


CanvasCamera.prototype.zoom = function (e, direction, factor, delay, callback) {
  if (cwAPI.isUnderIE9()) {
    this.scaleUsingFactor(e, direction, factor);
  } else {
    this.scaleUntilVelocityIsOver(delay, function () {
      this.scaleUsingFactor(e, direction, factor);
      //console.log(this.mouseWheelRepeat);
      if (this.mouseWheelRepeat === 0) {
        if (!_.isUndefined(callback)) {
          return callback();
        }
      }
    }.bind(this));
  }
};


CanvasCamera.prototype.mouseWheel = function (e, delta) {
  //this.update();
  this.mouseWheelRepeat += 3 * delta;
  if (this.mouseIsDown) {
    this.mouseWheelRepeat = 0;
  }

  if (delta > 0) {
    // stop the motion if delta is reversed
    if (this.mouseWheelRepeat < 0) {
      this.mouseWheelRepeat = 1;
    }
    this.zoom(e, -1, this.scaleFactor, 50);
  } else {
    // stop the motion if delta is reversed
    if (this.mouseWheelRepeat > 0) {
      this.mouseWheelRepeat = -1;
    }
    this.zoom(e, 1, this.scaleFactor, 50);
  }
};


CanvasCamera.prototype.emptyTick = function () {

};

CanvasCamera.prototype.scaleUsingFactor = function (event, direction, factor) {
  if (this.mouseIsDown) {
    // if mouse is pressed don't scale
    this.mouseWheelRepeat = 0;
    return;
  }
  var newScale, res = null;
  newScale = ((direction * factor) + 1) * this.scale;
  if (newScale > this.scaleMax) {
    this.scale = this.scaleMax;
    res = this.scaleIsMoreThanScaleMax(this);
  } else {
    this.scale = newScale;
    this.focusOnMouseAfterMouseWheel(event);
    res = true;
  }
  this.update();
  this.tickCallback();
  return res;
};


CanvasCamera.prototype.transform = function (ctx) {
  ctx.translate(this.translate.x, this.translate.y);
  ctx.scale(1 / this.scale, 1 / this.scale);
};

CanvasCamera.prototype.updateMousePositions = function (e) {
  var canvasOffset = $(this.canvas).offset();
  this.mousePosition.set(e.pageX - canvasOffset.left, e.pageY - canvasOffset.top);
  this.canvasMousePosition = this.mousePosition.getSubPoint(this.translate);
  this.mousePourcentagePosition.set((this.canvasMousePosition.x + this.translate.x) / this.canvas.width, (this.canvasMousePosition.y + this.translate.y) / this.canvas.height);
};


CanvasCamera.prototype.mouseMove = function (e) {
  // escacpe if is under mousewheel zoom/unzoom
  /*if (this.mouseWheelRepeat === 0) {
  }*/

  if (this.mouseWheelRepeat !== 0) {
    return;
  }
  this.update();
  if (e === null) {
    return;
  }
  this.updateMousePositions(e);
  var translate = new Point();
  if (this.mouseIsDown) {
    this.mouseWheelRepeat = 0;
    translate.set(this.canvasMousePosition.x - this.saveMouseDown.x, this.canvasMousePosition.y - this.saveMouseDown.y);
    this.translate.add(translate);
    this.update();
    this.tickCallback();
  }

};

CanvasCamera.prototype.updateScaledSize = function () {
  this.canvasScaledSize.set(this.canvas.width * this.scale * this.renderScale, this.canvas.height * this.scale * this.renderScale);
};

CanvasCamera.prototype.updateFPS = function () {
  var now, tickDiff;
  now = new Date();
  this.tickCount += 1;
  tickDiff = now.getTime() - this.tickStart;
  //console.log(tickDiff);
  if (tickDiff > 1000) {
    $('#fps').html('fps:' + this.tickCount);
    this.tickCount = 0;
    this.tickStart = now.getTime();
  }
};

CanvasCamera.prototype.update = function () {
  //this.updateFPS();
  this.updateScaledSize();
  this.scaledCanvasMousePosition = {
    "x": (this.canvasMousePosition.x) * this.scale,
    "y": (this.canvasMousePosition.y) * this.scale
  };

  this.mouseInDrawZone.copy(this.scaledCanvasMousePosition);
  //if (this.mouseInDrawZone.x < 0) this.mouseInDrawZone.x = 0;
  //if (this.mouseInDrawZone.y < 0) this.mouseInDrawZone.y = 0;
  //if (this.mouseInDrawZone.x > this.drawZoneSize.x) this.mouseInDrawZone.x = this.drawZoneSize.x;
  //if (this.mouseInDrawZone.y > this.drawZoneSize.y) this.mouseInDrawZone.y = this.drawZoneSize.y;
  //this.mousePourcentageInDrawZone = this.mouseInDrawZone.getDivPoint(this.drawZoneSize);
  this.debug();
};

CanvasCamera.prototype.scaleUntilVelocityIsOver = function (delay, callback) {
  var intervalID;
  intervalID = window.setInterval(function () {
    if (this.mouseWheelRepeat < 0) {
      this.mouseWheelRepeat += 1;
    } else {
      this.mouseWheelRepeat -= 1;
    }
    this.mouseWheelRepeat = Math.round(this.mouseWheelRepeat);
    callback();
    if (this.mouseWheelRepeat === 0) {
      window.clearInterval(intervalID);
    }
  }.bind(this), delay);
};



CanvasCamera.prototype.translateSide = function (distance, coord ,move) {
  if (Math.abs(distance[coord]) > move) {
    if (distance[coord] > 0) {
      this.translate[coord] += move;
    } else {
      this.translate[coord] -= move;
    }
  } else {
    return true;
  }
  return false;
};

CanvasCamera.prototype.translateToDestinationOnly = function (destinationPoint, move, delay, callback) {
  var distance, xOK, yOK;
  distance = destinationPoint.getSubPoint(this.translate);
  xOK = this.translateSide(distance, "x", move);
  yOK = this.translateSide(distance, "y", move);
  if (xOK && yOK) {
    return callback();
  } else {
    this.tickCallback();
    setTimeout(function () {
      return this.translateToDestinationOnly(destinationPoint, move, delay, callback);
    }.bind(this), delay);
  }
};

CanvasCamera.prototype.translateToDestination = function (destinationPoint, move, finaleScale, delay) {

  destinationPoint.multiply(this.renderScale);
  var currentPoint, x, y, firstDistance, numberOfTranslateIterations, scaleRequiredByIteration;
  if (!_.isUndefined(this.translateAnimationInterval)) {
    window.clearInterval(this.translateAnimationInterval);
  }

  //this.scale = finaleScale;
  x = (this.canvas.width / 2) - (destinationPoint.x * (1 / finaleScale));
  y = (this.canvas.height / 2) - (destinationPoint.y * (1 / finaleScale));
  destinationPoint.set(x, y);
  this.currentPoint = new Point();
  ///console.log(this.currentPoint, this.translate, destinationPoint);
  this.currentPoint.copy(this.translate);
  //destinationPoint.multiply(1 / this.scale);
  firstDistance = destinationPoint.getSubPoint(this.currentPoint);
  firstDistance.abs();
  numberOfTranslateIterations = 0;
  if (firstDistance.x > firstDistance.y) {
    numberOfTranslateIterations = firstDistance.x / move;
  } else {
    numberOfTranslateIterations = firstDistance.y / move;
  }

  scaleRequiredByIteration = Math.abs(this.scale - finaleScale) / numberOfTranslateIterations;
  //console.log("after", firstDistance, numberOfTranslateIterations, scaleRequiredByIteration, destinationPoint);
  this.translateAnimationInterval = window.setInterval(function () {

    if (this.scale > finaleScale) {
      this.scale -= scaleRequiredByIteration;
    } else {
      this.scale += scaleRequiredByIteration;
    }
    //this.update();
    //console.log("in", this.currentPoint);
    var distance = destinationPoint.getSubPoint(this.currentPoint);

    if (Math.abs(distance.x) > move) {
      if (distance.x > 0) {
        this.translate.x += move;
      } else {
        this.translate.x -= move;
      }
    }
    if (Math.abs(distance.y) > move) {
      if (distance.y > 0) {
        this.translate.y += move;
      } else {
        this.translate.y -= move;
      }
    }
    this.currentPoint.copy(this.translate);
    if (this.currentPoint.equals(destinationPoint, move + 5)) {
      this.translate.copy(destinationPoint);
      this.scale = finaleScale;
      window.clearInterval(this.translateAnimationInterval);
    }
    this.tickCallback();

  }.bind(this), delay);
};
