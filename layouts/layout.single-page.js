/*global cwAPI:true */

var LayoutSinglePage = function (_css, _objectTypeName, setLink, parent) {
  this.css = _css;
  this.objectTypeName = _objectTypeName;
  this.setLink = setLink;
  this.parent = parent;
  cwAPI.appliedLayouts.push(this);
};
LayoutSinglePage.prototype.applyCSS = function () {};

LayoutSinglePage.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
  if (_.isUndefined(_object.associations[_associationKey])) {
    //console.log('draw association _associationKey[', _associationKey, '] don\'t exists for ', _object);
    return;
  }


  if (_object.associations[_associationKey].length > 0) {
    _.each(_object.associations[_associationKey], function (_child) {
      output.push('<h1>', _child.name, '</h1>');
      //console.log('LayoutSinglePage', callback);
      if (!_.isUndefined(callback)) {
        //console.log('LayoutSinglePage', _child);
        callback(output, _child);
      }
    }.bind(this));
  }
};
