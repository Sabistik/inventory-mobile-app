
angular.module('inventory', ['ionic', 'inventory.controllers', 'inventory.services', 'ngCordova', 'angularMoment'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

    .state('app.products', {
      url: '/products',
      views: {
        'menuContent': {
          templateUrl: 'templates/products.html',
          controller: 'ProductsCtrl as vm'
        }
      }
    })
    .state('app.product', {
      url: '/products/:barcode',
      views: {
        'menuContent': {
          templateUrl: 'templates/product.html',
          controller: 'ProductCtrl as vm'
        }
      }
    })
    .state('app.dashboard', {
      url: '/dashboard',
      views: {
        'menuContent': {
          templateUrl: 'templates/dashboard.html',
          controller: 'DashboardCtrl'
        }
      }
    })

  .state('app.item', {
    url: '/item/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/item.html',
        controller: 'ItemCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/dashboard');
});


/*angular.module('inventory').config(function($httpProvider, $ionicLoading) {
    
    $httpProvider.interceptors.push(function ($ionicLoading) {
        return {
            request: function (config) {
                $ionicLoading.show({
                    template: 'Ładowanie...'
                });
                
                return config;
            },
            response: function (response) {
                $ionicLoading.hide();
                
                return response;
            }
        };
    });
    
});*/