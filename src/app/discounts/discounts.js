(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.discounts', {
                    url: '/discounts',
                    parent: 'root',
                    views: {
                        "container@": {
                            controller: 'discountsController',
                            templateUrl: 'discounts/discounts.tpl.html'
                        }
                    },
                    resolve: {
                        autentica: (['authService', function (authService) {
                            return authService.autentica();
                        }]),
                        discountsData: (['discountsService', '$q', '$log',
                            function (discountsService, $q, $log) {
                                var def = $q.defer();
                                $log.debug('discounts::::Resolvediscounts');
                                discountsService.getAllDiscounts().then(function(data){
                                    def.resolve({discounts: data, filterName:'Cupones disponibles:'});
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    data: {
                        pageTitle: 'Cupones'
                    }
                });
        }]);

    app.controller('discountsController', ['$log','$scope','discountsData','ngTableParams','$uibModal','discountsService','$state',
        function ($log, $scope, discountsData, NGTableParams, $uibModal, discountsService, $state) {

            var init = function () {
                $log.info('App:: Starting discountsController');
                $scope.filterName = discountsData.filterName;
                $scope.vm = {};
                if (discountsData.discounts) {
                    $scope.discounts = discountsData.discounts;
                    angular.forEach($scope.discounts, function (discount,key) {
                        switch (discount.type) {
                            case 1:
                                $scope.discounts[key].discount_type_name = "Importe";
                                break;
                            case 2:
                                $scope.discounts[key].discount_type_name = "Porcentaje";
                                break;
                            default:
                                $scope.discounts[key].discount_type_name = "Importe";
                                break;
                        }
                    });
                    $scope.vm.tableParams = new NGTableParams({count:15}, { data: $scope.discounts,counts:[15,20,50]});
                }
            };

            $scope.editDiscount = function (discount_id) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'discounts/discountModalEdit.tpl.html',
                    size: 'lg',
                    controller: 'discountModalEditController',
                    resolve: {
                        discountData: (['discountsService','$q',
                            function (discountsService, $q) {
                                var def = $q.defer();
                                discountsService.getDiscount({discount_id: discount_id}).then(function(data){
                                    def.resolve(data.data);
                                }, function (err) {
                                    def.reject(err);
                                });
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

            $scope.deleteDiscount = function (discount_id) {
                discountsService.deleteDiscount({discount_id: discount_id}).then(function(result){
                    $state.reload();
                }, function(err){
                });
            };


            init();

        }]);

    app.controller('discountModalEditController', ['$scope', '$uibModalInstance', '$log','$rootScope','discountData','discountsService','$state',
        function ($scope, $uibModalInstance, $log, $rootScope, discountData, discountsService,$state) {
            var init = function () {
                $scope.discountModal = discountData ? discountData : {};
            };

            $scope.save = function () {
                if($scope.discountModal.password !== $scope.discountModal.password_val){
                    $rootScope.alerts.push({ type: 'danger', msg: "Las contraseñas no coinciden.", time:'3000' });
                    return false;
                }

                if ($scope.discountModal.newDiscount) {
                    discountsService.createDiscount($scope.discountModal).then(function(result){
                        $uibModalInstance.close(result.data);
                    }, function(err){
                    });
                }
                else {
                    delete $scope.discountModal.created_at;
                    delete $scope.discountModal.updated_at;
                    //$scope.discount.discount_id = $scope.discount.id;
                    discountsService.saveDiscount($scope.discountModal).then(function(result){
                        $uibModalInstance.close(result.data);
                    }, function(err){
                    });
                }
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('Exit');
            };

            $scope.deleteDiscount = function (discount_id) {
                discountsService.deleteDiscount({discount_id: discount_id}).then(function(result){
                    $uibModalInstance.dismiss('Exit');
                    $state.reload();
                }, function(err){
                });
            };

            init();
        }]);

}(angular.module("weatf.discounts", [
    'ui.router',
    'ngAnimate',
    'discountsService',
    'authService'
])));