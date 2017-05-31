(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.chart', {
                    url: '/chart',
                    parent: 'root',
                    views: {
                        "container@": {
                            controller: 'ChartController',
                            templateUrl: 'charts/chart.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'chart'
                    }
                });
        }]);

    app.controller('ChartController', ['$log', '$q', '$scope', '$state', 'chartService',
        function ($log, $q, $scope, $state, chartService) {

            var init = function () {
                $log.info('App:: Starting chartController');

                $scope.filterName = 'KPIs';
                var date = new Date();

                $scope.dateStart = {};
                $scope.dateStart.dateOptions = { formatYear: 'yy', startingDay: 1 };
                $scope.dateStart.format = 'dd-MM-yyyy';
                $scope.dateStart.opened = false;
                $scope.dateStart.date = new Date(date.getTime() - 24*60*60*1000*14);

                $scope.dateEnd = {};
                $scope.dateEnd.dateOptions = { formatYear: 'yy', startingDay: 1 };
                $scope.dateEnd.format = 'dd-MM-yyyy';
                $scope.dateEnd.opened = false;
                $scope.dateEnd.date = date;

                $scope.stats = {
                    app_downloads: {d:'Descargas APP', v: 0},
                    count_open_push: {d:'Aperturas por push', v: 0},
                    count_unique_buyers: {d:'Han comprado', v: 0},
                    buy_recurrency: {d:'Recurrència de compra', v: 0},
/*
                    r_visita: {d:'Recurrencia de visita', v: 0},
*/
                    user_shares: {d:'Han compartido la APP', v: 0},
                    count_optin_users: {d:'Optin', v: 0},
                    count_search_users: {d:'Han utilizado el buscador', v: 0},
                    count_success_paid: {d:'Han pagado con exito', v: 0}
                };

                $scope.mostrar();
            };

            $scope.mostrar = function () {
                var params = {};
                if ($scope.dateStart.date && $scope.dateEnd.date) {
                    params.startDate =  $scope.dateStart.date.toJSON().substr(0,10);
                    params.endDate=  $scope.dateEnd.date.toJSON().substr(0,10);
                }

                chartService.getKpis(params).then(function(kpis){
                    angular.forEach(kpis,function (value, key) {
                        if (angular.isDefined($scope.stats[key])) {
                            $scope.stats[key].v = value;
                        }
                    });
                }, function (err) {
                });
            };

            $scope.openDatepicker = function(date) {
                $scope[date].opened = true;
            };

            init();

        }]);

}(angular.module("weatf.chart", [
    'ui.router',
    'ngAnimate',
    'chartService'
])));