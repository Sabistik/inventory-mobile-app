

angular.module('inventory.services', []);


angular.module('inventory.services').factory('Product', function($http, $q, $ionicPopup, $ionicLoading) {
    
    var host = 'http://inventory.sokar.pl';
    var path = '/api';
    var resource = '/product';
    
    var getApiUrl = function() {
        return host + path + resource;
    };
    
    var showErrorInfo = function() {
        $ionicPopup.alert({
            title: 'Błąd!',
            template: 'API zwróciło błąd!'
        });  
    };
    
    return {
        getAll: function() {
            
            $ionicLoading.show({template: 'Ładowanie...'});
            
            return $http.get(getApiUrl()).then(
                function(response) {
                    $ionicLoading.hide();
                    return response.data;
                },
                function(response) {
                    $ionicLoading.hide();
                    showErrorInfo();
                    
                    return $q.reject(response.status);
                }
            );
    
        },
        get: function(id) {
            
            $ionicLoading.show({template: 'Ładowanie...'});
            
            return $http.get(getApiUrl() + '/' + id).then(
                function(response) {
                    $ionicLoading.hide();
                    return response.data;
                },
                function(response) {
                    $ionicLoading.hide();
                    if(response.status === 500 ) {
                        showErrorInfo();
                    }
                    
                    return $q.reject(response.status);
                }
            );
        },
        getByBarcode: function(barcode) {
            
            $ionicLoading.show({template: 'Ładowanie...'});
            
            return $http.get(getApiUrl(), {params: {query: 'barcodeNumber:'+barcode}}).then(
                function(response) {
                    $ionicLoading.hide();
                    
                    if(response.data.length) {
                        return response.data[0];
                    }
                    
                    return $q.reject(404);
                },
                function(response) {
                    $ionicLoading.hide();
                    if(response.status === 500 ) {
                        showErrorInfo();
                    }
                    
                    return $q.reject(response.status);
                }
            );
        }
    };
});

angular.module('inventory.services').factory('Item', function($http, $q, $ionicPopup, $ionicLoading) {
    
    var host = 'http://inventory.sokar.pl';
    var path = '/api';
    var resource = '/item';
    
    var getApiUrl = function() {
        return host + path + resource;
    };
    
    var showErrorInfo = function() {
        $ionicPopup.alert({
            title: 'Błąd!',
            template: 'API zwróciło błąd!'
        });  
    };
    
    return {
        getAll: function(traits) {
            
            traits = traits || {};
            
            $ionicLoading.show({template: 'Ładowanie...'});
            
            return $http.get(getApiUrl(), {params: traits}).then(
                function(response) {
                    $ionicLoading.hide();
                    return response.data;
                },
                function(response) {
                    $ionicLoading.hide();
                    showErrorInfo();
                    
                    return $q.reject(response.status);
                }
            );
        }
    };
});