/*global DiagramShape:true, DiagramJoiner:true, cwAPI:true, G_vmlCanvasManager:true, CanvasCamera:true */

var DiagramCanvas = function (diagramID, jsonDiagramFile, selectorID) {
  var diagramShape, selectorSize;

  this.selectorID = selectorID;
  if ($('#' + this.selectorID).length === 0) {
    return;
  }
  this.canvasID = this.selectorID + "-canvas";

  this.objectTypesStyles = jsonDiagramFile.objectTypesStyles;
  this.diagramInfo = jsonDiagramFile.diagram;

  this.shapesByLinkID = {};

  selectorSize = $("#" + this.selectorID).height();

  if (this.diagramInfo.size.h < 200) {
    this.diagramInfo.size.h = 200;
  }
  if (this.diagramInfo.size.h < selectorSize) {
    $("#" + this.selectorID).css('height', this.diagramInfo.size.h + 20 + "px");
    $("#" + this.canvasID).css('height', this.diagramInfo.size.h + "px");
  }

  this.loadShapesFromJSON(jsonDiagramFile);
  this.loadJoinersFromJSON(jsonDiagramFile);

  $("body").data('diagram' + diagramID, this);
  $("#" + this.selectorID).attr('data-diagramid', diagramID);


  this.canvas = document.getElementById(this.canvasID);


  this.setUpNavigationBar(diagramID);

  if (cwAPI.isUnderIE9()) {
    G_vmlCanvasManager.initElement(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  } else {
    this.ctx = $('#' + this.canvasID)[0].getContext('2d');

  }
  this.updateSize();

  if ($("#debugger").length === 0) {
    $("body").append('<div id="debugger" style="position:fixed;top:0px;left:0px;background-color:#eee">debugger</div>');
  }

  this.camera = new CanvasCamera(this.canvas, this.diagramInfo.size, this.tick.bind(this));
  this.camera.scaleIsMoreThanScaleMax = function (camera) {};

  this.setInitPositionAndScale();
  this.lastScaleOnRender = this.camera.scale;

  this.createRenderContext();
  this.tick();

  this.setUpKeyEvents();
  this.setUpMouseEvents();
  this.setUpResize();


};


DiagramCanvas.prototype.setUpMouseEvents = function () {
  $(this.canvas).mousemove(function (e) {
    this.mouseMove(e);
  }.bind(this));

  $(this.canvas).mouseout(function (e) {
    this.shapeToolTipRemove();
  }.bind(this));
  this.camera.onClick = function (e) {};
};

DiagramCanvas.prototype.setUpResize = function () {
  $(window).resize(function () {
    this.updateSize();
    this.setInitPositionAndScale();
    this.camera.update();
    this.tick();
  }.bind(this));
};

DiagramCanvas.prototype.setUpKeyEvents = function () {
  this.isSKeyPressed = false;
  $("body").keydown(function (e) {
    if (e.keyCode === 83) {
      this.isSKeyPressed = true;
      this.strokeShapeIfMouseIsOver();
    }
  }.bind(this));
  $("body").keyup(function (e) {
    if (e.keyCode === 83) {
      this.isSKeyPressed = false;
      this.tick();
    }
  }.bind(this));
};

DiagramCanvas.prototype.loadShapesFromJSON = function (jsonDiagramFile) {
  var diagramShape;

  this.diagramShapes = [];
  this.reverseShapes = [];
  _.each(jsonDiagramFile.shapes, function (shape) {
    diagramShape = new DiagramShape(shape, this.getStyleForItem(shape));
    this.diagramShapes.push(diagramShape);
    this.reverseShapes.push(diagramShape);
    this.shapesByLinkID[shape.link] = diagramShape;
  }.bind(this));
  this.reverseShapes.reverse();
};

DiagramCanvas.prototype.loadJoinersFromJSON = function (jsonDiagramFile) {
  this.joiners = [];
  _.each(jsonDiagramFile.joiners, function (j) {
    this.joiners.push(new DiagramJoiner(j, this.getStyleForItem(j)));
  }.bind(this));
};

DiagramCanvas.prototype.updateSize = function () {
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
  this.camera.scale = initScale * this.camera.renderScale;
  diffWidth = this.ctx.canvas.width - this.diagramInfo.size.w * (1 / initScale);
  diffHeight = this.ctx.canvas.height - this.diagramInfo.size.h * (1 / initScale);

  if (diffWidth > 0 && scaleX < scaleY) {
    this.camera.translate.set(diffWidth / 2, 0);
  }
  if (diffHeight > 0 && scaleX > scaleY) {
    this.camera.translate.set(0, diffHeight / 2);
  }
  this.updateSearchBoxPosition();
};


DiagramCanvas.prototype.isMouseOnAShape = function () {
  var shapeGhost, scale;
  shapeGhost = null;
  scale = 1 / this.camera.scale * this.camera.renderScale;
  $.each(this.reverseShapes, function (i, shape) {
    shapeGhost = {};
    shapeGhost.w = shape.shape.w * (scale);
    shapeGhost.h = shape.shape.h * (scale);
    shapeGhost.x = (shape.shape.x * (scale)) + this.camera.translate.x;
    shapeGhost.y = (shape.shape.y * (scale)) + this.camera.translate.y;
    shapeGhost.shape = shape;
    if (this.pointInBox(this.camera.mousePosition, shapeGhost) === true) {
      //this.ShapeToolTip(shape, e, this);
      return false;
    }
  }.bind(this));
  return shapeGhost;
};


DiagramCanvas.prototype.strokeShapeIfMouseIsOver = function () {
  var shapeGhost, shape, symbol, cwObject;
  //this.shapeToolTipRemove();
  this.ctx.strokeStyle = "#004488";
  this.ctx.lineWidth = 2;
  shapeGhost = this.isMouseOnAShape();
  if (shapeGhost !== null) {
    shapeGhost.name = "NAME_NOT_SET";
    shape = new DiagramShape(shapeGhost, shapeGhost.shape.paletteEntry);
    symbol = shape.getSymbol();
    shape.drawSymbolPath(this.ctx, symbol);
    this.ctx.stroke();
    cwObject = shape.shape.shape.shape.cwObject;
    _.each(cwObject.associations.diagramExploded, function (diagram) {
      //console.log(diagram.objectID);
    });
  }
  this.ctx.lineWidth = 1;
};


DiagramCanvas.prototype.mouseMove = function (e) {
  if (this.isSKeyPressed) {
    this.tick();
    this.strokeShapeIfMouseIsOver();
  }
};

DiagramCanvas.prototype.createRenderContext = function () {
  var searchValue, renderContext;

  if (cwAPI.isUnderIE9()) {
    return;
  }
  this.lastScaleOnRender = this.camera.scale;

  this.renderCanvas = document.createElement('canvas');
  if (cwAPI.isUnderIE9()) {
    G_vmlCanvasManager.initElement(this.renderCanvas);

  }
  renderContext = this.renderCanvas.getContext('2d');
  this.renderCanvas.width = this.diagramInfo.size.w * this.camera.renderScale;
  this.renderCanvas.height = this.diagramInfo.size.h * this.camera.renderScale;
  renderContext = this.renderCanvas.getContext('2d');
  this.camera.clearContext(renderContext);

  //renderContext.lineWidth = 1;
  //renderContext.strokeStyle = "#FF0000";
  //renderContext.strokeRect(0, 0, this.diagramInfo.size.w * this.camera.renderScale, this.diagramInfo.size.h * this.camera.renderScale);
  renderContext.save();
  renderContext.scale(this.camera.renderScale, this.camera.renderScale);
  searchValue = $("#" + this.searchID).val();
  _.each(this.diagramShapes, function (shape) {
    shape.draw(renderContext, searchValue);
  }.bind(this));
  _.each(this.joiners, function (joiner) {
    joiner.draw(renderContext);
  }.bind(this));
  renderContext.restore();

};


DiagramCanvas.prototype.tick = function () {
  this.shapeToolTipRemove();
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
  //this.camera.scale = 1;
  this.camera.transform(this.ctx);
  //this.ctx.scale(1 / this.camera.scale, 1 / this.camera.scale);
  //this.ctx.drawImage(this.renderCanvas, this.camera.translate.x, this.camera.translate.y);
  this.ctx.drawImage(this.renderCanvas, 0, 0, this.renderCanvas.width, this.renderCanvas.height);
  //this.ctx.strokeStyle = "#000";
  //this.ctx.strokeRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
  this.ctx.restore();
};



DiagramCanvas.prototype.tickIE = function () {
  //  console.log('tick', this.diagramInfo);
  //this.camera.clearContext(this.ctx);
  this.camera.update();
  this.camera.debug();

  this.ctx.save();
  this.camera.clearContext(this.ctx);
  this.camera.transform(this.ctx);

  var searchValue = $("#" + this.searchID).val();
  //this.ctx.strokeRect(0, 0, this.diagramInfo.size.w, this.diagramInfo.size.h);
  //this.ctx.strokeRect(0, 0, this.diagramInfo.size.w, this.diagramInfo.size.h);
  _.each(this.diagramShapes, function (shape) {
    shape.draw(this.ctx, searchValue);
  }.bind(this));
  _.each(this.joiners, function (joiner) {
    joiner.draw(this.ctx);
  }.bind(this));
  this.ctx.restore();

};

DiagramCanvas.prototype.getStyleForItem = function (_item) {
  var objectPaletteEntryKey = _item.objectPaletteEntryKey;
  if (!_.isUndefined(objectPaletteEntryKey) && objectPaletteEntryKey) {
    if (!_.isUndefined(this.objectTypesStyles[objectPaletteEntryKey])) {
      return this.objectTypesStyles[objectPaletteEntryKey];
    } else {
      return this.objectTypesStyles[_item.objectTypeName + '|0'];
    }
  }
  return null;
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


DiagramCanvas.prototype.shapeToolTipRemove = function () {
  $('.tooltip-shape-canvas').remove();
};

DiagramCanvas.prototype.ShapeToolTip = function (shape, _event, _diagramCanvas) {
  var tooltip, tooltipId, tooltipTag, toolTipBoxWidth, toolTipBoxHeight, tooltipPositionX, tooltipPositionY, fillColor, textColor;
  this.shapeToolTipRemove();
  tooltip = document.createElement('div');
  tooltipId = "tooltip-" + _diagramCanvas.canvasID;
  tooltip.id = tooltipId;
  $("body").append(tooltip);
  tooltipTag = $('#' + tooltipId);
  fillColor = '#FFFFFF';
  textColor = '#000000';
  if (!_.isUndefined(shape.style)) {
    fillColor = shape.style.fillColor;
    textColor = shape.style.textColor;
  }

  tooltipTag.html(shape.shape.name).addClass('tooltip-shape-canvas').css('position', 'absolute').css('display', 'block').css('cursor', 'help').css('padding', '10px').css('color', textColor).css('background-color', fillColor);
  toolTipBoxWidth = tooltipTag.width();
  toolTipBoxHeight = tooltipTag.height();
  tooltipPositionX = _event.pageX;
  tooltipPositionY = _event.pageY;
  if (tooltipPositionX + toolTipBoxWidth + 100 > $(window).width()) {
    tooltipPositionX = _event.pageX - toolTipBoxWidth - 20;
  }
  tooltipTag.css('left', tooltipPositionX).css('top', _event.pageY + 5);
};
