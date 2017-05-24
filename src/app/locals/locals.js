(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.locals', {
                    url: '',
                    parent: 'root',
                    resolve: {
                        autentica: (['authService','$state', function (authService) {
                            return authService.autentica();
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
                        localsData: (['localsService', '$q', '$log','$stateParams','authService',
                            function (localsService, $q, $log, $stateParams, authService) {
                                var def = $q.defer();
                                var logged = authService.autentica();
                                if (logged) {
                                    $log.debug('locals::::ResolveLocalsGrid');
                                    localsService.getLocals().then(function(data){
                                        def.resolve({locals: data.data, filterName:'Todos los locales:', page: $stateParams.page});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else{
                                    def.reject();
                                }
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
                        pageTitle: 'Locales'
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
                                    def.resolve({local: data.data, filterName:'Local: ' + $stateParams.id_local});
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
                        pageTitle: 'Detalle de local'
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
                    $scope.positions = [];
                    $scope.totalItems = $scope.locals.length;

                    $scope.currentPage = localsData.page ? localsData.page : 1;
                    $scope.numPerPage = $rootScope.usertype === 2 ? 6 : 5;
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

                $scope.modalInstance.result.then(function(modalResult) {
                    $state.go('root.locals.localdetail',{id_local: modalResult.id});
                });
            };

            $scope.mostrar = function () {
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

    app.controller('localDetailController', ['$log','$scope','$state','localData', '$rootScope','$timeout', 'localsService','$uibModal','productsService',
        function ($log, $scope, $state, localData, $rootScope, $timeout, localsService, $uibModal, productsService) {

            var init = function() {
                $scope.local = {};
                $scope.alerts = [];
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
                    $scope.local.products = $scope.local.products || [];
                    $rootScope.$emit('local.local_id', {local_id: localData.local.id});
                }

                $timeout(function() {
                    $rootScope.$emit('positions.positionsChange', {centerMap: centerMap, positions: positions});
                });
            };

            $scope.editLocal = function (local_id) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'locals/localModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'localModalEditController',
                    resolve: {
                        localData: (['localsService', '$q',
                            function (localsService, $q) {
                                var def = $q.defer();
                                localsService.getLocal({local_id: local_id}).then(function(data){
                                    def.resolve(data.data);
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(localResult){
                    /*var prods = $scope.local.products;
                     $scope.local = localResult;
                     $scope.local.products = prods;*/
                    $state.reload();
                });
            };

            $scope.newProduct = function () {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'locals/productModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'productModalEditController',
                    resolve: {productData :{newproduct: true, local_id: $scope.local.id}},
                    scope: $scope
                });
                $scope.modalInstance.result.then(function(productResult){
                    /*$scope.local.products.push(productResult);*/
                    $state.reload();
                },function(){
                    $state.reload();
                });
            };

            $scope.editProduct = function (id_product) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'locals/productModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'productModalEditController',
                    resolve: {productData : (['productsService','$q',
                        function (productsService, $q) {
                            var def = $q.defer();
                            productsService.getProduct({product_id: id_product}).then(function(data){
                                def.resolve(data.data);
                            }, function (err) {
                                def.reject(err);
                            });
                            return def.promise;
                        }])},
                    scope: $scope
                });
                $scope.modalInstance.result.then(function(productResult){
                    $state.reload();
                },function(){
                    $state.reload();
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
                                usersService.getlocalUser({local_id: local_id}).then(function(data){
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

            init();
        }]);

    app.controller('localModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope','localData','$uibModal','localsService','usersService',
        function ($scope, $uibModalInstance, $log, $rootScope,localData, $uibModal,localsService, usersService) {
            var init = function () {
                $scope.localModal = localData;

                $scope.localModal.raw_picture = null;
                $scope.picture = $scope.localModal.picture || null;

                $scope.localModal.user_id = angular.isDefined($scope.localModal.user_id) ? $scope.localModal.user_id.toString() : "0";
                $scope.dates = {};
                $scope.dates.from_hour = angular.isDefined(localData.from_hour) ? new Date('2017-05-05 '+localData.from_hour) : new Date();
                $scope.dates.to_hour = angular.isDefined(localData.to_hour) ? new Date('2017-05-05 '+localData.to_hour) : new Date();
                usersService.getAllUsers().then(function (users) {
                    var users_final = [];
                    angular.forEach(users, function (user) {
                        if (angular.isDefined(user.user_type) && user.user_type ===2) {
                            users_final.push(user);
                        }
                    });
                    $scope.users = users_final;
                });
            };

            $scope.eliminarImagen = function() {
                $scope.localModal.raw_picture = null;
                $scope.localModal.picture = null;
                $scope.picture = null;
            };

            $scope.$watch('localModal.raw_picture', function(id, oldValue) {
                if($scope.localModal.raw_picture) {
                    $scope.picture = $scope.localModal.raw_picture.filename;
                }
            });

            $scope.save = function () {
                if ($scope.localModal.raw_picture !== null){
                    $scope.localModal.picture = $scope.localModal.raw_picture.base64;
                }

                $scope.localModal.from_hour = $scope.dates.from_hour.toString().slice(16,21);
                $scope.localModal.to_hour =  $scope.dates.to_hour.toString().slice(16,21);
                if ($scope.localModal.newlocal) {
                    localsService.createLocal($scope.localModal).then(function(result){
                        console.log(result);
                        $uibModalInstance.close(result.data);
                    }, function(err){
                    });
                }
                else {
                    $scope.localModal.local_id = $scope.localModal.id;
                    localsService.saveLocal($scope.localModal).then(function(result){
                        $uibModalInstance.close(result.data);
                    }, function(err){
                    });
                }

            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('Exit');
            };

            $scope.delete = function (local_id) {
                localsService.deleteLocal({local_id:local_id}).then(function(result){
                    $uibModalInstance.dismiss('Exit');
                }, function(err){
                });

            };

            $scope.newUser = function () {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'users/userModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'userModalEditController',
                    resolve: {userData : {newuser:true}},
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(userResult){
                    if(angular.isDefined(userResult.id)){
                        $scope.users.push(userResult);
                        $scope.localModal.user_id = userResult.id.toString();
                    }
                },function(err){
                });
            };

            init();
        }]);

    app.controller('productModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope', 'productData', 'productsService',
        function ($scope, $uibModalInstance, $log, $rootScope, productData, productsService) {
            var init = function () {
                $scope.product = productData;
                $scope.product.raw_picture = null;
                $scope.picture = $scope.product.picture || null;

                $scope.product.type = $scope.product.type ? $scope.product.type.toString() : "1";

            };

            $scope.save = function () {
                if ($scope.product.raw_picture !== null){
                    $scope.product.picture = $scope.product.raw_picture.base64;
                }

                if ($scope.product.newproduct) {
                    productsService.createProduct($scope.product).then(function(result){
                        $uibModalInstance.close(result);
                    }, function(err){
                    });
                }
                else {
                    $scope.product.product_id = $scope.product.id;
                    productsService.saveProduct($scope.product).then(function(result){
                        $uibModalInstance.close(result);
                    }, function(err){
                    });
                }
                $uibModalInstance.close($scope.product);
            };

            $scope.eliminarImagen = function() {
                $scope.product.raw_picture = null;
                $scope.product.picture = null;
                $scope.picture = null;
            };

            $scope.$watch('product.raw_picture', function(id, oldValue) {
                if($scope.product.raw_picture) {
                    $scope.picture = $scope.product.raw_picture.filename;
                }
            });

            $scope.cancel = function () {
                $uibModalInstance.dismiss('Exit');
            };

            $scope.delete = function (product_id) {
                productsService.deleteProduct({product_id:product_id}).then(function(result){
                    $uibModalInstance.close({status:'deleted', id:product_id});
                }, function(err){
                });

            };

            init();
        }]);


}(angular.module("weatf.locals", [
    'ui.router',
    'ngAnimate',
    'localsService',
    'productsService',
    'authService'
])));