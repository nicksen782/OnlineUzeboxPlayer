<?php //require_once("globals_p.php"); ?>
<?php
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
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION	// Show all exception errors.
				// PDO::ATTR_PERSISTENT => true					// Connect is persistant.
			);

		// Create a new PDO instance
		try{
			// Connect to the database.
			$this->dbh = new PDO($file_db_loc, $this->user, $this->pass, $options);
			// $this->dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
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
			// tattle5("error in prepare", $e);
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

	public function execute(){
		try{
			$retval = $this->statement->execute();
			return  $retval;
		}
		catch(PDOException $e){
			// BUG: We should indicate the error somehow though...
			// tattle5("uh oh", $e);
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