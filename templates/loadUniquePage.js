/*global pageName : true, drawCurrentPageFunction : true*/

$(function () {

	var output, pageArguments, id, jsonFile, pageArgumentsWithPipes;

	output = [];
	$('body').css('cursor', 'wait');
	if ($(location).attr('href').indexOf('?') !== -1) {
		pageArguments = location.href.split('?');
		//console.log(pageArguments);
		id = pageArguments[1];
		if (id.indexOf('|') !== -1) {
			// has pipe
			pageArgumentsWithPipes = id.split('|');
			// get the last element
			id = pageArgumentsWithPipes[pageArgumentsWithPipes.length - 1];
		} else if (id.indexOf("%7c") !== -1) {
			pageArgumentsWithPipes = id.split("%7c");
			id = pageArgumentsWithPipes[pageArgumentsWithPipes.length - 1];
		}
		jsonFile = '../webdesigner/generated/' + pageName + '/json/' + pageName + id + '.json';
		//jsonFile = 'http://localhost:8080/publicationscw/APM/webdesigner/generated/' + pageName + '/json/' + pageName + id + '.json';

		$.ajax({
			"url": jsonFile,
			"dataType": "json",
			"success": function (o) {
				drawCurrentPageFunction(o);
				$('body').css('cursor', 'default');
			},
			"error": function (err) {
				if (err.status === 404) {
					output.push('The required item do not exists yet, please wait a few minutes before the item will be available.');
					$("div#zone_" + pageName).html(output.join(''));
				}
			}
		});

	} else {
		output.push('the provided url is missing the ' + pageName + ' ID');
		$('body').css('cursor', 'default');
	}
	$("div#zone_" + pageName).html(output.join(''));
});
