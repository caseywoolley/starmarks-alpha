$(function() {
   //display chrome local storage
  chrome.storage.local.get(null, function(items) {
    console.log('local storage: ', items);
  });
  chrome.runtime.sendMessage({bookmarks: 'all'}, function(response){
    console.log('background', response);
  });
  getBookmarkList();
});

var searchBookmarks = function(query, callback) {
  chrome.bookmarks.getTree(function(bookmarkTree) {
    callback(bookmarkTree[0]);
  });
};

var getStarMarks = function() {

};

// var displayBookmarks = function() {
//   chrome.storage.sync.get(null, function(data) {
//     console.log('starMarks: ', data);

//     var $starMarks = $('.starmarks');

//     for (var url in data) {
//       starMark = data[url];
//       $starMarks.append('<li class="starmark"><a class="starmark-link" href="' + url +
//         '"><div class="title-bar"><span class="star-title">' +
//         (starMark.title || 'untitled') + '</span></div><span class="star-url">' + url + '</span></a><span class="star-rating">' + (starMark.stars || 0) +
//         ' Stars</span></li>');
//       //chrome.storage.sync.remove(url); //reset bookmarks
//     }
//   });

// };

var loadStarMarks = function() {
  //get bookmark tree
  var bookmarkTreeNodes = chrome.bookmarks.getTree(
    function(bookmarkTree) {
      console.log('bookmarks', bookmarkTree);
      //dateAdded:date, dateGroupModified:date, id:string,
      //index:int, parentId:string, title:string, url:string

      //recurse over all bookmarks
      bookmarksList = getBookmarkList(bookmarkTree);


      //decorate with starmark metadata if exisits
      //else add default metadata entry
      //add folders as tags if not already there
      //add bookmarks in folders to tag arrays
    });
};

//TODO: search criteria - search by text, date, tag, rating

//recurse chrome bookmark tree
var getBookmarkList = function() {
  //get chorme bookamrks
  chrome.bookmarks.getTree(function(bookmarkTree) {
    console.log('bookmarks', bookmarkTree);
    console.log('size', roughSizeOfObject(bookmarkTree));
    //get starmarks data
    chrome.storage.local.get(null, function(starData) {
      console.log('starMarks', starData);
      var mergeMarks = function(node) {
        var list = [];
        //base - add bookmark if has url
        if (node.url !== undefined) {
          var starMark = starData[node.url];
          //if starMark doesn't exist - add default starMark entry
          if (starMark === undefined) {
            starMark = {
              stars: 0,
              visits: 0
            };
            var url = node.url;
            var saveMark = {};
            saveMark[node.url] = starMark;
            //save starData
            chrome.storage.local.set(saveMark, function() {
              console.log('starData saved');
            });
          }
          bookmark = node;
          delete bookmark.children; //don't need this
          bookmark = _.extend(bookmark, starMark);
          list.push(bookmark);
        } else {
          //else add tag if doesn't exist 
        }

        //recurse
        if (node.children && node.children.length > 0) {
          for (var i = 0; i < node.children.length; i++) {
            var child = node.children[i];
            list = list.concat(mergeMarks(child));
          }
        }
        return list;
      };
      var fullList = mergeMarks(bookmarkTree[0]);

      displayBookmarks(fullList);
    });
  });

};


var displayBookmarks = function(list) {

  console.log('bookmarkList', list);

  var $starMarks = $('.starmarks');

  for (var i = 0; i < list.length; i++) {
    var bookmark = list[i];
    if (bookmark.stars > 0 ){
    //starMark = data[url];
    $starMarks.append('<li class="starmark"><a class="starmark-link" href="' + bookmark.url +
      '"><div class="title-bar"><span class="star-title">' +
      (bookmark.title || 'untitled') + '</span></div><span class="star-url">' + bookmark.url + '</span></a><span class="star-rating">' + (bookmark.stars || 0) +
      ' Stars</span></li>');
  }
    //chrome.storage.local.remove(bookmark.url); //reset bookmarks
  }

};

// http://stackoverflow.com/questions/1248302/javascript-object-size
var roughSizeOfObject = function( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object' && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}

/*
searchBookmarks(null, function(bookmarkTree) {
    console.log(bookmarkTree);
    chrome.storage.sync.get(null, function(starData) {

      var combineMarks = function(node) {
        var bookmarks = [];
        //iterate over bookmarks
        for (var key in node) {
          var bookmark = node[key];

          //add star data
          if (starData[bookmark.url] !== null) {
            bookmark.stars = starData.stars;
          }

          bookmarks.push(bookmark);
          //recurse node
          if (bookmark.children.length > 0) {
            for (var i = 0; i < bookmark.children.length; i ++){
                var child = bookmark.children[i];
                bookmarks = bookmarks.concat( combineMarks(child) );
            }
          }

        }
        return bookmarks;
      };
      var allMarks = combineMarks(bookMarkTree);
      console.log(allMarks);

    });

  });
  */
