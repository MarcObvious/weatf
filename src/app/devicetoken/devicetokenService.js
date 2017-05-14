/* 
 * Api Test Módule
 */
angular.module('devicetokenService', [])
        .factory('devicetokenService', ['$resource', '$q', '$log',
            function ($resource, $q, $log) {
                return {
                    api: function (extra_route) {
                        if (!extra_route) {
                            extra_route = '';
                        }
                        return $resource(API_URL + '/devicetokens/' + extra_route, {}, {
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
                            delete: {
                                timeout: 15000,
                                method: 'DELETE'
                            }
                        });
                    },
                    getAllTokens: function () {
                        var def = $q.defer();
                        this.api().get({}, {}, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
/*                    getTokenFromEmail: function (email) {
                        var def = $q.defer();
                        this.api(email).get({}, {}, function (data) {

                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },*/
                    getTokenFromIdCustomer: function (token) {
                        var def = $q.defer();
                        token = btoa(token);
                        this.api('0/'+token).get({}, {}, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    getTokenFromDeviceToken: function (token) {
                        var def = $q.defer();
                        token = btoa(token);
                        this.api('0/0/'+token).get({}, {}, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    sendSimplePush: function(token){
                        var def = $q.defer();
                        token = btoa(token);
                        postData = {
                            devicetoken: token
                        };
                        this.api('pushlauncher').post({}, postData, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    deleteToken: function(id){
                    var def = $q.defer();
                    this.api(id).delete({}, {}, function (data) {
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



