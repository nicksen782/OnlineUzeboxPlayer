<?php
	if( $_SERVER['HTTP_HOST'] == "dev-nicksen782.c9.io" || $_SERVER['SERVER_NAME'] == "dev-nicksen782.c9.io" ){ $devenvironment=true;}else{$devenvironment=false;}
	if(!$devenvironment){ echo "Not available on this domain. Sorry."; exit(); }
?>
<!doctype html>
<html lang="en-us">

<head>
	<meta charset="utf-8">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Emscripten-Generated Code</title>
	<link rel="stylesheet" type="text/css" href="gamemanager.css">
	<!--<link rel="stylesheet" type="text/css" href="index.css">-->
	<script src="gamemanager.js"></script>

</head>

<body>

<iframe id="upload_iframe" name="upload_iframe" height="0" width="0" frameborder="0" scrolling="yes"></iframe>
<form id="myForm" action="gamemanager_p.php" method="post" enctype="multipart/form-data"  target="upload_iframe" onsubmit="newGame_submitHandler();">
	<h3>New Game</h3>
	<table id="newGame_table">
		<tr>
			<td>Title</td>
			<td><input name="newGame_title" type="text"></td>
		</tr>
		<tr>
			<td>Authors</td>
			<td><input name="newGame_title"type="text"></td>
		</tr>
		<tr>
			<td>Description</td>
			<td>
				<textarea name="newGame_title"></textarea>
			</td>
		</tr>
	</table>
	<!--var thedata = new FormData();-->
	<!--thedata.append('fileToUpload', fileUploadDataOBJ.file);-->

	<input type="file"  name="newGame_uploadButton" id="newGame_uploadButton" value="Upload">
	<input type="submit" id="newGame_saveButton" value="Save new game!">
</form>

<hr><hr>
<hr><hr>
<br><br><br><br>
view list of files in database<br>
<input type="button" onclick="viewGameDB();" value="View Game DB"><br>
<div id="viewGameDB_results"></div>
<br>
edit entry in database.<br>
<br>
remove entry from database<br>
<br>
add entry to database<br>
<form id="newGame_form" action="" method="">
<input type="text" value="Super Cool Game"						name="title" placeholder=""><br>
<input type="text" value="nicksen782"							name="authors" placeholder=""><br>
<input type="text" value="This is the best game ever created!"	name="description" placeholder=""><br>
<input type="text" value="nicksen782"							name="addedby" placeholder=""><br>
<input type="text" value="1"									name="validheader" placeholder=""><br>
<input type="button" id="newGame" onclick="newGame();" value="SAVE NEW UZEBOX GAME"><br>
</form>
<br>
scan for new files (unknown to the database.)<br>
<input type="button" id="gamedirList_nonSD" onclick="gamedirList_nonSD();" value="Import from import folder"><br>

<br>

<table id="gameslist2">
<tr>
	<th>Key</th>
	<th>Title</th>
	<th>Filename</th>
	<th>Author(s)</th>
	<th>Valid Header?</th>
	<th>Description</th>
	<th>Hash-match with:</th>
</tr>



</table>

</body>
</html>