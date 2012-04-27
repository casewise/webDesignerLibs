/*global cwAPI:true, LayoutList:true */


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


/*

var LayoutDiagram = function (_css, _objectTypeName) {
  this.css = _css;
  this.objectTypeName = _objectTypeName;
  cwAPI.appliedLayouts.push(this);
  this.diagrams = [];

};
LayoutDiagram.prototype.applyCSS = function () {

  _.each(this.diagrams, function (d) {
    //console.log(d);
    var diagramSelectorID = "diagram-" + this.css + "-" + d.object_id;


    $('#' + diagramSelectorID).prev().hover(function (e) {
      $(this).css('cursor', 'pointer');
    });

    // open by default
    //getDiagram(d.object_id, diagramSelectorID, function () {});
    // toggle on click    
    $('#' + diagramSelectorID).prev().click(function (e) {
      //console.log($(this));
      var htmlContent = $('#' + diagramSelectorID).html();
      //console.log('htmlContent', htmlContent);
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
  if (_.isUndefined(_object[_associationKey])) {
    //console.log('draw association _associationKey[', _associationKey, '] don\'t exists for ', _object);
    return;
  }
  if (_object[_associationKey].length > 0) {
    output.push("<ul class='association-link-box association-link-box-", this.css, " ", this.css, "'>");
    _.each(_object[_associationKey], function (_child) {
      output.push("<li class='" + this.css + "'><a class='diagram-toggle-link'>", _child.name, "</a>", "<div id='diagram-", this.css, "-", _child.object_id, "' class='diagram-zone' data-diagramid='", _child.object_id, "'></div>");
      //console.log(_child);
      this.diagrams.push(_child);

      if (!_.isUndefined(callback)) {
        //utput.push('<li class="children-', this.css, '">');
        callback(output, _child, _object);

      }
    }.bind(this));
    output.push('</li>');
    output.push("</ul>");
  }
};
*/