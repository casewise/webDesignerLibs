/*global DiagramCanvas:true, Point:true, cwConfigs :true, cwAPI:true */

var DiagramDesignerAPI = {};
DiagramDesignerAPI.diagramDesignerCreateVerticalNode = function (objectsKey, paletteEntryKey, num, side, translateX, translateY, shapeSpaceY, setJoiner, children) {
  return {
    "objectsKey": objectsKey,
    "paletteEntryKey": paletteEntryKey,
    "num": num,
    "translate": {
      "x": translateX,
      "y": translateY
    },
    "shapeSpace": {
      "y": shapeSpaceY
    },
    "children": children,
    "setJoiner": setJoiner,
    "side": side,
    "design": "vertical"
  };
};

DiagramDesignerAPI.diagramDesignerCreateIncludeNode = function (objectsKey, paletteEntryKey, num, maxColumn, paddingTop, paddingBottom, paddingLeft, paddingRight, shapeSpaceX, shapeSpaceY, children) {
  return {
    "objectsKey": objectsKey,
    "paletteEntryKey": paletteEntryKey,
    "num": num,
    "maxColumn": maxColumn,
    "padding": {
      "top": paddingTop,
      "bottom": paddingBottom,
      "left": paddingLeft,
      "right": paddingRight
    },
    "shapeSpace": {
      "x": shapeSpaceX,
      "y": shapeSpaceY
    },
    "children": children,
    "design": "include"
  };
};

var DiagramDesigner = function (all_items, algo, selectorID, templateAbbreviation, parentSelector, name, height) {

  //console.log(parentSelector);
  this.height = height;
  var templateURL = cwConfigs.SITE_MEDIA_PATH + 'webdesigner/generated/diagram/json/template' + templateAbbreviation + '.' + cwConfigs.JSON_EXTENTION;
  this.all_items = all_items;
  this.parentSelector = parentSelector;
  this.algo = algo;

  this.json = {};
  this.json.diagram = {};
  this.json.diagram.object_id = Math.random();
  this.json.diagram.name = name;
  this.json.diagram.size = {
    "w": 100,
    "h": 100
  };

  this.mostTopLef = new Point(0, 0);

  this.json.joiners = [];

  this.selectorID = selectorID;
  this.loadTemplate(templateURL, function () {
    this.setupDiagram();
  }.bind(this));
};

DiagramDesigner.prototype.clean = function () {
  $('#' + this.selectorID).remove();
};

DiagramDesigner.prototype.setupDiagram = function () {
  this.doDesign(this.all_items);
  if (this.json.shapes.length > 0) {
    this.createCanvas();
  }
};


DiagramDesigner.prototype.createCanvas = function () {
  var dID, el, d;
  //  console.log('shapes', this.json.shapes);
  dID = Math.floor(Math.random() * 9999999999999);
  //console.log(dID);
  $("#" + this.parentSelector).append('<div id="' + this.selectorID + '" class="diagram-designer-zone" data-designid="' + dID + '"></div>');
  el = document.createElement('canvas');
  el.id = this.selectorID + '-canvas';
  $('#' + this.selectorID).css('min-height', this.height);
  $('#' + this.selectorID).append(el);
  $('#' + el.id).addClass("diagram-canvas");
  this.diagramCanvas = new DiagramCanvas(dID, this.json, this.selectorID);
  $('body').data('design' + dID, this);
  this.diagramCanvas.setInitPositionAndScale();

};


DiagramDesigner.prototype.doDesign = function (all_items) {
  var parentLevel, parentShape;

  parentLevel = DiagramDesignerAPI.diagramDesignerCreateIncludeNode("", "", 0, 0, 0, 0, 0, 0, 30, 30, []);
  parentShape = {
    "x": 0,
    "y": 0
  };

  this.json.shapes = this.doDefinedDesign(all_items, parentShape, parentLevel, this.algo.level0);
  this.updateDiagramSizeAfterShapesCreation();
  this.translateShapesAndJoinerIfRequired();
};


DiagramDesigner.prototype.translateShapesAndJoinerIfRequired = function () {
  // translate the shapes & joiners if required
  if (this.mostTopLef.x <= 0 && this.mostTopLef.y <= 0) {

    $.each(this.json.shapes, function (i, shape) {
      shape.x += -this.mostTopLef.x;
      shape.y += -this.mostTopLef.y;
    }.bind(this));

    _.each(this.json.joiners, function (joiner) {
      _.each(joiner.points, function (point) {
        point.x += -this.mostTopLef.x;
        point.y += -this.mostTopLef.y;
      }.bind(this));
    }.bind(this));
  }

};

DiagramDesigner.prototype.updateDiagramSizeAfterShapesCreation = function () {

  if (this.mostTopLef.x < 0) {
    this.json.diagram.size.w += -this.mostTopLef.x;
  }

  if (this.mostTopLef.y < 0) {
    this.json.diagram.size.h += -this.mostTopLef.y;
  }
};

DiagramDesigner.prototype.doDefinedDesign = function (item, parentShape, parentLevel, level) {
  var items = item.associations[level.objectsKey];
  if (_.isUndefined(items)) {
    return [];
  }
  if (items.length === 0){
     return [];
  }
  switch (level.design) {
  case "vertical":
    return this.createShapesVertical(items, level, parentShape, parentLevel);
  case "include":
    return this.createShapesInclude(items, level, parentShape, parentLevel);
  }
};

DiagramDesigner.prototype.loadTemplate = function (url, callback) {
  cwAPI.getJSONFile(url, function (JSONTemplateData) {
    this.json.objectTypesStyles = JSONTemplateData.objectTypesStyles;
    callback();
  }.bind(this), cwAPI.errorOnLoadPage);  
};


DiagramDesigner.prototype.createShapesVertical = function (objects, level, parentShape, parentLevel) {
  var shapes, paletteEntry, lastShape, x, y, shape;

  shapes = [];

  paletteEntry = this.json.objectTypesStyles[level.paletteEntryKey];
  switch (level.side) {
  case "left":
    x = parentShape.x - level.translate.x - paletteEntry.defaultWidth;
    break;
  case "right":
    x = parentShape.x + level.translate.x + paletteEntry.defaultWidth;
    break;
  }
  y = parentShape.y + level.translate.y;

  lastShape = null;
  $.each(objects, function (shapeIndex, item) {
    shape = this.createShape(item, paletteEntry, level);
    if (lastShape !== null) {
      shape.x = lastShape.x;
      shape.y = lastShape.y + lastShape.h + level.shapeSpace.y;
    } else {
      shape.x = x;
      shape.y = y;
    }
    shapes.push(shape);
    this.updateParentSize(level, parentLevel, shape, parentShape);

    // set joiners
    if (level.setJoiner) {
      var joiner = {
        "objectPaletteEntryKey": "CONNECTOR|0",
        "points": []
      };
      switch (level.side) {
      case "left":
        joiner.points.push({
          "x": shape.x + shape.w,
          "y": shape.y + shape.h / 2
        });
        joiner.points.push({
          "x": parentShape.x,
          "y": shape.y + shape.h / 2
        });
        break;
      case "right":
        joiner.points.push({
          "x": parentShape.x + parentShape.w,
          "y": shape.y + shape.h / 2
        });
        joiner.points.push({
          "x": shape.x,
          "y": shape.y + shape.h / 2
        });
        break;
      }
      this.json.joiners.push(joiner);
    }



    lastShape = shape;
    this.updateDiagramSize(shape);

    if (shape.x < this.mostTopLef.x) {
      this.mostTopLef.x = shape.x;
    }
    if (shape.y < this.mostTopLef.y) {
      this.mostTopLef.y = shape.y;
    }
  }.bind(this));

  return shapes;
};

DiagramDesigner.prototype.createShape = function (item, paletteEntry, level) {
  var shape = {
    "w": paletteEntry.defaultWidth,
    "h": paletteEntry.defaultHeight,
    "objectPaletteEntryKey": level.paletteEntryKey
  };
  shape.name = item.name;
  shape.cwObject = {};
  shape.cwObject.properties = item.properties;
  return shape;
};

DiagramDesigner.prototype.createShapesInclude = function (objects, level, parentShape, parentLevel) {
  var shapes, x, y, maxColumn, shape, row, col, paletteEntry, lastShape, maxRowHeight;

  shapes = [];
  paletteEntry = this.json.objectTypesStyles[level.paletteEntryKey];
  x = parentShape.x;
  y = parentShape.y;
  maxColumn = level.maxColumn;

  lastShape = null;
  maxRowHeight = paletteEntry.defaultHeight;

  $.each(objects, function (shapeIndex, item) {


    shape = this.createShape(item, paletteEntry, level);

    row = Math.floor(shapeIndex / maxColumn);
    col = shapeIndex % maxColumn;


    if (col === 0) {
      if (lastShape !== null) {
        shape.x = parentShape.x + parentLevel.padding.left;
        shape.y = lastShape.y + maxRowHeight + level.shapeSpace.y;
      } else {
        shape.x = parentShape.x + parentLevel.padding.left;
        shape.y = parentShape.y + parentLevel.padding.top;
      }
    } else {

      if (lastShape !== null) {
        shape.x = lastShape.x + lastShape.w + level.shapeSpace.x;
        shape.y = lastShape.y;
      } else {
        shape.x = col * paletteEntry.defaultWidth + parentShape.x;
        shape.y = row * paletteEntry.defaultHeight + parentShape.y;
      }
    }


    shapes.push(shape);



    _.each(level.children, function (childrenLevel) {
      var childShapes = this.doDefinedDesign(item, shape, level, childrenLevel);
      shapes = shapes.concat(childShapes);
    }.bind(this));

    this.updateParentSize(level, parentLevel, shape, parentShape);

    //console.log(o);
    /*    if (!_.isUndefined(item.b)) {
      //var childShapes = this.createShapesInclude(item.b, "B|0", shape, level + 1);
      //console.log('childShapes', childShapes);
      //shapes = shapes.concat(childShapes);
    }*/
    lastShape = shape;

    if (maxRowHeight < shape.h) {
      maxRowHeight = shape.h;
    }


    this.updateDiagramSize(shape);
  }.bind(this));



  return shapes;
};



DiagramDesigner.prototype.updateParentSize = function (level, parentLevel, shape, parentShape) {
  switch (level.design) {
  case "include":
    // RESIZE PARENT
    if (level.num > 0) {
      if (shape.x + shape.w > parentShape.x + parentShape.w) {
        parentShape.w = shape.x + shape.w - parentShape.x + parentLevel.padding.right;
      }
      if (shape.y + shape.h > parentShape.y + parentShape.h) {
        parentShape.h = shape.y + shape.h - parentShape.y + parentLevel.padding.bottom;
      }
    }
    break;
  case "vertical":

    if (shape.y + shape.h > parentShape.y + parentShape.h) {
      parentShape.h = shape.y + shape.h - parentShape.y;
    }

    break;
  }


};


DiagramDesigner.prototype.updateDiagramSize = function (shape) {
  if (shape.x + shape.w > this.json.diagram.size.w) {
    this.json.diagram.size.w = shape.x + shape.w;
  }
  if (shape.y + shape.h > this.json.diagram.size.h) {
    this.json.diagram.size.h = shape.y + shape.h;
  }
};
