app.controller('GuestsController', ['$scope', 'guests', 'Guest', '$http', 'GuestExporter',
    function ($scope, guests, Guest, $http, GuestExporter) {
        $scope.guests = guests;

        $scope.save = function (guests) {
            Guest.save(guests, function () {
                alert('Guardado!');
            });
        }

        $scope.saveAll = function () {
            Guest.saveAll($scope.guests, function () {
                alert('Guardado!')
            });
        }

        $scope.saveAllConfirmed = function () {
            Guest.saveConfirmed($scope.guests, function () {
                alert('Guardado!')
            });
        }

        $scope.export = function () {
            GuestExporter.export();
        }
    }]);