(function() {
  'use strict';

  angular.module('application', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
  ])
  .controller('FilmsCtrl', function($scope, $state, $http){
    $scope = genericController($scope, $state, $http, 'films', 'film');
  })
  .controller('SpeciesCtrl', function($scope, $state, $http){
    $scope = genericController($scope, $state, $http, 'species', 'specie');
  })
  .controller('PlanetsCtrl', function($scope, $state, $http){
    $scope = genericController($scope, $state, $http, 'planets', 'planet');
  })
  .controller('PeopleCtrl', function($scope, $state, $http){
    $scope = genericController($scope, $state, $http, 'people', 'person');
  })
  .controller('StarshipsCtrl', function($scope, $state, $http){
    $scope = genericController($scope, $state, $http, 'starships', 'starship');
  })
  .controller('VehiclesCtrl', function($scope, $state, $http){
    $scope = genericController($scope, $state, $http, 'vehicles', 'vehicle');
  })
  .directive("getProp", ['$http', '$filter', function($http, $filter) {
    return {
      template: "{{property}}",
      scope: {
        prop: "=",
        url: "="
      },
      link: function(scope, element, attrs) {
        // Use Aerobatic's caching if we're on that server
        var urlApi = scope.url,
          queryParams = {
            cache: true
          };

        if (window.location.hostname.match('aerobaticapp')) {
          queryParams = {
            params: {
              url: urlApi,
              cache: 1,
              ttl: 30000 // cache for 500 minutes
            }
          }
          urlApi = '/proxy';
        }

        var capitalize = $filter('capitalize');
        $http.get(urlApi, queryParams).then(function(result) {
          scope.property = capitalize(result.data[scope.prop]);
        }, function(err) {
          scope.property = "Unknown";
        });
      }
    }
  }])
  .filter('capitalize', function() {
    return function (input) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1)}) : '';
    }
  })
  .filter('lastdir', function () {
    return function (input) {
      return (!!input) ? input.split('/').slice(-2, -1)[0] : '';
    }
  })
    .config(config)
    .run(run)
  ;

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function config($urlProvider, $locationProvider) {
    $urlProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled:true,
      requireBase: true
    });

    $locationProvider.hashPrefix('!');
  }

  function run() {
    FastClick.attach(document.body);
  }

  function genericController($scope, $state, $http, multiple, single){

    // Grab URL parameters
    $scope.id = ($state.params.id || '');
    $scope.page = ($state.params.p || 1);

    // Use Aerobatic's caching if we're on that server
    var urlApi = "http://swapi.co/api/"+multiple+"/"+$scope.id+"?page="+$scope.page,
      queryParams = {
        cache: true
      };

    if (window.location.hostname.match('aerobaticapp')) {
      queryParams = {
        params: {
          url: urlApi,
          cache: 1,
          ttl: 30000 // cache for 500 minutes
        }
      }
      urlApi = '/proxy';
    }

    if ($scope.page == 1) {
      if ($scope.id != '') {
        // We've got a URL parameter, so let's get the single entity's data
        $http.get(urlApi, queryParams)
          .success(function(data) {
            // The HTTP GET only works if it's referencing an ng-repeat'ed array for some reason...
            if (data.homeworld) data.homeworld = [data.homeworld];

            $scope[single] = data;

            var name = data.name;
            if (single == 'film') name = data.title;
            // Get an image from a Google Custom Search (this API key only works on localhost & aerobaticapp.com)
            var googleUrl = 'https://www.googleapis.com/customsearch/v1?cx=001000040755652345309%3Aosltt3fexvk&q='+encodeURIComponent(name)+'&imgSize=large&num=1&fileType=jpg&key=AIzaSyBDvUGYCJfOyTNoJzk-5P9vE-dllx-Wne4',
              googleParams = { cache: true };

            if (window.location.hostname.match('aerobaticapp')) {
              googleParams = {
                params: {
                  url: googleUrl,
                  cache: 1,
                  ttl: 300000 // cache for 5000 minutes
                }
              }
              googleUrl = '/proxy';
            }

            $http.get(googleUrl, googleParams)
            .then(function(result) {
              $scope.imageUrl = result.data.items[0].pagemap.cse_image[0].src;
            }, function(err) {
              $scope.imageUrl = "Unknown";
            });
          })

      } else {
        // We're on page 1, so thet next page is 2.
        $http.get(urlApi, queryParams)
        .success(function(data) {
          $scope[multiple] = data;
          if (data['next']) $scope.nextPage = 2;
        });
      }
    } else {
      // If there's a next page, let's add it. Otherwise just add the previous page button.
      $http.get(urlApi, queryParams)
      .success(function(data) {
        $scope[multiple] = data;
        if (data['next']) $scope.nextPage = 1*$scope.page + 1;
      });
      $scope.prevPage = 1*$scope.page - 1;
    }
    return $scope;

  }

})();
