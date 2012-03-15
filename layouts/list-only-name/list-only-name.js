var Layout = function(){
	
} 

Layout.prototype.drawAssociations = function(_associationTitleText, _object, _associationKey) {
	if (object[_associationKey].length > 0){
    output.push("<li class='property-box diagram-box'>");
	    output.push("<ul class='property-details diagram-details'>");
		    output.push("<li class='property-details diagram-details property-title diagram-title'>");
		    output.push(_associationTitleText);
		    output.push("</li>");
	    output.push("<li class='property-details diagram-details property-value diagram-value'><ul class='association-link-box'>");
		    _.each(_object[_associationKey], function(_child){
		      output.push("<li class='association-link'><a href='", _child.unique_page_link_id ,"'>"+_child.name+"</a></li>");
		    });
	    output.push("</ul></li>");
    output.push("</ul></li>");
	}
};