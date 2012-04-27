/*global cwAPI:true, WorldMap :true */
cwAPI.drawJomComWorldMap = function (canvasID, zoomList) {
  var oSettings = {};
  oSettings.id = canvasID;
  oSettings.bgcolor = "#FFFFFF";
  oSettings.fgcolor = "#FFFFFF";
  oSettings.fillColor = "#A2D0EA";
  oSettings.bordercolor = "#D1E8F5";
  oSettings.borderwidth = "1";
  oSettings.padding = "10";
  oSettings.zoom = zoomList;
  WorldMap(oSettings);
};

cwAPI.countriesToMapFromStringCountries = function (itemKey, canvasID, countriesString) {
  if (countriesString.length) {
    $("ul." + itemKey).after('<canvas class="world-map" id="' + canvasID + '" data-itemkey="' + itemKey + '" data-countries="' + countriesString + '"></canvas>');
    $('ul.' + itemKey).css('width', '20%').css('margin-left', '0px').css('margin-right', '0px').css('display', 'inline-block').css('vertical-align', 'top');
    $("#" + canvasID).css("width", "75%").css("height", '400px').css('display', 'inline-block');
    cwAPI.drawJomComWorldMap(canvasID, countriesString);
  }
};

cwAPI.countriesToMapFromItems = function (itemKey, canvasID, items) {
  var countries, countryISO;
  countries = [];
  _.each(items, function (childLoc) {
    if (childLoc.properties.isocode !== "") {
      countryISO = cwAPI.removeSearchEngineZone(childLoc.properties.isocode.toLowerCase());
      //countryISO = childLoc.properties.isocode.toLowerCase();
      countries.push(countryISO);
    }
  });
  if (countries.length) {
    cwAPI.countriesToMapFromStringCountries(itemKey, canvasID, countries.join(','));
  }
};

cwAPI.loadWorldMap = function (selector) {
  var countries, id, itemKey;

  $(selector).find('canvas.world-map').each(function (i, canvasWorld) {
    itemKey = $(canvasWorld).attr('data-itemkey');
    id = $(canvasWorld).attr('id');
    countries = $(canvasWorld).attr('data-countries');
    $(canvasWorld).remove();
    cwAPI.countriesToMapFromStringCountries(itemKey, id, countries);
  });
};
