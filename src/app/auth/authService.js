angular.module('authService', [])
    .factory('authService', ['$resource', '$q', '$log', 'globalService','$state',
        function ($resource, $q, $log, globalService, $state) {
            var _user_data = {};
            var _logged = false;
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
                    var def = $q.defer();
                    globalService.getStorage(CUSTOM_HEADER).then(function(authToken) {
                        if(authToken!== 'no_token' && _logged) {
                            def.resolve(true);
                        }
                        else {
                            $state.go('root.auth');
                            def.reject();
                        }
                    });
                    return def.promise;
                },
                submitLogin: function (username,password) {
                    var def = $q.defer();
                    // globalService.removeStorage(CUSTOM_HEADER);
                    // globalService.removeStorage('user_data');

                    this.api('login').save({},{email:username, password:password}, function (data){
                        if (data.message === 'Usuario identificado'){
                            console.log(data);
                            _user_data = data;
                            _logged = true;
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
                   //
                    globalService.removeStorage('user_data');

                    this.api('logout').save({},{}, function (data){
                        globalService.removeStorage(CUSTOM_HEADER);
                        def.resolve(true);
                    });

                    return def.promise;

                }
            };
        }]);



