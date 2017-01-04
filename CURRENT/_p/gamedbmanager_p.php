<?php
// tattle5("i got here1", null);
// DONE!
function getGameList(){
// tattle5("i got here2", null);
	// List all files in the game database. Provide separate responses for SD and non-SD games.
	// Prepares this query.
	$eud_db = $GLOBALS['eud_db'];
	// file_get_contents($eud_db)
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");

	$statement_SQL = '
	SELECT
	  "id"
	, "title"
	, "when_added"
	, "status"

	FROM "gamelist"
	ORDER BY "title" ASC
	;';

	// Prepare, bind placeholders, then execute the SQL query.
	$dbhandle->prepare($statement_SQL);
	// trigger_error("prepare". json_encode($dbhandle, JSON_PRETTY_PRINT), E_USER_ERROR);
		// $dbhandle->bind(':id', $_POST['id']);
	$retval_execute1 = $dbhandle->execute();

	// Fetch the records.
	$result = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	// Output the data.
	echo json_encode(
		array(
			"retval_execute1" => $retval_execute1,
			"result"=>$result
		)
	);
}

// DONE!
function loadGame(){
	// Prepares this query.
	$eud_db = $GLOBALS['eud_db'];
	// file_get_contents($eud_db)
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");

	// SQL delete query.
	$statement_SQL = '
	SELECT
	  "id"
	, "title"
	, "gamefile"
	, "gamedir"

	FROM "gamelist"
	WHERE id = :id
	;';

	// Prepare, bind placeholders, then execute the SQL query.
	$dbhandle->prepare($statement_SQL);
	// trigger_error("prepare". json_encode($dbhandle, JSON_PRETTY_PRINT), E_USER_ERROR);
		$dbhandle->bind(':id', $_POST['game']);
	$retval_execute1 = $dbhandle->execute();

	// Fetch the records.
	$result = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;
	if(!sizeof($result)){ exit(); }
  // Now get a list of the files that are within the game's directory.
  $directory = $result[0]['gamedir'];
  $scanned_directory = array_values(array_diff(scandir($directory), array('..', '.', '.git')));
  // $scanned_directory = array_values(array_diff(scandir($directory), array()));

  // Gather only the directory names.
  $filelist = array();
  for($i=0; $i<sizeof($scanned_directory); $i++){
	if( ! is_dir($directory.'/'.$scanned_directory[$i]) ){
		array_unshift($filelist,
			[ "filename"=>$scanned_directory[$i], "completefilepath"=>$directory.''.$scanned_directory[$i] ]
		);

	}
  }

	$dataFilesObj = [
	  "title"=>$result[0]['title'],
	  "uzerom"=> $result[0]['gamefile'],
	  "datafiles"=>$filelist,
	];

	// Get the HTML that will be put into the iframe.
	$filelistType = 1;
	$iframehtml = liveEditEmu($dataFilesObj, $filelistType);

	// Output the data.
	echo json_encode(
		array(
			"iframehtml"  	=> $iframehtml,
			"count"   	  	=> sizeof($result),
			"dataFilesObj"  => $dataFilesObj
		)
	);

}

// DONE!
function loadUserGameIntoEmu(){
	// $_POST['gamefile'];

	// Get the HTML that will be put into the iframe.
	$filelistType = 2;
	$iframehtml = liveEditEmu(null, $filelistType);

	// Output the data.
	echo json_encode(
		array(
			"iframehtml"  	=> $iframehtml,
			"count"   	  	=> sizeof($result),
			"dataFilesObj"  => $dataFilesObj
		)
	);
}

// DONE!
function loadUserGameIntoEmu2(){
	// $_POST['gamefile'];

	// Get the HTML that will be put into the iframe.
	$filelistType = 3;
	$iframehtml = liveEditEmu(null, $filelistType);

	// Output the data.
	echo json_encode(
		array(
			"iframehtml"  	=> $iframehtml,
			"count"   	  	=> sizeof($result),
			"dataFilesObj"  => $dataFilesObj
		)
	);
}


// DONE!
function liveEditEmu($dataFilesObj, $filelistType){
  // Load, edit, send the cuzebox.html file.
  $cuzeboxhtml = file_get_contents("cuzebox_minimal.html");

// Original script text
$script0_tofind = "<script type='text/javascript' >var REPLACEME;</script>";

  $script0_toreplace=
  "
  <!-- Added/Replaced by system -->
  <style>
	html{overflow:hidden;}
	body{overflow:hidden;}
  </style>

  <!-- Setup the filesystem-->
  <script>
";

if($filelistType==1){
	$script0_toreplace.=
	"
		// SERVER SUPPLILED GAME, CHOSEN BY USER.
		var filelist    = ".json_encode(($dataFilesObj['datafiles']), JSON_PRETTY_PRINT).";
		var currentgame = \"".$dataFilesObj['title']."\";
		var uzerom      = \"".$dataFilesObj['uzerom']."\";
		var arguments   = \"".$dataFilesObj['uzerom']."\";
		var filelistType= \"". $filelistType ."\";
	";
}
else if($filelistType==2){
	$script0_toreplace.=
	"
	// USER SUPPLIED FILELIST.
		var filelist    = [] ;
		var currentgame = \"". $_POST['gamefile'] ."\";
		var uzerom      = \"". $_POST['gamefile'] ."\";
		var arguments   = \"". $_POST['gamefile'] ."\";
		var filelistType= \"". $filelistType ."\";
	";
}

else if($filelistType==3){
	$script0_toreplace.=
	"
	// REMOTE FILELIST.
		var filelist    = [] ;
		var currentgame = \"". $_POST['gamefile'] ."\";
		var uzerom      = \"". $_POST['gamefile'] ."\";
		var arguments   = \"". $_POST['gamefile'] ."\";
		var filelistType= \"". $filelistType ."\";
	";
}


$script0_toreplace.=
	"
	// Cuzebox Extra
	var script = document.createElement('script');
	script.src = \"js/cuzebox_extra.js\";
	document.body.appendChild(script);

  </script>
  ";

  $cuzeboxhtml = str_replace($script0_tofind, $script0_toreplace, $cuzeboxhtml);

  // Send the modified page.
  return $cuzeboxhtml;
}

// DONE!
function loadGame_intoManager(){
	// List all files in the game database.

	// Prepares this query.
	$eud_db = $GLOBALS['eud_db'];
	// file_get_contents($eud_db)
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");

	// SQL delete query.
	$statement_SQL = '
	SELECT
	 "id"
	,"title"
	,"authors"
	,"description"
	,"when_added"
	,"added_by"
	,"gamedir"
	,"gamefile"
	,"status"

	FROM "gamelist"

	WHERE id = :id
	;';
	// Prepare, bind placeholders, then execute the SQL query.
	$dbhandle->prepare($statement_SQL);
		$dbhandle->bind(':id', $_POST['game']);
	$retval_execute1 = $dbhandle->execute();

	// Fetch the records.
	$result = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	// Now get a list of the files that are within the game's directory.
	$directory = $result[0]['gamedir'];
	$scanned_directory = array_values(array_diff(scandir($directory), array('..', '.', '.git')));
	// $scanned_directory = array_values(array_diff(scandir($directory), array()));

	// Gather only the directory names.
	$filelist = array();
	for($i=0; $i<sizeof($scanned_directory); $i++){
		if( ! is_dir($directory.'/'.$scanned_directory[$i]) ){
			array_unshift($filelist, $scanned_directory[$i]);
		}
	}

	$output =
		array(
			"retval_execute1" => $retval_execute1,
			"result"          => $result[0],
			"result2"         => $result,
			"filelist"        => $filelist
		);

	// Output the data.
	echo json_encode( $output );

}

// DONE!
function updateGameInfo(){
	// Prepares this query.
	$eud_db = $GLOBALS['eud_db'];
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");

	$statement_SQL = '
	UPDATE "gamelist"
	  SET
		  "title"       = :title
		, "authors"     = :authors
		, "description" = :description
		, "gamefile"    = :gamefile
		, "status"      = :status
		-- , "id"          = :id
		-- , "when_added"  = :when_added
		-- , "added_by"    = :added_by
		-- , "gamedir"     = :gamedir
	WHERE "id" = :id
	;';

	// Prepare, bind placeholders, then execute the SQL query.
	$dbhandle->prepare($statement_SQL);
		$dbhandle->bind(':title',       $_POST['title']);
		$dbhandle->bind(':authors',     $_POST['authors']);
		$dbhandle->bind(':description', $_POST['description']);
		$dbhandle->bind(':gamefile',    $_POST['gamefile']);
		$dbhandle->bind(':status',      $_POST['status']);
		$dbhandle->bind(':id',          $_POST['id']);
		// $dbhandle->bind(':when_added',  $_POST['when_added']);
		// $dbhandle->bind(':added_by',    $_POST['added_by']);
		// $dbhandle->bind(':gamedir',     $_POST['gamedir']);
	$retval_execute1 = $dbhandle->execute();

	// Fetch the records.
// 	$result = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	// Output the data.
	echo json_encode(
		array(
			"retval_execute1" => $retval_execute1,
			"result"=>$result[0]
		)
	);

}

// DONE!
function newFileUpload(){
	// Add the file(s) to the game dir.

	// First, get the game dir.
	$eud_db = $GLOBALS['eud_db'];
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");
	$statement_SQL = '
		SELECT
			  "id"
			, "gamedir"
		FROM "gamelist"
		WHERE "id" = :id
	;';
	$dbhandle->prepare($statement_SQL);
	$dbhandle->bind(':id',       $_POST['gameid']);
	$retval_execute1 = $dbhandle->execute();
	$result = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	// Use the games dir as the starting file path that all files will be relative to.
	$targetpath=getcwd()."/".$result[0]["gamedir"];

	// List of allowed extensions.
	$allowedEXTs = array("UZE", "uze", "HEX", "hex", "DAT", "dat", "bin", "lvl", "mid", "midi", "mp3", "umm", "ger", "eng");

	// Go through the filelist. Check file extensions. Move files.
	foreach($_FILES as $key => $value) {
		$extension = strtolower(pathinfo($_FILES[$key]['name'])["extension"]);
		if (in_array($extension, $allowedEXTs)) {
			$moved[$key] = move_uploaded_file( $_FILES[$key]['tmp_name'], $targetpath . "" . basename($_FILES[$key]['name']) );
		}
	}


	// Get the data from loadGame_intoManager, parse it, and return it as well.
	$_POST['game'] = $_POST['gameid'];
	ob_start();
	loadGame_intoManager();
	$res = ob_get_contents();
	ob_end_clean();
	$res=json_decode($res, true);
	$gamedata = $res["result"];
	$filelist = $res["filelist"];

	$output =
		array(
			"retval_execute1" => $retval_execute1,
			"retval_execute2" => $retval_execute2,
			"success"=>true,
			"gamedata"=>$gamedata,
			"filelist"=>$filelist,
			"success"=>$retval_execute1,
			"moved"=>$moved
		);

	// Output the data.
	echo json_encode( $output );
}

// DONE!
function removeGameFile(){
  // We are passed the game id and the filename.
  // Only delete a file within the game dir.
  // Filename must be found within the game dir.
  // All deletes are relative to the games directory. '..' and other insecure junk should be ignored.

	// First, get the game dir.
	$eud_db = $GLOBALS['eud_db'];
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");
	$statement_SQL = '
		SELECT
		"id"
		, "title"
		, "gamefile"
		, "gamedir"
		FROM "gamelist"
		WHERE "id" = :id
	;';
	$dbhandle->prepare($statement_SQL);
	$dbhandle->bind(':id',       $_POST['gameid']);
	$retval_execute1 = $dbhandle->execute();
	$result = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	// Use the games dir as the starting file path that all files will be relative to.
	$targetpath=getcwd()."/".$result[0]["gamedir"];

	// We DON'T want a true on this.
	// $string = "#this isatest.ttt";

	unlink($targetpath.basename($_POST['filename']));


  // Now get a list of the files that are within the game's directory.
  $directory = $result[0]['gamedir'];
  $scanned_directory = array_values(array_diff(scandir($directory), array('..', '.', '.git')));
  // $scanned_directory = array_values(array_diff(scandir($directory), array()));

  // Gather only the directory names.
  $filelist = array();
  for($i=0; $i<sizeof($scanned_directory); $i++){
	if( ! is_dir($directory.'/'.$scanned_directory[$i]) ){
		array_unshift($filelist, $scanned_directory[$i]);
	}
  }

  // Output the data.
	echo json_encode(
		array(
			"retval_execute1" => $retval_execute1,
			"result"=>$result[0],
			"success"=>true,
			"gamedata"=>$result[0],
			"filelist"=>$filelist
		)
	);
}

// DONE!
function newGameRecord(){
	// This just creates a new record with nothing in it other than it's new id. The user will need to edit and save the data after this function is used.

	$eud_db = $GLOBALS['eud_db'];
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");
	$statement_SQL = '
		INSERT INTO "gamelist" (
			 "title"
			, "added_by"
			, "when_added"
			, "gamedir"
		)
		VALUES (
			  :title
			, "Game DB Manager"
			, CURRENT_TIMESTAMP
			, :gamedir
		)
	';
	$gamedir="games/".basename($_POST['gamedir'])."/";
	$stmt1 =$dbhandle->prepare($statement_SQL);
	$dbhandle->bind(':title',       $_POST['title']);
	$dbhandle->bind(':gamedir',     $gamedir);
	$retval_execute1 = $dbhandle->execute();

	if (!$stmt1) {
	    print_r($stmt1, true);
	}

	$statement_SQL = ' SELECT last_insert_rowid() as lastInsertId; ';
	$dbhandle->prepare($statement_SQL);
	$retval_execute2 = $dbhandle->execute();
	$lastInsertId = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;
	$lastInsertId = $lastInsertId[0]["lastInsertId"];

	// Make the new game dir.
	$gamedir2=getcwd()."/".$gamedir;
	@mkdir($gamedir2, 0755);

	// Get the data from loadGame_intoManager, parse it, and return it as well.
	$_POST['game'] = $lastInsertId;
	ob_start();
	loadGame_intoManager();
	$res = ob_get_contents();
	ob_end_clean();
	$res=json_decode($res, true);
	$gamedata = $res["result"];
	$filelist = $res["filelist"];

	$output =
		array(
			"retval_execute1" => $retval_execute1,
			"retval_execute2" => $retval_execute2,
			"success"=>true,
			"gamedata"=>$gamedata,
			"filelist"=>$filelist,
		);

	// Output the data.
	echo json_encode( $output );
}

?>

