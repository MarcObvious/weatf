/* 
 * segment service
 */
angular.module('segmentService', [])
        .factory('segmentService', ['$resource', '$q', '$log',
            function ($resource, $q, $log) {
                return {
                    api: function (extra_route) {
                        if (!extra_route) {
                            extra_route = '';
                        }
                        return $resource(API_URL + '/segments/' + extra_route, {}, {
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
                    getAllsegments: function () {
                        var def = $q.defer();
                        this.api().get({}, {}, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    getSegment: function(id){
                        var def = $q.defer();
                        this.api(id).get({}, {}, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    duplicateSegment: function(id){
                        var def = $q.defer();
                        this.api(id + '/duplicate').get({}, {}, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    submitSegment: function (name,description,configuration) {
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
                    saveSegment: function (id,name,description,configuration) {
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
                    deleteSegment: function(id){
                        var def = $q.defer();
                        this.api(id).delete({}, {}, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    }
                };
            }]);



