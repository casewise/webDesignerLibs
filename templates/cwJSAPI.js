if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
    var fSlice = Array.prototype.slice,
    aArgs = fSlice.call(arguments, 1),
    fToBind = this,
    fNOP = function () {},
    fBound = function () {
      return fToBind.apply(this instanceof fNOP ? this : oThis || window,
        aArgs.concat(fSlice.call(arguments)));
      };
      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();
      return fBound;
    };
  }
  
// load a single page using 2 ajax calls (json then customJS)
function loadSinglePage(selector, pageName, jsonPageName){
	$("head").append("<link type='text/css' rel='stylesheet' media='all' href='../webdesigner/handmade/" + pageName + "/" + pageName + ".css' />");
	$(selector).html("<ul class='embed' id='zone_" + pageName + "'></ul>");	
	var myURL = "../webdesigner/generated/" + pageName + "/" + jsonPageName + '.json';
	loadScript(myURL, function(){
		loadScript("../webdesigner/handmade/" + pageName + "/" + pageName + ".js", function(){});
	});
}

// load a script and call a callback if first call success
function loadScript(scriptURL, successCallback){

	$.ajax({
		url : scriptURL,
		type:'GET',
		crossDomain : true,
		dataType:'script',
		success : function(data){
			eval(data);
			successCallback();
		},
		error : function (jqXHR, textStatus, errorThrown){
			alert(errorThrown);
		}
	});
}

/*function addAssociationBox(output, pName, pDisplayName, p){
	output.push("<li class='association-box association-", pName, "-box '><ul class='association-details association-", pName, "-details'><li class='association-title association-", pName, "-title'>", pDisplayName, "</li><li class='association-value association-", pName, "-value'>",(p[pName] != '') ? p[pName]: '&nbsp;',"</li></ul></li>");
}*/

function addPropertyBox(output, pName, pDisplayName, p, specialClass){
	output.push("<li class='property-box property-", pName, "-box ", specialClass, "'><ul class='property-details property-", pName, "-details'><li class='property-details property-title property-", pName, "-title'>", pDisplayName, "</li><li class='property-details property-value property-", pName, "-value'>",(p[pName] != '') ? p[pName]: '&nbsp;',"</li></ul></li>");
}


function removeULBullets(){
		$('ul.properties-zone')
		.css('margin', '0px')
		.css('padding', '0px');

		$('ul.property-details')
		.css('margin', '0px')
		.css('padding', '0px');

		$('li.property-details').css('list-style', 'none');
		$('li.property-box').css('list-style', 'none');


}

function doActionsForSingle()
{
	$('li.property-title').addClass('ui-corner-top ui-widget ui-widget-header');
	$('li.property-value').addClass('ui-corner-bottom');
	$('li.property-value').addClass('ui-widget ui-widget-content');		
	
	$('li.property-title').css('text-align', 'center');
	$('li.property-details').css('padding', '5px');

	$('li.property-box').css('margin', '5px');

	$('li.property-box-normal')
		.css('width', '200px')
		.css('display', 'inline-block');
		

	$('li.property-box-normal .property-value').css('text-align', 'center');

	$('li.property-name').addClass('ui-corner-all ui-widget ui-widget-header');
	$('li.property-name')
		.css('text-align', 'center')
		.css('list-style', 'none')
		.css('font-size', '2.5em')
		.css('margin', '5px');

	removeULBullets();

	if ($.browser.msie && $.browser.version == 7){
		//$('li.property-box').css('width', '100%');
		$('li.property-box').css('float', 'left');
		$('li.property-box-memo').css('width', '100%');
		$('li.association-box').css('width', '100%');
		//$('ul.properties-zone').css('width', '100%');
	}
}


function setColumn3(selector){
	var liSelector = "li." + selector;
	$(liSelector)
		.css('width', '32%')
		.css('display', 'inline-block')
		.css('vertical-align', 'top')
		.css('margin', '2px');
		if ($.browser.msie && $.browser.version == 7)
		{
			$(liSelector).css('float', 'left');
		}
		$(liSelector + ' li.node-header-title').css('width', '70%');
		$(liSelector + ' li.node-header-info').css('width', '30%');
}

function setColumn2(selector){
	var liSelector = "li." + selector;
	$(liSelector)
		.css('width', '49%')
		.css('display', 'inline-block')
		.css('vertical-align', 'top')
		.css('margin', '5px');
		if ($.browser.msie && $.browser.version == 7)
		{
			$(liSelector).css('float', 'left');
		}
		$(liSelector + ' li.node-header-title').css('width', '70%');
		$(liSelector + ' li.node-header-info').css('width', '30%');
}



/*function doActionsForSingle()
{
	$('li.property-title').addClass('ui-corner-left ui-widget ui-widget-header');
	$('li.property-value').addClass('ui-corner-right');
	$('li.property-value').addClass('ui-widget ui-widget-content');		

	$('ul.properties-zone')
		.css('margin', '0px')
		.css('padding', '0px');

	$('ul.properties-zone li.property-box')
		.css('width', '100%')
		.css('display', 'inline-block')
		.css('margin', '5px');

	$('ul.property-details')
		.css('margin', '0px')
		.css('padding', '0px');

	$('ul.properties-zone li.property-title')
		.css('width', '20%')
		.css('padding', '5px');
	$('ul.properties-zone li.property-value')
		.css('width', '70%')
		.css('padding', '5px');

	$('li.property-details')
		.css('display', 'inline-block')
		.css('vertical-align', 'top');

	if ($.browser.msie && $.browser.version == 7){
		$('li.property-box').css('width', '100%');
		$('li.property-details').css('float', 'left');
		$('ul.properties-zone').css('width', '100%');
	}
}*/

function doLayoutsSpecialActionsLocal(){}

function doLayoutsSpecialActions(){
	
	$('.navigation-icon').addClass('ui-icon ui-icon-info');
	$('.navigation-icon').click(function(){
		document.location.href = $(this).attr('href');
	});

	doLayoutsSpecialActionsLocal();

/*	$('.standard-list-node-accordion').css('padding', '0px');
	$('.standard-list-node-accordion').css('margin', '0px');*/
}

function isUnderIE9(){
	//console.log($.browser.version);
	if ($.browser.msie && $.browser.version < 9){
		//alert('under ie 9');
		return true;
	}
	return false;
}

function getCSSClassesDependingOnChildren(_hasChildrenCondition, _nodeName, _isAccordion)
{
	var _liNameStyle = ''
  var _divNameStyle = ''
    _liNameStyle = _nodeName + ' ' + _nodeName + '-has-children has-children';
    _divNameStyle = _nodeName + ' ' + _nodeName + '-has-children has-children';

  
  if (_hasChildrenCondition) {
    _liNameStyle = _nodeName + ' ' + _nodeName + '-has-children has-children';
    _divNameStyle = _nodeName + ' ' + _nodeName + '-has-children has-children';
  } else {
	    _liNameStyle =  _nodeName + ' ' + _nodeName + '-no-children no-children';
	    _divNameStyle =  _nodeName + ' ' + _nodeName + '-no-children no-children';  		  		
  	if (_isAccordion){
	    _liNameStyle += ' ' + fakeAccordionLi;
	    _divNameStyle += ' ' + fakeAccordionDiv;  		
  	}
  }

  _liNameStyle += " node-list";
  
  return {'liNameStyle' : _liNameStyle, 'divNameStyle' : _divNameStyle};
}


function setToolTipsOnTitles(){
	$('.tooltip-me').mouseover(function(){
		$(this).css('cursor', 'help');
	});

	$('.tooltip-me-left').mouseover(function(){
		$(this).css('cursor', 'help');
	});	
		
	$('.tooltip-me-custom').mouseover(function(){
		$(this).css('cursor', 'help');
	});	
	
	$('.tooltip-me').tooltip({showURL : false, fade : 250});
	$('.tooltip-me-left').tooltip({showURL : false, fade : 250, extraClass:'tooltip-left'});
	$('.tooltip-me-custom').tooltip({showURL : false, fade : 250, extraClass : 'tooltip-custom'});
}