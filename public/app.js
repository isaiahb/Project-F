//ngMessages for form validation
var myApp = angular.module("myApp", ["ngRoute"]);
myApp.run(["$rootScope", "$location", "$http", function($rootScope, $location, $http) {
	console.log("myApp.run ran");
    $http.get('/api/confirm-login').success(function(user) {
		$rootScope.user = user;
		if (!user) {
			$location.path("/login");
		}
	});
}]);

var checkRouting = ["$q", "$rootScope", "$location", "$http", function ($q, $rootScope, $location, $http) {
	console.log("checking routing");
    if ($rootScope.user) {
        return true; 
    } else {
        var deferred = $q.defer();
        $http.get("/api/confirm-login")
        .success(function (user) { 
			if (user) {
				$rootScope.user = user;
				deferred.resolve(true);
			} else {
				deferred.reject();
				$location.path("/login");
			}
		})
		.error(function () {
			deferred.reject();
			$location.path("/login");
		});
		return deferred.promise;
	}
}];

myApp.config(["$routeProvider", function($routeProvider) {
	$routeProvider
	.when("/login/", {
		templateUrl: "views/login.html",
		controller: "loginController"
	})
	.when("/signup/", {
		templateUrl: "views/signup.html",
		controller: "signupController"
	})
	.when("/", {
		templateUrl: "views/workouts.html",
		controller: "homeController",
		resolve: {factory: checkRouting}
	})	
	.when("/profile/", {
		templateUrl: "views/signup.html",
		controller: "secondController",
		resolve: {factory: checkRouting}
	})
	.when("/newWorkout", {
		templateUrl: "views/workouts.html",
		controller: "workoutsController",
		resolve: {factory: checkRouting}
	});
}]); 

myApp.controller("homeController", ["$scope" , "$log", function($scope, $log) {
	$scope.workouts = [{name:"suns out guns out"}, {name:"here comes the boom"}, {name:"the gun show"}];

}]);
myApp.controller("signupController", ["$scope", "$rootScope", "$log", "$http", "$location", function($scope, $rootScope, $log, $http, $location) {
	if ($rootScope.user) {
		$location.path("/");
	}
	$scope.email = "";
	$scope.password = "";
	$scope.submit = function() {  
		$log.log("submited - email:" + $scope.email + ", pass:" + $scope.password); 
		$http.post("/api/signup", {email:$scope.email, password:$scope.password})
        .success(function (response) {
			$rootScope.user = response.user;
			$log.log("nice you create an account, not start tracking your gains bro");
			$location.path("/");
		})
			.error(function () {
				$scope.message = "that email is already being used bro";
		}); 
	}
	 
}]);
myApp.controller("loginController", ["$scope", "$rootScope", "$log", "$http", "$location", function($scope, $rootScope, $log, $http, $location) {
	if ($rootScope.user) {
		$location.path("/");
	}
	$scope.email = "";
	$scope.password = "";
	$scope.submit = function() {  
		$log.log("submited - email:" + $scope.email + ", pass:" + $scope.password); 
		$http.post("/api/login", {email:$scope.email, password:$scope.password})
        .success(function (response) {
			$rootScope.user = response.user;
			$log.log("welcome back, i hope you returned with more gains then you have before");
			$location.path("/");
		})
			.error(function () {
				$scope.message = "incorect email or password";
		});
	}

}]);

myApp.controller("secondController", ["$scope" , "$log", "$routeParams", function($scope, $log, $routeParams) {
	$scope.num = $routeParams.num || "";
}]);
