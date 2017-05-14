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
                getSideBarContent: function () {
                    var def = $q.defer();
                    var filters = {
                        organizer: {locals:[],users:[],orders:[]}
                    };
                    var locals_count = 0, users_count = 0, orders_count = 0;

                    console.log(filters);



                    this.api('getlocals/').save({}, {}, function (data) {
                        var localsData = data.data;
                        if(localsData && localsData !== 'no data yet'){
                            angular.forEach(localsData, function (localData, index) {
                                filters.organizer.locals.push({n: localData.name, c: 1, id: localData.id, show: true});
                                ++locals_count;
                            });
                        }
                        filters.organizer.locals.push({n: 'All locals', c: locals_count, id: 0, show: true});
                    });


                    this.api('getusers/').save({}, {}, function (data) {
                        var usersData = data.data;
                        console.log(usersData);
                        if(usersData && usersData !== 'no data yet'){
                            angular.forEach(usersData, function (userData, index) {
                                filters.organizer.users.push({n: userData.name, c: 1, id: userData.id, show: true});
                                ++users_count;
                            });
                        }
                        filters.organizer.users.push({n: 'All users', c: users_count, id: 0, show:true});
                    });


                    filters.organizer.orders.push({n: 'All orders', c: orders_count, id: 0, show:true});

                    /*
                     this.api('getlocals').get({}, {}, function (data) {

                     if(data.data) {
                     cpedidos = data.results;
                     angular.forEach(data.data, function(order) {
                     var flag = 0;
                     angular.forEach(estados.filtro_repartidor, function (repartidor, index) {
                     if (repartidor.id === order.id_mensajero) {
                     ++estados.filtro_repartidor[index].c;
                     flag = 1;
                     }
                     });

                     if (flag === 0){

                     estados.filtro_repartidor.push({n: order.mensajero, c: 1, id: order.id_mensajero, show: parseInt(order.id_mensajero) !== 0});


                     }
                     switch (parseInt(order.id_delivery_state)) {
                     case 1:
                     ++estados.filtro_estado[0].c;
                     break;
                     case 0:
                     case 2:
                     ++estados.filtro_estado[1].c;
                     break;
                     case 3:
                     ++estados.filtro_estado[2].c;
                     break;
                     case 4:
                     ++estados.filtro_estado[3].c;
                     break;
                     default:
                     ++estados.filtro_estado[1].c;
                     break;
                     }

                     });
                     }
                     estados.filtro_estado.push({n: 'Todos los pedidos', c: cpedidos, id:0, show:true});
                     estados.filtro_repartidor.push({n: 'Todos los repartidores', c: cpedidos, id: 0, show:true});

                     def.resolve(estados);
                     }, function (err) {
                     def.reject(err);
                     });*/
                    def.resolve(filters);
                    return def.promise;
                }


            };
        }]);



