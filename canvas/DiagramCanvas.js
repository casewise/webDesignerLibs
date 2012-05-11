/*global DiagramShape:true, DiagramJoiner:true, Point:true, cwAPI:true, G_vmlCanvasManager:true, CanvasCamera:true, DiagramContext:true */

var DiagramCanvas = function (diagramID, jsonDiagramFile, selectorID) {
  var diagramShape, selectorSize;

  this.selectorID = selectorID;
  if ($('#' + this.selectorID).length === 0) {
    return;
  }
  this.mainDiv = $('#' + this.selectorID);
  this.canvasID = this.selectorID + "-canvas";

  this.diagramInfo = jsonDiagramFile.diagram;

  //$(this.canvas).css('height', ($(this.mainDiv).height() - 18) + "px");


  //this.reduceDiagramCanvasHeight();
  this.mainDiagramContext = new DiagramContext(jsonDiagramFile);

  $("body").data('diagram' + diagramID, this);
  $("#" + this.selectorID).attr('data-diagramid', diagramID);

  this.setupNavigationDiagrams();

  this.setUpMainContext();



  this.setUpDebugZone();

  this.camera = new CanvasCamera(this.canvas, this.diagramInfo.size, this.tick.bind(this));
  this.camera.scaleIsMoreThanScaleMax = function (camera) {};
  this.camera.customHasBeenSelected = function () {
    $(this.mainDiv).addClass('diagram-zone-isSelected ');
    this.showNavigationBar();
  }.bind(this);
  this.camera.customHasBeenReleased = function () {
    $(this.mainDiv).removeClass('diagram-zone-isSelected');
    //this.hideNavigationBar();
  }.bind(this);

  
  this.updateSize();
  this.setUpNavigationBar(diagramID);

  this.setInitPositionAndScale();
  this.lastScaleOnRender = this.camera.scale;


  this.mainDiagramContext.createContext("", this.camera.renderScale);
  this.tick();

  this.setUpKeyEvents();
  this.setUpMouseEvents();
  this.setUpResize();
};



DiagramCanvas.prototype.reduceDiagramCanvasHeight = function (selectorSize) {
  selectorSize = $("#" + this.selectorID).height();
  if (this.diagramInfo.size.h < 200) {
    this.diagramInfo.size.h = 200;
  }
  if (this.diagramInfo.size.h < selectorSize) {
    $(this.mainDiv).css('min-height', this.diagramInfo.size.h + 20 + "px");
    $(this.canvas).css('min-height', this.diagramInfo.size.h + "px");
  }
};

DiagramCanvas.prototype.setUpDebugZone = function () {
  if ($("#debugger").length === 0) {
    $("body").append('<div id="debugger" style="position:fixed;top:0px;right:0px;background-color:#eee">debugger</div>');
  }

};

DiagramCanvas.prototype.setUpMainContext = function () {
  this.canvas = document.getElementById(this.canvasID);
  if (cwAPI.isUnderIE9()) {
    G_vmlCanvasManager.initElement(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  } else {
    this.ctx = $('#' + this.canvasID)[0].getContext('2d');
  }
};


DiagramCanvas.prototype.focusOnShapeIfMouseIsOver = function (e, callback) {
  var shapeGhost, focusPoint, wRatio, hRatio, diff, tX, tY, destination, ratio, direction, zoomFactor;
  shapeGhost = this.isMouseOnAShape();
  if (shapeGhost !== null) {
    focusPoint = new Point(shapeGhost.shape.shape.x + shapeGhost.shape.shape.w / 2, shapeGhost.shape.shape.y + shapeGhost.shape.shape.h / 2);
    wRatio = shapeGhost.shape.shape.w / this.canvas.width;
    hRatio = shapeGhost.shape.shape.h / this.canvas.height;
    ratio = wRatio;
    if (hRatio < wRatio) {
      ratio = hRatio;
    }
    diff = this.camera.scale - ratio;
    tX = shapeGhost.shape.shape.x * (1 / ratio) * this.camera.renderScale;
    tY = shapeGhost.shape.shape.y * (1 / ratio) * this.camera.renderScale;
    destination = new Point(tX, tY);
    destination.inverse();
    //console.log("diff", diff, this.camera.scale, ratio, this.camera.scaleFactor);
    direction = -1;
    if (diff < 0) {
      direction = 1;
    }
    zoomFactor = 0.05;
    this.camera.mouseWheelRepeat = this.getNumberOfIterationRequired(this.camera.scale, ratio, zoomFactor, direction);
    if (direction > 0) {
      this.camera.mouseWheelRepeat *= -1;
    }
    //console.log("wheel", this.camera.mouseWheelRepeat, "destination", destination);
    if (this.camera.mouseWheelRepeat !== 0) {
      this.camera.zoom(e, direction, zoomFactor, 5, function () {
        //console.log('zoom is over');
        this.camera.translateToDestinationOnly(destination, 20, 5, function () {
          //console.log("translate ok", destination);
          this.tick();
          return callback(shapeGhost.shape);
        }.bind(this));
      }.bind(this));
    }
  }
};


DiagramCanvas.prototype.getNumberOfIterationRequired = function (startScale, finalScale, scaleFactor, direction) {
  var scale, iteration;
  //console.log(startScale, finalScale, scaleFactor, direction);
  if (startScale === finalScale) {
    return 0;
  }
  scale = startScale;
  iteration = 0;
  while (true) {
    if (direction > 0) {
      if (scale > finalScale) {
        break;
      }
    } else {
      if (scale < finalScale) {
        break;
      }
    }
    scale *= ((direction * scaleFactor) + 1);
    iteration += 1;
  }
  return iteration;
};

DiagramCanvas.prototype.setUpMouseEvents = function () {
  $(this.canvas).mousemove(function (e) {
    this.mouseMove(e);
  }.bind(this));

  $(this.canvas).bind('mousewheel', function (e) {
    if (!this.camera.isSelected()) {
      return;
    }
    if (this.isDKeyPressed === true) {
      if (this.navigationDiagramsShape !== null) {
        this.navigationDiagramsShape = this.getGhostShape(this.navigationDiagramsShape.shape);
      } else {
        this.loadNavigationDiagramIfMouseIsOver();
      }
      this.strokeDiagramContextIfMouseIsOver();

    }
    //this.resetNavigationDiagram();
  }.bind(this));

  $(this.canvas).mouseout(function (e) {
    this.shapeToolTipRemove();
    this.resetNavigationDiagram();
    this.tick();
  }.bind(this));

  $(this.canvas).dblclick(function (e) {
    if (!this.camera.isSelected()) {
      return;
    }
    this.goToSelectedObjectLink(e);
    this.zoomIntoNextContext(e);
  }.bind(this));
  this.camera.onClick = function (e) {};
};

DiagramCanvas.prototype.resize = function() {
    this.updateSize();
    this.setInitPositionAndScale();
    this.camera.update();
    this.tick();
};

DiagramCanvas.prototype.setUpResize = function () {
  $(window).resize(function () {
    this.resize();
  }.bind(this));
};

DiagramCanvas.prototype.setUpKeyEvents = function () {
  this.isSKeyPressed = false;
  this.isDKeyPressed = false;
  $("body").keydown(function (e) {
    if (!this.camera.isSelected()) {
      return;
    }

    if (e.keyCode === 68) { // D
      this.isDKeyPressed = true;
      this.loadNavigationDiagramIfMouseIsOver();
    }
    if (e.keyCode === 83) { // S
      this.isSKeyPressed = true;
      this.strokeShapeIfMouseIsOver("#004488");
    }
  }.bind(this));
  $("body").keyup(function (e) {
    if (!this.camera.isSelected()) {
      return;
    }
    if (e.keyCode === 68) { // D
      this.isDKeyPressed = false;
      this.resetNavigationDiagram();
      this.tick();
    }
    if (e.keyCode === 83) { // S
      this.isSKeyPressed = false;
      this.tick();
    }
  }.bind(this));
};


DiagramCanvas.prototype.updateSize = function () {
  $(this.canvas).css('width', ($(this.mainDiv).width() - 44) + "px");
  $(this.canvas).css('height', ($(this.mainDiv).height() - 18) + "px");

  this.ctx.canvas.width = $(this.canvas).width();
  this.ctx.canvas.height = $(this.canvas).height();
};

DiagramCanvas.prototype.setInitPositionAndScale = function () {
  var scaleX, scaleY, diffWidth, diffHeight, initScale;

  scaleX = 1 / ((this.ctx.canvas.width - 30) / this.diagramInfo.size.w);
  scaleY = 1 / (this.ctx.canvas.height / this.diagramInfo.size.h);
  //console.log(scaleX, scaleY, this.ctx.canvas.height, this.ctx.canvas.width);
  initScale = scaleX;
  if (scaleY > scaleX) {
    initScale = scaleY;
  }
  //console.log(initScale);
  if (1 / initScale > 1) {
    initScale = 1;
  }

  this.camera.scale = initScale * this.camera.renderScale;
  diffWidth = this.ctx.canvas.width - this.diagramInfo.size.w * (1 / initScale);
  diffHeight = this.ctx.canvas.height - this.diagramInfo.size.h * (1 / initScale);

  this.camera.translate.set(diffWidth / 2, diffHeight / 2);
  /*  if (diffWidth > 0 && scaleX < scaleY) {
   
  }
  if (diffHeight > 0 && scaleX > scaleY) {
    this.camera.translate.set(diffWidth / 2, diffHeight / 2);
  }*/
  this.updateSearchBoxPosition();
};


DiagramCanvas.prototype.getGhostShape = function (shape) {
  var scale, shapeGhost;
  scale = 1 / this.camera.scale * this.camera.renderScale;
  shapeGhost = {};
  shapeGhost.w = shape.shape.w * (scale);
  shapeGhost.h = shape.shape.h * (scale);
  shapeGhost.x = (shape.shape.x * (scale)) + this.camera.translate.x;
  shapeGhost.y = (shape.shape.y * (scale)) + this.camera.translate.y;
  shapeGhost.shape = shape;
  return shapeGhost;
};


DiagramCanvas.prototype.isMouseOnAShape = function () {
  var shapeGhost, scale;
  shapeGhost = null;

  $.each(this.mainDiagramContext.reverseShapes, function (i, shape) {
    shapeGhost = this.getGhostShape(shape);
    if (this.pointInBox(this.camera.mousePosition, shapeGhost) === true) {
      //this.ShapeToolTip(shape, e, this);
      return false;
    }
  }.bind(this));
  return shapeGhost;
};



DiagramCanvas.prototype.strokeShapeIfMouseIsOver = function (strokColor) {
  var shapeGhost, shape, symbol, cwObject;
  //this.shapeToolTipRemove();
  shapeGhost = this.isMouseOnAShape();
  if (shapeGhost !== null) {
    shapeGhost.name = "NAME_NOT_SET";
    shape = new DiagramShape(shapeGhost, shapeGhost.shape.paletteEntry);
    symbol = shape.getSymbol();
    this.ctx.strokeStyle = strokColor;
    this.ctx.lineWidth = 2;
    shape.drawSymbolPath(this.ctx, symbol);
    this.ctx.stroke();
    this.ctx.lineWidth = 1;
  }
};


DiagramCanvas.prototype.mouseMove = function (e) {
  if (!this.camera.isSelected()) {
    return;
  }
  if (this.isSKeyPressed) {
    this.tick();
    this.strokeShapeIfMouseIsOver("#004488");
  }
  if (this.isDKeyPressed) {
    this.tick();
    this.loadNavigationDiagramIfMouseIsOver();
    this.strokeDiagramContextIfMouseIsOver();
  }
};


DiagramCanvas.prototype.tick = function () {
  this.shapeToolTipRemove();
  this.resetGhostDiagramPositionIfExists();
  if (cwAPI.isUnderIE9()) {
    this.tickIE();
  } else {
    this.tickNormal();
  }
};


DiagramCanvas.prototype.tickNormal = function () {
  this.camera.update();
  this.camera.debug();
  this.ctx.save();
  this.camera.clearContext(this.ctx);
  this.camera.transform(this.ctx);
  this.ctx.drawImage(this.mainDiagramContext.renderCanvas, 0, 0, this.diagramInfo.size.w, this.diagramInfo.size.h);
  this.ctx.restore();

  this.drawNavigationDiagrams();
};



DiagramCanvas.prototype.tickIE = function () {
  this.camera.update();
  this.camera.debug();
  this.ctx.save();
  this.camera.clearContext(this.ctx);
  this.camera.transform(this.ctx);
  var searchValue = $("#" + this.searchID).val();
  this.mainDiagramContext.drawElements(this.ctx, searchValue);
  this.ctx.restore();

};


DiagramCanvas.prototype.pointInBox = function (point, box) {
  if (point.x < box.x) {
    return false;
  }
  if (point.x > box.x + box.w) {
    return false;
  }
  if (point.y < box.y) {
    return false;
  }
  if (point.y > box.y + box.h) {
    return false;
  }
  return true;
};
