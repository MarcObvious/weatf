/* 
 * scheduler service
 */
angular.module('schedulerService', [])
    .factory('schedulerService', ['$resource', '$q', '$log',
        function ($resource, $q, $log) {
            return {
                api: function (extra_route) {
                    if (!extra_route) {
                        extra_route = '';
                    }
                    return $resource(API_URL + '/schedulers/' + extra_route, {}, {
                        query: {
                            timeout: 15000
                        },
                        save: {
                            timeout: 15000,
                            method: 'POST'
                        },
                        get: {
                            timeout: 15000,
                            method: 'GET'
                        },
                        put: {
                            timeout: 15000,
                            method: 'PUT'
                        },
                        delete: {
                            timeout: 15000,
                            method: 'DELETE'
                        }
                    });
                },
                getAllCampaigns: function () {
                    var def = $q.defer();
                    this.api().get({}, {}, function (data) {
                        angular.forEach(data.data, function(dat){
                            dat.message_android=JSON.parse(dat.message_android);
                        });
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                getCampaign: function(id){
                    var def = $q.defer();
                    this.api(id).get({}, {}, function (data) {
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                getCampaignReady: function(id){
                    var def = $q.defer();
                    this.api(id+'/Ready').get({}, {}, function (data) {
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                shot: function(id){
                    var def = $q.defer();
                    this.api(id+'/Shot').get({}, {}, function (data) {
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                submitCampaign: function (name,segments,msg_apple,msg_android,date_send,statusCheckbox) {
                    var def = $q.defer();
                    var seg = [];
                    segments.forEach(function(segment,key){
                        if (segment) {
                            seg.push(key);
                        }
                    });
                    var postData = {
                        name:name,
                        segments:seg,
                        message_apple:msg_apple,
                        message_android:JSON.stringify(msg_android),
                        date_send:date_send,
                        is_draft: statusCheckbox.is_draft,
                        is_test: statusCheckbox.is_test
                    };
                    this.api().save({}, postData, function (data) {
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                saveCampaign: function (id,name,segments,msg_apple,msg_android,date_send,statusCheckbox) {
                    var def = $q.defer();
                    var seg = [];
                    segments.forEach(function(segment,key){
                        if (segment) {
                            seg.push(key);
                        }
                    });
                    var postData = {
                        name:name,
                        segments:seg,
                        message_apple:msg_apple,
                        message_android: JSON.stringify(msg_android),
                        date_send:date_send,
                        is_draft: statusCheckbox.is_draft,
                        is_test: statusCheckbox.is_test
                    };
                    this.api(id).put({}, postData, function (data) {
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                deleteCampaign: function(id){
                    var def = $q.defer();
                    this.api(id).delete({}, {}, function (data) {
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                duplicateCampaign: function(id){
                    var def = $q.defer();
                    this.api(id + '/duplicate').get({}, {}, function (data) {
                        $log.warn('Api::data::Duplicating id: '+id);
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                }
            };
        }]);



