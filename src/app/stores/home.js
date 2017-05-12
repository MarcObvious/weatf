(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.stores', {
                    url: '',
                    parent: 'root',
                    resolve: {
                        autentica: (['authService', function (authService) {
                            var res = authService.autentica();
                            console.log('autentica?');
                            console.log(res);
                            return res;
                        }])
                    },
                    abstract: true,
                    views: {
                        "container@": {
                            templateUrl: 'stores/stores.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'stores'
                    }
                })
                .state('root.stores.ordergrid', {
                    url: '/?:{page}:{filter_by}:{date}/:{id}',
                    parent: 'root.stores',
                    resolve: {
                        ordersData: (['storesService', '$q', '$log','$stateParams',
                            function (storesService, $q, $log, $stateParams) {
                                var def = $q.defer();
                                var filter_by = $stateParams.filter_by;
                                var id = $stateParams.id;
                                var date = $stateParams.date;
                                $log.debug('stores::::ResolveOrderGrid::'+filter_by+'::'+id);

                                if (filter_by === 'repartidor' && parseInt(id) !== 0) {
                                    storesService.getOrdersByDeliveryMan({id: id, date: date}).then(function(data){
                                        var name = id;
                                        if (angular.isDefined(data[0].mensajero)) {
                                            name = '"' + data[0].mensajero + '"';
                                        }
                                        def.resolve({data: data, filterName:'Pedidos del repartidor: ' + name, date: date});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else if (filter_by === 'estado' && parseInt(id) !== 0) {
                                    storesService.getOrdersByStatus({id: id, date: date}).then(function(data){
                                        var name = storesService.estados(id);
                                        def.resolve({data: data, filterName:'Pedidos en estado: ' + name, date: date});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else {
                                    storesService.getAllOrders({date: date}).then(function (data) {
                                        def.resolve({data: data, filterName:'Todos los pedidos', date: date});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }

                                return def.promise;
                            }])
                    },
                    views: {
                        "subcontainer@root.stores": {
                            controller: 'orderGridController',
                            templateUrl: 'stores/orderGrid.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'Orders'
                    }
                })
                .state('root.stores.orderdetail', {
                    url: '/orderDetail/{id_order}',
                    parent: 'root.stores',
                    resolve: {
                        orderData: (['storesService', '$q', '$log','$stateParams',
                            function (storesService, $q, $log, $stateParams) {
                                var def = $q.defer();
                                var id = $stateParams.id_order;
                                $log.debug('stores::::ResolveOrderDetail::'+id);

                                storesService.getOrder({id: id}).then(function(data){
                                    def.resolve(data[0]);
                                }, function (err) {
                                    def.reject(err);
                                });

                                return def.promise;
                            }])
                    },
                    views: {
                        "subcontainer@root.stores": {
                            controller: 'orderDetailController',
                            templateUrl: 'stores/orderDetail.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'OrderDetail'
                    }
                });
        }]);

    app.controller('orderDetailController', ['$log','$scope','$state','orderData', '$rootScope','$timeout', 'storesService',
        function ($log, $scope, $state, orderData, $rootScope, $timeout, storesService) {

            var init = function() {
                var positions = [];
                var centerMap = [];

                $scope.orderData = orderData;
                if (orderData) {
                    $scope.orderData = storesService.classTraductor(orderData);

                    if (angular.isDefined(orderData.lat) && angular.isDefined(orderData.lng)) {
                        positions.push({
                            pos:[orderData.lat, orderData.lng],
                            name: 0,
                            state_class: orderData.state_class,
                            id_order: orderData.id_order,
                            hora_entrega: orderData.hora_entrega,
                            hora_entrega_max: orderData.hora_entrega,
                            address: orderData.address,
                            mensajero: orderData.mensajero
                        });
                        centerMap = [orderData.lat, orderData.lng];
                    }

                    if(orderData.id_mensajero && orderData.id_mensajero !== null){
                        storesService.getLocation({id: orderData.id_mensajero}).then(function(data){

                            if(angular.isDefined(data[0])) {
                                positions.push({
                                    pos:[data[0].lat, data[0].lng],
                                    name: 0,
                                    state_class: 'motorbike'});
                            }
                        });
                    }

                    $timeout(function() {
                        $rootScope.$emit('positions.positionsChange', {centerMap: centerMap, positions: positions});
                    });
                }
            };

            init();
        }]);

    app.controller('orderGridController', ['$log','$scope','$state','ordersData', 'NgMap','$rootScope','$timeout', 'storesService', '$stateParams',
        function ($log, $scope, $state, ordersData, NgMap, $rootScope, $timeout, storesService, $stateParams) {

            var init = function () {
                $log.info('App:: Starting storesController');

                $scope.totalItems = 0;
                $scope.filterBy = ordersData.filterName;
                $scope.ordersData = ordersData.data;

                var date = new Date();

                $scope.dateStart = {};
                $scope.dateStart.format = 'dd-MM-yyyy';
                $scope.dateStart.dateOptions = { formatYear: 'yy', startingDay: 1 };
                $scope.dateStart.date = new Date(date.getTime() + 60*60*10000);
                $scope.dateStart.opened = false;

                if (ordersData.data) {
                    $scope.positions = [];
                    $scope.totalItems = $scope.ordersData.length;

                    $scope.currentPage = $stateParams.page ? $stateParams.page : 1;
                    $scope.numPerPage = 6;

                    if(angular.isDefined(ordersData.date)) {
                        $scope.dateStart.date = new Date(Date.parse(ordersData.date));
                    }

                    var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                    $scope.ordersDataSliced = $scope.ordersData.slice(begin, end);

                    angular.forEach($scope.ordersData, function (data, index) {
                        var data2 = storesService.classTraductor(data);
                        $scope.ordersData[index] = data2;

                        if (angular.isDefined(data.lat) && angular.isDefined(data.lng)) {
                            $scope.positions.push({
                                pos:[data.lat, data.lng],
                                name: index,
                                state_class: data2.state_class,
                                id_order: data.id_order,
                                hora_entrega: data.hora_entrega,
                                hora_entrega_max: data.hora_entrega,
                                address: data.address,
                                mensajero: data.mensajero
                            });
                        }
                    });

                    $timeout(function() {
                        $rootScope.$emit('positions.positionsChange', {positions: $scope.positions});
                    });
                }

            };

            $scope.openDatepicker = function(date) {
                $scope[date].opened = true;
            };

            $scope.mostrar = function() {
                var start =  $scope.dateStart.date.toJSON().substr(0,10);
                $state.go('root.stores.ordergrid', {option: $scope.option, date: start});
            };

            $scope.pageChanged = function () {
                var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                $scope.ordersDataSliced = $scope.ordersData.slice(begin, end);

                $state.go('root.stores.ordergrid',{page:$scope.currentPage},{notify:false, reload:false, location:'replace', inherit:true});
            };

            $scope.openOrder = function (id_order) {
                $state.go('root.stores.orderdetail',{id_order: id_order});
            };

            init();

        }]);


}(angular.module("weatf.stores", [
    'ui.router',
    'ngAnimate',
    'storesService',
    'authService'
])));