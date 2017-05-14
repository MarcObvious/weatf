(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.locals', {
                    url: '',
                    parent: 'root',
                    resolve: {
                        autentica: (['authService','$state', function (authService) {
                            authService.autentica().then(function(logged){
                                return logged;
                            });
                        }])
                    },
                    abstract: true,
                    views: {
                        "container@": {
                            templateUrl: 'locals/locals.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'locals'
                    }
                })
                .state('root.locals.localgrid', {
                    url: '/?:{page}:{filter_by}:{date}/:{id}',
                    parent: 'root.locals',
                    resolve: {
                        localsData: (['localsService', '$q', '$log','$stateParams',
                            function (localsService, $q, $log, $stateParams) {
                                var def = $q.defer();

                                $log.debug('locals::::ResolveLocalsGrid');

                                localsService.getLocals().then(function(data){
                                    def.resolve({locals: data, filterName:'All locals: ' + name});
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    views: {
                        "subcontainer@root.locals": {
                            controller: 'localGridController',
                            templateUrl: 'locals/localGrid.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'Orders'
                    }
                })
                .state('root.locals.localdetail', {
                    url: '/localDetail/{id_local}',
                    parent: 'root.locals',
                    resolve: {
                        localData: (['localsService', '$q', '$log','$stateParams',
                            function (localsService, $q, $log, $stateParams) {
                                var def = $q.defer();
                                var id = $stateParams.id_local;
                                $log.debug('locals::::ResolveOrderDetail::'+id);

                                localsService.getLocal({local_id: id}).then(function(data){
                                    def.resolve({local: data, filterName:'Local: ' + id});
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    views: {
                        "subcontainer@root.locals": {
                            controller: 'localDetailController',
                            templateUrl: 'locals/localDetail.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'LocalDetail'
                    }
                });
        }]);

    app.controller('localGridController', ['$log','$scope','$state','localsData', 'NgMap','$rootScope','$timeout', 'localsService', '$stateParams',
        function ($log, $scope, $state, localsData, NgMap, $rootScope, $timeout, localsService, $stateParams) {

            var init = function () {
                $log.info('App:: Starting localsController');
                $scope.localsData = localsData;
                console.log(localsData);

                $scope.totalItems = 0;
                $scope.filterBy = localsData.filterName;
                $scope.locals = [];

                if (localsData.locals) {
                    $scope.locals = localsData.locals;
                    console.log($scope.locals);
                    $scope.positions = [];
                    $scope.totalItems = $scope.locals.length;

                    $scope.currentPage = $stateParams.page ? $stateParams.page : 1;
                    $scope.numPerPage = 6;
                    var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                    $scope.localsSliced = $scope.locals.slice(begin, end);


                    angular.forEach(localsData.locals, function (localData, index) {
                        if (angular.isDefined(localData.lat) && angular.isDefined(localData.lng)) {
                            $scope.positions.push({
                                pos:[localData.lat, localData.lng],
                                name: localData.name,
                                id_local: localData.id,
                                direction: localData.direction,
                                pickup_time: localData.pickup_time
                            });
                        }
                    });

                    $timeout(function() {
                        $rootScope.$emit('positions.positionsChange', {positions: $scope.positions});
                    });
                }

            };

            $scope.mostrar = function() {
                var start =  $scope.dateStart.date.toJSON().substr(0,10);
                $state.go('root.locals.localgrid', {option: $scope.option, date: start});
            };

            $scope.pageChanged = function () {
                var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                $scope.localsSliced = $scope.locals.slice(begin, end);

                $state.go('root.locals.localgrid',{page:$scope.currentPage},{notify:false, reload:false, location:'replace', inherit:true});
            };

            $scope.openLocal = function (id_local) {
                $state.go('root.locals.localdetail',{id_local: id_local});
            };

            init();

        }]);

    app.controller('localDetailController', ['$log','$scope','$state','localData', '$rootScope','$timeout', 'localsService',
        function ($log, $scope, $state, localData, $rootScope, $timeout, localsService) {

            var init = function() {
                $scope.local = {};
                var positions = [];
                var centerMap = [];
                console.log(localData);
                if (localData) {
                    $scope.local = localData.local;
                    if (angular.isDefined(localData.local.lat) && angular.isDefined(localData.local.lng)) {
                        positions.push({
                            pos:[localData.local.lat, localData.local.lng],
                            name: localData.local.name,
                            id_local: localData.local.id,
                            direction: localData.local.direction,
                            pickup_time: localData.local.pickup_time
                        });
                        centerMap = [localData.local.lat, localData.local.lng];
                    }
                }

                $timeout(function() {
                    $rootScope.$emit('positions.positionsChange', {centerMap: centerMap, positions: positions});
                });
            };

            init();
        }]);


}(angular.module("weatf.locals", [
    'ui.router',
    'ngAnimate',
    'localsService',
    'authService'
])));