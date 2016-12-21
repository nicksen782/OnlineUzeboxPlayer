<?php

// DONE!
function getGameList(){
	// List all files in the game database. Provide separate responses for SD and non-SD games.
	// Prepares this query.
	$eud_db = $GLOBALS['eud_db'];
	// file_get_contents($eud_db)
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");

	// SQL delete query.
	$statement_SQL = '
	SELECT
	"id"
	, "title"
	, "lastupload"
	, "validheader"
	, "uses_sd"
	, "complete"
	-- , "authors"
	-- , "description"
	-- , "addedby"
	-- , "binhash"
	-- , "gamefile"
	-- , "gamedir"

	FROM "games"
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
	// List all files in the game database. Provide separate responses for SD and non-SD games.
	// Prepares this query.
	$eud_db = $GLOBALS['eud_db'];
	// file_get_contents($eud_db)
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");

	// SQL delete query.
	$statement_SQL = '
		SELECT
	  "id"
	, "title"
	, "lastupload"
	, "validheader"
	, "uses_sd"
	, "gamefile"
	, "gamedir"
	-- , "authors"
	-- , "description"
	-- , "addedby"
	-- , "binhash"

	FROM "games"
	WHERE id = :id
	;';

	// Prepare, bind placeholders, then execute the SQL query.
	$dbhandle->prepare($statement_SQL);
	// trigger_error("prepare". json_encode($dbhandle, JSON_PRETTY_PRINT), E_USER_ERROR);
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
	$iframehtml = liveEditEmu($dataFilesObj);

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
// Used by 'loadGame()'
function liveEditEmu($dataFilesObj){
  $cuzebox_extra = file_get_contents("js/cuzebox_extra.js");

  // Load, edit, send the cuzebox.html file.
  $cuzeboxhtml = file_get_contents("cuzebox_minimal.html");

//   $script0_tofind=
//   "<script type=\"text/javascript\">

//       var Module = {
//         canvas: (function() {
//           return document.getElementById('canvas');
//         })(),
//       };

//       (function() {
//         var memoryInitializer = 'cuzebox.html.mem';
//         var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
//         xhr.open('GET', memoryInitializer, true);
//         xhr.responseType = 'arraybuffer';
//         xhr.send(null);
//       })();

//       var script = document.createElement('script');
//       script.src = \"cuzebox.js\";
//       document.body.appendChild(script);

//     </script>";
	$script0_tofind=base64_decode("PHNjcmlwdCB0eXBlPSJ0ZXh0L2phdmFzY3JpcHQiPgoKICAgICAgdmFyIE1vZHVsZSA9IHsKICAgICAgICBjYW52YXM6IChmdW5jdGlvbigpIHsKICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7CiAgICAgICAgfSkoKSwKICAgICAgfTsKCiAgICAgIChmdW5jdGlvbigpIHsKICAgICAgICB2YXIgbWVtb3J5SW5pdGlhbGl6ZXIgPSAnY3V6ZWJveC5odG1sLm1lbSc7CiAgICAgICAgdmFyIHhociA9IE1vZHVsZVsnbWVtb3J5SW5pdGlhbGl6ZXJSZXF1ZXN0J10gPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTsKICAgICAgICB4aHIub3BlbignR0VUJywgbWVtb3J5SW5pdGlhbGl6ZXIsIHRydWUpOwogICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInOwogICAgICAgIHhoci5zZW5kKG51bGwpOwogICAgICB9KSgpOwoKICAgICAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpOwogICAgICBzY3JpcHQuc3JjID0gImN1emVib3guanMiOwogICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7CgogICAgPC9zY3JpcHQ+");

  $script0_toreplace=
  "
  <!-- Added/Replaced by system -->
  <style>
	html{overflow:hidden;}
	body{overflow:hidden;}
  </style>
  <!-- Setup the filesystem-->
  <script>

	<!-- Cuzebox Extra-->
	var script = document.createElement('script');
	script.src = \"js/cuzebox_extra.js\";
	document.body.appendChild(script);

	// Get file list.
	var filelist    =".json_encode(($dataFilesObj['datafiles']), JSON_PRETTY_PRINT).";
	var currentgame ='".$dataFilesObj['title']."';
	var uzerom      ='".$dataFilesObj['uzerom']."';

	// Configure Module
	var Module = {
	  arguments : ['".$dataFilesObj['uzerom']."'],
	  preInit   : [function(){extras_preInit(filelist, uzerom);}],
	  //preRun  : [function(){extras_preInit(filelist, uzerom);}],
	  postRun   : [function(){extras_postRun(currentgame, uzerom);}],
	  print: (function() {
		  var element = document.getElementById('output');
		  if (element) element.value = ''; // clear browser cache
		  return function(text) {
			if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
			// These replacements are necessary if you render to raw HTML
			console.log(text);
			if (element) {
			  element.value += text + \" \\n \";
			  element.scrollTop = element.scrollHeight; // focus on bottom
			}
		  };
		})(),
		printErr: function(text) {
		  if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
		  if (0) { // XXX disabled for safety typeof dump == 'function') {
			dump(text + '\\n'); // fast, straight to the real console
		  } else {
			console.error(text);
		  }
		},
	  canvas    : (function() { return document.getElementById('canvas'); })(),
	};

  <!-- cuzebox.js-->
	var script = document.createElement('script');
	script.src = \"cuzebox.js\";
	document.body.appendChild(script);

  <!-- mem stuff-->
  window.onload=function(){
	(function() {
	  var memoryInitializer = 'cuzebox.html.mem';
	  if (typeof Module['locateFile'] === 'function') {
		memoryInitializer = Module['locateFile'](memoryInitializer);
	  } else if (Module['memoryInitializerPrefixURL']) {
		memoryInitializer = Module['memoryInitializerPrefixURL'] + memoryInitializer;
	  }
	  var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
	  xhr.open('GET', memoryInitializer, true);
	  xhr.responseType = 'arraybuffer';
	  xhr.send(null);
	})();
  };
  </script>
  ";

  $cuzeboxhtml = str_replace($script0_tofind, $script0_toreplace, $cuzeboxhtml);

  // Send the modified page.
  return $cuzeboxhtml;
}

//
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
	, "title"
	, "lastupload"
	, "validheader"
	, "uses_sd"
	, "authors"
	, "description"
	, "addedby"
	, "gamefile"
	, "gamedir"
	, "complete"
	-- , "binhash"

	FROM "games"

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

// INSERT INTO "games" ("id","title","authors","description","lastupload","addedby","validheader","binhash","gamefile","uses_sd","gamedir") VALUES (NULL,'Alter Ego','Lee Weber','','12/16/2016 00:06','manual','1','','ae.uze','1','games/AlterEgo/')
// UPDATE "games" SET "id"='485', "title"='Alter Ego', "authors"='Lee Weber', "description"='', "lastupload"='12/16/2016 00:06', "addedby"='manual', "validheader"='1', "binhash"='', "gamefile"='ae.uze', "uses_sd"='1', "gamedir"='games/AlterEgo/' WHERE "rowid" = 485
// DONE!
function updateGameInfo(){
	// Prepares this query.
	$eud_db = $GLOBALS['eud_db'];
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");

	// SQL delete query.
	$statement_SQL = '
	UPDATE "games"
	  SET
		 -- "id"          = :id
		-- ,
		  "title"       = :title
		, "authors"     = :authors
		, "description" = :description
		, "lastupload"  = :lastupload
		, "addedby"     = :addedby
		, "validheader" = :validheader
		, "binhash"     = :binhash
		, "gamefile"    = :gamefile
		, "uses_sd"     = :uses_sd
		, "gamedir"     = :gamedir
		, "complete"    = :complete
	WHERE "id" = :id
	;';

	// Prepare, bind placeholders, then execute the SQL query.
	$dbhandle->prepare($statement_SQL);
		$dbhandle->bind(':title',       $_POST['title']);
		$dbhandle->bind(':authors',     $_POST['authors']);
		$dbhandle->bind(':description', $_POST['description']);
		$dbhandle->bind(':lastupload',  $_POST['lastupload']);
		$dbhandle->bind(':addedby',     $_POST['addedby']);
		$dbhandle->bind(':validheader', $_POST['validheader']);
		$dbhandle->bind(':binhash',     $_POST['binhash']);
		$dbhandle->bind(':gamefile',    $_POST['gamefile']);
		$dbhandle->bind(':uses_sd',     $_POST['uses_sd']);
		$dbhandle->bind(':gamedir',     $_POST['gamedir']);
		$dbhandle->bind(':complete',    $_POST['complete']);
		$dbhandle->bind(':id',          $_POST['id']);
	$retval_execute1 = $dbhandle->execute();

	// Fetch the records.
// 	$result = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	tattle5("i want data!", $retval_execute1);
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
			"gamedir"
		FROM "games"
		WHERE "id" = :id
	;';
	$dbhandle->prepare($statement_SQL);
	$dbhandle->bind(':id',       $_POST['gameid']);
	$retval_execute1 = $dbhandle->execute();
	$result = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	// Use the games dir as the starting file path that all files will be relative to.
	$targetpath=getcwd()."/".$result[0]["gamedir"];

	// List of allowed extensions.
	$allowedEXTs = array("uze", "hex", "dat", "bin", "lvl");

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
		, "lastupload"
		, "validheader"
		, "uses_sd"
		, "authors"
		, "description"
		, "addedby"
		-- , "binhash"
		, "gamefile"
		, "gamedir"
		FROM "games"
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

//
function newGameRecord(){
	// This just creates a new record with nothing in it other than it's new id. The user will need to edit and save the data after this function is used.

	$eud_db = $GLOBALS['eud_db'];
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");
	$statement_SQL = '
		INSERT INTO "games" (
			-- "id",
			"title",
			"addedby",
			"lastupload",
			"gamedir",
			"validheader",
			"complete"
		)
		VALUES (
			-- NULL,
			:title,
			"Game DB Manager",
			CURRENT_TIMESTAMP,
			:gamedir,
			"0",
			"0"
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
	@mkdir($gamedir2, 0700);

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

