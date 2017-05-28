(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.segmentedpush', {
                    url: '/segmentedpush',
                    parent: 'root',
                    resolve:{
                        autentica: (['authService',  function (authService) {
                            return authService.autentica();
                        }]),
                        localsData: (['globalService','$q', function(globalService,$q){
                            var def = $q.defer();
                            globalService.getSideBarLocals().then(function(data){
                                def.resolve(data);
                            }, function (err) {
                                def.reject(err);
                            });
                            return def.promise;
                        }])
                    },
                    views: {
                        "container@": {
                            controller: 'segmentedpushController',
                            templateUrl: 'segmentedpush/segmentedpush.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'Push Simple'
                    }
                });
        }]);

    app.controller('segmentedpushController', ['$log','$scope','$state','localsData','segmentedpushService',
        function ($log, $scope,$state, localsData, segmentedpushService) {
            var init = function () {
                $scope.msg = {};
                $scope.locals = localsData;
                $scope.segments = {
                    drc: "0",
                    vis: "0",
                    local: "0",
                    so: "0",
                    lang: "0"
                };

                var date = new Date();

                $scope.dateStart = {};
                $scope.dateStart.format = 'dd-MM-yyyy hh:ss';
                $scope.dateStart.dateOptions = { formatYear: 'yy', startingDay: 1 };
                $scope.dateStart.date = new Date(date.getTime() - 24*60*60*10000*7);
                $scope.dateStart.opened = false;

            };

            $scope.openDatepicker = function(date) {
                $scope[date].opened = true;
            };

            $scope.clearForm = function(){
                init();
            };

            $scope.sendSegmentedPush = function() {
                segmentedpushService.sendsegmentedpush({msg : $scope.msg, segments : $scope.segments}).then(function (results){
                    console.log(results);
                }, function (err) {
                    console.log(err);
                });
            };

            init();
        }]);

}(angular.module("weatf.segmentedpush", [
    'ui.router',
    'segmentedpushService',
    'ngAnimate'
])));