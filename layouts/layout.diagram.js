/*global cwAPI:true, getDiagram:true*/

var LayoutDiagram = function (_css, _objectTypeName) {
  this.css = _css;
  this.objectTypeName = _objectTypeName;
  cwAPI.appliedLayouts.push(this);
  this.diagrams = [];
};

LayoutDiagram.prototype.applyCSS = function () {
  $('ul.' + this.css).css('margin', '0px').css('padding', '0px');
  $('li.' + this.css).css('margin', '0px').css('padding', '0px').css('list-style', 'none');

  var h = $('div.diagram-zone-' + this.css).height();
  $('div.diagram-zone-' + this.css + " canvas").css("height", (h - 18) + "px");
  _.each(this.diagrams, function (d) {
    var diagramSelectorID = "diagram-" + this.css + "-" + d.object_id;
    $('#' + diagramSelectorID).prev().hover(function (e) {
      $(this).css('cursor', 'pointer');
    });

    // open by default
    //getDiagram(d.object_id, diagramSelectorID, function () {});
    // toggle on click    
/*    $('#' + diagramSelectorID).prev().click(function (e) {
      var htmlContent = $('#' + diagramSelectorID).html();
      if (htmlContent === "") {
        $('#' + diagramSelectorID).show('fast', function () {
          //$('#' + diagramSelectorID).css('min-height', '400px');
          $('#' + diagramSelectorID).html('');
          cwAPI.getDiagram(d.object_id, diagramSelectorID, function () {});
        });
      } else {
        $('#' + diagramSelectorID).hide('fast');
        $('#' + diagramSelectorID).html('');
      }
    });*/
  }.bind(this));
};

LayoutDiagram.prototype.drawAssociations = function (output, _associationTitleText, _object, _associationKey, callback) {
  if (_.isUndefined(_object.associations[_associationKey])) {
    return;
  }
  if (_object.associations[_associationKey].length > 0) {
    output.push("<ul class='association-link-box association-link-box-", this.css, " ", this.css, "'>");
    _.each(_object.associations[_associationKey], function (_child) {
      output.push("<li class='" + this.css + "'>");
      //output.push("<div class='",this.css, "'><a class='diagram-toggle-link'>", _child.name, "</a></div>");
      output.push("<div id='diagram-", this.css, "-", _child.object_id, "' class='diagram-zone diagram-zone-", this.css ,"' data-diagramid='", _child.object_id, "'></div>");
      this.diagrams.push(_child);
      if (!_.isUndefined(callback)) {
        callback(output, _child, _object);
      }
    }.bind(this));
    output.push('</li>');
    output.push("</ul>");
  }
};
