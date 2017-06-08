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

    app.controller('consolidacionController', ['$log', '$q', '$scope', '$state', 'consolidacionService',
        function ($log, $q, $scope, $state, consolidacionService) {

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

                $scope.localsValues = [];
                   /* [
                        {"name": "5-Franquiciador Fornet",
                            "locals": {
                                "1-Fornet1": {
                                    "local_owner":"fr1@fornet.com",
                                    "total_sold": 282
                                },
                                "2-Fornet2": {
                                    "local_owner":"fr1@fornet.com",
                                    "total_sold": 28
                                },
                                "3-Fornet3": {
                                    "local_owner":"fr1@fornet.com",
                                    "total_sold": 26
                                },
                                "4-Fornet4": {
                                    "local_owner":"fr1@fornet.com",
                                    "total_sold": 42
                                }
                            },
                            "total_franquicia": 378
                        },
                        {"name": "5-Franquiciador Buenas1",
                            "locals": {
                                "1-Buenas1": {
                                    "local_owner":"bm1@fornet.com",
                                    "total_sold": 282
                                },
                                "2-Buenas2": {
                                    "local_owner":"bm2@fornet.com",
                                    "total_sold": 28
                                },
                                "3-Buenas3": {
                                    "local_owner":"bm2@fornet.com",
                                    "total_sold": 26
                                },
                                "4-Buenas4": {
                                    "local_owner":"bm2@fornet.com",
                                    "total_sold": 42
                                }
                            },
                            "total_franquicia": 378
                        }
                    ];*/

                $scope.mostrar();
            };

            $scope.mostrar = function () {
                $scope.localsValues = [];
                var params = {cons_type:10};
                if ($scope.dateStart.date && $scope.dateEnd.date) {
                    params.startDate =  $scope.dateStart.date.toJSON().substr(0,10);
                    params.endDate=  $scope.dateEnd.date.toJSON().substr(0,10);
                }

                consolidacionService.getConsolidacion(params).then(function(cons){
                    angular.forEach(cons,function (value, key) {
                       /* if (angular.isDefined(cons[key])) {
                            $scope.stats[key].v = value;
                        }*/
                        console.log(value);
                        console.log(key);
                        $scope.localsValues.push(value);

                    });
                }, function (err) {
                });
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