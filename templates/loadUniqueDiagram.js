$(function(){
	var output = [];
	var pageName = "diagram";
	if ($(location).attr('href').indexOf('?') != -1){
		var arguments = location.href.split('?');
		var id = arguments[1];
		$.getJSON('../webdesigner/generated/' + pageName + '/json/' + pageName + id + '.json', function(jsonDiagramFile){
			new DiagramCanvas(id, jsonDiagramFile, 'diagram-canvas');	
		});
	} else {
		output.push('the provided url is missing the ' + pageName + ' ID');
	}
	$("body").append(output.join(''));
});