(function (app) {

    app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', 'localStorageServiceProvider',
        function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, localStorageServiceProvider) {
            $urlRouterProvider.otherwise('/auth');
            $httpProvider.interceptors.push('cInterceptor');
            $httpProvider.defaults.useXDomain = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];

            localStorageServiceProvider
                .setPrefix('')
                .setStorageType('localStorage')
                .setStorageCookie(7, '/')
                .setStorageCookieDomain(COOKIE_DOMAIN)
                .setNotify(true, true);

            //Root view, very important resolve data async before states
            $stateProvider
                .state('root', {
                    url: '',
                    abstract: true,
                    views: {
                        'header': {
                            templateUrl: 'header.tpl.html',
                            controller: 'FrontController'
                        },
                        'footer': {
                            templateUrl: 'footer.tpl.html',
                            controller: 'FooterController'
                        }
                    }
                });
            //Remove hashtag from URL
            $locationProvider.html5Mode(true);
        }
    ]);

    app.run(['$log','globalService', function ($log,globalService) {
        globalService.getAuthToken().then(function (authtoken) {
            console.log(authtoken);
        });
    }]);

    app.controller('AppController', ['$scope', '$log','$rootScope', function ($scope, $log, $rootScope) {
        $log.info('App:: Starting AppController');
        $rootScope.alerts = [];
    }]);

    app.controller('FrontController', ['$scope', '$log', function ($scope, $log) {
        $log.info('App:: Starting FrontController');
    }]);

    app.controller('FooterController', ['$scope', '$log', function ($scope, $log) {
        $log.info('App:: Starting FooterController');
    }]);

}(angular.module("weatf", [
    'ngResource',
    'ngAnimate',
    'globalService',
    'geolocationService',
    'weatf.locals',
    'weatf.users',
    'weatf.chart',
    'weatf.auth',
    'weatf.notifier',
    'weatf.scheduler',
    'weatf.simplepush',
    'weatf.segmentedpush',
    'weatf.segment',
    'weatf.orders',
    'LocalStorageModule',
    'ui.bootstrap',
    'templates-app',
    'templates-common',
    'ui.router.state',
    'ui.router',
    'cInterceptor',
    'genericDirectives',
    'ngMap',
    'ngTable',
    'ngCsv',
    'naif.base64',
    'chart.js'

])));
