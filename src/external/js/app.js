(function($, window, undefined){

    FastClick.attach(document.body);

    /** Tapestry Completed */

    $('body').bind('tapestry.completed', function(){

        APP.init()
    });


    /**
     * Initializes your JS
     */


    var APP = {

        init: function(){

        	// iCheck
        	$('input.custom-checkbox, input.custom-radio').iCheck({
        		checkboxClass: 'custom-checkbox',
        		radioClass: 'custom-radio'
        	});

        	// Chosen
        	$('select.custom-select').each(function() {
        		$(this).chosen({
	        		disable_search_threshold: 20
	        	});
        	});

        	$(document).foundation();


        }
    }


})(jQuery, window)
