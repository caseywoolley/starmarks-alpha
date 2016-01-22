angular.module('app')
  .directive('starSelector', function() {
    return {
      restrict: 'EA',
      scope: {
        bookmark: "=",
        id: "=",
        size: "=",
        update: "="
      },
      templateUrl: '../components/star-selector/star-selector.html'
    };
  })
  //TODO: find a home for these filters and directives
  .directive('lowercase', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        modelCtrl.$parsers.push(function(input) {
          return input ? input.toLowerCase() : "";
        });
        element.css("text-transform", "lowercase");
      }
    };
  })
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

.filter('timeSince', function() {
  return function(timeStamp) {
    var now = new Date();
    timeStamp = new Date(timeStamp);
    secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
    if (secondsPast < 60) {
      return parseInt(secondsPast) + 's ago';
    }
    if (secondsPast < 3600) {
      return parseInt(secondsPast / 60) + 'm ago';
    }
    if (secondsPast <= 86400) {
      return parseInt(secondsPast / 3600) + 'h ago';
    }
    if (secondsPast > 86400) {
      day = timeStamp.getDate();
      month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
      year = timeStamp.getFullYear() == now.getFullYear() ? "" : " " + timeStamp.getFullYear();
      return day + " " + month + year;
    }
  };
})

.filter('arrayFilter', function() {
  return function(items, tags) {
    var prop = Object.keys(tags)[0];
    tags = tags[prop];
    if (tags === undefined || tags.length === 0) {
      return items;
    }
    return items.filter(function(item) {
      var itemTags = Object.keys(item[prop]);
      //console.log(itemTags)
      for (var i = 0; i < itemTags.length; i++) {
        var tag = itemTags[i];
        if (tag.indexOf(tags) !== -1 || tags.indexOf(tag) !== -1) {
          return true;
        }
      }
      return false;
    });
  };
})

.filter('rangeFilter', function() {
  return function(items, range, type) {
    var prop = Object.keys(range)[0];
    var noMax = false;
    if (range[prop] === undefined) {
      return items;
    }
    var values = range[prop].split(/\s*-\s*/);
    var min = values[0];
    var max = values[1];
    if (!max) {
      max = min;
    }
    if (min.indexOf('+') !== -1) {
      min = min.substring(0, min.length - 1);
      noMax = true;
    }
    //handle dates
    if (type === 'date') {
      min = new Date(min).getTime();
      max = new Date(max).getTime();

      //TODO: handle invalid, year only, days, hours, months
      if (('' + values[0]).length < 4) {
        return items;
      }
      if (('' + values[0]).length === 4 && min === max) {
        max = min + (1000 * 60 * 60 * 24 * 365);
        max = new Date(max).getTime();
      }
    }

    return items.filter(function(item) {
      if (noMax) {
        return (item[prop] >= min);
      }
      return (item[prop] >= min && item[prop] <= max);
    });
  };
});

// .filter('applyFilters', function($filter) {
//   return function(items, filters) {
//     if (filters.length === 0) {
//       return items;
//     }
//     var filtered = [];
//     var range;
//     angular.forEach(filters, function(filter) {
//       var type = filter.split(':')[0].trim();
//       var value = filter.split(':')[1].trim();

//       //build filter object for text searching
//       if (type === 'text') {
//         type = '$';
//       }
//       var filterObj = {};
//       filterObj[type] = value;

//       if (type === '$' || type === 'title') {
//         //console.log(filterObj)
//         filtered = filtered.concat($filter('filter')(items, filterObj));
//       } else if (type === 'tag') {
//         //console.log(filterObj)
//         //filter for tags object
//       } else {
//         //build filter object for ranges
//         //TODO: handle non ranges and +/- markers
//         var min = parseInt(value.split('-')[0].trim());
//         var max = parseInt(value.split('-')[1].trim());
//         range = {
//           prop: type,
//           min: min,
//           max: max
//         };
//       }

//       //handle ranges - stars, added, visited, visits
//       if (type === 'stars' || type === 'visits') {

//         //console.log(range)
//         filtered = $filter('rangeFilter')(items, range);
//       }
//     });
//     return filtered;
//   };
// })

// .filter('rangeFilter', function() {
//   return function(items, range) {
//     return items.filter(function(item){
//       return (item[range.prop] >= range.min && item[range.prop] <= range.max);
//     });
//   };
// })

// .filter('objectKeys', function() {
//   return function(object) {
//     var keys = Object.keys(object);
//     return keys;
//   };
// });
