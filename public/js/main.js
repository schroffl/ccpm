var module = angular.module('ccpm', [ ]); /* global angular */

module.controller('PackageController', function( $scope ) {
   
    $scope.iPP = 5; // itemsPerPage
    $scope.page = 1;
    
    $scope.list = [ ];
    
    $scope.searching = false;
   
    $scope.search = function( query ) {
        var xhttp = new XMLHttpRequest();
        
        query = query ? query : '';
        $scope.searchText = query;
        // $scope.searching = true;
    
        xhttp.onreadystatechange = function() {
            
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                
                try {
                    $scope.list = JSON.parse(xhttp.responseText);
                    $scope.page = 1;
                    // $scope.searching = false;
                } catch(err) {
                    // $scope.searching = false;
                    console.error(err);
                }

                $scope.$apply();
            }
        };
    
        xhttp.open('GET', '/registry/search?q=' + encodeURI(query) , true);
        xhttp.send();
    };
    
    $scope.setPage = function( page ) {
        $scope.page = page >= 1 && page <= $scope.getPageAmount() ? page : $scope.page;
    };
    
    $scope.getPageAmount = function() {
        return Math.ceil($scope.list.length / $scope.iPP);
    };

    $scope.search();
});