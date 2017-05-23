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
                        ordersData: (['$q', '$log','$stateParams',
                            function ($q, $log, $stateParams) {
                                var def = $q.defer();
                                $log.debug('locals::::ResolveOrders');

                                if ($stateParams.id_local !== undefined) {
                                    def.resolve({filterName:'Pedidos local: ' + $stateParams.id_local, id_local:$stateParams.id_local});
                                }
                                else {
                                    def.resolve({filterName:'Pedidos de todos los locales'});
                                }
                                return def.promise;
                            }])
                    },
                    data: {
                        pageTitle: 'Pedidos local'
                    }
                });
        }]);

    app.controller('ordersController', ['$log','$scope','ordersData',
        function ($log,$scope,ordersData) {

            var init = function () {
                $log.info('App:: Starting ordersController');

                $scope.filterName = ordersData.filterName;
                $scope.id_local = ordersData.id_local;
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
                $scope.model = {};
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

    app.directive('ordersTable',['$state', function($state) {
        return {
            templateUrl:'orders/ordersTable.tpl.html',
            restrict: 'E',
            replace: true,
            controller:  (['$log','$scope','$state','$http','ngTableParams','$filter','$uibModal','ordersService',
                function ($log,$scope,$state,$http,ngTableParams,$filter,$uibModal,ordersService) {

                    var init = function () {
                        $log.info('App:: Starting ordersController');

                        $scope.model={};
                        $scope.isCollapsed = false;
                        $scope.vm={};

                        var date = new Date();

                        $scope.dateStart = {};
                        $scope.dateStart.format = 'dd-MM-yyyy';
                        $scope.dateStart.dateOptions = { formatYear: 'yy', startingDay: 1 };
                        $scope.dateStart.date = new Date(date.getTime() - 24*60*60*10000*7);
                        $scope.dateStart.opened = false;

                        $scope.dateEnd = {};
                        $scope.dateEnd.format = 'dd-MM-yyyy';
                        $scope.dateEnd.dateOptions = { formatYear: 'yy', startingDay: 1 };
                        $scope.dateEnd.date = date;
                        $scope.dateEnd.opened = false;

                        var start =  $scope.dateStart.date.toJSON().substr(0,10);
                        var end =  $scope.dateEnd.date.toJSON().substr(0,10);
                        getOrders(start, end);

                    };

                    var getOrders = function(start,end) {
                        if ($scope.localid !== undefined) {
                            ordersService.getLocalOrders({local_id: $scope.localid, dateStart:start, dateEnd:end}).then(function(data){
                                $scope.filterName = 'Pedidos local: ' + $scope.localid;
                                $scope.orders = data.data;
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: $scope.orders,counts:[10,15,20]});
                            }, function (err) {
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: [],counts:[10,15,20]});
                            });
                        }
                        else {
                            ordersService.getAllOrders({dateStart:start, dateEnd:end}).then(function (data) {
                                $scope.filterName = 'Pedidos de todos los locales';
                                $scope.orders = data.data;
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: $scope.orders,counts:[10,15,20]});
                            }, function (err) {
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: [],counts:[10,15,20]});
                            });
                        }
                    };

                    $scope.openDatepicker = function(date) {
                        $scope[date].opened = true;
                    };

                    $scope.viewOrderDetail = function (id) {
                        $scope.modalInstance = $uibModal.open({
                            templateUrl: 'orders/ordersModalView.tpl.html',
                            size: 'lg',
                            controller: 'ordersModalViewController',
                            resolve: {orderId: id},
                            scope: $scope
                        });

                        $scope.modalInstance.result.then(function(modalResult){},function(){});
                    };

                    $scope.cancelOrder = function (params) {
                        ordersService.cancelOrder(params).then(function(result){
                        }, function (err) {
                        });
                    };

                    $scope.mostrar = function() {
                        var start =  $scope.dateStart.date.toJSON().substr(0,10);
                        var end =  $scope.dateEnd.date.toJSON().substr(0,10);
                        getOrders(start, end);
                    };

                   init();
                }]),
            scope: {
                localid: '='
            }
        };
    }]);
}(angular.module("weatf.orders", [
    'ui.router',
    'ngAnimate',
    'ngTable',
    'ordersService'
])));