

var DiagramShape = function(shape, style){
	this.shape = shape;
	this.style = style;
}

DiagramShape.prototype.getColor = function(color) {
	return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
};


DiagramShape.prototype.draw = function(ctx) {
	ctx.fillStyle = this.getColor(this.style.fillColor);
	ctx.fillRect(this.shape.X,  this.shape.Y , this.shape.W, this.shape.H);
	ctx.strokeStyle = this.getColor(this.style.strokeColor);
	ctx.strokeRect(this.shape.X,  this.shape.Y , this.shape.W, this.shape.H);
	ctx.fillStyle = "#000000";
	ctx.fillText(this.shape.link, this.shape.X + this.shape.W / 4,  this.shape.Y + this.shape.H / 2);
};