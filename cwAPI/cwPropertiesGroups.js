/*global cwAPI :true, cwConfigs: true */

cwAPI.cwPropertiesGroups = {};

cwAPI.cwPropertiesGroups.displayPropertiesGroupFromKey = function (output, object, key) {
  

  if (!_.isUndefined(object.propertiesGroups[key])){
    cwAPI.cwPropertiesGroups.displayPropertiesGroup(output, object, object.propertiesGroups[key]);
  }
  //console.log('displayPropertiesGroupFromKey done');

};

cwAPI.cwPropertiesGroups.displayPropertiesGroup = function (output, mainObject, jsonPropertiesGroup) {
  switch (jsonPropertiesGroup.layout) {
  case 'list':

    break;
  case 'table':
    cwAPI.cwPropertiesGroups.createTable(output, mainObject, jsonPropertiesGroup);
    break;
  }
};


cwAPI.cwPropertiesGroups.createTable = function (output, mainObject, jsonPropertiesGroup) {
    //output.push('<div>empty</div>');

  output.push('<div class="propertiesTable"><div class="table-header ui-widget-header">', jsonPropertiesGroup.name, '</div><table class="propertiesTable">');
  _.each(jsonPropertiesGroup.properties, function (property) {
    cwAPI.cwPropertiesGroups.putPropertiesInTable(output, property.propertyScriptName, property.name, mainObject, property.propertyType);
  });
  output.push('</table></div>');
  //console.log('table created done');
};



//$('body').append(propertiesGroup.name);
cwAPI.cwPropertiesGroups.types = {};

cwAPI.cwPropertiesGroups.types.image = function (value) {
  if (value !== "") {
    value = "<img src='" + cwConfigs.SITE_MEDIA_PATH + 'images/logos/64/' + value + ".png' alt='" + value + "'/>";
  }
  return value;
};

cwAPI.cwPropertiesGroups.types.boolean = function (value) {
  if (value !== "0") {
    value = $.i18n.prop("global_yes");
  } else {
    value = $.i18n.prop("global_no");
  }
  return value;
};


cwAPI.cwPropertiesGroups.types.date = function (value) {
  value = value.substring(0, 10);
  if (value === "30/12/1899") {
    value = "";
  } else {
    value = Date.parse(value).toString('MMMM d, yyyy');
  }
  return value;
};

cwAPI.cwPropertiesGroups.putPropertiesInTable = function (output, pName, displayName, object, type) {
  var pID, value;
  value = object.properties[pName];

  pID = object.objectTypeScriptName + object.object_id + pName;
  if (!_.isUndefined(value) && !_.isUndefined(type)) {
    switch (type) {
    case "date":
      value = cwAPI.cwPropertiesGroups.types.date(value);
      break;
    case "image":
      value = cwAPI.cwPropertiesGroups.types.image(value);
      break;
    case "boolean":
      value = cwAPI.cwPropertiesGroups.types.boolean(value);
      break;
    }

  }
  output.push('<tr><th>', displayName, '</th><td class="cw-edit-property-value" data-objectid="', object.object_id, '" id="', pID, '" data-objecttype="', object.objectTypeScriptName, '" data-propertyname="', pName, '">', value, '</td></tr>');
};
