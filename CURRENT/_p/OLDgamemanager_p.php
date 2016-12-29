<?php
exit();
	// if( $_SERVER['HTTP_HOST'] == "dev-nicksen782.c9.io" || $_SERVER['SERVER_NAME'] == "dev-nicksen782.c9.io" ){ $devenvironment=true;}else{$devenvironment=false;}
	// if(!$devenvironment){ echo "Not available on this domain. Sorry."; exit(); }
?>
<?php
// $GLOBALS['eud_db'] = "sqlite:/home/ubuntu/workspace/web/ACTIVE/Emscripten_Uzebox_Gamechanger/v4.1/APP_gamemanager/eud.db";
$GLOBALS['eud_db'] = "sqlite:eud.db";

	error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT);
	ini_set('error_log', getcwd() . '/yay_php-error.txt');
	// ini_set('display_errors', true);
	date_default_timezone_set('America/Detroit');

if ($_POST['o'] == 'viewGameDB')				{ viewGameDB(); 		exit(); }
if ($_POST['o'] == 'newGame')					{ newGame();			exit(); }
if ($_POST['o'] == 'gamedirList_nonSD')			{ gamedirList_nonSD(); 	exit(); }

function viewGameDB(){
	// List all files in the game database. Provide separate responses for SD and non-SD games.

	// Prepares this query.
	$eud_db = $GLOBALS['eud_db'];
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or die("cannot open the database");

	// SQL delete query.
	$statement_SQL = "
		SELECT *
		FROM games
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

function checkHashMatch($list){
	// Prepares this query.
	$eud_db = $GLOBALS['eud_db'];
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or die("cannot open the database");

	// SQL delete query.
	$statement_SQL = "
		SELECT binhash FROM games WHERE binhash = :hash
	;";
	// Prepare, bind placeholders, then execute the SQL query.
	$dbhandle->prepare($statement_SQL);

	for($i=0; $i<count($list); $i++){
		$dbhandle->bind(':hash',		$list[$i]['hash'] );
		$retval_execute1 = $dbhandle->execute();

		// // Fetch the records.
		$result = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;
		if(sizeof($result)){ $list[$i]['duplicate'] = true; }
		else       { $list[$i]['duplicate'] = false; }
	}

	return $list;
}

// Imports files from the 'import' folder. These games should be non-sd.
function gamedirList_nonSD(){
// function importFilesFromServer(){
	// Get a list of all .uze files.
	exec('find ../import/*.uze  -printf "%f\n"', $inputUze_files);

	// Go through each file.
	for($i=0; $i<sizeof($inputUze_files); $i++){
		$filenameonly = basename($inputUze_files[$i], ".uze");
		// Check for the presence of the UZEBOX header.
		$fh = fopen("../import/".$inputUze_files[$i], "r+");
		$data2 = fread($fh, 6);
		if($data2 != "UZEBOX"){ $titleSuffix=" (invalid .uze file)";} else { $titleSuffix=""; }

		// Create the entry in the listofroms json.
		// $listofroms[$filenameonly] = [
		$listofroms[$i] = [
			"title" 		=> $filenameonly,//.$titleSuffix,
			"filename"		=> basename($inputUze_files[$i]),
			// "authors"		=>"GamesPackaged/".$filenameonly."_DATA.js",
			// "description"	=> $titleSuffix != "" ? 0 : 1,
			// "addedby"		=> $titleSuffix != "" ? 0 : 1,
			"duplicate"=>false,
			"validheader"	=> $titleSuffix != "" ? 0 : 1,
			"hash"=> hash('md5', file_get_contents("../import/".$inputUze_files[$i]), false)
		];
		fclose($fh);

	}
	// Check for existing hash. Returns same array with new 'duplicate' key populated on matches.
	$listofroms = checkHashMatch($listofroms);

	// Split the array into dupes and non-dupes.
	$new = [];
	$dupes = [];
	for($i=0; $i<sizeof($listofroms); $i++){
		if(      $listofroms[$i]['duplicate'] == false) { array_push($new, $listofroms[$i]);   }
		else                                            { array_push($dupes, $listofroms[$i]); }
	}

	// Move files, create directories.
	// chdir('../games_nonsd');
	for($i=0; $i<sizeof($new); $i++){
		// Record the new roms in the database.
		newGame($new[$i]['title'], null, null, "importer", $new[$i]['validheader'], $new[$i]['hash']);
		$filename= $new[$i]['filename'];
		$filenameonly = basename($new[$i]['filename'], ".uze");

		// Make the directory if it isn't already there.
		$newdir = '../games_nonsd/'.$filenameonly;
		if( ! file_exists($newdir)){ mkdir($newdir); }

		// Move the files.
		rename("../import/".$filename, "../games_nonsd/".$filenameonly."/".$filename);
	}

	// Return array of dupes and non-dupes.
	echo json_encode(
		array(
			"new"=>$new,
			"dupes"=>$dupes,
			// "listofroms"=>$listofroms
		), JSON_PRETTY_PRINT
	);

}

// function gamedirList_nonSD(){
// 	exec('find ../import/*.uze  -printf "%f\n"', $inputUze_files);

// 		// Go through the list of files.
// 	for($i=0; $i<sizeof($inputUze_files); $i++){
// 		$filenameonly = basename($inputUze_files[$i], ".uze");
// 		// Check for the presence of the UZEBOX header.
// 		$fh = fopen("../import/".$inputUze_files[$i], "r+");
// 		$data2 = fread($fh, 6);
// 		if($data2 != "UZEBOX"){ $titleSuffix=" (invalid .uze file)";} else { $titleSuffix=""; }

// 		// Create the entry in the listofroms json.
// 		$listofroms[$filenameonly] = [
// 			"title" 		=> $filenameonly,//.$titleSuffix,
// 			"filename"		=> basename($inputUze_files[$i]),
// 			// "authors"		=>"GamesPackaged/".$filenameonly."_DATA.js",
// 			// "description"	=> $titleSuffix != "" ? 0 : 1,
// 			// "addedby"		=> $titleSuffix != "" ? 0 : 1,
// 			"duplicate"=>"",
// 			"validheader"	=> $titleSuffix != "" ? 0 : 1,
// 			"hash"=> hash('md5', file_get_contents("../import/".$inputUze_files[$i]), false)
// 		];
// 		fclose($fh);
// 	}

// 	// Check new file hashes against existing hashes in the database. (Adds 'duplicate' key.)
// 	$listofroms2 = checkHashMatch($listofroms);

// 	// Remove duplicates from the list. (determined by hash match.)



// 	// Output the data.
// 	echo json_encode(
// 		array(
// 			"listofroms" => $listofroms2,
// 			"output"=>$output
// 		), JSON_PRETTY_PRINT
// 	);

// }

// Probably going to be used one time only.
// function importGames_nonSD(){
// 	exec('find ../games_nonsd/*.uze  -printf "%f\n"', $inputUze_files);

// 		// Go through the list of files.
// 	for($i=0; $i<sizeof($inputUze_files); $i++){
// 		$filenameonly = basename($inputUze_files[$i], ".uze");
// 		// Check for the presence of the UZEBOX header.
// 		$fh = fopen("../games_nonsd/".$inputUze_files[$i], "r+");
// 		$data2 = fread($fh, 6);
// 		if($data2 != "UZEBOX"){ $titleSuffix=" (invalid .uze file)";} else { $titleSuffix=""; }

// 		// Create the entry in the listofroms json.
// 		$listofroms[$filenameonly] = [
// 			"title" 		=> $filenameonly,//.$titleSuffix,
// 			"filename"		=> basename($inputUze_files[$i]),
// 			// "authors"		=>"GamesPackaged/".$filenameonly."_DATA.js",
// 			// "description"	=> $titleSuffix != "" ? 0 : 1,
// 			// "addedby"		=> $titleSuffix != "" ? 0 : 1,
// 			"validheader"	=> $titleSuffix != "" ? 0 : 1,
// 			"hash"=> hash('md5', file_get_contents("../games_nonsd/".$inputUze_files[$i]), false)
// 		];
// 		fclose($fh);
// 	}

// 	$output = checkHashMatch($listofroms);

// 	// Output the data.
// 	echo json_encode(
// 		array(
// 			"listofroms" => $listofroms,
// 			"output"=>$output
// 		), JSON_PRETTY_PRINT
// 	);

// }

function newGame($title, $authors, $description, $addedby, $validheader, $hash){

	// List all files in the game database. Provide separate responses for SD and non-SD games.

	// Prepares this query.
	$eud_db = $GLOBALS['eud_db'];
	$dbhandle  = new sqlite3_DB_PDO($eud_db) or die("cannot open the database");

	// SQL delete query.
	$statement_SQL = "
		INSERT INTO games (
			title,authors,description,lastupload,addedby,validheader,binhash
		)
		VALUES(
			:title,:authors,:description,datetime(CURRENT_TIMESTAMP, 'localtime'),:addedby,:validheader,:binhash
		)
		;";

	// Prepare, bind placeholders, then execute the SQL query.
	$dbhandle->prepare($statement_SQL);
		$dbhandle->bind(':title',		$title);
		$dbhandle->bind(':authors', 	$authors);
		$dbhandle->bind(':description', $description);
		$dbhandle->bind(':addedby',		$addedby);
		$dbhandle->bind(':validheader', $validheader);
		$dbhandle->bind(':binhash', 	$hash);
	$retval_execute1 = $dbhandle->execute();

	// Fetch the records.
	$result = $dbhandle->statement->fetchAll(PDO::FETCH_ASSOC) ;

	// Output the data.
	// echo json_encode(
	// 	array(
	// 		"retval_execute1" => $retval_execute1,
	// 	)
	// );

// for new adds
// datetime(CURRENT_TIMESTAMP, 'localtime')



}

// id
// title
// authors
// backtrace
// description
// lastupload
// addedby
// validheader

// for new adds
// datetime(CURRENT_TIMESTAMP, 'localtime')




// DONE - SQLITE database class that is used throughout this program.
class sqlite3_DB_PDO{
	// http://www.if-not-true-then-false.com/2012/php-pdo-sqlite3-example/
	// http://stackoverflow.com/a/16728310

	private $user = "";				//
	private $pass = "";				//
	public $dbh;					// The DB handle.
	public $statement;				// The prepared statement handle.
	public $error;					// Errors can go here.
	// private $host = '127.0.0.1' ;	// HOSTNAME
	// private $host = 'localhost' ;	// HOSTNAME
	// private $dbname;					// Database name.

	public function __construct($file_db_loc){
		// echo "eat it!";
		// Connection details (DSN) and configuration.
		// Timezone.
		date_default_timezone_set('America/Detroit');

		// Options
			$options = array(
				PDO::ATTR_TIMEOUT => 10, 						// timeout in seconds
				// PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION	// Show all exception errors.
				// PDO::ATTR_PERSISTENT => true					// Connect is persistant.
			);

		// Create a new PDO instance
		try{
			// Connect to the database.
			$this->dbh = new PDO($file_db_loc, $this->user, $this->pass, $options);
		}

		// Catch any PDOException errors
		catch(PDOException $e){
			echo "<pre>! $file_db_loc (((((((((((((())))))))))))))";
			print_r($e);
			echo "</pre>";
			// If we cannot connect to the DB then we shouldn't create a tattle.
			// BUG: We should indicate the error somehow though...

			// These lines could be uncommented for debug reasons:
			// echo $this->print_r_2_string($e);
			// echo $file_db_loc."<br><hr><br>";
			// echo $GLOBALS['dt4_db']."<br><hr><br>";

			// echo "<pre>XXX ";print_r($GLOBALS['dt4_db']);echo " XXX</pre>";
			// echo $this->print_r_2_string($e);
			// $GLOBALS['dt4_db']
			exit();
		}
	}

	public function prepare($query){
		try{ $this->statement = $this->dbh->prepare($query);}
		catch(PDOException $e){
			// BUG: We should indicate the error somehow though...
			// trigger_error("\n ******prepare". json_encode(debug_backtrace(), JSON_PRETTY_PRINT), E_USER_ERROR);
			trigger_error("\n ******prepare". json_encode($e, JSON_PRETTY_PRINT), E_USER_ERROR);
			// tattle4('Error during prepare.', json_encode(array("<br><hr><br>",'e:'=>$e_values, "<br><hr><br>", 'pdo_debug_StrParams:'=>$pdo_debug_StrParams, "<br><hr><br>",)), false);
			// tattle4('Error during prepare.', json_encode(array("<br><hr><br>",'e:'=>$e_values, "<br><hr><br>", 'pdo_debug_StrParams:'=>$pdo_debug_StrParams, "<br><hr><br>",)), true);
		}
	}

	public function bind($param, $value, $type = null){
		//Example: $db_pdo->bind(':fname', 'Jenny');
		if (is_null($type)) {
			switch (true) {
				case is_int($value):
					$type = PDO::PARAM_INT;
					break;
				case is_bool($value):
					$type = PDO::PARAM_BOOL;
					break;
				case is_null($value):
					$type = PDO::PARAM_NULL;
					break;
				default:
					$type = PDO::PARAM_STR;
			}
		}
		$this->statement->bindValue($param, $value, $type);
	}

	public function execute()			{
		try{ return $this->statement->execute(); }
		catch(PDOException $e){
			// BUG: We should indicate the error somehow though...
			echo "crap!!!";
			exit();
			// $pdo_debug_StrParams = $this->pdo_debugStrParams();
			// $e_values = $this->print_r_2_string($e);

			// echo json_encode($e_values, JSON_PRETTY_PRINT);
			// tattle4('globals: =>$GLOBALS', $GLOBALS, true);
			// tattle4('Error during execute.', json_encode(array("<br><hr><br>",'e:'=>$e_values, "<br><hr><br>", 'pdo_debug_StrParams:'=>$pdo_debug_StrParams, "<br><hr><br>",)), false);
			// tattle4('Error during execute.', json_encode(array("<br><hr><br>",'e:'=>$e_values, "<br><hr><br>", 'pdo_debug_StrParams:'=>$pdo_debug_StrParams, "<br><hr><br>",)), true);
		}
	}
	public function lastInsertId()		{ return $this->dbh->lastInsertId(); }
	public function rowCount()			{ return $this->statement->rowCount(); }
	public function beginTransaction()	{ return $this->dbh->beginTransaction(); }
	public function endTransaction()	{ return $this->dbh->commit(); }
	public function cancelTransaction()	{ return $this->dbh->rollBack(); }

	public function debugDumpParams()	{ return pdo_debugStrParams(); }

	public function print_r_2_string($value){
		ob_start();
		// Get the value which will be put into the buffer.
		print_r($value);
		// Get the contents of that buffer.
		$r = ob_get_contents();
		// Clear the buffer.
		ob_end_clean();

		// Clean up the value.
		$r = str_replace("\t","   ", $r) ;
		$r = nl2br($r);
		$r = str_replace("\n","", $r) ;
		$r='\n'.$r;

		// Return the value.
		return $r;
	}

	private function pdo_debugStrParams() {
		// Turn on the output buffer.
		ob_start();
		// Get the value which will be put into the buffer.
		$this->statement->debugDumpParams();
		// Get the contents of that buffer.
		$r = ob_get_contents();
		// Clear the buffer.
		ob_end_clean();

		// Clean up the value.
		$r = str_replace("\t","   ", $r) ;
		$r = nl2br($r);
		$r = str_replace("\n"," ", $r) ;
		$r = str_replace("Key: Name: ","<br>Key: Name: ", $r) ;
		$r='\n'.$r;

		// Return the value.
		return $r;
	}
}

?>
