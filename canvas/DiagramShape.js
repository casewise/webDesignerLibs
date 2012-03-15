//(function () {
  var DiagramShape, ratioMMToCanvasSize;

  // Magic number for padding inside boxes
  ratioMMToCanvasSize = 8192 / 2165;


  function getColor(color, alpha) {
    return 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + alpha + ')';
  }
  // create the draw engine

  function DrawEngine(ctx) {
    this.ctx = ctx;
  }

  // DEFAULT
  DrawEngine.prototype.normalRect = function (ctx, x, y, width, height) {
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
  };

  //11
  DrawEngine.prototype.SH_LIGHTNING = function (ctx, x, y, width, height) {
    var space, XSpace;

    ctx.beginPath();
    space = height * 0.10;
    XSpace = 0.125;
    ctx.moveTo(x, y + space);
    ctx.lineTo(x + width * (0.5 + XSpace), y - space);
    ctx.lineTo(x + width * (0.5 - XSpace), y + space);

    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height - space);

    ctx.lineTo(x + width * (0.5 - XSpace), y + space + height);
    ctx.lineTo(x + width * (0.5 + XSpace), y - space + height);
    ctx.lineTo(x, y + height + space);

    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  };

  // 2
  DrawEngine.prototype.SH_RIGHT_ARROW = function (ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width * 0.875, y);
    ctx.lineTo(x + width * 0.875, y - height * 0.2);
    ctx.lineTo(x + width, y + height * 0.5);
    ctx.lineTo(x + width * 0.875, y + height * 1.2);
    ctx.lineTo(x + width * 0.875, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  };

  // 25
  DrawEngine.prototype.SH_DIAMOND = function (ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.moveTo(x + width * 0.5, y);
    ctx.lineTo(x + width, y + height * 0.5);
    ctx.lineTo(x + width * 0.5, y + height);
    ctx.lineTo(x, y + height * 0.5);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  };

  //16
  DrawEngine.prototype.SH_RR_ARROW = function (ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width * 0.875, y);
    ctx.lineTo(x + width, y + height * 0.5);
    ctx.lineTo(x + width * 0.875, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + width * 0.125, y + height * 0.5);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  };

  // 7
  DrawEngine.prototype.SH_ROUND_CORNER_RECT = function (ctx, x, y, width, height, radius) {
    if (_.isUndefined(radius)) {
      radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  };


  DiagramShape = function (shape, paletteEntry) {
    this.shape = shape;
    this.paletteEntry = paletteEntry;
  };



  DiagramShape.prototype.drawSymbol = function (ctx, alpha) {
    var symbol, drawEngine;

    drawEngine = new DrawEngine(ctx);
    symbol = 0;

    // generic style
    if (!_.isUndefined(this.paletteEntry) && this.paletteEntry) {
      symbol = this.paletteEntry.symbol;
      ctx.fillStyle = getColor(this.paletteEntry.fillColor, alpha);
      ctx.strokeStyle = getColor(this.paletteEntry.strokeColor, alpha);
      ctx.lineWidth = this.paletteEntry.lineWidth;
    }
    // custom symbol
    if (!_.isUndefined(this.shape.customSymbol)) {
      symbol = this.shape.customSymbol;
    }
    // custom styles
    if (!_.isUndefined(this.shape.customStyle) && this.shape.customStyle) {
      ctx.fillStyle = getColor(this.shape.customStyle.fillColor, alpha);
      ctx.strokeStyle = getColor(this.shape.customStyle.strokeColor, alpha);
      ctx.lineWidth = this.shape.customStyle.lineWidth;
    }
    switch (symbol) {
    case 2:
      drawEngine.SH_RIGHT_ARROW(ctx, this.shape.x, this.shape.y, this.shape.w, this.shape.h);
      break;
    case 11:
      drawEngine.SH_LIGHTNING(ctx, this.shape.x, this.shape.y, this.shape.w, this.shape.h);
      break;
    case 16:
      drawEngine.SH_RR_ARROW(ctx, this.shape.x, this.shape.y, this.shape.w, this.shape.h);
      break;
    case 100:
    case 25:
      drawEngine.SH_DIAMOND(ctx, this.shape.x, this.shape.y, this.shape.w, this.shape.h);
      break;
    case 7:
      drawEngine.SH_ROUND_CORNER_RECT(ctx, this.shape.x, this.shape.y, this.shape.w, this.shape.h, 5);
      break;
    default:
      drawEngine.normalRect(ctx, this.shape.x, this.shape.y, this.shape.w, this.shape.h);
    }
  };


  DiagramShape.prototype.getRegionSize = function (region) {
    var regionSize = {};
    regionSize.x = this.shape.x + region.x * ratioMMToCanvasSize;
    regionSize.y = this.shape.y + region.y * ratioMMToCanvasSize;
    regionSize.w = region.w * ratioMMToCanvasSize;
    regionSize.h = region.h * ratioMMToCanvasSize;
    if (region.leftType === "%") {
      regionSize.x = this.shape.x + (this.shape.w * (region.x / 100));
    }
    if (region.topType === "%") {
      regionSize.y = this.shape.y + this.shape.h * (region.y / 100);
    }
    if (region.widthType === "%") {
      regionSize.w = this.shape.w * (region.w / 100);
    }
    if (region.widthType === "fill") {
      regionSize.w = this.shape.w - (regionSize.x - this.shape.x);
    }
    if (region.heightType === "%") {
      regionSize.h = this.shape.h * (region.h / 100);
    }
    if (region.heightType === "fill") {
      regionSize.h = this.shape.h - (regionSize.y - this.shape.y);
    }
    return regionSize;
  };

  DiagramShape.prototype.getRegionTextSize = function (regionSize, fontSize) {
    var textSize = {};
    textSize.x = regionSize.x + ratioMMToCanvasSize;
    textSize.y = regionSize.y + fontSize + ratioMMToCanvasSize;
    textSize.fontSize = fontSize * 1.5;
    textSize.w = regionSize.w - 2 * ratioMMToCanvasSize;
    textSize.h = regionSize.h - 2 * ratioMMToCanvasSize;
    return textSize;
  };

  DiagramShape.prototype.drawRegions = function (ctx, alpha) {
    var regionSize, textSize;
    _.each(this.paletteEntry.regions, function (region) {
      if (region.type === "none") {
        return;
      }
      if (region.type === "property_value") {
        regionSize = this.getRegionSize(region);
        textSize = this.getRegionTextSize(regionSize, region.style.fontSize);
        ctx.font = region.style.font;
        ctx.fillStyle = getColor(region.style.textColor, alpha);


        /*        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(left + ratioMMToCanvasSize, top + ratioMMToCanvasSize, width - 2 * ratioMMToCanvasSize, height - 2 * ratioMMToCanvasSize);
*/
        var _fontStyle = region.style.fontStyle;
        if (_fontStyle === "plain") {
          _fontStyle = "";
        }
        // _fontStyle + " " + region.style.fontSize + "pt " + region.style.fontFamily;
        if (!_.isUndefined(region.style.textColor)) {
          ctx.fillStyle = getColor(region.style.textColor, alpha);
        }

        //ctx.textAlign = region.horizontalAlignment;
        //printAtWordWrap(ctx, this.shape.name, left + ratioMMToCanvasSize, top + region.style.fontSize + ratioMMToCanvasSize, region.style.fontSize * 1.5, width - 4 * ratioMMToCanvasSize, region.horizontalAlignment, region.verticalAlignment);
        this.wrapText(ctx, this.shape.properties[region.propertyScriptName], textSize.x, textSize.y, textSize.fontSize, textSize.w, textSize.h, region.horizontalAlignment, region.verticalAlignment);
        //ctx.fillText(this.shape.name, left,  top + 8);          
      }
    }.bind(this));
  };


  DiagramShape.prototype.draw = function (ctx, searchValue) {
    var alpha, textColor, textRegionSize;

    alpha = 1;
    if (!_.isUndefined(searchValue) && searchValue.length > 2 && this.shape.name.toLowerCase().indexOf(searchValue.toLowerCase()) === -1) {
      alpha = 0.125;
    }

    ctx.fillStyle = 'rgb(0, 0, 0, ' + alpha + ')';
    ctx.strokeStyle = 'rgb(0, 0, 0, ' + alpha + ')';



    /*  ctx.fillStyle = 'rgb(0, 0, 0, ' + alpha + ')';
  ctx.fillText(this.shape.name, this.shape.x,  this.shape.y); 
*/
    //return;
    //var strokeStyle = 'rgb(0, 0, 0, ' + alpha + ')';
    //var textColor = 'rgb(0, 0, 0, ' + alpha + ')';
    //var symbol = 0;
    /*  ctx.lineJoin = 'miter';
  ctx.lineCap = 'butt';
  ctx.miterLimit = 10 * 1;  
  ctx.lineScale_ = 1;*/
    //ctx.lineWidth = 1;


    // draw shape
    // background
    // custom style
    // or 
    // main style
    // border 
    // draw symbol
    /*    if (!_.isUndefined(this.paletteEntry) && this.paletteEntry) {
      ctx.fillStyle = getColor(this.paletteEntry.fillColor, alpha);
      ctx.strokeStyle = getColor(this.paletteEntry.strokeColor, alpha);
      ctx.lineWidth = this.paletteEntry.lineWidth;
      textColor = getColor(this.paletteEntry.textColor, alpha);
    } else {

    }
*/
    /*    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
*/
    this.drawSymbol(ctx, alpha);
    this.drawRegions(ctx, alpha);
    // draw custom text
    if (!_.isUndefined(this.paletteEntry) && this.paletteEntry && this.paletteEntry.displayText) {
      ctx.font = this.paletteEntry.style.font;
      ctx.fillStyle = getColor(this.paletteEntry.style.textColor, alpha);
      textRegionSize = this.getRegionTextSize(this.shape, this.paletteEntry.style.fontSize);
      this.wrapText(ctx, this.shape.name, textRegionSize.x, textRegionSize.y , textRegionSize.fontSize, textRegionSize.w, textRegionSize.h, "center", "middle");
    }

    /*

    if (!_.isUndefined(this.shape.customStyle)) {
      ///region.style.fontSize    
      //
      //ctx.font = region.style.fontStyle + " " + region.style.fontSize + "pt " + region.style.fontFamily;
      ctx.fillStyle = getColor(this.shape.customStyle.textColor, alpha);
      var _fontSize = this.shape.customStyle.fontSize;
      ctx.font = this.shape.customStyle.font;
      wrapText(ctx, this.shape.name, this.shape.x + ratioMMToCanvasSize, this.shape.y + _fontSize * 1.5 + ratioMMToCanvasSize, _fontSize * 1.5, this.shape.w - 2 * ratioMMToCanvasSize, this.shape.h - 2 * ratioMMToCanvasSize, "center", "middle");
    } else if (!_.isUndefined(this.paletteEntry) && this.paletteEntry) {

    } else {
      ctx.fillStyle = textColor;
      ctx.fillText(this.shape.name, this.shape.x, this.shape.y);
    }*/
  };



  DiagramShape.prototype.getLinesNumberFromText = function (context, text, maxWidth) {
    var words = text.split(" "),
      line = "",
      num = 1,
      n, testLine, metrics, testWidth;
    for (n = 0; n < words.length; n += 1) {
      testLine = line + words[n] + " ";
      metrics = context.measureText(testLine);
      testWidth = metrics.width;
      if (testWidth > maxWidth) {
        line = words[n] + " ";
        num += 1;
      } else {
        line = testLine;
      }
    }
    return num;
  };

  DiagramShape.prototype.method_name = function (first_argument) {
    // body...
  };
  DiagramShape.prototype.wrapText = function (context, text, x, y, lineHeight, maxWidth, maxHeight, align, valign) {
    var numLine, blockHeight, words, line = "",
      testLine, metrics, testWidth, n;
    context.textAlign = align;
    if (align === "center") {
      x += maxWidth / 2;
    }

    if (valign === "middle") {
      numLine = this.getLinesNumberFromText(context, text, maxWidth);
      blockHeight = lineHeight * numLine;
      y += (maxHeight - blockHeight) / 2;
    }
    words = text.split(" ");
    line = "";

    for (n = 0; n < words.length; n += 1) {
      testLine = line + words[n] + " ";
      metrics = context.measureText(testLine);
      testWidth = metrics.width;
      if (testWidth > maxWidth) {
        context.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  };



//}(this));
