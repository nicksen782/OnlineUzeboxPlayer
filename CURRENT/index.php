<?php $properAccess=true; require_once("globals_p.php"); ?>
<!doctype html>
<html lang="en-us">

<head>
	<meta charset="utf-8">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Uzebox Game Changer</title>
	<link rel="stylesheet" type="text/css" href="css/index.css">
	<script src="js/index.js"></script>
	<script src="js/polyfills.js"></script>

</head>

<body>
<div id="wrapAll">
	<div id="top_panel">
		<div id="top_panel_left">
			<div id="topNavMenu">
				<div class="navButton" onclick="viewSwitcher('emu');">
					Emulator
				</div>
				<?php if($devenvironment == true){ ?>
				<div class="navButton" onclick="viewSwitcher('gamedbman');">
					Games DB
				</div>
				<?php } ?>

			</div>
		</div>

		<div id="top_panel_right" class="panels">
			<select id="gameMenu_select">
				<option value=""> - Choose a game - </option>
			</select>
			<input id="stopEmulator_button" type="button" value="Stop">
			<input id="restartEmulator_button" type="button" value="Restart">
			<br>
			<div id="progressBar"></div>
		</div>

		<div id="top_panel_right_gamemanager" class="panels">
			<select id="gameMenu_select2">
				<option value=""> - Choose a game - </option>
			</select>
			<!--<input id="stopEmulator_button" type="button" value="Stop">-->
			<!--<input id="restartEmulator_button" type="button" value="Restart">-->
			<br>
			<div id="progressBar2"></div>
		</div>

		<div id="top_panel_settings_gear"></div>

	</div>

	<div id="content">

		<div id="middle">
			<div id="VIEW_emulator" class="views">

				<div class="gameframe_">
				<div class="gameframe_border_top"></div>
				<!--<div style="clear:both;"></div>-->

				<div id="middle_cont1">
					<div class="gameframe_border_left"></div>
					<div id="emscripten_iframe_container"> <iframe id="emscripten_iframe" src="loading.html"></iframe> </div>
					<div class="gameframe_border_right"></div>
				</div>
				<div style="clear:both;"></div>

				<div class="gameframe_border_bottom"></div>
				<!--<div style="clear:both;"></div>-->
				</div>
			</div>

			<div id="VIEW_gamedbmanager" class="views">

				<table id="completeData_1game">
					<tr>
						<td>id</td><td><input disabled id="completeData_1game_id" type="text" value=""></td>
					</tr>

					<tr>
						<td>title</td><td><input id="completeData_1game_title" type="text" value=""></td>
					</tr>

					<tr>
						<td>authors</td><td><input id="completeData_1game_authors" type="text" value=""></td>
					</tr>

					<tr>
						<td>gamedir</td><td><input id="completeData_1game_gamedir" type="text" value=""></td>
					</tr>
					<tr>
						<td>gamefile</td><td><input id="completeData_1game_gamefile" type="text" value=""></td>
					</tr>
					<tr>
						<td>uses_sd</td><td><input id="completeData_1game_uses_sd" type="text" value=""></td>
					</tr>
					<tr>
						<td>addedby</td><td><input id="completeData_1game_addedby" type="text" value=""></td>
					</tr>
					<tr>
						<td>lastupload</td><td><input id="completeData_1game_lastupload" type="text" value=""></td>
					</tr>
					<tr>
						<td>validheader</td><td><input id="completeData_1game_validheader" type="text" value=""></td>
					</tr>
				</table>

				<div id="completeData_1game_description_container">
					description<br>
					<textarea id="completeData_1game_description_textarea"></textarea>
				</div>

				<br>
				<br>


				<div>
					<h3>Files Found in This Game's Directory</h3>
					<!--<p>-->
					<table>
					<tr>
						<th>File Name</th>
						<th>Remove?</th>
						<th>Download?</th>
					</tr>
					<tr>
						<td>ae.uze</td>
						<td><input type="button" value="Remove"></td>
						<td><a href="games/boulderdash/boulderdash.uze" title="Download this file">boulderdash.uze</a></td>
					</tr>
					<tr>
						<td>aedat.bin</td>
						<td><input type="button" value="Remove"></td>
						<td><a href="games/boulderdash/boulderdash.uze" title="Download this file">boulderdash.uze</a></td>
					</tr>
					</table>

					<form id="newFileUpload_form">
						<div>
							<input type="file"   id="newFileUpload_browse" class="" name="newFileUpload_files" >
							<input type="button" id="newFileUpload_save"   class="" onclick="newFileUpload(this, this.form)" value="Upload File">
						</div>
					</form>

					<!--</p>-->
				</div>
				<div id="gamefilelist"></div>

				<div id="completeData_1game_buttons">
					<br>
					<input type="button" id="completeData_1game_buttons_cancel" value="Cancel (clear form)">
					<input type="button" id="completeData_1game_buttons_update"value="UPDATE">
				</div>

				<?php if($devenvironment == true){ ?>
					<a href="../phpliteadmin.php" target="_blank">Full Online Database Manager</a>
				<?php } ?>

			</div>
		</div>

	</div>
</div>

</body>
</html>