if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
    var fSlice = Array.prototype.slice,
    aArgs = fSlice.call(arguments, 1),
    fToBind = this,
    fNOP = function () {},
    fBound = function () {
      return fToBind.apply(this instanceof fNOP ? this : oThis || window,
        aArgs.concat(fSlice.call(arguments)));
      };
      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();
      return fBound;
    };
  }
  
// load a single page using 2 ajax calls (json then customJS)
function loadSinglePage(selector, pageName, jsonPageName){
	$("head").append("<link type='text/css' rel='stylesheet' media='all' href='../webdesigner/handmade/" + pageName + "/" + pageName + ".css' />");
	$(selector).html("<ul class='embed' id='zone_" + pageName + "'></ul>");	
	var myURL = "../webdesigner/generated/" + pageName + "/" + jsonPageName + '.json';
	loadScript(myURL, function(){
		loadScript("../webdesigner/handmade/" + pageName + "/" + pageName + ".js", function(){});
	});
}

// load a script and call a callback if first call success
function loadScript(scriptURL, successCallback){

	$.ajax({
		url : scriptURL,
		type:'GET',
		crossDomain : true,
		dataType:'script',
		success : function(data){
			eval(data);
			successCallback();
		},
		error : function (jqXHR, textStatus, errorThrown){
			alert(errorThrown);
		}
	});
}


function isUnderIE9(){
	//console.log($.browser.version);
	if ($.browser.msie && $.browser.version < 9){
		//alert('under ie 9');
		return true;
	}
	return false;
}


function setToolTipsOnTitles(){
	$('.tooltip-me').mouseover(function(){
		$(this).css('cursor', 'help');
	});

	$('.tooltip-me-left').mouseover(function(){
		$(this).css('cursor', 'help');
	});	
		
	$('.tooltip-me-custom').mouseover(function(){
		$(this).css('cursor', 'help');
	});	
	
	$('.tooltip-me').tooltip({showURL : false, fade : 250});
	$('.tooltip-me-left').tooltip({showURL : false, fade : 250, extraClass:'tooltip-left'});
	$('.tooltip-me-custom').tooltip({showURL : false, fade : 250, extraClass : 'tooltip-custom'});
}