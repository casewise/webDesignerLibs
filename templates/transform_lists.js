
//var decomFonc = ["fonctions" : ["ilots" : [ "quartiers" : ["zones" : []]]]];
function transformLevelsArrayToLevelNodes(levelArrayRoot){
	var thisNode = {};
	for (node in levelArrayRoot)
	{		
		// console.log(node);
		thisNode["nodeID"] = node;	
		thisNode["follow"] = Array();
		var children = levelArrayRoot[node];
		//console.log(children);
		if (children.length > 0){
			for (var i = 0; i < children.length; ++i){
				//console.log(children[i]);
				
				thisNode["follow"].push(transformLevelsArrayToLevelNodes(children[i]));
				//console.log('node child : ');
			//console.log(nodeChild);
				//thisNode["follow"].push(transformLevelsArrayToLevelNodes(nodeChild));
			}		
		}
		
		//thisNode['follow']) push(transformLevelsArrayToLevelNodes_rec(child));
	}	
	return thisNode;//transformLevelsArrayToLevelNodes_rec(levelArrayRoot);
}

//
function transformLevelsArrayToLevelNodes_rec(levelArrayRoot){
	// console.log(levelArrayRoot);
	var thisNode = {};
	thisNode["nodeID"] = levelArrayRoot[0];
	thisNode["follow"] = Array();
	for (child in levelArrayRoot)
	{		
		// console.log()
		//thisNode['follow'].push(transformLevelsArrayToLevelNodes_rec(child));
	}
	return thisNode;
}