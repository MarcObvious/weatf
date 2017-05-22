(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.auth', {
                    url: '/auth',
                    parent: 'root',
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
                    $scope.logged = authService.autentica();
                    $scope.login.email = $rootScope.useremail;
                    $scope.login.name = $rootScope.username;
                    $rootScope.$emit('logged.loggedChange', {logged: $scope.logged});
                };

                $scope.submitLogout = function() {
                    authService.submitLogout();
                    $scope.logged = false;
                    $rootScope.$emit('logged.loggedChange', {logged: false});
                    //$state.go('root.auth',{},{refresh:true});
                };

                $rootScope.$watch('useremail', function (p1, p2, p3) {
                    $scope.login.email = $rootScope.useremail;
                    $scope.login.name = $rootScope.username;
                });

                $scope.submitLogin = function(){
                    authService.submitLogin($scope.login.username, $scope.login.password).then(function (data) {
                        if(data.message === 'Usuario identificado') {
                            $scope.logged = true;
                            $rootScope.$emit('logged.loggedChange', {logged: true});
                            $state.go('root.locals.localgrid');
                        }
                    }, function (err) {
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