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

    app.controller('ordersModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope','orderDetailData','ordersService',
        function ($scope, $uibModalInstance, $log, $rootScope, orderDetailData, ordersService) {
            var init = function (){
                $scope.orderModal = {
                    order_id : orderDetailData.id,
                    order_state : orderDetailData.order_state ? orderDetailData.order_state.toString() : "0",
                    created_at : orderDetailData.created_at,
                    updated_at : orderDetailData.updated_at
                };

                if(orderDetailData.orderdetail !== null) {
                    var local_name = orderDetailData.orderdetail[0].localinfo !==null ? orderDetailData.orderdetail[0].localinfo.name : 'Desconocido';
                    var product_name = orderDetailData.orderdetail[0].productinfo !==null ? orderDetailData.orderdetail[0].productinfo.name : 'Desconocido';

                    $scope.orderModal.product_id = orderDetailData.orderdetail[0].product_id;
                    $scope.orderModal.product_name = product_name;
                    $scope.orderModal.product_quantity = orderDetailData.orderdetail[0].product_quantity;
                    $scope.orderModal.local_name = local_name;
                    $scope.orderModal.product_price = orderDetailData.orderdetail[0].product_price;
                    $scope.orderModal.tax_rate = orderDetailData.orderdetail[0].tax_rate;
                    $scope.orderModal.total_line = orderDetailData.orderdetail[0].total_line;
                    $scope.orderModal.user_name = orderDetailData.orderdetail[0].user_name;
                }

                console.log(orderDetailData);
            };


            $scope.cancelOrder = function () {
                ordersService.saveOrder({order_id: $scope.orderModal.order_id, order_state:2}).then(function(result){
                    $uibModalInstance.close(result);
                }, function (err) {
                });
            };

            $scope.save = function () {
                ordersService.saveOrder($scope.orderModal).then(function(result){
                    $uibModalInstance.close(result);
                }, function(err){
                });
            };
            init();
        }]);

    app.directive('ordersTable',['$state', function($state) {
        return {
            templateUrl:'orders/ordersTable.tpl.html',
            restrict: 'E',
            replace: true,
            controller:  (['$log','$scope','$state','$http','ngTableParams','ngTableEventsChannel','$filter','$uibModal','ordersService',
                function ($log,$scope,$state,$http,ngTableParams,ngTableEventsChannel,$filter,$uibModal,ordersService) {

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
                        $scope.orders = [];
                        $scope.exportData = [];
                        getOrders(start, end);

                        ngTableEventsChannel.onAfterReloadData(function(a,b,c){
                            var filters = a.filter();
                            var rawData = a.settings().data;
                            $scope.exportData = $filter('filter')(rawData,filters);
                        }, $scope);
                    };

                    var getOrders = function(start,end) {
                        if ($scope.localid !== undefined) {
                            ordersService.getLocalOrders({local_id: $scope.localid, dateStart:start, dateEnd:end}).then(function(data){
                                $scope.filterName = 'Pedidos local: ' + $scope.localid;
                                //$scope.orders = data.data;
                                populateCsv(data.data);
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: $scope.orders,counts:[10,15,20]});

                            }, function (err) {
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: [],counts:[10,15,20]});
                            });
                        }
                        else {
                            ordersService.getAllOrders({dateStart:start, dateEnd:end}).then(function (data) {
                                $scope.filterName = 'Pedidos de todos los locales';
                                // $scope.orders = data.data;
                                populateCsv(data.data);
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: $scope.orders,counts:[10,15,20]});

                            }, function (err) {
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: [],counts:[10,15,20]});
                            });
                        }
                        $scope.name_csv = 'Pedidos_'+ start + '_' + end;
                        $scope.headers_csv = ['Pedido','Local','Usuario','Estado','Producto','Precio','Cantidad','F.A','F.C'];
                    };

                    var populateCsv = function(orders) {
                        $scope.orders = [];
                        if (orders.length > 0) {
                            angular.forEach(orders, function (order) {
                                if (order.orderdetail!== null && order.orderdetail[0] !== null){
                                    var local_name = order.orderdetail[0].localinfo !==null ? order.orderdetail[0].localinfo.name : 'Desconocido';
                                    var product_name = order.orderdetail[0].productinfo !==null ? order.orderdetail[0].productinfo.name : 'Desconocido';
                                    $scope.orders.push({
                                        id: order.id,
                                        local_name: local_name,
                                        user_name: order.orderdetail[0].user_name,
                                        order_state_name: order.order_state_name,
                                        product_name: product_name ,
                                        product_price: order.orderdetail[0].product_price,
                                        product_quantity: order.orderdetail[0].product_quantity,
                                        updated_at: order.orderdetail[0].updated_at,
                                        created_at: order.orderdetail[0].created_at
                                    });
                                }
                            });
                        }
                    };

                    $scope.openDatepicker = function(date) {
                        $scope[date].opened = true;
                    };

                    $scope.viewOrderDetail = function (order_id) {
                        $scope.modalInstance = $uibModal.open({
                            templateUrl: 'orders/ordersModalEdit.tpl.html',
                            size: 'lg',
                            controller: 'ordersModalEditController',
                            resolve: {orderDetailData : (['ordersService','$q',
                                function (ordersService, $q) {
                                    var def = $q.defer();
                                    ordersService.getOrder({order_id: order_id}).then(function(data){
                                        def.resolve(data);
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                    return def.promise;
                                }])},
                            scope: $scope
                        });

                        $scope.modalInstance.result.then(function(modalResult){
                            $state.reload();
                        },function(){
                        });
                    };

                    $scope.cancelOrder = function (params) {
                        params.order_state = 2;
                        ordersService.saveOrder(params).then(function(result){
                            $state.reload();
                        }, function (err) {
                        });
                    };

                    $scope.mostrar = function() {
                        $scope.exportData = [];
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