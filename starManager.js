var app = angular.module('app', ['infinite-scroll']);

app.controller('starManager', function($scope, $timeout, StarMarks) {

  $scope.starMarks = {};
  _.extend($scope.starMarks, StarMarks);

  $scope.allBookmarks = [];
  $scope.filteredBookmarks = [];
  $scope.displayedBookmarks = [];
  $scope.filters = {};
  $scope.searchQuery = '';
  $scope.loading = true;
  var revSort = false;
  $scope.reverse = true;
  $scope.predicate = 'stars';
  var sortBy = 'rating';

  // $scope.getFavicon = function(url){
  //   return 'http://' + new URL(url).hostname + '/favicon.ico';
  // };

  // $scope.order = function(predicate) {
  //   $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
  //   $scope.predicate = predicate;
  // };

  $scope.getAll = function() {
    $scope.loading = true;
    $scope.displayed = [];

    StarMarks.getBookmarkList(function(bookmarks) {
      $scope.allBookmarks = bookmarks;
      //make a filter function for this
      //http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
      function compare(a, b) {
        if (a.stars < b.stars)
          return -1;
        if (a.stars > b.stars)
          return 1;
        return 0;
      }
      $scope.allBookmarks.sort(compare).reverse();

      $scope.loading = false;
      $scope.$apply();
    });
  };

  $scope.bookmarkClicked = function(bookmark) {
    //update model
    bookmark.visits++;
    bookmark.lastVisit = new Date().getTime();
    console.log(bookmark.lastVisit);
    //save change
    $scope.starMarks.update(bookmark.url, {visits: bookmark.visits, 
      lastVisit: bookmark.lastVisit });
  };

  $scope.filterBookmarks = function() {
    var searchArr = $scope.searchQuery.split(/\s+/);
    var text = [];
    for (i = 0; i < searchArr.length; i++) {
      pair = searchArr[i].split(/:/g);

      if (pair.length === 1) {
        text.push(pair[0]);
      } else {
        $scope.filters[pair[0]] = pair[1];
      }
    }
    $scope.filters['text'] = text.join(' ');
    console.log($scope.filters);

  };

  $scope.sortBookmarks = function(column) {
    if (sortBy !== column) {
      sortBy = column;
      var compare = function(a, b) {
        //console.log(parseInt(a[column]), parseInt(b[column]));
        if (a[column] < b[column])
          return -1;
        if (a[column] > b[column])
          return 1;
        return 0;
      };
      $scope.allBookmarks.sort(compare);
    }
    $scope.allBookmarks.reverse();
    $scope.displayedBookmarks = [];
    $scope.displayBookmarks();
  };


  $scope.displayBookmarks = function() {
    var perPage = 20;
    $scope.checkedStar = {};
    var last = $scope.displayedBookmarks.length;
    console.log('more');
    for (var i = last; i < last + perPage; i++) {
      $scope.displayedBookmarks.push($scope.allBookmarks[i]);
      $scope.checkedStar[$scope.allBookmarks[i].stars] = true;
    }
  };

  $scope.timeSince = function(timeStamp) {
    var now = new Date();
    timeStamp = new Date(timeStamp);
    secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
    if (secondsPast < 60) {
      return parseInt(secondsPast) + 's';
    }
    if (secondsPast < 3600) {
      return parseInt(secondsPast / 60) + 'm';
    }
    if (secondsPast <= 86400) {
      return parseInt(secondsPast / 3600) + 'h';
    }
    if (secondsPast > 86400) {
      day = timeStamp.getDate();
      month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
      year = timeStamp.getFullYear() == now.getFullYear() ? "" : " " + timeStamp.getFullYear();
      return day + " " + month + year;
    }
  };

  //auto update storage
  var timeout = null;

  var saveUpdates = function() {
    console.log('save local');
  };

  var debounceSaveUpdates = function(newVal, oldVal) {
    if (newVal != oldVal) {
      if (timeout) {
        $timeout.cancel(timeout);
      }
      timeout = $timeout(saveUpdates, 1000); // 1000 = 1 second
    }
  };

  $scope.$watchGroup('allBookmarks', debounceSaveUpdates);



  $scope.getAll();

});

/*
var allBookmarks = [];
var filters = {};
var displayed = 0;
var loaded = true;

//cleanup popup file
  //add starmarks model
  //~add recent and most often used tags for quick tagging /otherwise inbox

//move bookmarks model logic to separate file
  //handle bookmark states (all, current set)
  //fully wrap chrome.storage
  //CRUD
  //save bookmarks to allBookmarks folder in browser bar (or as bar if selected?)
  //~ option to sync most visited/other view as bookmark bar

//build search UI
  //searchbar = filter url text, title text, ~tags
  //~ negative search terms
  // range selectors - date, visit count, last visit, rating
  //sort by columns - up and down toggle
  //move html to angular pages
  //save searches as tabs

  //organize file tree

$(function() {
  //update ratings on click
  $(document).on('click', 'input[type="radio"]', function(e) {
    var url = $(this).closest('fieldset').attr('name');
    var rating = e.target.value;
    //update rating
    chrome.storage.local.get(url, function(bookmark) {
      bookmark[url].stars = rating;
      chrome.storage.local.set(bookmark);
    });
    $(this).prop('checked', true);
  });

  $('.search-btn').on('click', function() {
    searchQuery = $('.search-bar').value();
    filters = {
      urlSearch: searchQuery
    };
    displayBookmarks(allBookmarks, filters);

  });
  //display chrome local storage

  chrome.storage.local.get(null, function(items) {
    console.log('local storage: ', items);
  });
  //TODO: get bookmark object from background
  chrome.runtime.sendMessage({
    bookmarks: 'all'
  }, function(response) {
    console.log('background', response);
  });
  getBookmarkList();
});

//infinite scroll
  var bindScroll = function(){
    $(window).scroll(function() {
      if($(window).scrollTop() + $(window).height() > $(document).height() - 1) {
        $(window).unbind('scroll');
        displayBookmarks(allBookmarks); 
      }
    });
  };
  bindScroll();

//TODO: search criteria - search by text, date, tag, rating

//recurse chrome bookmark tree
var getBookmarkList = function() {
  //get chorme bookamrks
  chrome.bookmarks.getTree(function(bookmarkTree) {
    console.log('bookmarks', bookmarkTree);
    console.log('size', roughSizeOfObject(bookmarkTree));
    //get allBookmarks data
    chrome.storage.local.get(null, function(starData) {
      console.log('allBookmarks', starData);
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
          delete bookmark.children; //bookmarks don't need this
          bookmark = _.extend(bookmark, starMark);
          //list.push(bookmark);
          list.push(bookmark);
        } else {
          //else add tag if doesn't exist 
        }

        //recurse
        if (node.children && node.children.length > 0) {
          for (var i = 0; i < node.children.length; i++) {
            var child = node.children[i];
            list = list.concat(mergeMarks(child));
            //list = _.extend(list, mergeMarks(child));
          }
        }
        return list;
      };
      var fullList = mergeMarks(bookmarkTree[0]);
      var $starMarks = $('.starMarks');
      $starMarks.html('');
      displayBookmarks(fullList);
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
  //console.log('total:',list.length);
  var index = 0;

  if (perPage > 0) {
  for (var i = displayed; i <= displayed + perPage; i++) {
    //console.log('count:', i, displayed, perPage);
    //console.log(list[url]);
    var bookmark = list[i];
    var checkedStar = {};
    checkedStar[bookmark.stars] = 'checked="checked"';
    //filter options
    //if (bookmark.stars > 0 ){
    //if (urlSearch === undefined || bookmark.url.indexOf(urlSearch) > -1) {
    //starMark = data[url];
    /*
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
*/


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
