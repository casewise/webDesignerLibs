var DiagramJoiner = function (joiner, style) {
  this.joiner = joiner;
  this.paletteEntry = style;
};


DiagramJoiner.prototype.drawJoinerDot = function (ctx) {
  var dashedP = this.joiner.points[0];

  ctx.beginPath();
  $.each(this.joiner.points, function (i, p) {
    ctx.dashedLine(dashedP.x, dashedP.y, p.x, p.y, [5, 10]);
    dashedP = p;
  });
  ctx.stroke();
  ctx.closePath();
};

DiagramJoiner.prototype.drawJoinerSolid = function (ctx) {
  var p0 = this.joiner.points[0];

  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  $.each(this.joiner.points, function (i, p) {
    ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
  ctx.closePath();
};


DiagramJoiner.prototype.draw = function (ctx) {
  var strokeColor;

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000000";
  ctx.fillStyle = "#000000";

  /*  if (!_.isUndefined(this.style)){    
    ctx.strokeStyle = getColor(this.style.strokeColor); 
    }*/

  if (this.joiner.points.length > 0) {
    //console.log(this.paletteEntry.style.strokePattern);
    switch (this.paletteEntry.style.strokePattern) {
    case "Dot":
      this.drawJoinerDot(ctx);
      break;
    default:
      this.drawJoinerSolid(ctx);
    }
    if (this.joiner.points.length > 1) {
      this.drawJoinerSide(ctx, this.paletteEntry, "joinerToEndSymbol");
      this.drawJoinerSide(ctx, this.paletteEntry, "joinerFromEndSymbol");
    }
  }
};


DiagramJoiner.prototype.drawJoinerSide = function (ctx, paletteEntry, joinerSymbol) {
  if (paletteEntry[joinerSymbol] === "None") {
    return;
  }
  switch (paletteEntry[joinerSymbol]) {
  case 'FilledArrow':
    this.drawJoiner_FilledArrow(ctx, this.joiner, joinerSymbol);
    break;
  case 'OpenTriangle':
    this.drawJoiner_OpenTriangle(ctx, this.joiner, joinerSymbol);
    break;
  }
  ctx.stroke();
  ctx.fill();
};

DiagramJoiner.prototype.drawJoiner_OpenTriangle = function (ctx, joiner, side) {
  var p0, p1, v, arrowSize, d;
  if (side === "joinerToEndSymbol") {
    p0 = joiner.points[joiner.points.length - 2];
    p1 = joiner.points[joiner.points.length - 1];
  } else {
    p0 = joiner.points[1];
    p1 = joiner.points[0];
  }

  v = {
    "x": p1.x - p0.x,
    "y": p1.y - p0.y
  };
  d = Math.atan2(v.y, v.x);
  ctx.fillStyle = "#000";
  arrowSize = 8;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.save();
  ctx.translate(p1.x, p1.y);
  ctx.rotate(d);
  ctx.lineTo(-arrowSize, -arrowSize);
  ctx.lineTo(-arrowSize, +arrowSize);
  ctx.restore();
  ctx.closePath();
};

DiagramJoiner.prototype.drawJoiner_FilledArrow = function (ctx, joiner, side) {
  var p0, p1, v, arrowSize, d;
  if (side === "joinerToEndSymbol") {
    p0 = joiner.points[joiner.points.length - 2];
    p1 = joiner.points[joiner.points.length - 1];
  } else {
    p0 = joiner.points[1];
    p1 = joiner.points[0];
  }

  v = {
    "x": p1.x - p0.x,
    "y": p1.y - p0.y
  };
  d = Math.atan2(v.y, v.x);
  ctx.fillStyle = ctx.strokeStyle;
  arrowSize = 8;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.save();
  ctx.translate(p1.x, p1.y);
  ctx.rotate(d);
  ctx.lineTo(-arrowSize, -arrowSize);
  ctx.lineTo(-arrowSize, +arrowSize);
  ctx.restore();
  ctx.closePath();
};



var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
if (!_.isUndefined(CP) && CP.lineTo) {
  CP.dashedLine = function (x, y, x2, y2, da) {
    if (!da) da = [10, 5];
    this.save();
    var dx = (x2 - x),
      dy = (y2 - y);
    var len = Math.sqrt(dx * dx + dy * dy);
    var rot = Math.atan2(dy, dx);
    this.translate(x, y);
    this.moveTo(0, 0);
    this.rotate(rot);
    var dc = da.length;
    var di = 0,
      draw = true;
    x = 0;
    while (len > x) {
      x += da[di++ % dc];
      if (x > len) x = len;
      draw ? this.lineTo(x, 0) : this.moveTo(x, 0);
      draw = !draw;
    }
    this.restore();
  }
}
