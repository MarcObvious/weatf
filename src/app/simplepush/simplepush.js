(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.simplepush', {
                    url: '/simplepush',
                    parent: 'root',
                    resolve:{
                        autentica: (['authService',  function (authService) {
                            return authService.autentica();
                        }])
                    },
                    views: {
                        "container@": {
                            controller: 'SimplepushController',
                            templateUrl: 'simplepush/simplepush.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'Push Simple'
                    }
                });
        }]);

    app.controller('SimplepushController', ['$log','$scope','$state','simplepushService','$sce','$rootScope',
        function ($log,$scope,$state,simplepushService,$sce,$rootScope) {

            var init = function (msg) {
                $log.info('App:: Starting simplepushController');
                $scope.alerts = [msg];
                $scope.model={};
                $scope.model.pageTitle=$state.current.data.pageTitle;
                $scope.dev = {};
                $scope.dev.push_title ='';
                $scope.dev.push_message = '';
                $scope.dev.show_dialog=false;
                $scope.dev.result = "";
                $scope.dev.selradio='Not selected';
                $scope.dev.devicetokens = [];


                //Prod object
                $scope.prod=$scope.dev;
                $scope.prod.all_platform=true;
            };

            $scope.addAlert = function(msg, type, time) {
                $rootScope.alerts.push({msg: msg, type: type, time:time});
            };

            $scope.closeAlert = function(index) {
                $rootScope.alerts.splice(index, 1);
            };


            $scope.getTokensFromEmail = function(){
                $scope.removeToken();
                $scope.dev.devicetokens = [];
                $scope.dev.selectedData = null;
                simplepushService.getTokenFromEmail({email:$scope.dev.email}).then(function(data){
                    if(data.pushtoken){
                        $scope.dev.selectedData = data.pushtoken;
                        $scope.dev.devicetokens.push({token:data.pushtoken});
                        $scope.addAlert('Token encontrado', 'success', 3000);
                    }
                    else{
                        $scope.dev.result = "No se encontro dispositivo.";
                        $scope.addAlert('No se ha encontrado ningun token!', 'danger', 3000);
                    }
                    $scope.dev.show_dialog=true;
                });
            };

            $scope.sendSimplePush = function(token){

                token = $scope.dev.selectedData;

                if(token){
                    var pushMsg = {
                        email : $scope.dev.email,
                        token : token,
                        pushTitle: $scope.dev.push_title || 'Example push title',
                        pushMessage: $scope.dev.push_message || 'Push example message ...'
                    };
                    simplepushService.sendSinglePush(pushMsg).then(function(data){
                        $log.info('Push send result');
                        $log.info(data);
                    },function(err){
                        $log.error(err);
                        $scope.addAlert('Error al enviar push', 'danger', 3000);
                    });
                }else{
                    $scope.addAlert('Debes fijar un token al que enviar', 'danger', 3000);
                    return false;
                }
            };

            $scope.clearForm = function(){
                init();
            };

            $scope.selectToken = function(token){
                $scope.dev.selectedData=token;
                $scope.dev.result = '<h6>Token cargado:</h6><span class="label label-primary">'+token.substr(0,40)+'</span>';
            };

            $scope.removeToken = function(){
                $scope.dev.selectedData=null;
                $scope.dev.result = null;
            };

            init();
        }]);

}(angular.module("weatf.simplepush", [
    'ui.router',
    'simplepushService',
    'ngAnimate'
])));