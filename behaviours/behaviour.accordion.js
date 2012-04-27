/*global cwAPI:true */

// transform un li en accordion
cwAPI.setAccordion = function (selector, removeIfEmptyChildren, keepOpen) {
  var expandClass, collapseClass, collapse, expand, ul, li, span, content, start;
  $('div.' + selector).addClass('ui-widget ui-widget-header cw-accordion-header');
  $('a.' + selector).addClass('cw-accordion-header');
  $('ul.' + selector).addClass('cw-accordion-header');
  $('li.' + selector).addClass('cw-accordion-container ui-corner-all');
  $('div.' + selector).next().addClass('ui-widget ui-widget-content cw-accordion-content');

  collapseClass = "ui-icon-circle-plus";
  expandClass = "ui-icon-circle-minus";

  collapse = "<span class='accordion ui-icon " + collapseClass + "'></span>";
  expand = "<span class='accordion ui-icon " + expandClass + "'/>";

  // hide the children
  if (!_.isUndefined(keepOpen) && keepOpen) {
    $('div.' + selector).next().hide();
  } else {
    collapse = "";
    expand = "";
  }
  /*else {
    start = cola;
  }*/

  $("div." + selector).each(function (i, div) {

    if ($(div).next().html().length === 0) {
      $(div).next().remove();
    }
    if (!_.isUndefined(removeIfEmptyChildren) && removeIfEmptyChildren) {
      // if there is no children
      if ($(div).parent().children().length === 1) {
        $(div).parent().remove();
      }
    }


    if ($(div).next().length > 0) {
      $(div).children("a").before(collapse);

      $(div).click(function () {
        span = $(this).children('span.accordion');
        content = span;
        if (span.hasClass(collapseClass)) {
          span.removeClass(collapseClass);
          span.addClass(expandClass);
          //console.log($(this).next());
        } else {
          span.removeClass(expandClass);
          span.addClass(collapseClass);
        }

        $(this).next().children('canvas.world-map').hide();
        $(this).next().toggle('slow', function () {
          if ($(this).is(":visible")) {
            cwAPI.loadWorldMap($(this));
          }
        });


      });

      $(div).hover(function () {
        $(this).css('cursor', 'pointer');
      });
    } else {
      $(div).children("a").before(expand);
    }
  });

  /*  if ($(selector).length > 0 && $(selector).html().length === 0) {

  }*/
};
