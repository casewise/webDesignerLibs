/*
* DiagramShare v0.1
*
* v0.1 2011/09/25 // setup
*/

function createDiagramShare(diagram, imgSource, corner){

	var output = Array();

	output.push("<ul id='diagramShare-diagram-" + diagram.id + "' class='diagramShare ui-widget ui-widget-content " + corner + "'>");	
	output.push("<li><a class='remarque' href='mailto:", MAIL_ADDRESS_FOR_DIAGRAM_FEEDBACK, "?subject=Remarque sur le diagram " + diagram.name + " (" + diagram.id+ ")'>Envoyer une remarque concernant le diagramme  " + diagram.name + "</a></li>");
	output.push("<li><a class='print' target='_blank' href='" + imgSource + "'>Ouvrir l'image du diagramme pour l'impression</a></li>");	
	output.push("<li><a id='copy-diagram-" + diagram.id + "' class='copyclipboard'>Copier le diagramme dans le presse-papier</a></li>");
	output.push("</ul>");
	
	return output.join('');
}

function initDiagramShare(mainSelector){
	$(mainSelector + ' a.remarque').button({icons :  {primary : 'ui-icon-mail-closed'}, text : false});
	$(mainSelector + ' a.print').button({icons :  {primary : 'ui-icon-print'}, text : false});
	$(mainSelector + ' a.copyclipboard').button({icons :  {primary : 'ui-icon-copy'}, text : false});
	$(mainSelector + ' a').tooltip({delay:250, showURL:false});
}