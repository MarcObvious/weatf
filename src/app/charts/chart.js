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
            /*
             Chart.defaults.global.colours = [
             '#97BBCD', // blue '#DCDCDC', // light grey '#F7464A', // red #46BFBD', // green  '#FDB45C', // yellow   '#949FB1', // grey '#4D5360'  // dark grey ];
             */
            var init = function () {
                $log.info('App:: Starting chartController');
                $scope.model={};
                $scope.model.pageTitle = $state.current.data.pageTitle;
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

                $scope.succerr = {};
                $scope.instdest = {};

                $scope.$watch('dateStart.date', function(change){
                    reloadGraphs();
                });

                $scope.$watch('dateEnd.date', function(change){
                    reloadGraphs();
                });

            };

            $scope.openDatepicker = function(date) {
                $scope[date].opened = true;
            };

            var reloadGraphs = function () {
                var params = {
                    start: Date.parse($scope.dateStart.date),
                    end: Date.parse($scope.dateEnd.date)
                };

                $q.all([chartService.getChart(0, params), chartService.getChart(1, params,1), chartService.getChart(1, params,2)]).then(function(data){
                    populateChartSuccErr(data[0],1); //IOS
                    populateChartInstDest(data[1],1);
                    
                    populateChartSuccErr(data[0],2); //Android
                    populateChartInstDest(data[2],2);
                    
                }, function (err) {
                    $log.debug(err);
                });
            };

            var populateChartSuccErr = function(chartsData, platform) {
                delete $scope.succerr[platform];
                $scope.succerr[platform] = {
                    series: ['Sent', 'Succes', 'Received', 'Open', 'Failure'],
                    colours:['#97BBCD', '#DCDCDC', '#FDB45C', '#46BFBD','#F7464A'],
                    labels:[],
                    data: [[], [], [], [], []],
                    onClick: function (points, evt) {
                        console.log(points, evt);
                    }
                };

                angular.forEach(chartsData, function(chart){
                    if (chart['PlatformId'] === platform) {
                        $scope.succerr[platform].labels.push(chart['createdAt'].slice(5, 10));
                        $scope.succerr[platform].data[0].push(chart['Sent'] ? chart['Sent'] : 0);
                        $scope.succerr[platform].data[1].push(chart['Success'] ? chart['Success'] : 0);
                        $scope.succerr[platform].data[2].push(chart['Received'] ? chart['Received'] : 0);
                        $scope.succerr[platform].data[3].push(chart['Open'] ? chart['Open'] : 0);
                        $scope.succerr[platform].data[4].push(chart['Failure'] ? chart['Failure'] : 0);
                    }
                });
            };

            populateChartInstDest = function(chartsData, platform) {
                delete $scope.instdest[platform];
                $scope.instdest[platform] = {
                    series: ['New Successes', 'New errors'],
                    colours:['#46BFBD', '#F7464A'],
                    labels:[],
                    data: [[], []],
                    onClick: function (points, evt) {
                        console.log(points, evt);
                    }
                };

                angular.forEach(chartsData, function(chart){
                    if (chart['PlatformId'] === platform) {
                        $scope.instdest[platform].labels.push(chart['createdAt'].slice(5, 10));
                        $scope.instdest[platform].data[0].push(chart['installed']);
                        $scope.instdest[platform].data[1].push(chart['desinstalled']);
                    }

                });
            };
            init();

        }]);

}(angular.module("weatf.chart", [
    'ui.router',
    'ngAnimate',
    'chartService'
])));