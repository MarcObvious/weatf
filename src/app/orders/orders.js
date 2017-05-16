/*jshint newcap:false*/
(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.orders', {
                    url: '/orders',
                    parent: 'root',
                    views: {
                        "container@": {
                            controller: 'ordersController',
                            templateUrl: 'orders/orders.tpl.html'
                        }
                    },
                    resolve:{
                        autentica: (['authService',  function (authService) {
                            return authService.autentica();
                        }]),
                        ordersData: (['orderservice', '$q', '$log',
                            function (orderservice, $q, $log) {
                                $log.info('orders::ResolveData::');
                                var def = $q.defer();
                                var data = {data:[{
                                    "id": 3,
                                    "name": "iOS",
                                    "description": "iOS",
                                    "configuration": "{\"PlatformId\":\"1\"}",
                                    "deleted": false,
                                    "createdAt": "2015-11-20T08:58:37.000Z",
                                    "updatedAt": "2015-11-20T08:58:37.000Z",
                                    "Customers": [],
                                    "Campaign:": [],
                                    "Devicetokens": []
                                },{
                                    "id": 4,
                                    "name": "Android",
                                    "description": "Android",
                                    "configuration": "{\"PlatformId\":\"2\"}",
                                    "deleted": false,
                                    "createdAt": "2015-11-23T08:37:31.000Z",
                                    "updatedAt": "2015-11-23T08:37:31.000Z",
                                    "Customers": [],
                                    "Campaign:": [],
                                    "Devicetokens": []
                                }]};
                                def.resolve(data);
                                /*orderservice.getAllorders().then(function (data) {
                                    def.resolve(data);
                                }, function (err) {
                                    def.reject(err);
                                });*/
                                return def.promise;
                            }])
                    },
                    data: {
                        pageTitle: 'Programar'
                    }
                });
        }]);

    app.controller('ordersController', ['$log','$scope','$state','$http','ngTableParams','$filter','ordersData','$uibModal','orderservice',
        function ($log,$scope,$state,$http,ngTableParams,$filter,ordersData,$uibModal,orderservice) {

            var init = function (msg) {
                $log.info('App:: Starting ordersController');
                $scope.model={};
                $scope.model.pageTitle=$state.current.data.pageTitle;
                $scope.isCollapsed = false;
                var data = ordersData.data;
                $scope.vm={};
                $scope.vm.tableParams = new ngTableParams({count:10}, { data: data,counts:[10,15,20]});
                $scope.alerts = [msg];
            };

            $scope.addAlert = function(msg, type, time) {
                $scope.alerts.push({msg: msg, type: type, time:time});
            };

            $scope.closeAlert = function(index) {
                $scope.alerts.splice(index, 1);
            };

            $scope.addorders = function () {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'orders/ordersModalAdd.tpl.html',
                    size: 'lg',
                    controller: 'ordersModalAddController',
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(modalResult){
                    orderservice.submitorders(modalResult.name,modalResult.description,modalResult.configuration)
                        .then(function(data){
                            $scope.addAlert('orderso creado correctamente!', 'success', 3000);
                            orderservice.getAllorders().then(function (data) {
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: data.data,counts:[10,15,20]});
                            }, function (err) {
                                $log.error(err);
                                $scope.addAlert('Error al recuperar datos!', 'danger', 3000);
                            });
                        },function(err){
                            $log.error(err);
                            $scope.addAlert('Error al crear orderso!', 'danger', 3000);
                        });
                },function(){
                });

            };
            $scope.editorders = function (id) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'orders/ordersModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'ordersModalEditController',
                    resolve: {
                        ordersData: (['orderservice', '$q', '$log',
                            function (orderservice, $q, $log) {
                                $log.info('orders::ResolveData::');
                                var def = $q.defer();
                                orderservice.getorders(id).then(function (data) {
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
                    orderservice.saveorders(id,modalResult.name,modalResult.description,modalResult.configuration)
                        .then(function(data){
                            $scope.addAlert('orderso guardado correctamente!', 'success', 3000);
                            orderservice.getAllorders().then(function (data) {
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: data.data,counts:[10,15,20]});
                            }, function (err) {
                                $log.error(err);
                                $scope.addAlert('Error al recuperar datos!', 'danger', 3000);
                            });
                        },function(err){
                            $log.error(err);
                            $scope.addAlert('Error al guardar orderso!', 'danger', 3000);
                        });
                },function(){
                });


            };

            $scope.deleteorders = function(id) {
                orderservice.deleteorders(id).then(function(data){
                    $scope.addAlert('orderso eliminado correctamente!', 'success', 3000);
                    orderservice.getAllorders().then(function (data) {
                        $scope.vm.tableParams = new ngTableParams({count:10}, { data: data.data,counts:[10,15,20]});
                    }, function (err) {
                        $log.error(err);
                        $scope.addAlert('Error al recuperar datos!', 'danger', 3000);
                    });
                },function(err){
                    $log.error(err);
                    $scope.addAlert('Error al guardar orderso!', 'danger', 3000);
                });
            };

            $scope.duplicateorders = function(id) {
                orderservice.duplicateorders(id).then(function(data){
                    $scope.addAlert('orderso duplicado correctamente!', 'success', 3000);
                    orderservice.getAllorders().then(function (data) {
                        $scope.vm.tableParams = new ngTableParams({count:10}, { data: data.data,counts:[10,15,20]});
                    }, function (err) {
                        $log.error(err);
                        $scope.addAlert('Error al recuperar datos!', 'danger', 3000);
                    });
                },function(err){
                    $log.error(err);
                    $scope.addAlert('Error al duplicar orderso!', 'danger', 3000);
                });
            };

            init();
            //init({ type: 'warning', msg: 'Bienvenido a orders Manager, Duplica, envia o elimina orders!!', time:'3000' });
        }]);

    app.controller('ordersModalAddController', ['$scope', '$uibModalInstance', '$log','$rootScope',
        function ($scope, $uibModalInstance, $log, $rootScope) {
            var init = function (){
                $scope.status = {};
            };

            $scope.ok = function (model) {
                $uibModalInstance.close(model);
            };

            $scope.cancel = function (model) {
                $uibModalInstance.dismiss('Exit');
            };
            init();
        }]);

    app.controller('ordersModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope','ordersData',
        function ($scope, $uibModalInstance, $log, $rootScope,ordersData) {
            var init = function (){
                $scope.status = {};
                $scope.model={};
                $scope.model.name = ordersData.data.name;
                $scope.model.description = ordersData.data.description;
                $scope.model.configuration = ordersData.data.configuration;
            };

            $scope.ok = function (model) {
                $uibModalInstance.close(model);
            };

            $scope.cancel = function (model) {
                $uibModalInstance.dismiss('Exit');
            };
            init();
        }]);

}(angular.module("weatf.orders", [
    'ui.router',
    'ngAnimate',
    'ngTable',
    'orderservice'
])));