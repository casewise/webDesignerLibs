// active the tabs
function activeTab(selecor, savedDiagrams){
	$(selecor).tabs({
		show: function(event, ui) { 
			var tabID = ui.tab.hash;
			//alert('show tab : ' + tabID);
			if (tabID.indexOf('tabs-diagram') >= 0){
				var dID = tabID.replace("#tabs-diagram-", '');

				//console.log(dID);
				var d = savedDiagrams[dID];
				//console.log(d);
				var selector = '#tabs-diagram-' + dID;
//				d.diagramImage = new Image();
//				d.diagramImage.src = "../images/print/diagram" + dID + ".png";
				setImageInCanvas(selector, d, d.activeItems);		
				//camera.applyChanges();
			}
		}
	});

/*	$(selecor).bind( "tabsload", function(event, ui) {
		alert('loaded !');
	});
*/
		
}

// add a tab title
function createTextTab(output, selector, name, icon){
	output.push('<li><a href="#', selector,'"><span class="ui-icon ui-icon-', icon, '"></span>', name ,'</a></li>');
}

// create content for a tab
function createTextTabContent(output, selector, content_callback, title){
		output.push('<div id="', selector, '" class="">');
			if (title != null){
				output.push("<h3 class='ui-widget-header ui-corner-all page-title'>Fonctions implementés par ", title, "</h3>");				
			}
			content_callback(output);
		output.push('</div>');	
}


// create a diagram tab
function createDiagramTab(output, mainItem, diagramCategory, savedDiagrams, tabName, activeItems){
	$.each(mainItem.diagramsExploded, function (abbr, diagrams){
		$.each(diagrams, function (dKey, d){								
			if (abbr == diagramCategory){
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
			if (abbr == diagramCategory){
				output.push('<div id="tabs-diagram-' + d.id + '" class="diagramTabContent">');	
				output.push('</div>');							
			}
		});
	});
}