angular.module('simplepushService', [])
    .factory('simplepushService', ['$resource', '$q', '$log',
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
                        update: {
                            timeout: 15000,
                            method: 'PUT'
                        },
                        get: {
                            timeout: 15000,
                            method: 'GET'
                        },
                        remove: {
                            timeout: 15000,
                            method: 'DELETE'
                        }
                    });
                },
                getTokenFromEmail: function(params){
                    var def = $q.defer();
                    def.resolve({Devicetoken:[{token:'sometoken'}]});
                    /*this.api('gettokenbyemail/').save({}, params, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });*/

                    return def.promise;
                }

            };
        }]);



