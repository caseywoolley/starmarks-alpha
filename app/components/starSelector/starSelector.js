angular.module('app')
.directive('starSelector', function(){
	
	return {
		restrict: 'EA',
		scope: {
			bookmark: "=",
			id: "=",
			update: "="
		},
		templateUrl: '../components/starSelector/starSelector.html'
	};
})

.filter('objectKeys', function () {
    return function (object) {
        var keys = Object.keys(object);
        return keys;
    };
});