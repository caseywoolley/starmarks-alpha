angular.module('app.main')
  .controller('starManager', function($rootElement, $scope, $filter, $location, $httpParamSerializer, ModalService, StarMarks) {

  $scope.update = StarMarks.update;
  $scope.allBookmarks = [];
  $scope.search = $location.search();
  $scope.loading = true;
  $scope.sortColumn = 'lastVisit';
  $scope.displayCount = "0";
  $scope.getTags = StarMarks.getTags;
  $scope.urlParser = document.createElement('a');
  $scope.selectedBookmarks = [];

  //Docs - https://github.com/dnauck/angular-advanced-searchbox
  $scope.availableSearchParams = [
    { key: "stars", name: "Rating", placeholder: "number, range, etc. ( 5, 2-4, 3+ )" },
    { key: "visits", name: "Visits", placeholder: "Visits..." },
    { key: "dateAdded", name: "Date Added", placeholder: "Date Added..." },
    { key: "lastVisit", name: "Last Visited", placeholder: "Last Visited..." },
    { key: "tags", name: "Tags", suggestedValues: ['tag','tag2'], placeholder: "tag1, tag2" },
    { key: "title", name: "Title", placeholder: "Title..." },
    { key: "url", name: "Url", placeholder: "Url..." },
    { key: "limit", name: "Limit Results", placeholder: "Results to return" },
  ];

  //watch DOM for selection changes
  $scope.$watch(function() { return document.body.innerHTML; }, function(){
    $scope.getSelected();
  });

  $scope.getSelected = function(){
    $scope.selectedBookmarks = $filter('filter')($scope.filteredBookmarks, {selected: true}, true);
    //console.log($scope.selectedBookmarks)
  };

  $scope.clearSelection = function(){
    if(!$scope.$$phase) {
      angular.element(document.body).triggerHandler('mousedown');
    }
  };

   $scope.stopProp = function(event){
    event.stopPropagation();
    //event.preventDefault();
  };

  $scope.mergeBookmarks = function(bookmarks){
    //merge tags into one tag object
    var tags = _.reduce(bookmarks, function(allTags, bookmark){
      return _.extend(allTags, bookmark.tags);
    }, {});

    //merge bookmarks where they match
    var massBookmark = {};
    for (var key in bookmarks[0]) {
      var set = _.pluck(bookmarks, key);
      if (_.every(set, function(item){
        return item === bookmarks[0][key];
      })){
        massBookmark[key] = bookmarks[0][key];
      }
    }
    massBookmark.tags = tags;
    massBookmark.originalTags = tags;
    return massBookmark;
  };

  $scope.editBookmarks = function(bookmarks){
    var massBookmark = $scope.mergeBookmarks(bookmarks);
    console.log('mass', massBookmark)
    ModalService.showModal({
      templateUrl: "../components/modal/editBookmark.html",
      controller: "editBookmark",
      inputs: {
        bookmark: angular.copy(massBookmark)
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(bookmarks) {
        if (bookmarks !== null){
         //process each bookmark changes
         console.log('returned', bookmarks)
        }
      });
    });
    $scope.clearSelection();
  };

  $scope.editBookmark = function(bookmark){
    var index = $scope.allBookmarks.indexOf(bookmark);
    ModalService.showModal({
      templateUrl: "../components/modal/editBookmark.html",
      controller: "editBookmark",
      inputs: {
        bookmark: angular.copy(bookmark)
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(bookmark) {
        if (bookmark !== null){
          StarMarks.update(bookmark);
          $scope.allBookmarks[index] = bookmark;
        }
      });
    });
  };


  $scope.goHome = function(){
    $scope.search.query = '';
    $scope.search = {};
    $location.search($scope.search);
  };

  $scope.showCollections = function(){
    $scope.search = {};
    $scope.search.url = chrome.extension.getURL('/');
  };

  $scope.isCollection = function(bookmark){
    var extensionUrl = chrome.extension.getURL('/');
    return bookmark.url.indexOf(extensionUrl) !== -1;
  };

  $scope.getLocation = function(){
    return $location.absUrl();
  };

  $scope.$on('advanced-searchbox:modelUpdated', function (event, model) {
    $scope.setUrl($scope.search);
  });

  $scope.$watch('search', function(){
    $scope.setUrl($scope.search);
  });

  $scope.setUrl = function(searchParams){
    $location.search($httpParamSerializer(searchParams));
    $scope.clearSelection();
    return $httpParamSerializer($scope.search);
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

  $scope.deleteBookmark = function(bookmark){
    // var ok = window.confirm('Are you sure?');
    // if (ok){
      var index = $scope.allBookmarks.indexOf(bookmark);
      StarMarks.deleteBookmark(bookmark);
      console.log('deleted',$scope.allBookmarks[index]);
      $scope.allBookmarks.splice(index, 1);
    // }
  };

  $scope.bookmarkClicked = function(bookmark) {
    bookmark.visits = bookmark.visits || 1;
    bookmark.visits++;
    bookmark.lastVisit = new Date().getTime();
    StarMarks.update(bookmark);
  };

  $scope.collectionClicked = function(bookmark) {
    $scope.urlParser.href = bookmark.url;
    var urlParams = $scope.urlParser.search;
    $location.search(urlParams.substring(1));
    $scope.search = $location.search();
    //increment bookmark visits
    $scope.bookmarkClicked(bookmark);
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

  $scope.searchLimit = function(){
    if ($scope.search.limit > 0){
      return $scope.search.limit;
    }
  };

  $scope.displayBookmarks = function() {
    var perPage = 20;
    if ($scope.filteredBookmarks) {
      if ($scope.displayCount <= $scope.filteredBookmarks.length){
        $scope.displayCount = '' + (parseInt($scope.displayCount) + perPage);
      }
    }
  };

  $scope.getAll();

});

