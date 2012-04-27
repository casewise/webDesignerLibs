/*global cwAPI : true */

var DiagramShape, ratioMMToCanvasSize;

// Magic number for padding inside boxes
ratioMMToCanvasSize = 8192 / 2165;
// create the draw engine

function DrawEngine(ctx) {
  this.ctx = ctx;
}

// DEFAULT
DrawEngine.prototype.normalRect = function (ctx, x, y, width, height) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();
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
};


DrawEngine.prototype.SH_CIRCLE_SET = function (ctx, x, y, width) {
  var r = width / 2;
  ctx.beginPath();
  ctx.arc(x + r, y + r, r, 0, Math.PI * 2, true);
  ctx.closePath();
};

// 25
DrawEngine.prototype.SH_DIAMOND = function (ctx, x, y, width, height) {
  ctx.beginPath();
  ctx.moveTo(x + width * 0.5, y);
  ctx.lineTo(x + width, y + height * 0.5);
  ctx.lineTo(x + width * 0.5, y + height);
  ctx.lineTo(x, y + height * 0.5);
  ctx.closePath();
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
};


DiagramShape = function (shape, paletteEntry) {
  this.shape = shape;
  this.shape.name = cwAPI.removeSearchEngineZone(this.shape.name);
  this.paletteEntry = paletteEntry;
};



DiagramShape.prototype.drawSymbolPath = function (ctx, symbol) {
  drawEngine = new DrawEngine(ctx);
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
  case 209:
    drawEngine.SH_CIRCLE_SET(ctx, this.shape.x, this.shape.y, this.shape.w);
    break;
  default:
    drawEngine.normalRect(ctx, this.shape.x, this.shape.y, this.shape.w, this.shape.h);
  }
};


DiagramShape.prototype.getSymbol = function () {
  var symbol;
  if (!_.isUndefined(this.paletteEntry) && this.paletteEntry) { // generic style
    symbol = this.paletteEntry.symbol;
  }
  // custom symbol
  if (!_.isUndefined(this.shape.customSymbol)) {
    symbol = this.shape.customSymbol;
  }
  return symbol;
}


DiagramShape.prototype.drawSymbol = function (ctx) {
  var symbol, drawEngine, usedStyle;


  symbol = this.getSymbol();

  if (!_.isUndefined(this.shape.customStyle) && this.shape.customStyle) { // custom styles
    usedStyle = this.shape.customStyle;
  } else if (!_.isUndefined(this.paletteEntry) && this.paletteEntry) { // generic style
    usedStyle = this.paletteEntry.style;
  }

  //  console.log(usedStyle);
  if (_.isUndefined(usedStyle)) {
    usedStyle = {};
    usedStyle.fillColor = "#FFFF80";
    usedStyle.strokeColor = "#000000";
    usedStyle.lineWidth = 1;
    usedStyle.hasGradient = false;
  }


  ctx.strokeStyle = usedStyle.strokeColor;
  ctx.lineWidth = usedStyle.lineWidth / ratioMMToCanvasSize;

  if (usedStyle.hasGradient === true) {
    //console.log('has gradient', usedStyle.gradientDir, this.shape,  usedStyle, lingrad);
    var lingrad;

    //    lingrad = ctx.createLinearGradient(50,0, 200, 100);
    lingrad = ctx.createLinearGradient(this.shape.x, this.shape.y, this.shape.x + this.shape.w, this.shape.y + this.shape.h);
    switch (usedStyle.gradientDir) {
    case 4:
      //"ForwardDiagonal" :
      //lingrad = ctx.createLinearGradient(this.shape.x, this.shape.y, this.shape.x, this.shape.y + this.shape.h);
      break;
    case 1:
      //lingrad = ctx.createLinearGradient(this.shape.x, this.shape.y, this.shape.x, this.shape.y + this.shape.h);
      break;
    case 2:
      break;
    case 3:
      break;
    default:
      //lingrad = ctx.createLinearGradient(0, this.shape.w, 0, this.shape.h);
    }

    //console.log(usedStyle.gradientSize);
    //var gradientSize = 0.9; //usedStyle.gradientSize / 100
    //lingrad.addColorStop(0, usedStyle.gradientFromFill);    
    lingrad.addColorStop(0, usedStyle.gradientFromFill);
    lingrad.addColorStop(1, usedStyle.gradientToFill);
    ctx.fillStyle = lingrad;
    //console.log(lingrad);
  } else {
    ctx.fillStyle = usedStyle.fillColor;
  }
  this.drawSymbolPath(ctx, symbol);

  if (cwAPI.isUndefined(usedStyle.fillPattern) || usedStyle.fillPattern !== "Transparent") {
    ctx.fill();
  }
  if (cwAPI.isUndefined(usedStyle.strokePattern) || usedStyle.strokePattern !== "-1") {
    ctx.stroke();
  }

};

/*DiagramShape.prototype.getColor = function (color {
  return color; 
};*/



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

DiagramShape.prototype.drawRegions = function (ctx) {
  var regionSize, textSize;
  if (_.isUndefined(this.paletteEntry)) {
    return;
  }
  _.each(this.paletteEntry.regions, function (region) {
    if (region.type === "none") {
      return;
    }
    if (region.type === "property_value") {
      regionSize = this.getRegionSize(region);

      textSize = this.getRegionTextSize(regionSize, region.style.fontSize);
      if (!_.isUndefined(region.style.fillPattern) && region.style.fillPattern === "Solid") {
        ctx.fillStyle = region.style.fillColor;
        ctx.fillRect(regionSize.x, regionSize.y, regionSize.w, regionSize.h);
      }
      ctx.font = region.style.font;
      ctx.fillStyle = region.style.textColor;

      if (!_.isUndefined(region.style.textColor)) {
        ctx.fillStyle = region.style.textColor;
      }
      this.wrapText(ctx, this.shape.cwObject.properties[region.propertyScriptName], textSize.x, textSize.y, textSize.fontSize, textSize.w, textSize.h, region.horizontalAlignment, region.verticalAlignment);
    }
  }.bind(this));
};


DiagramShape.prototype.drawText = function (ctx, text, style) {
  var textRegionSize;
  // draw custom text
  ctx.font = style.font;
  ctx.fillStyle = style.textColor;

  textRegionSize = this.getRegionTextSize(this.shape, style.fontSize);
  this.wrapText(ctx, this.shape.name, textRegionSize.x, textRegionSize.y, textRegionSize.fontSize, textRegionSize.w, textRegionSize.h, this.paletteEntry.horizontalAlignment, this.paletteEntry.verticalAlignment);
};

DiagramShape.prototype.draw = function (ctx, searchValue) {
  var alpha, textColor, textStyle;


  alpha = 1;
  if (!_.isUndefined(searchValue) && searchValue.length > 1 && this.shape.name.toLowerCase().indexOf(searchValue.toLowerCase()) === -1) {
    alpha = 0.125;
  }
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "#000000";


  // draw shape
  // background
  // custom style
  // or 
  // main style
  // border 
  // draw symbol
  this.drawSymbol(ctx);
  this.drawRegions(ctx);


  if (!_.isUndefined(this.paletteEntry) && this.paletteEntry && this.paletteEntry.displayText) {
    // use custom class if exists
    textStyle = this.paletteEntry.style;
    if (!_.isUndefined(this.shape.customStyle) && this.shape.customStyle) {
      textStyle = this.shape.customStyle;
    }
    this.drawText(ctx, this.paletteEntry.displayText, textStyle);
  }

};



DiagramShape.prototype.getLinesNumberFromText = function (context, text, maxWidth, lines) {
  var words, line, num, n, testLine, metrics, testWidth;

  words = text.split(" ");
  line = "";
  num = 1;
  for (n = 0; n < words.length; n += 1) {
    testLine = line + words[n] + " ";
    metrics = context.measureText(testLine);
    testWidth = metrics.width;
    if (testWidth > maxWidth) {
      lines.push(line);
      line = words[n] + " ";
      num += 1;
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  return num;
};

DiagramShape.prototype.wrapText = function (context, text, x, y, lineHeight, maxWidth, maxHeight, align, valign) {
  var numLine, blockHeight, words, line, testLine, metrics, testWidth, n, lines;

  lineHeight -= 1.5;
  lines = [];
  line = "";
  numLine = this.getLinesNumberFromText(context, text, maxWidth, lines);
  context.textAlign = align;
  if (align === "center") {
    x += maxWidth / 2;
  }

  if (valign === "middle") {
    blockHeight = lineHeight * numLine;
    y += (maxHeight - blockHeight) / 2;
  }
  words = text.split(" ");
  line = "";
  if (numLine * lineHeight > maxHeight) {
    var limitLineNum = Math.floor(maxHeight / lineHeight);
    for (n = limitLineNum + 1; n < numLine; n += 1) {
      lines[n] = "";
    }
    if (limitLineNum !== lines.length - 1) {
      lines[limitLineNum] = lines[limitLineNum].replace(/.{3}$/gi, "...");
    }
  }

  _.each(lines, function (line) {
    context.fillText(line, x, y);
    y += lineHeight;
  });
};
