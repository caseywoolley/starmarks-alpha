angular.module('app.main')
  .controller('starManager', function($scope, $filter, $httpParamSerializer, ModalService, StarMarks) {

  $scope.update = StarMarks.update;
  $scope.allBookmarks = [];
  $scope.search = {};
  $scope.loading = true;
  $scope.sortColumn = 'dateAdded';
  $scope.displayCount = "0";
  $scope.getTags = StarMarks.getTags;

  //Docs - https://github.com/dnauck/angular-advanced-searchbox
  $scope.availableSearchParams = [
          { key: "stars", name: "Rating", placeholder: "number, range, etc. ( 5, 2-4, 3+ )" },
          { key: "visits", name: "Visits", placeholder: "Visits..." },
          { key: "dateAdded", name: "Date Added", placeholder: "Date Added..." },
          { key: "lastVisit", name: "Last Visited", placeholder: "Last Visited..." },
          { key: "tags", name: "Tags", suggestedValues: ['tag','tag2'], placeholder: "tag1, tag2" },
          { key: "title", name: "Title", placeholder: "Title..." },
          { key: "searchName", name: "Save As", placeholder: "Save search as..." },
        ];

  $scope.makeUrl = function(){
    return $httpParamSerializer($scope.search);
  };

  $scope.editBookmark = function(bookmark){
    console.log('edit this',bookmark);
    $scope.showAModal(bookmark);
  };

  $scope.showAModal = function(bookmark) {

    // Just provide a template url, a controller and call 'showModal'.
    ModalService.showModal({
      templateUrl: "../components/modal/editBookmark.html",
      controller: "editBookmark",
      inputs: {
        bookmark: bookmark
      }
    }).then(function(modal) {
      console.log(modal)
      // The modal object has the element built, if this is a bootstrap modal
      // you can call 'modal' to show it, if it's a custom modal just show or hide
      // it as you need to.
      modal.element.modal();
      modal.close.then(function(result) {
        $scope.message = result ? "You said Yes" : "You said No";
      });
    });

  };

  $scope.addSearchTag = function(tag){
    $scope.search.tags = tag;
  };

  $scope.getMax = function(field){
    var max = _.max($scope.allBookmarks, _.property(field));
    return max[field];
  };

  $scope.getAll = function() {
    $scope.loading = true;
    $scope.displayed = [];

    StarMarks.getBookmarkList(function(bookmarks) {
      $scope.allBookmarks = bookmarks;
      $scope.sortBookmarks($scope.sortColumn);
      $scope.loading = false;
      $scope.$apply();
    });
  };

  $scope.deleteBookmark = function(bookmark, index){
    StarMarks.deleteBookmark(bookmark);
    console.log('deleted',$scope.allBookmarks[index]);
    $scope.allBookmarks.splice(index, 1);
  };

  $scope.bookmarkClicked = function(bookmark) {
    bookmark.visits = bookmark.visits || 0;
    bookmark.visits++;
    bookmark.lastVisit = new Date().getTime();
    StarMarks.update(bookmark);
  };

  $scope.applyFilters = function(bookmarks, filters){
    var filtered = bookmarks;
    filters.stars.prop = 'stars';
    filtered = $filter('rangeFilter')(filtered, filters.stars);
    return filtered;
  };

  $scope.updateFilter = function(){
    $scope.allBookmarks = $filter('orderBy')($scope.allBookmarks, $scope.sortColumn);
  };

  $scope.filterBookmarks = function() {

  };

  $scope.resetDisplay = function(){
    $scope.displayCount = '0';
    $scope.displayBookmarks();
  };

  $scope.sortBookmarks = function(column){
    var desc = '-';
    if ($scope.sortColumn === desc + column){ desc = ''; }
    $scope.sortColumn = desc + column;
    $scope.allBookmarks = $filter('orderBy')($scope.allBookmarks, $scope.sortColumn);
    $scope.resetDisplay();
  };

  $scope.displayBookmarks = function() {
    var perPage = 20;
    if ($scope.displayCount <= $scope.filteredBookmarks.length){
      $scope.displayCount = '' + (parseInt($scope.displayCount) + perPage);
    }
  };

  // //TODO: convert to filter
  // $scope.timeSince = function(timeStamp) {
  //   var now = new Date();
  //   timeStamp = new Date(timeStamp);
  //   secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
  //   if (secondsPast < 60) {
  //     return parseInt(secondsPast) + 's';
  //   }
  //   if (secondsPast < 3600) {
  //     return parseInt(secondsPast / 60) + 'm';
  //   }
  //   if (secondsPast <= 86400) {
  //     return parseInt(secondsPast / 3600) + 'h';
  //   }
  //   if (secondsPast > 86400) {
  //     day = timeStamp.getDate();
  //     month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
  //     year = timeStamp.getFullYear() == now.getFullYear() ? "" : " " + timeStamp.getFullYear();
  //     return day + " " + month + year;
  //   }
  // };

  //initialize bookmarks
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

});

  //auto update storage
  // var timeout = null;

  // var saveUpdates = function() {
  //   console.log('save local');
  // };

  // var debounceSaveUpdates = function(newVal, oldVal) {
  //   if (newVal != oldVal) {
  //     if (timeout) {
  //       $timeout.cancel(timeout);
  //     }
  //     timeout = $timeout(saveUpdates, 1000); // 1000 = 1 second
  //   }
  // };

  //$scope.$watchGroup('allBookmarks', debounceSaveUpdates);

    // $scope.searchData = function(data){
  //   var search = data;
  //   var range;
  //   if (search.stars){
  //     range = search.stars.split(/\s*-\s*/);
  //     search.starsRange = {prop: 'stars', min: range[0], max: range[1] };
  //   }
  // };

  // $scope.allFilters = function(){
  //   if ($scope.search.text.split(':')[1] !== '') {
  //     return $scope.filters.concat([$scope.search.text]);
  //   } else {
  //     return $scope.filters;
  //   }
  // };

  // $scope.addFilter = function(filter){
  //   console.log('add')
  //   $scope.filters.push(filter);
  //   $scope.search.text = 'text:';
  // };

  // $scope.ratingSelect = function(){
  //   console.log($scope.filters)
  //   //TODO: fix display update issue when selecting a max below minimum
  //   //$scope.filters.max.stars =  Math.max($scope.filters.min.stars, $scope.filters.max.stars);
  //   //$scope.starRange.min = $scope.filters.min.stars;
  //   //$scope.starRange.max = $scope.filters.max.stars;
  //   //$scope.updateFilter();
  //   $scope.resetDisplay();
  // };

  // $scope.filterBookmarks = function() {
  //   $scope.filters = {};
  //   //$scope.filters.rating = [$scope.minRating.stars, $scope.maxRating.stars];
  //   var searchArr = $scope.searchQuery.split(/\s+/);
  //   var text = [];
  //   for (i = 0; i < searchArr.length; i++) {
  //     pair = searchArr[i].split(/:/g);

  //     if (pair.length === 1) {
  //       text.push(pair[0]);
  //     } else {
  //       $scope.filters[pair[0]] = pair[1];
  //     }
  //   }
  //   $scope.filters.text = text.join(' ');
  //   console.log($scope.filters);

  //   //filter results by filter object
  //   console.log(StarMarks.filter($scope.filters));
  //   $scope.allBookmarks = StarMarks.filter($scope.filters);
  //   $scope.resetDisplay();
  // };

  // $scope.getFavicon = function(url){
  //   return 'http://' + new URL(url).hostname + '/favicon.ico';
  // };

  // $scope.order = function(predicate) {
  //   $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
  //   $scope.predicate = predicate;
  // };

