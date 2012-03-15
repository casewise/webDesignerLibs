$(function(){
	var output = [];
	var pageName = "diagram";
	//console.log("Hi");
	if ($(location).attr('href').indexOf('?') != -1){
		var arguments = location.href.split('?');
		var id = arguments[1];
		getDiagram(id, 'diagram-canvas');
	} else {
		output.push('the provided url is missing the ' + pageName + ' ID');
	}
	$("body").append(output.join(''));
});


