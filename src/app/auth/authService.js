angular.module('authService', [])
    .factory('authService', ['$resource', '$q', '$log', 'globalService','$state','localStorageService',
        function ($resource, $q, $log, globalService, $state, localStorageService) {
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
                        }
                    });
                },
                getUserInfo: function () {
                    var def = $q.defer();
                    this.api('').get({}, {}, function (data) {
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                autentica: function () {
                    var authToken = localStorageService.get(CUSTOM_HEADER);
                    var user_data = localStorageService.get('user_data');
                    if(authToken && user_data) {
                        return true;
                    }
                    else {
                        if(window.location.href.indexOf('/auth') === -1) {
                            window.location = '/auth';
                        }
                        return false;
                    }
                },
                submitLogin: function (username,password) {
                    var def = $q.defer();
                    this.api('login').save({},{email:username, password:password}, function (data){
                        if (data.message === 'Usuario identificado'){
                            localStorageService.set('user_data', true);
                            def.resolve(data.data);
                        }
                        else {
                            def.reject();
                        }
                    });
                    return def.promise;
                },

                submitLogout: function () {
                    var def = $q.defer();
                    this.api('logout').save({},{}, function (data){
                        localStorageService.remove(CUSTOM_HEADER);
                        localStorageService.remove('user_data');
                        window.location = '/auth';
                        def.resolve(true);
                    });
                    return def.promise;

                }
            };
        }]);



