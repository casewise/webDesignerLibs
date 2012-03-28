

var cwTabManager = {};
// active the tabs
cwTabManager.activeTab = function(selecor){


	$(".tab-content").each(function(i, tab){
		var htmlContent = $(tab).html();
		//console.log('htmlContent', htmlContent, htmlContent.length, $(tab).attr('id'));
		if (htmlContent.length === 0){
			
			$('.header-' + $(tab).attr('id')).remove();
			$(tab).remove();
		}
	});

	$(selecor).tabs({
		"show": function(event, ui) { 
			var tabID = ui.tab.hash;
			//console.log("tabID", tabID);
			$(tabID).find('div.diagram-zone').each(function(i, diagramZone){
				//console.log("diagramZone", diagramZone);
				var diagramID = $(diagramZone).attr('data-diagramid');
				$(diagramZone).css('height', '400px');
				//console.log("diagramID", diagramID);
				getDiagram(diagramID, $(diagramZone).attr('id'), function () {});
			});

			//console.log($('body').data());
			$(tabID).find('div.diagram-designer-zone').each(function(i, diagramDesignerZone){
				//console.log("diagramDesignerZone", diagramDesignerZone);
				//var diagramID = $(diagramDesignerZone).attr('data-diagramid');
				//console.log("diagramID", diagramID);
				var designID = $(diagramDesignerZone).attr('data-designid');
				var design = $('body').data('design' + designID);
				//console.log("DESIGN", design);

				design.clean();
				design.createCanvas();

			});			
		}
	});
};



// add a tab title
cwTabManager.createTextTab = function(output, selector, name, icon){
	output.push('<li class="tab-header header-' + selector + '"><a href="#', selector,'"><span class="ui-icon ui-icon-', icon, '"></span>', name ,'</a></li>');
};

// create content for a tab
cwTabManager.createTextTabContent = function(output, selector, content_callback, title){
		output.push('<div id="', selector, '" class="tab-content">');
			content_callback(output);
		output.push('</div>');	
};


// create a diagram tab
function createDiagramTab(output, mainItem, diagramCategory, savedDiagrams, tabName, activeItems){
	$.each(mainItem.diagramsExploded, function (abbr, diagrams){
		$.each(diagrams, function (dKey, d){								
			if (abbr === diagramCategory){
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
function createDiagramTabContent(output, mainItem, diagramCategory){
	$.each(mainItem.diagramsExploded, function (abbr, diagrams){
		$.each(diagrams, function (dKey, d){								
			if (abbr === diagramCategory){
				output.push('<div id="tabs-diagram-' + d.id + '" class="diagramTabContent">');	
				output.push('</div>');							
			}
		});
	});
}