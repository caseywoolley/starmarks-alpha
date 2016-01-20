angular.module('app.main', ['infinite-scroll', 'angularModalService']);
angular.module('app.popup', []);

angular.module('app', ['app.main', 'app.popup'])
.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);