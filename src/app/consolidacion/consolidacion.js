(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.consolidacion', {
                    url: '/consolidacion',
                    parent: 'root',
                    views: {
                        "container@": {
                            controller: 'consolidacionController',
                            templateUrl: 'consolidacion/consolidacion.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'consolidacion'
                    }
                });
        }]);

    app.controller('consolidacionController', ['$log', '$q', '$scope', '$state', 'consolidacionService','ngTableParams','ngTableEventsChannel','$filter',
        function ($log, $q, $scope, $state, consolidacionService, NGTableParams, ngTableEventsChannel, $filter) {

            var init = function () {
                $log.info('App:: Starting consolidacionController');

                $scope.filterName = 'Consolidación';
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

                $scope.vm = {};

                var start =  $scope.dateStart.date.toJSON().substr(0,10);
                var end =  $scope.dateEnd.date.toJSON().substr(0,10);
                $scope.localsValues = [];
                $scope.exportData = [];
                getConsolidacion(start, end);

                ngTableEventsChannel.onAfterReloadData(function(a,b,c){
                    var filters = a.filter();
                    var rawData = a.settings().data;
                    $scope.exportData = $filter('filter')(rawData,filters);
                }, $scope);
            };

            var getConsolidacion = function (start, end) {
                $scope.localsValues = [];

                consolidacionService.getConsolidacion({cons_type:10,dateStart:start, dateEnd:end}).then(function(cons){
                    angular.forEach(cons,function (franquicia, franquicia_name) {
                        $scope.localsValues.push({name:franquicia_name, total:franquicia.total_fr, franquicia: 1});
                        angular.forEach(franquicia.locals,function (total_local, local) {
                            $scope.localsValues.push({name:local, total: total_local, franquicia: 0});
                        });

                    });
                    $scope.vm.tableParams = new NGTableParams({count:50}, { data: $scope.localsValues,counts:[100,200,500]});
                }, function (err) {
                });
                $scope.name_csv = 'Consolidacion_'+ start + '_' + end;
                $scope.headers_csv = ['Local','Total', 'Franquicia'];
            };

            $scope.mostrar = function() {
                $scope.exportData = [];
                if ($scope.dateStart.date && $scope.dateEnd.date) {
                    var start =  $scope.dateStart.date.toJSON().substr(0,10);
                    var end =  $scope.dateEnd.date.toJSON().substr(0,10);
                    getConsolidacion(start, end);
                }
                else {
                    getConsolidacion(null, null);
                }

            };

            $scope.openDatepicker = function(date) {
                $scope[date].opened = true;
            };

            init();

        }]);

}(angular.module("weatf.consolidacion", [
    'ui.router',
    'ngAnimate',
    'consolidacionService'
])));