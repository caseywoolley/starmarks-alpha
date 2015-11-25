var StarMarks = app.factory('StarMarks', function() {

	//CRUD
		//createAll, create
		//getAll
		//get(url, filter(title, url, ~tag, range(date, stars, last visit, visit count)))
		//update(url, id, ~group)
		//delete(url/id)
  //recurse chrome bookmark tree

  var loading = false;
  var all = [];

  var update = function(id, changes){
  	//update rating
    chrome.storage.local.get(id, function(bookmark) {
    	if (bookmark){
	    	var newData = bookmark[id];
	    	for (var attribute in changes){
          if (attribute === 'stars'){ 
            newData[attribute] = parseInt(changes[attribute]);
          }else {
	      	  newData[attribute] = changes[attribute];	
          }
	    	}
	    	console.log('update:', bookmark);
	      chrome.storage.local.set(bookmark);
	      //TODO: update chrome bookmark metadata (url?, name, ~tag)
    	}
    });
  };

  var getBookmarkList = function(callback) {
    //get chorme bookamrks
    loading = true;

    chrome.bookmarks.getTree(function(bookmarkTree) {
      console.log('bookmarks', bookmarkTree);
      console.log('size', roughSizeOfObject(bookmarkTree));
      //get allBookmarks data
      chrome.storage.local.get(null, function(starData) {
        console.log('allBookmarks', starData);
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
            delete bookmark.children; //bookmarks don't need this
            bookmark = _.extend(bookmark, starMark);
            //list.push(bookmark);
            list[node.url] = bookmark;
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
        var $starMarks = $('.starMarks');
        $starMarks.html('');

        var arrList = [];
        var keys = Object.keys(fullList);
        for (var i = 0; i < keys.length; i++){
          arrList.push(fullList[keys[i]]);
        }

        all = fullList;
        callback(arrList);
        loading = false;
      });
    });

  };


  var displayBookmarks = function(list, filters) {
    //var urlSearch = 'apple';
    var urlSearch;
    if (filters) {
      urlSearch = filters.urlSearch;
    }
    console.log('bookmarkList', list);
    allBookmarks = list;
    //sort bookmarks
    //http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
    function compare(a, b) {
      if (a.stars < b.stars)
        return -1;
      if (a.stars > b.stars)
        return 1;
      return 0;
    }
    list.sort(compare).reverse();

    list = _.filter(list, function(bookmark) {
      if (urlSearch === undefined || bookmark.url.indexOf(urlSearch) > -1) {
        return true;
      }
      return false;
    });

    var perPage = Math.min(40, list.length - 1 - displayed);
    //empty displayed bookmarks
    var $starMarks = $('.starMarks');
    console.log('total:', list.length);
    var index = 0;

    if (perPage > 0) {
      for (var i = displayed; i <= displayed + perPage; i++) {
        console.log('count:', i, displayed, perPage);
        //console.log(list[url]);
        var bookmark = list[i];
        var checkedStar = {};
        checkedStar[bookmark.stars] = 'checked="checked"';
        //filter options
        //if (bookmark.stars > 0 ){
        //if (urlSearch === undefined || bookmark.url.indexOf(urlSearch) > -1) {
        //starMark = data[url];
        $starMarks.append('<li class="starmark"><a class="starmark-link" target="_blank" href="' + bookmark.url +
          '"><div class="title-bar"><span class="star-title"><img class="favicon" src="http://www.google.com/s2/favicons?domain=' + bookmark.url + '">' +
          (bookmark.title || 'untitled') + '</span></div><span class="star-url">' + bookmark.url + '</span>' +



          '</a><span class="star-rating">' + (bookmark.stars || 0) +
          ' Stars</span>' +

          '<span class="star-rating">' +
          '<fieldset class="rating" name="' + bookmark.url + '" id="rating' + i + '">' +
          '<input type="radio" id="star5-' + i + '" ' + (checkedStar[5] || '') + ' name="rating-' + i + '" value="5" /><label class = "full star" id = "5" for="star5-' + i + '" title="Awesome - 5 stars"></label>' +
          '<input type="radio" id="star4-' + i + '" ' + (checkedStar[4] || '') + ' name="rating-' + i + '" value="4" /><label class = "full star" id = "4" for="star4-' + i + '" title="Pretty good - 4 stars"></label>' +
          '<input type="radio" id="star3-' + i + '" ' + (checkedStar[3] || '') + ' name="rating-' + i + '" value="3" /><label class = "full star" id = "3" for="star3-' + i + '" title="Meh - 3 stars"></label>' +
          '<input type="radio" id="star2-' + i + '" ' + (checkedStar[2] || '') + ' name="rating-' + i + '" value="2" /><label class = "full star" id = "2" for="star2-' + i + '" title="Kinda bad - 2 stars"></label>' +
          '<input type="radio" id="star1-' + i + '" ' + (checkedStar[1] || '') + ' name="rating-' + i + '" value="1" /><label class = "full star" id = "1" for="star1-' + i + '" title="Sucks big time - 1 star"></label>' +
          '</fieldset></span>' +

          '</li>');
        index++;
      }

      //chrome.storage.local.remove(bookmark.url); //reset bookmarks
      //}
      displayed += perPage;
      bindScroll();
    }

  };

  // http://stackoverflow.com/questions/1248302/javascript-object-size
  var roughSizeOfObject = function(object) {

    var objectList = [];
    var stack = [object];
    var bytes = 0;

    while (stack.length) {
      var value = stack.pop();

      if (typeof value === 'boolean') {
        bytes += 4;
      } else if (typeof value === 'string') {
        bytes += value.length * 2;
      } else if (typeof value === 'number') {
        bytes += 8;
      } else if (
        typeof value === 'object' && objectList.indexOf(value) === -1
      ) {
        objectList.push(value);

        for (var i in value) {
          stack.push(value[i]);
        }
      }
    }
    return bytes;
  };

  return {
  	getBookmarkList: getBookmarkList,
  	update: update,
  	loading: loading
  };

});
