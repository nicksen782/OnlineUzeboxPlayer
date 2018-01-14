<?php
date_default_timezone_set('America/Detroit');
if( $_SERVER['HTTP_HOST'] == "dev2-nicksen782.c9users.io" || $_SERVER['SERVER_NAME'] == "dev2-nicksen782.c9users.io" ){ $devenvironment=true; }
else{ $devenvironment=false; }

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

if(!$devenvironment){
	header("Refresh:15; url='CURRENT'");
}

for($i=0; $i<sizeof($dirlist); $i++){
	array_push($links, "<a href='".$dirlist[$i]."'>".$dirlist[$i]."</a>");
}

?>


<div id="iedetected"
	style="
	background-color: red;
	text-align: center;
	/* line-height: 1em; */
	font-size: 2em;
	border: 5px solid black;
	padding: 5px;
	width: 85%;
	margin: auto;
	">
	Internet Explorer users:<br>
	NOTE: The application does NOT work (very well) with Internet Explorer at this time.<br>
	(Have tried using IE 11, and Edge (IE v12). Once I got it to run, the performance was very bad.<br>
	Use a different browser.
</div>

<script>
	var isIE = !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g);
	if(isIE){ document.querySelector("#iedetected").style.display="block"; }
	else    { document.querySelector("#iedetected").style.display="none"; }
</script>


<h1><?php echo basename(getcwd()); ?><h1>
<h3>
Youtube Video Demo:
<li><a href="https://youtu.be/IaaIbDH8QZY">Demo 1 (2016-12-26)</a></li>
<li><a href="https://youtu.be/ogGazXRQMj8">Demo 2 (2017-09-16)</a></li>
</h3>
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

<?php if(!$devenvironment){ ?>
	<h3>Page will automatically redirect to == <?php echo 'CURRENT' ;?> == in 15 seconds.</h3>
<?php } ?>

<h4>Click <a href='<?php echo 'CURRENT' ;?>/'>HERE (<?php echo 'CURRENT' ;?>)</a> to see the latest version of the application.</h4>

<?php
clearstatcache();



?>