<?php

//
chdir("..");

switch($_POST['o']){
	case    'getDb'   : { getDb  (); break; }
	case    'getData' : { getData(); break; }
	case    'getData2': { getData2(); break; }
	default           : {
		exit("ERROR");
		break;
	}
};

function getDb(){
	// If requested, blank the website and text fields. They wouldn't normally be seen in a production application.
	$NO_includeText_flag    = $_POST["includeText"]    == "true" ? false : true ;
	$NO_includeWebsite_flag = $_POST["includeWebsite"] == "true" ? false : true ;

	if( $NO_includeText_flag || $NO_includeWebsite_flag ){
		$json = json_decode( file_get_contents("featureLoader.json"), true );
		foreach($json as $key => $value){
			if($NO_includeText_flag   ){ $json[$key]["text"]    = ""; }
			if($NO_includeWebsite_flag){ $json[$key]["website"] = ""; }
		}
		echo json_encode($json);
	}

	// Just send the file if there was no request to blank those two fields.
	else{
		$json = file_get_contents("featureLoader.json");
		echo $json;
	}

}

function getData(){
	$json = json_decode( file_get_contents("featureLoader.json"), true );
	$missingReqs = $_POST['missingReqs'];
	$missingReqs = explode(",", $missingReqs);

	$urls = [];

	for($i=0; $i<sizeof($missingReqs); $i+=1){
		array_push( $urls, $json[ $missingReqs[$i] ]['url'] );
	}

	// Get each of the files and combine them into one text string to return.
	$fileText = "";
	for($i=0; $i<sizeof($urls); $i+=1){
		// _featureLoader
		$urls[$i] = str_replace('_featureLoader/', '', $urls[$i]);
		$content = file_get_contents( $urls[$i] );
		$fileText .= ""
			. "\r\n" . "// *** " . $missingReqs[$i] ." ***\r\n"
			. file_get_contents( $urls[$i] )
			. "\r\n"
			;
	}

	// Normalize.
	$fileText = str_replace("\r\n","\n",$fileText);

	// Convert to Windows line endings.
	$fileText = str_replace("\n","\r\n",$fileText);

	// Convert line endings to <br>.
	// $fileText = str_replace("\n","<br>",$fileText);

	echo $fileText;
}

function getData2(){
	$fileTextArray=[];
	$json = json_decode( file_get_contents("featureLoader.json"), true );
	$missingReqs = $_POST['missingReqs'];
	$missingReqs = explode(",", $missingReqs);

	$urls = [];

	for($i=0; $i<sizeof($missingReqs); $i+=1){
		array_push( $urls, $json[ $missingReqs[$i] ]['url'] );
	}

	// Get each of the files and combine them into one text string to return.
	$fileText = "";
	for($i=0; $i<sizeof($urls); $i+=1){
		// _featureLoader
		$urls[$i] = str_replace('_featureLoader/', '', $urls[$i]);
		$content = file_get_contents( $urls[$i] );

		// $fileText .= ""
		// 	. "\r\n" . "// *** " . $missingReqs[$i] ." ***\r\n"
		// 	. file_get_contents( $urls[$i] )
		// 	. "\r\n"
		// 	;

		$fileTextArray[$missingReqs[$i]] = file_get_contents( $urls[$i] );
	}

	// Normalize.
	$fileText = str_replace("\r\n","\n",$fileText);

	// Convert to Windows line endings.
	$fileText = str_replace("\n","\r\n",$fileText);

	// Convert line endings to <br>.
	// $fileText = str_replace("\n","<br>",$fileText);

	// echo $fileText;
	echo json_encode($fileTextArray);
}

?>