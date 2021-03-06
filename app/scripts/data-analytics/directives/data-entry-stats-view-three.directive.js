/* global angular */
/*
jshint -W003, -W026
*/
(function () {
    'use strict';

	angular
		.module('app.dataAnalytics')
		.directive('statsDataEntryStatsViewThree', directive);

	function directive() {
		return {
			restrict: "E",
			scope: {
				selectedLocations: '='
			},
			controller: dataEntryStatsViewOneController,
			link: dataEntryStatsViewOneLink,
			templateUrl: "views/data-analytics/data-entry-stats-view-three.html"
		};
	}

	dataEntryStatsViewOneController.$inject = ['$scope', '$rootScope', 'moment',
	'$state', '$filter', 'EtlRestService', 'DataEntryStatsHelpersService', 'SearchDataService'];

    function dataEntryStatsViewOneController($scope, $rootScope, moment,
	 $state, $filter, EtlRestService, helperService, SearchDataService) {
		//filter configurations
    $scope.reportSubType = 'by-provider-by-encounter-type';
    $scope.groupBy = "groupByProviderId,groupByEncounterTypeId";
		$scope.controls =
		'start-date,end-date,selected-encounter,selected-form,selected-provider';
		$scope.numberOfColumns = 6;

    $scope.getPatienList = function(cell) {
      $scope.groupBy = "groupByPatientId";
      $scope.reportSubType = 'patientList';
      // //params
      // console.log('Test testing cell value ', cell)
      var selected = [];
      selected.push({encounterTypeUuid:cell.value.encounter_type_uuid})
      $scope.selectedEncounterTypes = { selected: selected };

      var selectedProvider={selectedProvider:cell.value.provider_uuid};
      $scope.selectedProvider = selectedProvider;
      // $scope.selectedForms = { selected: [] };
      loadStatsFromServer();
      $state.go('admin.data-entry-statistics.patientlist');

    }

		//params
		$scope.selectedProvider = { selected: null };
		$scope.selectedEncounterTypes = { selected: [] };
		$scope.selectedForms = { selected: [] };
		$scope.startDate = moment().startOf('day').toDate();
		$scope.endDate = helperService.generateEndDate($scope.startDate, 7).toDate();


		//items
		$scope.groupedItems = [];
		$scope.unGroupedItems = [];
		$scope.columnHeaderRow = [];
		$scope.firstColumnItems = [];


		//params processors
		$scope.getSelectedLocations = helperService.getSelectedLocations;
		$scope.getSelectedEncounterTypes = helperService.getSelectedEncounterTypes;
		$scope.getSelectedForms = helperService.getSelectedForms;
		$rootScope.$on('dataEntryStatsLocationSelected',
		function () { $scope.needsRefresh = true; });

		//query etl functionality
		$scope.isBusy = false;
		$scope.needsRefresh = true;
		$scope.experiencedLoadingErrors = false;
		$scope.loadStatsFromServer = loadStatsFromServer;
		$scope.getProvider = getProvider;

		//grouping functionality
		$scope.extractUniqueElementsByProperty =
		helperService.extractUniqueElementsByProperty;
		$scope.groupByX_ThenByY = helperService.groupByX_ThenByY;
		$scope.findItemByXandY = helperService.findItemByXandY;

		activate();
		function activate() {
			//loadStatsFromServer();
		}

		//query etl functionality

		function loadStatsFromServer() {

			if ($scope.isBusy === true || $scope.startDate === null || $scope.startDate === undefined) {
				return;
			}

			$scope.experiencedLoadingErrors = false;
			$scope.isBusy = true;
			$scope.groupedItems = [];
			$scope.columnHeaderRow = [];
			$scope.firstColumnItems = [];
			$scope.unGroupedItems = [];

			var startDate =
			moment($scope.startDate).startOf('day').format('YYYY-MM-DDTHH:MM:SSZZ');
			console.log('Date data stats', startDate);

			var endDate =
			moment($scope.endDate).endOf('day').format('YYYY-MM-DDTHH:MM:SSZZ');
			console.log('Date data stats', endDate);

			console.log('locations data stats', $scope.selectedLocations);
			var locationUuids =
			helperService.getSelectedLocations($scope.selectedLocations);

			var encounterTypeUuids =
			helperService.getSelectedEncounterTypes($scope.selectedEncounterTypes);

			var formUuids =
			helperService.getSelectedForms($scope.selectedForms);

			var providerUuid =
			helperService.getSelectedProvider($scope.selectedProvider);

			EtlRestService.getDataEntryStatistics($scope.reportSubType,
				startDate, endDate, locationUuids, encounterTypeUuids, formUuids, providerUuid,
				undefined,$scope.groupBy,  onLoadStatsFromServerSuccess, onLoadStatsFromServerError);
		}

		function onLoadStatsFromServerSuccess(results) {
      // console.log('Called though', $scope.reportSubType)
			$scope.isBusy = false;
			$scope.needsRefresh = false;
			$scope.unGroupedItems = results.result;

      if ($scope.reportSubType === 'patientList') {
        //Build patient list
        $scope.patients = results.result;
        $rootScope.$broadcast("patient", $scope.patients);
        console.log('Data Entry Results ', $scope.patients)
        $scope.reportSubType = 'by-provider-by-encounter-type';
      }
			//process data here
			if ($scope.reportSubType !== 'patientList') processResults();
		}

		function onLoadStatsFromServerError(error) {
			$scope.isBusy = false;
			$scope.experiencedLoadingErrors = true;
			console.error('An error occured when fetching data', error);
		}


		function processResults() {
			$scope.columnHeaderRow =
			helperService.extractUniqueElementsByProperty($scope.unGroupedItems, 'encounter_type');
			$scope.firstColumnItems =
			helperService.extractUniqueElementsByProperty($scope.unGroupedItems, 'provider_id');
			$scope.groupedItems =
			helperService.groupByX_ThenByY($scope.columnHeaderRow, $scope.firstColumnItems,
				'encounter_type', 'provider_id', $scope.unGroupedItems, 'provider_uuid');
			for(var i = 0; i < $scope.groupedItems.length; i++){
				getProvider($scope.groupedItems[i]);
			}
		}
		//end etl functionality

		//resolvers
		function getProvider(item) {
			item.provider = 'loading provider...';
			SearchDataService.getProviderByProviderUuid(item.provider_uuid,
			function(provider){
				item.provider = provider.display();
			},
			function(error){
				item.provider = 'error loading provider..';
			});
		}

	}

	function dataEntryStatsViewOneLink(scope, element, attrs, vm) {
        // attrs.$observe('selectedLocations', onSelectedLocationsChanged);
        // function onSelectedLocationsChanged(newVal, oldVal) {
        //     if (newVal) {

        //     }
        // }
    }
})();
