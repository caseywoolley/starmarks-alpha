app.directive('starSelector', function(){
	
	return {
		restrict: 'EA',
		replace: true,
		require:'ngModel',
		scope: false,
		//templateUrl points to an external html template.
		templateUrl: 'starSelector.html'
	};
});

app.filter('objectKeys', function () {
    return function (object) {
        var keys = Object.keys(object);
        return keys;
    };
});