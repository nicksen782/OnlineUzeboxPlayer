<?php $properAccess = true;require_once("globals_p.php"); ?>
<?php
	// Fail out if globals has failed somehow. -- Probably won't happen. This is here for completeness.
	if( ! $globalsSet ){ exit("Access has been denied"); }

	// This file has been broken down into grouped scripts
	require_once("_p/gamedbmanager_p.php");

	// Security/function check.
	$returnvalue = processClientRequest_O() ;

	// Return an error if an error occured.
	if( $returnvalue['error'] ){
		if($returnvalue['error_text'] == "Unauthorized."){
			echo json_encode(array(
				"unauthorized" => true,
				"error"        => "",
				"post"         => $_POST,
				"get"          => $_GET,
				"files"        => $_FILES,
				"returnvalue"  => $returnvalue,
			));
		}
		else{
			echo "error. " . $returnvalue['error_text'] . "<br>\n";
			echo "<pre>";
			echo "POST: " ; print_r($_POST)."\n\n";
			echo "GET: " ; print_r($_GET)."\n\n";
			echo "FILES: " ; print_r($_FILES)."\n\n";
			echo "returnvalue: " ; print_r($returnvalue)."\n\n";
			echo "</pre>";
		}
	}
	exit();

function processClientRequest_O(){
	// Get our previously obtained list of rights.
	// global $listOfRights;
	global $devenvironment;
	// These are the rights that are checked by this web application.
	// $eud_access = true; // ($listOfRights['pl_access']	? 1 : 0) ;
	$canRead  = 1; //$devenvironment ? 1 : 1 ;	// Anybody can read.
	$canWrite = $devenvironment ? 1 : 0 ;	// Writing is only allowed while in the dev environment.

	// Several 'o' values may be used. Each may require specific privelidges.
	// 'f' is function, 'a' is arguments, 'p' is permissions required.
	// EMULATOR (_p/gamedbmanager_p.php)
	$o_values["getGameList"]				= [ "func"=>"getGameList",				"args"=>[],		"perms"=>(($canRead) ? 1 : 0) ] ;
	$o_values["loadGame"]					= [ "func"=>"loadGame",					"args"=>[],		"perms"=>(($canRead) ? 1 : 0) ] ;
	$o_values["loadUserGameIntoEmu"]		= [ "func"=>"loadUserGameIntoEmu",		"args"=>[null],	"perms"=>(($canRead) ? 1 : 0) ] ;
	$o_values["loadUserGameIntoEmu2"]		= [ "func"=>"loadUserGameIntoEmu2",		"args"=>[null],	"perms"=>(($canRead) ? 1 : 0) ] ;
	$o_values["loadaAutoFilelistIntoEmu"]	= [ "func"=>"loadaAutoFilelistIntoEmu",	"args"=>[null],	"perms"=>(($canRead) ? 1 : 0) ] ;

	// GAME DATABASE MANAGER (_p/gamedbmanager_p.php)
	$o_values["loadGame_intoManager"]	= [ "func"=>"loadGame_intoManager",			"args"=>[],		"perms"=>(($canRead) ? 1 : 0) ] ;
	$o_values["updateGameInfo"]			= [ "func"=>"updateGameInfo",				"args"=>[],		"perms"=>(($canRead && $canWrite) ? 1 : 0) ] ;
	$o_values["newFileUpload"]			= [ "func"=>"newFileUpload",				"args"=>[],		"perms"=>(($canRead && $canWrite) ? 1 : 0) ] ;
	$o_values["removeGameFile"]			= [ "func"=>"removeGameFile",				"args"=>[],		"perms"=>(($canRead && $canWrite) ? 1 : 0) ] ;
	$o_values["newGameRecord"]			= [ "func"=>"newGameRecord",				"args"=>[],		"perms"=>(($canRead && $canWrite) ? 1 : 0) ] ;

	// Check if the 'o' value is valid.
	$valid_o = false;
	if( array_key_exists( $_POST['o'], $o_values ) ){ $valid_o=true; } ;

	$returnedResults = array( "error" => false, "error_text" => "", "valid_o" => "", "allowedToUse" => "" );

	// Is the 'o' value valid?
	if($valid_o){
		// The 'o' value exists. Are we allowed to use it?
		$allowedToUse	= $o_values[$_POST['o']]['perms'];	// Will return true/false.

		// Are we allowed to use this function?
		if($allowedToUse){
			// Shorthand for readability.
			$theFunction	= $o_values[ $_POST['o'] ]['func'];
			$theArgs		= $o_values[ $_POST['o'] ]['args'];

			call_user_func_array($theFunction, $theArgs);
			return true;
		}
		else {
			// Unauthorized.
			$returnedResults['o'] = $_POST['o'];
			$returnedResults['o_req'] = $o_values[ $_POST['o'] ];
			$returnedResults['error'] = true;
			$returnedResults['error_text'] = "Unauthorized.";
			$returnedResults['canRead'] = $canRead;
			$returnedResults['canWrite'] = $canWrite;
			$returnedResults['devenvironment'] = $devenvironment ? 1 : 0;
			$returnedResults['devenvironment2'] = $devenvironment;
			$returnedResults['SERVER_NAME'] = $_SERVER['SERVER_NAME'];
			return $returnedResults;
		}
	}
	else{
		// Not a valid 'o' value.
		$returnedResults['error'] = true;
		$returnedResults['error_text'] = "Invalid 'o' value.";
		return $returnedResults;
	}

}

?>