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
  			camera.fitInScreen();
  			camera.applyChanges();

  		}
	});
})

//CANVAS_FAIL_MESSAGE = "Le diagramme n'est pas disponible, Veuillez utiliser Internet Explorer 9+, FireFox 3.5+, Chrome ou Safari";
CANVAS_FAIL_MESSAGE = "";

var camera = {
	// level of the zoom in main Screen
	'worldZoomLevel':1,
	'zoomFactorLimit' : {'min' : 0, 'max' : 5},
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
	'init' : function (diagram, bgImage, _diagramClickOT) {
		
		
		// init the camera
		var canvasSelector = "diagram-" + diagram.id;
		mainScreen = $('#' + canvasSelector);
		//console.log(mainScreen);
		//mainScreen.css('width', '600px');
		//mainScreen.css('height', '600px');
		//mainScreen.width('600px');
		
		camera.canvasTag = mainScreen;
		camera.diagram = diagram;
		camera.canvasID = 'diagram-' + diagram.id;//mainScreenTag.replace("#", '');
		camera.bgImage = bgImage;
		//alert('init the camera : ' + mainScreen.width() + ', ' + mainScreen.height());
		camera.worldInitX = mainScreen.width();
		camera.worldInitY = mainScreen.height();
		//alert('init the camera 1.4: ' +camera.worldInitX + ', ' + camera.worldInitY);
		camera.ScreenSize.w = mainScreen.width();
		camera.ScreenSize.h = mainScreen.height();
		camera.diagramClickOT = _diagramClickOT;
		// camera.diagramKin = new Kinetic_2d("diagram-" + diagram.id);
		//console.log(mainScreen);
		// init the canvas
		//if (Modernizr.canvas)
		//{
			//alert('has canvas');
		//alert('init the camera 1.4: ' +camera.worldInitX + ', ' + camera.worldInitY);
			
			// init the canvas using canvasexplorer
		if (isUnderIE9()){
			//var _canvas = document.getElementById('canvasSelector');
			G_vmlCanvasManager.initElement(camera.canvasTag[0]);	
			camera.canvasTag.width(camera.worldInitX);
			camera.canvasTag.height(camera.worldInitY);
			//camera.ctx = camera.canvasTag[0].getContext('2d');
		}
		else{
			//camera.ctx = camera.canvasTag[0].getContext('2d');
		}
		camera.ctx = camera.canvasTag[0].getContext('2d');
		camera.ctx.canvas.width = camera.worldInitX;
		camera.ctx.canvas.height = camera.worldInitY;		
		//camera.ctx.scale(0.25, 0.25);


		//camera.canvasTag.css('background-image', 'url("' + bgImage.src + '")');
		//camera.canvasTag.css('background-repeat', 'no-repeat');
		//camera.canvasTag.css('background-size', 'no-repeat');

		//camera.canvasTag[0].style.background-repeat

		
		//if (camera.ctx.canvas == null) alert('canvas is null');
		//camera.ctx.canvas.width = mainScreen.width();
		//camera.ctx.canvas.height = mainScreen.height();			
		//} else{
		//	camera.ctx = null;
			//alert('no canvas');
		//}
		
		// console.log(mainScreen.width() + ', ' + mainScreen.height());
		// console.log(bgImage.width + ', ' + bgImage.height);
		// init the zoom using the image size
		
		//alert('init the camera 1.5: ' + camera.canvasTag.width() + ', ' + camera.canvasTag.height());


		if (camera.bgImage.complete){
			camera.fitInScreen();	
			camera.applyChanges();	
		}else{
			camera.bgImage.onload = function(){
				camera.fitInScreen();
				camera.applyChanges();
			}			
		}
		


		camera.translateX = 0;
		camera.translateY = 0;

		//camera.drawImage();
//		$("#bigMap").worldInitX = mainScreen.width();
//		$("#bigMap").worldInitY = mainScreen.height();				
		
		//alert('init the camera 2: ' + camera.canvasTag.width() + ', ' + camera.canvasTag.height());
		mainScreen.mousedown( function (event) {

			updateMouseRelativePos(event);
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
			/*
			var mouseRelativePositionOnScreen = {'x' : event.pageX, 'y' : event.pageY};
			camera.mousePourcentagePosition = {'x' : mouseRelativePositionOnScreen.x / camera.worldInitX,
			 'y' : mouseRelativePositionOnScreen.y / camera.worldInitY};
			*/
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
		
		// mouse event for translation
		mainScreen.mousemove(function(event) {
			$(this).css('cursor', 'default');

			//return;
			//console.log('mouse move : ', event.layerX, ', ', event.layerY);	
			//console.log(event.pageX);
			// set the mouse
			//console.log(event);
			updateMouseRelativePos(event);
			//console.log(camera.ctx);

			//camera.drawImage();	
		
		
			//var mouseRelativePositionOnScreen = {'x' : event.pageX, 'y' : event.pageY};


			camera.mouseX = event.pageX;
			camera.mouseY = event.pageY;
			camera.applyChanges();
			
			if (camera.mouseDown) {		
				$(this).css('cursor', 'move');		
				var moveOnX = camera.pageX - event.pageX;
				var moveOnY = camera.pageY - event.pageY;		
				var traX = 0;
				var traY = 0;
				var traMove = camera.translationFactor * camera.worldZoomLevel;
//				console.log("down : " + moveOnX + ", " + moveOnY + '|| pageX : ' + camera.pageX + ', ' + camera.pageY + '||' + event.pageX + ', ' + event.pageY);
				if (moveOnX != 0) (moveOnX > 0) ? traX = traMove : traX = -traMove;
				if (moveOnY != 0) (moveOnY > 0) ? traY = traMove : traY = -traMove;	
				camera.traX = moveOnX;// * (camera.worldZoomLevel);//traX;
				camera.traY = moveOnY;// * (camera.worldZoomLevel);//traY;		
				camera.applyChanges();	
				camera.pageX = event.pageX;				
				camera.pageY = event.pageY;				
				// camera.draw(camera);				
			}
			
			//camera.draw();

		});		
//	
		// when mouse click in released
		mainScreen.mouseup( function (event) {
			camera.mouseDown = false;
			$(this).css('cursor', 'default');
		});	
		
		mainScreen.dblclick(function(event){
			// console.log(event.pageX + ", " + event.pageY);
			
		});
		
		// on mouse wheel
		mainScreen.bind('mousewheel', function(event, delta) {		
				updateMouseRelativePos(event);
				// setInterval(function (){
				if (delta < 0) {
					camera.zoomFactor = 0.90;
					//camera.traX += (10 * camera.worldZoomLevel);
					//camera.traX += 10;
				} 
				else {
					camera.zoomFactor = 1.10;
					//camera.traX -= 10;
					//camera.traX -= (10 * camera.worldZoomLevel)

				};
				// limit the zoom
				if (camera.worldZoomLevel * camera.zoomFactor <= camera.zoomFactorLimit.min){
					camera.zoomFactor = 1;
					camera.worldZoomLevel = camera.zoomFactorLimit.min;
				}			
				if (camera.worldZoomLevel * camera.zoomFactor >= camera.zoomFactorLimit.max){
					camera.zoomFactor = 1;
					camera.worldZoomLevel = camera.zoomFactorLimit.max;
					//if (camera.translateX > 0) camera.traX -= 100;
					//if (camera.translateY > 0) camera.traY -= 100;
				}
				// get the latest project zoom
				var projectionZoom = camera.worldZoomLevel *  (1/camera.zoomFactor);

				/*
				var newScaledWidthX = projectionZoom * camera.worldInitX * camera.mousePourcentagePosition.x;
				var newScaledWidthY = projectionZoom * camera.worldInitY * camera.mousePourcentagePosition.y;
				console.log('new scaled size : ' + newScaledWidthX + ", " + newScaledWidthY);
				// calcul the new size and prepare translation in order to focus on the mouse pointer
				var tX = newScaledWidthX - camera.mousePourcentagePosition.x *  ( 1 / camera.zoomFactor) * camera.worldInitX;
				var tY = newScaledWidthY - camera.mousePourcentagePosition.y *  ( 1 / camera.zoomFactor) * camera.worldInitY;
				*/			
				//console.log('worldSize :' + camera.worldInitX);
				var newSize = {'x' : projectionZoom * camera.worldInitX, 'y' : projectionZoom * camera.worldInitY};
				console.log('new size', newSize);
				//console.log(newSize);
				var newSizePourcent = {'x' : newSize.x * camera.mousePourcentagePosition.x, 'y' : newSize.y * camera.mousePourcentagePosition.y};
				console.log('new mouse pos : ', newSizePourcent);

				var currentMousePos = {'x' : camera.ScreenSize.w * camera.mousePourcentagePosition.x, 'y' : camera.ScreenSize.h * camera.mousePourcentagePosition.y};
				console.log('current mouse pos : ', currentMousePos);
				var newScaledWidthX = newSizePourcent.x - (currentMousePos.x);
				var newScaledWidthY = newSizePourcent.y - (currentMousePos.y);

				//var newScaledWidthY = projectionZoom * camera.worldInitY * camera.mousePourcentagePosition.y;
				console.log('new scaled size : ' + newScaledWidthX + ", " + newScaledWidthY);
				// calcul the new size and prepare translation in order to focus on the mouse pointer
				var tX = newScaledWidthX  / 2;//newScaledWidthX - camera.mousePourcentagePosition.x *  ( 1 / camera.zoomFactor) * camera.worldInitX;
				var tY = newScaledWidthY  / 2;//newScaledWidthY - camera.mousePourcentagePosition.y *  ( 1 / camera.zoomFactor) * camera.worldInitY;
				//console.log('translate after wheel : ' + tX + ', ' + tY);
				//camera.ctx.translate(tX, tY);
				//camera.traX *= camera.zoomFactor;
				//camera.traX += tX;
				//camera.traY += tY;
				//camera.traX -= tX * 2;// / (1 / camera.zoomFactor);
				//camera.traY -= tY * 2; // / (1 / camera.zoomFactor);

				//camera.traX += 10 * projectionZoom;
				//camera.traY = 0;

				
				camera.applyChanges();

			
			return false;
		});	



		$.getScript(HTTP_SERVER + "webeditor/generated/diagrams/diagram" + diagram.id + ".json", function(data){
			eval(data);
			camera.diagramShapes = diagramJSON;
			camera.applyChanges();
			//camera.drawImage();
		});				
		

		//alert('end init the camera : ' + camera.canvasTag.width() + ', ' + camera.canvasTag.height());
	},
	'fitInScreen' : function(){
		//alert(camera.bgImage.complete + ',' +camera.bgImage.width+ ','+camera.bgImage.height+ ' screen:'+ camera.canvasTag.width()+ ', '+ camera.canvasTag.height());
		if (camera.bgImage.width <= camera.canvasTag.width() &&  camera.bgImage.height < camera.canvasTag.height()){
			camera.worldZoomLevel = 1;
		} else {
			var propW = (camera.canvasTag.width()) / camera.bgImage.width;
			var propH = (camera.canvasTag.height()) / camera.bgImage.height;
			var prop = propW;
			if (propH < propW) prop = propH;
			if (1 / prop < 1) prop = 1;
			//alert(prop + "is less than 1");
			camera.worldZoomLevel = prop;
			//console.log(camera.worldZoomLevel, ',', bgImage.width, ',',bgImage.height, ' screen:', mainScreen.width(), ', ', mainScreen.height());
			//camera.zoomFactorLimit.max = 1 / prop;		
		}
		//camera.worldInitX = camera.canvasTag.width();
		//camera.worldInitY = camera.canvasTag.height();		
		//camera.ctx.canvas.width = camera.worldInitX;			
		//camera.ctx.canvas.height = camera.worldInitY;
		camera.ctx.scale(camera.worldZoomLevel, camera.worldZoomLevel);
		//camera.ctx.translate(-camera.translateX, -camera.translateY);		
		//camera.worldZoomLevel = 1;
		//camera.applyChanges();
	},	
	'drawImage' : function(){
		//return;

		//alert('drawImage :' + camera.bgImage.src + '; ' + camera.bgImage.complete + ", ctx canvas size" + camera.ctx.canvas.width + ", " + camera.ctx.canvas.height + ", [image size : {" +  camera.bgImage.width + ", " +  camera.bgImage.height + "}]");
		//camera.canvasTag.css('cursor', 'default');
		/*
		
		//alert("world size : " + camera.worldInitX + ", " + camera.worldInitY);
		if (camera.canvasTag.width() == camera.worldInitX){
			camera.ctx.canvas.width = camera.worldInitX - 1;	
		}else{
			
		}
		//camera.ctx.canvas.width = camera.worldInitX - 1;
		//camera.ctx.canvas.height = camera.worldInitY - 1;
		//alert(camera.canvasTag.height() + ' : ' + camera.worldInitY);
		if (camera.canvasTag.height() == camera.worldInitY){
			camera.ctx.canvas.height = camera.worldInitY - 1;	
		}else{
			
		}
		*/
		//camera.ctx.canvas.width = camera.worldInitX;
		//camera.ctx.canvas.height = camera.worldInitY;

		//camera.ctx.canvas.width = 1000;
		//camera.ctx.canvas.height = 400;
				
		//if (Modernizr.canvas){
		//
		//console.log(camera.worldInitX);
		//camera.canvasTag.attr('width', camera.worldInitX);
		//camera.canvasTag.attr('height', camera.worldInitY);

		var clean0X = -camera.ScreenSize.w;
		var clean0Y = -camera.ScreenSize.h;
		var clean1X = camera.ScreenSize.w * 3;
		var clean1Y = camera.ScreenSize.h * 3;
		camera.ctx.clearRect(clean0X, clean0Y, clean1X, clean1Y);
		//camera.canvasTag.css('background-color', 'white');
		/*
		if (isUnderIE9()){
			//camera.ctx.scale(1 / camera.zoomFactor, 1 / camera.zoomFactor);		
			//camera.ctx.translate(-camera.traX, -camera.traY);
		}else
		{

			//camera.ctx.scale(1 / camera.worldZoomLevel, 1 / camera.worldZoomLevel);				
			
		}
		*/
		//console.log("zoomfactor : " + 1 / camera.zoomFactor);
		camera.ctx.translate(-camera.traX, -camera.traY);		
		camera.ctx.scale(camera.zoomFactor, camera.zoomFactor);		
		//camera.ctx.translate(-camera.translateX, -camera.translateY);
		
		camera.ctx.drawImage(camera.bgImage, -14, -15, camera.bgImage.width, camera.bgImage.height);
		//camera.ctx.strokeStyle = '#f00'; //red
		//camera.ctx.strokeRect(-14, -15, camera.bgImage.width, camera.bgImage.height);
		//camera.ctx.strokeStyle = '#00f'; // blue
		//camera.ctx.strokeRect(clean0X, clean0Y, clean1X,  clean1Y);
		// console.log(camera.diagramShapes);
/*
		if (camera.diagramShapes != null){
			camera.ctx.strokeStyle = '#0f0';
			$.each(camera.diagramShapes.shapes, function (i, shape){
				camera.ctx.strokeRect(shape.X,  shape.Y , shape.W, shape.H);
			});				
		}
*/			
		
		//} else{
		//	alert('no canvas when drawing');
		//}


		//camera.canvasTag.html();
		camera.ctx.strokeStyle = '#0f0';
		 if (camera.diagramShapes != null){
			 $.each(camera.diagramShapes.shapes, function (i, shape){
				 camera.ctx.strokeRect(shape.X, shape.Y , shape.W, shape.H);
			 });
		 }		
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
			cameraHelper.push('<li>', 'Zoom : ' + getSimpleValue(camera.worldZoomLevel), '</li>');
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
			// console.log("loading flash");
			camera.clip.setText( contentHTML );
		});
		camera.clip.addEventListener( 'mouseOver', function(client) {
			// console.log("mouse over"); 
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
	
	//alert('apply changes');
//	console.log(camera);
		// check if the canvas real size didn't change
		camera.worldInitX = camera.canvasTag.width();
		camera.worldInitY = camera.canvasTag.height();
		if (isUnderIE9()){
			camera.worldInitX = camera.canvasTag.width();
			camera.worldInitY = camera.canvasTag.height();			
		}
		//alert('camera size after apply: ' + camera.worldInitX + ", " + camera.worldInitY);	

		// update worldZoom
		camera.worldZoomLevel *= camera.zoomFactor;	

		// update worldSize
		camera.ScreenSize.w = camera.worldInitX * 1 /camera.worldZoomLevel;			
		camera.ScreenSize.h = camera.worldInitY * 1 /camera.worldZoomLevel;	
	
//		// update translations
		camera.translateX += (camera.traX);
		camera.translateY += (camera.traY);
		
		//camera.translateX *= camera.zoomFactor;
		//camera.translateY *= camera.zoomFactor;
			
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
		

		camera.draw();
		camera.drawImage();

		camera.ctx.strokeStyle = '#00F'; // blue
		// BROWSE SHAPES SHOULD BE BACK
		browseShapesAndCallbackIfMouseOn(function(shape){
			camera.canvasTag.css('cursor', 'pointer');
			camera.ctx.strokeRect(shape.X,  shape.Y , shape.W, shape.H);
		});		
				
		// reset variables
		camera.zoomFactor = 1;
		camera.traX = 0;
		camera.traY = 0;		
		
		return;
	
	}
};




function getLayerMousePos(event){
	var offsetTop = $('#' + event.currentTarget.id).offset().top;
	var offsetLeft = $('#' + event.currentTarget.id).offset().left;


	var relMPX = event.pageX - offsetLeft;
	var relMPY = event.pageY - offsetTop;
	return {'x' : relMPX, 'y' : relMPY};	
}

// get the relative position of the mouse
function updateMouseRelativePos(event){

	//console.log('mouse in canvas : ' + relMPX + ', ' + relMPY);
//
	relMP = getLayerMousePos(event);
//+ camera.translateY
	var x = (relMP.x ) / camera.worldZoomLevel + camera.translateX;
	var y = (relMP.y ) / camera.worldZoomLevel + camera.translateY;
	camera.relativeMousePos = {'x' : x, 'y' : y};	
	camera.mousePourcentagePosition = {'x' : relMP.x / camera.worldInitX,
	 'y' : relMP.y / camera.worldInitY};	
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

function initCamera(diagram, bgImage, _diagramClickOT){
		camera.init(diagram, bgImage, _diagramClickOT);
		//camera.draw();
		$('#diagram-' +diagram.id).fadeIn(500);
}

// add an image in the canvas
function setImageInCanvas(selector, diagram, _diagramClickOT){
//ui-widget-content 
	
	var diagramID = diagram.id;
	//var _bgImage = new Image();
	//_bgImage.src = "../images/print/diagram" + diagramID + ".png";		
/*	alert('set image in canvas');*/
	
	//$(selector).height('99');
	//console.log('before setting canvas : ', camera.worldZoomLevel, ',', bgImage.width, ',',bgImage.height, ' screen:', $(selector).width(), ', ', $(selector).height());
	//" + CANVAS_FAIL_MESSAGE+ "
	var html = "<canvas class='ui-corner-all diagram-canvas' id='diagram-" + diagramID + "'>" + CANVAS_FAIL_MESSAGE+ "</canvas><ul class='cameraHelper' id='cameraHelper-diagram-" + diagramID + "'></ul>";
		
	
	html += createDiagramShare(diagram, diagram.diagramImage.src, "ui-corner-right");

	$(selector).html(html);


	initCamera(diagram, diagram.diagramImage, _diagramClickOT);		
	initDiagramShare('.diagramShare');
	
	camera.initClipboard(diagram.id);
	var diagramShare = $('#diagramShare-diagram-' + diagram.id);
	diagramShare.fadeOut();
	//camera.applyChanges();
	
	//_bgImage.onload = function (){
		//alert('image loaded : ' + _bgImage.src + ", " + camera.ctx);
		//camera.drawImage();

//		camera.ctx.strokeStyle = '#00f'; // blue
//		camera.ctx.strokeRect(0, 0, 200, 200);
	//}
	
	//initDiagramShare(selector);

}

function getSimpleValue(v){
	return (v + "").substring(0, 8);
}