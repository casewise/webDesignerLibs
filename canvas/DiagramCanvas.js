
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


	$("body").append('<div id="' +tooltipId + '">' + diagramID + '</div>');
	var tooltipId = "tooltip-" + this.canvasID;
	this.tooltip = $('#' + tooltipId);
	this.tooltip.css('position', 'absolute');
	this.tooltip.css('display', 'none');
	this.tooltip.css('cursor', 'help');

	this.camera = new DiagramCamera(this.canvas, this.tooltip);


	


	this.tick();
}



DiagramCanvas.prototype.mouseMove = function(e) {
		//console.log('move');
	_.each(this.diagramShapes, function(shape){
		if (pointInBox(this.canvasMousePosition, shape.shape) == true){
			console.log('inside');
			this.tooltip.html(this.canvasID + ", " + shape.shape.link + ": " + this.canvasMousePosition.x + ', ' + this.canvasMousePosition.y);
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
		this.camera.update(this.canvas);

		this.ctx.clearRect(0, 0, this.camera.canvasScaledSize.x, this.camera.canvasScaledSize.y);
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


