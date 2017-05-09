angular.module('geolocationService', [])
    .factory('geolocationService', ['$q', '$window', function ($q, $window) {
        'use strict';
        var _location = [];
        var _cityLocations = {
            barcelona: [41.390205, 2.154007],
            madrid: [40.415363, -3.707398]
        };

        function init() {
            getPosition().then(function(locationData) {
                if (angular.isDefined(locationData.coords.latitude) && angular.isDefined(locationData.coords.longitude)){
                    _location = [locationData.coords.latitude, locationData.coords.longitude];
                }
            });
        }

        init();

        function getPosition() {
            var deferred = $q.defer();

            if (!$window.navigator.geolocation) {
                deferred.reject('Geolocation not supported.');
            } else {
                $window.navigator.geolocation.getCurrentPosition(
                    function (position) {
                        deferred.resolve(position);
                    },
                    function (err) {
                        deferred.reject(err);
                    });
            }

            return deferred.promise;
        }

        function calcDistance(lat1, lon1, lat2, lon2) {
            var R = 6371; // km
            var dLat = toRad(lat2-lat1);
            var dLon = toRad(lon2-lon1);
            lat1 = toRad(lat1);
            lat2 = toRad(lat2);

            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c;
            return d;
        }

        function toRad(Value) {
            return Value * Math.PI / 180;
        }

        return {
            getNearestCity: function () {
                if (_location.length === 0){
                    return _cityLocations.barcelona;
                }
                var distToBarcelona = calcDistance(_cityLocations.barcelona[0], _cityLocations.barcelona[1], _location[0], _location[1]);
                var distToMadrid = calcDistance(_cityLocations.madrid[0], _cityLocations.madrid[1], _location[0], _location[1]);
                if (distToBarcelona < distToMadrid) {
                    return _cityLocations.barcelona;
                }
                else {
                    return _cityLocations.madrid;
                }
            },
            getCityLocations: function () {
                return _cityLocations;
            }
        };
    }]);