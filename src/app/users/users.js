(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.users', {
                    url: '/users',
                    parent: 'root',
                    views: {
                        "container@": {
                            controller: 'usersController',
                            templateUrl: 'users/users.tpl.html'
                        }
                    },
                    resolve: {
                        autentica: (['authService', function (authService) {
                            return authService.autentica();
                        }]),
                        usersData: (['usersService', '$q', '$log',
                            function (usersService, $q, $log) {
                                var def = $q.defer();
                                $log.debug('users::::ResolveUsers');
                                usersService.getAllUsers().then(function(data){
                                    def.resolve({users: data, filterName:'Usuarios de todos los locales:'});
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    data: {
                        pageTitle: 'Usuarios'
                    }
                });
        }]);

    app.controller('usersController', ['$log','$scope','usersData','ngTableParams','$uibModal','usersService',
        function ($log, $scope, usersData, NGTableParams, $uibModal, usersService) {

            var init = function () {
                $log.info('App:: Starting usersController');
                $scope.filterName = usersData.filterName;
                $scope.vm = {};
                if (usersData.users) {
                    $scope.users = usersData.users;
                    $scope.vm.tableParams = new NGTableParams({count:15}, { data: $scope.users,counts:[15,20,50]});
                }
            };

            $scope.editUser = function (user_id) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'users/userModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'userModalEditController',
                    resolve: {
                        userData: (['usersService','$q',
                            function (usersService, $q) {
                                var def = $q.defer();
                                usersService.getUser({user_id: user_id}).then(function(data){
                                    def.resolve(data.data);
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(modalResult){
                },function(){

                });
            };

            $scope.deleteUser = function (params) {
                usersService.deleteUser(params).then(function(result){
                }, function (err) {
                });
            };

            init();

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

                usersService.getAllUsers().then(function (users) {
                    var users_final = [];
                    angular.forEach(users, function (user) {
                        if (angular.isDefined(user.email)) {
                            users_final.push(user);
                        }
                    });
                    $scope.users = users_final;
                });
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
                    //$scope.user.user_id = $scope.user.id;
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
                usersService.deleteUser({user_id: user_id}).then(function(result){
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