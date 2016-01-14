angular.module('app')
.directive('starSelector', function(){
	
	return {
		restrict: 'EA',
		scope: {
			bookmark: "=",
			id: "=",
			update: "="
		},
		templateUrl: '../components/star-selector/star-selector.html'
	};
})

//convert html input values to integers
.directive('integer', function(){
    return {
        require: 'ngModel',
        link: function(scope, ele, attr, ctrl){
            ctrl.$parsers.unshift(function(viewValue){
                return parseInt(viewValue, 10);
            });
        }
    };
})

.filter('objectKeys', function () {
    return function (object) {
        var keys = Object.keys(object);
        return keys;
    };
});