
/*	var FluxHTMLDiagram = {
		mainObject : applicationcomposite,
		fluxRecus : 'flux_entrants',
		fluxEmis : 'flux_sortants',
		mainObjectFromFluxRecus : 'applications',
		mainObjectFromFluxEmis : 'applications',
		dataFromFluxRecus : 'messages',
		dataFromFluxEmis : 'messages'
	};*/


function createFluxContent(output, FluxHTMLDiagram, tableID){


var mainObject = FluxHTMLDiagram.mainObject;
var fluxRecus = mainObject[FluxHTMLDiagram.fluxRecus];
var fluxEmis = mainObject[FluxHTMLDiagram.fluxEmis];


/*console.log(mainObject);
console.log(fluxRecus);
console.log(fluxEmis);*/

var sizeFluxRecus = fluxRecus.length;
var sizeFluxEmis = fluxEmis.length;

var maxFlux = sizeFluxEmis;
if (sizeFluxRecus > maxFlux){
	maxFlux = sizeFluxRecus;
}


output.push('<table id="', tableID,'" class="ma_flux" cellspacing="10">');
for (var i = 0; i < maxFlux; ++i){
	output.push('<tr>');
	if (fluxRecus[i] != null){
		output.push('<td class="out-ma ui-corner-all">');
		//drawTrigramme(output, fluxRecus[i].ma_emis[0]);
		//output.push('<div class="trigramme">', moduleapplicatif.flux_recu[i].ma_emis[0].trigramme[0].name, '</div>');
		if (fluxRecus[i][FluxHTMLDiagram.mainObjectFromFluxRecus].length > 0){
		output.push('<a href="',fluxRecus[i][FluxHTMLDiagram.mainObjectFromFluxRecus][0].link_id,'.htm">', fluxRecus[i][FluxHTMLDiagram.mainObjectFromFluxRecus][0].name,'</a>');			
		}else{
			output.push('INCONNU');
		}
		
		
		output.push('</td>');
		output.push('<td class="flux-arrow">-></td>');
		output.push('<td class="flux-name">', fluxRecus[i].name);

		if (fluxRecus[i][FluxHTMLDiagram.dataFromFluxRecus] != null){
			output.push('<ul class="message-in-flux">');
			$.each(fluxRecus[i][FluxHTMLDiagram.dataFromFluxRecus], function (m, message){
				output.push('<li class="ui-corner-all  message-in-flux">', message.name, '</li>');
			});
			output.push('</ul>');
		}
		output.push( '</td>');

		output.push('<td class="flux-arrow">-></td>');
	}
	else{
		// pas de flux
		output.push('<td class="out-ma ui-corner-all empty"></td>');
		output.push('<td class="flux-arrow empty"></td>');
		output.push('<td class="flux-name empty"></td>');
		output.push('<td class="flux-arrow empty"></td>');
	}
	if (i == 0){
		output.push('<td class="main-ma ui-corner-all" rowspan="' , maxFlux , '">');
		//drawTrigramme(output, moduleapplicatif);
		//output.push('<div class="trigramme">', moduleapplicatif.trigramme[0].name, '</div>');
		output.push(mainObject.name);
		
		output.push('</td>');
	}else{
		//output.push('<td></td>');
	}
	if (fluxEmis[i] != null){
		output.push('<td class="flux-arrow">-></td>');
		output.push('<td class="flux-name">', fluxEmis[i].name);
		if (fluxEmis[i][FluxHTMLDiagram.dataFromFluxEmis] != null){
			output.push('<ul class="message-in-flux">');
			$.each(fluxEmis[i][FluxHTMLDiagram.dataFromFluxEmis], function (m, message){
				output.push('<li class="ui-corner-all message-in-flux">', message.name, '</li>');
			});
			output.push('</ul>');
		}


		output.push( '</td>');
		output.push('<td class="flux-arrow">-></td>');
		output.push('<td class="out-ma ui-corner-all">');
		//drawTrigramme(output, fluxEmis[i].ma_recus[0]);
		if (fluxEmis[i][FluxHTMLDiagram.mainObjectFromFluxEmis].length > 0){
		output.push('<a href="', fluxEmis[i][FluxHTMLDiagram.mainObjectFromFluxEmis][0].link_id,'.htm">', fluxEmis[i][FluxHTMLDiagram.mainObjectFromFluxEmis][0].name, '</a>');	
		}else{
			output.push('INCONNU');
		}
		
		
		output.push('</td>');

	}
	else{
		// pas de flux
		output.push('<td class="flux-arrow empty"></td>');
		output.push('<td class="flux-name empty"></td>');
		output.push('<td class="flux-arrow empty"></td>');
		output.push('<td class="out-ma empty ui-corner-all"></td>');

	}
	
	output.push('</tr>');
}
output.push('</table>');	

}
