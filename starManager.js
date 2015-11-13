$(function() {
  //get all storage data
  searchBookmarks(null, function(bookmarkTree){

  });
  displayBookmarks();
});

//TODO: zip together bookmarks tree with starmarks data?

var searchBookmarks = function(query, callback) {
  chrome.bookmarks.getTree(function(bookmarkTree) {
    callback(bookmarkTree);
  });
};

var getStarMarks = function(){

};

var displayBookmarks = function() {
  chrome.storage.sync.get(null, function(data) {
    console.log('starMarks: ', data);

    var $starMarks = $('.starmarks');

    for (var url in data) {
      starMark = data[url];
      $starMarks.append('<li class="starmark"><a class="starmark-link" href="' + url + 
        '"><div class="title-bar"><span class="star-title">' +
        (starMark.title || 'untitled') + '</span></div><span class="star-url">'+ url +'</span></a><span class="star-rating">' + (starMark.stars || 0) +
        ' Stars</span></li>');
      //chrome.storage.sync.remove(url); //reset bookmarks
    }
  });

};

var listMarks = function() {

};
