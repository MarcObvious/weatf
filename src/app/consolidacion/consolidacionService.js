/*
 * Api Test Módule
 */
angular.module('consolidacionService', [])
        .factory('consolidacionService', ['$resource', '$q', '$log','$http',
            function ($resource, $q, $log,$http) {
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
                            },
                            delete: {
                                timeout: 15000,
                                method: 'DELETE'
                            }
                        });
                    },
                    getConsolidacion: function (params) {
                        var def = $q.defer();
                        this.api('getconsolidations/').save({}, params, function(data){
                            def.resolve(data.data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    }

                };
            }]);



