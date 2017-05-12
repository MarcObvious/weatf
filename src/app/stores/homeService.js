angular.module('storesService', [])
    .factory('storesService', ['$resource', '$q', '$log',
        function ($resource, $q, $log) {
            return {
                api: function (extra_route) {
                    if (!extra_route) {
                        extra_route = '';
                    }
                    return $resource(API_URL + '/' + extra_route, {}, {
                        query: {
                            timeout: 15000
                        },
                        save: {
                            timeout: 15000,
                            method: 'POST'
                        },
                        get: {
                            timeout: 15000,
                            method: 'GET'
                        }
                    });
                },

                getLocation: function (params) {
                    var def = $q.defer();
                    this.api('getlocation/'+params.id).get({}, {}, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                },
                getAllOrders: function (params) {
                    var def = $q.defer();
                    this.api('ordersfront').get(params, {}, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                },
                getOrdersByDelivery: function (params) {
                    var def = $q.defer();
                    this.api('orders').get(params, {}, function (data) {
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },

                getOrderStates: function (params) {
                    var def = $q.defer();
                    this.api('order_states').get(params, {}, function (data) {
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },


                getOrdersByDeliveryMan: function (params) {
                    var def = $q.defer();
                    this.api('orders_by_deliveryman/'+ params.id).get({date:params.date}, {}, function (data) {
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                getOrdersByStatus: function (params) {
                    var def = $q.defer();
                    this.api('ordersfront/'+ params.id).get({date:params.date}, {}, function (data) {
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                getOrder: function (params) {
                    var def = $q.defer();
                    this.api('order_detail/'+params.id).get({}, {}, function (data) {
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                convertOrdersByDeliveryToOrders: function (obds) {
                    var orders = [];
                    angular.forEach(obds, function(obd) {
                        if (obd.orders.length !== 0){
                            angular.forEach(obd.orders, function(order) {
                                orders.push(order);
                            });
                        }
                    });
                    return orders;
                },
                classTraductor: function (orderData) {
                    switch (parseInt(orderData.id_delivery_state)) {
                        case 1:
                            orderData.state_class = 'poi_encurso';
                            orderData.state_name = 'En curso';
                            break;
                        case 0:
                        case 2:
                            orderData.state_class = 'poi_pendiente';
                            orderData.state_name = 'Pendiente';
                            break;
                        case 3:
                            orderData.state_class = 'poi_encurso';
                            orderData.state_name = 'Entregado';
                            break;
                        case 4:
                            orderData.state_class = 'poi_incidencia';
                            orderData.state_name = 'Incidéncia';
                            break;
                        default:
                            orderData.state_class = 'poi_incidencia';
                            orderData.state_name = 'Incidéncia';
                            break;
                    }

                    return orderData;
                },
                estados: function (id) {
                    var estados = {1:'"En curso"', 0:'"Todos"', 2:'"Pendiente"', 3:'"Entregado"', 4:'"Incidéncia"'};
                    if (angular.isDefined(estados[id])) {
                        return estados[id];
                    }
                    return 'Todos';
                }

            };
        }]);



