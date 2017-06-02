/* 
 * programador Service
 */
angular.module('programadorService', [])
        .factory('programadorService', ['$resource', '$q', '$log',
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
                            },
                            put: {
                                timeout: 15000,
                                method: 'PUT'
                            },
                            remove: {
                                timeout: 15000,
                                method: 'DELETE'
                            }
                        });
                    },
                    getpushCampaigns: function (params) {
                        var def = $q.defer();
                        this.api('getpushcampaigns').save({}, params, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    cancelCampaign: function(params){
                        var def = $q.defer();
                        this.api('cancelpushcampaign').save({}, params, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    }
                };
            }]);



