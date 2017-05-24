/*
 * Api Test Módule
 */
angular.module('chartService', [])
        .factory('chartService', ['$resource', '$q', '$log','$http',
            function ($resource, $q, $log,$http) {
                return {
                    api: function (extra_route) {
                        if (!extra_route) {
                            extra_route = '';
                        }
                        return $resource(API_URL + '/charts/' + extra_route, {}, {
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
                   /* getChart: function (method, params, params_extr) {
                        var def = $q.defer();
                        var extra_route = '';
                        if (params.start && params.end){
                            extra_route = method + '/' + params.start + '/' + params.end;
                        }
                        else if (params.id_campaign) {
                            extra_route = method + '/' + params.id_campaign;
                        }
                        if (params_extr) {
                            extra_route += '/' + params_extr;
                        }
                        this.api(extra_route).get({}, {}, function (data) {
                            def.resolve(data.data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },*/
                    getChart: function (method, params, params_extr) {
                        var def = $q.defer();
                        var j = '';
                        if (params_extr===1) {
                            j = '1.json';
                        }
                        else {
                            j = '2.json';
                        }
                        $http.get('assets/'+j).success(function(data) {
                            def.resolve(data.data);
                        });
                        //var data = JSON.parse('/charts/2.json');
                        //this.api(extra_route).get({}, {}, function (data) {

                       // }, function (err) {
                         //   def.reject(err);
                       // });
                        return def.promise;
                    }
                };
            }]);



