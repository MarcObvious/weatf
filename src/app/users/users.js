(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.users', {
                    url: '/users',
                    parent: 'root',
                    resolve: {
                        autentica: (['authService','$state', function (authService) {
                            return authService.autentica();
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
                $scope.user.gender = userData.gender ? userData.gender.toString() : "0";
                $scope.user.user_type = userData.user_type ? userData.user_type.toString() : "1";

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
                $scope.user.birthdate = mal.slice(8,10) + '-' + mal.slice(5,7) + '-' + mal.slice(0,4);
                if ($scope.user.newuser) {
                    usersService.createUser($scope.user).then(function(result){
                        $uibModalInstance.close(result.data);
                    }, function(err){
                    });
                }
                else {
                    delete $scope.user.created_at;
                    delete $scope.user.updated_at;
                    $scope.user.user_id = $scope.user.id;
                    usersService.saveUser($scope.user).then(function(result){
                        $uibModalInstance.close(result.data);
                    }, function(err){
                    });
                }

            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('Exit');
            };

            $scope.delete = function (user_id) {
                usersService.deleteUser({user_id:user_id}).then(function(result){
                    $uibModalInstance.dismiss('Exit');

                }, function(err){
                });
            };

            init();
        }]);

}(angular.module("weatf.users", [
    'ui.router',
    'ngAnimate',
    'usersService',
    'authService'
])));