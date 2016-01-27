angular.module('app.popup')
  .controller('popup', function($scope, StarMarks) {
    $scope.newStarmark = { stars: 1 };
    $scope.currentTab = {};
    $scope.starSize = 75;
    $scope.tags = '';
    $scope.exiting = false;


    $scope.collection = function(){
      var extensionUrl = chrome.extension.getURL('/');
      if ($scope.currentTab.url.indexOf(extensionUrl) != -1){
        return chrome.extension.getURL('/');
      }
    };

    $scope.parseTags = function(tagText) {
      if (tagText === undefined){ return {}; }
      return tagText.split(/\s*,\s*/)
      .reduce(function(o, v) {
        o[v] = v;
        return o;
      }, {});
    };

    $scope.addBookmark = function(bookmark) {
      var tab = $scope.currentTab;
      $scope.setBadge(bookmark.stars);

      bookmark.tags = $scope.parseTags(bookmark.tagField);
      //update or add bookmark
      if (bookmark.id) {
        StarMarks.update(bookmark, function(updatedBookmark) {
          $scope.newStarmark = updatedBookmark;
          if ($scope.exiting){
            window.close();
          }
        });
      } else {
        StarMarks.add(bookmark, function(newBookmark) {
          $scope.newStarmark = newBookmark;
        });
      }
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
            $scope.setBadge(1);
            if (bookmark) {
              if (!bookmark.tagField && bookmark.tags){
                bookmark.tagField = Object.keys(bookmark.tags).join(', ');
              }
              $scope.setBadge(bookmark.stars);
            } else {
              bookmark = {
                title: tab.title,
                url: tab.url,
                favIconUrl: tab.favIconUrl,
                stars: 1
              };
            }
            //copy to preserve directive scoping
            angular.copy(bookmark, $scope.newStarmark);
            $scope.addBookmark(bookmark);
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

    $scope.close = function(bookmark) {
      $scope.exiting = true;
      $scope.addBookmark(bookmark);
    };

    //initialize with current bookmark if exists
    $scope.getBookmark();
  });
