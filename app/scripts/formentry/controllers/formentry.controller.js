/*
jshint -W098, -W003, -W068, -W004, -W033, -W030, -W117, -W069, -W106
*/
/*jscs:disable disallowMixedSpacesAndTabs, requireDotNotation, requirePaddingNewLinesBeforeLineComments, requireTrailingComma*/

(function () {
    'use strict';

    angular
        .module('app.formentry')
        .controller('FormentryCtrl', FormentryCtrl);

    FormentryCtrl.$inject = ['$translate', 'dialogs', '$location',
        '$rootScope', '$stateParams', '$state', '$scope',
        'OpenmrsRestService', '$timeout', 'FormsMetaData', 'UtilService'
        , '$loading', '$anchorScroll', 'UserDefaultPropertiesService'
        , 'FormentryUtilService', 'configService', 'SearchDataService',
        '$log', 'FormEntry'
    ];

    function FormentryCtrl($translate, dialogs, $location,
        $rootScope, $stateParams, $state, $scope,
        OpenmrsRestService, $timeout, FormsMetaData,
        $loading, $anchorScroll, UserDefaultPropertiesService, FormentryUtilService,
        configService, SearchDataService, UtilService,
        $log, FormEntry) {
        var vm = $scope;
        
        //Patient variables
        vm.patient = $rootScope.broadcastPatient;
        
        //Form variables
        vm.model = {};
        vm.questionMap = {};
        vm.encounterType = '';
        var selectedFormMetadata;
        var selectedFormSchema;
        var selectedFormUuid;
        
        //Loaded encounter/visit variables
        var selectedEncounterUuid = $stateParams.encuuid;
        var currentVisitUuid = $stateParams.visitUuid;
        
        //Navigation parameters
        vm.hasClickedSubmit = false;
        vm.submitLabel = 'Save';
        vm.isBusy = false;


        activate();

        function activate() {
            $log.log('Initializing form entry controller..');
            
            //determine form to load
            determineFormToLoad();
            loadFormSchemaForSelectedForm(true);
        }
        
        //Region: Navigation functions
        
        //EndRegion: Navigation functions
        
        //Region: Form loading functions
        function loadFormSchemaForSelectedForm(createFormAfterLoading) {
            $log.log('Loading form schema for ' + selectedFormMetadata.name);
            FormsMetaData.getFormSchema(selectedFormMetadata.name,
                function (schema) {
                    selectedFormSchema = schema;
                    $log.info('Form schema loadded..', selectedFormSchema);
                    if (createFormAfterLoading){
                        createFormFromSchema();
                    }
                });
        }

        function determineFormToLoad() {
            if (selectedEncounterUuid !== undefined) {
                var encFormUuid = $scope.vm.encounter.formUuid();
                if (encFormUuid === undefined || encFormUuid === '') {
                    selectedFormUuid = $scope.vm.encounter.encounterTypeUuid();
                }
                selectedFormMetadata = FormsMetaData.getForm(encFormUuid);
                vm.encounterType = $scope.vm.encounter.encounterTypeName();
            } else {
                selectedFormMetadata = FormsMetaData.getForm($stateParams.formuuid);
                vm.encounterType = selectedFormMetadata.encounterTypeName;
            }
            $log.info('Form to load determined', selectedFormMetadata);
        }

        function createFormFromSchema() {
            $log.log('Creating form for loaded form schema');
            var formObject = FormEntry.createForm(selectedFormSchema, vm.model);
            var newForm = formObject.formlyForm;
            $log.debug('Created formly form...', newForm);
            vm.tabs = newForm;
            vm.questionMap = formObject.questionMap;
            $log.debug('Created question map', vm.questionMap);
        }
        
        //EndRegion: Form loading and creation functions
    }
})();
