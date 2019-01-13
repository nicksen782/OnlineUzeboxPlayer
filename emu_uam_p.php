<?php
if(!$securityLoadedFrom_indexp){ exit(); };
// UAM FUNCTIONS
// if(!$securityLoadedFrom_indexp){ exit(); };

// FINISHED
function gameman_manifest_user(){
	// $author_user_id = $_SESSION['user_id'];
	// $user_id        = $_SESSION['user_id'];

	$author_user_id = $_POST['user_id'];
	$user_id        = $_POST['user_id'];

	global $_appdir;
	global $_db;
	$dbhandle = new sqlite3_DB_PDO__UAM5($_db) or exit("cannot open the database");
	$s_SQL1  ="
SELECT
	  gameId
	, gameName
	, UAMdir
	, gamedir

	--, author_user_id
	--, author
	--, created
	--, last_update
FROM games_manifest
WHERE author_user_id = :author_user_id
ORDER BY last_update DESC
	;";
	$prp1    = $dbhandle->prepare($s_SQL1);
	$dbhandle->bind(':author_user_id' , $author_user_id ) ;
	$retval1 = $dbhandle->execute();
	$results1= $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	// Get the default UAM game for this user.
	$s_SQL2   = "SELECT default_uam_game FROM accounts WHERE user_id = :user_id LIMIT 1;";
	$prp2     = $dbhandle->prepare($s_SQL2);
	$dbhandle->bind(':user_id' , $user_id ) ;
	$retval2  = $dbhandle->execute();
	$results2 = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;
	if(sizeof($results2)){
		$results2=$results2[0]["default_uam_game"];
	}

	echo json_encode(array(
		'data'    => $results1 ,
		'success' => true      ,
		'defaultGame' => $results2 ,
	) );

	// audit_API_newRecord( $_SESSION['user_id'], $_SESSION['o_api'], $_SESSION['via_type'], 1, '' );
}
function compile_UamGame(){
	// We should have a game id. Use it to get the record for the game and then grab the gamedir.
	// $gameId         = $_POST['gameId'];
	// $author_user_id = $_SESSION['user_id'];
	$gameId         = $_POST['gameId'];
	$author_user_id = $_POST['user_id'];

	global $_appdir;
	global $_db;
	$dbhandle = new sqlite3_DB_PDO__UAM5($_db) or exit("cannot open the database");
	$s_SQL1  ="
SELECT
	  UAMdir
	, gamedir
FROM games_manifest
WHERE
	gameId         = :gameId
	AND
	author_user_id = :author_user_id
	;";
	$prp1    = $dbhandle->prepare($s_SQL1);
	$dbhandle->bind(':gameId'         , $gameId         ) ;
	$dbhandle->bind(':author_user_id' , $author_user_id ) ;
	$retval1 = $dbhandle->execute();
	$results1= $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	// Do the compile and process some debug data.
	$path = $_SERVER['DOCUMENT_ROOT'].'/'.$results1[0]['gamedir'].'/'.'build_files' ;
	if( ! file_exists( $path ) ) { $error="Compile path does not exist.";     }
	else                         { chdir( $path  ); }

	$buildCommand = "make";
	// file_put_contents( ('avr-nm.txt'), '... LOADING ...' );
	$execResults = shell_exec($buildCommand . " 2>&1" );

	// Get the info file (special parsing to remove blank lines.)
	// $info = shell_exec("cat lastbuild.txt | sed '/^\s*$/d' 2>&1");

	// Get the info file (special parsing to remove blank lines.)
	$cflow = shell_exec("cat cflow.txt 2>&1");

	// One more thing, strip out all lines that do NOT contain a certain string.
	function makeObj_avrnm(){
		// Look for this string within all the lines of the file.
		$theString = getcwd().'/../src/';
		$bss_objects          = array() ;
		$text_funcs           = array() ;
		$text_objects         = array() ;
		$text_objects_progmem = array() ;
		$other                = array() ;

		$bytes_in_bss_objects          = 0 ;
		$bytes_in_text_funcs           = 0 ;
		$bytes_in_text_objects         = 0 ;
		$bytes_in_text_objects_progmem = 0 ;
		$bytes_in_other                = 0 ;

		$handle = fopen("avr-nm.txt", "r");
		if ($handle) {
			while (($line = fgets($handle)) !== false) {
				// process the line read.
				$pos = strpos($line, $theString);
				$pos2 = strpos($line, '_progmem');

					// Replace part of the string.
					$line = str_replace($theString, '|SRC_DIR->', $line);

					// Remove spaces.
					$line = str_replace(" ", '', $line);

					// Split this line into pieces on the "|".
					$splitLine = explode("|", $line);

					// Create new array for this line.
					$newArray = array(
						"name"    => trim($splitLine[0]),
						"value"   => trim($splitLine[1]),
						"class"   => trim($splitLine[2]),
						"type"    => trim($splitLine[3]),
						"size"    => trim($splitLine[4]),
						"section" => trim($splitLine[6]),
						"file"    => explode(":", trim($splitLine[7]))[0],
						"line"    => explode(":", trim($splitLine[7]))[1],
					);

					// Remove the leading zeros from the size key.
					$newArray['size'] = ltrim($newArray['size'], "0");

					if ( $pos === false ) {
						$splitLine2 = explode("/", $newArray['section']);
						$newArray['section'] = $splitLine2[sizeof($splitLine2)-1];
						array_push($other, $newArray) ;
						$bytes_in_other+=$newArray['size'];
					}
					else{
						if     ( $newArray['section']=='.bss'  ) {
							if( $newArray['type']=='OBJECT' ) { array_push($bss_objects  , $newArray) ; $bytes_in_bss_objects+=$newArray['size']; }
							else                              {
								$splitLine2 = explode("/", $newArray['section']);
								$newArray['section'] = $splitLine2[sizeof($splitLine2)-1];
								array_push($other, $newArray) ;
								$bytes_in_other+=$newArray['size'];
							}
						}
						else if( $newArray['section']=='.text'   ){
							if     ( $newArray['type']=='FUNC'   ){ array_push($text_funcs , $newArray) ; $bytes_in_text_funcs+=$newArray['size']; }
							else if( $newArray['type']=='OBJECT' ){
								// Progmem texts go into their own array.
								if($pos2 !== false) {
									array_push($text_objects_progmem , $newArray) ;
									$bytes_in_text_objects_progmem+=$newArray['size'];
								}
								else{
									array_push($text_objects , $newArray) ;
									$bytes_in_text_objects+=$newArray['size'];
								}
							}
							else {
								$splitLine2 = explode("/", $newArray['section']);
								$newArray['section'] = $splitLine2[sizeof($splitLine2)-1];
								// array_push($other, $newArray) ;
								$bytes_in_other+=$newArray['size'];
							}
						}
						else {
							$splitLine2 = explode("/", $newArray['section']);
							$newArray['section'] = $splitLine2[sizeof($splitLine2)-1];
							// array_push($other, $newArray) ;
							$bytes_in_other+=$newArray['size'];
						}
					}
			}

			fclose($handle);
		}
		else{
			// error opening the file.
			return array(
				'bss_objects'          => array( 'data'=>[] , 'caption'=> 'BSS: OBJECTS'          . " (" . number_format(0) . " bytes)", ) ,
				'text_funcs'           => array( 'data'=>[] , 'caption'=> 'TEXT: FUNCS'           . " (" . number_format(0) . " bytes)", ) ,
				'text_objects'         => array( 'data'=>[] , 'caption'=> 'TEXT: OBJECTS'         . " (" . number_format(0) . " bytes)", ) ,
				'text_objects_progmem' => array( 'data'=>[] , 'caption'=> 'TEXT: OBJECTS PROGMEM' . " (" . number_format(0) . " bytes)", ) ,
				'other'                => array( 'data'=>[] , 'caption'=> 'OTHER'                 . " (" . number_format(0) . " bytes)", ) ,
				// 'other'                => array( 'data'=>[]                   , 'caption'=> 'OTHER2'                 . " (" . number_format($bytes_in_other)                . " bytes)", ) ,
			);
		}

		// Sort by key in reverse. (Largest size first.)
		// function sortFunction($a, $b){ return strcmp($b['size'], $a['size']); }; // Alphabetical
		function sortFunction($a, $b){ return $b['size'] - $a['size']; }; // Numerical

		usort( $bss_objects         , sortFunction );
		usort( $text_funcs          , sortFunction );
		usort( $text_objects        , sortFunction );
		usort( $text_objects_progmem, sortFunction );
		usort( $other               , sortFunction );

		return array(
			'bss_objects'          => array( 'data'=>$bss_objects         , 'caption'=> 'BSS: OBJECTS'          . " (" . number_format($bytes_in_bss_objects)          . " bytes)", ) ,
			'text_funcs'           => array( 'data'=>$text_funcs          , 'caption'=> 'TEXT: FUNCS'           . " (" . number_format($bytes_in_text_funcs)           . " bytes)", ) ,
			'text_objects'         => array( 'data'=>$text_objects        , 'caption'=> 'TEXT: OBJECTS'         . " (" . number_format($bytes_in_text_objects)         . " bytes)", ) ,
			'text_objects_progmem' => array( 'data'=>$text_objects_progmem, 'caption'=> 'TEXT: OBJECTS PROGMEM' . " (" . number_format($bytes_in_text_objects_progmem) . " bytes)", ) ,
			'other'                => array( 'data'=>$other               , 'caption'=> 'OTHER'                 . " (" . number_format($bytes_in_other)                . " bytes)", ) ,
			// 'other'                => array( 'data'=>[]                   , 'caption'=> 'OTHER2'                 . " (" . number_format($bytes_in_other)                . " bytes)", ) ,
		);
	}

	$info2 = '';
	$info2 = makeObj_avrnm();

	// audit_API_newRecord( $_SESSION['user_id'], $_SESSION['o_api'], $_SESSION['via_type'], 1, $gameId );

	global $_appdir;
	global $_db;
	$dbhandle = new sqlite3_DB_PDO__EMU($_db) or exit("cannot open the database");
	$s_SQL1  ="
		SELECT
			(
				SELECT COUNT(pkey)
				FROM api_log
				WHERE info = :gameId AND o='compile_UamGame'
			) AS compileCount
			,(
				SELECT COUNT(pkey)
				FROM api_log
				WHERE info = :gameId AND o='c2bin_UamGame'
			) AS c2binCount
	";
	$prp1    = $dbhandle->prepare($s_SQL1);
	$dbhandle->bind(':gameId'        , $gameId        ) ;
	$retval1 = $dbhandle->execute();
	$results1 = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	$compileCount = $results1[0]['compileCount'];
	$c2binCount   = $results1[0]['c2binCount'];

	echo json_encode(array(
		'data'    => $results1 ,
		'success' => true      ,

		// '$_POST'     => $_POST       ,
		'json'       => $json        ,
		'error'      => $error       ,
		'execResults'=> $execResults ,
		'info'       => $info        ,
		'info2'      => $info2       ,
		'compileCount' => $compileCount       ,
		'c2binCount'   => $c2binCount       ,
		// 'cflow'      => htmlspecialchars($cflow)       ,
		'link1'      => $_SERVER['HTTP_HOST'].'/'.$results1[0]['gamedir'].'/'.'build_files'.'/cflow.pdf'       ,
		'link2'      => $_SERVER['HTTP_HOST'].'/'.$results1[0]['gamedir'].'/'.'build_files'.'/cflow.txt'       ,
		'link3'      => "",//$_SERVER['HTTP_HOST'].'/'.$results1[0]['gamedir'].'/'.'build_files'.'/lastbuild.txt'       ,
	) );

}

function getData_oneGame(){
	global $_appdir;
	// global $_db;
	$dbhandle = new sqlite3_DB_PDO__EMU($_appdir.'_sys/eud.db') or exit("cannot open the database");
	$gameid = intval($_POST['gameid']);
	$s_SQL1   =
'
SELECT
	  id
	, title
	, status
	, authors
	, when_added
	, description
	, added_by
	, gamedir
	, gamefile
	, gamefiles
FROM gamelist
WHERE id = :gameid
ORDER BY "title" ASC
;';
	$prp1     = $dbhandle->prepare($s_SQL1);
	$dbhandle->bind(':gameid' , $gameid ) ;
	$retval1  = $dbhandle->execute();
	$results1 = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;
	$thisGame = $results1[0];

	// Now, get the file names from the game's directory.
	$directory = $thisGame["gamedir"];
	$gameId    = $thisGame["id"];
	$title     = $thisGame["gameName"];

	// Scan the dir. Get the file names.
	$scanned_directory = array_values(
		array_diff(
			// scandir($_SERVER["DOCUMENT_ROOT"] . "/" . $directory
			scandir($_appdir . "/" . $directory
		)
		, array('..', '.', '.git')
		)
	);

	$fileList=[];

	for($ii=0; $ii<sizeof($scanned_directory); $ii++){
		// Don't include dirs.
		if( ! is_dir($_SERVER["DOCUMENT_ROOT"] . "/" . $directory.'/'.$scanned_directory[$ii]) ){
			array_push($fileList, $scanned_directory[$ii] );
		}
	}

	echo json_encode(array(
		'data'    => [
			"gameData"  => $thisGame,
			"gameFiles" => $fileList,
		] ,
		'success' => true      ,
	) );

	// audit_API_newRecord( $_SESSION['user_id'], $_SESSION['o_api'], $_SESSION['via_type'], 1, '' );
}

function gameDb_addFiles(){
	$gameid = intval($_POST['gameid']);

	global $_appdir;
	global $emu_dir;
	$dbhandle = new sqlite3_DB_PDO__EMU($_appdir.'_sys/eud.db') or exit("cannot open the database");
	$s_SQL1   =
"
SELECT
	  id
	, title
	, authors
	, status
	, description
	, when_added
	, added_by
	, gamedir
	, gamefile
	, gamefiles
FROM gamelist
WHERE id = :gameid
;";
	$prp1     = $dbhandle->prepare($s_SQL1);
	$dbhandle->bind(':gameid' , $gameid ) ;
	$retval1  = $dbhandle->execute();
	$results1 = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;
	$thisGame = $results1[0];

	$directory = $emu_dir . $thisGame['gamedir'];

	$targetpath=$directory."";

	foreach($_FILES as $key => $value) {
		$moved[$key] = move_uploaded_file(
			$_FILES[$key]['tmp_name'],
			$targetpath . "" . basename($_FILES[$key]['name'])
		);
	}

	// Get the game data and files. (Use output buffering.)
	ob_start();
	// This part likely is never going to be necessary but I wanted to make it clear that the function requires this value in POST and that it is populated.
	$_POST['gameid'] = $gameid;
	getData_oneGame();
	$gameData = json_decode( ob_get_contents(), true);
	ob_end_clean() ;

	echo json_encode(array(
		'data'        => array()   ,
		'success'     => true      ,
		'gameData'    => $gameData["data"]["gameData"] ,
		'gameFiles'   => $gameData["data"]["gameFiles"] ,
	) );
}
function gameDb_deleteFile(){
	$gameid   = intval($_POST['gameid']);
	$filename = $_POST['filename'];

	global $_appdir;
	global $emu_dir;
	$dbhandle = new sqlite3_DB_PDO__EMU($_appdir.'_sys/eud.db') or exit("cannot open the database");
	$s_SQL1   =
"
SELECT
	  id
	, title
	, authors
	, status
	, description
	, when_added
	, added_by
	, gamedir
	, gamefile
	, gamefiles
FROM gamelist
WHERE id = :gameid
;";

	$prp1     = $dbhandle->prepare($s_SQL1);
	$dbhandle->bind(':gameid' , $gameid ) ;
	$retval1  = $dbhandle->execute();
	$results1 = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;
	$thisGame = $results1[0];

	// Generate the full path.
	$directory = $emu_dir . $thisGame['gamedir'];

	// Generate the full path and filename.
	$target=$directory.basename($filename);

	// Delete the file.
	unlink($target);

	// Get the game data and files. (Use output buffering.)
	ob_start();
	// This part likely is never going to be necessary but I wanted to make it clear that the function requires this value in POST and that it is populated.
	$_POST['gameid'] = $gameid;
	getData_oneGame();
	$gameData = json_decode( ob_get_contents(), true);
	ob_end_clean() ;

	echo json_encode(array(
		'data'     => array()           ,
		'success'  => true              ,
		'gameData' => $gameData["data"]["gameData"] ,
		'gameFiles' => $gameData["data"]["gameFiles"] ,
	) );

}
function gameDb_updateGameData(){
	// JSON decode the newData
	$data=json_decode($_POST["data"], true);

	global $_appdir;
	global $_db;
	$dbhandle = new sqlite3_DB_PDO__EMU($_appdir.'_sys/eud.db') or exit("cannot open the database");
	$s_SQL1  =
"
UPDATE 'gamelist'
SET
	  title       = :title
	, authors     = :authors
	, description = :description
	, when_added  = :when_added
	, added_by    = :added_by
	, gamedir     = :gamedir
	, gamefile    = :gamefile
	, status      = :status
	, gamefiles   = :gamefiles
WHERE id = :gameid
;
";
	$prp1    = $dbhandle->prepare($s_SQL1);

	$dbhandle->bind(':title'       , $data['title']       ) ;
	$dbhandle->bind(':authors'     , $data['authors']     ) ;
	$dbhandle->bind(':description' , $data['description'] ) ;
	$dbhandle->bind(':when_added'  , $data['when_added']  ) ;
	$dbhandle->bind(':added_by'    , $data['added_by']    ) ;
	$dbhandle->bind(':gamedir'     , $data['gamedir']     ) ;
	$dbhandle->bind(':gamefile'    , $data['gamefile']    ) ;
	$dbhandle->bind(':status'      , $data['status']      ) ;
	$dbhandle->bind(':gamefiles'   , $data['gamefiles']   ) ;
	$dbhandle->bind(':gameid'      , $data['id']          ) ;

	$retval1 = $dbhandle->execute();

	echo json_encode(array(
		'data'    => $retval1 ,
		'data2'   => $data    ,
		'success' => true     ,
		'$_POST'  => $_POST   ,
		'$data'   => $data    ,
	) );
}
function gameDb_newGame(){
	global $_appdir;
	global $_db;
	global $emu_dir;
	$dbhandle = new sqlite3_DB_PDO__EMU($_appdir.'_sys/eud.db') or exit("cannot open the database");

// Create an entry for the game. Get the new game id.
	$s_SQL1  =
"
INSERT INTO gamelist(
	  title
	, authors
	, when_added
	, added_by
	, status
	, description
	, gamefile
	, gamefiles
)
VALUES(
      :title
	, :authors
	, CURRENT_TIMESTAMP
	, :added_by
	, :status
	, :description
	, :gamefile
	, :gamefiles
)
;
";
	$prp1    = $dbhandle->prepare($s_SQL1);

	$dbhandle->bind(':title'       , $_POST["title"]    ) ;
	$dbhandle->bind(':authors'     , ""                  ) ;
	$dbhandle->bind(':added_by'    , "Game DB Manager2b" ) ;
	$dbhandle->bind(':status'      , 0                   ) ;
	$dbhandle->bind(':description' , ""                  ) ;
	$dbhandle->bind(':gamefile'    , ""                  ) ;
	$dbhandle->bind(':gamefiles'   , '[]'                ) ;
	$retval1   = $dbhandle->execute();
	$newGameId = $dbhandle->dbh->lastInsertId();

	$gamedir = 'games/' . $newGameId . "_" . (preg_replace('/\W/', "_", $_POST["title"])) . "" ;

	// Create the new game dir for the game.
	if($retval1){
		// Make the new game dir.
		// Generate the new game dir from the game title.
		$directory = $emu_dir . $gamedir;
		if( ! file_exists($directory) ){
			@mkdir($directory."", 0755);
			$lastError = error_get_last();
		}
		else{
			@mkdir(
				$directory .
				"--" .
				str_pad(rand(0, 1000), 4, "0", STR_PAD_LEFT) .
				""
			, 0755);
			$lastError = error_get_last();
		}
	}

	// Update the new game record with the new game dir.
$s_SQL1  =
"
UPDATE gamelist
	SET gamedir = :gamedir
WHERE id = :gameid;
";
	$prp1    = $dbhandle->prepare($s_SQL1);
	$dbhandle->bind(":gameid" , $newGameId ) ;
	$dbhandle->bind(":gamedir" , $gamedir . "/" ) ;
	$retval2 = $dbhandle->execute();

	echo json_encode(array(
		'data'      => $retval1   ,
		'success'   => true       ,
		'newGameId' => $newGameId ,
		'_retval1'   => $retval1   ,
		'_retval2'   => $retval2   ,
		'_lastError' => $lastError,
		'_gamedir'   => $gamedir,
		'_newGameId' => $newGameId,
		'_directory' => $directory,
		'_emu_dir'   => $emu_dir,
	) );

}

// UNFINISHED
function gameDb_deleteGame(){
	$gameid   = intval($_POST['gameid']);

	global $_appdir;
	global $emu_dir;
	$dbhandle = new sqlite3_DB_PDO__EMU($_appdir.'_sys/eud.db') or exit("cannot open the database");
	$s_SQL1   =
"
SELECT gamedir
FROM gamelist
WHERE id = :gameid
;";

	$prp1     = $dbhandle->prepare($s_SQL1);
	$dbhandle->bind(':gameid' , $gameid ) ;
	$retval1  = $dbhandle->execute();
	$results1 = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	// If the game record was not detected then abort!
	if(!sizeof($results1)){
		echo json_encode(array(
			'data'    => []  ,
			'success' => false ,
		));
		exit();
	}
	$thisGame = $results1[0];

	$directory         = $emu_dir . $thisGame['gamedir'];
	$filelist          = array();
	$filelist_fullPath = array();
	$targetDir         = $directory;
	$absPathToGameDir  = realpath($targetDir) ;

	// Now get a list of the files that are within the game's directory.
	$scanned_directory = array_values(array_diff(scandir($directory), array('..', '.', '.git')));

	// Gather only the file names.
	for($i=0; $i<sizeof($scanned_directory); $i++){
		if( ! is_dir($directory.'/'.$scanned_directory[$i]) ){ array_unshift($filelist, $scanned_directory[$i] ); }
		if( ! is_dir($directory.'/'.$scanned_directory[$i]) ){ array_unshift($filelist_fullPath, $absPathToGameDir.'/'.$scanned_directory[$i] ); }
	}

	// Delete all the found files in the game dir.
	$success_fileDeletions   = false ;
	$success_gameDirDeletion = false ;
	$success                 = false ;

	// MAKE VERY SURE THAT WE HAVE A GAMES FILE PATH!
	if( strpos($absPathToGameDir, "/games/")  != -1 )  {
		// Delete the files within the game directory.
		for($i=0; $i<sizeof($filelist_fullPath); $i++){
			// Delete a file from the list.
			if( file_exists($filelist_fullPath[$i]) ){
				// unlink( $filelist_fullPath[$i] ) ;
				$success_fileDeletions=true;
			}
			else {
				$success_fileDeletions=false;
				break;
			}

		}

		if($success_fileDeletions){
			// Delete the now-empty game directory.
			if(
				file_exists($absPathToGameDir)
				&& is_dir($absPathToGameDir)
			){
				// rmdir( $absPathToGameDir );
				$success_gameDirDeletion=true;
			}
			else{
				$success_gameDirDeletion=false;
			}
		}

		// Determine current success.
		if( $success_fileDeletions && $success_gameDirDeletion ) {
			// Now remove the game's entry in the game DB.
			$s_SQL2   = " DELETE FROM gamelist WHERE id = :gameId ;";
			$prp2     = $dbhandle->prepare($s_SQL2);
			$dbhandle->bind(':gameid' , $gameid ) ;
			$retval2  = $dbhandle->execute();

			if($retval2) { $success = true ; }
			else         { $success = false; }
		}
	}
	else{
		$success=false;
	}

	echo json_encode(array(
		'data'    => array()  ,
		'success' => $success ,

		// DEBUG
		'$_POST'                   => $_POST                                     ,
		'$success_fileDeletions'   => $success_fileDeletions                     ,
		'$success_gameDirDeletion' => $success_gameDirDeletion                   ,
		'$targetDir'               => $targetDir                                 ,
		'$filelist'                => $filelist                                  ,
		'$filelist_fullPath'       => $filelist_fullPath                         ,
		'$thisGame'                => $thisGame                                  ,
		'$scanned_directory'       => $scanned_directory                         ,
		'absPathToGameDir'         => $absPathToGameDir                          ,
		'test1'                    => strpos($absPathToGameDir, "/games/") != -1 ,
		'test2'                    => is_dir($absPathToGameDir) ,
		'test3'                    => is_dir($absPathToGameDir.'/') ,
	) );


}


function c2bin_UamGame(){
	// We should have a game id. Use it to get the record for the game and then grab the UAM dir.
	$gameId         = $_POST['gameId'];
	$author_user_id = $_SESSION['user_id'];

	global $_appdir;
	global $_db;
	$dbhandle = new sqlite3_DB_PDO__UAM5($_db) or exit("cannot open the database");
	$s_SQL1  ="
SELECT
	  UAMdir
	, gamedir
FROM games_manifest
WHERE
	gameId         = :gameId
	AND
	author_user_id = :author_user_id
	;";
	$prp1    = $dbhandle->prepare($s_SQL1);
	$dbhandle->bind(':gameId'         , $gameId         ) ;
	$dbhandle->bind(':author_user_id' , $author_user_id ) ;
	$retval1 = $dbhandle->execute();
	$results1= $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	// Get the path.
	$path = $_SERVER['DOCUMENT_ROOT'].'/'.$results1[0]['UAMdir'].'/'.'C2BIN' ;
	if( ! file_exists( $path ) ) { $error="Compile path does not exist.";     }
	else                         { chdir( $path  ); }

	$results = shell_exec("./c2bin_runit.sh 2>&1");

	echo json_encode(array(
		'data'    => $results1 ,
		'success' => true      ,
		'results' => $results  ,
	) );

	// audit_API_newRecord( $_SESSION['user_id'], $_SESSION['o_api'], $_SESSION['via_type'], 1, $gameId );
}
function c2bin_UamGame_2(){
	echo json_encode(array(
		'data'         => []     ,
		'success'      => true   ,
		'DEBUG_$_POST' => $_POST ,
	) );
	return;

	// Set source dir.
	// Set destination dir.
	// Delete old files.

	// Convert .mid to C inc with midiconv.
	// Convert midiconvert files to compressed C inc but as a binary file.

	// Get the size of the resulting SD_MUSIC.DAT file.
	// Display file size.

	// Do the c2bin.

	// Copy files to the destination output dir.

	// Display the .DEF file.

	// overall c to bin
	// screen data
	// dialog
	// chatheads

	// C	unsigned char
	// v	unsigned int  (always 16 bit, little endian byte order)
	// V	unsigned long (always 32 bit, little endian byte order)

	$fp = fopen("binary-data.dat", "wb");

	$data="";
	$data .= pack("C", 255);
	$data .= pack("C", 254);
	$data .= pack("C", 128);

	fwrite($fp, $data);

	// fwrite($fp, pack("C*", 255));

	// for ($i = 0; $i < 256; $i++) {
	// 	// Assign a binary byte to a variable
	// 	$data = pack("C*",$i);

	// 	// Write the byte to the file
	// 	fwrite($fp, $data);
	// }

	fclose($fp);

	echo json_encode(array(
		'data'                  => array() ,
	));
	return;

	// Temporary: Only allow the UzeRPG game.

	// Create a super associative array with all the data for the game.

	// MUSIC
	// Convert the midi into .inc
	//
	// Convert the .inc into a compressed SD_MUSIC.DAT
	//
	// Get the size of the compressed SD_MUSIC.DAT
	//


	// SECTIONS
	$data = [
		'INDEX' => [
			// [ 'name'=> '', 'offset'=>0, ],
			// [ 'name'=> 'music_start', 'offset'=>0, ],
			// [ 'name'=> 'music_end  ', 'offset'=>0, ],

			// [ 'name'=> 'music_start', 'offset'=>0, ],
			// [ 'name'=> 'music_end  ', 'offset'=>0, ],
			//
			// [ 'name'=> 'music_start', 'offset'=>0, ],
			// [ 'name'=> 'music_end  ', 'offset'=>0, ],
			//
			// [ 'name'=> 'music_start', 'offset'=>0, ],
			// [ 'name'=> 'music_end  ', 'offset'=>0, ],
		],
		'MUSIC'       => [

		],
		'SCREENS'     => [

		],
		'CHATHEADS'   => [

		],
		'FT_BIN_MAPS' => [

		],
		'RT_BIN_MAPS' => [

		],
		'DIALOG'      => [

		],
	];

	// Then, write the data with c2bin C.
}

?>