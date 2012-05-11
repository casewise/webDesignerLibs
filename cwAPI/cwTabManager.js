/*global cwAPI :true*/

var cwTabManager = {};
// active the tabs
cwTabManager.loadTab = function (tabID) {
	var diagramID, designID, design;
	$(tabID).find('div.diagram-zone').each(function (i, diagramZone) {
		diagramID = $(diagramZone).attr('data-diagramid');
		cwAPI.getDiagram(diagramID, $(diagramZone).attr('id'), function () {});
	});
	$(tabID).find('div.diagram-designer-zone').each(function (i, diagramDesignerZone) {
		$(diagramDesignerZone).addClass("property-box");
		designID = $(diagramDesignerZone).attr('data-designid');
		design = $('body').data('design' + designID);
		design.clean();
		design.createCanvas();
	});

	cwAPI.loadWorldMap($(tabID));

	/*	$(tabID).find('canvas.world-map').each(function (i, canvasWorld) {
		var itemKey = $(canvasWorld).attr('data-itemkey');
		var id = $(canvasWorld).attr('id');
		var countries = $(canvasWorld).attr('data-countries');
		$(canvasWorld).remove();
		$(canvasWorld).css('width', '200px');
		cwAPI.countriesToMapFromStringCountries(itemKey, id, countries);
	});
*/
};

cwTabManager.activeTab = function (selector) {
	$(".tab-content").each(function (i, tab) {
		var htmlContent = $(tab).html();
		//console.log('htmlContent', htmlContent, htmlContent.length, $(tab).attr('id'));
		if (htmlContent.length === 0) {

			$('.header-' + $(tab).attr('id')).remove();
			$(tab).remove();
		}
	});

	$(selector).tabs({
		"show": function (event, ui) {
			var tabID = ui.tab.hash;
			cwTabManager.loadTab(tabID);
			//var re = /#\w+$/;
			//var url = document.location.toString();
			//document.location.hash = ui.panel.id;
/*			$('body').scrollTop({
				"top": 0
			});*/
		},
		"cookie": {
			// store cookie for a day, without, it would be a session cookie
			expires: 1
		}
	});
	$(selector).bind('tabsshow', function (event, ui) {
		//console.log('show', ui);
	});


	$(selector + " .ui-tabs-nav").removeClass('ui-widget-header');
	cwTabManager.resizeTabContent(selector);
	//$(selector).tabs('select', 0);
	// show default tab
	var selectedTabID = $(selector + " .ui-tabs-selected a").attr('href');
	cwTabManager.loadTab(selectedTabID);
	
	$(window).resize(function () {
		cwTabManager.resizeTabContent(selector);
	});
};


cwTabManager.resizeTabContent = function (selector) {
	var firstLi, offset, leftMenuSize, maximumSize, sizeContent;
	firstLi = $(selector + " .ui-tabs-nav li.tab-header").first();
	if (firstLi.length > 0) {
		offset = firstLi.offset();
		leftMenuSize = offset.left + firstLi.width();
		maximumSize = $(window).width();
		sizeContent = maximumSize - leftMenuSize - 10 - 50 - 40;
		//console.log(sizeContent);
		$(selector + " .tab-content").css('width', sizeContent);
	}
};



// add a tab title
cwTabManager.createTextTab = function (output, selector, name, icon, tabID) {
	output.push('<li class="', tabID, '-header tab-header header-' + selector + '"><a href="#', selector, '"><span class="ui-icon ui-icon-', icon, '"></span>', name, '</a></li>');
};

// create content for a tab
cwTabManager.createTextTabContent = function (output, selector, content_callback) {
	output.push('<div id="', selector, '" class="tab-content">');
	content_callback(output);
	output.push('</div>');
};


// create a diagram tab

/*function createDiagramTab(output, mainItem, diagramCategory, savedDiagrams, tabName, activeItems) {
	$.each(mainItem.diagramsExploded, function (abbr, diagrams) {
		$.each(diagrams, function (dKey, d) {
			if (abbr === diagramCategory) {
				output.push('<li><a href="#tabs-diagram-' + d.id + '"><span class="ui-icon ui-icon-image"></span>', tabName, '</a></li>');
				d.activeItems = activeItems;
				d.diagramImage = new Image();
				d.diagramImage.src = "../images/print/diagram" + d.id + ".png";
				savedDiagrams[d.id] = d;
			}
		});
	});
}

// create the diagram tab content

function createDiagramTabContent(output, mainItem, diagramCategory) {
	$.each(mainItem.diagramsExploded, function (abbr, diagrams) {
		$.each(diagrams, function (dKey, d) {
			if (abbr === diagramCategory) {
				output.push('<div id="tabs-diagram-' + d.id + '" class="diagramTabContent">');
				output.push('</div>');
			}
		});
	});
}*/
