angular.module('discountsService', [])
    .factory('discountsService', ['$resource', '$q', '$log',
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
                getAllDiscounts: function(){
                    var def = $q.defer();
                    this.api('getdiscounts/').save({}, {}, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                },
                getDiscount: function (params) {
                    var def = $q.defer();
                    this.api('getdiscount/').save({}, params, function(data){
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                },
                createDiscount: function (params) {
                    var def = $q.defer();
                    this.api('creatediscount/').save({}, params, function(data){
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                saveDiscount: function (params) {
                    var def = $q.defer();
                    console.log(params);
                    this.api('updatediscount/').update({}, params, function(data){
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                deleteDiscount: function (params) {
                    var def = $q.defer();
                    this.api('deletediscount/').remove( params,{}, function(data){
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                }

            };
        }]);



