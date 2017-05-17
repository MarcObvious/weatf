(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.locals', {
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
                            templateUrl: 'locals/locals.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'locals'
                    }
                })
                .state('root.locals.localgrid', {
                    url: '/?:{page}',
                    parent: 'root.locals',
                    resolve: {
                        localsData: (['localsService', '$q', '$log','$stateParams',
                            function (localsService, $q, $log, $stateParams) {
                                var def = $q.defer();
                                $log.debug('locals::::ResolveLocalsGrid');
                                localsService.getLocals().then(function(data){
                                    def.resolve({locals: data, filterName:'Todos los locales:', page: $stateParams.page});
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    views: {
                        "subcontainer@root.locals": {
                            controller: 'localGridController',
                            templateUrl: 'locals/localGrid.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'Orders'
                    }
                })
                .state('root.locals.localdetail', {
                    url: '/localDetail/{id_local}',
                    parent: 'root.locals',
                    resolve: {
                        localData: (['localsService', '$q', '$log','$stateParams',
                            function (localsService, $q, $log, $stateParams) {
                                var def = $q.defer();
                                $log.debug('locals::::ResolveOrderDetail::'+$stateParams.id_local);
                                localsService.getLocal({local_id: $stateParams.id_local}).then(function(data){
                                    def.resolve({local: data, filterName:'Local: ' + $stateParams.id_local});
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }]),
                        ordersData: (['ordersService', '$q', '$log','$stateParams',
                            function (ordersService, $q, $log, $stateParams) {
                                var def = $q.defer();
                                $log.debug('locals::::ResolveOrders'+$stateParams.id_local);
                                ordersService.getLocalOrders({local_id: $stateParams.id_local}).then(function(data){
                                    def.resolve(data);
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    views: {
                        "subcontainer@root.locals": {
                            controller: 'localDetailController',
                            templateUrl: 'locals/localDetail.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'LocalDetail'
                    }
                });
        }]);

    app.controller('localGridController', ['$log','$scope','$state','localsData', 'NgMap','$rootScope','$timeout', 'localsService','$uibModal',
        function ($log, $scope, $state, localsData, NgMap, $rootScope, $timeout, localsService, $uibModal) {

            var init = function () {
                $log.info('App:: Starting localsController');
                $scope.localsData = localsData;

                $scope.totalItems = 0;
                $scope.filterBy = localsData.filterName;
                $scope.locals = [];

                if (localsData.locals) {
                    $scope.locals = localsData.locals;
                    console.log($scope.locals);
                    $scope.positions = [];
                    $scope.totalItems = $scope.locals.length;

                    $scope.currentPage = localsData.page ? localsData.page : 1;
                    $scope.numPerPage = 5;
                    var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                    $scope.localsSliced = $scope.locals.slice(begin, end);


                    angular.forEach(localsData.locals, function (localData, index) {
                        if (angular.isDefined(localData.lat) && angular.isDefined(localData.lng)) {
                            $scope.positions.push({
                                pos:[localData.lat, localData.lng],
                                name: localData.name,
                                id_local: localData.id,
                                direction: localData.direction,
                                pickup_time: localData.pickup_time
                            });
                        }
                    });

                    $timeout(function() {
                        $rootScope.$emit('positions.positionsChange', {positions: $scope.positions});
                    });

                    $rootScope.$emit('local.local_id', {local_id: 'Todos'});
                }

            };

            $scope.newLocal = function () {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'locals/localModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'localModalEditController',
                    resolve: {localData : {newlocal: true}},
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(modalResult){
                },function(){

                });
            };

            $scope.mostrar = function() {
                var start =  $scope.dateStart.date.toJSON().substr(0,10);
                $state.go('root.locals.localgrid', {option: $scope.option, date: start});
            };

            $scope.pageChanged = function () {
                var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                $scope.localsSliced = $scope.locals.slice(begin, end);

                $state.go('root.locals.localgrid',{page:$scope.currentPage},{notify:false, reload:false, location:'replace', inherit:true});
            };

            $scope.openLocal = function (id_local) {
                $state.go('root.locals.localdetail',{id_local: id_local});
            };

            init();

        }]);

    app.controller('localDetailController', ['$log','$scope','$state','localData', '$rootScope','$timeout', 'localsService','$uibModal','ordersData','ngTableParams',
        function ($log, $scope, $state, localData, $rootScope, $timeout, localsService, $uibModal, ordersData, NgTableParams) {

            var init = function() {
                $scope.local = {};
                $scope.orders = {};
                var positions = [];
                var centerMap = [];
                if (localData) {
                    $scope.local = localData.local;
                    if (angular.isDefined(localData.local.lat) && angular.isDefined(localData.local.lng)) {
                        positions.push({
                            pos:[localData.local.lat, localData.local.lng],
                            name: localData.local.name,
                            id_local: localData.local.id,
                            direction: localData.local.direction,
                            pickup_time: localData.local.pickup_time
                        });
                        centerMap = [localData.local.lat, localData.local.lng];
                    }
                    $rootScope.$emit('local.local_id', {local_id: localData.local.id});
                }

                if (ordersData){
                    $scope.orders = ordersData;
                    $scope.vm={};
                    $scope.vm.tableParams = new NgTableParams({count:10}, { data: ordersData,counts:[10,15,20]});
                }

                $timeout(function() {
                    $rootScope.$emit('positions.positionsChange', {centerMap: centerMap, positions: positions});
                });
            };

            $scope.editLocal = function (localData) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'locals/localModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'localModalEditController',
                    resolve: {localData : localData},
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(modalResult){
                },function(){

                });
            };

            $scope.editProduct = function (productData) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'locals/productModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'productModalEditController',
                    resolve: {productData : productData},
                    scope: $scope
                });
                $scope.modalInstance.result.then(function(modalResult){
                },function(){

                });
            };

            $scope.editUser = function (local_id) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'users/userModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'userModalEditController',
                    resolve: {
                        userData: (['usersService','$q',
                            function (usersService, $q) {
                                var def = $q.defer();
                                usersService.getlocaluser({local_id: local_id}).then(function(data){
                                    def.resolve(data);
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

            $scope.viewOrderDetail = function (id) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'orders/ordersModalView.tpl.html',
                    size: 'lg',
                    controller: 'ordersModalViewController',
                    resolve: {orderId: id},
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(modalResult){

                },function(){
                });
            };

            init();
        }]);

    app.controller('localModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope','localData','$uibModal',
        function ($scope, $uibModalInstance, $log, $rootScope,localData,$uibModal) {
            var init = function () {
                $scope.local = localData;
            };
            $scope.ok = function (model) {
                $uibModalInstance.close(model);
            };

            $scope.cancel = function (model) {
                $uibModalInstance.dismiss('Exit');
            };

            $scope.newUser = function () {
                console.log('click');
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'users/userModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'userModalEditController',
                    resolve: {userData : {newuser:true}},
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(modalResult){
                },function(){

                });
            };

            init();
        }]);

    app.controller('productModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope', 'productData',
        function ($scope, $uibModalInstance, $log, $rootScope, productData) {
            var init = function () {
                console.log(productData);
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


}(angular.module("weatf.locals", [
    'ui.router',
    'ngAnimate',
    'localsService',
    'authService'
])));