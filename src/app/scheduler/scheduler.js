/*jshint newcap:false*/
(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.scheduler', {
                    url: '/scheduler',
                    parent: 'root',
                    views: {
                        "container@": {
                            controller: 'schedulerController',
                            templateUrl: 'scheduler/scheduler.tpl.html'
                        }
                    },
                    resolve:{
                        autentica: (['authService',  function (authService) {
                            return authService.autentica();
                        }]),
                        schedulerData: (['schedulerService', '$q', '$log',
                            function (schedulerService, $q, $log) {
                                $log.info('scheduler::ResolveData::');
                                var def = $q.defer();
                                schedulerService.getAllCampaigns().then(function (data) {
                                    def.resolve(data);
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }]),
                        segmentsData:(['segmentService', '$q', '$log',
                            function (segmentService, $q, $log) {
                                $log.info('segments::ResolveData::');
                                var def = $q.defer();
                                segmentService.getAllsegments().then(function (data) {
                                    def.resolve(data);
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    data: {
                        pageTitle: 'Programar'
                    }
                });
        }]);

    app.controller('schedulerController', ['$log','$scope','$state','$http','ngTableParams','$filter','schedulerData','$uibModal','schedulerService','segmentsData',
        function ($log,$scope,$state,$http, ngTableParams,$filter,schedulerData,$uibModal,schedulerService,segmentsData) {

            var init = function (msg) {
                $log.info('App:: Starting schedulerController');
                $scope.segmentsData = segmentsData;
                $scope.model = {};
                $scope.model.pageTitle = $state.current.data.pageTitle;
                $scope.vm = {};
                var data = schedulerData.data;
                $scope.alerts = [msg];
                $scope.vm.tableParams = new ngTableParams({count:15, sorting:{id:'desc'}}, {data: data,counts:[15,20]});
            };

            $scope.countCampaign = function(id_campaign) {
                return true;
            };

            $scope.addScheduller = function () {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'scheduler/schedulerModalAdd.tpl.html',
                    size: 'lg',
                    controller: 'schedulerModalAddController',
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(modalResult){
                    if(modalResult.segment.selectedValues !== undefined) {
                        schedulerService.submitCampaign(modalResult.campaign_name,modalResult.segment.selectedValues,modalResult.apple,{msg: modalResult.android.msg,title:modalResult.android.title},modalResult.date_send, modalResult.statusCheckbox)
                            .then(function(data){
                                schedulerService.getAllCampaigns().then(function (data) {
                                    $scope.vm.tableParams = new ngTableParams({count:15, sorting:{id:'desc'}}, { data: data.data,counts:[15,20]});
                                }, function (err) {
                                    $log.error(err);
                                });
                            },function(err){
                                $log.error(err);
                            });
                    }
                    else{
                        $scope.addAlert('Error, sin segmentos?', 'danger', 3000);
                    }
                },function(){

                });
            };

            $scope.addAlert = function(msg, type, time) {
                $scope.alerts.push({msg: msg, type: type, time:time});
            };

            $scope.closeAlert = function(index) {
                $scope.alerts.splice(index, 1);
            };

            $scope.editScheduller = function (id) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'scheduler/schedulerModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'schedulerModalEditController',
                    resolve:{
                        schedulerData: (['schedulerService', '$q', '$log',
                            function (schedulerService, $q, $log) {
                                $log.info('scheduler::ResolveData::');
                                var def = $q.defer();
                                schedulerService.getCampaign(id).then(function (data) {
                                    def.resolve(data);
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }]),
                        segmentsData:(['segmentService', '$q', '$log',
                            function (segmentService, $q, $log) {
                                $log.info('segments::ResolveData::');
                                var def = $q.defer();
                                segmentService.getAllsegments().then(function (data) {
                                    def.resolve(data);
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(modalResult){
                    if(modalResult.segment.selectedValues !== undefined) {
                        schedulerService.saveCampaign(id,modalResult.campaign_name,modalResult.segment.selectedValues,modalResult.apple,{msg: modalResult.android.msg,title:modalResult.android.title},modalResult.date_send,modalResult.statusCheckbox)
                            .then(function(data){
                                $scope.addAlert('Campaña guardada correctamente!', 'success', 3000);
                                schedulerService.getAllCampaigns().then(function (data) {
                                    $scope.vm.tableParams = new ngTableParams({count:15, sorting:{id:'desc'}}, { data: data.data,counts:[15,20]});
                                }, function (err) {
                                    $log.error(err);
                                    $scope.addAlert('Error al recuperar datos!', 'danger', 3000);
                                });
                            },function(err){
                                $scope.addAlert('Error guardando campaña!', 'danger', 3000);
                                $log.error(err);
                            });
                    }
                    else{
                        $scope.addAlert('Error, sin segmentos?', 'danger', 3000);
                    }
                },function(){
                });
            };

            $scope.sendScheduller = function (id) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'scheduler/schedulerModalSend.tpl.html',
                    size: 'lg',
                    controller: 'schedulerModalSendController',
                    resolve:{
                        schedulerData: (['schedulerService', '$q', '$log',
                            function (schedulerService, $q, $log) {
                                $log.info('scheduler::ResolveData::');
                                var def = $q.defer();
                                schedulerService.getCampaignReady(id).then(function (data) {
                                    def.resolve(data);
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(modalResult){
                    schedulerService.shot(id).then(function(data){
                        $scope.addAlert('Campaña enviada correctamente!', 'success', 3000);
                        schedulerService.getAllCampaigns().then(function (data) {
                            $scope.vm.tableParams = new ngTableParams({count:15, sorting:{id:'desc'}}, { data: data.data,counts:[15,20]});
                        }, function (err) {
                            $log.error(err);
                            $scope.addAlert('Error al recuperar datos!', 'danger', 3000);
                        });
                    },function(err){
                        $scope.addAlert('Error enviando campaña!', 'danger', 3000);
                        $log.error(err);
                    });

                },function(){
                });
            };


            $scope.statsScheduller = function (id) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'scheduler/schedulerModalStats.tpl.html',
                    size: 'lg',
                    controller: 'schedulerModalStatsController',
                    resolve:{
                        schedulerData: (['chartService', '$q', '$log',
                            function (chartService, $q, $log) {
                                $log.info('scheduler::ResolveData::');
                                var def = $q.defer();
                                chartService.getChart(5,{id_campaign:id}).then(function (data) {
                                    def.resolve(data);

                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    scope: $scope
                });
            };

            $scope.deleteScheduler = function(id){
                schedulerService.deleteCampaign(id)
                    .then(function(data){
                        $scope.addAlert('Campaña eliminada correctamente!', 'success', 3000);
                        schedulerService.getAllCampaigns().then(function (data) {
                            $scope.vm.tableParams = new ngTableParams({count:15, sorting:{id:'desc'}}, { data: data.data,counts:[15,20]});
                            $scope.addAlert('Campaña id: '+ id +' eliminada correctamente!', 'success', 3000);
                        }, function (err) {
                            $scope.addAlert('Error al recuperar datos!', 'danger', 3000);
                            $log.error(err);
                        });
                    },function(err){
                        $scope.addAlert('Error al eliminar campaña!', 'danger', 3000);
                        $log.error(err);
                    });
            };

            $scope.duplicateScheduler = function(id){
                schedulerService.duplicateCampaign(id)
                    .then(function(data){
                        //$log.info(data);
                        schedulerService.getAllCampaigns().then(function (data) {
                            $scope.vm.tableParams = new ngTableParams({count:15, sorting:{id:'desc'}}, { data: data.data,counts:[15,20]});
                            $scope.addAlert('Campaña id: '+ id +' duplicada correctamente!', 'success', 3000);
                        }, function (err) {
                            $scope.addAlert('Error al recuperar datos!', 'danger', 3000);
                            $log.error(err);
                        });
                    },function(err){
                        $scope.addAlert('Error al duplicar campaña!', 'danger', 3000);
                        $log.error(err);
                    });
            };

            init({ type: 'warning', msg: 'Bienvenido a Push Scheduler!, Duplica, envia o elimina Mensajes Push!!', time:'3000' });

        }]);

    app.controller('schedulerModalAddController', ['$scope', '$uibModalInstance', '$log','$rootScope','segmentService',
        function ($scope, $uibModalInstance, $log, $rootScope, segmentService) {
            var init = function (){

                $scope.datepicker = {};
                $scope.datepicker.dateOptions = {formatYear: 'yy', startingDay: 1};
                $scope.datepicker.format = 'dd-MM-yyyy HH:mm';
                $scope.datepicker.opened = false;

                $scope.model = {};
                $scope.model.android = {msg:'', title: ''};
                $scope.model.apple='';
                $scope.max_apple = 107;
                $scope.max_android = 300;
                $scope.model.date_send = new Date();
                $scope.model.statusCheckbox = {
                    is_draft: true,
                    publish: false,
                    is_test: false
                };
                $scope.apple_remaining = $scope.max_apple-$scope.model.apple.length;
                $scope.android_remaining = $scope.max_android-$scope.model.android.length;

                $scope.availableSegments = $scope.segmentsData.data;
                $scope.model.segment = {};
                $scope.model.segment.selectedValues = [];

                $scope.$watch('model.apple', function() {
                    $scope.apple_remaining = $scope.max_apple-$scope.model.apple.length;
                });
                $scope.$watch('model.android.msg', function() {
                    $scope.android_remaining = $scope.max_android-$scope.model.android.msg.length;
                });
            };

            $scope.openDatepicker = function($event) {
                $scope.datepicker.opened = true;
            };

            $scope.ok = function (model) {
                $uibModalInstance.close(model);
            };

            $scope.cancel = function (model) {
                $uibModalInstance.dismiss('Exit');
            };

            init();
        }]);

    app.controller('schedulerModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope','segmentsData','schedulerData',
        function ($scope, $uibModalInstance, $log, $rootScope,segmentsData,schedulerData) {
            var init = function (){
                $scope.datepicker = {};
                $scope.datepicker.dateOptions = {formatYear: 'yy', startingDay: 1};
                $scope.datepicker.format = 'dd-MM-yyyy HH:mm';
                $scope.datepicker.opened = false;

                $scope.model = {};
                $scope.model.campaign_name=schedulerData.data.name;
                $scope.model.android = JSON.parse(schedulerData.data.message_android);
                $scope.model.apple = schedulerData.data.message_apple;
                $scope.model.date_send = new Date(schedulerData.data.date_send);

                $scope.model.statusCheckbox = {
                    is_draft: schedulerData.data.is_draft,
                    publish: !schedulerData.data.is_draft,
                    is_test: schedulerData.data.is_test
                };

                $scope.max_apple = 107;
                $scope.max_android = 300;
                $scope.apple_remaining = $scope.max_apple-$scope.model.apple.length;
                $scope.android_remaining = $scope.max_android-$scope.model.android.msg.length;

                var seg = [];
                if (schedulerData.data.Segments !== undefined && schedulerData.data.Segments.length > 0) {
                    schedulerData.data.Segments.forEach(function(segment){
                        seg[segment.id] = true;
                    });
                }

                $scope.availableSegments = $scope.segmentsData.data;
                $scope.model.segment = {};
                $scope.model.segment.selectedValues = seg;

                $scope.$watch('model.apple', function() {
                    $scope.apple_remaining = $scope.max_apple-$scope.model.apple.length;
                });
                $scope.$watch('model.android.msg', function() {
                    $scope.android_remaining = $scope.max_android-$scope.model.android.msg.length;
                });
            };
            $scope.openDatepicker = function($event) {
                $scope.datepicker.opened = true;
            };

            $scope.ok = function (model) {
                $uibModalInstance.close(model);
            };

            $scope.cancel = function (model) {
                $uibModalInstance.dismiss('Exit');
            };

            init();
        }]);

    app.controller('schedulerModalStatsController', ['$scope', '$uibModalInstance', '$log','$rootScope','schedulerData',
        function ($scope, $uibModalInstance, $log, $rootScope, schedulerData) {
            var init = function (){
                console.log(schedulerData);
                $scope.data = {
                    name: schedulerData[0]['Campaign']['name'] ? schedulerData[0]['Campaign']['name'] : schedulerData[1]['Campaign']['name'],
                    id: schedulerData[0]['CampaignId'] ? schedulerData[0]['CampaignId'] : schedulerData[1]['CampaignId']
                };
                $scope.vm = {};
                //$scope.schedulerData = schedulerData;
                $scope.bar = {};
                populateBar(schedulerData);

            };

            var populateBar = function(chartsData) {
                $scope.bar = {
                    series: ['Sent', 'Succes', 'Received', 'Open', 'Failure'],
                    data : [[],[],[],[],[]],
                    labels: [],
                    colours:['#97BBCD', '#DCDCDC', '#FDB45C', '#46BFBD','#F7464A'],
                    onClick: function (points, evt) {
                        console.log(points, evt);
                    }
                };

                angular.forEach(chartsData, function(chart){
                        $scope.bar.labels.push(chart['PlatformId'] === 1 ? 'Apple' : 'Android');
                        $scope.bar.data[0].push(chart['Sent'] ? chart['Sent'] : 0);
                        $scope.bar.data[1].push(chart['Success'] ? chart['Success'] : 0);
                        $scope.bar.data[2].push(chart['Received'] ? chart['Received'] : 0);
                        $scope.bar.data[3].push(chart['Open'] ? chart['Open'] : 0);
                        $scope.bar.data[4].push(chart['Failure'] ? chart['Failure'] : 0);
                });
            };
            

            $scope.ok = function (model) {
                $uibModalInstance.close(model);
            };

            $scope.cancel = function (model) {
                $uibModalInstance.dismiss('Exit');
            };

            init();
        }]);

    app.controller('schedulerModalSendController', ['$scope', '$uibModalInstance', '$log','$rootScope','schedulerData','ngTableParams','$filter',
        function ($scope, $uibModalInstance, $log, $rootScope,schedulerData,NgTableParams,$filter) {
            var init = function (){
                $scope.data = {};
                $scope.vm = {};
                $scope.vm.tableParams = new NgTableParams({count:15}, { data: schedulerData});
            };

            $scope.ok = function (model) {
                $uibModalInstance.close(model);
            };

            $scope.cancel = function (model) {
                $uibModalInstance.dismiss('Exit');
            };

            init();
        }]);


    app.filter('propsFilter', function() {
        return function(items, props) {
            var out = [];

            if (angular.isArray(items)) {
                items.forEach(function(item) {
                    var itemMatches = false;

                    var keys = Object.keys(props);
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        };
    });

}(angular.module("weatf.scheduler", [
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'ngTable',
    'schedulerService',
    'segmentService',
    'ngSanitize',
    'ui.select'
])));