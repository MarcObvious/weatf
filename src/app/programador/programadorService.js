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
                    getLocalprogramador: function (params) {
                        var def = $q.defer();
                        this.api('getlocalprogramador').save({}, params, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    getAllprogramador: function (params) {
                        var def = $q.defer();
                        this.api('getallprogramador').save({}, params, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    getprogramador: function(id){
                        var def = $q.defer();
                        this.api(id).get({}, {}, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    duplicateprogramador: function(id){
                        var def = $q.defer();
                        this.api(id + '/duplicate').get({}, {}, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    submitprogramador: function (name,description,configuration) {
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
                    getOrder: function (params) {
                        var def = $q.defer();
                        this.api('getorder/').save({}, params, function(data){
                            def.resolve(data.data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    saveOrder: function (params) {
                        var def = $q.defer();
                        this.api('updateorderdetail/').save({}, params, function(data){
                            def.resolve(data.data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    }
                };
            }]);



