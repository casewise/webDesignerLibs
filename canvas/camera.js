/*
* Canvas Camera v0.2, 
*
* Copyright (c) 2011 Pouya MOHTACHAM (pouya.name)
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
* v0.2 2011/09/22 / add of function setImageInCanvas
*/

$(function(){
	$(window).resize(function() {
  		//$('#log').append('<div>Handler for .resize() called.</div>');
  		if (camera.bgImage != null)
  		{
  			
  			$('.diagram-zone').width('100%');
  			$('.diagram-zone').height('100%');
  			$('.diagram-canvas').width('100%');
  			$('.diagram-canvas').height('100%');
  			camera.fitInScreen();
  			camera.applyChanges();

  		}
	});
})

var camera = {
	// level of the zoom in main Screen
	'worldZoomLevel':1,
	'zoomFactorLimit' : {'min' : 0, 'max' : 10},
	'translationFactor' : 1,
//	'worldScreenMinX':0,
//	'worldScreenMinY':0,
//	'worldScreenMaxX':800,
//	'worldScreenMaxY':400,
	// inital canvas size in the user client
	'worldInitX': 0,
	'worldInitY': 0,
	// current mainScreen size depending on the zoom & translation
	'ScreenSize': {'w' : 0, 'h' : 0},
	// the translation of the left top corner of the mainScreen from the bigMap, represents also the position of the miniMap
	'translateX' : 0,
	'translateY' : 0,
	// used only for canvas chages
	'traX' : 0,
	'traY' : 0,
	'bgImage' : null,
	'mousePourcentagePosition' : {},
	// the zoom box initial size
	'zoomSize' : 20,
	'zoomFactor' : 1,
	'mouseX' : 0,
	'mouseY' : 0,
	// the mini map size
	'miniMapSize' : 256,
	'ctx' : null,
	'canvasTag' : null,
	'canvasID' : null,
	'diagram' : null,
	'diagramShapes' : null,
	'diagramKin' : null,
	'diagramClickOT' : null,
	'fadingShare' : false,
	'clip' : null,
	'relativeMousePos' : {'x' : 0, 'y' : 0},
	// the size of the bigMap
	'worldMaxSize' : {'x' : 0, 'y' : 0},
	'init' : function (diagram, _diagramClickOT) {
		//console.log('init the camera');
		
		// init the camera
		mainScreen = $("#diagram-" + diagram.id);
		//console.log(mainScreen);
		camera.canvasTag = mainScreen;
		camera.diagram = diagram;
		camera.canvasID = 'diagram-' + diagram.id;//mainScreenTag.replace("#", '');
		camera.bgImage = diagram.diagramImage;
		camera.worldInitX = mainScreen.width();
		camera.worldInitY = mainScreen.height();
		camera.ScreenSize.w = mainScreen.width();
		camera.ScreenSize.h = mainScreen.height();
		camera.diagramClickOT = _diagramClickOT;
		// camera.diagramKin = new Kinetic_2d("diagram-" + diagram.id);
		
		// init the canvas
		if (isUnderIE9()){
			G_vmlCanvasManager.initElement(camera.canvasTag[0]);	
		}		
		camera.ctx = mainScreen[0].getContext('2d');
		camera.ctx.canvas.width = mainScreen.width();
		camera.ctx.canvas.height = mainScreen.height();
		
		// console.log(mainScreen.width() + ', ' + mainScreen.height());
		// console.log(bgImage.width + ', ' + bgImage.height);
		// init the zoom using the image size
		
		//camera.fitInScreen();

		setMouseWheel(mainScreen);
		setMouseMove(mainScreen);
		if (!isUnderIE9()){
			setMouseDown(mainScreen);			
			setMouseUp(mainScreen);			
		}


		//camera.initClipboard(camera.diagram.id);
		

		var jsonFile = HTTP_SERVER + "webdesigner/generated/diagrams/diagram" + diagram.id + ".json";
		$.getScript(jsonFile, function(data){
			eval(data);
			camera.diagramShapes = diagramJSON;
			//camera.drawImage();
		});		
	},
	'drawImage' : function(){
		camera.canvasTag.css('cursor', 'default');
		if (!isUnderIE9()){
			camera.ctx.canvas.width = camera.worldInitX;
			camera.ctx.canvas.height = camera.worldInitY;
			//camera.ctx.clearRect(0, 0, camera.ctx.canvas.width, camera.ctx.canvas.height);
			camera.ctx.scale(1 / camera.worldZoomLevel, 1 / camera.worldZoomLevel);			
			camera.ctx.translate(-camera.translateX, -camera.translateY);
			if (camera.bgImage.complete){
				camera.ctx.drawImage(camera.bgImage, -14, -15, camera.bgImage.width, camera.bgImage.height);	
			}
		}
		else {
			//G_vmlCanvasManager.initElement(camera.canvasTag[0]);
			//console.log(c);
			//camera.ctx = c[0].getContext('2D');
			//alert(1 / camera.worldZoomLevel);
			//camera.ctx.canvas.width = camera.worldInitX;
			//camera.ctx.canvas.height = camera.worldInitY;
			//var foo = document.getElementById("foo");
			//var canvas = document.getElementById(camera.canvasID);
			//canvas.setAttribute("width", camera.worldInitX);
			//canvas.setAttribute("height", camera.worldInitY);


			camera.ctx.clearRect(0, 0, camera.ctx.canvas.width, camera.ctx.canvas.height);
			if (camera.bgImage.complete){
				var prop = camera.getRatio();
				camera.ctx.drawImage(camera.bgImage, 0, 0, camera.bgImage.width * prop, camera.bgImage.height * prop);
				//camera.ctx.drawImage(camera.bgImage, 0, 0, camera.ctx.canvas.width, camera.ctx.canvas.height);	
			}
			//camera.canvasTag.setAttribute("width", camera.worldInitX);
			//camera.canvasTag.setAttribute("height", camera.worldInitY);
			//camera.ctx.scale(2,2);
			//console.log('translate', camera.translateX);
			//camera.ctx.scale(1 / camera.worldZoomLevel, 1 / camera.worldZoomLevel);	
//			camera.ctx.translate(-camera.translateX, -camera.translateY);
		}
		
		



		browseShapesAndCallbackIfMouseOn(function(shape){
			camera.canvasTag.css('cursor', 'pointer');
			camera.ctx.strokeRect(shape.X,  shape.Y , shape.W, shape.H);
		});	
		
		//camera.ctx.strokeStyle = '#00f'; // blue
		//camera.ctx.strokeRect(0,  0, camera.bgImage.width, camera.bgImage.height);
		// console.log(camera.diagramShapes);
		//camera.ctx.strokeStyle = '#00F'; // blue

		//camera.canvasTag.html();
		// if (camera.diagramShapes != null){
			// $.each(camera.diagramShapes.shapes, function (i, shape){
				// camera.ctx.strokeRect(shape.X, shape.Y , shape.W, shape.H);
			// });
		// }		
	},
	'draw' : function (){
			var diagramShare = $('#diagramShare-' + camera.canvasID);
			if (camera.mouseX < 100){
				 if (diagramShare.css("display") == "none"){
					diagramShare.fadeIn(500);
					//camera.initClipboard(camera.diagram.id);
				} 
			}
			else{
				if (diagramShare.css("display") != "none" && camera.fadingShare != true){
					camera.fadingShare = true;
					// diagramShare.css("z-index", 200);
					diagramShare.fadeOut(500, function(){
						
						camera.fadingShare = false;
					});  
					
				}
			}
			var cameraHelper = Array();
			cameraHelper.push('<li>', 'CanvasSize : ' + getSimpleValue(camera.worldInitX) + ', ' + getSimpleValue(camera.worldInitY), '</li>');
			cameraHelper.push('<li>', 'Translate : ' + getSimpleValue(camera.translateX) + ', ' + getSimpleValue(camera.translateY), '</li>');
			cameraHelper.push('<li>', 'Zoom : ' + getSimpleValue( 1/ camera.worldZoomLevel), '</li>');
			cameraHelper.push('<li>', 'MousePos% : ' + getSimpleValue(camera.mousePourcentagePosition.x) + ', ' + getSimpleValue(camera.mousePourcentagePosition.y), '</li>');
			cameraHelper.push('<li>', 'ContextSize : ' + getSimpleValue(camera.ScreenSize.w) + ', ' + getSimpleValue(camera.ScreenSize.h), '</li>');
			cameraHelper.push('<li>', 'MousePos : ' + getSimpleValue(camera.mouseX) + ', ' + getSimpleValue(camera.mouseY), '</li>');
			cameraHelper.push('<li>', 'RelativeMP : ' + getSimpleValue(camera.relativeMousePos.x) + ', ' + getSimpleValue(camera.relativeMousePos.y), '</li>');
			
			$("#cameraHelper-" + camera.canvasID).html(cameraHelper.join(''));
			
		
				
	},
	'initClipboard' : function(dID) {
		if (isUnderIE9()) return;

		
		// Enable Rich HTML support (Flash Player 10 Only)
		ZeroClipboard.setMoviePath( LIB_SERVER + 'zeroclipboard/ZeroClipboard10.swf' );
		var buttonID = 'copy-diagram-' + dID;
		// Create our clipboard object as per usual
		camera.clip = new ZeroClipboard.Client();
		camera.clip.setHandCursor( true );
		var contentHTML = "<img src='" + HTTP_SERVER + "images/print/diagram" + dID + ".png'/>";
		camera.clip.setText( contentHTML );
		//console.log(contentHTML);
		
		camera.clip.addEventListener('load', function (client) {
			//debugstr("Flash movie loaded and ready.");
			 //console.log("loading flash");
			camera.clip.setText( contentHTML );
		});
		camera.clip.addEventListener( 'mouseOver', function(client) {
			//console.log("mouse over"); 
			//$('#' + buttonID).addClass("ui-state-hover");
			$('#' + buttonID).mouseover();
		} );
		
		camera.clip.addEventListener( 'mouseOut', function(client) { 
			// console.log("mouse out"); 
			$('#' + buttonID).mouseout();
			//$('#' + buttonID).removeClass("ui-state-hover");
		} );				
		/*
		camera.clip.addEventListener('mouseOver', function (client) {
			// update the text on mouse over
			
		});
		*/
		camera.clip.addEventListener('complete', function (client, text) {
			// console.log("Copied text to clipboard: " + text );
		});
		
		camera.clip.glue(buttonID);
	},
	
	'applyChanges' : function (){
	
		//if (camera.canvasTag == null) return;
//	console.log(camera);
		// check if the canvas real size didn't change

		camera.canvasTag = $('#' + camera.canvasID);
		camera.worldInitX = camera.canvasTag.width();
		camera.worldInitY = camera.canvasTag.height();		

		// update worldZoom
		camera.worldZoomLevel *= camera.zoomFactor;
		
	

		// update worldSize
		camera.ScreenSize.w = camera.worldInitX * camera.worldZoomLevel;			
		camera.ScreenSize.h = camera.worldInitY * camera.worldZoomLevel;	
	
//		// update translations
		camera.translateX += camera.traX;
		camera.translateY += camera.traY;
		
			
		/*
		
		// limit the translate to don't go more than the max size
		if (camera.translateX + camera.ScreenSize.w > camera.worldMaxSize.x){
			camera.translateX -= camera.translateX + camera.ScreenSize.w - camera.worldMaxSize.x;
		}
		if (camera.translateY + camera.ScreenSize.h > camera.worldMaxSize.y){
			camera.translateY -= camera.translateY + camera.ScreenSize.h - camera.worldMaxSize.y;
		}	
		*/		
		//if (camera.translateX < -60) camera.translateX = -60;
		//if (camera.translateY < 0) camera.translateY = 0;		
		
		// update miniMap
		//camera.updateMiniMap();
		//camera.draw(camera);
		//camera.ctx.scale(camera.zoomFactor, camera.zoomFactor);			
		//camera.ctx.translate(10, 20);
		

		// reset variables
		camera.zoomFactor = 1;
		camera.traX = 0;
		camera.traY = 0;		
		
		return;
	
	},
	getRatio : function(){
		var propW = camera.canvasTag.width() / camera.diagram.diagramImage.width ;
		var propH = camera.canvasTag.height() / camera.diagram.diagramImage.height;
		var prop = propW;
		if (propH < propW) prop = propH;
		if (1 / prop < 1) prop = 1;
		return prop;		
	},
	fitInScreen : function(){
		camera.canvasTag = $('#'+ camera.canvasID);
		if (camera.diagram.diagramImage.width <= camera.canvasTag.width() &&  camera.diagram.diagramImage.height < camera.canvasTag.height()){
			camera.worldZoomLevel = 1;
		} else {
			var prop = camera.getRatio();
			camera.worldZoomLevel = 1 / prop;
		}		
/*		if (isUnderIE9()){
			//camera.ctx.scale(camera.worldZoomLevel, camera.worldZoomLevel);
		}
*/
		camera.translateX = 0;
		camera.translateY = 0;
	}
};

function tickCanvas2D(){
	requestAnimFrame(tickCanvas2D);
	camera.draw();
/*	if (isUnderIE9()){
		camera.ctx.scale(1 / camera.zoomFactor, 1 / camera.zoomFactor);	
		camera.ctx.translate(camera.traX, camera.traY);		
	}	*/	
	camera.drawImage();	
	
}


// browse the shapes and call a callback if the mouse is on the shape
function browseShapesAndCallbackIfMouseOn(callback){
	
	if (camera.diagramClickOT !=  null && camera.diagramShapes != null){
		$.each(camera.diagramShapes.shapes, function (i, shape){
			if (mouseOnShape(shape) == false) return;
			callback(shape);
			return false;	
		});
	}
}

// check if the mouse is on a shape
function mouseOnShape(shape){	
	if ($.inArray(shape.objectTypeName, camera.diagramClickOT) == -1) return false;
	if (camera.relativeMousePos.x < shape.X) return false;
	if (camera.relativeMousePos.x > shape.X + shape.W) return false;
	if (camera.relativeMousePos.y < shape.Y) return false;
	if (camera.relativeMousePos.y > shape.Y + shape.H) return false;
	return true;
}


function debugstr(msg) {
	var p = document.createElement('p');
	p.innerHTML = msg;
	get('d_debug').appendChild(p);
}

function get(id) { return document.getElementById(id); }

function initCamera(diagram, _diagramClickOT){
		camera.init(diagram, _diagramClickOT);
		//camera.draw();
		$('#diagram-' +diagram.id).fadeIn(500);
}


function createNavigationBar(diagram, corner){

	var output = Array();

	output.push("<ul id='diagramNavigation-diagram-" + diagram.id + "' class='diagramNavigation " + corner + "'>");	
	output.push("<li><a class='diagram-zoomin " + corner + "' title='<div class=\"simpleText\">Zoomer sur le diagramme</div>'>Zoomer sur le diagramme</a></li>");
	output.push("<li><a class='diagram-zoomout " + corner + "' title='<div class=\"simpleText\">Dézoomer sur le diagramme</div>'>Dézoomer sur le diagramme</a></li>");	
	output.push("</ul>");
	
	return output.join('');
}

function initDiagramNavigation(mainSelector){
	$(mainSelector + ' a.diagram-zoomin').button({icons :  {primary : 'ui-icon-zoomin'}, text : false});
	$(mainSelector + ' a.diagram-zoomout').button({icons :  {primary : 'ui-icon-zoomout'}, text : false});
	$(mainSelector + ' a').tooltip({delay:250, showURL:false});

	$(mainSelector + ' a.diagram-zoomin').click(function(){
		camera.worldZoomLevel *= 0.9;
		camera.applyChanges();
	});
	$(mainSelector + ' a.diagram-zoomout').click(function(){
		camera.worldZoomLevel *= 1.1;
		camera.applyChanges();
	});	

}

function getLayerMousePos(event){
	var offsetTop = $('#' + event.currentTarget.id).offset().top;
	var offsetLeft = $('#' + event.currentTarget.id).offset().left;


	var relMPX = event.pageX - offsetLeft;
	var relMPY = event.pageY - offsetTop;
	return {'x' : relMPX, 'y' : relMPY};	
}

// add an image in the canvas
function setImageInCanvas(selector, diagram, _diagramClickOT){
//ui-widget-content 

	var diagramID = diagram.id;
	//$(selector).height('99');
	//console.log('before setting canvas : ', camera.worldZoomLevel, ',', bgImage.width, ',',bgImage.height, ' screen:', $(selector).width(), ', ', $(selector).height());
	
	var html = '<div class="diagram-zone">';
	html += createNavigationBar(diagram, "ui-corner-all");
	html += "<canvas class='ui-corner-all diagram-canvas' id='diagram-" + diagramID + "'></canvas><ul class='cameraHelper' id='cameraHelper-diagram-" + diagramID + "'></ul>";
	html += createDiagramShare(diagram, diagram.diagramImage.src, "ui-corner-right");
	
	html += '</div>';

	$(selector).html(html);


	$('.diagram-zone').width($(selector).width());
	$('.diagram-zone').height($(selector).height());

	$("#diagram-" + diagramID).width($('.diagram-zone').width());
	$("#diagram-" + diagramID).height($('.diagram-zone').height());


	if (diagram.diagramImage.complete == false)	{
		diagram.diagramImage.onload = function (){
			loadDiagram(diagram, _diagramClickOT);
		}		
	} else {
		loadDiagram(diagram, _diagramClickOT);
	}
}

/**
* Provides requestAnimationFrame in a cross browser way.
*/
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(callback, element) {
            window.setTimeout(callback, 1000/60);
          };
})();


function loadDiagram(diagram, _diagramClickOT){
	initCamera(diagram, _diagramClickOT);		
	initDiagramShare('.diagramShare');
	initDiagramNavigation('.diagramNavigation');
	
	var diagramShare = $('#diagramShare-diagram-' + diagram.id);
	diagramShare.fadeOut();
	camera.fitInScreen();
	camera.applyChanges();
	camera.initClipboard(diagram.id);
	tickCanvas2D();
/*	if (isUnderIE9()){
		camera.ctx.scale(1 / camera.worldZoomLevel, 1/ camera.worldZoomLevel);
	}*/
	//console.log('image Loaded');
}



// define when mouse is down
function setMouseDown(mainScreen){
	mainScreen.mousedown( function (event) {

		browseShapesAndCallbackIfMouseOn(function(shape){
			location.href = shape.link + ".htm";
		});
	
		// if (camera.diagramClickOT !=  null && camera.diagramShapes != null){
			// $.each(camera.diagramShapes.shapes, function (i, shape){
				// if (mouseOnShape(shape) == false) return;
				// location.href = shape.link + ".htm";
			// });
		// }
		
		// console.log("mouse down");
		var mouseRelativePositionOnScreen = {'x' : event.pageX, 'y' : event.pageY};
		camera.mousePourcentagePosition = {'x' : mouseRelativePositionOnScreen.x / camera.worldInitX,
		 'y' : mouseRelativePositionOnScreen.y / camera.worldInitY};
		
		// camera.initClipboard(diagram.id);

		// console.log(camera.mousePourcentagePosition);

		// left click
		$(this).css('cursor', 'move');
		//console.log("mouse down");
		if (event.which == 1){
			camera.pageX = event.pageX;
			camera.pageY = event.pageY;
		}
		camera.mouseDown = true;		
	});	
}


// set mouse move
function setMouseMove(mainScreen){
		// mouse event for translation
	mainScreen.mousemove(function(event) {	
		// set the mouse
		var relMP = getLayerMousePos(event);
		var x = (relMP.x ) * camera.worldZoomLevel + camera.translateX;
		var y = (relMP.y ) * camera.worldZoomLevel + camera.translateY;
		camera.relativeMousePos = {'x' : x, 'y' : y};	
		
					
		//var x = event.layerX * camera.worldZoomLevel + camera.translateX;
		//var y = event.layerY * camera.worldZoomLevel + camera.translateY;
		//camera.relativeMousePos = {'x' : x, 'y' : y};

		//camera.drawImage();			
		
	
		var mouseRelativePositionOnScreen = {'x' : event.pageX, 'y' : event.pageY};
		camera.mousePourcentagePosition = {'x' : mouseRelativePositionOnScreen.x / camera.worldInitX,
		 'y' : mouseRelativePositionOnScreen.y / camera.worldInitY};
		camera.mouseX = event.pageX;
		camera.mouseY = event.pageY;
		if (camera.mouseDown) {				
			var moveOnX = camera.pageX - event.pageX;
			var moveOnY = camera.pageY - event.pageY;		
			var traX = 0;
			var traY = 0;
			var traMove = camera.translationFactor * camera.worldZoomLevel;
//				console.log("down : " + moveOnX + ", " + moveOnY + '|| pageX : ' + camera.pageX + ', ' + camera.pageY + '||' + event.pageX + ', ' + event.pageY);
			if (moveOnX != 0) (moveOnX > 0) ? traX = traMove : traX = -traMove;
			if (moveOnY != 0)	(moveOnY > 0) ? traY = traMove : traY = -traMove;	
			camera.traX = moveOnX * camera.worldZoomLevel;//traX;
			camera.traY = moveOnY * camera.worldZoomLevel;//traY;		
			camera.applyChanges();	
			camera.pageX = event.pageX;				
			camera.pageY = event.pageY;				
			// camera.draw(camera);				
		}
		
		camera.draw();
	});			
}

// set mouse wheel
function setMouseWheel(mainScreen){
	// on mouse wheel
	mainScreen.bind('mousewheel', function(event, delta) {		
		// setInterval(function (){
		if (delta > 0) {
			camera.zoomFactor = 0.90;
		} 
		else {
			camera.zoomFactor = 1.10
		};
		// limit the zoom
		if (camera.worldZoomLevel * camera.zoomFactor <= camera.zoomFactorLimit.min){
			camera.zoomFactor = 1;
			camera.worldZoomLevel = camera.zoomFactorLimit.min;
		}			
		if (camera.worldZoomLevel * camera.zoomFactor >= camera.zoomFactorLimit.max){
			camera.zoomFactor = 1;
			camera.worldZoomLevel = camera.zoomFactorLimit.max;
			if (camera.translateX > 0) camera.traX -= 100;
			if (camera.translateY > 0) camera.traY -= 100;
		}
		// get the latest project zoom
		var projectionZoom = camera.worldZoomLevel * camera.zoomFactor;
		var newScaledWidthX = projectionZoom * camera.worldInitX * camera.mousePourcentagePosition.x;
		var newScaledWidthY = projectionZoom * camera.worldInitY * camera.mousePourcentagePosition.y;
		// calcul the new size and prepare translation in order to focus on the mouse pointer
		var tX = newScaledWidthX - camera.mousePourcentagePosition.x *  camera.worldZoomLevel * camera.worldInitX;
		var tY = newScaledWidthY - camera.mousePourcentagePosition.y *  camera.worldZoomLevel * camera.worldInitY;
		camera.traX -= tX;
		camera.traY -= tY;
		camera.applyChanges();
		return false;
	});		
}

// set mouse up
function setMouseUp(mainScreen){
	// when mouse click in released
	mainScreen.mouseup( function (event) {
		camera.mouseDown = false;
		$(this).css('cursor', 'default');
	});	
}


function getSimpleValue(v){
	return (v + "").substring(0, 8);
}

