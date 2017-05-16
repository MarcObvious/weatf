/* 
 * Global Services Test Módule
 */
angular.module('globalService', [])
    .factory('globalService', ['$resource', '$q', '$log', 'localStorageService',
        function ($resource, $q, $log, localStorageService) {
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
                getAuthToken: function() {
                    //sessionStorage.setItem(CUSTOM_HEADER, '');
                    var def = $q.defer();
                    var _this = this;
                    this.getStorage(CUSTOM_HEADER).then(function(authToken){
                        if (!authToken || authToken === 'no_token'){
                            _this.api('init').save({}, {}, function (data) {
                                var authToken = data.data.userinfo.authtoken;
                                if(authToken) {
                                    _this.setStorage(CUSTOM_HEADER, authToken);
                                    sessionStorage.setItem(CUSTOM_HEADER, authToken);
                                }
                                def.resolve(authToken);
                            });
                        }
                        else {
                            sessionStorage.setItem(CUSTOM_HEADER, authToken);
                            def.resolve(authToken);
                        }
                    });
                    return def.promise;
                },
                getAction: function () {
                    //Service action with promise resolve (then)
                    var def = $q.defer();
                    this.api().get({}, {}, function (data) {
                        $log.warn('Api::data:: ');
                        $log.warn(data);
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },

                getUrlParam: function (parameterName) {
                    parameterName += "=";
                    var parameterValue = (location.hash.indexOf(parameterName)) ? location.hash.substring(location.hash.indexOf(parameterName) + parameterName.length) : null;
                    if (parameterValue !== null && parameterValue.indexOf('&') >= 0) {
                        parameterValue = parameterValue.substring(0, parameterValue.indexOf('&'));
                    }
                    return parameterValue;
                },
                setStorage: function (key, value) {
                    var def = $q.defer();
                    if (key && value) {
                        localStorageService.set(key, value);
                    }
                    def.resolve();
                    return def.promise;
                },
                getStorage: function (key) {
                    var def = $q.defer();
                    if (key) {
                        def.resolve(localStorageService.get(key));
                    } else {
                        $log.debug('No key to read...');
                        def.resolve(false);
                    }
                    return def.promise;
                },
                removeStorage: function (key) {
                    var def = $q.defer();
                    if (key) {
                        localStorageService.cookie.remove(key);
                        localStorageService.remove(key);
                    } else {
                        $log.debug('No key to delete...');
                    }
                    def.resolve();
                    return def.promise;
                },
                getSideBarLocals: function () {
                    var def = $q.defer();
                    var locals = [];
                    var locals_count = 0;

                    this.api('getlocals/').save({}, {}, function (data) {
                        var localsData = data.data;
                        if(localsData && localsData !== 'no data yet'){
                            angular.forEach(localsData, function (localData, index) {
                                locals.push({n: localData.name, c: 1, id: localData.id, show: true});
                                ++locals_count;
                            });
                        }
                        locals.push({n: 'Nuevo local', c: locals_count, id: 0, show: true});
                    });

                    def.resolve(locals);
                    return def.promise;
                },
                getSideBarContent: function () {
                    var def = $q.defer();
                    var filters = {
                        organizer: {users:[],orders:[]}
                    };
                    var users_count = 0, orders_count = 0;

                    this.api('getlocalusers/').save({}, {}, function (data) {
                        var usersData = data.data;
                        if(usersData && usersData !== 'no data yet'){
                            angular.forEach(usersData, function (userData, index) {
                                filters.organizer.users.push({n: userData.name, c: 1, id: userData.id, show: true});
                                ++users_count;
                            });
                        }
                    });
                    filters.organizer.users.push({n: 'Todos los usuarios', c: users_count, id: 0, show:true});

                    this.api('getlocalorders/').save({}, {}, function (data) {
                        var ordersData = data.data;
                        if(ordersData && ordersData !== 'no data yet'){
                            angular.forEach(ordersData, function (orderData, index) {
                                filters.organizer.orders.push({n: orderData.name, c: 1, id: orderData.id, show: true});
                                ++users_count;
                            });
                        }
                    });
                    filters.organizer.orders.push({n: 'Todos los pedidos', c: orders_count, id: 0, show:true});

                    def.resolve(filters);
                    return def.promise;
                }


            };
        }]);



