var starMarksDB;
/* ////reset starmarks DB
    chrome.storage.sync.remove('starMarksDB', function(){
    	console.log('deleted db');
    }); ////////remove db temp
*/


$(function() {
  //TODO - see if bookmark already exists to display
  var clicked = false;

  //Save bookmark on star selection
  $('.star').on('click', function() {
    if (!clicked) {
      clicked = true;
      createStarMark($(this).attr('id'));
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
  chrome.storage.sync.get(null, function(items) {
    console.log('starMarks: ', items);
  });
});


var createStarMark = function(rating) {
  loadStarMarksDB(function(db) {
    starMarksDB = db;
    console.log(db);
  });
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

    //save bookmark
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
  chrome.bookmarks.create(bookmark, function(newBookmark) {
    console.log('added: ' + newBookmark.title);
  });
};

var saveStarData = function(key, starObj) {
  var starData = {};
  starData[key] = starObj;
  console.log(starData);
  chrome.storage.sync.set(starData, function() {
    console.log('starData saved');
  });
};

var getStarData = function(key) {
  chrome.storage.sync.get(key, function(starData) {
    // retirieved.
    console.log(starData);
  });
};

var loadStarMarksDB = function(callback) {
  chrome.storage.sync.get('starMarksDB', function(data) {
    if (data.starMarksDB === undefined) {
      starMarksDB = {
        starMarksDB: {
          urls: {},
          tags: {},
          views: {}
        }
      };
      //initialize DB
      chrome.storage.sync.set(starMarksDB, function(data) {
        console.log('starMarksDB created');
        callback(data);
      });
    } else {
      //return existing DB
      console.log('starMarksDB: ', data.starMarksDB);
      callback(data.starMarksDB);
    }
  });

};




var setDefaultFolder = function() {

};

//TODO: move everything into an app object so exectuion doesn't have to be at the bottom
//load starmarks db

loadStarMarksDB(function(db) {
  starMarksDB = db;
});

//TODO: save starmark data
//TODO: make the icon indicate saved bookmark (w/visit count?)
