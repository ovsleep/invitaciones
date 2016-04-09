'use strict';

var services = angular.module('Invitaciones.services', ['ngResource']);

services.factory('Guest', ['$resource', function ($resource) {
    return $resource('/api/backend/guests/list/:_id', { _id: '@_id' }, {
        saveAll: { method: 'POST', isArray: true, url: '/api/backend/guests/save-list' },
        saveConfirmed: { method: 'POST', isArray: false, url: '/api/backend/guests/save-list-confirmed' }
    });
}]);

services.factory('GuestLoader', ['Guest', '$route', '$q', function (Guest, $route, $q) {
    return function () {
        var delay = $q.defer();
        Guest.get({ id: $route.current.params.guestId }, function (guest) { delay.resolve(guest) }, function () {
            delay.reject('Poblemas obteniendo el guest ' + $route.current.params.guestId);
        });
        return delay.promise;
    }
}]);

services.service('GuestExporter', function GuestExporter($http) {
    this.export = function () {
        $http({
            url: '/api/backend/guests/export',
            method: 'GET',
            responseType: 'arraybuffer',
            headers: {
                'Content-type': 'application/json',
            }
        }).success(function (data, status, headers) {
            var octetStreamMime = 'application/octet-stream';
            var success = false;
            // Get the headers
            headers = headers();

            var date = new Date();
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
            var dd = date.getDate().toString();
            var ss = date.getSeconds().toString();
            //var filename = 'pedidos.' + yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]) + ss + '.csv'; // padding
            //Este es el cambio
            var filename = 'guests.csv'

            // Determine the content type from the header or default to "application/octet-stream"
            var contentType = headers['content-type'] || octetStreamMime;
            try {
                // Try using msSaveBlob if supported
                console.log("Trying saveBlob method ...");
                var blob = new Blob([data], { type: contentType });
                if (navigator.msSaveBlob)
                    navigator.msSaveBlob(blob, filename);
                else {
                    // Try using other saveBlob implementations, if available
                    var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
                    if (saveBlob === undefined) throw "Not supported";
                    saveBlob(blob, filename);
                }
                console.log("saveBlob succeeded");
                success = true;
            } catch (ex) {
                console.log("saveBlob method failed with the following exception:");
                console.log(ex);
            }

            if (!success) {
                // Get the blob url creator
                var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
                if (urlCreator) {
                    // Try to use a download link
                    var link = document.createElement('a');
                    if ('download' in link) {
                        // Try to simulate a click
                        try {
                            // Prepare a blob URL
                            console.log("Trying download link method with simulated click ...");
                            var blob = new Blob([data], { type: contentType });
                            var url = urlCreator.createObjectURL(blob);
                            link.setAttribute('href', url);

                            // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
                            link.setAttribute("download", filename);

                            // Simulate clicking the download link
                            var event = document.createEvent('MouseEvents');
                            event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                            link.dispatchEvent(event);
                            console.log("Download link method with simulated click succeeded");
                            success = true;

                        } catch (ex) {
                            console.log("Download link method with simulated click failed with the following exception:");
                            console.log(ex);
                        }
                    }

                    if (!success) {
                        // Fallback to window.location method
                        try {
                            // Prepare a blob URL
                            // Use application/octet-stream when using window.location to force download
                            console.log("Trying download link method with window.location ...");
                            var blob = new Blob([data], { type: octetStreamMime });
                            var url = urlCreator.createObjectURL(blob);
                            window.location = url;
                            console.log("Download link method with window.location succeeded");
                            success = true;
                        } catch (ex) {
                            console.log("Download link method with window.location failed with the following exception:");
                            console.log(ex);
                        }
                    }

                }
            }

            if (!success) {
                // Fallback to window.open method
                console.log("No methods worked for saving the arraybuffer, using last resort window.open");
                window.open(httpPath, '_blank', '');
            }
        }).error(function (data, status) {
            console.log("Request failed with status: " + status);
        });
    }
});

//services.factory('ProductByType', ['$resource', function ($resource) {
//    return $resource('/api/backend/products/listado/filtro/:type', { type: '@type' });
//}]);

//services.factory('ProductByTypeLoader', ['ProductByType', '$route', '$q', function (ProductByType, $route, $q) {
//    return function () {
//        var delay = $q.defer();
//        ProductByType.query({ type: $route.current.params.type }, function (product) { delay.resolve(product) }, function () {
//            delay.reject('Poblemas obteniendo los productos de tipo ' + $route.current.params.type);
//        });
//        return delay.promise;
//    }
//}]);

services.factory('MultiGuestLoader', ['Guest', '$q', function (Guest, $q) {
    return function () {
        var delay = $q.defer();
        Guest.query(function (guests) {
            delay.resolve(guests);
        }, function () {
            delay.reject('Problemas obteniendo los productos');
        });

        return delay.promise;
    }
}]);

services.factory('Status', ['$resource', function ($resource) {
    return $resource('/api/backend/guests/status', {});
}]);

//services.factory('Order', ['$resource', function ($resource) {
//    return $resource('/api/backend/orders/:_id', 
//        { _id: '@_id' }, 
//        { exportToCsv: { method: 'POST', isArray: true } });
//}]);

//services.factory('OrderByStatus', ['$resource', function ($resource) {
//    return $resource('/api/backend/orders/filter/:status', { type: '@status' });
//}]);

//services.factory('OrderExport', ['$resource', function ($resource) {
//    return $resource('/api/backend/orders/export', { _id: '@_id' }, { exportToCsv: { method: 'POST' } });
//}]);

//services.factory('OrderByStatusLoader', ['OrderByStatus', '$route', '$q', function (OrderByStatus, $route, $q) {
//    return function () {
//        var delay = $q.defer();
//        OrderByStatus.query({ status: $route.current.params.status }, function (product) { delay.resolve(product) }, function () {
//            delay.reject('Poblemas obteniendo las ordenes de tipo ' + $route.current.params.status);
//        });
//        return delay.promise;
//    }
//}]);

//services.factory('MultiOrderLoader', ['Order', '$q', function (Order, $q) {
//    return function () {
//        var delay = $q.defer();
//        Order.query(function (orders) {
//            delay.resolve(orders);
//        }, function () {
//            delay.reject('Problemas obteniendo los pedidos');
//        });

//        return delay.promise;
//    }
//}]);

//services.factory('User', ['$resource', function ($resource) {
//    return $resource('/api/backend/users/:_id', { _id: '@_id' }, {
//        saveAll: { method: 'POST' }
//    });
//}]);

//services.factory('MultiUserLoader', ['User', '$q', function (User, $q) {
//    return function () {
//        var delay = $q.defer();
//        User.query(function (users) {
//            delay.resolve(users);
//        }, function () {
//            delay.reject('Problemas obteniendo los usuarios');
//        });

//        return delay.promise;
//    }
//}]);



services.factory("authenticationSvc", ["$http","$q","$window",function ($http, $q, $window) {
    var userInfo;

    function login(userName, password) {
        var deferred = $q.defer();

        $http.post("/api/auth/backend-login", { usr: userName, pass: password })
            .then(function (result) {
                userInfo = {
                    accessToken: result.data.accessToken,
                    usr:{
                        name: result.data.usr,
                        email: result.data.email,
                        phone: result.data.phone,
                        address: result.data.address,
                        id: result.data.id
                    }
                };
                $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
                deferred.resolve(userInfo);
            }, function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }

    //function register(user) {
    //    var deferred = $q.defer();

    //    $http.post("/api/auth/register", { usr: user })
    //        .then(function (result) {
    //            userInfo = {
    //                accessToken: result.data.accessToken,
    //                userName: result.data.usr
    //            };
    //            $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
    //            deferred.resolve(userInfo);
    //        }, function (error) {
    //            deferred.reject(error);
    //        });

    //    return deferred.promise;
    //}

    function logout() {
        var deferred = $q.defer();

        $http({
            method: "POST",
            url: "/api/auth/logout",
            headers: {
                "access_token": userInfo.accessToken
            }
        }).then(function (result) {
            userInfo = null;
            $window.sessionStorage["userInfo"] = null;
            deferred.resolve(result);
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function getUserInfo() {
        return userInfo ? userInfo.usr : undefined;
    }

    function init() {
        if ($window.sessionStorage["userInfo"]) {
            userInfo = JSON.parse($window.sessionStorage["userInfo"]);
        }
    }
    init();

    return {
        //register: register,
        login: login,
        logout: logout,
        getUserInfo: getUserInfo
    };
}]);

services.factory('authInterceptorService', ['$q', '$location', '$window', function ($q, $location, $window) {

    function request(config) {

        config.headers = config.headers || {};

        if ($window.sessionStorage["userInfo"]) {
            var authData = JSON.parse($window.sessionStorage["userInfo"]);
            if (authData) {
                config.headers.Authorization = authData.accessToken;
            }
        }

        return config;
    }

    function responseError(rejection) {
        if (rejection.status === 401) {
            $location.path('/login');
        }
        return $q.reject(rejection);
    }

    return {
        request: request,
        responseError: responseError
    }
}]);