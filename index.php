<?php
if(sizeof($_GET)){
	$getstring="";
	$first=true;
	foreach ($_GET as $key => $value){
		if ($first){ $getstring .= '?'; }
		else{ $getstring .= '&'; }
		$getstring .= $key . '=' . $value ;
	}
	header('Location: emu.php' . $getstring);
}
else{
	header('Location: emu.php');
}
?>