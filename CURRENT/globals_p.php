<?php
	// Initially, each server function request should go through the gateway. Block a request if this isn't true.
	if(!$properAccess){ exit("Access denied"); };

	// Have we already went through all this??
	if( ! $globalsSet ){
		$globalsSet = true;
		// Configure error reporting
		error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT);
		ini_set('error_log', getcwd() . '/EUD_php-error.txt');
		ini_set('display_errors', true);
		date_default_timezone_set('America/Detroit');

		// Emscripten Uzebox Gamechanger DB
		$GLOBALS['eud_db'] = "sqlite:eud.db";

		// Database functions - sqlite
		require_once("_sysp/db_sqlite_p.php");

		// Detect if this is dev.
		if( $_SERVER['SERVER_NAME'] == "dev-nicksen782.c9.io" ){
			// This IS the dev environment.
			$devenvironment=true;

			// Load my debugger.
			$GLOBALS['dt5_db'] = "sqlite://home/ubuntu/workspace/web/ACTIVE/dt5/dt5.db";
			require_once("/home/ubuntu/workspace/web/ACTIVE/dt5/index_p.php");
			// tattle5("GLOBALS_P", "test?");
		}
		else{
			// This is NOT the dev environment.
			$devenvironment=false;

			function tattle5($arg1, $arg2){}

			// Bring in the common files.
			// require_once("../../index_p.php");

			// Act as authenticated if 'checkPasswordMatch is true.
			// Deny the rest of the page processing if you aren't authed.
			// if(!checkPasswordMatch()){ exit('You are not authorized.'); }
		}

	}
	else{
		// We have already been through the global setup.
		// Globals have already been set. Skip!
	}

	function global_vars(){
		$vars = array(

		);

	}
?>