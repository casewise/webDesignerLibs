/*global cwAPI:true, cwConfigs : true */

var LayoutAPMApplication = function (_css, _objectTypeName, setLink, parent) {
  this.css = _css;
  this.objectTypeName = _objectTypeName;
  this.setLink = setLink;
  this.parent = parent;
  cwAPI.appliedLayouts.push(this);
};
LayoutAPMApplication.prototype.applyCSS = function () {};

LayoutAPMApplication.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
  if (_.isUndefined(_object.associations[_associationKey])) {
    //console.log('FAIL',_object, _associationKey);
    return;
  }
  if (_object.associations[_associationKey].length > 0) {
    output.push("<ul class='", this.css, "'>");
    _.each(_object.associations[_associationKey], function (_child) {
      output.push('<li class="', this.css, ' ui-corner-all">');
      output.push('<div class="', this.css, '"><a href="', _child.link_id, '">', _child.name, '</a></div>');
      
      //console.log(_child);
      var locations = _child.associations.location_20055;
      if (!_.isUndefined(locations) && locations.length > 0) {
        output.push('<ul class="location-flag">');
        _.each(locations, function (location) {
          if (location.properties.isocode === "") {
            return;
          }
          output.push('<li class="location-flag"><img class="tooltip-me" title="', location.name, '" src="', cwConfigs.SITE_MEDIA_PATH, '/images/flags/', location.properties.isocode.toLowerCase(), '.png"/></li>');
        }.bind(this));
        output.push('</ul>');
      }
      output.push('</li>');
    }.bind(this));
    output.push('</ul>');
  }
};
