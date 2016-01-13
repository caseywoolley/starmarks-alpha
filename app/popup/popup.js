
angular.module('app.popup')
.controller('popup', function($scope, StarMarks) {
  $scope.newStarmark = {};

  $scope.addBookmark = function(){
    var rating = $scope.newStarmark.stars;
    $scope.setBadge(rating);
    $scope.getCurrentTab( function(tab) {
      if ($scope.newStarmark.id){
        StarMarks.update($scope.newStarmark);
      } else {
        StarMarks.add(tab, rating, function(newBookmark){
          $scope.newStarmark = newBookmark;
        });   
      }
    });
    window.close();
  };

  $scope.setBadge = function(rating){
    chrome.browserAction.setBadgeText({
      text: rating
    });
  };

  $scope.getBookmark = function(){
    $scope.getCurrentTab(function(tab){
      StarMarks.get(tab.url, function(data){
        $scope.$evalAsync(function(){ 
          $scope.newStarmark = data[tab.url] || {};
          if (data[tab.url]) {
            $scope.setBadge(data[tab.url].stars);
          }
        });
      });
    });
  };

  $scope.getCurrentTab = function(callback){
    var currentTab = { 'active': true, 'lastFocusedWindow': true };
    chrome.tabs.query(currentTab, function(tab) {
      callback(tab[0]);
    });
  };

  $scope.openManager = function(){
    chrome.tabs.create({
      url: 'app/main/starManager.html'
    });
  };

  //initialize with current bookmark
  $scope.getBookmark();
});