// V0.2.2
// 2010/08/30 
// Copyright Casewise 2010 
// 2010/08/30 : garde le sous ensemble 
// 2010/09/01 : ajout de la récursivité sur les recherches, ajout de l'attribut clean permattant de garder ou d'effacer le contexte de la recherche 
// 2010/09/18 : ajout du tooltip pour la recherche

function removeSearchEngineZone(text){ 
        var out = text.replace("<span class='webindex_item_found'>", ''); 
        out = text.replace('</span>', ''); 
        return out; 
} 

// add the search engine context to the page 
function appendSearchEngineInput(title, name, context, JSONItems, searchEngine, callback_context) { 
        context.append("<div id='search_zone_area_" + name + "' class='search_zone_area'><span class='search_text_zone'>" + title + "</span><input type='text' id='input_suggest_cw_" + name + "' class='cw_search_suggest'/></div>");         
        prepareSearch(name, JSONItems, searchEngine);
} 

// check if the attribute match the value 
function matchAttribute(_item_data, attributeValue, shouldMatch) 
{ 
        if (_item_data == null) return [_item_data, false]; 
        if (_item_data.length == 0) { 
                return [_item_data, false]; 
        } 
        //console.log(_item_data); 
        var _regexp = new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + shouldMatch + ')(?![^<>]*>)(?![^&;]+;)', 'gi'); 
        var _matches_name = _item_data[attributeValue].match(_regexp); 
        var found = false; 
        
        if (_matches_name) { 
                //console.log(_matches_name); 
                $.each(_matches_name, function(i, item) { 
                        var _regexp_name = new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + _matches_name[i] + ')(?![^<>]*>)(?![^&;]+;)', 'gi'); 
                        _item_data[attributeValue] = _item_data[attributeValue].replace(_regexp_name, "<span class='webindex_item_found'>" + _matches_name[i] + '</span>'); 
                        found = true; 
                }); 
        }         
        return [_item_data, found]; 
} 


function searchValueRec(_input_value, _item, searchItemsRequirements, clean) 
{                //return true; 
                var global_found = false; 
                var found = false; 
                //console.log('searching in ' ); 

                $.each(_item[searchItemsRequirements.id], function(i, element){ 
                        found = false; 
                        $.each(searchItemsRequirements.properties, function(propertyKey, property) { 
                                var res = matchAttribute(element, property, _input_value); 
                                if (res[1] == true) { 
                                        found = res[1]; 
                                } 
                                element = res[0];
                                
                        }); 
                        
                        if (searchItemsRequirements != null && searchItemsRequirements.children.length > 0) 
                        {                                 
                                $.each(searchItemsRequirements.children, function(childKey, child) { 
                                        var resRec = searchValueRec(_input_value, element, child, clean); 
                                        if (resRec == true) 
                                        { 
                                                found = true; 
                                        } 
                                        else 
                                        { 
                                                if (clean){ 
                                                        //delete _item[searchItemsRequirements.id][childKey]; 
                                                } 
                                        } 
                                });                         
                        } 
                        
                        if (found == false) 
                        { 
                                if (clean){ 
                                        _item[searchItemsRequirements.id].splice(i, 1);
                                } 
                        } 
                        else 
                        { 
                                global_found = true; 
                        }                         
                }); 
                return global_found; 
}


// search the inputvalue in each Item properties browsing provided requirements 
function searchValueInAttributes(_input_value, _item_dataInput, searchEngine, output) { 
        if (_item_dataInput == null) {return;} 
        var _item_data = jQuery.extend(true, {}, _item_dataInput); 
        var _regexp = new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + _input_value + ')(?![^<>]*>)(?![^&;]+;)', 'gi'); 
        var found = false; 
       
        var elements = {};
        $.each(searchEngine.searchItemsRequirements, function (searchItemKey, searchItem){ 
                elements[searchItem.id] = [];
                $.each(_item_data[searchItem.id], function(itemKey, item){ 
                        found = false;         
                        $.each(searchItem.properties, function(propertyKey, property) { 
                                var res = matchAttribute(item, property, _input_value); 
                                if (res[1] == true) { 
                                        found = res[1]; 
                                }                 
                                _item_data[searchItem.id] = res[0];         
                        }); 
                        if (searchItem != null && searchItem.children.length > 0) 
                        {                                 
                                $.each(searchItem.children, function(childKey, child) { 
                                        //console.log('child :' , child, item);
                                        var resRec = searchValueRec(_input_value, item, child, searchEngine.searchClear); 
                                        if (resRec == true) 
                                        { 
                                                found = true; 
                                        }                                       
                                });                         
                        }
                        if (found == true){  
                                elements[searchItem.id].push(item);               
                        }
                }); 
        });
        //console.log('elements', elements);
        searchEngine.searchFunction(elements, true);
        $('.cw_search_suggest').focus();

} 

// prepare the search action on the attributes 
function prepareSearch(viewName, JSONItems, searchEngine) 
{ 
        var inputVar = "input_suggest_cw_" + viewName; 

        // if something has been typed 
        $('#' + inputVar).keyup(function(){ 
                // get the typed value 
                var _input_value = $(this).val(); 

                // clean the list of elements 
                $('#zone_' + viewName).html(''); 
                // if there is less than 2 caracters, exit 
                if (_input_value.length < 2) 
                {                                 
                        // print all the elements and leave  
                        searchEngine.searchFunction(JSONItems, false);                         
                        return;                                         
                } 
                
                var output = new Array(); 
                searchValueInAttributes(_input_value, JSONItems, searchEngine, output);
        });         

} 


