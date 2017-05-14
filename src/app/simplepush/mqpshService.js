/**
 * Created by ramon on 30/09/15.
 *
 */

angular.module('mqpshService', [])
    .factory('mqpshService', ['$resource', '$q', '$log',
        function ($resource, $q, $log) {
            return {
                api: function (extra_route) {
                    if (!extra_route) {
                        extra_route = '';
                    }
                    return $resource(API_URL + '/mqpsh/' + extra_route, {}, {
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
                        post: {
                            timeout: 15000,
                            method: 'POST'
                        }
                    });
                },
                getTokensFromEmail: function(email){
                    var def = $q.defer();
                    this.api(email).get({}, {}, function (data) {
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                testFunction: function () {
                    alert('testFunction');
                }
            };
        }]);



