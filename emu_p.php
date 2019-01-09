<?php
// All requests to the server should go through this file.

// This is the only place this flag is set. It is checked everywhere else insuring that all processes start here.
$securityLoadedFrom_indexp = true;

// Configure error reporting
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT);
ini_set('error_log', getcwd() . '/UAM5-EMU-error.txt');
ini_set("log_errors", 1);
ini_set("display_errors", 1);

// Configure timezone.
define('TIMEZONE', 'America/Detroit');
date_default_timezone_set(TIMEZONE);

$_appdir      = getcwd().'/'                    ;
$_db_file     = $_appdir."../sys_files/UAM5.db" ;
$_emu_db_file = $_appdir."_sys/eud.db"          ;
$_db          = $_db_file                       ;

$dev=0;
if ( strpos($_SERVER['SERVER_NAME'], "-nicksen782.c9users.io") !== false ) { $dev=1; }
else { $dev=0; }

$emu_dir = './';
$emu_games_dir = $emu_dir . '/games/';

// Look for UAM. It should be one directory back.
$filename = "../UAMVER.TXT";
$UAMFOUND = false;
if (file_exists($filename)) { $UAMFOUND = true; }

require_once("emu_uam_p.php");

// if( ! file_exists( $_db_file )){ createInitialDatabase(); }

// Was a request received? Process it.
if     ( $_POST['o'] ){ API_REQUEST( $_POST['o'], 'post' ); }
else if( $_GET ['o'] ){ API_REQUEST( $_GET ['o'], 'get'  ); }
else{
	$stats['error']=true;
	$stats['error_text']="***No 'o' value was provided.";
	// audit_API_newRecord( $_SESSION['user_id'], 'MISSING', 'MISSING', 0, $stats['error_text'] );
	echo json_encode( $stats );
	exit();
}


function API_REQUEST( $api, $type ){
	// Is this a UAM request or an EMULATOR ONLY request?
	global $UAMFOUND;

	$stats = array(
		'error'      => false ,
		'error_text' => ""    ,
	);

	// Get permissions.
	// startSession();	// sessions_s.php
	// $perms    = users_sessionAndPermissions_internal();
	// $_SESSION['o_api']    = $api  ;
	// $_SESSION['via_type'] = $type ;
	// $loggedIn = $_SESSION['hasActiveLogin']                            ? 1 : 0;
	// $admin    = in_array( $_SESSION['username'], array('nicksen782') ) ? 1 : 0;

	// Rights.
	$public = 1        ; // No rights required.
	$UAM    = $UAMFOUND; // Requires UAM.

	$o_values=array();

	// DEBUG
	// $o_values["delete_database"] = [ "p"=>( ( $admin ) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;
	// $o_values["gameman_manifest_all"]      = [ "p"=>( ( $loggedIn && $admin) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;

	// EMULATOR FUNCTIONS - VIEW (NON-UAM)
	$o_values["emu_getBuiltInGamelist"]  = [ "p"=>( ( $public) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;
	$o_values["emu_returnJSON_byGameId"] = [ "p"=>( ( $public) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;
	$o_values["emu_init"]                = [ "p"=>( ( $public) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;

	// EMULATOR FUNCTIONS - VIEW (UAM)
	$o_values["gameman_manifest_user"] = [ "p"=>( ( $UAM) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;
	$o_values["c2bin_UamGame"]         = [ "p"=>( ( $UAM) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;
	$o_values["compile_UamGame"]       = [ "p"=>( ( $UAM) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;
	$o_values["c2bin_UamGame_2"]       = [ "p"=>( ( $UAM) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;

	// EMULATOR FUNCTIONS - GAMES DB (UAM)
	$o_values["getData_oneGame"]       = [ "p"=>( ( $UAM) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;
	$o_values["gameDb_addFiles"]       = [ "p"=>( ( $UAM) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;
	$o_values["gameDb_deleteFile"]     = [ "p"=>( ( $UAM) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;
	$o_values["gameDb_updateGameData"] = [ "p"=>( ( $UAM) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;
	$o_values["gameDb_newGame"]        = [ "p"=>( ( $UAM) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;
	$o_values["gameDb_deleteGame"]     = [ "p"=>( ( $UAM) ? 1 : 0 ), 'get'=>0, 'post'=>1, ] ;

	// DETERMINE IF THE API IS AVAILABLE TO THE USER.

	// Is this a known API?
	if( ! isset( $o_values[ $api] ) ){
		$stats['error']=true;
		$stats['error_text']="Unhandled API";
		// audit_API_newRecord( $_SESSION['user_id'], $_SESSION['o_api'], $_SESSION['via_type'], 0, $stats['error_text'] );
	}

	// Is the API allowed to be called this way?
	else if( ! $o_values[ $api ][ $type ] ){
		$stats['error']=true;
		$stats['error_text']="Invalid access type";
		// audit_API_newRecord( $_SESSION['user_id'], $_SESSION['o_api'], $_SESSION['via_type'], 0, $stats['error_text'] );
	}

	// Does the user have sufficient permissions?
	else if( ! $o_values[ $api ]['p'] ){
		$stats['error']=true;
		$stats['error_text']="API auth error";
		// audit_API_newRecord( $_SESSION['user_id'], $_SESSION['o_api'], $_SESSION['via_type'], 0, $stats['error_text'] );
	}

	// Can the function be run?
	if(! $stats['error']){
		// GOOD! Allow the API call.
		call_user_func_array( $api, array() );
	}

	// Was there an error?
	else{
		echo json_encode( $stats );
		exit();
	}

}



class sqlite3_DB_PDO__UAM5{
	public $dbh;              // The DB handle.
	public $statement;        // The prepared statement handle.

	public function __construct( $file_db_loc ){
		// Set timezone.
		date_default_timezone_set('America/Detroit');

		try{
			// Connect to the database.
			$this->dbh = new PDO("sqlite:".$file_db_loc);
			// $this->dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_SILENT);
			$this->dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
			// $this->dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		}
		catch(PDOException $e){
			echo "ERROR ON DB FILE OPEN:"; print_r( $e );
		}
	}

	public function prepare($query){
		try                   {
			$this->statement = $this->dbh->prepare($query);

    		// echo "errorInfo: "; print_r($this->dbh->errorInfo()); echo "<br>";

			return $this->statement;
		}
		catch(PDOException $e){
			echo "ERROR ON PREPARE:"; print_r( $e );
			return ($e);
		}
	}

	public function bind($param, $value, $type = null){
		if(!$this->statement){ return "FAILURE TO BIND"; }

		//Example: $db_pdo->bind(':fname', 'Jenny');
		if (is_null($type)) {
			switch (true) {
				case is_int($value) : { $type = PDO::PARAM_INT ; break; }
				case is_bool($value): { $type = PDO::PARAM_BOOL; break; }
				case is_null($value): { $type = PDO::PARAM_NULL; break; }
				default             : { $type = PDO::PARAM_STR ;        }
			}
		}

		try                   { $this->statement->bindValue($param, $value, $type); }
		catch(PDOException $e){
			echo "ERROR ON BIND:"; print_r( $e );
			return $e;
		}
	}

	public function execute()			{
		try                   { return $this->statement->execute(); }
		catch(PDOException $e){
			echo "ERROR ON EXECUTE:"; print_r( $e );
			/* print_r( debug_backtrace()[1] ); */
		}
	}

	public function getErrors($e)			{
		// #define SQLITE_OK           0   /* Successful result */
		// #define SQLITE_ERROR        1   /* SQL error or missing database */
		// #define SQLITE_INTERNAL     2   /* An internal logic error in SQLite */
		// #define SQLITE_PERM         3   /* Access permission denied */
		// #define SQLITE_ABORT        4   /* Callback routine requested an abort */
		// #define SQLITE_BUSY         5   /* The database file is locked */
		// #define SQLITE_LOCKED       6   /* A table in the database is locked */
		// #define SQLITE_NOMEM        7   /* A malloc() failed */
		// #define SQLITE_READONLY     8   /* Attempt to write a readonly database */
		// #define SQLITE_INTERRUPT    9   /* Operation terminated by sqlite_interrupt() */
		// #define SQLITE_IOERR       10   /* Some kind of disk I/O error occurred */
		// #define SQLITE_CORRUPT     11   /* The database disk image is malformed */
		// #define SQLITE_NOTFOUND    12   /* (Internal Only) Table or record not found */
		// #define SQLITE_FULL        13   /* Insertion failed because database is full */
		// #define SQLITE_CANTOPEN    14   /* Unable to open the database file */
		// #define SQLITE_PROTOCOL    15   /* Database lock protocol error */
		// #define SQLITE_EMPTY       16   /* (Internal Only) Database table is empty */
		// #define SQLITE_SCHEMA      17   /* The database schema changed */
		// #define SQLITE_TOOBIG      18   /* Too much data for one row of a table */
		// #define SQLITE_CONSTRAINT  19   /* Abort due to contraint violation */
		// #define SQLITE_MISMATCH    20   /* Data type mismatch */
		// #define SQLITE_MISUSE      21   /* Library used incorrectly */
		// #define SQLITE_NOLFS       22   /* Uses OS features not supported on host */
		// #define SQLITE_AUTH        23   /* Authorization denied */
		// #define SQLITE_ROW         100  /* sqlite_step() has another row ready */
		// #define SQLITE_DONE        101  /* sqlite_step() has finished executing */
	}

}


// Returns the existance of UAM, returns permissions if applicable, Runs at start.
function emu_init(){
	// Was UAM found?
	global $UAMFOUND;

	// If yes then return the base session information including permissions list.
	if($UAMFOUND){
		// Get permissions.
		// $perms    = users_sessionAndPermissions_internal();
		// $_SESSION['o_api']    = $api  ;
		// $_SESSION['via_type'] = $type ;
		// $loggedIn = $_SESSION['hasActiveLogin']                              ? 1 : 0;
		// $admin    = in_array( $_SESSION['username'], array('nicksen782') ) ? 1 : 0;

		$UAMDATA = $_SESSION;
	}
	// If no, then that's it. No UAM.
	// else{
	// }

	echo json_encode(array(
		'data'       => []        ,
		'success'    => true      ,
		'UAMFOUND'   => $UAMFOUND ,
		'UAMDATA'    => $UAMDATA  ,

		// DEBUG
		// '$_POST'     => $_POST      ,
	) );
}

// *************
// Gets the list of games from the DB. (type 1)
function emu_getBuiltInGamelist(){
	global $_appdir;
	// global $_db;
	$dbhandle = new sqlite3_DB_PDO__UAM5($_appdir.'_sys/eud.db') or exit("cannot open the database");
	$s_SQL1   =
'
SELECT
	  id
	, title
	, status
	, authors
	--, when_added
	--, description
	--, added_by
	--, gamedir
	--, gamefile
FROM gamelist
ORDER BY "title" ASC
--ORDER BY "status" ASC
;';
	$prp1     = $dbhandle->prepare($s_SQL1);
	$retval1  = $dbhandle->execute();
	$results1 = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;
	$thisGame = $results1[0];

	echo json_encode(array(
		'data'    => $results1 ,
		'success' => true      ,
	) );

	// audit_API_newRecord( $_SESSION['user_id'], $_SESSION['o_api'], $_SESSION['via_type'], 1, '' );
}

// Gets a game from the DB. (type 1)
function emu_returnJSON_byGameId(){
	$gameId = intval($_POST['gameId']);

	global $_appdir;
	// global $_db;
	$dbhandle = new sqlite3_DB_PDO__UAM5($_appdir.'_sys/eud.db') or exit("cannot open the database");
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
WHERE id = :gameId
ORDER BY id
;";
	$prp1     = $dbhandle->prepare($s_SQL1);
	$dbhandle->bind(':gameId' , $gameId ) ;
	$retval1  = $dbhandle->execute();
	$results1 = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;
	$thisGame = $results1[0];

	global $emu_dir;
	$directory = $emu_dir . $thisGame['gamedir'];

	$filelist  = array();
	$gamefiles = array();

	// Is the gamefiles key populated?
	if( $thisGame['gamefiles'] ){
		$gamefiles = json_decode( $thisGame['gamefiles'], true );

		for($i=0; $i<sizeof($gamefiles); $i++){
			array_unshift($filelist,
				[
					"filename"         => $gamefiles[$i]               ,
					"completefilepath" => $directory.''.$gamefiles[$i] ,
				]
			);
		}

	}

	// NO?
	else{
		$filelist = get_and_populate_fileslist_field($gameId, $directory);
	}

	$remoteload = array(
		'files'    => $filelist             ,
		'gamefile' => $thisGame['gamefile'] ,
		'title'    => $thisGame['title']    ,
		'baseURL'  => $directory            ,
	);

	echo json_encode(array(
		'data'       => $results1   ,
		'success'    => true        ,
		'remoteload' => $remoteload ,

		// DEBUG
		// '$_POST'     => $_POST      ,
	) );

	// audit_API_newRecord( $_SESSION['user_id'], $_SESSION['o_api'], $_SESSION['via_type'], 1, '' );

}

// If the game's gamefiles field is not filled this will gather values and also put those values in the the field.
// DOES NOT SET THE GAME FILE.
function get_and_populate_fileslist_field($gameId, $directory){
	$filelist  = array();
	$filelist2 = array();

	// Now get a list of the files that are within the game's directory.
	$scanned_directory = array_values(array_diff(scandir($directory), array('..', '.', '.git')));
	$filelist2=array();

	// Gather only the file names.
	for($i=0; $i<sizeof($scanned_directory); $i++){
		if( ! is_dir($directory.'/'.$scanned_directory[$i]) ){
			array_unshift($filelist2, $scanned_directory[$i]);
			array_unshift($filelist,
				[ "filename"=>$scanned_directory[$i], "completefilepath"=>$directory.''.$scanned_directory[$i] ]
			);
		}
	}

	// update gamelist set gamefiles = "";
	// Update the gamefiles entry. There may be some extra files but this is still a better way.
	global $_appdir;
	// global $_db;
	$dbhandle = new sqlite3_DB_PDO__UAM5($_appdir.'sys_files/eud.db') or exit("cannot open the database");
	$s_SQL2 = 'UPDATE "gamelist" SET "gamefiles"=:json WHERE id = :gameId';
	$prp2     = $dbhandle->prepare($s_SQL2);
	$dbhandle->bind(':gameId' , $gameId ) ;
	$dbhandle->bind(':json' , json_encode($filelist2) ) ;
	$retval2  = $dbhandle->execute();

	return $filelist;
}

?>
