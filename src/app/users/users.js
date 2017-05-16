(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.users', {
                    url: '',
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
                })
                .state('root.users.usergrid', {
                    url: '/?:{page}:{filter_by}:{date}/:{id}',
                    parent: 'root.users',
                    resolve: {
                        usersData: (['usersService', '$q', '$log','$stateParams',
                            function (usersService, $q, $log, $stateParams) {
                                var def = $q.defer();

                                $log.debug('users::::ResolveusersGrid');

                                usersService.getusers().then(function(data){
                                    def.resolve({users: data, filterName:'All users:'});
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    views: {
                        "subcontainer@root.users": {
                            controller: 'userGridController',
                            templateUrl: 'users/userGrid.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'Orders'
                    }
                })
                .state('root.users.userdetail', {
                    url: '/userDetail/{id_user}',
                    parent: 'root.users',
                    resolve: {
                        userData: (['usersService', '$q', '$log','$stateParams',
                            function (usersService, $q, $log, $stateParams) {
                                var def = $q.defer();
                                var id = $stateParams.id_user;
                                $log.debug('users::::ResolveOrderDetail::'+id);

                                usersService.getuser({user_id: id}).then(function(data){
                                    def.resolve({user: data, filterName:'user: ' + id});
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    views: {
                        "subcontainer@root.users": {
                            controller: 'userDetailController',
                            templateUrl: 'users/userDetail.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'userDetail'
                    }
                });
        }]);

    app.controller('userGridController', ['$log','$scope','$state','usersData', 'NgMap','$rootScope','$timeout', 'usersService', '$stateParams',
        function ($log, $scope, $state, usersData, NgMap, $rootScope, $timeout, usersService, $stateParams) {

            var init = function () {
                $log.info('App:: Starting usersController');
                $scope.usersData = usersData;
                console.log(usersData);

                $scope.totalItems = 0;
                $scope.filterBy = usersData.filterName;
                $scope.users = [];

                if (usersData.users) {
                    $scope.users = usersData.users;
                    console.log($scope.users);
                    $scope.positions = [];
                    $scope.totalItems = $scope.users.length;

                    $scope.currentPage = $stateParams.page ? $stateParams.page : 1;
                    $scope.numPerPage = 6;
                    var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                    $scope.usersSliced = $scope.users.slice(begin, end);


                    angular.forEach(usersData.users, function (userData, index) {
                        if (angular.isDefined(userData.lat) && angular.isDefined(userData.lng)) {
                            $scope.positions.push({
                                pos:[userData.lat, userData.lng],
                                name: userData.name,
                                id_user: userData.id,
                                direction: userData.direction,
                                pickup_time: userData.pickup_time
                            });
                        }
                    });

                    $timeout(function() {
                        $rootScope.$emit('positions.positionsChange', {positions: $scope.positions});
                    });
                }

            };

            $scope.mostrar = function() {
                var start =  $scope.dateStart.date.toJSON().substr(0,10);
                $state.go('root.users.usergrid', {option: $scope.option, date: start});
            };

            $scope.pageChanged = function () {
                var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                $scope.usersSliced = $scope.users.slice(begin, end);

                $state.go('root.users.usergrid',{page:$scope.currentPage},{notify:false, reload:false, location:'replace', inherit:true});
            };

            $scope.openuser = function (id_user) {
                $state.go('root.users.userdetail',{id_user: id_user});
            };

            init();

        }]);

    app.controller('userDetailController', ['$log','$scope','$state','userData', '$rootScope','$timeout', 'usersService','$uibModal',
        function ($log, $scope, $state, userData, $rootScope, $timeout, usersService,$uibModal) {

            var init = function() {
                $scope.user = {};
                var positions = [];
                var centerMap = [];
                console.log(userData);
                if (userData) {
                    $scope.user = userData.user;
                    if (angular.isDefined(userData.user.lat) && angular.isDefined(userData.user.lng)) {
                        positions.push({
                            pos:[userData.user.lat, userData.user.lng],
                            name: userData.user.name,
                            id_user: userData.user.id,
                            direction: userData.user.direction,
                            pickup_time: userData.user.pickup_time
                        });
                        centerMap = [userData.user.lat, userData.user.lng];
                    }
                }

                $timeout(function() {
                    $rootScope.$emit('positions.positionsChange', {centerMap: centerMap, positions: positions});
                });
            };

            $scope.edituser = function (userData) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'users/userModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'userModalEditController',
                    resolve: {userData : userData},
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(modalResult){
                },function(){

                });
            };

            $scope.editProduct = function (productData) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'users/productModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'productModalEditController',
                    resolve: {productData : productData},
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(modalResult){
                },function(){

                });
            };

            init();
        }]);

    app.controller('userModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope','userData','globalService',
        function ($scope, $uibModalInstance, $log, $rootScope, userData, globalService) {
            var init = function () {
                $scope.user = userData;
                $scope.user.locals = [];
                $scope.localSelected = 'none';
                globalService.getSideBarLocals().then(function(data){
                    $scope.user.locals = data;
                }, function (err) {
                    console.log(err);
                });
            };
            $scope.ok = function (model) {
                $uibModalInstance.close(model);
            };

            $scope.cancel = function (model) {
                $uibModalInstance.dismiss('Exit');
            };

            init();
        }]);

    app.controller('productModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope', 'productData',
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
        }]);


}(angular.module("weatf.users", [
    'ui.router',
    'ngAnimate',
    'usersService',
    'authService'
])));