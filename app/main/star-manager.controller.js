angular.module('app.main')
  .controller('starManager', function($rootElement, $scope, $filter, $location, $httpParamSerializer, ModalService, StarMarks) {

  $scope.update = StarMarks.update;
  $scope.allBookmarks = [];
  $scope.search = $location.search();
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

  $scope.getLocation = function(){
    //return window.location;
    return $location.url();
  };



  $scope.makeUrl = function(){
    $location.search($httpParamSerializer($scope.search));
    return $httpParamSerializer($scope.search);
  };

  $scope.editBookmark = function(bookmark, index){
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
    bookmark.visits = bookmark.visits || 1;
    bookmark.visits++;
    bookmark.lastVisit = new Date().getTime();
    StarMarks.update(bookmark);
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

  //initialize bookmarks
  $scope.getAll();

});

