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
				<div class="gameframe_border">
					<div id="emscripten_iframe_container">
						<iframe id="emscripten_iframe" src="loading.html"></iframe>
					</div>
				</div>
			</div>
			<div id="VIEW_gamedbmanager" class="views">

				<table id="completeData_1game">
					<tr>
						<td>id</td><td><input id="completeData_1game_id" type="text" value=""></td>
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

				<div id="completeData_1game_description">
						description<br>
						<textarea id="completeData_1game_description" ></textarea>
				</div>

				<br>
				<br>
				<div>Files Found in This Game's Directory</div>
				<div id="gamefilelist">sdfasdfsdafsdafsdfa</div>

				<div id="completeData_1game_buttons">
					<br>
					<input type="button" id="completeData_1game_buttons_cancel" value="Cancel (clear form)">
					<input type="button" id="completeData_1game_buttons_update"value="UPDATE">
				</div>
			</div>
		</div>

	</div>
</div>

</body>
</html>