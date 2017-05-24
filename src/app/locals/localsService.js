angular.module('localsService', [])
    .factory('localsService', ['$resource', '$q', '$log',
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

                getLocals: function (params) {
                    var def = $q.defer();
                    this.api('getalllocals/').save({}, {}, function(data){
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                },
                createLocal: function (params) {
                    var def = $q.defer();
                    this.api('createlocal/').save({}, params, function(data){
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                saveLocal: function (params) {
                    var def = $q.defer();
                    this.api('updatelocal/').update({}, params, function(data){
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                },
                deleteLocal: function (params) {
                    var def = $q.defer();
                    this.api('deletelocal/').remove(params, {}, function(data){
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                },
                getLocal: function (params) {
                    var def = $q.defer();
                    this.api('getlocal/').save(params, {}, function(data){
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                }
            };
        }]);



