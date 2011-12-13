
var DiagramJoiner = function(_joiner){
	this.joiner = _joiner;
}

DiagramJoiner.prototype.draw = function(ctx) {
	if (this.joiner.points.length > 0){
		ctx.beginPath();
		var p0 = this.joiner.points[0];
		ctx.moveTo(p0.x, p0.y);
		_.each(this.joiner.points, function(p){				
			ctx.lineTo(p.x, p.y);
		});		
		ctx.stokeStyle = '#000';
		ctx.stroke();
		//ctx.lineWidth = 5;
		ctx.closePath();

	}


};