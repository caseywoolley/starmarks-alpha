angular.module('app')
  .directive('editBookmark', function() {
    return {
      restrict: 'EA',
      scope: {
        bookmark: "=",
        collection: "=",
        id: "=",
        starSize: "=",
        update: "="
      },
      templateUrl: '../components/edit-bookmark/edit-bookmark.html'
    };
  });
  