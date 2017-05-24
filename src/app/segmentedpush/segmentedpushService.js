/**
 * Created by ramon on 30/09/15.
 *
 */

angular.module('pushlauncherService', [])
    .factory('pushlauncherService', ['$resource', '$q', '$log',
        function ($resource, $q, $log) {
            return {
                api: function (extra_route) {
                    if (!extra_route) {
                        extra_route = '';
                    }
                    return $resource(API_URL + '/pushlauncher/' + extra_route, {}, {
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
                sendsegmentedpush: function(pushMsg){
                    var def = $q.defer();
                    pushMsg.token = btoa(pushMsg.token);
                    this.api().save({}, pushMsg, function (data) {
                        def.resolve(data.data);
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



