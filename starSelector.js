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