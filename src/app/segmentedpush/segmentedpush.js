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

    app.controller('segmentedpushController', ['$log','$scope','$state','localsData','segmentedpushService','$uibModal',
        function ($log, $scope,$state, localsData, segmentedpushService, $uibModal) {
            var init = function () {
                $scope.msg = {};
                $scope.locals = localsData;
                $scope.segments = {
                    drc: "0",
                    vis: "0",
                    local: "0",
                    so: "0",
                    language: "0"
                };

                $scope.segments_def = {
                    drc: ['Todos','Usuarios que han bajado la APP pero no se han registrado','Usuarios que se han registrado pero que no han comprado','Usuarios que han comprado alguna vez','Usuarios que han comprado más de 10 veces'],
                    vis: ['Todos','Usuarios que hace más de dos semanas que no visitan la APP','Usuarios que hace más de un más que visitan la APP'],
                    so:  ['Todos','Android','iOS'],
                    language: ['Todos', 'Clientes que tienen la APP en castellano', 'Clientes que tienen la APP en catalán'],
                    local: ['Todos']
                };

                angular.forEach($scope.locals, function (local, index) {
                    $scope.segments_def.local.push( 'Clientes que han comprado en \'' + local.n + '\'');
                });

                $scope.send_now = false;

                var date = new Date();

                $scope.sendDate = {};
                $scope.sendDate.format = 'dd-MM-yyyy';
                $scope.sendDate.dateOptions = { formatYear: 'yy', startingDay: 1 };
                $scope.sendDate.date = date;
                $scope.sendDate.opened = false;

                $scope.sendDate.hour = date;

                $scope.final_date = '';

            };

            $scope.openDatepicker = function(date) {
                $scope[date].opened = true;
            };

            $scope.clearForm = function(){
                init();
            };

            $scope.sendSegmentedPush = function (send_now) {
                $scope.send_now = send_now;
                var params = {msg : $scope.msg, segments : $scope.segments, send_now: send_now};
                if (!send_now) {
                    params.date = $scope.sendDate.date.toJSON().substr(0,10) + ' ' + $scope.sendDate.hour.toString().slice(16,21);
                    $scope.final_date = params.date;
                }

                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'segmentedpush/segmentedpushModalConfirm.tpl.html',
                    size: 'lg',
                    scope: $scope,
                    controller: ('segmentedpushModalConfirmController', ['$scope','$uibModalInstance',
                        function($scope,$uibModalInstance) {
                            $scope.send = function (){
                                $uibModalInstance.close('Ok');
                            };
                            $scope.cancel = function (){
                                $uibModalInstance.dismiss();
                            };
                        }])
                });

                $scope.modalInstance.result.then(function(modalResult){
                    if(modalResult === 'Ok') {
                        sendSegmentedPushConfirmed(params);
                    }
                },function(err){
                });
            };

            var sendSegmentedPushConfirmed = function(params) {
                segmentedpushService.sendsegmentedpush(params).then(function (results){
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