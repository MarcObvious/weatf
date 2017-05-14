/*jshint newcap:false*/
(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.segment', {
                    url: '/segment',
                    parent: 'root',
                    views: {
                        "container@": {
                            controller: 'segmentController',
                            templateUrl: 'segments/segment.tpl.html'
                        }
                    },
                    resolve:{
                        autentica: (['authService',  function (authService) {
                            return authService.autentica();
                        }]),
                        segmentData: (['segmentService', '$q', '$log',
                            function (segmentService, $q, $log) {
                                $log.info('segment::ResolveData::');
                                var def = $q.defer();
                                var data = {data:[{
                                    "id": 3,
                                    "name": "iOS",
                                    "description": "iOS",
                                    "configuration": "{\"PlatformId\":\"1\"}",
                                    "deleted": false,
                                    "createdAt": "2015-11-20T08:58:37.000Z",
                                    "updatedAt": "2015-11-20T08:58:37.000Z",
                                    "Customers": [],
                                    "Campaign:": [],
                                    "Devicetokens": []
                                },{
                                    "id": 4,
                                    "name": "Android",
                                    "description": "Android",
                                    "configuration": "{\"PlatformId\":\"2\"}",
                                    "deleted": false,
                                    "createdAt": "2015-11-23T08:37:31.000Z",
                                    "updatedAt": "2015-11-23T08:37:31.000Z",
                                    "Customers": [],
                                    "Campaign:": [],
                                    "Devicetokens": []
                                }]};
                                def.resolve(data);
                                /*segmentService.getAllsegments().then(function (data) {
                                    def.resolve(data);
                                }, function (err) {
                                    def.reject(err);
                                });*/
                                return def.promise;
                            }])
                    },
                    data: {
                        pageTitle: 'Programar'
                    }
                });
        }]);

    app.controller('segmentController', ['$log','$scope','$state','$http','ngTableParams','$filter','segmentData','$uibModal','segmentService',
        function ($log,$scope,$state,$http,ngTableParams,$filter,segmentData,$uibModal,segmentService) {

            var init = function (msg) {
                $log.info('App:: Starting segmentController');
                $scope.model={};
                $scope.model.pageTitle=$state.current.data.pageTitle;
                $scope.isCollapsed = false;
                var data = segmentData.data;
                $scope.vm={};
                $scope.vm.tableParams = new ngTableParams({count:10}, { data: data,counts:[10,15,20]});
                $scope.alerts = [msg];
            };

            $scope.addAlert = function(msg, type, time) {
                $scope.alerts.push({msg: msg, type: type, time:time});
            };

            $scope.closeAlert = function(index) {
                $scope.alerts.splice(index, 1);
            };

            $scope.addSegment = function () {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'segments/segmentModalAdd.tpl.html',
                    size: 'lg',
                    controller: 'segmentModalAddController',
                    scope: $scope
                });

                $scope.modalInstance.result.then(function(modalResult){
                    segmentService.submitSegment(modalResult.name,modalResult.description,modalResult.configuration)
                        .then(function(data){
                            $scope.addAlert('Segmento creado correctamente!', 'success', 3000);
                            segmentService.getAllsegments().then(function (data) {
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: data.data,counts:[10,15,20]});
                            }, function (err) {
                                $log.error(err);
                                $scope.addAlert('Error al recuperar datos!', 'danger', 3000);
                            });
                        },function(err){
                            $log.error(err);
                            $scope.addAlert('Error al crear segmento!', 'danger', 3000);
                        });
                },function(){
                });

            };
            $scope.editSegment = function (id) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'segments/segmentModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'segmentModalEditController',
                    resolve: {
                        segmentData: (['segmentService', '$q', '$log',
                            function (segmentService, $q, $log) {
                                $log.info('segment::ResolveData::');
                                var def = $q.defer();
                                segmentService.getSegment(id).then(function (data) {
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
                    segmentService.saveSegment(id,modalResult.name,modalResult.description,modalResult.configuration)
                        .then(function(data){
                            $scope.addAlert('Segmento guardado correctamente!', 'success', 3000);
                            segmentService.getAllsegments().then(function (data) {
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: data.data,counts:[10,15,20]});
                            }, function (err) {
                                $log.error(err);
                                $scope.addAlert('Error al recuperar datos!', 'danger', 3000);
                            });
                        },function(err){
                            $log.error(err);
                            $scope.addAlert('Error al guardar segmento!', 'danger', 3000);
                        });
                },function(){
                });


            };

            $scope.deleteSegment = function(id) {
                segmentService.deleteSegment(id).then(function(data){
                    $scope.addAlert('Segmento eliminado correctamente!', 'success', 3000);
                    segmentService.getAllsegments().then(function (data) {
                        $scope.vm.tableParams = new ngTableParams({count:10}, { data: data.data,counts:[10,15,20]});
                    }, function (err) {
                        $log.error(err);
                        $scope.addAlert('Error al recuperar datos!', 'danger', 3000);
                    });
                },function(err){
                    $log.error(err);
                    $scope.addAlert('Error al guardar segmento!', 'danger', 3000);
                });
            };

            $scope.duplicateSegment = function(id) {
                segmentService.duplicateSegment(id).then(function(data){
                    $scope.addAlert('Segmento duplicado correctamente!', 'success', 3000);
                    segmentService.getAllsegments().then(function (data) {
                        $scope.vm.tableParams = new ngTableParams({count:10}, { data: data.data,counts:[10,15,20]});
                    }, function (err) {
                        $log.error(err);
                        $scope.addAlert('Error al recuperar datos!', 'danger', 3000);
                    });
                },function(err){
                    $log.error(err);
                    $scope.addAlert('Error al duplicar segmento!', 'danger', 3000);
                });
            };

            init();
            //init({ type: 'warning', msg: 'Bienvenido a Segment Manager, Duplica, envia o elimina Segments!!', time:'3000' });
        }]);

    app.controller('segmentModalAddController', ['$scope', '$uibModalInstance', '$log','$rootScope',
        function ($scope, $uibModalInstance, $log, $rootScope) {
            var init = function (){
                $scope.status = {};
            };

            $scope.ok = function (model) {
                $uibModalInstance.close(model);
            };

            $scope.cancel = function (model) {
                $uibModalInstance.dismiss('Exit');
            };
            init();
        }]);

    app.controller('segmentModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope','segmentData',
        function ($scope, $uibModalInstance, $log, $rootScope,segmentData) {
            var init = function (){
                $scope.status = {};
                $scope.model={};
                $scope.model.name = segmentData.data.name;
                $scope.model.description = segmentData.data.description;
                $scope.model.configuration = segmentData.data.configuration;
            };

            $scope.ok = function (model) {
                $uibModalInstance.close(model);
            };

            $scope.cancel = function (model) {
                $uibModalInstance.dismiss('Exit');
            };
            init();
        }]);

}(angular.module("weatf.segment", [
    'ui.router',
    'ngAnimate',
    'ngTable',
    'segmentService'
])));