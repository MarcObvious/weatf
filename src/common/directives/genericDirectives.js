angular.module('genericDirectives', [])

    .directive('chat',function(){
        return {
            templateUrl: 'directives/templates/chat.tpl.html',
            restrict: 'E',
            replace: true,
        };
    })

    .directive('stats',function() {
        return {
            templateUrl: 'directives/templates/stats.tpl.html',
            restrict: 'E',
            replace: true,
            scope: {
                'model': '=',
                'comments': '@',
                'number': '@',
                'name': '@',
                'colour': '@',
                'details': '@',
                'type': '@',
                'goto': '@'
            }

        };
    })

    .directive('header',function(){
        return {
            templateUrl:'directives/templates/header.tpl.html',
            restrict: 'E',
            replace: true,
        };
    })
    /*
     .directive('headerNotification',function() {
     return {
     templateUrl: 'directives/templates/header-notification.tpl.html',
     restrict: 'E',
     replace: true,
     };
     })
     */
    .directive('notifications',function(){
        return {
            templateUrl:'directives/templates/notifications.tpl.html',
            restrict: 'E',
            replace: true,
            scope: {
                actionData: '='
            }
        };
    })

    .directive('feedback',function(){
        return {
            templateUrl:'directives/templates/feedback.tpl.html',
            restrict: 'E',
            replace: true
        };
    })

    .directive('sidebar',['$location','$state','globalService','$uibModal',
        function($location, $state, globalService,$uibModal) {
            return {
                templateUrl:'directives/templates/sidebar.tpl.html',
                restrict: 'E',
                replace: true,
                scope: {
                },
                controller:function($scope, $rootScope, authService){
                    var init = function(){
                        $scope.collapseVar = 999;
                        $scope.multiCollapseVar = 0;

                        $scope.check(1);

                        $scope.logged = false;
                        $scope.sidebarContent = {};
                        authService.autentica().then(function(logged){
                            $scope.logged = logged;
                            if ($scope.logged) {
                                globalService.getSideBarContent().then(function(content){
                                    $scope.sidebarContent = content;
                                });
                            }
                        });


                    };

                    $rootScope.$on('logged.loggedChange', function(event, aValues) {
                        $scope.logged = aValues.logged;
                        if ($scope.logged) {
                            globalService.getSideBarContent().then(function(content){
                                $scope.sidebarContent = content;
                            });
                        }
                    });

                    $scope.check = function(x){

                        if(x === $scope.collapseVar){
                            $scope.collapseVar = 0;
                        } else {
                            $scope.collapseVar = x;
                        }

                    };

                    $scope.multiCheck = function(y){

                        if(y === $scope.multiCollapseVar){
                            $scope.multiCollapseVar = 0;
                        } else {
                            $scope.multiCollapseVar = y;
                        }

                    };

                    $scope.newUser = function () {
                        $scope.modalInstance = $uibModal.open({
                            templateUrl: 'users/userModalEdit.tpl.html',
                            size: 'lg',
                            controller: 'userModalEditController',
                            resolve: {userData : {newuser:true}},
                            scope: $scope
                        });

                        $scope.modalInstance.result.then(function(modalResult){
                        },function(){

                        });
                    };

                    init();
                }
            };
        }])
    .directive('back', ['$window',
        function($window) {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs) {
                    elem.bind('click', function () {
                        $window.history.back();
                    });
                }
            };
        }])

    .directive('maps', [function() {
        return {
            templateUrl:'locals/maps.tpl.html',
            restrict: 'E',
            replace: true,
            controller: ('mapsController', ['$scope', '$log', '$rootScope', 'geolocationService',
                function($scope, $log, $rootScope, geolocationService) {

                    var init = function() {
                        $scope.id_local = null;
                        $log.debug('Maps::::mapsController::');
                        $scope.centerMap = geolocationService.getNearestCity();
                        $scope.showInfo = [];
                    };
                    $scope.openCustomMarker = function(order){
                        angular.forEach($scope.positions, function (pos) {
                            $scope.showInfo[pos.id_local] = false;
                        });
                        if(angular.isDefined(order.id_local) && $scope.id !== order.id_local) {
                            $scope.showInfo[order.id_local] = !$scope.showInfo[order.id_local];
                            $scope.id_local = order.id_local;
                            //$scope.centerMap = order.pos;
                        }
                        else {
                            $scope.id_local = null;
                        }

                    };

                    $rootScope.$on('positions.positionsChange', function(event, aValues) {
                        if(angular.isDefined(aValues.centerMap)) {
                            $scope.centerMap = aValues.centerMap;
                        }
                        else {
                            $scope.centerMap = geolocationService.getNearestCity();
                        }
                        $scope.positions = aValues.positions;
                        angular.forEach($scope.positions, function (pos) {
                            $scope.showInfo[pos.id_local] = false;
                        });

                    });

                    init();
                }])
        };
    }])



    .directive('sidebarSearch',['$state', function($state) {
        return {
            templateUrl:'directives/templates/sidebar-search.tpl.html',
            restrict: 'E',
            replace: true,
            scope: {},
            controller:function($scope){
                var init = function(){
                    $scope.string_search = '';
                    $scope.selectedMenu = 'home';
                };

                $scope.searchF = function () {
                    $state.go('root.home.orderdetail',{id_order:$scope.string_search});
                    $scope.string_search = '';
                };

                init();
            }
        };
    }])
    .directive('sidebarLocals',['$state', function($state) {
        return {
            templateUrl:'directives/templates/sidebar-locals.tpl.html',
            restrict: 'E',
            replace: true,
            scope: {},
            controller:  ('sidebarLocalsController', ['$scope', 'globalService','$state',
                function($scope, globalService, $state) {

                    var init = function(){
                        $scope.locals = [];
                        globalService.getSideBarLocals().then(function(data){
                            $scope.locals = data;
                        }, function (err) {
                           console.log(err);
                        });
                        $scope.localSelected = 'All';
                        $scope.selectedMenu = 'home';

                    };

                    $scope.$watch('localSelected', function(id, oldValue) {
                        if (id === oldValue) {
                            return false;
                        }
                        else if (id === 'All'){
                            $state.go('root.locals.localgrid',{page: 1});
                        }
                        else {
                            $state.go('root.locals.localdetail',{id_local: id});
                        }
                    });

                    init();
                }])
        };
    }])


    .directive('contentItem',['$compile','$log', function ($compile,$log) {
        var imageTemplate = '<div class="entry-photo"><h2>&nbsp;</h2><div class="entry-img"><span><a href="{{rootDirectory}}{{content.data}}"><img ng-src="{{rootDirectory}}{{content.data}}" alt="entry photo"></a></span></div><div class="entry-text"><div class="entry-title">{{content.title}}</div><div class="entry-copy">{{content.description}}</div></div></div>';
        var videoTemplate = '<div class="entry-video"><h2>&nbsp;</h2><div class="entry-vid"><h1>{{content.data}}</h1></div><div class="entry-text"><div class="entry-title">{{content.title}}</div><div class="entry-copy">{{content.description}}</div></div></div>';
        var noteTemplate = '<div class="entry-note"><h2>&nbsp;</h2><div class="entry-text"><div class="entry-title">{{content.title}}</div><div class="entry-copy">{{content.data}}</div></div></div>';

        var getTemplate = function(contentType) {
            var template = '';

            switch(contentType) {
                case 'image':
                    template = imageTemplate;
                    break;
                case 'video':
                    template = videoTemplate;
                    break;
                case 'notes':
                    template = noteTemplate;
                    break;
            }

            return template;
        };

        var linker = function(scope, element, attrs) {
            //scope.rootDirectory = 'images/';
            ///$log.debug(element);
            // angular.element(element).html($compile(getTemplate(scope.content.content_type))(scope));
            // console.log($compile(markup)(scope));
            element.html(getTemplate(scope.content.content_type));

            $compile(element.contents())(scope);
        };

        return {
            restrict: "E",
            link: linker,
            scope: {
                content:'='
            }
        };
    }]);








