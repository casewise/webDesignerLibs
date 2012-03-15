function isUndefined(o){
	return typeof (o) === "undefined";
}

function getDiagram(dID, selectorID){
	//console.log("GET DIAGRAM", dID, selectorID);
	//$('#' + selectorID).append('<canvas class="diagram-canvas" id="' + selectorID + '-canvas"></canvas>')
	var el = document.createElement('canvas');
	el.id = selectorID + '-canvas';
	$('#' + selectorID).append(el);
	//$('#' + selectorID).height($(window).height() + "px");
	$('#' + el.id).addClass("diagram-canvas");
	$.getJSON('../webdesigner/generated/diagram/json/diagram' + dID + '.json', function(jsonDiagramFile){
		//console.log("get json");
		new DiagramCanvas(dID, jsonDiagramFile, selectorID + "-canvas");
	});	
}

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
		$('ul.properties-zone-area')
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

	_.each(appliedLayouts, function(layout){
		layout.applyCSS();
	});


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
		//$('ul.properties-zone-area').css('width', '100%');
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

	$('ul.properties-zone-area')
		.css('margin', '0px')
		.css('padding', '0px');

	$('ul.properties-zone-area li.property-box')
		.css('width', '100%')
		.css('display', 'inline-block')
		.css('margin', '5px');

	$('ul.property-details')
		.css('margin', '0px')
		.css('padding', '0px');

	$('ul.properties-zone-area li.property-title')
		.css('width', '20%')
		.css('padding', '5px');
	$('ul.properties-zone-area li.property-value')
		.css('width', '70%')
		.css('padding', '5px');

	$('li.property-details')
		.css('display', 'inline-block')
		.css('vertical-align', 'top');

	if ($.browser.msie && $.browser.version == 7){
		$('li.property-box').css('width', '100%');
		$('li.property-details').css('float', 'left');
		$('ul.properties-zone-area').css('width', '100%');
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


function hasChildren(_o){
	var sum = 0;
	for(var e in _o){
		if (_.isArray(_o[e])){
			sum += _o[e].length;
		}
	}
	return sum > 0;
}



var appliedLayouts = [];


var LayoutListBoxDetailed = function(css, ogsName){
	this.css = css;
	this.ogsName = ogsName;

	this.fakeAccordionLi = "ui-accordion ui-widget ui-helper-reset ui-accordion-icons";
	this.fakeAccordionDiv = "ui-accordion-header ui-helper-reset ui-state-default ui-corner-all";
	appliedLayouts.push(this);
}
LayoutListBoxDetailed.prototype.applyCSS = function() {};



LayoutListBoxDetailed.prototype.drawAssociations = function(output, _associationTitleText, _object, _associationKey, callback) {
	 //console.log(_object, ", ", _associationKey);
	 if (_object[_associationKey].length > 0) {
    // output.push("<ul class='", this.css, "  standard-list-node standard-list-node-list'>");
     _.each(_object[_associationKey], function(one_object){
      	//console.log(one_object, ", ", _associationKey);
        var site_has_children_condition = hasChildren(one_object);
        var nameStyle = getCSSClassesDependingOnChildren(site_has_children_condition, _associationKey, false);

        output.push("<li class='" + this.css + " " + nameStyle.liNameStyle + " ", (!site_has_children_condition) ? this.fakeAccordionLi : '',"  '>");
        output.push("<div class='" + nameStyle.divNameStyle + " node-header ", (!site_has_children_condition) ? this.fakeAccordionDiv : '',"'>");
       
          output.push("<ul class='node-header'>");
            output.push("<li class='node-header-title'><span class='node-header-title-name tooltip-me' title=\"", one_object.description,"\">");
            output.push("<a href='",one_object.link_id,"'>",one_object.name,"</a>");
            output.push("</span></li>");
            output.push("<li class='node-header-info'><ul>");
              output.push("<li class='navigation-helpers site-navigation-helpers'><span class='navigation-icon tooltip-me' href='", one_object.link_id,"' title=\"Voir le détails de ", one_object.name,"\"></span></li>");
              output.push("<li class='object-groups-name site-object-groups-name'>" + this.ogsName + "</li>");
            output.push("</ul></li>");
          output.push("</ul>");
				output.push("</div>");
				if (!isUndefined(callback)){
					output.push("<ul>");
						callback(output, one_object);	
					output.push("</ul>");
				}
        output.push("</li>");
      }.bind(this));
    // output.push("</ul>");
  }
}


var LayoutListBox = function(_css, _objectTypeName){
	this.css = _css;
	this.objectTypeName = _objectTypeName;
	appliedLayouts.push(this);
} 
LayoutListBox.prototype.applyCSS = function() {};

LayoutListBox.prototype.drawAssociations = function(output, _associationTitleText, _object, _associationKey, callback) {
	if (isUndefined(_object[_associationKey])){
		//console.log('draw association _associationKey[', _associationKey, '] don\'t exists for ', _object);
		return;
	}
	var targetObject = _object[_associationKey];

	if (targetObject.length > 0){
    output.push("<li class='property-box ", this.css, "-box property-box-asso'>");
	    output.push("<ul class='property-details ", this.css, "-details'>");
		    output.push("<li class='property-details ", this.css, "-details property-title ", this.css, "-title'>");
		    output.push(_associationTitleText);
		    output.push("</li>");
	    output.push("<li class='property-details property-value ", this.css, "-details ", this.css, "-value'>");
	   	var l = new LayoutList(this.css, this.objectTypeName);
	    l.drawAssociations(output, _associationTitleText, _object, _associationKey, callback);
	    output.push("</li>");
    output.push("</ul></li>");
	}
};

var LayoutList = function(_css, _objectTypeName){
	this.css = _css;
	this.objectTypeName = _objectTypeName;
	appliedLayouts.push(this);
}
LayoutList.prototype.applyCSS = function() {};

LayoutList.prototype.drawAssociations = function(output, _associationTitleText, _object, _associationKey, callback) {
	if (isUndefined(_object[_associationKey])){
		console.log('draw association _associationKey[', _associationKey, '] don\'t exists for ', _object);
		return;
	}
	if (_object[_associationKey].length > 0){	    
	    output.push("<ul class='association-link-box association-link-box-", this.css, " ", this.css, "'>");
		    _.each(_object[_associationKey], function(_child){
		    	//console.log(_child);
		      output.push("<li class='association-link association-link-", this.css, " ", this.css, "'><div class='", this.css, "'><a class='", this.css, "' href='", _child.link_id ,"'>"+_child.name+"</a></div>");
		      if (!_.isUndefined(callback)){
		      	callback(output, _child);	
		      }		      
		      output.push("</li>");
		    }.bind(this));
			output.push("</ul>");					  
	}
};

var LayoutDataCenter = function(css, _technologyID, _emplacementID){
	this.css = css;
	this.technologyID = _technologyID; 
	this.emplacementID = _emplacementID; 
	appliedLayouts.push(this);
}

LayoutDataCenter.prototype.drawAssociations = function(output, _associationTitleText, _object, _associationKey, callback) {

	var showOnce = [];
/*	if (isUndefined(_object[_associationKey])){
		console.log('draw association _associationKey[', _associationKey, '] don\'t exists for ', _object);
		return;
	}*/
  output.push('<center><table class="LayoutDataCenterTable ',this.css , '">');
  	_.each(_object[_associationKey], function(emplacement){
  		//console.log(baie);
			output.push('<tr><td class="left-', this.css ,'">', emplacement.name,'</td>'); 
				var technologies = emplacement[this.technologyID];
				if (technologies.length > 0){
			  	_.each(technologies, function(technology){
			  		if (!_.include(showOnce, technology.object_id)){
			  			showOnce.push(technology.object_id);
				  		var emplacementNum = technology[this.emplacementID].length;			  		
							output.push('<td class="right-',this.css ,'" rowspan="', emplacementNum, '"><a href="', technology.link_id,'">',technology.name,'</a></td>');		
			  		}
			  	}.bind(this));
				}else{
					output.push('<td></td>')
				}
				output.push('</tr>');			
  	}.bind(this));	
 output.push('</table></center>');

};

LayoutDataCenter.prototype.applyCSS = function() {


$("table.LayoutDataCenterTable")
	.css('border', "1px solid #eb8C00")
	.css('border-collapse', 'collapse')
	.css('width', '300px');

$("table.LayoutDataCenterTable td")
	.css('border', "1px solid #eb8C00")
	.css('padding', '5px')
	.css('width', '200px')
	.css('text-align', 'center');
};
