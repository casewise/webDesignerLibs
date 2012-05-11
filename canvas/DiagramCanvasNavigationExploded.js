/*global DiagramCanvas:true, cwAPI:true, DiagramContext:true, Point:true */

DiagramCanvas.prototype.setupNavigationDiagrams = function () {
  this.navigationDiagrams = [];
  this.navigationDiagramsShape = null;
  this.navigationDiagramsByObjectID = {};
  this.navigationHeaderList = [];
  this.addDiagramInBreadCrumb(this.mainDiagramContext);
};


DiagramCanvas.prototype.resetNavigationDiagram = function () {
  this.navigationDiagrams = [];
  this.navigationDiagramsShape = null;
  this.cleanValueForDiagramSearch();
  this.tick();
};

DiagramCanvas.prototype.addNavgationDiagram = function (navigationDiagram) {
  this.navigationDiagrams.push(navigationDiagram);
};

DiagramCanvas.prototype.resetGhostDiagramPositionIfExists = function () {
  if (this.navigationDiagramsShape !== null) {
    this.navigationDiagramsShape = this.getGhostShape(this.navigationDiagramsShape.shape);
  }
};


DiagramCanvas.prototype.loadExplodedDiagramsFromShape = function (ghostShape) {
  var cwObject, linkID;
  cwObject = ghostShape.shape.shape.cwObject;
  linkID = ghostShape.shape.shape.link;
  if (_.isUndefined(this.navigationDiagramsByObjectID[linkID])) {
    this.navigationDiagramsByObjectID[linkID] = [];
    if (!_.isUndefined(cwObject.associations)) {
      this.navigationDiagramsShape = ghostShape;
      this.setValueForDiagramSearch(ghostShape.shape.shape.name);
      _.each(cwObject.associations.diagramExploded, function (diagram) {
        this.loadNavigationDiagram(diagram, linkID, function () {
          this.tick();
        }.bind(this));
      }.bind(this));
    }
  } else { // shape has already been loaded
    this.navigationDiagrams = this.navigationDiagramsByObjectID[linkID];
    this.navigationDiagramsShape = ghostShape;
    this.setValueForDiagramSearch(ghostShape.shape.shape.name);
    this.tick();
  }
};


DiagramCanvas.prototype.strokeDiagramContextIfMouseIsOver = function () {
  var ctx = null;
  $.each(this.navigationDiagrams, function (i, diagramContext) {
    if (this.pointInBox(this.camera.mousePosition, diagramContext) === true) {
      this.ctx.strokeStyle = "#004888";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(diagramContext.x, diagramContext.y, diagramContext.w, diagramContext.h);
      this.ctx.lineWidth = 1;
      ctx = diagramContext;
      return false;
    }
  }.bind(this));
  return ctx;
};

DiagramCanvas.prototype.loadNavigationDiagramIfMouseIsOver = function () {
  if (this.navigationDiagramsShape !== null) {
    return;
  }
  //  console.log('load diagrams');
  var shapeGhost = this.isMouseOnAShape();
  if (shapeGhost !== null) {
    this.loadExplodedDiagramsFromShape(shapeGhost);
  }
};

DiagramCanvas.prototype.loadNavigationDiagram = function (diagram, linkID, callback) {
  // escape if the exploded diagram is the same
  if (diagram.object_id === this.diagramInfo.object_id) {
    return;
  }
  $.getJSON(cwAPI.getDiagramPath(diagram.object_id), function (jsonDiagramFile) {
    var diagramContext = new DiagramContext(jsonDiagramFile);
    //console.log('create ctx for navigation diagram');
    diagramContext.createContext("", 1);
    this.addNavgationDiagram(diagramContext);
    this.navigationDiagramsByObjectID[linkID].push(diagramContext);
    return callback(null);
  }.bind(this));
};

DiagramCanvas.prototype.drawNavigationDiagrams = function () {
  var shape, maxSize, position, ratio, w, h;

  if (this.navigationDiagramsShape !== null) {
    shape = this.navigationDiagramsShape;
    // draw green border
    this.ctx.strokeStyle = "#33AA33";
    this.ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
    maxSize = shape.w * 0.4;
    // draw each diagram inside the main shape
    $.each(this.navigationDiagrams, function (i, navigationDiagram) {
      position = new Point(shape.x + i * maxSize, shape.y);
      ratio = maxSize / navigationDiagram.renderCanvas.width;
      w = navigationDiagram.renderCanvas.width * ratio;
      h = navigationDiagram.renderCanvas.height * ratio;
      this.navigationDiagrams[i].x = position.x;
      this.navigationDiagrams[i].y = position.y;
      this.navigationDiagrams[i].w = w;
      this.navigationDiagrams[i].h = h;
      this.navigationDiagrams[i].ratio = ratio;
      this.ctx.drawImage(navigationDiagram.renderCanvas, position.x, position.y, w, h);
    }.bind(this));
  }
};


DiagramCanvas.prototype.breadCrumbZoneExists = function () {
  return $(this.mainDiv).children('.cw-canvas-header').length > 0;
};

DiagramCanvas.prototype.removeBreadCrumb = function () {
  $(this.mainDiv).children('.cw-canvas-header').remove();
};

DiagramCanvas.prototype.addDiagramInBreadCrumb = function (diagramContext) {
  var a, span, name;
  $(this.mainDiv).find('.cw-canvas-header a').removeClass("selected");
  if (!this.breadCrumbZoneExists()) {
    this.addBreadCrumb();
  } else {
    $(this.mainDiv).children('.cw-canvas-header').append("<span> > </span> ");
  }
  a = $('<a/>').addClass('selected').append(diagramContext.diagramInfo.name).hide().click(function (e) {
    this.changeMainContext(diagramContext, e);
    this.setInitPositionAndScale();
    this.tick();
    this.camera.mouseMove(e);
    this.mouseMove(e);
    a.nextAll().remove();
    $(this.mainDiv).find('.cw-canvas-header a').removeClass("selected");
    $(this.mainDiv).find('.cw-canvas-header a').last().addClass("selected");
    return false;
  }.bind(this));
  //$(this.mainDiv).children('.cw-canvas-header a').removeClass("selected");
  $(this.mainDiv).children('.cw-canvas-header').append(a);
  a.show('slide', function () {
    $(this).css('display', 'inline-block');
  });
};

DiagramCanvas.prototype.addBreadCrumb = function () {
  $(this.mainDiv).children().first().before('<div class="cw-canvas-header"></div>');
};

DiagramCanvas.prototype.changeMainContext = function (diagramContext, e) {
  var ratioX, ratioY, ratio;
  ratioX = diagramContext.w / diagramContext.diagramInfo.size.w;
  ratioY = diagramContext.h / diagramContext.diagramInfo.size.h;
  ratio = ratioX;
  if (ratioY > ratioX) {
    ratio = ratioY;
  }
  this.mainDiagramContext = diagramContext;
  this.diagramInfo = diagramContext.diagramInfo;
  this.camera.scale = 1 / ratio;
  this.camera.translate.set(diagramContext.x, diagramContext.y);
  this.resetNavigationDiagram();
  this.navigationDiagramsByObjectID = {};
  this.tick();
  this.camera.mouseMove(e);
  this.mouseMove(e);
};


DiagramCanvas.prototype.goToSelectedObjectLink = function (e) {
  var diagramShape, ghostShape, link;
  if (this.isSKeyPressed) {
    ghostShape = this.isMouseOnAShape();
    if (ghostShape !== null) {
      diagramShape = ghostShape.shape;
      //console.log(diagramShape);
      link = cwAPI.createLinkForSingleView(diagramShape.shape.objectTypeName.toLowerCase(), diagramShape.shape.objectID);
      //console.log(link);
      window.location = link;
    }
  }
};


DiagramCanvas.prototype.zoomIntoNextContext = function (e) {
  var diagramContext;
  if (this.isDKeyPressed) {
    diagramContext = this.strokeDiagramContextIfMouseIsOver();
    if (diagramContext !== null) {
      this.changeMainContext(diagramContext, e);
      this.addDiagramInBreadCrumb(diagramContext);
    }
  }
};
