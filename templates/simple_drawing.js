
// create a browse node
function createBrowseNode(id, name, displayProperty, follow, callback){
	return {"nodeID" : id, 'nodeName' : name, 'displayProperty' : displayProperty, "follow" : follow, 'callback' : callback};
}

// parent function draw the nodes recursively following provided nodes
function drawItemFollowingLevels(output, rootNode, levelNode, linkLastItem){
	//console.log(levelNode,  rootNode);
	output.push('<ul class="' + levelNode.nodeID + '">');		
		$.each(rootNode[levelNode.nodeID], function (i, subItem) {	
			if (subItem == null) return;
			recursiveDrawFollowingLevels(output, subItem, levelNode, linkLastItem);	
			//recursiveDraw(output, nodeID, subItem);
		});	
	output.push('</ul>');		
}



//draw the nodes recursively following provided nodes
function recursiveDrawFollowingLevels(output, node, levelNode, linkLastItem){
	// console.log(node);
	//console.log(levelNode);
	if (node == null) return;
	// console.log(levelNode);
	
	// create parentArea
	output.push('<li class="' + levelNode.nodeID + ' ui-corner-all">');
	
	/*
	output.push('<div class="' + levelNode.nodeID + '-title box-title">');
	 */
	 var descriptionTitle = (node.description != null) ? 'title="' + node.description + '"' : '';
	 var displayName = node[levelNode.displayProperty];
	if (levelNode.follow.length == 0){
		if (linkLastItem == true){
			output.push('<a href="' + node.link_id + '.htm" ' + descriptionTitle + ' class="tooltip-me">' + displayName + '</a>');
		} else {
			if (typeof(levelNode.callback)== 'undefined'){
				output.push('<span class="tooltip-me" ' + descriptionTitle + '>', displayName, '</span>');
				//output.push(node[levelNode.displayProperty]);
			}else{
				levelNode.callback(output, node);
			}			
			
		}
		
		// output.push(node.name);
	}else{
		
		output.push('<div class="' + levelNode.nodeID + '-title box-title tooltip-me" ' + descriptionTitle + '>', displayName, '<div class="titleHelp tooltip-me">' + levelNode.nodeName + '</div>','</div>');
		
	}
	/*
	output.push('</div>'); 
	*/
	
	
	for (var i = 0; i < levelNode.follow.length; ++i){
		var followLevelNode = levelNode.follow[i];
		// console.log(node);
		// console.log(levelNode);
		// console.log(followLevelNode);
		if (followLevelNode == null) continue;
		output.push('<ul class="' + followLevelNode.nodeID + '">');
		var followNode = node[followLevelNode.nodeID];
		// console.log("follownode");
		//console.log(followNode);
		$.each(followNode, function (abbr, subItem) {	
			if (subItem == null) return;
			recursiveDrawFollowingLevels(output, subItem, followLevelNode, linkLastItem);
		});		
		output.push('</ul>');			
			
	}
	
	
	output.push('</li>');
}

// draw simple associations
function simpleAssociationsDraw(output, list, name, linkOrNot){
	if (list != null && list.length > 0){
		output.push('<li>');
		output.push('<b>', name , ' :', '</b>');
		output.push('<ul>');
		$.each(list, function (i, a){
				if (linkOrNot){
					output.push('<li><a href="' , a.link_id, '.htm">', a.name,'</a></li>');			
				} else{
					output.push('<li>', a.name,'</li>');				
				}
				
		});
		output.push('</ul>'); 							
		output.push('</li>');
	}
}

function simplePropertyDraw(output, name, attributeValue){
	output.push('<li>');
	output.push('<b>', name , ' : ', '</b>');
	output.push(attributeValue);
	output.push('</li>');
}