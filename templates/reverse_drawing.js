
function drawReverseNodes(output, node){
	// console.log("drawReverseNodes:");
	//console.log(node);
	if (node == null) return;
	
	output.push('<li class="' + node.nodeID + ' ui-corner-all">');
	
	var extra_classes = "";
	//if (node.children.length == 0) extra_classes = "";
	if (node.hasChild == true){
		var descriptionTitle = (node.node.description != null) ? 'title="' + node.node.description + '"' : '';
		output.push('<div class="' + node.nodeID + '-title box-title tooltip-me ' + extra_classes + '" ' + descriptionTitle + '>');

		if (node.callback == null){
			output.push(node.node[node.displayProperty]);
		}else{
			node.callback(output, node);
		}
		
		output.push('<div class="titleHelp tooltip-me" title="' + node.nodeName + '">' + node.nodeName + '</div>', '</div>');
		output.push('<ul class="' + node.nodeID + '">');
			for (var i in node.children){// node.children){
				drawReverseNodes(output, node.children[i]);
			}
		output.push('</ul>');		
	}else{
		output.push('', node.node.name, '');
	}

	output.push('</li>');
}

// parent function draw the nodes recursively following provided nodes
function reverseNodesDraw(output, rootNode, levelNode){
	var levelArray = {};
	output.push('<ul class="' + levelNode.nodeID + '">');
	var max_level = reverseNodesDrawRec(output, rootNode, levelNode, 0, levelArray);	
	//console.log(levelArray);	
	for (var n in levelArray[max_level - 1]){
		drawReverseNodes(output, levelArray[max_level - 1][n]);
	}	
	output.push('</ul>');
}

function reverseNodesDrawRec(output, node, levelNode, level, levelArrays){
	
	var max_level = 0;
	// create the level if required
	if (!(levelArrays[level] instanceof Object)){
		levelArrays[level] = {};
	}
	if (node == null) return;
	// create the node it don't exists
	createNode(node, levelNode, levelArrays, level);
	// normal node
	if (levelNode.follow.length != 0){
		for (var i = 0; i < levelNode.follow.length; ++i){
			var followLevelNode = levelNode.follow[i];
			var followNode = node[followLevelNode.nodeID];
			$.each(followNode, function (abbr, subItem) {	
				max_level = reverseNodesDrawRec(output, subItem, followLevelNode, level + 1, levelArrays);	
				// console.log(levelArrays);
				if (subItem != null){
					levelArrays[level + 1][subItem.object_id].children[node.object_id] = levelArrays[level][node.object_id];
					levelArrays[level + 1][subItem.object_id].hasChild = true;
				}
			});		
				
		}
	} else { //leaf
	}
	return max_level + 1;	
}


function createNode(node, levelNode, levelArrays, level){
	if (!(levelArrays[level][node.object_id] instanceof Object)){
		levelArrays[level][node.object_id] = {'nodeID' : levelNode.nodeID, 'node' : node, 'children' : {}, 'hasChild' : false, 'nodeName' : levelNode.nodeName, 'displayProperty' : levelNode.displayProperty, 'callback' : levelNode.callback};
	}else{
	}
}