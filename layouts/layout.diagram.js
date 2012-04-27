/*global cwAPI:true, getDiagram:true*/

var LayoutDiagram = function (_css, _objectTypeName) {
  this.css = _css;
  this.objectTypeName = _objectTypeName;
  cwAPI.appliedLayouts.push(this);
  this.diagrams = [];
};

LayoutDiagram.prototype.applyCSS = function () {
  _.each(this.diagrams, function (d) {
    var diagramSelectorID = "diagram-" + this.css + "-" + d.object_id;
    $('#' + diagramSelectorID).prev().hover(function (e) {
      $(this).css('cursor', 'pointer');
    });

    // open by default
    //getDiagram(d.object_id, diagramSelectorID, function () {});
    // toggle on click    
    $('#' + diagramSelectorID).prev().click(function (e) {
      var htmlContent = $('#' + diagramSelectorID).html();
      if (htmlContent === "") {
        $('#' + diagramSelectorID).show('fast', function () {
          $('#' + diagramSelectorID).height('400px');
          $('#' + diagramSelectorID).html('');
          getDiagram(d.object_id, diagramSelectorID, function () {});
        });
      } else {
        $('#' + diagramSelectorID).hide('fast');
        $('#' + diagramSelectorID).html('');
      }
    });
  }.bind(this));
};

LayoutDiagram.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
  if (_.isUndefined(_object.associations[_associationKey])) {
    return;
  }
  if (_object.associations[_associationKey].length > 0) {
    output.push("<ul class='association-link-box association-link-box-", this.css, " ", this.css, "'>");
    _.each(_object.associations[_associationKey], function (_child) {
      output.push("<li class='" + this.css + "'><a class='diagram-toggle-link'>", _child.name, "</a>", "<div id='diagram-", this.css, "-", _child.object_id, "' class='diagram-zone' data-diagramid='", _child.object_id, "'></div>");
      this.diagrams.push(_child);
      if (!_.isUndefined(callback)) {
        callback(output, _child, _object);
      }
    }.bind(this));
    output.push('</li>');
    output.push("</ul>");
  }
};
