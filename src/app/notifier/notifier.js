(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.notifier', {
                    url: '/notifier',
                    parent: 'root',
                    resolve: {
                        autentica: (['authService','$state', function (authService) {
                            authService.autentica().then(function(logged){
                                return logged;
                            });
                        }])
                    },
                    abstract: true,
                    views: {
                        "container@": {
                            templateUrl: 'notifier/notifier.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'notifier'
                    }
                })
                .state('root.notifier.singlepush', {
                    url: '/singlepush/?:{page}:{filter_by}:{date}/:{id}',
                    parent: 'root.notifier',
                    views: {
                        "subcontainer@root.notifier": {
                            controller: 'singlePushController',
                            templateUrl: 'notifier/singlePush.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'Orders'
                    }
                })
                .state('root.notifier.segmentpush', {
                    url: '/segmentpush/',
                    parent: 'root.notifier',
                    views: {
                        "subcontainer@root.notifier": {
                            controller: 'segmentPushController',
                            templateUrl: 'notifier/segmentPush.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'LocalDetail'
                    }
                });
        }]);

    app.controller('singlePushController', ['$log','$scope','$state', '$stateParams',
        function ($log, $scope, $state, $stateParams) {

            var init = function () {
                $log.info('App:: Starting notifierController');
            };

            init();
        }]);
    app.controller('segmentPushController', ['$log','$scope','$state', '$stateParams',
        function ($log, $scope, $state, $stateParams) {

            var init = function () {
                $log.info('App:: Starting notifierController');
            };

            init();
        }]);


}(angular.module("weatf.notifier", [
    'ui.router',
    'ngAnimate',
    'notifierService'
])));