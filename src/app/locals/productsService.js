angular.module('productsService', [])
    .factory('productsService', ['$resource', '$q', '$log',
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
                createProduct: function (params) {
                    var def = $q.defer();
                    this.api('createproducts/').save({}, params, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                saveProduct: function (params) {
                    var def = $q.defer();
                    this.api('updateproduct/').update({}, params, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                deleteProduct: function (params) {
                    var def = $q.defer();
                    this.api('deleteproduct/').remove({}, params, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                getProduct: function (params) {
                    var def = $q.defer();
                    this.api('getproduct/').save(params, {}, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                }


            };
        }]);



