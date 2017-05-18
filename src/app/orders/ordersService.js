/* 
 * orders Service
 */
angular.module('ordersService', [])
        .factory('ordersService', ['$resource', '$q', '$log',
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
                            delete: {
                                timeout: 15000,
                                method: 'DELETE'
                            }
                        });
                    },
                    getLocalOrders: function (params) {
                        var def = $q.defer();
                        this.api('getlocalorders').save({}, params, function (data) {
                            def.resolve(data.data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    getorders: function(id){
                        var def = $q.defer();
                        this.api(id).get({}, {}, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    duplicateorders: function(id){
                        var def = $q.defer();
                        this.api(id + '/duplicate').get({}, {}, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    submitorders: function (name,description,configuration) {
                        var def = $q.defer();
                        var postData = {
                            name:name,
                            description:description,
                            configuration:configuration
                        };
                        this.api().save({}, postData, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    saveorders: function (id,name,description,configuration) {
                        var def = $q.defer();
                        var postData = {
                            name:name,
                            description:description,
                            configuration:configuration
                        };
                        this.api(id).put({}, postData, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    deleteorders: function(id){
                        var def = $q.defer();
                        this.api(id).delete({}, {}, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    cancelOrder: function (params) {
                        var def = $q.defer();
                        this.api('cancel_order/').save({}, params, function(data){
                            def.resolve(data.data);
                        }, function (err) {
                            def.reject(err);
                        });

                        return def.promise;
                    }
                };
            }]);



