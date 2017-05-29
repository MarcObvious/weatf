/*jshint newcap:false*/
(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.programador', {
                    url: '/programador/?:{id_local}:{page}',
                    parent: 'root',
                    views: {
                        "container@": {
                            controller: 'programadorController',
                            templateUrl: 'programador/programador.tpl.html'
                        }
                    },
                    resolve:{
                        autentica: (['authService',  function (authService) {
                            return authService.autentica();
                        }]),
                        programadorData: (['$q', '$log','$stateParams',
                            function ($q, $log, $stateParams) {
                                var def = $q.defer();
                                $log.debug('locals::::Resolveprogramador');

                                if ($stateParams.id_local !== undefined) {
                                    def.resolve({filterName:'Campañas local: ' + $stateParams.id_local, id_local:$stateParams.id_local});
                                }
                                else {
                                    def.resolve({filterName:'Campañas de todos los locales'});
                                }
                                return def.promise;
                            }])
                    },
                    data: {
                        pageTitle: 'Pedidos local'
                    }
                });
        }]);

    app.controller('programadorController', ['$log','$scope','programadorData',
        function ($log,$scope,programadorData) {

            var init = function () {
                $log.info('App:: Starting programadorController');

                $scope.filterName = programadorData.filterName;
                $scope.id_local = programadorData.id_local;
            };

            init();
        }]);

    app.controller('programadorModalAddController', ['$scope', '$uibModalInstance', '$log','$rootScope',
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

    app.controller('programadorModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope','campaingData','programadorService','localsData',
        function ($scope, $uibModalInstance, $log, $rootScope, campaingData, programadorService, localsData) {
            var init = function () {
                $scope.msg = {};
                $scope.locals = localsData;
                $scope.segments = {
                    type: "0",
                    drc: "0",
                    vis: "0",
                    local: "0",
                    so: "0",
                    language: "0"
                };

                $scope.segments_def = {
                    type: ['Noticias','Promociones'],
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


            $scope.cancel = function () {
                $uibModalInstance.dismiss('Exit');
            };

            $scope.cancelOrder = function () {
                programadorService.saveOrder({order_id: $scope.orderModal.order_id, order_state:2}).then(function(result){
                    $uibModalInstance.close(result);
                }, function (err) {
                });
            };

            $scope.save = function () {
                programadorService.saveOrder($scope.orderModal).then(function(result){
                    $uibModalInstance.close(result);
                }, function(err){
                });
            };
            init();
        }]);

    app.directive('programadorTable',['$state', function($state) {
        return {
            templateUrl:'programador/programadorTable.tpl.html',
            restrict: 'E',
            replace: true,
            controller:  (['$log','$scope','$state','$http','ngTableParams','ngTableEventsChannel','$filter','$uibModal','programadorService',
                function ($log,$scope,$state,$http,ngTableParams,ngTableEventsChannel,$filter,$uibModal,programadorService) {

                    var init = function () {
                        $log.info('App:: Starting programadorController');

                        $scope.model={};
                        $scope.isCollapsed = false;
                        $scope.vm={};

                        var date = new Date();

                        $scope.dateStart = {};
                        $scope.dateStart.format = 'dd-MM-yyyy';
                        $scope.dateStart.dateOptions = { formatYear: 'yy', startingDay: 1 };
                        $scope.dateStart.date = new Date(date.getTime() - 24*60*60*10000*7);
                        $scope.dateStart.opened = false;

                        $scope.dateEnd = {};
                        $scope.dateEnd.format = 'dd-MM-yyyy';
                        $scope.dateEnd.dateOptions = { formatYear: 'yy', startingDay: 1 };
                        $scope.dateEnd.date = date;
                        $scope.dateEnd.opened = false;

                        var start =  $scope.dateStart.date.toJSON().substr(0,10);
                        var end =  $scope.dateEnd.date.toJSON().substr(0,10);
                        $scope.programador = [];
                        $scope.exportData = [];
                        getprogramador(start, end);

                        ngTableEventsChannel.onAfterReloadData(function(a,b,c){
                            var filters = a.filter();
                            var rawData = a.settings().data;
                            $scope.exportData = $filter('filter')(rawData,filters);
                        }, $scope);
                    };

                    var getprogramador = function(start,end) {
                        if ($scope.localid !== undefined) {
                            programadorService.getLocalprogramador({local_id: $scope.localid, dateStart:start, dateEnd:end}).then(function(data){
                                $scope.filterName = 'Pedidos local: ' + $scope.localid;
                                //$scope.programador = data.data;
                                populateCsv(data.data);
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: $scope.programador,counts:[10,15,20]});

                            }, function (err) {
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: [],counts:[10,15,20]});
                            });
                        }
                        else {
                            programadorService.getAllprogramador({dateStart:start, dateEnd:end}).then(function (data) {
                                $scope.filterName = 'Pedidos de todos los locales';
                                // $scope.programador = data.data;
                                populateCsv(data.data);
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: $scope.programador,counts:[10,15,20]});

                            }, function (err) {
                                $scope.vm.tableParams = new ngTableParams({count:10}, { data: [],counts:[10,15,20]});
                            });
                        }
                        $scope.name_csv = 'Pedidos_'+ start + '_' + end;
                        $scope.headers_csv = ['Pedido','Local','Usuario','Estado','Producto','Precio','Cantidad','F.A','F.C'];
                    };

                    var populateCsv = function(programador) {
                        $scope.programador = [];
                        if (programador.length > 0) {
                            angular.forEach(programador, function (order) {
                                if (order.orderdetail!== null && order.orderdetail[0] !== null){
                                    var local_name = order.orderdetail[0].localinfo !==null ? order.orderdetail[0].localinfo.name : 'Desconocido';
                                    var product_name = order.orderdetail[0].productinfo !==null ? order.orderdetail[0].productinfo.name : 'Desconocido';
                                    $scope.programador.push({
                                        id: order.id,
                                        local_name: local_name,
                                        user_name: order.orderdetail[0].user_name,
                                        order_state_name: order.order_state_name,
                                        product_name: product_name ,
                                        product_price: order.orderdetail[0].product_price,
                                        product_quantity: order.orderdetail[0].product_quantity,
                                        updated_at: order.orderdetail[0].updated_at,
                                        created_at: order.orderdetail[0].created_at
                                    });
                                }
                            });
                        }
                    };

                    $scope.openDatepicker = function(date) {
                        $scope[date].opened = true;
                    };

                    $scope.viewOrderDetail = function (order_id) {
                        $scope.modalInstance = $uibModal.open({
                            templateUrl: 'programador/programadorModalEdit.tpl.html',
                            size: 'lg',
                            controller: 'programadorModalEditController',
                            resolve: {
                                localsData: (['globalService','$q', function(globalService,$q){
                                    var def = $q.defer();
                                    globalService.getSideBarLocals().then(function(data){
                                        def.resolve(data);
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                    return def.promise;
                                }]),
                                campaingData : (['programadorService','$q', function (programadorService, $q) {
                                    var def = $q.defer();
                                    def.resolve(true);
                                    /*programadorService.getOrder({order_id: order_id}).then(function(data){
                                     def.resolve(data);
                                     }, function (err) {
                                     def.reject(err);
                                     });*/
                                    return def.promise;
                                }])
                            },
                            scope: $scope
                        });

                        $scope.modalInstance.result.then(function(modalResult){
                            $state.reload();
                        },function(){
                        });
                    };

                    $scope.cancelOrder = function (params) {
                        params.order_state = 2;
                        programadorService.saveOrder(params).then(function(result){
                            $state.reload();
                        }, function (err) {
                        });
                    };

                    $scope.mostrar = function() {
                        $scope.exportData = [];
                        if ($scope.dateStart.date && $scope.dateEnd.date) {
                            var start =  $scope.dateStart.date.toJSON().substr(0,10);
                            var end =  $scope.dateEnd.date.toJSON().substr(0,10);
                            getprogramador(start, end);
                        }
                        else {
                            getprogramador(null, null);
                        }

                    };

                    init();
                }]),
            scope: {
                localid: '='
            }
        };
    }]);
}(angular.module("weatf.programador", [
    'ui.router',
    'ngAnimate',
    'ngTable',
    'programadorService'
])));