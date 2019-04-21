
var myhxID;
var myflag=0;
var mypattern;
/*chrome.storage.onChanged.addListener(function(changes, area) {
    if (area == "sync" && "blocked_hxID" in changes) {
        hxID = changes.blocked_hxID.newValue;
    }
});*/

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if(request.hxID){
	
	chrome.storage.sync.set({'blocked_hxID': request.hxID}, function() {console.log('set hxID to storage'+request.hxID);});
	chrome.storage.sync.set({'flag': 1}, function() {console.log('set flag');});
// code...
	console.log("message hxID");
 sendResponse('我已收到你的消息');//做出回应
 }else{
	 console.log("no message hxID");
 }
});





function blockRequest(details) {

	console.log("append: ");
    console.log(details.url); 
  
  	if(!details.url.includes('hxID',0)){
	  if(details.url.includes('?',0)){
		  console.log('before concat that hxID ',myhxID);
		  details.url = details.url.concat("&hxID=",myhxID);
		 // console.log("&details.url",details.url);	
		  	
		  
	  }else{
		  console.log('before concat that hxID ',myhxID);
		  details.url = details.url.concat("?hxID=",myhxID);
		 // console.log("?details.url",tmp_hxID);	
		  
	  }
	  
  }
  console.log('haha,no block details.url',details.url);
	 console.log('haha,no block myhxID ',myhxID);
	
  return {
		redirectUrl: details.url
	};
  }
  function blockRequest2(details) {
	if (chrome.webRequest.onBeforeRequest.hasListener(blockRequest2)) {
	   console.log("remove blockRequest2");
    chrome.webRequest.onBeforeRequest.removeListener(blockRequest2);
  }
  load(function(p) {
  patterns = p;
  updateFilters();
});
  return {
		cancel: false
	};
  }
  

/*function blockRequest(details) {
	var tmp_hxID;
  console.log("append: ");
    console.log(details.url); 

	chrome.storage.sync.get('blocked_hxID', function(data) {
    console.log('blocked_hxID', data);
	tmp_hxID = data.blocked_hxID;
	console.log("get tmp_hxID from storage"+tmp_hxID);
  });
  for (var i = 0; i < details.requestHeaders.length; ++i) {
    if (details.requestHeaders[i].name === 'url') {
		
	if(!details.requestHeaders[i].value.includes('hxID',0)){
	  if(details.requestHeaders[i].value.includes('?',0)){
		  details.requestHeaders[i].value = details.requestHeaders[i].value.concat("&hxID=",tmp_hxID);
	  }else{
		  details.requestHeaders[i].value = details.requestHeaders[i].value.concat("?hxID=",tmp_hxID);
	  }
	}
    return {requestHeaders: details.requestHeaders};
    }
 }
  return {
		requestHeaders: details.requestHeaders
  };
}*/
function isValidPattern(urlPattern) {
  var validPattern = /^(file:\/\/.+)|(https?|ftp|\*):\/\/(\*|\*\.([^\/*]+)|([^\/*]+))\//g;
  return !!urlPattern.match(validPattern);
}

function updateFilters(urls) {
	
	
  if (chrome.webRequest.onBeforeRequest.hasListener(blockRequest)) {
	  console.log("remove blockRequest");
    chrome.webRequest.onBeforeRequest.removeListener(blockRequest);
  }
  if (chrome.webRequest.onBeforeRequest.hasListener(blockRequest2)) {
	   console.log("remove blockRequest2");
    chrome.webRequest.onBeforeRequest.removeListener(blockRequest2);
  }

  var validPatterns = patterns.filter(isValidPattern);
  mypattern = validPatterns;
 console.log("mypattern",mypattern);
  if (patterns.length) {
	  console.log("patterns.length",patterns.length);
	  chrome.storage.sync.get('flag',
							function(data){
								myflag=data;
								console.log("myflag",myflag);
								if(data == 1){
									chrome.storage.sync.get('blocked_hxID',
														function(data){
															myhxID = data;
															console.log("myhxID",myhxID);
															try{
																 chrome.webRequest.onBeforeRequest.addListener(blockRequest, {
																	urls: mypattern
																  }, ['blocking']);
																} catch (e) {
																  console.error(e);
																}
														});
								}else{
									//I don't know
									console.log("myflag==0");
									try{
										chrome.webRequest.onBeforeRequest.addListener(blockRequest2, {
																	urls: mypattern
																  }, ['blocking']);
									  } catch (e) {
									  console.error(e);
									}
								}
							}
	  );
    
  }
}
/*function updateFilters(urls) {
  if (chrome.webRequest.onBeforeSendHeaders.addListener(blockRequest)) {
    chrome.webRequest.onBeforeSendHeaders.removeListener(blockRequest);
  }

  var validPatterns = patterns.filter(isValidPattern);

  if (patterns.length) {
    try{
      chrome.webRequest.onBeforeSendHeaders.addListener(blockRequest, {
        urls: validPatterns
      }, ['blocking',"requestHeaders"]);
    } catch (e) {
      console.error(e);
    }
  }
}*/

function load(callback) {
  chrome.storage.sync.get('blocked_patterns', function(data) {
    callback(data['blocked_patterns'] || []);
  });
}

function save(newPatterns, callback) {
  patterns = newPatterns;
  chrome.storage.sync.set({
    'blocked_patterns': newPatterns,
	'flag':0
  }, function() {
	  console.log("set blocked_patterns,flag");
    updateFilters();
    callback.call();
  });
}

load(function(p) {
  patterns = p;
  updateFilters();
});



