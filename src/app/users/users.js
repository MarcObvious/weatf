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

    app.controller('usersController', ['$log','$scope','usersData','ngTableParams','$uibModal','usersService','$state',
        function ($log, $scope, usersData, NGTableParams, $uibModal, usersService, $state) {

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
                    $state.reload();
                },function(){

                });
            };

            $scope.deleteUser = function (user_id) {
                usersService.deleteUser({user_id: user_id}).then(function(result){
                    $state.reload();
                }, function(err){
                });
            };


            init();

        }]);

    app.controller('userModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope','userData','usersService',
        function ($scope, $uibModalInstance, $log, $rootScope, userData, usersService) {
            var init = function () {
                $scope.userModal = userData ? userData : {};
                $scope.userModal.raw_picture = null;
                $scope.picture = $scope.userModal.profile_picture_url || null;
                $scope.userModal.gender = userData.gender ? userData.gender.toString() : "null";

                if(userData.user_type) {
                    $scope.userModal.user_type = userData.user_type.toString();
                }
                else {
                    switch ($rootScope.usertype) {
                        case 10:
                            $scope.userModal.user_type = "5";
                            break;
                        case 5:
                            $scope.userModal.user_type = "2";
                            break;
                        default:
                            $scope.userModal.user_type = "1";
                            break;
                    }
                }

                $scope.dates = {};
                $scope.dates.format = 'dd-MM-yyyy';
                $scope.dates.dateOptions = { formatYear: 'yy', startingDay: 1 };
                $scope.dates.birthday = angular.isDefined(userData.birthdate) ? new Date(userData.birthdate) : new Date();
                $scope.dates.opened = false;

                $scope.userModal.user_id = $scope.userModal.user_id ? $scope.userModal.user_id.toString() : "0";
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

            $scope.eliminarImagen = function() {
                $scope.userModal.raw_picture = null;
                $scope.userModal.picture = null;
                $scope.picture = null;
            };

            $scope.$watch('userModal.raw_picture', function(id, oldValue) {
                if($scope.userModal.raw_picture) {
                    $scope.picture = $scope.userModal.raw_picture.filename;
                }
            });

            $scope.openDatepicker = function() {
                $scope.dates.opened = true;
            };

            $scope.save = function () {
                if ($scope.userModal.raw_picture !== null){
                    $scope.userModal.picture = $scope.userModal.raw_picture.base64;
                }
                if (angular.isDefined($scope.userModal.directions) && angular.isDefined($scope.userModal.directions.phone)){
                    $scope.userModal.phone = $scope.userModal.directions.phone;
                }
                if ($scope.userModal.gender === "null"){
                    $scope.userModal.gender = null;
                }

                if($scope.userModal.user_type === 1 || $scope.userModal.user_type === 10){
                    delete $scope.userModal.user_id;
                }
                console.log($scope.dates.birthday);
                var mal = $scope.dates.birthday.toISOString().slice(0,10);
                $scope.userModal.birthdate = mal.slice(8,10) + '-' + mal.slice(5,7) + '-' + mal.slice(0,4);
                if ($scope.userModal.newuser) {
                    usersService.createUser($scope.userModal).then(function(result){
                        $uibModalInstance.close(result.data);
                    }, function(err){
                    });
                }
                else {
                    delete $scope.userModal.created_at;
                    delete $scope.userModal.updated_at;
                    //$scope.user.user_id = $scope.user.id;
                    usersService.saveUser($scope.userModal).then(function(result){
                        $uibModalInstance.close(result.data);
                    }, function(err){
                    });
                }
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('Exit');
            };

            $scope.deleteUser = function (user_id) {
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