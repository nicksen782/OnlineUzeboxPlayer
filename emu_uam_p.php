<?php
if(!$securityLoadedFrom_indexp){ exit(); };
// UAM FUNCTIONS
// if(!$securityLoadedFrom_indexp){ exit(); };

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
	$dbhandle = new sqlite3_DB_PDO__UAM5($_db) or exit("cannot open the database");
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





function getGamesAndXmlFilepathsViaUserId(){
	$author_user_id = $_POST["user_id"];

	global $_appdir;
	global $_db;
	$dbhandle = new sqlite3_DB_PDO__UAM5($_db) or exit("cannot open the database");
	$s_SQL1  ="
SELECT
	  gameId
	, gameName
	, UAMdir

	--, author_user_id
	--, author
	--, gamedir
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

	// You have the gameIds, gameNames, and UAMdirs. You need the XML filenames in the XML dir of the game's UAM dir.
	$results2 = [];

	for($i=0; $i<sizeof($results1); $i+=1){
		$directory = $results1[$i]["UAMdir"] . "/XML";
		$gameId = $results1[$i]["gameId"];
		$gameName = $results1[$i]["gameName"];

		// Scan the dir. Get the file names that have the XML extension.
		$scanned_directory = array_values(
			array_diff(
				scandir($_SERVER["DOCUMENT_ROOT"] . "/" . $directory
			)
			, array('..', '.', '.git')
			)
		);

		for($ii=0; $ii<sizeof($scanned_directory); $ii++){
			// Don't include dirs.
			if( ! is_dir($_SERVER["DOCUMENT_ROOT"] . "/" . $directory.'/'.$scanned_directory[$ii]) ){
				array_push($results2,
					[
						// "fullpath" => $_SERVER["DOCUMENT_ROOT"] . "/" . $directory.'/'.$scanned_directory[$ii] ,
						"webpath"  => "/".$directory.'/'.$scanned_directory[$ii] ,
						"filename" => $scanned_directory[$ii]                ,
						"gameid"   => $gameId                                  ,
						"gamename" => $gameName                              ,
						// "label"    => $gameName . " - "  .$scanned_directory[$ii]       ,
					]
				);
			}
		}

	}

	//

	echo json_encode(array(
		'data'      => [] ,
		'success'   => true      ,

		'$_POST'    => $_POST    ,
		'$results1' => $results1 ,
		'$results2' => $results2 ,
	) );

}

?>