angular.module('routesService', [])
    .factory('routesService', ['$resource', '$q',
        function ($resource, $q) {
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
                //getdeliveryroutes/2017-04-28
                getRoutes: function (params) {
                    var def = $q.defer();
                    this.api('getdeliveryroutes/'+params.start+'/'+params.city).get({}, {}, function(routesData){

                        var result = [];
                        angular.forEach(routesData.data.good_routes, function (good_routes, index) {
                            angular.forEach(good_routes.deliveries, function (deliveries, index) {
                                var d = {
                                    route_id : good_routes.route_id,
                                    order_id : deliveries.order_id,
                                    address : deliveries.info[0].address,
                                    city : deliveries.info[0].city,
                                    zipcode : deliveries.info[0].zipcode.toString(),
                                    hora_entrega : deliveries.info[0].hora_entrega
                                };
                                result.push(d);
                            });
                        });

                        def.resolve(result);

                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                }

            };
        }]);



