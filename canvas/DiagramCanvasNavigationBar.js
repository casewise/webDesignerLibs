/*global DiagramCanvas: true*/

DiagramCanvas.prototype.setUpNavigationBar = function (diagramID) {
  this.searchID = this.canvasID + '-search';
  this.createNavigationBar(diagramID, "ui-corner-all");
  this.initDiagramNavigation("#" + $(this.canvas).parent().attr('id'));


  $(this.mainDiv).hover(function (e) {
    this.showNavigationBar();
  }.bind(this), function (e) {
    this.hideNavigationBar();
  }.bind(this));


  this.navigationBarUL = $(this.mainDiv).children("ul.diagramNavigation");

  $("#" + this.searchID).keyup(function () {
    var value = $("#" + this.searchID).val();
    this.mainDiagramContext.createContext(value, this.camera.renderScale);
    this.camera.update();
    this.tick();
  }.bind(this));
};

DiagramCanvas.prototype.setValueForDiagramSearch = function (value) {
  $("#" + this.searchID).val(value);
  $("#" + this.searchID).keyup();
};

DiagramCanvas.prototype.cleanValueForDiagramSearch = function () {
  $("#" + this.searchID).val("");
  $("#" + this.searchID).keyup();
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
  output.push("<li class='diagramNavigation-li'><a class='diagram-fullscreen diagram-zoom tooltip-me" + corner + "' title='<div class=\"simpleText\">", $.i18n.prop("diagram_navigation_fullscreen"), "</div>'>", $.i18n.prop("diagram_navigation_fullscreen"), "</a></li>");
  output.push("</ul>");
  $(this.mainDiv).append(output.join(''));
  $("#" + diagramNavigationID + ' a.diagram-search').before("<input class='search-input-for-diagrams' id='" + this.searchID + "'/>");
  $('#' + this.searchID).hide();
};

DiagramCanvas.prototype.updateSearchBoxPosition = function () {
  //var navigationUL = $(this.mainDiv).children("ul.diagramNavigation");
  this.navigationBarUL.css('width', '24px');
  var left = $(this.mainDiv).width() - this.navigationBarUL.width() - 15;
  this.navigationBarUL.css('position', 'relative').css('top', '0px');
  //$(this.mainDiv).children("canvas").css('position', 'relative').css('left', "0px").css('top', '0px');
  //navigationUL.css('position', 'absolute').css('right', "0px").css('top', top + "px");
  $('#' + this.searchID).css('position', 'absolute').css('left', -136).addClass("ui-widget ui-widget-content ui-corner-all");
};

DiagramCanvas.prototype.initDiagramNavigation = function () {
  var mainSelector, diagramCanvas;

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
  $(mainSelector + ' a.diagram-fullscreen').button({
    "icons": {
      "primary": 'ui-icon-squaresmall-plus'
    },
    "text": false
  });

  this.setupToolTipsForDiagramNavigationIcons();

  $(mainSelector + ' a.diagram-zoomin').click(function () {
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

  this.setupFullScreenMode();
  diagramCanvas = this;
  $(mainSelector + ' a.diagram-fullscreen').click(function (e) {

    //console.log($(diagramCanvas.mainDiv).find("a.diagram-fullscreen span.ui-button-text"));
    if ($(this).hasClass("fullscreen-mode")) {
      //console.log("setToNormalSizeScreen");
      diagramCanvas.setToNormalSizeScreen(this);
      $(this).mouseleave();
    } else {
      //console.log("setToFullScreen");
      diagramCanvas.setToFullScreen(this);
      $(this).mouseleave();
    }
    return false;
  });
};


DiagramCanvas.prototype.setupToolTipsForDiagramNavigationIcons = function () {
  $(this.mainDiv).find('a.diagram-zoom').tooltip({
    "delay": 250,
    "showURL": false
  });
};

DiagramCanvas.prototype.setupFullScreenMode = function () {

  var mainDiv = $(this.mainDiv);
  this.fullScreenMode = {};
  this.fullScreenMode.parentNode = mainDiv.parent();


};

DiagramCanvas.prototype.setToFullScreen = function (fullScreenIcon) {
  var mainDiv, w, h, offset;

  this.fullScreenMode.savedScrollTop = $(window).scrollTop();
  //console.log(fullScreenIcon);
  $(fullScreenIcon).addClass("fullscreen-mode");
  $(fullScreenIcon).children('span.ui-icon').removeClass("ui-icon-squaresmall-plus");
  $(fullScreenIcon).children('span.ui-icon').addClass("ui-icon-squaresmall-minus");

  $(this.mainDiv).find("a.diagram-fullscreen span.ui-button-text").html($.i18n.prop("diagram_navigation_fullscreen_normal"));
  $(this.mainDiv).find("a.diagram-fullscreen").attr("title", $.i18n.prop("diagram_navigation_fullscreen_normal"));
  this.setupToolTipsForDiagramNavigationIcons();

  mainDiv = $(this.mainDiv);

  w = $(window).width() - 5 + 'px';
  h = $(window).height() - 5 + 'px';

  offset = mainDiv.offset();
  //$(this.mainDiv).css('width', w).css('height', h);
  mainDiv.detach();
  $("body").children().fadeOut(500);
  $("body").children().first().before(mainDiv);
  mainDiv.css('width', mainDiv.width() + "px").css("background-color", 'white');
  mainDiv.css('position', 'absolute').css('top', offset.top + "px").css('left', offset.left).css('z-index', "2000");

  //$("body").children().fadeOut(500);

  this.mainDiv.animate({
    'width': w,
    'height': h,
    "left": "0px",
    "top": "0px",
    "background-color": "white",
    "margin": "0px",
    "padding": "0px",
    "duration": 500
  }, {
    "step": function () {
      this.resize();
    }.bind(this),
    "complete": function () {

    }
  });
 $('html,body').animate({
        "scrollTop": 0
      }, 100);

};

DiagramCanvas.prototype.setToNormalSizeScreen = function (fullScreenIcon) {

  $(fullScreenIcon).removeClass("fullscreen-mode");
  $(fullScreenIcon).children('span.ui-icon').removeClass("ui-icon-squaresmall-minus");
  $(fullScreenIcon).children('span.ui-icon').addClass("ui-icon-squaresmall-plus");
  $(this.mainDiv).find("a.diagram-fullscreen span.ui-button-text").html($.i18n.prop("diagram_navigation_fullscreen"));
  $(this.mainDiv).find("a.diagram-fullscreen").attr("title", $.i18n.prop("diagram_navigation_fullscreen"));
  this.setupToolTipsForDiagramNavigationIcons();

  // reset style
  this.mainDiv.attr('style', '');

  this.mainDiv.detach();
  $('body').children().fadeIn(500);

  $('html,body').animate({
    "scrollTop": this.fullScreenMode.savedScrollTop
  }, 100);

  this.fullScreenMode.parentNode.append(this.mainDiv);
  this.mainDiv.resize();
};

DiagramCanvas.prototype.showNavigationBar = function () {
  if (!this.navigationBarUL.is(':visible')) {
    this.navigationBarUL.show('slide', {
      'direction': 'right'
    });
  }
};


DiagramCanvas.prototype.hideNavigationBar = function () {
  if (this.navigationBarUL.is(':visible')) {
    this.navigationBarUL.hide('slide', {
      'direction': 'right'
    });
  }
};
