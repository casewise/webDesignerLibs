//(function () {

  var DiagramJoiner = function (joiner, style) {
    this.joiner = joiner;
    this.style = style;
  };


  DiagramJoiner.prototype.draw = function (ctx) {
    var strokeColor, p0, p1, d, arrowSize, v;
    strokeColor = "#000";
    p0 = {};
    ctx.lineWidth = 1;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;

    /*  if (!_.isUndefined(this.style)){    
    ctx.strokeStyle = getColor(this.style.strokeColor); 
    }*/

    if (this.joiner.points.length > 0) {
      ctx.beginPath();
      p0 = this.joiner.points[0];
      ctx.moveTo(p0.x, p0.y);
      $.each(this.joiner.points, function (i, p) {
        ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.closePath();
      //console.log(this.style);
      if (this.joiner.points.length > 1) {
        switch (this.style.joinerToEndSymbol) {
        case 'FilledArrow':
          drawJoiner_FilledArrow(ctx, this.joiner);
          break;
        case 'OpenTriangle':
          drawJoiner_OpenTriangle(ctx, this.joiner);
          break;
        }
      }

    }
  };


  function drawJoiner_OpenTriangle(ctx, joiner) {
    var p0, p1, v, arrowSize, d;
    p0 = joiner.points[joiner.points.length - 2];
    p1 = joiner.points[joiner.points.length - 1];
    v = {
      "x": p1.x - p0.x,
      "y": p1.y - p0.y
    };
    d = Math.atan2(v.y, v.x);
    ctx.fillStyle = "#000";
    arrowSize = 10;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.save();
    ctx.translate(p1.x, p1.y);
    ctx.rotate(d);
    ctx.lineTo(-arrowSize, -arrowSize);
    ctx.lineTo(-arrowSize, +arrowSize);
    ctx.restore();
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }

  function drawJoiner_FilledArrow(ctx, joiner) {
    var p0, p1, v, arrowSize, d;
    p0 = joiner.points[joiner.points.length - 2];
    p1 = joiner.points[joiner.points.length - 1];
    v = {
      "x": p1.x - p0.x,
      "y": p1.y - p0.y
    };
    d = Math.atan2(v.y, v.x);
    ctx.fillStyle = ctx.strokeStyle;
    arrowSize = 10;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.save();
    ctx.translate(p1.x, p1.y);
    ctx.rotate(d);
    ctx.lineTo(-arrowSize, -arrowSize);
    ctx.lineTo(-arrowSize, +arrowSize);
    ctx.restore();
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }

//}());
