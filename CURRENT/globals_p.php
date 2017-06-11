<?php
	// Initially, each server function request should go through the gateway. Block a request if this isn't true.
	if(!$properAccess){ exit("Access denied"); };

	// Have we already went through all this??
	if( ! $globalsSet ){
		$globalsSet = true;
		$dt5_app = "Online Uzebox Player";

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
		if( $_SERVER['SERVER_NAME'] == "dev2-nicksen782.c9users.io" ){
			// This IS the dev environment.
			$devenvironment=true;

			// Load my debugger.
			require_once("/home/ubuntu/workspace/web/ACTIVE/dt5/index_p.php");
			// if( file_exists( "dt5/index_p.php" )){ include_once("dt5/index_p.php"); }
			// else                                 { function tattle5(){ return "This is a placeholder for tattle5."; } }
		}
		else{
			// This is NOT the dev environment.
			$devenvironment=false;

			// Create blank function for tattle5 just incase I left some still active in the code.
			if( file_exists( "dt5/index_p.php" )){ include_once("dt5/index_p.php"); }
			else                                 { function tattle5(){ return "This is a placeholder for tattle5."; } }

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