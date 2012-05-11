/*global DiagramJoiner :true, DiagramShape : true, cwAPI:true, G_vmlCanvasManager:true*/


var DiagramContext = function (jsonDiagramFile) {
  //console.log("jsonDiagramFile", jsonDiagramFile);
  this.diagramInfo = jsonDiagramFile.diagram;
  this.objectTypesStyles = jsonDiagramFile.objectTypesStyles;

  this.loadShapesFromJSON(jsonDiagramFile);
  this.loadJoinersFromJSON(jsonDiagramFile);
};


DiagramContext.prototype.loadShapesFromJSON = function (jsonDiagramFile) {
  var diagramShape;
  this.diagramShapes = [];
  this.reverseShapes = [];
  this.shapesByLinkID = {};
  _.each(jsonDiagramFile.shapes, function (shape) {
    diagramShape = new DiagramShape(shape, this.getStyleForItem(shape));
    this.diagramShapes.push(diagramShape);
    this.reverseShapes.push(diagramShape);
    this.shapesByLinkID[shape.link] = diagramShape;
  }.bind(this));
  this.reverseShapes.reverse();
};

DiagramContext.prototype.loadJoinersFromJSON = function (jsonDiagramFile) {
  this.joiners = [];
  _.each(jsonDiagramFile.joiners, function (j) {
    this.joiners.push(new DiagramJoiner(j, this.getStyleForItem(j)));
  }.bind(this));
};


DiagramContext.prototype.drawElements = function (ctx, searchValue) {
  _.each(this.diagramShapes, function (shape) {
    shape.draw(ctx, searchValue);
  }.bind(this));
  _.each(this.joiners, function (joiner) {
    joiner.draw(ctx);
  }.bind(this));
};



DiagramContext.prototype.getStyleForItem = function (_item) {
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


DiagramContext.prototype.setContextSize = function (renderScale) {
  var w, h, scaleX, scaleY, initScale, maxCanvasSize;
  maxCanvasSize = 2000;
  if (this.diagramInfo.size.w > maxCanvasSize){
    maxCanvasSize = this.diagramInfo.size.w;
  }
  if (this.diagramInfo.size.h > maxCanvasSize){
    maxCanvasSize = this.diagramInfo.size.h;
  }
  //console.log(this.diagramInfo.size, maxCanvasSize);
  w = this.diagramInfo.size.w * renderScale;
  h = this.diagramInfo.size.h * renderScale;
  scaleX = maxCanvasSize / w;
  scaleY = maxCanvasSize / h;
  initScale = scaleX;
  if (scaleY < scaleX) {
    initScale = scaleY;
  }

  this.renderCanvas.width = w * initScale;
  this.renderCanvas.height = h * initScale;
  return initScale;
};

DiagramContext.prototype.createContext = function (searchValue, renderScale) {
  var renderContext;

  if (cwAPI.isUnderIE9()) {
    return;
  }
  this.renderCanvas = document.createElement('canvas');
  if (cwAPI.isUnderIE9()) {
    G_vmlCanvasManager.initElement(this.renderCanvas);
  }
  renderContext = this.renderCanvas.getContext('2d');
  //console.log(this.diagramInfo.size.w * renderScale, this.diagramInfo.size.h * renderScale);

    renderScale = this.setContextSize(renderScale);

  //console.log(this.renderCanvas.width, this.renderCanvas.height);
  renderContext = this.renderCanvas.getContext('2d');
  renderContext.clearRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
//  renderContext.lineWidth = 1;
//  renderContext.strokeStyle = "#FF0000";
//  renderContext.strokeRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
  renderContext.save();
  renderContext.scale(renderScale, renderScale);
  this.drawElements(renderContext, searchValue);
  renderContext.restore();
  return renderContext;
};
