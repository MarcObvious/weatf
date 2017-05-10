angular.module('authService', [])
    .factory('authService', ['$resource', '$q', '$log', 'globalService','$state',
        function ($resource, $q, $log, globalService, $state) {
            return {
                api: function (extra_route) {
                    if (!extra_route) {
                        extra_route = '';
                    }
                    return $resource(API_URL + '/login' + extra_route, {}, {
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
                    globalService.getStorage(CUSTOM_HEADER).then(function (data) {
                        if (data == null || data == "no-token") {
                            globalService.setStorage(CUSTOM_HEADER, "no-token");
                            $state.go('root.auth');
                            def.resolve(false);

                        }
                        else {
                            def.resolve(true);
                        }
                    },function(err){
                        def.resolve(false);
                    });
                    return def.promise;
                },
                submitLogin: function (username,password) {
                    var def = $q.defer();
                   // globalService.removeStorage(CUSTOM_HEADER);
                    globalService.removeStorage('user_data');

                    this.api().save({},{email:username, password:password}, function (data){
                        console.log(data);
                        def.resolve(true);
                    });

                    /*if (username === 'Admin' && password === '1234') {
                        // globalService.setStorage('user_data', {id: data.data.id, username: data.data.username, email: data.data.email, level: data.data.level});
                        globalService.setStorage(CUSTOM_HEADER, API_KEY);

                        def.resolve(true);
                    }*/
                    /*else {
                        def.reject(false);
                    }*/
                    return def.promise;
                },
                submitLogout: function () {
                    globalService.removeStorage(CUSTOM_HEADER);
                    globalService.removeStorage('user_data');
                    return true;
                }
            };
        }]);



