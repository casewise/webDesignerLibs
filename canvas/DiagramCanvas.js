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
  if (this.diagramInfo.size.h < selectorSize) {
    $("#" + this.selectorID).css('height', this.diagramInfo.size.h + 20 + "px");
    $("#" + this.canvasID).css('height', this.diagramInfo.size.h + "px");
  }

  this.diagramShapes = [];
  _.each(jsonDiagramFile.shapes, function (shape) {
    diagramShape = new DiagramShape(shape, this.getStyleForItem(shape));
    this.diagramShapes.push(diagramShape);
    this.shapesByLinkID[shape.link] = diagramShape;
  }.bind(this));

  this.joiners = [];
  _.each(jsonDiagramFile.joiners, function (j) {
    this.joiners.push(new DiagramJoiner(j, this.getStyleForItem(j)));
  }.bind(this));

  this.canvas = document.getElementById(this.canvasID);

  $("body").data('diagram' + diagramID, this);
  //console.log("selectorID", this.selectorID, diagramID);
  $("#" + this.selectorID).attr('data-diagramid', diagramID);

  this.searchID = this.canvasID + '-search';
  this.createNavigationBar(diagramID, "ui-corner-all");
  this.initDiagramNavigation("#" + $(this.canvas).parent().attr('id'));


  $("#" + this.searchID).keyup(function () {
    var value = $("#" + this.searchID).val();
    this.createRenderContext();
    this.camera.update();
    this.tick();
  }.bind(this));

  if (cwAPI.isUnderIE9()) {
    G_vmlCanvasManager.initElement(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.canvas.height = 400;
  } else {
    this.ctx = $('#' + this.canvasID)[0].getContext('2d');

  }
  this.updateSize();

  if ($("#debugger").length === 0) {
    $("body").append('<div id="debugger" style="position:fixed;top:0px;left:0px;background-color:#eee">debugger</div>');
  }

  this.camera = new CanvasCamera(this.canvas, this.diagramInfo.size, this.tick.bind(this));
  this.camera.scaleIsMoreThanScaleMax = function (camera) {};

  //console.log('camera', this.camera.scale);
  this.setInitPositionAndScale();
  this.lastScaleOnRender = this.camera.scale;



  this.createRenderContext();
  //console.log('dc setup', this.camera, this.camera.scale);
  this.tick();

  $(this.canvas).mousemove(function (e) {
    this.mouseMove(e);
  }.bind(this));

  $(this.canvas).mouseout(function (e) {
    this.shapeToolTipRemove();
  }.bind(this));

  $(window).resize(function () {
    this.updateSize();
    this.setInitPositionAndScale();
    this.camera.update();
    this.tick();
  }.bind(this));



  this.camera.onClick = function (e) {};

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
};

DiagramCanvas.prototype.mouseMove = function (e) {
  var shapeGhost = {};
  //console.log('mouse move', this.camera.scaledCanvasMousePosition);
  if (this.camera.isShiftPressed) {
    this.shapeToolTipRemove();
    this.ctx.strokeStyle = "#000000";
    _.each(this.diagramShapes, function (shape) {
      shapeGhost.w = shape.shape.w * (1 / this.camera.scale * this.camera.renderScale);
      shapeGhost.h = shape.shape.h * (1 / this.camera.scale * this.camera.renderScale);
      //shape.shape.w * 1/this.camera.renderScale, shape.shape.h * 1/this.camera.renderScale
      shapeGhost.x = (shape.shape.x * (1 / this.camera.scale * this.camera.renderScale)) + this.camera.translate.x; //+ (1 / this.camera.scale);
      shapeGhost.y = (shape.shape.y * (1 / this.camera.scale * this.camera.renderScale)) + this.camera.translate.y; //+ (1 / this.camera.scale);
      //console.log(this.camera.mouseInDrawZone, shapeGhost);
      //var mouseIn
      if (this.pointInBox(this.camera.mouseInDrawZone, shapeGhost) === true) {
        //console.log('on', shape.shape.name, shape);
        this.ShapeToolTip(shape, e, this);
        this.ctx.strokeRect(shapeGhost.x, shapeGhost.y, shapeGhost.w, shapeGhost.h);
        return false;
      }
    }.bind(this));
  }
};

DiagramCanvas.prototype.createRenderContext = function () {
  var searchValue, renderContext;

  if (cwAPI.isUnderIE9()) {
    return;
  }

  //  if (this.lastScaleOnRender !== this.camera.scale){
  //    console.log(this.camera.scale / this.lastScaleOnRender);
  //  }
  //this.camera.renderScale = 
  //this / 3.113858165256994;
  //  console.log('create context', this.camera.scale, this.camera.translate, this.camera.canvasScaledSize);
  this.lastScaleOnRender = this.camera.scale;

  this.renderCanvas = document.createElement('canvas');
  if (cwAPI.isUnderIE9()) {
    G_vmlCanvasManager.initElement(this.renderCanvas);

  }
  renderContext = this.renderCanvas.getContext('2d');
  /*  canvas.setAttribute("width", CANVAS_WIDTH);
  canvas.setAttribute("height", CANVAS_HEIGHT);
*/

  //this.camera.renderScale = 2;
  this.renderCanvas.width = this.diagramInfo.size.w * this.camera.renderScale;
  this.renderCanvas.height = this.diagramInfo.size.h * this.camera.renderScale;


  //this.renderCanvas.width = this.camera.canvasScaledSize.x;
  //this.renderCanvas.height = this.camera.canvasScaledSize.y;
  //this.renderCanvas.width = this.canvas.width;
  //this.renderCanvas.height = this.camera.canvasScaledSize.y;
  renderContext = this.renderCanvas.getContext('2d');


  this.camera.clearContext(renderContext);
  //renderContext.scale = 0.25;
  //renderContext.scale = 1;
  renderContext.save();
  //renderContext.scale = 0.5;
  //renderContext.translate(-this.camera.renderTranslate.x, -this.camera.renderTranslate.y);
  renderContext.scale(this.camera.renderScale, this.camera.renderScale);
  //renderContext.scale(1 / this.camera.scale, 1 / this.camera.scale);
  //renderContext.translate(this.camera.translate.x, this.camera.translate.y)
  searchValue = $("#" + this.searchID).val();
  //renderContext.strokeStyle = "#FF0000";
  //renderContext.strokeRect(0, 0, this.diagramInfo.size.w, this.diagramInfo.size.h);
  _.each(this.diagramShapes, function (shape) {
    shape.draw(renderContext, searchValue);
  }.bind(this));
  _.each(this.joiners, function (joiner) {
    joiner.draw(renderContext);
  }.bind(this));
  renderContext.restore();

};


DiagramCanvas.prototype.tick = function () {
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



/*DiagramCanvas.prototype.updateNavigationBarPosition = function () {
  var translate, navigationBarPositionLeft;
  translate = 0;//32;
  console.log($("#" + this.canvasID).offset(), $("#" + this.canvasID).width());
  navigationBarPositionLeft = $("#" + this.canvasID).offset().left + $("#" + this.canvasID).width() - translate;
  //$("#" + this.selectorID + " ul.diagramNavigation").css('left', navigationBarPositionLeft);
};*/

DiagramCanvas.prototype.createNavigationBar = function (diagramID, corner) {
  var output, diagramNavigationID;
  output = [];
  diagramNavigationID = "diagramNavigation-diagram-" + diagramID;
  output.push("<ul id='" + diagramNavigationID + "' class='diagramNavigation " + corner + "'>");
  output.push("<li class='diagramNavigation-li'><a class='diagram-zoomin diagram-zoom tooltip-me" + corner + "' title='<div class=\"simpleText\">", $.i18n.prop("diagram_navigation_zoom_in"), "</div>'>", $.i18n.prop("diagram_navigation_zoom_in"), "</a></li>");
  output.push("<li class='diagramNavigation-li'><a class='diagram-zoomout diagram-zoom tooltip-me" + corner + "' title='<div class=\"simpleText\">", $.i18n.prop("diagram_navigation_zoom_out"), "</div>'>", $.i18n.prop("diagram_navigation_zoom_out"), "</a></li>");
  output.push("<li class='diagramNavigation-li'><a class='diagram-resize diagram-zoom tooltip-me" + corner + "' title='<div class=\"simpleText\">", $.i18n.prop("diagram_navigation_resize"), "</div>'>", $.i18n.prop("diagram_navigation_resize"), "</a></li>");

  output.push("<li class='diagramNavigation-li'><a class='diagram-search diagram-zoom tooltip-me" + corner + "' title='<div class=\"simpleText\">", $.i18n.prop("diagram_navigation_search"), "</div>'>", $.i18n.prop("diagram_navigation_search"), "</a></li>");
  output.push("</ul>");
  $(this.canvas).before(output.join(''));
  $("#" + diagramNavigationID + ' a.diagram-search').before("<input class='search-input-for-diagrams' id='" + this.searchID + "'/>");

  //var searchPosLeft = $("#" + diagramNavigationID + ' a.diagram-search').offset().left - $('#' + this.searchID).width() + $('#'+ diagramNavigationID).offset().left;
  //console.log(searchPosLeft, $("#" + diagramNavigationID + ' a.diagram-search').offset(), $('#' + this.searchID).width(), $('#'+ diagramNavigationID).offset());
  $('#' + this.searchID).hide();

  //$('#' + this.searchID).css('position', 'absolute').css('right', $('#' + this.searchID).offset().left);// ).addClass('ui-corner-all');

};

DiagramCanvas.prototype.initDiagramNavigation = function () {
  var mainSelector;
  
  mainSelector = "#" + this.selectorID;
  $(mainSelector + ' a.diagram-zoomin').button({
    "icons": {
      "primary": 'ui-icon-zoomin'
    },
    "text": false
  });
  $(mainSelector + ' a.diagram-zoomout').button({
    "icons": {
      "primary": 'ui-icon-zoomout'
    },
    "text": false
  });
  $(mainSelector + ' a.diagram-resize').button({
    "icons": {
      "primary": 'ui-icon-newwin'
    },
    "text": false
  });
  $(mainSelector + ' a.diagram-search').button({
    "icons": {
      "primary": 'ui-icon-search'
    },
    "text": false
  });
  $(mainSelector + ' a.diagram-zoom').tooltip({
    "delay": 250,
    "showURL": false
  });
  $(mainSelector + ' a.diagram-zoomin span').click(function () {
    this.camera.scale *= 0.9;
    this.camera.update();
    this.tick();
    return false;
  }.bind(this));
  $(mainSelector + ' a.diagram-zoomout span').click(function () {
    this.camera.scale *= 1.1;
    this.camera.update();
    this.tick();
    return false;
  }.bind(this));
  $(mainSelector + ' a.diagram-resize span').click(function () {
    this.setInitPositionAndScale();
    this.tick();
    return false;
  }.bind(this));
  $(mainSelector + ' a.diagram-search span').click(function () {
    $('#' + this.searchID).toggle('fast');
    return false;
  }.bind(this));

  //this.updateNavigationBarPosition();

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
