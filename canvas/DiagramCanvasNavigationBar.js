/*global DiagramCanvas: true*/

DiagramCanvas.prototype.setUpNavigationBar = function (diagramID) {
  this.searchID = this.canvasID + '-search';
  this.createNavigationBar(diagramID, "ui-corner-all");
  this.initDiagramNavigation("#" + $(this.canvas).parent().attr('id'));

  $("#" + this.searchID).keyup(function () {
    var value = $("#" + this.searchID).val();
    this.createRenderContext();
    this.camera.update();
    this.tick();
  }.bind(this));
};


DiagramCanvas.prototype.createNavigationBar = function (diagramID, corner) {
  var output, diagramNavigationID;
  output = [];
  diagramNavigationID = "diagramNavigation-diagram-" + diagramID;
  output.push("<ul id='" + diagramNavigationID + "' class='diagramNavigation " + corner + "'>");
  output.push("<li class='diagramNavigation-li'><a class='diagram-zoomin diagram-zoom tooltip-me" + corner + "' title='<div class=\"simpleText\">", $.i18n.prop("diagram_navigation_zoom_in"), "</div>'>", $.i18n.prop("diagram_navigation_zoom_in"), "</a></li>");
  output.push("<li class='diagramNavigation-li'><a class='diagram-zoomout diagram-zoom tooltip-me" + corner + "' title='<div class=\"simpleText\">", $.i18n.prop("diagram_navigation_zoom_out"), "</div>'>", $.i18n.prop("diagram_navigation_zoom_out"), "</a></li>");
  output.push("<li class='diagramNavigation-li'><a class='diagram-resize diagram-zoom tooltip-me" + corner + "' title='<div class=\"simpleText\">", $.i18n.prop("diagram_navigation_resize"), "</div>'>", $.i18n.prop("diagram_navigation_resize"), "</a></li>");

  output.push("<li class='diagramNavigation-li'><a class='diagram-search diagram-zoom tooltip-me" + corner + "' title='<div class=\"simpleText\">", $.i18n.prop("diagram_navigation_search"), "</div>'>", $.i18n.prop("diagram_navigation_search"), "</a></li>");
  output.push("</ul>");
  $(this.canvas).before(output.join(''));
  $("#" + diagramNavigationID + ' a.diagram-search').before("<input class='search-input-for-diagrams' id='" + this.searchID + "'/>");
  $('#' + this.searchID).hide();

};

DiagramCanvas.prototype.updateSearchBoxPosition = function () {
  $('#' + this.selectorID + " ul.diagramNavigation").css('position', 'absolute').css('right', $('#' + this.selectorID + " ul.diagramNavigation").width() * 2);
  $('#' + this.searchID).css('position', 'absolute').css('left', -$('#' + this.searchID).width()).addClass("ui-widget ui-widget-content ui-corner-all");
};

DiagramCanvas.prototype.initDiagramNavigation = function () {
  var mainSelector;

  mainSelector = "#" + this.selectorID;
  $(mainSelector + ' a.diagram-zoomin').button({
    "icons": {
      "primary": 'ui-icon-zoomin'
    },
    "text": false
  });
  $(mainSelector + ' a.diagram-zoomout').button({
    "icons": {
      "primary": 'ui-icon-zoomout'
    },
    "text": false
  });
  $(mainSelector + ' a.diagram-resize').button({
    "icons": {
      "primary": 'ui-icon-newwin'
    },
    "text": false
  });
  $(mainSelector + ' a.diagram-search').button({
    "icons": {
      "primary": 'ui-icon-search'
    },
    "text": false
  });
  $(mainSelector + ' a.diagram-zoom').tooltip({
    "delay": 250,
    "showURL": false
  });
  $(mainSelector + ' a.diagram-zoomin span').click(function () {
    this.camera.scale *= 0.9;
    this.camera.update();
    this.tick();
    return false;
  }.bind(this));
  $(mainSelector + ' a.diagram-zoomout span').click(function () {
    this.camera.scale *= 1.1;
    this.camera.update();
    this.tick();
    return false;
  }.bind(this));
  $(mainSelector + ' a.diagram-resize span').click(function () {
    this.setInitPositionAndScale();
    this.tick();
    return false;
  }.bind(this));
  $(mainSelector + ' a.diagram-search span').click(function () {
    $('#' + this.searchID).toggle('clip');
    return false;
  }.bind(this));
};
