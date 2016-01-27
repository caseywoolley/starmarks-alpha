angular.module('app')
  .controller('confirmPopup', function($scope, close) {

    $scope.stopProp = function(event){
      event.stopPropagation();
    };

    $scope.dismissModal = function(result) {
      close(result, 200);
    };
    
  });
