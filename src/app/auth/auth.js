(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.auth', {
                    url: '/auth',
                    parent: 'root',
                    resolve: {
                        autentica: (['globalService',  function (globalService) {
                            console.log('AUTH!?');
                            globalService.getAuthToken().then(function (authtoken) {
                                console.log(authtoken);
                            });
                            return true;
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
                    $scope.logged = false;
                    authService.autentica().then(function(logged){
                        $scope.logged = logged;
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
                        if(data) {
                            $scope.logged = true;
                            $scope.login.email = data.email;
                            $scope.login.name = data.firstname +' '+data.lastname;
                            $rootScope.$emit('logged.loggedChange', {logged: true});
                            $state.go('root.locals.localgrid');
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