<?php
date_default_timezone_set('America/Detroit');
if( $_SERVER['HTTP_HOST'] == "dev-nicksen782.c9.io" || $_SERVER['SERVER_NAME'] == "dev-nicksen782.c9.io" ){ $devenvironment=true;} else{$devenvironment=false;}


// Get file listing minus the '.' and '..'.
$directory = ".";
$scanned_directory = array_values(array_diff(scandir($directory), array('..', '.', '.git')));
// $scanned_directory = array_values(array_diff(scandir($directory), array()));

// Gather only the directory names.
$dirlist = array();
$links = [];
for($i=0; $i<sizeof($scanned_directory); $i++){
	if( is_dir($directory.'/'.$scanned_directory[$i]) ){
		array_unshift($dirlist, $scanned_directory[$i]);
	}
}

// Now, figure out which one is the 'CURRENT' folder.
$dirlist = array_diff($dirlist, ["CURRENT"]);

header("Refresh:15; url='CURRENT'");

for($i=0; $i<sizeof($dirlist); $i++){
	array_push($links, "<a href='".$dirlist[$i]."'>".$dirlist[$i]."</a>");
}

?>


<h1><?php echo basename(getcwd()); ?><h1>
<h2>Version Links:</h2>

<?php
	$output = shell_exec("find CURRENT -type f -printf '%TY-%Tm-%Td %.8TT--%p \n' | sort -r | head -1");
	$output2 = explode('--', $output);
	// echo "<a href='CURRENT/'>CURRENT</a> -- ".date("D M j G:i:s T Y", strtotime($output2[0])) . " -- " . $output2[1] . "<br>";

	if($devenvironment==true){
		echo "<a href='CURRENT/'>CURRENT</a> -- ".date("D M j, Y, g:i:s A (T)", strtotime($output2[0])) . " -- " . $output2[1] . "<br>";
		for($i=1;$i<sizeof($links);$i++){ echo $links[$i] . "<br>"; }
	}
	else{
		echo "<a href='CURRENT/'>CURRENT</a> -- ".date("D M j, Y, g:i:s A (T)", strtotime($output2[0])) . "<br>";
	}
?>

<h3>Page will automatically redirect to == <?php echo 'CURRENT' ;?> == in 15 seconds.</h3>
<h4>... or you could just click <a href='<?php echo 'CURRENT' ;?>/'>HERE (<?php echo 'CURRENT' ;?>)</a> to see the latest version</h4>
<?php
clearstatcache();



?>