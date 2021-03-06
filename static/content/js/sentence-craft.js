// Setup the angular module with our application
var app = angular.module('sentence_craft_app', []);

// Jinja and Angular Templates conflict with each other
// This allows for the use of {[<field>]} to resolve this conflict
app.config(['$interpolateProvider', function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[');
    $interpolateProvider.endSymbol(']}');
}]);

// Initialze the Data service used for making API Calls
app.service('dataService', function ($http) {
    // View Lexeme
    // Pass a POST request containing the tag list (a comma separated string)
    // Lexemes that are returned will contain all tags in the list
    this.view = function (tag_list, lexeme) {
        console.log(tag_list);
        return $http({
            url: '/view/',
            method: "GET",
            params: { 'tags': tag_list, 'type': lexeme }
        });
    }
    // Incomplete Lexeme
    // Pass a GET request to checkout an incomplete lexeme
    // for completion
    this.incomplete = function (lexeme) {
        return $http({
            url: '/incomplete/',
            method: "GET",
            params: { 'type': lexeme }
        });
    }

    // Start Lexeme
    // Pass a POST request containing the string starting_text
    // along with a comma separated string of tags
    this.start = function (start_text, tag_list, lexeme) {
        if (tag_list == '' || tag_list == undefined) {
            return $http({
                url: '/start/',
                method: "POST",
                data: $.param({ start: start_text, type: lexeme }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        }
        else {
            return $http({
                url: '/start/',
                method: "POST",
                data: $.param({ start: start_text, tags: tag_list, type: lexeme }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        }
    }

    // Continue Lexeme
    // Pass a POST request containing a string of the continuing text,
    // a string containing the key of the checked out Lexeme,
    // and a boolean complete_flag.
    // complete_flag is true when lexemes are completed and false when
    // they are continued.
    this.continueLex = function (continue_text, key_val, complete_flag, lexeme) {
        return $http({
            url: '/append/',
            method: "POST",
            data: $.param({ addition: continue_text, key: key_val, complete: complete_flag, type: lexeme }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    }
});

// The view control is responsible for handling the main functionality
// of the web application. The controller provides dynamic operations.
app.controller('view_controller', function ($scope, $http, $window, dataService) {
    // Shared AngularJS data model
    $scope.model = {
        start_text: '',             // text for starting a lexeme
        continue_text: '',          // text for continuing a lexeme
        tag_list: [],               // user inputted list of tags
        incomplete_lexeme: '',      // the entire incomplete lexeme
        previous_lexeme: '',        // a portion of the previous lexeme
        mode: 'sentence'            // the default mode is sentence mode
    };

    // Switches the active mode to sentence mode if the application
    // is not already running in sentence mode
    $scope.switch_sentence_mode = function () {
        $scope.model.mode = 'sentence';

        if ($scope.operation_type == 'ViewLexemeList') {
            $scope.operation_type = 'ViewLexemeList'
            $scope.view_lexeme_list_panel();
        }
        else if ($scope.operation_type == 'ContinueLexeme') {
            $scope.operation_type = 'ContinueLexeme';
            $scope.view_continue_list_panel();
        }
    };

    // Switch the active mode to paragraph mode if the application
    // is not already running in paragraph mode
    $scope.switch_paragraph_mode = function () {
        $scope.model.mode = 'paragraph';

        if ($scope.operation_type == 'ViewLexemeList') {
            $scope.operation_type = 'ViewLexemeList'
            $scope.view_lexeme_list_panel();
        }
        else if ($scope.operation_type == 'ContinueLexeme') {
            $scope.operation_type = 'ContinueLexeme';
            $scope.view_continue_list_panel();
        }
    };

    //Calls the appropraite switch mode function based on the current Lexeme mode
    $scope.switch_mode = function (switchmode) {
        $scope.clear_fields();
        if (switchmode == 'sentence') {
            $scope.switch_paragraph_mode();
        }
        else if (switchmode == 'paragraph') {
            $scope.switch_sentence_mode();
        }
    };

    // Remove a single tag from the list of dynamically generated tags
    // if any are present
    $scope.remove_tag = function () {
        if ($scope.model.tag_list.length > 0) {
            $scope.model.tag_list.pop();
            $(".add-tag").show();
        }
        if ($scope.model.tag_list.length === 0) {
            $(".remove-tag").hide();
        }
    };

    // Add a tag to the list of dynamically generated tags
    $scope.add_tag = function () {
        // initialze if no tags already exist
        if ($scope.model.tag_list.length == 0) {
            $scope.model.tag_list = [''];
            $(".remove-tag").show();
        }
        else {
            // Require that the tag fields contain text
            if ($scope.model.tag_list[($scope.model.tag_list.length - 1)] == '') {
                $window.alert("Please add the tag text!");
            }
                // Check that no more than 5 tags have been entered
            else if ($scope.model.tag_list.length < 5) {
                $scope.model.tag_list.push('');
            }
                // Prevent the user from adding more tags
            else {
                $window.alert("Maximum number of tags reached");
                $("#entry").focus();
                $(".add-tag").hide();
            }
        }
    };

    // Reset the displayed fields in the data model
    $scope.clear_fields = function () {
        $scope.model.start_text = '';
        $scope.model.continue_text = '';
        $scope.model.tag_list = [];
        $scope.model.previous_lexeme = '';
        $(".remove-tag").hide();
    }

    // Forward API continue sentence request to the data service
    $scope.continue_api_call = function (complete) {
        var key = $scope.model.incomplete_lexeme.key;
        var addition = $scope.model.continue_text;
        var lexType = $scope.get_lex_type();
        dataService.continueLex(addition, key, complete, lexType).then(function (data) {
            $scope.clear_fields();
            // Prompt the user to continue another lexeme
            $scope.operation_type = 'ContinueAnother';
        },
        function (response) {
            if (response.status === 400) {
                $scope.operation_type = 'InvalidContinue';
            }
            else if (response.status === 408) {
                $scope.operation_type = 'TimeOut';
            }
        });
    }

    // Forward API incomplete sentence request to the data service
    $scope.view_continue_list_panel = function () {
        $scope.clear_fields();
        $('.switchmode').removeClass('active');
        $('#continue').addClass('active');

        var lexType = $scope.get_lex_type();

        $scope.operation_type = 'ContinueLexeme';
        dataService.incomplete(lexType).then(function (response) {
            var to_complete = response.data;
            $scope.model.incomplete_lexeme = to_complete;
            // Get the last 3 lexemes from the lexeme collection
            var to_complete_lexemes = to_complete.lexemecollection.lexemes;
            var start = Math.max(to_complete_lexemes.length - 3, 0);
            for (var i = start; i < to_complete_lexemes.length; ++i) {
                $scope.model.previous_lexeme += to_complete_lexemes[i] + ' ';
            }
            $scope.model.tag_list = response.data.lexemecollection.tags;
            console.log($scope.model.tag_list);
        },
            function (data) {
                // Prompt the user that there are no more sentences to complete
                $scope.operation_type = 'NoneToComplete';
            });
    }

    // Prompt the user to start a new sentence
    $scope.view_start_new_lexeme_panel = function () {
        $scope.clear_fields();
        $('.switchmode').removeClass('active');
        $('#start').addClass('active');

        $scope.operation_type = 'StartNewLexeme';
        // kludge because we can't figure out how to make Angular wait until the
        // DOM is loaded before running the following code
        setTimeout(function () {
            $(".remove-tag").hide();
            $("#entry").focus();
        }, 30);
    }

    // Returns the type of Lexeme(Sentence/Paragraph)
    $scope.get_lex_type = function () {
        var lexType = '';
        if ($scope.model.mode === 'sentence') {
            lexType = 'word';
        }
        else if ($scope.model.mode === 'paragraph') {
            lexType = 'sentence';
        }
        return lexType;
    }

    // Display the 10 most recent sentences to the user
    // matching the tags list
    $scope.view_lexeme_list_panel = function () {
        //Clear all the unwanted fields only if the user switched from other operation (Start/Continue)
        if ($scope.operation_type != 'ViewLexemeList') {
            $scope.clear_fields();
        }

        $('.switchmode').removeClass('active');
        $('#view').addClass('active');

        // Show the list of lexemes to the user
        $scope.operation_type = 'ViewLexemeList';

        // Convert the tags to a string if they exist
        var tagList = [];
        if ($scope.model.tag_list != undefined) {
            console.log('Here!');
            tagList = $scope.model.tag_list.toString();
        }

        var lexType = $scope.get_lex_type();

        // Forward API view request to the data service
        dataService.view(tagList, lexType).then(function (response) {
            var data2 = response.data;
            var rep = [];
            $scope.model.lexemelist = [];

            if (data2.length === 0) {
                $scope.view_data = 'NoneToView';
                return;
            }

            //$scope.model.tag_list = data2.lexemecollection.tags;
            $scope.view_data = 'SomeToView';

            // Generate the list of lexemes
            for (var i = 0; i < data2.length; ++i) {
                var tmp = '';
                var lexemes = data2[i].lexemes;
                for (var j = 0; j < lexemes.length; ++j) {
                    tmp = tmp + lexemes[j] + ' ';
                }
                rep.push(tmp);
                var lexemelistobj = {};
                lexemelistobj.lexeme = tmp;
                lexemelistobj.tags = data2[i].tags;
                $scope.model.lexemelist.push(lexemelistobj);
            }
            $scope.data = rep;
            console.log($scope.model.lexemelist);
        },
        function (data) {
            $scope.view_data = 'NoneToView';
        })
    };

    // Forward API start behavior to the data service
    $scope.start_new_lexeme_api_call = function () {

        // Generate a string representation of the tags list
        var tag_list = '';
        if ($scope.model.tag_list != undefined) {
            tag_list = $scope.model.tag_list.toString();
        }
        var start_text = $scope.model.start_text;
        var lexType = $scope.get_lex_type();

        // Forward the API request to the data service
        dataService.start(start_text, tag_list, lexType).then(function (response) {
            $scope.clear_fields();
            $scope.operation_type = 'SuccessfulComplete';
        },
            function (data) {
                console.log(data);
                $scope.operation_type = 'FailedStart';
            })
    }
});

// Function that calls the switch_mode function when the toggle button is Clicked
$(function () {
    $('#chk-switch-mode').change(function () {
        angular.element('#view_controller').scope().$apply();
        console.log(this.checked);
        if (this.checked == false) {
            var switchmode = 'sentence';
        }
        else {
            var switchmode = 'paragraph';
        }
        angular.element('#view_controller').scope().switch_mode(switchmode);
    })
})