function addCleanDOMInputZone(selector, searchIn){
        var text = '<input id="'+ selector + '-clean-dom-input" type="text">';
        $('#' + selector).append(text);
        //return text;
}