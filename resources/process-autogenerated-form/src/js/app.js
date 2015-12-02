(function () {
    'use strict';

    /**
     * Polyfill for IE
     */
    if (!window.console) {
        window.console = {
            log: angular.noop,
            error: angular.noop,
            debug: angular.noop,
            warn: angular.noop
        };
    }

    if (!window.console.debug) {
        window.console.debug = window.console.log;
    }

    // Detect if the browser is IE... (we cannot detect IE10/11 with Paul Irish hack)
    if (window.navigator.userAgent.indexOf('IE') > -1) {
        document.body.className += ' isBrowser-ie'; // IE9 does not have classList API
    }

    var app = angular.module('autogeneratedForm', [
        'ui.bootstrap',
        'ngResource',
        'gettext',
        'org.bonita.common.resources',
        'ngUpload',
        'org.bonitasoft.services.i18n',
        'org.bonitasoft.common.filters.stringTemplater'
    ]);

    app.controller('MainCtrl', ['$scope', '$location', 'contractSrvc', 'urlParser', '$window', 'processAPI', 'i18nService', '$http', function ($scope, $location, contractSrvc, urlParser, $window, processAPI, i18nService, $http) {

        var processId = urlParser.getQueryStringParamValue('id');

        $scope.contract = {};
        $scope.dataToSend = {};
        $scope.parent = $scope.dataToSend;
        $scope.process = {};
        $scope.message = undefined;

        $scope.importUrl = '../API/formFileUpload';
        $scope.filename = '';

        $http({ method: 'GET', url: '../API/system/session/unusedId' })
            .success(function (data, status, headers) {
                $http.defaults.headers.common['X-Bonita-API-Token'] = headers('X-Bonita-API-Token');
                init();
            }
        );

        var init = function () {
            i18nService.then(function () {
                $scope.i18nLoaded = true;
            });

            contractSrvc.fetchContract(processId).then(function (result) {
                $scope.contract = result.data;
            });

            processAPI.get({id: processId}, function (result) {
                $scope.process = result;
            });
        };

        var jsonify = function (data) {
            var jsonified = {};
            for (var prop in data) {

                if ((typeof data[prop] === 'string') && ((data[prop].lastIndexOf('{', 0) === 0) || (data[prop].lastIndexOf('[', 0) === 0))) {
                    jsonified[prop] = angular.fromJson(data[prop]);
                } else {
                    jsonified[prop] = data[prop];
                }

            }
            return jsonified;
        };

        $scope.postData = function postData() {
            $scope.message = undefined;
            var jsonifiedDataToSend = jsonify($scope.dataToSend);
            contractSrvc.startProcess(processId, jsonifiedDataToSend).then(
                onPostSuccess, onPostError);
        };

        var onPostSuccess = function(response) {
            //if the form is displayed in an iframe
            if ($window.parent !== $window.self) {
                notifyParentFrame('success', response.status);
                //Add a confirmation message here in case the parent frame doesn't catch the postMessage
            } else {
                $window.location.assign('/bonita');
            }
        }

        var onPostError = function(response) {
            if ($window.parent !== $window.self) {
                notifyParentFrame('error', response.status);
            }
            $scope.message = response.data.explanations ? response.data.explanations : response.data.message;
        }
        
        function notifyParentFrame(message, status) {
            var dataToSend = {
                message:message,
                status:status,
                action:'Start process',
                targetUrlOnSuccess:'/bonita'
            };
            $window.parent.postMessage(JSON.stringify(dataToSend), '*');
        }

        $scope.isSimpleInput = function isSimpleInput(input) {
            return (input.inputs.length === 0);
        };

        $scope.isComplexInput = function isComplexInput(input) {
            return !($scope.isSimpleInput(input));
        };

        $scope.isMultipleInput = function isMultipleInput(input) {
            return (input.multiple);
        };

        $scope.isSingleInput = function isSingleInput(input) {
            return (!$scope.isMultipleInput(input));
        };

        /*
         $scope. = function (input) {
         return ($scope.);
         };
         */
        $scope.isComplexInput = function isComplexInput(input) {
            return (input.inputs.length > 0);
        };

        $scope.isFileInput = function isFileInput(input) {
            return (input.type === 'FILE');
        };

        $scope.isDateInput = function isDateInput(input) {
            return (input.type === 'DATE');
        };

        $scope.inputType2HTML = function inputType2HTML(input) {
            var result;

            if (input.type === 'INTEGER' || input.type === 'DECIMAL') {
                result = 'number';
            } else if (input.type === 'DATE') {
                result = 'text';
            } /*else if (input.type === 'BOOLEAN') {
             result = 'checkbox';
             } */ else {
                result = input.type;
            }

            return result;
        };
    }])
        .directive('fileInputAutoSubmit', function () {
            // Utility function to get the closest parent element with a given tag
            function getParentNodeByTagName(element, tagName) {
                element = angular.element(element);
                var parent = element.parent();
                tagName = tagName.toLowerCase();

                if (parent && parent[0].tagName.toLowerCase() === tagName) {
                    return parent;
                } else {
                    return !parent ? null : getParentNodeByTagName(parent, tagName);
                }
            }

            return {
                require: 'ngModel',
                link: function (scope, elem, attr, ngModel) {

                    function update(event) {
                        var filename = '';
                        if (event.target.files && event.target.files.length > 0) {
                            filename = event.target.files[0].name;
                        } else {
                            filename = event.target.value.match(/([^\\|\/]*)$/)[0];
                        }

                        scope.$apply(function () {
                            ngModel.$setViewValue(filename);
                            ngModel.$render();
                        });
                        var form = getParentNodeByTagName(elem, 'form');
                        form.triggerHandler('submit');
                        form[0].submit();
                    }

                    elem.on('change', update);

                    scope.$on('$destroy', function () {
                        elem.off('change', update);
                    });

                }
            };
        });


})();