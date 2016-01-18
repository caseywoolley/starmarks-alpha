angular.module('app')
  .directive('starSelector', function() {

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
  .directive('integer', function() {
    return {
      require: 'ngModel',
      link: function(scope, ele, attr, ctrl) {
        ctrl.$parsers.unshift(function(viewValue) {
          return parseInt(viewValue, 10);
        });
      }
    };
  })

.filter('applyFilters', function($filter) {
  return function(items, filters) {
    if (filters.length === 0){
      return items;
    }
    var filtered = [];
    var range;
    angular.forEach(filters, function(filter) {
      var type = filter.split(':')[0].trim();
      var value = filter.split(':')[1].trim();

      //build filter object for text searching
      if (type === 'text') {
        type = '$';
      }
      var filterObj = {};
      filterObj[type] = value;

      if (type === '$' || type === 'title') {
        //console.log(filterObj)
        filtered = filtered.concat($filter('filter')(items, filterObj));
      } else if (type === 'tag') {
        //console.log(filterObj)
          //filter for tags object
      } else {
        //build filter object for ranges
        //TODO: handle non ranges and +/- markers
        var min = parseInt(value.split('-')[0].trim());
        var max = parseInt(value.split('-')[1].trim());
        range = {
          prop: type,
          min: min,
          max: max
        };
      }

      //handle ranges - stars, added, visited, visits
      if (type === 'stars' || type === 'visits') {

        //console.log(range)
        filtered = $filter('rangeFilter')(items, range);
      }
    });
    return filtered;
  };
})

.filter('rangeFilter', function() {
  return function(items, range) {
    var filtered = [];
    angular.forEach(items, function(item) {
      if (item[range.prop] >= range.min && item[range.prop] <= range.max) {
        filtered.push(item);
      }
    });
    return filtered;
  };
})

.filter('objectKeys', function() {
  return function(object) {
    var keys = Object.keys(object);
    return keys;
  };
});
