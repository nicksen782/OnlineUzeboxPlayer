<?php

// DONE!
function getGameList(){
	// List all files in the game database. Provide separate responses for SD and non-SD games.
	// Prepares this query.
	$eud_db = $GLOBALS['eud_db'];
	// file_get_contents($eud_db)
	// tattle5("does this work?", array(sizeof(file_get_contents('../eud.db')), shell_exec('ls -l'), shell_exec('ls *.db'), $GLOBALS['eud_db'], $eud_db ));
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");

	// SQL delete query.
	$statement_SQL = "
		SELECT * FROM games
	;";

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

function loadGame(){

	// List all files in the game database. Provide separate responses for SD and non-SD games.
	// Prepares this query.
	$eud_db = $GLOBALS['eud_db'];
	// file_get_contents($eud_db)
	// tattle5("does this work?", array(sizeof(file_get_contents('../eud.db')), shell_exec('ls -l'), shell_exec('ls *.db'), $GLOBALS['eud_db'], $eud_db ));
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or exit("cannot open the database");

	// SQL delete query.
	$statement_SQL = "
		SELECT id, title FROM games WHERE id = :id
	;";

	// Prepare, bind placeholders, then execute the SQL query.
	$dbhandle->prepare($statement_SQL);
	// trigger_error("prepare". json_encode($dbhandle, JSON_PRETTY_PRINT), E_USER_ERROR);
		$dbhandle->bind(':id', $_POST['game']);
	$retval_execute1 = $dbhandle->execute();

	// Fetch the records.
	$result = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	$gamefiles = array(
		"id"           => $result[0]['id'],
		"newname"      => $result[0]['title'].'.uze',
		"fullfilepath" => "games/".$result[0]['title']."/".$result[0]['title'].'.uze',
	) ;

	// Get the HTML that will be put into the iframe.
	$iframehtml = liveEditEmu($gamefiles);

	// Output the data.
	echo json_encode(
		array(
			"iframehtml"	=> $iframehtml,
			"count" 		=> sizeof($result)
		)
	);

  //$gamefiles = getGameFile( $game);
}

function liveEditEmu($gamefiles){
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
    // Get file list.
    var filelist=(".json_encode(array($gamefiles), JSON_PRETTY_PRINT).");
    var currentgame='".$gamefiles['fullfilepath']."';
    var currentgameid='".$gamefiles['id']."';

    <!-- Cuzebox Extra-->
    ".$cuzebox_extra."

    // Configure Module
    var Module = {
      arguments : ['".$gamefiles['newname']."'],
      preInit   : [function(){extras_preInit(filelist);}],
      //preRun  : [function(){extras_preInit(filelist);}],
      postRun   : [function(){extras_postRun(currentgame, currentgameid);}],
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
?>