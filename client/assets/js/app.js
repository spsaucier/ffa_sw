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
        var capitalize = $filter('capitalize');
        $http.get(scope.url, { cache: true }).then(function(result) {
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

    if ($scope.page == 1) {
      if ($scope.id != '') {
        // We've got a URL parameter, so let's get the single entity's data
        $http.get("http://swapi.co/api/"+multiple+"/"+$scope.id, { cache: true })
          .success(function(data) {
            // The HTTP GET only works if it's referencing an ng-repeat'ed array for some reason...
            if (data.homeworld) data.homeworld = [data.homeworld];

            $scope[single] = data;
          })

      } else {
        // We're on page 1, so thet next page is 2.
        $http.get("http://swapi.co/api/"+multiple+"/", { cache: true }).success(function(data) {
          $scope[multiple] = data;
          if (data['next']) $scope.nextPage = 2;
        });
      }
    } else {
      // If there's a next page, let's add it. Otherwise just add the previous page button.
      $http.get("http://swapi.co/api/"+multiple+"/?page="+$scope.page, { cache: true }).success(function(data) {
        $scope[multiple] = data;
        if (data['next']) $scope.nextPage = 1*$scope.page + 1;
      });
      $scope.prevPage = 1*$scope.page - 1;
    }
    return $scope;

  }

})();
