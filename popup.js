$(function() {
	var clicked = false;
  //Save bookmark on star selection
  $('.star').on('click', function() {
  	if (!clicked){
  		clicked = true;
    	createStarMark($(this).attr('id'));
  	}
  });

  //console.log bookmark tree
  chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    console.log(bookmarkTreeNodes);
  });

});


var createStarMark = function(rating) {
  
  getCurrentTab(function(tab){  
  	//get bookmark data
	  var bookmark = {
	    'parentId': '1',
	    'title': tab.title,
	    'url': tab.url
	  };

  	//get star data
	  var starData = {
	    stars: rating,
	    visits: 0,
	    lastVisit: Date.now()
	  };
	  
  	//save bookmark
  	saveBookmark(bookmark);
  	//save star data
  	var key = bookmark.url;
  	saveStarData( bookmark.url, starData );
  });

};

var getCurrentTab = function(callback) {
  //query the current tab
  var currentTab = { 'active': true, 'lastFocusedWindow': true};
  chrome.tabs.query(currentTab, function(tab) {
    callback(tab[0]);
  });
};

var saveBookmark = function(bookmark) {
  chrome.bookmarks.create(bookmark, function(newBookmark) {
    console.log('added: ' + newBookmark.title);
  });
};

var saveStarData = function(key, starObj){
	var starData = {};
	starData[key] = starObj;
	console.log(starData);
	chrome.storage.sync.set( starData, function() {
    console.log('starData saved');
  });
};

var getStarData = function(key){
  chrome.storage.sync.get( key , function(starData) {
        // Notify that we saved.
        console.log(key);
   console.log(starData);
  });
};



var setDefaultFolder = function() {

};
  //TODO: save starmark data
  //TODO: make the icon indicate saved bookmark (w/visit count?)
