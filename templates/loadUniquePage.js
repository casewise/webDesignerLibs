$(function(){
	var output = [];
	$('body').css('cursor', 'wait');
	if ($(location).attr('href').indexOf('?') != -1){
		var arguments = location.href.split('?');
		var id = arguments[1];
		var jsonFile = '../webdesigner/generated/' + pageName + '/json/' + pageName + id + '.json';		
		$.getJSON(jsonFile, function(o){
			drawCurrentPageFunction(o);
			$('body').css('cursor', 'default');
		});
	} else {
		output.push('the provided url is missing the ' + pageName + ' ID');
		$('body').css('cursor', 'default');
	}
	$("div#zone_" + pageName).html(output.join(''));
});