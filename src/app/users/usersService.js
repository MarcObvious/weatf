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
                getlocalUser: function (params) {
                    var def = $q.defer();
                    this.api('getlocalusers/').save({}, params, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                },
                createUser: function (params) {
                    var def = $q.defer();
                    this.api('createuser/').save({}, params, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                saveUser: function (params) {
                    var def = $q.defer();
                    this.api('updateuser/').update({}, params, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                deleteUser: function (params) {
                    var def = $q.defer();
                    this.api('deleteuser/').remove({}, params, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                },




            };
        }]);



