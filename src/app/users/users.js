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
                $scope.user.raw_picture ={};
                $scope.user.gender = userData.gender ? userData.gender : "0";

                $scope.dates = {};
                $scope.dates.format = 'dd-MM-yyyy';
                $scope.dates.dateOptions = { formatYear: 'yy', startingDay: 1 };
                $scope.dates.birthday = angular.isDefined(userData.birthdate) ? new Date(userData.birthdate) : new Date();
                $scope.dates.opened = false;
            };

            $scope.openDatepicker = function() {
                $scope.dates.opened = true;
            };

            $scope.save = function () {
                if (angular.isDefined($scope.user.raw_picture.base64)){
                    $scope.user.picture = $scope.user.raw_picture.base64;
                }
                var mal = $scope.dates.birthday.toISOString().slice(0,10);
                $scope.user.birthdate = mal.slice(8,10) + '-' + mal.slice(5,7) + '-'+mal.slice(0,4);
                if ($scope.user.newuser) {
                    usersService.createUser($scope.user).then(function(result){
                        console.log(result);
                        $uibModalInstance.close(result);
                    });
                }
                else {
                    delete $scope.user.created_at;
                    delete $scope.user.updated_at;
                    $scope.user.user_id = $scope.user.id;
                    usersService.saveUser($scope.user).then(function(result){
                        console.log(result);
                        $uibModalInstance.close(result);
                    });
                }

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