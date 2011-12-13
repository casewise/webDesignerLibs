var DiagramCamera = function(canvas, tooltip){

	this.canvas = canvas;
	this.tooltip = tooltip;
	this.canvasMousePosition = {"x" : 0, "y" : 0};
	this.scale = 1;
	this.translate = {"x" : 0, "y" : 0};
	this.canvasScaledSize = {"x" : 0, "y" : 0};

	$(canvas).mousedown(function(e){
		this.mouseISDown = true;
		this.saveMouseDown = this.canvasMousePosition;
	}.bind(this));
	$(canvas).mouseup(function(e){
		this.mouseISDown = false;
	}.bind(this));
	$(canvas).mousemove(function(e){
		this.mouseMove(e);
	}.bind(this));	
	$(canvas).bind('mousewheel', function(event, delta) {
		if (delta < 0) {
			setIntervalX(function(){
				this.scale *= 0.97;	
			}.bind(this), 50, 5);
		} 
		else {
			setIntervalX(function(){
				this.scale *= 1.03;	
			}.bind(this), 50, 5);			
			
		};
	}.bind(this));
}

DiagramCamera.prototype.transform = function(ctx) {
	ctx.translate(this.translate.x, this.translate.y);
	ctx.scale(this.scale, this.scale);
};


DiagramCamera.prototype.mouseMove = function(e) {
	if (e == null) return;
  this.canvasMousePosition = {
    "x" : e.pageX - this.canvas.offsetLeft - this.translate.x,
    "y" : e.pageY - this.canvas.offsetTop - this.translate.y
  };

  if (this.mouseISDown){
  	var translate = {
  		"x" : this.canvasMousePosition.x - this.saveMouseDown.x,
  		"y" : this.canvasMousePosition.y - this.saveMouseDown.y,
  	}
  	this.translate.x += translate.x;
  	this.translate.y += translate.y;
  }

 	this.canvasMousePosition.x *= 1 / this.scale;
  this.canvasMousePosition.y *= 1 / this.scale;

  //console.log(this.canvasMousePosition);
	this.tooltip.css('display', 'none');
	this.tooltip.css('cursor', 'default');
	this.tooltip.html("");
};


DiagramCamera.prototype.update = function(canvas) {
		this.canvasScaledSize = {
			"x" : canvas.width * 1 / this.scale,
			"y" : canvas.height * 1 / this.scale
		} 
		if (this.scale > 1){
			this.canvasScaledSize.x = canvas.width * this.scale;
			this.canvasScaledSize.y = canvas.height * this.scale;
		}	
};

function setIntervalX(callback, delay, repetitions) {
    var x = 0;
    var intervalID = window.setInterval(function () {
       callback();
       if (++x === repetitions) {
       		delay /= 2;
           window.clearInterval(intervalID);
       }
    }, delay);
}