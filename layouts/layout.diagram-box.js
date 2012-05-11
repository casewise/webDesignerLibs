/*global cwAPI:true, LayoutList:true, LayoutDiagram:true */

var LayoutDiagramBox = function (_css, _objectTypeName, setLink) {
  this.css = _css;
  this.objectTypeName = _objectTypeName;
  this.setLink = setLink;
  cwAPI.appliedLayouts.push(this);
};
LayoutDiagramBox.prototype.applyCSS = function () {
  $("ul." + this.css + "-details").css('margin', "0px").css('padding', '0px');
  $("li." + this.css + "-details").css('list-style', 'none');
  $("li." + this.css + "-title").addClass('ui-widget-header');
  $("li." + this.css + "-value").addClass('ui-widget-content');
};

LayoutDiagramBox.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
  cwAPI.drawListBox(LayoutDiagram, this, output, _associationTitleText, _object, _associationKey, _associationTitleText, callback);
};