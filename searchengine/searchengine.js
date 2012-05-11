/*global jQuery: true*/
// V0.2.2
// 2010/08/30 
// Copyright Casewise 2010 
// 2010/08/30 : garde le sous ensemble 
// 2010/09/01 : ajout de la récursivité sur les recherches, ajout de l'attribut clean permattant de garder ou d'effacer le contexte de la recherche 
// 2010/09/18 : ajout du tooltip pour la recherche

function removeSearchEngineZone(text) {
  var out = text.replace("<span class='webindex_item_found'>", '');
  out = text.replace('</span>', '');
  return out;
}

// add the search engine context to the page 
function appendSearchEngineInput(title, name, context, JSONItems, searchEngine, callback_context) {
  context.append("<div id='search_zone_area_" + name + "' class='search_zone_area'><span class='search_text_zone'>" + title + "</span><input type='text' id='input_suggest_cw_" + name + "' class='cw_search_suggest'/></div>");
  prepareSearch(name, {
    "associations": JSONItems
  }, searchEngine);
}

// check if the attribute match the value 

function matchAttribute(_item_data, attributeValue, shouldMatch) {
  var _regexp, _matches_name, found, _regexp_name;

  if (_item_data === null) {
    return [_item_data, false];
  }
  if (_item_data.length === 0) {
    return [_item_data, false];
  }
  //console.log(_item_data); 
  _item_data[attributeValue] = cwAPI.removeSearchEngineZone(_item_data[attributeValue]);
  _regexp = new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + shouldMatch + ')(?![^<>]*>)(?![^&;]+;)', 'gi');
  _matches_name = _item_data[attributeValue].match(_regexp);
  found = false;

  if (_matches_name) {
    //console.log(_matches_name); 
    $.each(_matches_name, function (i, item) {
      _regexp_name = new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + _matches_name[i] + ')(?![^<>]*>)(?![^&;]+;)', 'gi');
      _item_data[attributeValue] = _item_data[attributeValue].replace(_regexp_name, "<span class='webindex_item_found'>" + _matches_name[i] + '</span>');
      found = true;
    });
  }
  return [_item_data, found];
}


function searchValueRec(_input_value, _item, searchItem) {
  //console.log(_item, searchItem);
  var foundItems = [];

  if (_.isUndefined(_item.associations[searchItem.id])){
    return foundItems;
  }
  // pour les elements à rechercher
  $.each(_item.associations[searchItem.id], function (i, element) {
    var childrenCount = 0;
    // pour chaque propriété
    var res = matchAttribute(element, "name", _input_value);
    if (res[1] === true) {
      childrenCount = 1;
    }
    $.each(searchItem.properties, function (propertyKey, property) {
      if (property === "name") {
        return;
      }
      var res = matchAttribute(element.properties, property, _input_value);
      if (res[1] === true) {
        childrenCount = 1;
      }
    });
    if (searchItem !== null && searchItem.children.length > 0) {
      $.each(searchItem.children, function (childKey, child) {
        element.associations[child.id] = searchValueRec(_input_value, element, child);
        childrenCount += element.associations[child.id].length;
      });
    }
    if (childrenCount > 0) {
      foundItems.push(element);
    }
  });
  return foundItems;
}


function searchValueInAttributes(_input_value, _item_dataInput, searchEngine, output) {
  var _item_data, _regexp, foundItems;
  if (_item_dataInput === null) {
    return;
  }
  _item_data = jQuery.extend(true, {}, _item_dataInput);
  _regexp = new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + _input_value + ')(?![^<>]*>)(?![^&;]+;)', 'gi');

  //console.log('search in', _item_dataInput, _item_dataInput.associations);

  foundItems = {};
  // pour chaque requirement
  $.each(searchEngine.searchItemsRequirements, function (searchItemKey, searchItem) {
    foundItems[searchItem.id] = searchValueRec(_input_value, _item_data, searchItem);
  });

  //console.log('found', foundItems);
  searchMemory.searchResultData = {"associations" : foundItems};
  searchEngine.searchFunction(foundItems, true);
  $('.cw_search_suggest').focus();

}


var searchMemory = {};
searchMemory.searchResultData = null;
searchMemory.inputLength = 0

// prepare the search action on the attributes 

function prepareSearch(viewName, JSONItems, searchEngine) {
  var output, inputVar, _input_value;
  inputVar = "input_suggest_cw_" + viewName;

  //console.log('prepare search', JSONItems);

  // if something has been typed 
  $('#' + inputVar).keyup(function (e) {
    // get the typed value 
    _input_value = $(this).val();



    // clean the list of elements 
    $('#zone_' + viewName).html('');
    // if there is less than 2 caracters, exit 
    if (_input_value.length < 2) {
      // print all the elements and leave  
      searchMemory.searchResultData = null;
      searchEngine.searchFunction(JSONItems.associations, false);
      return;
    }
    if (e.keyCode === 8){
      searchMemory.searchResultData = JSONItems;
    }
    
    _input_value = _input_value.replace(/ /g, ".*");
    output = [];
    if (searchMemory.searchResultData === null){
      searchMemory.searchResultData = JSONItems;
    }
    //console.log("searchMemory.searchResultData", searchMemory.searchResultData);
    searchValueInAttributes(_input_value, searchMemory.searchResultData, searchEngine, output);
  });

}
