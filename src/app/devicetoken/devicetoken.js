/*jshint newcap:false*/
(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.devicetoken', {
                    url: '/devicetoken',
                    parent: 'root',
                    views: {
                        "container@": {
                            controller: 'devicetokenController',
                            templateUrl: 'devicetoken/devicetoken.tpl.html'
                        }
                    },
                    resolve:{
                        autentica: (['authService',  function (authService) {
                            return authService.autentica();
                        }]),
                        tokensData: (['devicetokenService', '$q', '$log',
                            function (devicetokenService, $q, $log) {
                                $log.info('Devicetokens::ResolveData::');
                                var def = $q.defer();
                                devicetokenService.getAllTokens().then(function (data) {
                                    def.resolve(data);
                                   // $log.warn(data);
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    data: {
                        pageTitle: 'Tokens'
                    }
                });
        }]);

    app.controller('devicetokenController', ['$log','$scope','$state','$http','ngTableParams','$filter','tokensData','$uibModal','devicetokenService',
        function ($log,$scope,$state,$http,ngTableParams,$filter,tokensData, $uibModal,devicetokenService) {

            var init = function (msg) {
                $log.info('App:: Starting devicetokenController');
                $scope.model={};
                $scope.model.pageTitle=$state.current.data.pageTitle;
                $scope.isCollapsed = false;
                $scope.alerts = [msg];
                var data = tokensData.data;
                $scope.vm={};
                $scope.vm.tableParams = new ngTableParams({count:15}, { data: data,counts:[5,10,15,20]});

            };
            $scope.addAlert = function(msg, type, time) {
                $scope.alerts.push({msg: msg, type: type, time:time});
            };

            $scope.closeAlert = function(index) {
                $scope.alerts.splice(index, 1);
            };


            $scope.editDeviceToken = function (id) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'devicetoken/deviceTokenModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'devicetokenModalEditController',
                    resolve:{
                        /*schedulerData: (['schedulerService', '$q', '$log',
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
                            }])*/
                    },
                    scope: $scope
                });

                /*$scope.modalInstance.result.then(function(modalResult){
                    schedulerService.saveCampaign(id,modalResult.campaign_name,modalResult.segment.selectedValues,modalResult.apple,modalResult.android,modalResult.date_send,modalResult.is_draft)
                        .then(function(data){
                            schedulerService.getAllCampaigns().then(function (data) {
                                $scope.vm.tableParams = new ngTableParams({count:5}, { data: data.data,counts:[5,10,15,20]});
                            }, function (err) {
                                $log.error(err);
                            });
                        },function(err){
                            $log.error(err);
                        });
                },function(err){
                    $log.error('Dismissed'+err);
                });*/
            };

            $scope.deleteDeviceToken = function(id){
                devicetokenService.deleteToken(id)
                    .then(function(data){
                        $log.info(data);
                        devicetokenService.getAllTokens().then(function (data) {
                            $scope.vm.tableParams = new ngTableParams({count:15}, { data: data.data,counts:[5,10,15,20]});
                            $scope.addAlert('Device token id: '+ id +' eliminado correctamente!', 'success', 3000);
                        }, function (err) {
                            $scope.addAlert('Error al recibir datos!', 'danger', 3000);
                            $log.error(err);
                        });
                    },function(err){
                        $scope.addAlert('Error al eliminar!', 'danger', 3000);
                        $log.error(err);
                    });
            };

            init({ type: 'warning', msg: 'Bienvenido al gestor de Device Tokens! Edita o elimina tokens!!', time:'3000' });


        }]);

    app.controller('devicetokenModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope','segmentsData','schedulerData',
        function ($scope, $uibModalInstance, $log, $rootScope,segmentsData,schedulerData) {
            var init = function (){
               /* $scope.model = {};
                $scope.model.campaign_name=schedulerData.data.name;
                $scope.model.android=schedulerData.data.message_android;
                $scope.model.apple=schedulerData.data.message_android;
                $scope.model.date_send=new Date(schedulerData.data.date_send);
                $scope.model.draft = schedulerData.data.is_draft?true:false;
                $scope.model.publish = !schedulerData.data.is_draft?true:false;
                $scope.model.is_draft = schedulerData.data.is_draft;
                $scope.max_apple = 107;
                $scope.max_android = 300;
                $scope.apple_remaining = $scope.max_apple-$scope.model.apple.length;
                $scope.android_remaining = $scope.max_android-$scope.model.android.length;

                $scope.availableSegments3 = $scope.segmentsData.data;
                $scope.model.segment = {};
                $scope.model.segment.selectedValues = schedulerData.data.Segments;

                $scope.$watch('model.apple', function() {
                    $scope.apple_remaining = $scope.max_apple-$scope.model.apple.length;
                });
                $scope.$watch('model.android', function() {
                    $scope.android_remaining = $scope.max_android-$scope.model.android.length;
                });*/
            };

            /*$scope.tooglePublish = function(id_state){
                $scope.model.draft=id_state===2?$scope.model.draft=false:true;
                $scope.model.publish=id_state===1?$scope.model.publish=false:true;
                $scope.model.is_draft=id_state===1?true:false;
            };
*/
            $scope.ok = function (model) {
                $uibModalInstance.close(model);
            };

            $scope.cancel = function (model) {
                $uibModalInstance.dismiss('Exit');
            };

            init();
        }]);

}(angular.module("weatf.devicetoken", [
    'ui.router',
    'ngAnimate',
    'ngTable',
    'devicetokenService'
])));