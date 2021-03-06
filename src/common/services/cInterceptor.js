/*
 * Intercept all requests /responses
 * Ej. use to auth-tokens in headers
 */

angular.module('cInterceptor', [])
    .factory('cInterceptor', ['$q', '$rootScope','localStorageService',
        function ($q, $rootScope, localStorageService) {
        return {
            'request': function (config) {
                config.headers = config.headers || {};

                //Get saved data of your custom header from sessionStorage
                $rootScope.customHeader = localStorageService.get(CUSTOM_HEADER);

                //$rootScope.customHeader = API_KEY;
                //console.log('interceptor');
                config.headers = {
                    'Content-type': 'application/json;charset=UTF-8',
                    'lang': 'es',
                    'country': 'es'
                };

                //Add custom header/data to request
                config.headers[CUSTOM_HEADER] = $rootScope.customHeader;//'ee9dc9e82c9c901e746b7a8368236719';//
                //console.log(config.headers);

                return config;
            },
            'response': function (response) {

                if(response.data && response.data.message) {
                    $rootScope.alerts.push({ type: 'success', msg: response.data.message, time:'3000' });
                }
                //Save data custom header to send in next request
                /*if (response.headers(CUSTOM_HEADER) !== null) {
                    $rootScope.customHeader = response.headers(CUSTOM_HEADER);
                    sessionStorage.setItem(CUSTOM_HEADER, response.headers(CUSTOM_HEADER));
                } else {
                    $rootScope.customHeader = sessionStorage.getItem(CUSTOM_HEADER);
                }
                response.headers('Allow', '*');*/
                return response;
            },
            'responseError': function (rejection) {
                var getUrlParam= function(parameterName) {
                    parameterName += "=";
                    var parameterValue = (location.hash.indexOf(parameterName)) ? location.hash.substring(location.hash.indexOf(parameterName) + parameterName.length) : null;
                    if (parameterValue !== null && parameterValue.indexOf('&') >= 0) {
                        parameterValue = parameterValue.substring(0, parameterValue.indexOf('&'));
                    }
                    return parameterValue;
                };

                if(rejection.data && rejection.data.message) {
                    $rootScope.alerts.push({ type: 'danger', msg: rejection.data.message, time:'3000' });
                }
                if(rejection.data && rejection.data.code === 401) {
                    $rootScope.customHeader = '';
                    localStorageService.remove(CUSTOM_HEADER);
                    localStorageService.remove('user_data');
                }

                //var code = getUrlParam('code');
                return $q.reject(rejection);
            }
        };
    }
    ]);

