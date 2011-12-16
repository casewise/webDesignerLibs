

var DiagramShape = function(shape, style){
	this.shape = shape;
	this.style = style;
}

DiagramShape.prototype.getColor = function(color) {
	return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
};


DiagramShape.prototype.draw = function(ctx) {
	if (typeof this.style === "undefined"){
		ctx.fillStyle = 'rgb(0, 0, 0, 0.5)';
		ctx.strokeStyle = 'rgb(0, 0, 0, 0.5)';
	} else {
		ctx.fillStyle = this.getColor(this.style.fillColor);
		ctx.strokeStyle = this.getColor(this.style.strokeColor);
	}
	
	ctx.fillRect(this.shape.X,  this.shape.Y , this.shape.W, this.shape.H);
	ctx.strokeRect(this.shape.X,  this.shape.Y , this.shape.W, this.shape.H);
	ctx.fillStyle = "#000000";
	ctx.fillText(this.shape.link, this.shape.X + 5,  this.shape.Y + 10);
};