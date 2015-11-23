$(function() {
  //TODO - see if bookmark already exists to display

  var clicked = false;
    //get current starMark
    getStarMark(function(starMark){
      console.log('current',starMark);
      var url = Object.keys(starMark)[0];
      $('input[name="rating"][value="'+ starMark[url].stars +'"]').prop('checked', true);

      //set badge
      chrome.browserAction.setBadgeText({
        text: starMark[url].stars
      });
    });

  //Save bookmark on star selection
  $('.rating').delegate('.star', 'click', function() {
    if (!clicked) {
      clicked = true;
      var rating = $(this).attr('id');
      //style the badge: https://developer.chrome.com/extensions/browserAction#method-setBadgeBackgroundColor
      chrome.browserAction.setBadgeText({
        text: rating
      });
      createStarMark(rating);
      window.close();
    }
  });


  //Open bookmark manager
  $('.managerBtn').on('click', function() {
    chrome.tabs.create({
      url: 'starManager.html'
    });

    window.close();
  });

  //get bookmark tree
  chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    console.log('bookmarksTree', bookmarkTreeNodes);
  });

  //get all storage data
  chrome.storage.local.get(null, function(items) {
    console.log('local storage: ', items);
  });
});

var getStarMark = function(callback) {
  console.log('get');
  getCurrentTab(function(tab) {
    console.log(tab);
    chrome.storage.local.get(tab.url, function(data){
      callback(data);
    });
  });
};

var createStarMark = function(rating) {
  rating = rating || 0;
  getCurrentTab(function(tab) {
    //get bookmark data
    var bookmark = {
      'parentId': '1',
      'title': tab.title,
      'url': tab.url
    };

    //get star data
    var starData = {
      title: tab.title,
      stars: rating,
      visits: 0,
      lastVisit: Date.now()
    };

    //save bookmark if doesn't exist
    saveBookmark(bookmark);
    //save star data
    var key = bookmark.url;
    saveStarData(bookmark.url, starData);
  });

};

var getCurrentTab = function(callback) {
  //query the current tab
  var currentTab = {
    'active': true,
    'lastFocusedWindow': true
  };
  chrome.tabs.query(currentTab, function(tab) {
    callback(tab[0]);
  });
};

var saveBookmark = function(bookmark) {
  //if bookmark doesn't exist save bookmark
  chrome.bookmarks.create(bookmark, function(newBookmark) {
    console.log('added: ' + newBookmark.title);
  });
};

var saveStarData = function(key, starObj) {
  var starData = {};
  starData[key] = starObj;
  console.log(starData);
  chrome.storage.local.set(starData, function() {
    console.log('starData saved');
  });
};




var setDefaultFolder = function() {

};

//TODO: move everything into an app object so exectuion doesn't have to be at the bottom
//load starmarks db

//TODO: save starmark data
//TODO: make the icon indicate saved bookmark (w/visit count?)
