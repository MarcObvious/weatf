angular.module('segmentedpushService', [])
    .factory('segmentedpushService', ['$resource', '$q', '$log',
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
                sendsegmentedpush: function (params) {
                    var def = $q.defer();
                    this.api('sendpush/').save({}, params, function(data){
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                }
            };
        }]);



