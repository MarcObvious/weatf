(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.users', {
                    url: '/users',
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
                            templateUrl: 'users/users.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'users'
                    }
                });
        }]);

    app.controller('userModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope','userData','usersService',
        function ($scope, $uibModalInstance, $log, $rootScope, userData, usersService) {
            var init = function () {
                $scope.user = userData ? userData : {};
                $scope.user.gender = userData.gender ? userData.gender : "0";
            };
           /* $scope.ok = function (model) {
                usersService.saveUser($scope.user).then(function(result){
                    console.log(result);
                });
                $uibModalInstance.close(model);
            };

            $scope.cancel = function (model) {
                $uibModalInstance.dismiss('Exit');
            };*/

            $scope.save = function () {
                $scope.user.picture = $scope.user.raw_picture.base64;
                if ($scope.user.newuser) {
                    usersService.createUser($scope.user).then(function(result){
                        console.log(result);
                    });
                }
                else {
                    $scope.user.user_id = $scope.user.id;
                    usersService.saveUser($scope.user).then(function(result){
                        console.log(result);
                    });
                }
                $uibModalInstance.close($scope.user);
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('Exit');
            };

            $scope.delete = function (user_id) {
                usersService.deleteUser({user_id:user_id}).then(function(result){
                    console.log(result);
                });
                $uibModalInstance.dismiss('Exit');
            };

            init();
        }]);

    /*app.controller('productModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope', 'productData',
        function ($scope, $uibModalInstance, $log, $rootScope, productData) {
            var init = function () {
                $scope.product = productData;
            };
            $scope.ok = function (model) {
                $uibModalInstance.close(model);
            };

            $scope.cancel = function (model) {
                $uibModalInstance.dismiss('Exit');
            };

            init();
        }]);*/


}(angular.module("weatf.users", [
    'ui.router',
    'ngAnimate',
    'usersService',
    'authService'
])));