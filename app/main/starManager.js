angular.module('app.main')
  .controller('starManager', function($scope, $timeout, StarMarks) {

  $scope.update = StarMarks.update;
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

  $scope.deleteBookmark = function(bookmark, index){
    StarMarks.deleteBookmark(bookmark);
    console.log($scope.displayedBookmarks[index]);
    
    $scope.displayedBookmarks.splice(index, 1);
    $scope.allBookmarks.splice(index, 1);
  };

  $scope.bookmarkClicked = function(bookmark) {
    bookmark.visits = bookmark.visits || 0;
    bookmark.visits++;
    bookmark.lastVisit = new Date().getTime();
    StarMarks.update(bookmark);
  };

  $scope.filterBookmarks = function() {
    $scope.filters = {};
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
    $scope.filters.text = text.join(' ');
    console.log($scope.filters);

    //filter results by filter object
    console.log(StarMarks.filter($scope.filters));
    $scope.allBookmarks = StarMarks.filter($scope.filters);

    //TODO: switch to using filteredbookmarks as source
    //if ($scope.allBookmarks.length !== $scope.filteredBookmarks.length){

    $scope.displayedBookmarks = [];
    $scope.displayBookmarks();
    //}
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
    if ($scope.displayedBookmarks.length < $scope.allBookmarks.length){
      var perPage = Math.min(20, $scope.allBookmarks.length);
      $scope.checkedStar = {};
      var last = $scope.displayedBookmarks.length;
      console.log('more');
      for (var i = last; i < last + perPage; i++) {
        $scope.displayedBookmarks.push($scope.allBookmarks[i]);
        if ($scope.allBookmarks[i] && $scope.allBookmarks[i].stars ){
          //checkmark variable
          $scope.checkedStar[$scope.allBookmarks[i].stars] = true;
        }
      }
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

  // $scope.getFavicon = function(url){
  //   return 'http://' + new URL(url).hostname + '/favicon.ico';
  // };

  // $scope.order = function(predicate) {
  //   $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
  //   $scope.predicate = predicate;
  // };
});
