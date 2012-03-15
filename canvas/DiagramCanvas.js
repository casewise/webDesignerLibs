
var DiagramCanvas = function(diagramID, jsonDiagramFile, canvasID){
		
	this.objectTypesStyles = jsonDiagramFile.objectTypesStyles;
	this.diagramInfo = jsonDiagramFile.diagram;
	this.diagramShapes = [];	
	_.each(jsonDiagramFile.shapes, function(shape){
		this.diagramShapes.push(new DiagramShape(shape, this.getStyleForItem(shape)));
	}.bind(this));	

	this.joiners = [];	
	_.each(jsonDiagramFile.joiners, function(j){
		this.joiners.push(new DiagramJoiner(j, this.getStyleForItem(j)));
	}.bind(this));
	
	this.canvasID = canvasID;
	this.canvas = document.getElementById(this.canvasID);

	this.searchID = this.canvasID + '-search';
	$(this.canvas).before("<input class='search-input-for-diagrams' id='"+ this.searchID +"'/>");
	$("#" + this.searchID).keyup(function(){
		var value = $("#" + this.searchID).val();
		//if (value.length > 2){
			this.camera.update();
			this.tick();
		//}
	}.bind(this));

	this.createNavigationBar(diagramID, "ui-corner-all");
	this.initDiagramNavigation("#" + $(this.canvas).parent().attr('id'));

	if (isUnderIE9()){
		G_vmlCanvasManager.initElement(this.canvas);
		this.ctx = this.canvas.getContext('2d');
	} else {
		this.ctx = $('#' + this.canvasID)[0].getContext('2d');	
	}
	this.updateSize();
	
	$("body").append('<div id="debugger" style="position:absolute;top:0px;left:0px;background-color:#eee">debugger</div>')
	

	this.camera = new CanvasCamera(this.canvas, this);
	this.camera.scaleIsMoreThanScaleMax = function(camera){};

	this.setInitPositionAndScale();

	this.tick();
	$(this.canvas).mousemove(function(e){
		this.mouseMove(e);
	}.bind(this));

	$(this.canvas).mouseout(function(e){
		shapeToolTipRemove();	
	});	

	$(window).resize(function(){
		this.updateSize();
		this.setInitPositionAndScale();
		this.camera.update();
		this.tick();
	}.bind(this));
}

DiagramCanvas.prototype.updateSize = function() {
	this.ctx.canvas.width = $(this.canvas).width();
	this.ctx.canvas.height = $(this.canvas).height();
};

DiagramCanvas.prototype.setInitPositionAndScale = function() {
	var scaleX = 1 / (this.ctx.canvas.width / this.diagramInfo.size.w);
	var scaleY = 1 / (this.ctx.canvas.height / this.diagramInfo.size.h);
	var initScale = scaleX;
	if (scaleY > scaleX){
		initScale = scaleY;
	}
	this.camera.scale = initScale;
	var diffWidth = this.ctx.canvas.width - this.diagramInfo.size.w * 1/initScale;
	var diffHeight = this.ctx.canvas.height - this.diagramInfo.size.h * 1/initScale;

	if (diffWidth > 0 && scaleX < scaleY){
		this.camera.translate.set(diffWidth / 2, 0);
	}
	if (diffHeight > 0 && scaleX > scaleY){
		this.camera.translate.set(0, diffHeight / 2);
	}
};

DiagramCanvas.prototype.mouseMove = function(e) {
/*	shapeToolTipRemove();
	_.each(this.diagramShapes, function(shape){
		if (pointInBox(this.camera.scaledCanvasMousePosition, shape.shape) == true){
			new shapeToolTip(shape, e, this);
			return false;
		}
	}.bind(this));*/
};

DiagramCanvas.prototype.tick = function() {
		this.camera.update();
		this.camera.debug();
		this.camera.clearContext(this.ctx);
		this.ctx.save();	
		this.camera.transform(this.ctx);

		var searchValue = $("#" + this.searchID).val();
		//this.ctx.strokeRect(0, 0, this.diagramInfo.size.w, this.diagramInfo.size.h);
		_.each(this.diagramShapes, function(shape){
			shape.draw(this.ctx, searchValue);
		}.bind(this));
		_.each(this.joiners, function(joiner){
			joiner.draw(this.ctx);
		}.bind(this));
		this.ctx.restore();
};

DiagramCanvas.prototype.getStyleForItem = function(_item) {
	var objectPaletteEntryKey = _item.objectPaletteEntryKey;
	if (!_.isUndefined(objectPaletteEntryKey) && objectPaletteEntryKey){
		return this.objectTypesStyles[objectPaletteEntryKey];
	}
	return null;
};

function pointInBox(point, box){
	if (point.x < box.X) return false;
	if (point.x > box.X + box.W) return false;
	if (point.y < box.Y) return false;
	if (point.y > box.Y + box.H) return false;	
	return true;
}





DiagramCanvas.prototype.createNavigationBar = function(diagramID, corner){
	var output = Array();
	output.push("<ul id='diagramNavigation-diagram-" + diagramID + "' class='diagramNavigation " + corner + "'>");	
	output.push("<li><a class='diagram-zoomin diagram-zoom " + corner + "' title='<div class=\"simpleText\">Zoomer sur le diagramme</div>'>Zoomer sur le diagramme</a></li>");
	output.push("<li><a class='diagram-zoomout diagram-zoom " + corner + "' title='<div class=\"simpleText\">Dézoomer sur le diagramme</div>'>Dézoomer sur le diagramme</a></li>");	
	output.push("<li><a class='diagram-resize diagram-zoom " + corner + "' title='<div class=\"simpleText\">Redimensionner le diagramme</div>'>Redimensionner le diagramme</a></li>");	
	output.push("</ul>");
	$(this.canvas).before(output.join(''));
	//return output.join('');
}

DiagramCanvas.prototype.initDiagramNavigation = function(mainSelector){
	$(mainSelector + ' a.diagram-zoomin').button({icons :  {primary : 'ui-icon-zoomin'}, text : false});
	$(mainSelector + ' a.diagram-zoomout').button({icons :  {primary : 'ui-icon-zoomout'}, text : false});
	$(mainSelector + ' a.diagram-resize').button({icons :  {primary : 'ui-icon-newwin'}, text : false});
	$(mainSelector + ' a.diagram-zoom').tooltip({delay:250, showURL:false});

	$(mainSelector + ' a.diagram-zoomin').click(function(){
		this.camera.scale *= 0.9;
		this.camera.update();
		this.tick();
	}.bind(this));
	$(mainSelector + ' a.diagram-zoomout').click(function(){
		this.camera.scale *= 1.1;
		this.camera.update();
		this.tick();
	}.bind(this));
	$(mainSelector + ' a.diagram-resize').click(function(){
		this.setInitPositionAndScale();
		this.camera.update();
		this.tick();
	}.bind(this));		

}





function shapeToolTipRemove(){
	$('.tooltip-shape-canvas').remove();
}


function shapeToolTip(shape, _event, _diagramCanvas){
	shapeToolTipRemove();
	var tooltip = document.createElement('div');	
	var tooltipId = "tooltip-" + _diagramCanvas.canvasID;
	tooltip.id = tooltipId;
	$("body").append(tooltip);
	var tooltipTag = $('#' + tooltipId);
	tooltipTag.html(shape.shape.name)
		.addClass('tooltip-shape-canvas')
		.css('position', 'absolute')
		.css('display', 'block')
		.css('cursor', 'help')
		.css('padding', '10px')
		.css('color', getColor(shape.style.textColor))
		.css('background-color', getColor(shape.style.fillColor));

	var toolTipBoxWidth = tooltipTag.width();
	var toolTipBoxHeight = tooltipTag.height();

	var tooltipPositionX = _event.pageX;
	var tooltipPositionY = _event.pageY;
	//console.log($(window).width(), tooltipPositionX, toolTipBoxWidth);
	if (tooltipPositionX + toolTipBoxWidth + 100 > $(window).width()){
		tooltipPositionX = _event.pageX - toolTipBoxWidth - 20;
	}

	tooltipTag.css('left', tooltipPositionX)
		.css('top', _event.pageY + 5)

	
}

