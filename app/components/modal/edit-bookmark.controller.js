angular.module('app')
  .controller('editBookmark', function($scope, close, bookmark, StarMarks) {
    $scope.bookmark = bookmark;
    $scope.currentTab = {};
    $scope.starSize = 70;
    $scope.bookmark.tagField = Object.keys(bookmark.tags).join(', ');

    $scope.parseTags = function(tagText) {
      return tagText.split(/\s*,\s*/)
      .reduce(function(o, v) {
        o[v] = v;
        return o;
      }, {});
    };

    $scope.saveChanges = function(bookmark) {
      bookmark.tags = $scope.parseTags(bookmark.tagField); 
      close(bookmark, 200);
    };

    $scope.dismissModal = function() {
      close(null, 200);
    };
    
  });
