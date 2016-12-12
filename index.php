<?php
date_default_timezone_set('America/Detroit');
if( $_SERVER['HTTP_HOST'] == "dev-nicksen782.c9.io" || $_SERVER['SERVER_NAME'] == "dev-nicksen782.c9.io" ){ $devenvironment=true;} else{$devenvironment=false;}


// Get file listing minus the '.' and '..'.
$directory = ".";
$scanned_directory = array_values(array_diff(scandir($directory), array('..', '.')));
// $scanned_directory = array_values(array_diff(scandir($directory), array()));

// Gather only the directory names.
$dirlist = array();
$links = [];
for($i=0; $i<sizeof($scanned_directory); $i++){
	if( is_dir($directory.'/'.$scanned_directory[$i]) ){
		array_unshift($dirlist, $scanned_directory[$i]);
	}
}

header("Refresh:10; url='".$dirlist[0]."'");

for($i=0; $i<sizeof($dirlist); $i++){
	array_push($links, "<a href='".$dirlist[$i]."'>".$dirlist[$i]."</a>");
}
?>


<h1><?php echo basename(getcwd()); ?><h1>
<h2>Version Links:</h2>

<?php
	$output = shell_exec("find v4.1 -type f -printf '%TY-%Tm-%Td %.8TT--%p \n' | sort -r | head -1");
	$output2 = explode('--', $output);
	// echo date("D M j G:i:s T Y", strtotime($output2[0])) . " -- " . $output2[1];

	if($devenvironment==true){
		echo $links[0] . " -- LAST UPDATE: TIME/FILE: -- " . date("D M j G:i:s T Y", strtotime($output2[0])) . " -- " . $output2[1] . "<br>";
		for($i=1;$i<sizeof($links);$i++){ echo $links[$i] . "<br>";; }
	}
	else{
		echo $links[0] . " -- LAST UPDATE: -- " . date("D M j G:i:s T Y", strtotime($output2[0])) . "<br>";
	}
?>

<h3>Page will automatically redirect to == <?php echo $dirlist[0] ;?> == in 10 seconds.</h3>
<h4>... or you could just click <a href='<?php echo $dirlist[0] ;?>/'>HERE (<?php echo $dirlist[0] ;?>)</a> to see the latest version</h4>
<?php
clearstatcache();



?>