<?php //require_once("globals_p.php"); ?>

<?php

// Set some globals
$GLOBALS['uzeboxprojects'] = "/home/ubuntu/workspace/non-web/Uzebox/";

if ($_POST['o'] == 'getProjectNames')	{ getProjectNames(); 	exit(); }
if ($_POST['o'] == 'batchlist')			{ batchlist(); 			exit(); }
if ($_GET['o'] == 'batchlist')			{ batchlist(); 			exit(); }

echo "Invalid 'o' value. <pre>";
echo "\nPOST: " ; print_r($_POST);
echo "\nGET: " ; print_r($_GET);
echo "\nREQUEST: " ; print_r($_REQUEST);
echo "INPUT1: " ; print_r($_INPUT);
echo "\nINPUT2: " ; print_r($INPUT);
echo "\nFILES: " ; print_r($_FILES);
echo "</pre>";

function OLDgetProjectNames(){
	$listofroms = file_get_contents("listofroms.json");
	$listofroms = json_decode($listofroms, true);

	echo json_encode(array('projectnames' => $listofroms), JSON_PRETTY_PRINT);
}

function getProjectNames(){
	// Clear stat cache.
	clearstatcache();

	// Navigate to start directory
	$directory = 'games_nonsd/';
	// chdir($directory);
	exec('find games_nonsd/*.uze  -printf "%f\n"', $inputUze_files);

	$gamelist = array();

	for($i=0; $i<sizeof($inputUze_files); $i++){
		array_push( $gamelist, array("valid"=>1, "newname"=>$inputUze_files[$i], "fullfilepath"=>"games_nonsd/".$inputUze_files[$i]) );
	}

	echo json_encode(array('projectnames' => $gamelist), JSON_PRETTY_PRINT);
}
?>