/*jshint newcap:false*/
(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.orders', {
                    url: '/orders/?:{id_local}:{page}',
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
                        ordersData: (['ordersService', '$q', '$log','$stateParams','$rootScope',
                            function (ordersService, $q, $log, $stateParams, $rootScope) {
                                var def = $q.defer();
                                $log.debug('locals::::ResolveOrders');
                                if ($stateParams.id_local !== undefined) {
                                    ordersService.getLocalOrders({local_id: $stateParams.id_local}).then(function(data){
                                        def.resolve({orders: data, filterName:'Pedidos local: ' + $stateParams.id_local});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else {
                                    //TODO ALL ORDERS (root)
                                    ordersService.getLocalOrders({local_id: 1}).then(function(data){
                                        def.resolve({orders: data, filterName:'Pedidos de todos los locales'});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }

                                return def.promise;
                            }])
                    },
                    data: {
                        pageTitle: 'Pedidos local'
                    }
                });
        }]);

    app.controller('ordersController', ['$log','$scope','$state','$http','ngTableParams','$filter','ordersData','$uibModal','ordersService',
        function ($log,$scope,$state,$http,ngTableParams,$filter,ordersData,$uibModal,ordersService) {

            var init = function () {
                $log.info('App:: Starting ordersController');
                $scope.model={};
                $scope.isCollapsed = false;

                $scope.filterName = ordersData.filterName;
                $scope.orders = ordersData.orders;
                $scope.vm={};
                $scope.vm.tableParams = new ngTableParams({count:10}, { data: $scope.orders,counts:[10,15,20]});
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
                    ordersService.submitorders(modalResult.name,modalResult.description,modalResult.configuration)
                        .then(function(data){
                            $scope.addAlert('orderso creado correctamente!', 'success', 3000);
                            ordersService.getAllorders().then(function (data) {
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

            $scope.cancelOrder = function (params) {
                ordersService.cancelOrder(params).then(function(result){
                    console.log(result);
                }, function (err) {

                });
            };

            init();
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

    app.controller('ordersModalViewController', ['$scope', '$uibModalInstance', '$log','$rootScope','orderId',
        function ($scope, $uibModalInstance, $log, $rootScope,orderId) {
            var init = function (){
                $scope.status = {};
                $scope.model={};
                $scope.orderId = orderId;
                $scope.orderDetails = angular.isDefined($scope.orders[orderId].orderdetail) ? $scope.orders[orderId].orderdetail : [];
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
    'ordersService'
])));