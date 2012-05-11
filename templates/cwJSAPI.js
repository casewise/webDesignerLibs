/*global DiagramCanvas:true, alert:true, cwConfigs */

var cwAPI = {};
cwAPI.SharePoint = {};
cwAPI.appliedLayouts = [];

cwAPI.isUndefined = function (o) {
	return typeof (o) === "undefined";
};

cwAPI.SharePoint.createSharepointMenuSeparator = function () {
	return '<span class="s4-nothome s4-bcsep s4-titlesep"><span class="s4-clust ms-ltviewselectormenuseparator" style="height:11px;width:11px;position:relative;display:inline-block;overflow:hidden;"><img style="border-width:0px;position:absolute;left:-0px !important;top:-585px !important;" alt=":" src="/_layouts/images/fgimg.png"></span></span>';
};

cwAPI.SharePoint.createSharepointMenu = function (menuName, menuLink, level) {
	return '<h' + level + '><a href="' + menuLink + '">' + menuName + '</a></h' + level + '>';
};

cwAPI.SharePoint.appendMenuTitle = function (menuName, menuLink, level, lastLevel) {
	var output = [];
	output.push(cwAPI.SharePoint.createSharepointMenu(menuName, menuLink, level));
	if (!lastLevel) {
		output.push(cwAPI.SharePoint.createSharepointMenuSeparator());
	}
	$("td.s4-titletext").children().last().before(output.join(''));
};


cwAPI.createLinkForSingleView = function (view, id) {
	return "index." + cwConfigs.SITE_LINK_EXTENTION + "?cwtype=single&cwview=" + view + "&cwid=" + id;
};

cwAPI.createLinkForIndexView = function (view) {
	return "index." + cwConfigs.SITE_LINK_EXTENTION + "?cwtype=index&cwview=" + view;
};

cwAPI.putPropertiesInTable = function (output, pName, displayName, object, propertyType, type) {
	//console.log(object);
	var value = object.properties[pName];
	if (!_.isUndefined(type)) {
		value = value.substring(0, 10);
	}
	output.push('<tr><th class="property-title-', pName, '">', displayName, '</th><td class="property-value-', pName, '">', value, '</td></tr>');
};

cwAPI.createTable = function (output, name, mainObject, drawItems) {
	output.push('<li class="propertiesTable"><table class="propertiesTable">');
	output.push('<tr><th class="table-header ui-widget ui-widget-header" colspan="2">', name, '</th></tr>');
	drawItems(output, mainObject);
	output.push('</table></li>');
};


cwAPI.getDiagramPath = function(dID){
	return cwConfigs.SITE_MEDIA_PATH + 'webdesigner/generated/diagram/json/diagram' + dID + '.' + cwConfigs.JSON_EXTENTION;
}

cwAPI.getDiagram = function(dID, selectorID, callback) {
	$('#' + selectorID).html('');
	var el = document.createElement('canvas');
	el.id = selectorID + '-canvas';
	$('#' + selectorID).append(el);
	$('#' + el.id).addClass("diagram-canvas");
	$.getJSON(cwAPI.getDiagramPath(dID), function (jsonDiagramFile) {
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
			FNOP = function () {},
			FBound = function () {
			return fToBind.apply(this instanceof FNOP ? this : oThis || window, aArgs.concat(fSlice.call(arguments)));
		};
		FNOP.prototype = this.prototype;
		FBound.prototype = new FNOP();
		return FBound;
	};
}

// load a single page using 2 ajax calls (json then customJS)

function loadSinglePage(selector, pageName, jsonPageName) {
	$("head").append("<link type='text/css' rel='stylesheet' media='all' href='../webdesigner/handmade/" + pageName + "/" + pageName + ".css' />");
	$(selector).html("<ul class='embed' id='zone_" + pageName + "'></ul>");
	var myURL = "../webdesigner/generated/" + pageName + "/" + jsonPageName + '.json';
	cwAPI.loadScript(myURL, function () {
		cwAPI.loadScript("../webdesigner/handmade/" + pageName + "/" + pageName + ".js", function () {});
	});
}

// load a script and call a callback if first call success
cwAPI.loadScript = function (scriptURL, successCallback) {

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
};

/*function addAssociationBox(output, pName, pDisplayName, p){
	output.push("<li class='association-box association-", pName, "-box '><ul class='association-details association-", pName, "-details'><li class='association-title association-", pName, "-title'>", pDisplayName, "</li><li class='association-value association-", pName, "-value'>",(p[pName] != '') ? p[pName]: '&nbsp;',"</li></ul></li>");
}*/

function addPropertyBox(output, pName, pDisplayName, p, specialClass) {
	output.push("<li class='property-box property-", pName, "-box ", specialClass, "'><ul class='property-details property-", pName, "-details'><li class='property-details property-title property-", pName, "-title'>", pDisplayName, "</li><li class='property-details property-value property-", pName, "-value'>", (p[pName] !== '') ? p[pName] : '&nbsp;', "</li></ul></li>");
}


cwAPI.removeSearchEngineZone = function (text) {
	var out = text.replace(/<span class='webindex_item_found'>/gi, '');
	out = out.replace(/<\/span>/, '');
	return out;
};

function removeULBullets() {
	$('ul.properties-zone-area').css('margin', '0px').css('padding', '0px');

	$('ul.property-details').css('margin', '0px').css('padding', '0px');

	$('li.property-details').css('list-style', 'none');
	$('li.property-box').css('list-style', 'none');
}

function doActionsForSingle() {


	_.each(cwAPI.appliedLayouts, function (layout) {
		layout.applyCSS();
	});

	$('ul.properties-zone-area').css('margin', '0px').css('padding', '0px');
/*
	$('li.property-title').addClass('ui-corner-top ui-widget ui-widget-header');
	$('li.property-value').addClass('ui-corner-bottom');
	$('li.property-value').addClass('ui-widget ui-widget-content');

	$('li.property-title').css('text-align', 'center');
	//$('li.property-details').css('padding', '5px');

	//$('li.property-box').css('margin', '5px');

	$('li.property-box-normal').css('width', '200px').css('display', 'inline-block');


	$('li.property-box-normal .property-value').css('text-align', 'center');

	$('li.property-name').addClass('ui-corner-all ui-widget ui-widget-header');
	$('li.property-name').css('text-align', 'center').css('list-style', 'none').css('font-size', '2.5em').css('margin', '5px');



	if ($.browser.msie && $.browser.version === 7) {
		//$('li.property-box').css('width', '100%');
		$('li.property-box').css('float', 'left');
		$('li.property-box-memo').css('width', '100%');
		$('li.association-box').css('width', '100%');
		//$('ul.properties-zone-area').css('width', '100%');
	}*/

}

function doActionForCustomSingle() {}

function doActionForCustomSingle() {}





function setColumn3(selector) {
	var liSelector = "li." + selector;
	$(liSelector).css('width', '32%').css('display', 'inline-block').css('vertical-align', 'top').css('margin', '2px');
	if ($.browser.msie && $.browser.version === 7) {
		$(liSelector).css('float', 'left');
	}
	$(liSelector + ' li.node-header-title').css('width', '70%');
	$(liSelector + ' li.node-header-info').css('width', '30%');
}

function setColumn2(selector) {
	var liSelector = "li." + selector;
	$(liSelector).css('width', '49%').css('display', 'inline-block').css('vertical-align', 'top').css('margin', '5px');
	if ($.browser.msie && $.browser.version === 7) {
		$(liSelector).css('float', 'left');
	}
	$(liSelector + ' li.node-header-title').css('width', '70%');
	$(liSelector + ' li.node-header-info').css('width', '30%');
}

cwAPI.setupLanguage = function (language, libPathFromMain) {
	$.i18n.properties({
		"name": 'translations',
		"path": libPathFromMain + "i18n/translations/",
		"mode": "map",
		"language": language,
		"callback": function () {
			//console.log('i18n loaded');
		}
	});
};


function doLayoutsSpecialActionsLocal() {}

function doLayoutsSpecialActions() {

	//console.log();
	_.each(cwAPI.appliedLayouts, function (layout) {
		layout.applyCSS();
	});

	$('.navigation-icon').addClass('ui-icon ui-icon-info');
	$('.navigation-icon').click(function () {
		document.location.href = $(this).attr('href');
	});

	doLayoutsSpecialActionsLocal();

	/*	$('.standard-list-node-accordion').css('padding', '0px');
	$('.standard-list-node-accordion').css('margin', '0px');*/
}

cwAPI.isUnderIE9 = function () {
	var version = Math.floor($.browser.version);
	//console.log(version);
	if ($.browser.msie && version < 9) {
		//alert('under ie 9');
		return true;
	}
	return false;
};

function getCSSClassesDependingOnChildren(_hasChildrenCondition, _nodeName, _isAccordion) {
	var _liNameStyle, _divNameStyle, fakeAccordionLi, fakeAccordionDiv;

	fakeAccordionLi = '';
	fakeAccordionDiv = '';

	_liNameStyle = '';
	_divNameStyle = '';
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


cwAPI.setToolTipsOnTitles = function () {
	$('.tooltip-me').mouseover(function () {
//		$(this).css('cursor', 'help');
	});

	$('.tooltip-me-left').mouseover(function () {
//		$(this).css('cursor', 'help');
	});

	$('.tooltip-me-custom').mouseover(function () {
//		$(this).css('cursor', 'help');
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
};


function hasChildren(_o) {
	var sum, e;
	sum = 0;

	for (e in _o) {
		if (_o.hasOwnProperty(e)) {
			if (_.isArray(_o[e])) {
				sum += _o[e].length;
			}
		}
	}

	return sum > 0;
}






var LayoutListBoxDetailed = function (css, ogsName) {
	this.css = css;
	this.ogsName = ogsName;

	this.fakeAccordionLi = "ui-accordion ui-widget ui-helper-reset ui-accordion-icons";
	this.fakeAccordionDiv = "ui-accordion-header ui-helper-reset ui-state-default ui-corner-all";
	cwAPI.appliedLayouts.push(this);
};

LayoutListBoxDetailed.prototype.applyCSS = function () {};



LayoutListBoxDetailed.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
	var site_has_children_condition, nameStyle;

	//console.log(_object, ", ", _associationKey);
	if (_object[_associationKey].length > 0) {
		// output.push("<ul class='", this.css, "  standard-list-node standard-list-node-list'>");
		_.each(_object[_associationKey], function (one_object) {
			//console.log(one_object, ", ", _associationKey);
			site_has_children_condition = hasChildren(one_object);
			nameStyle = getCSSClassesDependingOnChildren(site_has_children_condition, _associationKey, false);

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
};


/*
cwAPI.drawListBox = function (layout, output, _associationTitleText, _object, _associationKey, listBoxName, callback) {
	var l, targetObject;
	if (_.isUndefined(_object[_associationKey])) {
		//console.log('draw association _associationKey[', _associationKey, '] don\'t exists for ', _object);
		return;
	}
	targetObject = _object[_associationKey];

	if (targetObject.length > 0) {
		output.push("<div class='property-box ", layout.css, "-box property-box-asso'>");
		output.push("<ul class='property-details ", layout.css, "-details ", layout.css, "-", _object.object_id, "-details'>");
		output.push("<li class='property-details ", layout.css, "-details property-title ", layout.css, "-title ", layout.css, "-", _object.object_id, "-details'>");
		output.push(listBoxName);
		output.push("</li>");
		output.push("<li class='property-details property-value ", layout.css, "-details ", layout.css, "-value ", layout.css, "-", _object.object_id, "-details'>");
		l = new LayoutList(layout.css, this.objectTypeName, layout.setLink);
		l.drawAssociations(output, _associationTitleText, _object, _associationKey, callback);
		output.push("</li>");
		output.push("</ul></div>");
	}
};*/

var LayoutListBoxObjectGroupName = function (_css, _objectTypeName, _objectGroupName, setLink) {
	this.css = _css;
	this.objectTypeName = _objectTypeName;
	this.objectGroupName = _objectGroupName;
	this.setLink = setLink;
	cwAPI.appliedLayouts.push(this);
};
LayoutListBoxObjectGroupName.prototype.applyCSS = function () {};

LayoutListBoxObjectGroupName.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
	cwAPI.drawListBox(this, output, _associationTitleText, _object, _associationKey, this.objectGroupName, callback);
};





var LayoutDataCenter = function (css, _technologyID, _emplacementID) {
	this.css = css;
	this.technologyID = _technologyID;
	this.emplacementID = _emplacementID;
	cwAPI.appliedLayouts.push(this);
};

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
			output.push('<td></td>');
		}
		output.push('</tr>');
	}.bind(this));
	output.push('</table></center>');

};

LayoutDataCenter.prototype.applyCSS = function () {
	$("table.LayoutDataCenterTable").css('border', "1px solid #eb8C00").css('border-collapse', 'collapse').css('width', '300px');
	$("table.LayoutDataCenterTable td").css('border', "1px solid #eb8C00").css('padding', '5px').css('width', '200px').css('text-align', 'center');
};




cwAPI.transformTabToVertical = function (selectorID) {
	$(selectorID).tabs().addClass('ui-tabs-vertical ui-helper-clearfix');
	$(selectorID + " li.tab-header").removeClass('ui-corner-top').addClass('ui-corner-left');
	$(selectorID + " .ui-tabs-panel").addClass('ui-widget ui-widget-content');
};



cwAPI.loadTopMenu = function () {
	var pagesURL, output;

	pagesURL = cwConfigs.SITE_MEDIA_PATH + "webdesigner/generated/pages." + cwConfigs.JSON_EXTENTION;
	cwAPI.getJSONFile(pagesURL, function (pages) {

		output = [];
		output.push('<ul class="cwMenuTop">');
		_.each(pages.index, function (page) {
			output.push('<li><a href="', page.link, '">', page.name, '</a></li>');
		});
		output.push('</ul>');
		$('#top_of_page').before(output.join(''));

	}, cwAPI.errorOnLoadPage);
};

cwAPI.hideLoadingImage = function () {
	$('.cwloading').hide();
};


