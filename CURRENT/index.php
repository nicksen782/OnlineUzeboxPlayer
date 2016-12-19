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
				<div class="gameframe_border_top gameframe_borders"></div>
				<!--<div style="clear:both;"></div>-->

				<div id="middle_cont1">
					<div class="gameframe_border_left gameframe_borders"></div>
					<div id="emscripten_iframe_container"> <iframe id="emscripten_iframe" frameBorder="0" src="loading.html"></iframe> </div>
					<div class="gameframe_border_right gameframe_borders"></div>
				</div>
				<div style="clear:both;"></div>

				<div class="gameframe_border_bottom gameframe_borders"></div>
				<!--<div style="clear:both;"></div>-->
				</div>
			</div>

			<div id="VIEW_gamedbmanager" class="views">
				<div id="gamedata_section">
					<h3>Edit Game Data</h3>

					<table id="completeData_1game">

						<tr>
							<td>title</td><td><input id="completeData_1game_title" type="text" value=""></td>
						</tr>

						<tr>
							<td>authors</td><td><input id="completeData_1game_authors" type="text" value=""></td>
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
							<td>validheader</td><td><input id="completeData_1game_validheader" type="text" value=""></td>
						</tr>
						<tr>
							<td>id</td><td><input disabled id="completeData_1game_id" type="text" value=""></td>
						</tr>
						<tr>
							<td>gamedir</td><td><input disabled id="completeData_1game_gamedir" type="text" value=""></td>
						</tr>
						<tr>
							<td>lastupload</td><td><input disabled id="completeData_1game_lastupload" type="text" value=""></td>
						</tr>
					</table>

					<div id="completeData_1game_description_container">
						description<br>
						<textarea id="completeData_1game_description_textarea"></textarea>
					</div>

					<div id="completeData_1game_buttons">
						<br>
						<input type="button" id="completeData_1game_buttons_cancel" value="Cancel (clear form)">
						<input type="button" id="completeData_1game_buttons_update"value="UPDATE">
					</div>
				</div>
				<div id="filemanager_section">
					<h3>Files Found in This Game's Directory</h3>
					<!--<p>-->
					<table id="filesInDirectory_table">
					<tr>
						<th>File Name</th>
						<th>Remove?</th>
						<th>Download?</th>
					</tr>
					</table>

					<div>
						<h3>Add new files to this Game's Directory?</h3>
						<input type="file"   id="newFileUpload_browse" name="newFileUpload_browse" class="" multiple>
						<input type="button" id="newFileUpload_save"   name="newFileUpload_save"   class="" value="Upload File">
					</div>

					<!--</p>-->

				</div>


				<!--<div id="gamefilelist"></div>-->

				<?php if($devenvironment == true){ ?>
					<a href="../phpliteadmin.php" target="_blank">Full Online Database Manager</a>
				<?php } ?>

			</div>
		</div>

	</div>
</div>

</body>
</html>