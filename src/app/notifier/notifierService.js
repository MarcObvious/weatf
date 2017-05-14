angular.module('notifierService', [])
    .factory('notifierService', ['$resource', '$q',
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
                getAllEntregas: function (params) {
                    var def = $q.defer();
                    this.api('ordersfront/').get(params, {}, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                },

                getAllIncidencias: function (params) {
                    var def = $q.defer();
                    this.api('incidencesbydate/'+params.start+'/'+params.end).get({}, {}, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                }

            };
        }]);



