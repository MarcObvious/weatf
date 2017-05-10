(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.auth', {
                    url: '/auth',
                    parent: 'root',
                    resolve: {
                        autentica: (['globalService',  function (globalService) {
                            console.log('authservice::::');
                            console.log(globalService.getAuthToken());
                            return true;
                            //return globalService.removeStorage(CUSTOM_HEADER);
                        }])

                    },
                    views: {
                        "container@": {
                            controller: 'authController',
                            templateUrl: 'auth/auth.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'auth'
                    }
                });
        }]);

    app.controller('authController', ['$scope','$log', 'authService','$state', function ($scope, $log, authService,$state) {

        var init = function () {
            $log.info('App:: Starting authController');
            $scope.pageTitle=$state.current.data.pageTitle;
        };

        init();
    }]);

    app.directive('loginBox',function() {
        return {
            templateUrl:'auth/login-box.tpl.html',
            restrict: 'E',
            replace: true,
            scope: {},
            controller: function($scope, $rootScope, $log, authService, $state){
                var init = function() {
                    $scope.selectedMenu = 'home';
                    $scope.date = new Date();
                    $scope.login = {};
                    authService.autentica().then(function (data) {
                        $scope.logged = data;
                        $rootScope.$emit('logged.loggedChange', {logged: $scope.logged});
                    });

                };

                $scope.submitLogout = function() {
                    authService.submitLogout();
                    $scope.logged = false;
                    $rootScope.$emit('logged.loggedChange', {logged: false});
                    $state.go('root.auth');
                };

                $scope.submitLogin = function(){
                    authService.submitLogin($scope.login.username, $scope.login.password).then(function (data) {
                        if(data === true) {
                            $scope.logged = true;
                            $rootScope.$emit('logged.loggedChange', {logged: true});
                            $state.go('root.home.ordergrid');
                            return true;
                        }
                        else {
                            alert('Credenciales incorrectas');
                        }
                    }, function (err) {
                        alert('Credenciales incorrectas');
                        $log.error(err);
                    });
                };

                init();
            }
        };
    });

}(angular.module("weatf.auth", [
    'ui.router',
    'authService'
])));