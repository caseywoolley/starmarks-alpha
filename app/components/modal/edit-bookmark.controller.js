angular.module('app')
  .controller('editBookmark', function($scope, close, StarMarks) {
    $scope.newStarmark = {};
    $scope.currentTab = {};

    $scope.dismissModal = function(result) {
      console.log(close)
      close(result, 20000); // close, but give 200ms for bootstrap to animate
    };

    $scope.addBookmark = function(bookmark) {
      var tab = $scope.currentTab;
      $scope.setBadge(bookmark.stars);

      //update or add bookmark
      if (bookmark.id) {
        StarMarks.update(bookmark, function(updatedBookmark) {
          $scope.newStarmark = updatedBookmark;
        });
      } else {
        StarMarks.add(tab, bookmark.stars, function(newBookmark) {
          $scope.newStarmark = newBookmark;
        });
      }
      window.close();
    };

    $scope.setBadge = function(rating) {
      rating = '' + rating;
      chrome.browserAction.setBadgeText({
        text: rating
      });
    };

    $scope.getBookmark = function() {
      $scope.getCurrentTab(function(tab) {
        StarMarks.get(tab.url, function(bookmark) {
          $scope.$evalAsync(function() {
            $scope.setBadge(0);
            if (bookmark) {
              $scope.newStarmark = bookmark;
              $scope.setBadge(bookmark.stars);
            }
          });
        });
      });
    };

    $scope.getCurrentTab = function(callback) {
      var currentTab = {
        'active': true,
        currentWindow: true
      };
      chrome.tabs.query(currentTab, function(tab) {
        $scope.currentTab = tab[0];
        callback(tab[0]);
      });
    };

    $scope.openManager = function() {
      chrome.tabs.create({
        url: 'app/main/star-manager.html'
      });
    };

    //initialize with current bookmark if exists
    $scope.getBookmark();
  });
