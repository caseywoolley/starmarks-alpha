angular.module('app.main', ['infinite-scroll', 'angularModalService']);
angular.module('app.popup', []);

angular.module('app', ['app.main', 'app.popup']);