
var DiagramCanvas = function(diagramID, jsonDiagramFile, canvasID){
	this.objectTypesStyles = jsonDiagramFile.objectTypesStyles;
	this.diagramShapes = [];	
	_.each(jsonDiagramFile.shapes, function(shape){
		this.diagramShapes.push(new DiagramShape(shape, this.getStyleForShape(shape)));
	}.bind(this));	

	this.joiners = [];	
	_.each(jsonDiagramFile.joiners, function(j){
		this.joiners.push(new DiagramJoiner(j));
	}.bind(this));
	
	this.canvasID = canvasID;
	this.canvas = document.getElementById(this.canvasID);
	
	this.ctx = $('#' + this.canvasID)[0].getContext('2d');
	this.ctx.canvas.width = $(this.canvas).width();
	this.ctx.canvas.height = $(this.canvas).height();


	var tooltipId = "tooltip-" + this.canvasID;
	$("body").append('<div id="' +tooltipId + '">' + diagramID + '</div>');
	$("body").append('<div id="debugger" style="position:absolute;top:0px;left:0px;background-color:#eee">debugger</div>')
	
	this.tooltip = $('#' + tooltipId);
	this.tooltip.css('position', 'absolute');
	this.tooltip.css('display', 'none');
	this.tooltip.css('cursor', 'help');

	this.camera = new CanvasCamera(this.canvas);


	$(this.canvas).mousemove(function(e){
		this.mouseMove(e);
	}.bind(this));

	this.tick();
}



DiagramCanvas.prototype.mouseMove = function(e) {
		this.tooltip.css('display', 'none');
		this.tooltip.css('cursor', 'default');
		this.tooltip.html("");
	_.each(this.diagramShapes, function(shape){
		if (pointInBox(this.camera.scaledCanvasMousePosition, shape.shape) == true){
			//console.log('inside', shape.shape);
			this.tooltip.html(this.canvasID + ", " + shape.shape.link + ": " + this.camera.canvasMousePosition.x + ', ' + this.camera.canvasMousePosition.y);
			this.tooltip.css('cursor', 'help');
			this.tooltip.css('display', 'block');
			this.tooltip.css('left', e.pageX + 5);
			this.tooltip.css('top', e.pageY + 5);			
			this.tooltip.css('background-color', 'green');
			return false;
		}
	}.bind(this));
};

DiagramCanvas.prototype.tick = function() {
		requestAnimFrame(this.tick.bind(this));
		this.camera.update();
		this.camera.debug();
		this.camera.clearContext(this.ctx);

		this.ctx.save();	
		this.camera.transform(this.ctx);

		this.ctx.strokeRect(0, 0, 1000, 1000);

		_.each(this.diagramShapes, function(shape){
			shape.draw(this.ctx);
		}.bind(this));

		_.each(this.joiners, function(joiner){
			joiner.draw(this.ctx);
		}.bind(this));

		this.ctx.restore();
};

DiagramCanvas.prototype.getStyleForShape = function(shape) {
	return this.objectTypesStyles[shape.objectTypeName];
};



function pointInBox(point, box){
	if (point.x < box.X) return false;
	if (point.x > box.X + box.W) return false;
	if (point.y < box.Y) return false;
	if (point.y > box.Y + box.H) return false;	
	return true;
}


