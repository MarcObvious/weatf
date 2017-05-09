(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.routes', {
                    url: '/routes/?:{page}:{option}:{start}:{city}',
                    parent: 'root',
                    resolve: {
                        autentica: (['authService',  function (authService) {
                            return authService.autentica();
                        }])
                    },
                    views: {
                        "container@": {
                            controller: 'routesController',
                            templateUrl: 'routes/routes.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'routes'
                    }
                });

        }]);

    app.controller('routesController', ['$log','$scope','$state', '$stateParams','ngTableParams','routesService',
        function ($log, $scope, $state, $stateParams, NGTableParams, routesService) {

            var init = function () {
                $log.info('App:: Starting HomeController');
                $scope.totalItems = 0;

                var date = new Date();
                var start = date.toJSON().substr(0,10);
                if ($stateParams.start) {
                    start = $stateParams.start;
                }

                $scope.dateStart = {};
                $scope.dateStart.format = 'dd-MM-yyyy';
                $scope.dateStart.dateOptions = { formatYear: 'yy', startingDay: 1 };
                $scope.dateStart.opened = false;
                $scope.dateStart.date = new Date(Date.parse(start));

                $scope.city = $stateParams.city ? $stateParams.city : 'bcn';

                $scope.vm = {};
                $scope.vm.tableParams = new NGTableParams({count:25, sorting:{route_id:'asc'}}, {data: [],counts:[]});

                $scope.name = 'Organizador de rutas';
                $scope.name_csv = 'Rutas_' + $scope.city +'_'+ $scope.dateStart.date.toJSON().substr(0,10);
                $scope.routesData = 0;
                $scope.routesDataA = [];

                routesService.getRoutes({city: $scope.city, start:start}).then( function(data) {
                    $scope.routesData = 1;
                    $scope.routesDataA = data;
                    $scope.totalItems = $scope.routesDataA.length;
                    $scope.vm.tableParams = new NGTableParams({count:25, sorting:{route_id:'asc'}}, {data: $scope.routesDataA ,counts:[25,50,100,200]});
                }, function (err) {
                    $log.error(err);
                    $scope.routesData = 2;
                });

            };

            $scope.openDatepicker = function(date) {
                $scope[date].opened = true;
            };

            $scope.mostrar = function() {
                var start =  $scope.dateStart.date.toJSON().substr(0,10);
                $state.go('root.routes', {start: start, city:$scope.city });
            };

            $scope.goBack = function(){
                $state.go('root.home.ordergrid');
            };

            init();
        }]);

}(angular.module("weatf.routes", [
    'ui.router',
    'ngAnimate',
    'routesService'
])));