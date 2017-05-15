angular.module('usersService', [])
    .factory('usersService', ['$resource', '$q', '$log',
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

                getusers: function (params) {
                    var def = $q.defer();
                    this.api('getusers/').save({}, {}, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                },
                getuser: function (params) {
                    var def = $q.defer();
                    this.api('getuser/').save(params, {}, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                }


            };
        }]);



