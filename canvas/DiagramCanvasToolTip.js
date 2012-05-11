
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
