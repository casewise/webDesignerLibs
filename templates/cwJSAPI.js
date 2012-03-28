var cwAPI = {};

cwAPI.isUndefined = function (o) {
	return typeof (o) === "undefined";
};


cwAPI.putPropertiesInTable = function(output, pName, displayName, object, propertyType, type) {
  var value = object[pName];
  if (!_.isUndefined(type)) {
    value = value.substring(0, 10);
  }
  output.push('<tr><th class="property-title-', pName, '">', displayName, '</th><td class="property-value-', pName, '">', value, '</td></tr>');
}

cwAPI.createTable = function(output, name, mainObject, drawItems) {
  output.push('<li class="propertiesTable"><table class="propertiesTable">');
  output.push('<tr><th class="table-header ui-widget ui-widget-header" colspan="2">', name, '</th></tr>');
  drawItems(output, mainObject);
  output.push('</table></li>');
}


function getDiagram(dID, selectorID, callback) {
	//console.log("GET DIAGRAM", dID, selectorID);
	//$('#' + selectorID).append('<canvas class="diagram-canvas" id="' + selectorID + '-canvas"></canvas>')
	$('#' + selectorID).html('');
	var el = document.createElement('canvas');
	el.id = selectorID + '-canvas';
	$('#' + selectorID).append(el);
	//$('#' + selectorID).height($(window).height() + "px");
	$('#' + el.id).addClass("diagram-canvas");
	$.getJSON('../webdesigner/generated/diagram/json/diagram' + dID + '.json', function (jsonDiagramFile) {
		//console.log("get json");
		var diagramCanvas = new DiagramCanvas(dID, jsonDiagramFile, selectorID);
		if (!_.isUndefined(callback)) {
			return callback(diagramCanvas);
		}
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
			return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(fSlice.call(arguments)));
		};
		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();
		return fBound;
	};
}

// load a single page using 2 ajax calls (json then customJS)

function loadSinglePage(selector, pageName, jsonPageName) {
	$("head").append("<link type='text/css' rel='stylesheet' media='all' href='../webdesigner/handmade/" + pageName + "/" + pageName + ".css' />");
	$(selector).html("<ul class='embed' id='zone_" + pageName + "'></ul>");
	var myURL = "../webdesigner/generated/" + pageName + "/" + jsonPageName + '.json';
	loadScript(myURL, function () {
		loadScript("../webdesigner/handmade/" + pageName + "/" + pageName + ".js", function () {});
	});
}

// load a script and call a callback if first call success

function loadScript(scriptURL, successCallback) {

	$.ajax({
		url: scriptURL,
		type: 'GET',
		crossDomain: true,
		dataType: 'script',
		success: function (data) {
			eval(data);
			successCallback();
		},
		error: function (jqXHR, textStatus, errorThrown) {
			alert(errorThrown);
		}
	});
}

/*function addAssociationBox(output, pName, pDisplayName, p){
	output.push("<li class='association-box association-", pName, "-box '><ul class='association-details association-", pName, "-details'><li class='association-title association-", pName, "-title'>", pDisplayName, "</li><li class='association-value association-", pName, "-value'>",(p[pName] != '') ? p[pName]: '&nbsp;',"</li></ul></li>");
}*/

function addPropertyBox(output, pName, pDisplayName, p, specialClass) {
	output.push("<li class='property-box property-", pName, "-box ", specialClass, "'><ul class='property-details property-", pName, "-details'><li class='property-details property-title property-", pName, "-title'>", pDisplayName, "</li><li class='property-details property-value property-", pName, "-value'>", (p[pName] != '') ? p[pName] : '&nbsp;', "</li></ul></li>");
}


function removeULBullets() {
	$('ul.properties-zone-area').css('margin', '0px').css('padding', '0px');

	$('ul.property-details').css('margin', '0px').css('padding', '0px');

	$('li.property-details').css('list-style', 'none');
	$('li.property-box').css('list-style', 'none');
}

function doActionsForSingle() {

	_.each(appliedLayouts, function (layout) {
		layout.applyCSS();
	});


	$('li.property-title').addClass('ui-corner-top ui-widget ui-widget-header');
	$('li.property-value').addClass('ui-corner-bottom');
	$('li.property-value').addClass('ui-widget ui-widget-content');

	$('li.property-title').css('text-align', 'center');
	$('li.property-details').css('padding', '5px');

	$('li.property-box').css('margin', '5px');

	$('li.property-box-normal').css('width', '200px').css('display', 'inline-block');


	$('li.property-box-normal .property-value').css('text-align', 'center');

	$('li.property-name').addClass('ui-corner-all ui-widget ui-widget-header');
	$('li.property-name').css('text-align', 'center').css('list-style', 'none').css('font-size', '2.5em').css('margin', '5px');

	removeULBullets();

	if ($.browser.msie && $.browser.version == 7) {
		//$('li.property-box').css('width', '100%');
		$('li.property-box').css('float', 'left');
		$('li.property-box-memo').css('width', '100%');
		$('li.association-box').css('width', '100%');
		//$('ul.properties-zone-area').css('width', '100%');
	}

	doActionForCustomSingle();
}

function doActionForCustomSingle() {

}


// transform un li en accordion
cwAPI.setAccordion = function (selector, childSelector, removeIfEmptyChildren) {

	var collapseClass = "ui-icon-circle-plus";
	var expandClass = "ui-icon-circle-minus";

	var collapse = "<span class='accordion ui-icon " + collapseClass + "'></span>";
	var expand = "<span class='accordion ui-icon " + expandClass + "'/>";

	//console.log(selector + " " + childSelector)
	$("li." + selector + " " + childSelector).hide();

	$("div." + selector).each(function (i, div) {

		//removeIfEmptyChildren = false;
		if (!_.isUndefined(removeIfEmptyChildren) && removeIfEmptyChildren) {
			if ($(div).next().length === 0) {
				var li = $(div).parent();
				var ul = li.parent();
				li.remove();
				if (ul.children().length === 0) {
					ul.remove();
				}
			}
		}


		if ($(div).next().length > 0) {
			$(div).children("a").before(collapse);

			$(div).click(function () {
				var span = $(this).children('span.accordion');
				var content = span
				if (span.hasClass(collapseClass)) {
					span.removeClass(collapseClass);
					span.addClass(expandClass);
				} else {
					span.removeClass(expandClass);
					span.addClass(collapseClass);
				}
				$(this).next().toggle('slow');
			});

			$(div).hover(function () {
				$(this).css('cursor', 'pointer');
			});
		} else {
			$(div).children("a").before(expand);
		}
	});

	/*	if ($(selector).length > 0 && $(selector).html().length === 0) {

	}*/
}



function setColumn3(selector) {
	var liSelector = "li." + selector;
	$(liSelector).css('width', '32%').css('display', 'inline-block').css('vertical-align', 'top').css('margin', '2px');
	if ($.browser.msie && $.browser.version == 7) {
		$(liSelector).css('float', 'left');
	}
	$(liSelector + ' li.node-header-title').css('width', '70%');
	$(liSelector + ' li.node-header-info').css('width', '30%');
}

function setColumn2(selector) {
	var liSelector = "li." + selector;
	$(liSelector).css('width', '49%').css('display', 'inline-block').css('vertical-align', 'top').css('margin', '5px');
	if ($.browser.msie && $.browser.version == 7) {
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

function doLayoutsSpecialActionsLocal() {}

function doLayoutsSpecialActions() {

	$('.navigation-icon').addClass('ui-icon ui-icon-info');
	$('.navigation-icon').click(function () {
		document.location.href = $(this).attr('href');
	});

	doLayoutsSpecialActionsLocal();

	/*	$('.standard-list-node-accordion').css('padding', '0px');
	$('.standard-list-node-accordion').css('margin', '0px');*/
}

cwAPI.isUnderIE9 = function () {
	//console.log($.browser.version);
	if ($.browser.msie && $.browser.version < 9) {
		//alert('under ie 9');
		return true;
	}
	return false;
}

function getCSSClassesDependingOnChildren(_hasChildrenCondition, _nodeName, _isAccordion) {
	var _liNameStyle = ''
	var _divNameStyle = ''
	_liNameStyle = _nodeName + ' ' + _nodeName + '-has-children has-children';
	_divNameStyle = _nodeName + ' ' + _nodeName + '-has-children has-children';
	if (_hasChildrenCondition) {
		_liNameStyle = _nodeName + ' ' + _nodeName + '-has-children has-children';
		_divNameStyle = _nodeName + ' ' + _nodeName + '-has-children has-children';
	} else {
		_liNameStyle = _nodeName + ' ' + _nodeName + '-no-children no-children';
		_divNameStyle = _nodeName + ' ' + _nodeName + '-no-children no-children';
		if (_isAccordion) {
			_liNameStyle += ' ' + fakeAccordionLi;
			_divNameStyle += ' ' + fakeAccordionDiv;
		}
	}
	_liNameStyle += " node-list";
	return {
		'liNameStyle': _liNameStyle,
		'divNameStyle': _divNameStyle
	};
}


function setToolTipsOnTitles() {
	$('.tooltip-me').mouseover(function () {
		$(this).css('cursor', 'help');
	});

	$('.tooltip-me-left').mouseover(function () {
		$(this).css('cursor', 'help');
	});

	$('.tooltip-me-custom').mouseover(function () {
		$(this).css('cursor', 'help');
	});

	$('.tooltip-me').tooltip({
		showURL: false,
		fade: 250
	});
	$('.tooltip-me-left').tooltip({
		showURL: false,
		fade: 250,
		extraClass: 'tooltip-left'
	});
	$('.tooltip-me-custom').tooltip({
		showURL: false,
		fade: 250,
		extraClass: 'tooltip-custom'
	});
}


function hasChildren(_o) {
	var sum = 0;
	for (var e in _o) {
		if (_.isArray(_o[e])) {
			sum += _o[e].length;
		}
	}
	return sum > 0;
}



var appliedLayouts = [];


var LayoutListBoxDetailed = function (css, ogsName) {
	this.css = css;
	this.ogsName = ogsName;

	this.fakeAccordionLi = "ui-accordion ui-widget ui-helper-reset ui-accordion-icons";
	this.fakeAccordionDiv = "ui-accordion-header ui-helper-reset ui-state-default ui-corner-all";
	appliedLayouts.push(this);
}
LayoutListBoxDetailed.prototype.applyCSS = function () {};



LayoutListBoxDetailed.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
	//console.log(_object, ", ", _associationKey);
	if (_object[_associationKey].length > 0) {
		// output.push("<ul class='", this.css, "  standard-list-node standard-list-node-list'>");
		_.each(_object[_associationKey], function (one_object) {
			//console.log(one_object, ", ", _associationKey);
			var site_has_children_condition = hasChildren(one_object);
			var nameStyle = getCSSClassesDependingOnChildren(site_has_children_condition, _associationKey, false);

			output.push("<li class='" + this.css + " " + nameStyle.liNameStyle + " ", (!site_has_children_condition) ? this.fakeAccordionLi : '', "  '>");
			output.push("<div class='" + nameStyle.divNameStyle + " node-header ", (!site_has_children_condition) ? this.fakeAccordionDiv : '', "'>");

			output.push("<ul class='node-header'>");
			output.push("<li class='node-header-title'><span class='node-header-title-name tooltip-me' title=\"", one_object.description, "\">");
			output.push("<a href='", one_object.link_id, "'>", one_object.name, "</a>");
			output.push("</span></li>");
			output.push("<li class='node-header-info'><ul>");
			output.push("<li class='navigation-helpers site-navigation-helpers'><span class='navigation-icon tooltip-me' href='", one_object.link_id, "' title=\"Voir le détails de ", one_object.name, "\"></span></li>");
			output.push("<li class='object-groups-name site-object-groups-name'>" + this.ogsName + "</li>");
			output.push("</ul></li>");
			output.push("</ul>");
			output.push("</div>");
			if (!_.isUndefined(callback)) {
				output.push("<ul>");
				callback(output, one_object);
				output.push("</ul>");
			}
			output.push("</li>");
		}.bind(this));
		// output.push("</ul>");
	}
}



cwAPI.drawListBox = function (layout, output, _associationTitleText, _object, _associationKey, listBoxName, callback) {
	if (_.isUndefined(_object[_associationKey])) {
		//console.log('draw association _associationKey[', _associationKey, '] don\'t exists for ', _object);
		return;
	}
	var targetObject = _object[_associationKey];

	if (targetObject.length > 0) {
		output.push("<div class='property-box ", layout.css, "-box property-box-asso'>");
		output.push("<ul class='property-details ", layout.css, "-details'>");
		output.push("<li class='property-details ", layout.css, "-details property-title ", layout.css, "-title'>");
		output.push(listBoxName);
		output.push("</li>");
		output.push("<li class='property-details property-value ", layout.css, "-details ", layout.css, "-value'>");
		var l = new LayoutList(layout.css, this.objectTypeName, layout.setLink);
		l.drawAssociations(output, _associationTitleText, _object, _associationKey, callback);
		output.push("</li>");
		output.push("</ul></div>");
	}
}

var LayoutListBoxObjectGroupName = function (_css, _objectTypeName, _objectGroupName, setLink) {
	this.css = _css;
	this.objectTypeName = _objectTypeName;
	this.objectGroupName = _objectGroupName;
	this.setLink = setLink;
	appliedLayouts.push(this);
}
LayoutListBoxObjectGroupName.prototype.applyCSS = function () {};

LayoutListBoxObjectGroupName.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
	cwAPI.drawListBox(this, output, _associationTitleText, _object, _associationKey, this.objectGroupName, callback);
};


var LayoutListBox = function (_css, _objectTypeName, setLink) {
	this.css = _css;
	this.objectTypeName = _objectTypeName;
	this.setLink = setLink;
	appliedLayouts.push(this);
}
LayoutListBox.prototype.applyCSS = function () {};

LayoutListBox.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
	cwAPI.drawListBox(this, output, _associationTitleText, _object, _associationKey, _associationTitleText, callback);
};

var LayoutList = function (_css, _objectTypeName, setLink, parent) {
	this.css = _css;
	this.objectTypeName = _objectTypeName;
	this.setLink = setLink;
	this.parent = parent;
	appliedLayouts.push(this);
}
LayoutList.prototype.applyCSS = function () {};

LayoutList.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
	if (_.isUndefined(_object[_associationKey])) {
		//console.log('draw association _associationKey[', _associationKey, '] don\'t exists for ', _object);
		return;
	}
	if (_object[_associationKey].length > 0) {
		output.push("<ul class='association-link-box association-link-box-", this.css, " ", this.css, "'>");
		_.each(_object[_associationKey], function (_child) {
			//console.log(this.parent, _object, _child);
			if (!_.isUndefined(this.parent)) {
				if (this.parent.link_id === _child.link_id) {
					return;
				}
			}

			//console.log(_child);
			var titleOnMouseOver = "";
			if (!_.isUndefined(_child["description"])) {
				titleOnMouseOver = _child["description"];
			}
			var itemDisplayName = "<a class='" + this.css + " tooltip-me' href='" + _child.link_id + "' title='" + titleOnMouseOver + "'>" + _child.name + "</a>";
			if (this.setLink === false) {
				itemDisplayName = "<span class='" + this.css + "'>" + _child.name + "</span>";
			}

			output.push("<li class='association-link association-link-", this.css, " ", this.css, "'><div class='", this.css, "'>", itemDisplayName, "</div>");
			if (!_.isUndefined(callback)) {
				callback(output, _child);
			}
			output.push("</li>");
		}.bind(this));
		output.push("</ul>");
	}
};

var LayoutDataCenter = function (css, _technologyID, _emplacementID) {
	this.css = css;
	this.technologyID = _technologyID;
	this.emplacementID = _emplacementID;
	appliedLayouts.push(this);
}

LayoutDataCenter.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {

	var showOnce = [];
	/*	if (isUndefined(_object[_associationKey])){
		console.log('draw association _associationKey[', _associationKey, '] don\'t exists for ', _object);
		return;
	}*/
	output.push('<center><table class="LayoutDataCenterTable ', this.css, '">');
	_.each(_object[_associationKey], function (emplacement) {
		//console.log(baie);
		output.push('<tr><td class="left-', this.css, '">', emplacement.name, '</td>');
		var technologies = emplacement[this.technologyID];
		if (technologies.length > 0) {
			_.each(technologies, function (technology) {
				if (!_.include(showOnce, technology.object_id)) {
					showOnce.push(technology.object_id);
					var emplacementNum = technology[this.emplacementID].length;
					output.push('<td class="right-', this.css, '" rowspan="', emplacementNum, '"><a href="', technology.link_id, '">', technology.name, '</a></td>');
				}
			}.bind(this));
		} else {
			output.push('<td></td>')
		}
		output.push('</tr>');
	}.bind(this));
	output.push('</table></center>');

};

LayoutDataCenter.prototype.applyCSS = function () {
	$("table.LayoutDataCenterTable").css('border', "1px solid #eb8C00").css('border-collapse', 'collapse').css('width', '300px');
	$("table.LayoutDataCenterTable td").css('border', "1px solid #eb8C00").css('padding', '5px').css('width', '200px').css('text-align', 'center');
};



var LayoutDiagram = function (_css, _objectTypeName) {
	this.css = _css;
	this.objectTypeName = _objectTypeName;
	appliedLayouts.push(this);
	this.diagrams = [];
}
LayoutDiagram.prototype.applyCSS = function () {

	_.each(this.diagrams, function (d) {

		var diagramSelectorID = "diagram-" + this.css + "-" + d.object_id;
		// open by default
		//getDiagram(d.object_id, diagramSelectorID, function () {});
		// toggle on click		
		$('#' + diagramSelectorID).prev().click(function (e) {
			//console.log($(this));
			var htmlContent = $('#' + diagramSelectorID).html();
			//console.log('htmlContent', htmlContent);
			if (htmlContent === "") {
				$('#' + diagramSelectorID).show('fast', function () {
					$('#' + diagramSelectorID).height('400px');
					$('#' + diagramSelectorID).html('');
					getDiagram(d.object_id, diagramSelectorID, function () {});
				});
			} else {
				$('#' + diagramSelectorID).hide('fast');
				$('#' + diagramSelectorID).html('');
			}


		});
	}.bind(this));

};

LayoutDiagram.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
	if (_.isUndefined(_object[_associationKey])) {
		//console.log('draw association _associationKey[', _associationKey, '] don\'t exists for ', _object);
		return;
	}
	if (_object[_associationKey].length > 0) {
		output.push("<ul class='association-link-box association-link-box-", this.css, " ", this.css, "'>");
		_.each(_object[_associationKey], function (_child) {
			output.push("<li class='" + this.css + "'><a class='diagram-toggle-link'>", _child.name, "</a>", "<div id='diagram-", this.css, "-", _child.object_id, "' class='diagram-zone' data-diagramid='", _child.object_id, "'></div>");
			//console.log(_child);
			this.diagrams.push(_child);

			if (!_.isUndefined(callback)) {
				//utput.push('<li class="children-', this.css, '">');
				callback(output, _child, _object);

			}
		}.bind(this));
		output.push('</li>');
		output.push("</ul>");
	}
};
