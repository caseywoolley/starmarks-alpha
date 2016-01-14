angular.module('app')
.directive('starSelector', function(){
	
	return {
		restrict: 'EA',
		scope: {
			bookmark: "=",
			rating: "=",
			id: "=",
			update: "="
		},
		templateUrl: '../components/star-selector/star-selector.html'
	};
})
//TODO: find a home for these filters and directives
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

.filter('rangeFilter', function() {
    return function( items, range) {
        var filtered = [];
        angular.forEach(items, function(item) {
            if( item[range.prop] >= range.min && item[range.prop] <= range.max ) {
                filtered.push(item);
            }
        });
        return filtered;
    };
})

.filter('objectKeys', function () {
    return function (object) {
        var keys = Object.keys(object);
        return keys;
    };
});