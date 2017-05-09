(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.history', {
                    url: '/history/?:{page}:{option}:{start}:{end}',
                    parent: 'root',
                    resolve: {
                        autentica: (['authService',  function (authService) {
                            return authService.autentica();
                        }]),
                        ordersData: (['historyService', '$q', '$log','$stateParams',
                            function (historyService, $q, $log, $stateParams) {
                                var def = $q.defer();
                                var option = $stateParams.option;
                                var params = {};
                                if ($stateParams.start && $stateParams.end) {
                                    params.start = $stateParams.start;
                                    params.end = $stateParams.end;
                                }
                                else {
                                    var end = new Date();
                                    var start = new Date(end.getTime() - 24*60*60*10000*7);
                                    params.start = start.toJSON().replace("T"," ").replace("Z","");
                                    params.end = end.toJSON().replace("T"," ").replace("Z","");
                                }
                                $log.debug('Home::::ResolveHistory::'+option+'::'+params.start+'::'+params.end);

                                if (option === 'entregas') {
                                    historyService.getAllEntregas(params).then(function(data) {
                                        def.resolve({data: data, option: option, dates: params, });
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else if (option === 'incidencias') {
                                    historyService.getAllIncidencias(params).then(function(data) {
                                        def.resolve({data: data, option: option, dates: params, });
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else {
                                    def.reject(false);
                                }
                                return def.promise;
                            }]),
                        optionData: ([ '$q', '$log','$stateParams',
                            function ( $q, $log, $stateParams) {
                                if ($stateParams.option === 'entregas') {
                                    return {option: $stateParams.option, name:'Histórico de entregas'};
                                }
                                else {
                                    return {option: $stateParams.option, name:'Histórico de incidéncias'};
                                }
                            }])
                    },
                    views: {
                        "container@": {
                            controller: 'historyController',
                            templateUrl: 'history/history.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'history'
                    }
                });

        }]);

    app.controller('historyController', ['$log','$scope','$state', 'ordersData', 'optionData', '$stateParams',
        function ($log, $scope, $state, ordersData, optionData, $stateParams) {

            var init = function () {
                $log.info('App:: Starting HistoryController');
                $scope.totalItems = 0;

                var date = new Date();

                $scope.dateStart = {};
                $scope.dateStart.format = 'dd-MM-yyyy';
                $scope.dateStart.dateOptions = { formatYear: 'yy', startingDay: 1 };
                $scope.dateStart.date = new Date(date.getTime() - 24*60*60*10000*7);
                $scope.dateStart.opened = false;

                $scope.dateEnd = {};
                $scope.dateEnd.format = 'dd-MM-yyyy';
                $scope.dateEnd.dateOptions = { formatYear: 'yy', startingDay: 1 };
                $scope.dateEnd.date = date;
                $scope.dateEnd.opened = false;

                $scope.option = optionData.option;
                $scope.name = optionData.name;

                if (ordersData.data) {
                    if(angular.isDefined(ordersData.dates.start)) {
                        $scope.dateStart.date = new Date(Date.parse(ordersData.dates.start));
                    }
                    if(angular.isDefined(ordersData.dates.end)) {
                        $scope.dateEnd.date = new Date(Date.parse(ordersData.dates.end));
                    }


                    $scope.ordersData = ordersData.data;
                    $scope.numPerPage = 15;
                    $scope.currentPage = $stateParams.page ? $stateParams.page : 1;

                    var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                    $scope.ordersDataSliced = $scope.ordersData.slice(begin, end);

                    $scope.totalItems = $scope.ordersData.length;
                }

            };

            $scope.openDatepicker = function(date) {
                $scope[date].opened = true;
            };

            $scope.pageChanged = function () {
                var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                $scope.ordersDataSliced = $scope.ordersData.slice(begin, end);

                $state.go('root.history',{page:$scope.currentPage},{notify:false, reload:false, location:'replace', inherit:true});
            };

            $scope.mostrar = function() {
                var start =  $scope.dateStart.date.toJSON().substr(0,10);
                var end =  $scope.dateEnd.date.toJSON().substr(0,10);
                $state.go('root.history', {option: $scope.option, start: start, end: end});
            };

            $scope.openOrder = function (id_order) {
                $state.go('root.home.orderdetail',{id_order: id_order});
            };

            $scope.goBack = function(){
                $state.go('root.home.ordergrid');
            };

            init();
        }]);


}(angular.module("weatf.history", [
    'ui.router',
    'ngAnimate',
    'historyService'
])));