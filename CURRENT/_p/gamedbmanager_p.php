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
	// tattle5("does this work?", array(sizeof(file_get_contents('../eud.db')), shell_exec('ls -l'), shell_exec('ls *.db'), $GLOBALS['eud_db'], $eud_db ));
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

  // Comment out the auto-run part of the cuzebox.js file. Permanent.
  $cuzeboxjs = file_get_contents("cuzebox.js");
  $replacestr1 = 'memoryInitializer="cuzebox.html.mem";';
  $newstr1     = 'memoryInitializer="cuzebox.html.mem";';
  $cuzeboxjs = str_replace($replacestr1, $newstr1, $cuzeboxjs);

  // Load, edit, send the cuzebox.html file.
  $cuzeboxhtml = file_get_contents("cuzebox_minimal.html");

  $script0_tofind=
  "<script type=\"text/javascript\">

      var Module = {
        canvas: (function() {
          return document.getElementById('canvas');
        })(),
      };

      (function() {
        var memoryInitializer = 'cuzebox.html.mem';
        var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
        xhr.open('GET', memoryInitializer, true);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
      })();

      var script = document.createElement('script');
      script.src = \"cuzebox.js\";
      document.body.appendChild(script);

    </script>";

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
    ".$cuzebox_extra."

    // Get file list.
    var filelist=".json_encode(($dataFilesObj['datafiles']), JSON_PRETTY_PRINT).";
    var currentgame='".$dataFilesObj['title']."';
    var uzerom='".$dataFilesObj['uzerom']."';

    // Configure Module
    var Module = {
      arguments : ['".$dataFilesObj['uzerom']."'],
      preInit   : [function(){extras_preInit(filelist, uzerom);}],
      //preRun  : [function(){extras_preInit(filelist, uzerom);}],
      postRun   : [function(){extras_postRun(currentgame);}],
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
  ".$cuzeboxjs."

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

  // I do not like all messages being output to the dev console. Remove this feature.
  $annoyingCon1   = "            console.log(text);";
  $noannoyingCon1 = "//console.log(text);";
  $cuzeboxhtml = str_replace($annoyingCon1, $noannoyingCon1, $cuzeboxhtml);

  $annoyingCon2   = "<textarea id=\"output\" rows=\"8\"></textarea>";
  $noannoyingCon2 = "<!--<textarea id=\"output\" rows=\"8\"></textarea>-->";
  $cuzeboxhtml = str_replace($annoyingCon2, $noannoyingCon2, $cuzeboxhtml);

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
    -- , "binhash"
    , "gamefile"
    , "gamedir"

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

	// Output the data.
	echo json_encode(
		array(
			"retval_execute1" => $retval_execute1,
			"result"          => $result[0],
			"filelist"         => $filelist
		)
	);

}

// INSERT INTO "games" ("id","title","authors","description","lastupload","addedby","validheader","binhash","gamefile","uses_sd","gamedir") VALUES (NULL,'Alter Ego','Lee Weber','','12/16/2016 00:06','manual','1','','ae.uze','1','games/AlterEgo/')
// UPDATE "games" SET "id"='485', "title"='Alter Ego', "authors"='Lee Weber', "description"='', "lastupload"='12/16/2016 00:06', "addedby"='manual', "validheader"='1', "binhash"='', "gamefile"='ae.uze', "uses_sd"='1', "gamedir"='games/AlterEgo/' WHERE "rowid" = 485
// DONE!
function updateGameInfo(){
	// Prepares this query.
	$eud_db = $GLOBALS['eud_db'];
	// file_get_contents($eud_db)
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");

	// SQL delete query.
	$statement_SQL = '
    UPDATE "games"
      SET
         -- "id"          = :id
        -- ,
        "title"       = :title
        ,"authors"     = :authors
        ,"description" = :description
        ,"lastupload"  = :lastupload
        ,"addedby"     = :addedby
        ,"validheader" = :validheader
        ,"binhash"     = :binhash
        ,"gamefile"    = :gamefile
        ,"uses_sd"     = :uses_sd
        ,"gamedir"     = :gamedir
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
		$dbhandle->bind(':id',          $_POST['id']);
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



function newFileUpload(){
  tattle5("uploadfile", null);
}

?>

