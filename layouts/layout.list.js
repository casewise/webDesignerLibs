/*global cwAPI:true */

var LayoutList = function (_css, _objectTypeName, setLink, parent) {
  this.css = _css;
  this.objectTypeName = _objectTypeName;
  this.setLink = setLink;
  this.parent = parent;
  cwAPI.appliedLayouts.push(this);
};
LayoutList.prototype.applyCSS = function () {};

LayoutList.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
  var itemDisplayName, titleOnMouseOver;
  //console.log("O", _object, _associationKey, _object.associations[_associationKey]);
  if (_.isUndefined(_object.associations[_associationKey])) {
    //console.log('draw association _associationKey[', _associationKey, '] don\'t exists for ', _object);
    return;
  }
  if (_object.associations[_associationKey].length > 0) {
    output.push("<ul class='association-link-box association-link-box-", this.css, " ", this.css, " ", this.css, "-", _object.object_id, "'>");
    _.each(_object.associations[_associationKey], function (_child) {
      //console.log(this.parent, _object, _child);
      if (!_.isUndefined(this.parent)) {
        if (this.parent.link_id === _child.link_id) {
          return;
        }
      }

      //console.log(_child);
      titleOnMouseOver = "";
      if (!_.isUndefined(_child.properties.description)) {
        titleOnMouseOver = _child.properties.description;
      }
      itemDisplayName = "<a class='" + this.css + " tooltip-me' href='" + _child.link_id + "' title='" + titleOnMouseOver + "'>" + _child.name + "</a>";
      if (this.setLink === false) {
        itemDisplayName = "<span class='" + this.css + "'>" + _child.name + "</span>";
      }

      output.push("<li class='association-link association-link-", this.css, " ", this.css, " ", this.css,"-", _child.object_id, "'><div class='", this.css, "'>", itemDisplayName, "</div>");
      if (!_.isUndefined(callback)) {
        callback(output, _child);
      }
      output.push("</li>");
    }.bind(this));
    output.push("</ul>");
  }
};

