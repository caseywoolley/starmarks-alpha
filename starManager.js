$(function() {

  //update ratings on click
  $(document).on('click', 'input', function(e){ 
    var url = $(this).closest('fieldset').attr('name');
    var rating = e.target.value;
    //update rating
    chrome.storage.local.get(url, function(bookmark) {
      bookmark[url].stars = rating;
      chrome.storage.local.set(bookmark);
    });
    $(this).prop('checked', true);
  });
   //display chrome local storage
  chrome.storage.local.get(null, function(items) {
    console.log('local storage: ', items);
  });
  //TODO: get bookmark object from background
  chrome.runtime.sendMessage({bookmarks: 'all'}, function(response){
    console.log('background', response);
  });
  getBookmarkList();
});

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
        var list = {};
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
          //list.push(bookmark);
          list[node.url]= bookmark;
        } else {
          //else add tag if doesn't exist 
        }

        //recurse
        if (node.children && node.children.length > 0) {
          for (var i = 0; i < node.children.length; i++) {
            var child = node.children[i];
            //list = list.concat(mergeMarks(child));
            list = _.extend(list, mergeMarks(child));
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
  //sort bookmarks
  var keys = Object.keys(list);
  console.log(keys);

  //http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
  function compare(a,b) {
  if (a.last_nom < b.last_nom)
    return -1;
  if (a.last_nom > b.last_nom)
    return 1;
  return 0;
}

list.sort(compare);
  
  var $starMarks = $('.starmarks');
  var index = 0;
  for (var url in list) {
    var bookmark = list[url];
    var checkedStar = {};
    checkedStar[bookmark.stars] = 'checked="checked"';
    //filter options
    //if (bookmark.stars > 0 ){
      if (url.indexOf("apple") > -1){
        //starMark = data[url];
        $starMarks.append('<li class="starmark"><a class="starmark-link" target="_blank" href="' + bookmark.url +
          '"><div class="title-bar"><span class="star-title"><img class="favicon" src="http://www.google.com/s2/favicons?domain='+ bookmark.url +'">' +
          (bookmark.title || 'untitled') + '</span></div><span class="star-url">' + bookmark.url + '</span>'+



          '</a><span class="star-rating">' + (bookmark.stars || 0) +
          ' Stars</span>'+

          '<span class="star-rating">' +
          '<fieldset class="rating" name="'+ bookmark.url +'" id="rating' + index + '">' +
          '<input type="radio" id="star5-'+ index + '" ' + (checkedStar[5] || '' ) + ' name="rating-'+ index + '" value="5" /><label class = "full star" id = "5" for="star5-'+ index + '" title="Awesome - 5 stars"></label>' +
          '<input type="radio" id="star4-'+ index + '" ' + (checkedStar[4] || '' ) + ' name="rating-'+ index + '" value="4" /><label class = "full star" id = "4" for="star4-'+ index + '" title="Pretty good - 4 stars"></label>' +
          '<input type="radio" id="star3-'+ index + '" ' + (checkedStar[3] || '' ) + ' name="rating-'+ index + '" value="3" /><label class = "full star" id = "3" for="star3-'+ index + '" title="Meh - 3 stars"></label>' +
          '<input type="radio" id="star2-'+ index + '" ' + (checkedStar[2] || '' ) + ' name="rating-'+ index + '" value="2" /><label class = "full star" id = "2" for="star2-'+ index + '" title="Kinda bad - 2 stars"></label>' +
          '<input type="radio" id="star1-'+ index + '" ' + (checkedStar[1] || '' ) + ' name="rating-'+ index + '" value="1" /><label class = "full star" id = "1" for="star1-'+ index + '" title="Sucks big time - 1 star"></label>' +
          '</fieldset></span>'+

          '</li>');
        index ++;
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
};
