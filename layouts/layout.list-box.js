/*global cwAPI:true, LayoutList:true */


var LayoutListBox = function (_css, _objectTypeName, setLink) {
  this.css = _css;
  this.objectTypeName = _objectTypeName;
  this.setLink = setLink;
  cwAPI.appliedLayouts.push(this);
};
LayoutListBox.prototype.applyCSS = function () {
  $("ul." + this.css + "-details").css('margin', "0px").css('padding', '0px');
  $("li." + this.css + "-details").css('list-style', 'none');
  $("li." + this.css + "-title").addClass('ui-widget-header');//.css('padding-left', '5px');
  //$("li." + this.css + "-value").addClass('ui-widget-content');//.css('padding', '5px');
  //$("li." + this.css + "-title").css('border', "2px solid blue");
};

LayoutListBox.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
  cwAPI.drawListBox(LayoutList, this, output, _associationTitleText, _object, _associationKey, _associationTitleText, callback);
};

if (_.isUndefined(cwAPI)){
  var cwAPI = {};
}
cwAPI.drawListBox = function (NextLayout, layout, output, _associationTitleText, _object, _associationKey, listBoxName, callback) {
  var l, targetObject;
  if (_.isUndefined(_object.associations[_associationKey])) {
    //console.log('draw association _associationKey[', _associationKey, '] don\'t exists for ', _object);
    return;
  }
  targetObject = _object.associations[_associationKey];

  if (targetObject.length > 0) {
    output.push("<div class='property-box ", layout.css, "-box property-box-asso'>");
    output.push("<ul class='property-details ", layout.css, "-details ", layout.css, "-", _object.object_id, "-details'>");
    output.push("<li class='property-details ", layout.css, "-details property-title ", layout.css, "-title ", layout.css, "-", _object.object_id, "-details'>");
    output.push(listBoxName);
    output.push("</li>");
    output.push("<li class='property-details property-value ", layout.css, "-details ", layout.css, "-value ", layout.css, "-", _object.object_id, "-details'>");
    l = new NextLayout(layout.css, this.objectTypeName, layout.setLink);
    l.drawAssociations(output, _associationTitleText, _object, _associationKey, callback);
    output.push("</li>");
    output.push("</ul></div>");
  }
};