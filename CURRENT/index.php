<?php $properAccess=true; require_once("globals_p.php"); ?>
<!doctype html>
<html lang="en-us">

<head>
	<meta http-equiv="X-UA-Compatible" content="IE=11" />
	<meta charset="utf-8">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Uzebox Game Changer</title>
	<link rel="stylesheet" type="text/css" href="css/index.css">
	<script src="js/polyfills.js"></script>
	<script src="js/index.js"></script>
	<script>
		// Get the game id from the querystring if one was passed.
		var gameid_GET = "<?php echo $_GET['gameid']; ?>";
	</script>
		<?php if($devenvironment == true){ ?>
		<style>
			.writeButton{ display:block !important; }
			.nonDevWarning{display:none;}
		</style>
		<?php }
		else{ ?>
			<style>
				.writeButton{ display:none !important; }
				.nonDevWarning{display:block;}
			</style>
		<?php } ?>
		<style>
		</style>

</head>

<body>
<div id="wrapAll">
	<div id="top_panel">
		<div id="top_panel_left">
			<div id="topNavMenu">
				<div class="navButton" id="navButton_emu" onclick="viewSwitcher('emu');">
					Emulator
				</div>
				<div class="navButton" id="navButton_gamedbman" onclick="viewSwitcher('gamedbman');">
					Games DB
				</div>
				<div class="navButton" id="navButton_misc" onclick="viewSwitcher('misc');">
					Misc
				</div>

			</div>
		</div>

		<div id="top_panel_right" class="panels">
		</div>

		<div id="top_panel_right_user" class="panels">
			<table>
				<tr class="emulatorControls_info">
					<td>TITLE:</td>
					<td id="emulatorControls_title"></td>
				</tr>
				<tr class="emulatorControls_info">
					<td>GAMEFILE:</td>
					<td id="emulatorControls_gamefile"></td>
				</tr>
			</table>

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
				<div id="darkener_modal_3" onclick="modal_3(false);"></div>
				<div id="modal_3">HI</div>

				<div id="darkener_modal_2"></div>
				<div id="modal_2">

					<div>
				        <h3>CUzeBox Emulator Controls:</h3>
					<div id="CUzeBox_controls"></div>
				        <ul>
				          <li>Arrow keys: SNES controller DPAD</li>
				          <li>Q: SNES controller 'Y'</li>
				          <li>W: SNES controller 'X'</li>
				          <li>A: SNES controller 'B'</li>
				          <li>S: SNES controller 'A'</li>
				          <li>Enter: SNES controller 'Start'</li>
				          <li>Space: SNES controller 'Select'</li>
				          <li>Right shift: SNES controller Right shoulder</li>
				          <li>Left shift: SNES controller Left shoulder</li>
				          <li>F2: Toggle low quality (helps if emulator runs too slow)</li>
				          <li>F3: Toggle emulator debug information (slower with them on)</li>
				          <li>F8: Toggle UZEM style keymapping (A, S, Y, X instead of Q, W, A, S)</li>
				        </ul>
				      </div>
				</div>


				<div id="emulatorControls">
					<div class="emulatorControls_section_title">Choose a Game</div>
					<div id="gameChooser">

						<div id="gameSourceNav">
							<div class="gameSourceNav_tab active" id="gameSourceNav_SERVER">Server</div>
							<div class="gameSourceNav_tab" id="gameSourceNav_LOCAL">Local</div>
							<div <?php if($devenvironment !== true){ echo "style='/*visibility: hidden;*/'"; } ?>class="gameSourceNav_tab" id="gameSourceNav_URL">URL</div>
						</div>

						<div id="emulatorControls_section_gamefromserver" class="emulatorControls_section miniview active">
							<div class="emulatorControls_section_title">Game from Database:</div>

							<select id="gameMenu_select">
								<option value=""> - Choose a game - </option>
							</select>
							<input id="restartEmulator_button" type="button" value="Restart this game">
							<br>
							<div id="progressBar"></div>
							<br>
							<div style="font-size:18px;font-weight:bold;text-decoration:underline;text-align:center;">Information:</div>
							<div style="font-size:14px;font-weight:normal;text-decoration:none;text-align:left;">
								Games are made available by database entry and are downloaded from the server.
							</div>

							<br>
							<div style="font-size:18px;font-weight:bold;text-decoration:underline;text-align:center;">Direct Links:</div>
							<div class="directGameLinks" id="serverGame_directurl"></div>
							<!--<div class="directGameLinks" id="serverGame_directurl_min">N/A</div>-->
							<br>

						</div>


						<div id="emulatorControls_section_gamefromlocal" class="emulatorControls_section miniview">
							<div class="emulatorControls_section_title">User Supplied Game:</div>

							<div id="userGameFiles">
								<div class="title1">Import a file to begin!</div>
								<div class="title2 hide">Click gamefile to start!</div>

								<div class="filelistdata hide">
									<br>
									Game files:
									<div class="gamefiles"></div>

									<br>
									Data files:
									<div class="datafiles"></div>
									<br>
								</div>

								<div style="text-align:center;">
								<input style="display:none;" id="FilesFromUser" type="file" value="CHOOSE" multiple>
								<input type="button" id="FilesFromUser_viewableBtn" value="Import File(s)" onclick="document.querySelector('#FilesFromUser').click();">
								<input type="button" title="Google Chrome only!" value="Re-read file(s)" onclick="document.querySelector('#FilesFromUser').dispatchEvent(new Event('change'));;">
								</div>

							</div>


							<br>
							<div style="font-size:18px;font-weight:bold;text-decoration:underline;text-align:center;">Information:</div>
							<div style="font-size:14px;font-weight:normal;text-decoration:none;text-align:left;">
								This mode is used for loading files that are not in the Game Manager Database. Additionally, a game with a large datafile can be loaded here instead of downloaded repeatedly from the server.
							</div>
							<br>

						</div>

						<div id="emulatorControls_section_gamefromurl" class="emulatorControls_section miniview">
							<div class="emulatorControls_section_title">Game via URL</div>

							<input id="emulatorControls_section_gamefromurl_url" placeholder="Enter URL" type="text" value="">
							<input id="emulatorControls_section_gamefromurl_get" type="button" value="Retrieve!">
							<input id="emulatorControls_section_gamefromurl_clear" type="button" value="Clear URL!">
							<br>
							<br>

							<div id="userGameFiles_fromURL">
								<div>GAME LOADED:</div>
								<div>The Quest of a Dragon</div>
								<input id="emulatorControls_section_gamefromurl_play" type="button" value="PLAY:">
							</div>

							<div id="userGameFiles_fromURL_infotitle">Information:</div>
							<div id="userGameFiles_fromURL_infoinfo">
								Downloads a .json file with game file settings.<br>
								<br>** On remote servers you MUST configure Access Control headers or this will not work!<br>
								<br>** Example configs: <a href="EXAMPLE_gameViaUrlConfigs.txt" target="_blank">View</a><br>
							</div>

						</div>

					</div>

					<hr>
					<hr>

					<div class="emulatorControls_section_title">Emulator Controls: </div>

					<div class="emulatorControls_section active">

						<figure id="projectsvg">
							<svg width="338" height="158" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 338 158" preserveAspectRatio="xMinYMin meet">
							<image xlink:href="img/CUzeBox_controls.png" x="0" y="0" width="100%" height="100%"></image>

							<g class="hover_group" opacity="0.75"><rect class="svg_gamepad1_btn" name="dirUP" x="69" y="40" width="17" height="32"></rect></g>
							<g class="hover_group" opacity="0.75"><rect class="svg_gamepad1_btn" name="dirDN" x="69" y="96" width="17" height="32"></rect></g>
							<g class="hover_group" opacity="0.75"><rect class="svg_gamepad1_btn" name="dirLT" x="32" y="72" width="32" height="17"></rect></g>
							<g class="hover_group" opacity="0.75"><rect class="svg_gamepad1_btn" name="dirRT" x="88" y="72" width="32" height="17"></rect></g>
							<g class="hover_group" opacity="0.75"><rect class="svg_gamepad1_btn" name="select" x="128" y="80" width="24" height="24"></rect></g>
							<g class="hover_group" opacity="0.75"><rect class="svg_gamepad1_btn" name="start" x="168" y="80" width="24" height="24"></rect></g>
							<g class="hover_group" opacity="0.75"><rect class="svg_gamepad1_btn" name="sL" x="32" y="0" width="80" height="24"></rect></g>
							<g class="hover_group" opacity="0.75"><rect class="svg_gamepad1_btn" name="sR" x="226" y="0" width="80" height="24"></rect></g>
							<g class="hover_group" opacity="0.75"><rect class="svg_gamepad1_btn" name="btnY" x="217" y="69" width="24" height="24"></rect></g>
							<g class="hover_group" opacity="0.75"><rect class="svg_gamepad1_btn" name="btnB" x="250" y="96" width="24" height="24"></rect></g>
							<g class="hover_group" opacity="0.75"><rect class="svg_gamepad1_btn" name="btnX" x="248" y="46" width="24" height="24"></rect></g>
							<g class="hover_group" opacity="0.75"><rect class="svg_gamepad1_btn" name="btnA" x="281" y="69" width="24" height="24"></rect></g>
							</svg>
						</figure>

								<div class="emulatorControls_buttons" id="showEmuControls">Display Controls</div>
								<div class="emulatorControls_buttons" id="stopEmulator_button">Stop Emulator</div>
						</div>

				</div>

				<div class="gameframe_">

					<div class="gameframe_border_top gameframe_borders"></div>

					<div id="middle_cont1">
						<div class="gameframe_border_left gameframe_borders"></div>

						<div id="emscripten_iframe_container">
							<iframe id="emscripten_iframe" frameBorder="0" src="loading.html"></iframe>
						</div>

						<div class="gameframe_border_right gameframe_borders"></div>
					</div>

					<div id="app_emulator_emulator_controls2" class="">
						<!--<input type="button" class="button emu_button1" onclick='document.querySelector("#app_emulator_emulator_iframe").contentWindow.resizeEmulatorView();'   value="Resize Emulator" id="emulatorControls_resize"><br>-->
						<input type="button" class="button emu_button1" value="F2: Quality"       id="emulatorControls_F2">
						<input type="button" class="button emu_button1" value="F3: Debug"         id="emulatorControls_F3">
						<input type="button" class="button emu_button1" value="F7: Flicker"       id="emulatorControls_F7">
						<input type="button" class="button emu_button1" value="F8: Controls"      id="emulatorControls_F8">
						<input type="button" class="button emu_button1" value="F9: Pause"         id="emulatorControls_F9">
						<input type="button" class="button emu_button1" value="F10: Frame-step"  id="emulatorControls_F10">

					</div>
					<div class="gameframe_border_bottom gameframe_borders"></div>

				</div>

			</div>

			<div id="VIEW_gamedbmanager" class="views">
				<div id="darkener_modal_1"></div>
				<div id="modal_1">
					<h3>Add New Game Entry</h3>
					Choose a title for your game.
					<br>
					<input type="text" id="modal_1_title" name="modal_1_title" placeholder="Example: Legends of The Hidden Treasure">
					<br>
					<br>

					New game directory name (cannot be changed later.)
					<br>
					<input type="text" id="modal_1_gamedir" name="modal_1_gamedir" placeholder="Example: lgdsotht">
					<br>
					<br>
					<br>
					When you click 'Save' a new game record will be created and then loaded for you in the game manager.
					<br><br>
					<input type="button" id="modal_1_SAVE" value="SAVE">
					<input type="button" id="modal_1_CANCEL" value="CANCEL">

				</div>

				<div id="VIEW_gamedbmanager_container">
					<div id="gamedata_section">
						<h3>Edit Game Data</h3>
						<div class="writeButton" id="gamedb_new">NEW</div>
						<!--<div class="writeButton" id="gamedb_del">DEL</div>-->
						<div class="nonDevWarning" id="nonDevWarning_gameManager">NOTE: Database updating is only available within the dev environment.</div>

						<table id="completeData_1game">
							<tr><td>title</td>      <td><input id="completeData_1game_title" type="text" value=""></td></tr>
							<tr><td>authors</td>    <td><input id="completeData_1game_authors" type="text" value=""></td></tr>
							<tr><td>gamefile</td>   <td><input id="completeData_1game_gamefile" type="text" value=""></td></tr>
							<tr><td>status</td>     <td>
								<!--<input id="completeData_1game_status" type="text" value=""></td>-->
								<select id="completeData_1game_status">
									<option value=""></option>
									<option value="0">(0) - Not Defined Yet</option>
									<option value="1">(1) - Demo</option>
									<option value="2">(2) - W.I.P.</option>
									<option value="3">(3) - Complete</option>
									<option value="4">(4) - RESERVED</option>
									<option value="5">(5) - RESERVED</option>
								</select>
							</tr>
							<tr><td>added_by</td>   <td><input disabled id="completeData_1game_added_by" type="text" value=""></td></tr>
							<tr><td>id</td>         <td><input disabled id="completeData_1game_id" type="text" value=""></td></tr>
							<tr><td>gamedir</td>    <td><input disabled id="completeData_1game_gamedir" type="text" value=""></td></tr>
							<tr><td>when_added</td> <td><input disabled id="completeData_1game_when_added" type="text" value=""></td></tr>
						</table>

						<div id="completeData_1game_description_container">
							description<br>
							<textarea id="completeData_1game_description_textarea"></textarea>
						</div>

						<div id="completeData_1game_buttons" class="writeButton">
							<br>
							<input type="button" id="completeData_1game_buttons_cancel" value="Cancel (clear form)">
							<input type="button" id="completeData_1game_buttons_update" value="UPDATE">
						</div>
					</div>
					<div id="filemanager_section">
						<h3>Files Found in This Game's Directory</h3>
						<table id="filesInDirectory_table">
						<tr>
							<th>File Name</th>
							<th>Remove?</th>
							<th>Download?</th>
							<th>Set as GAMEFILE?</th>
						</tr>
						</table>

						<div class="writeButton">
							<h3>Add new files to this Game's Directory?</h3>
							<input type="file"   id="newFileUpload_browse" name="newFileUpload_browse" class="" multiple>
							<input type="button" id="newFileUpload_save"   name="newFileUpload_save"   class="" value="Upload File">
						</div>

					</div>
				</div>

				<!--<div id="gamefilelist"></div>-->

				<?php if($devenvironment == true){ ?>
					<a href="../phpliteadmin.php" target="_blank">Full Online Database Manager</a>
				<?php } ?>

			</div>

			<div id="VIEW_misc" class="views">
			<h1>LINKS:</h1>
			<a href="http://uzebox.org/forums" target="_blank">Uzebox Forums</a><br>
			&nbsp;&nbsp;<a href="http://uzebox.org/forums/viewtopic.php?f=9&t=2413" target="_blank">All Uzebox Games Online! (Cuzebox and Emscripten)</a><br>
			&nbsp;&nbsp;<a href="http://uzebox.org/forums/viewtopic.php?f=9&t=2386&start=60" target="_blank">CUzeBox - a new Uzebox emulator in progress</a><br>
			<br>
			<a href="https://github.com/" target="_blank">Github</a><br>
			&nbsp;&nbsp;<a href="https://github.com/nicksen782/OnlineUzeboxPlayer" target="_blank">nicksen782/OnlineUzeboxPlayer</a><br>
			&nbsp;&nbsp;<a href="https://github.com/Jubatian/cuzebox" target="_blank">Jubatian/cuzebox</a><br>
			<br>
			<a href="http://uzebox.org/wiki" target="_blank">Uzebox Wiki</a><br>
			&nbsp;&nbsp;<a href="http://uzebox.org/wiki/index.php?title=Games_and_Demos" target="_blank">Games and Demos</a><br>
			<br>
			<a href="http://www.nicksen782.net/a_demos/Emscripten_Uzebox_Gamechanger/" target="_blank">Non-development Version of this Application.</a><br>
			<br>
			<a target="_blank" href="http://vanilla-js.com/"> <img src="vanillajs_button.png"> </a>

			<?php if($devenvironment == true){ ?>
				<h1>Developer Links</h1>
				http://www.nicksen782.net/r_uzezelda.php<br>
				<a href="https://dev2-nicksen782.c9users.io/web/ACTIVE/Emscripten_Uzebox_Gamechanger/CURRENT/?url=//dev2-nicksen782.c9users.io/non-web/Uzebox/UAM3_Tester/GAME/output/uzebox/remoteload.json" target="_blank">DEV Uze Zelda!</a> - <span style="font-size:45%;">https://dev2-nicksen782.c9users.io/web/ACTIVE/Emscripten_Uzebox_Gamechanger/CURRENT/?url=//dev2-nicksen782.c9users.io/non-web/Uzebox/UAM3_Tester/GAME/output/uzebox/remoteload.json</span>
				<br>
				<a href="http://www.nicksen782.net/a_demos/Emscripten_Uzebox_Gamechanger/CURRENT/?url=//www.nicksen782.net/UzeBridge/remoteload.json" target="_blank">Live Uze Zelda!</a> - <span style="font-size:45%;">http://www.nicksen782.net/a_demos/Emscripten_Uzebox_Gamechanger/CURRENT/?url=//www.nicksen782.net/UzeBridge/remoteload.json</span>
				<br>
				<a href="http://www.nicksen782.net/a_demos/Emscripten_Uzebox_Gamechanger/CURRENT/?ExternalClickPlay=true&externalcontrol=true&url=//dev2-nicksen782.c9users.io/non-web/Uzebox/UzeZelda2017/output_files/remoteload.json" target="_blank">Live Uze Zelda! (autostart with less GUI)</a> - <span style="font-size:45%;">http://www.nicksen782.net/a_demos/Emscripten_Uzebox_Gamechanger/CURRENT/?ExternalClickPlay=true&externalcontrol=true&url=//dev2-nicksen782.c9users.io/non-web/Uzebox/UzeZelda2017/output_files/remoteload.json</span>
				<br>
				<a href="http://uzebox.org/wiki/index.php?title=Legend_of_Zelda_I" target="_blank">Uze Zelda! On Uzebox Wiki</a> - <span style="font-size:45%;">http://uzebox.org/wiki/index.php?title=Legend_of_Zelda_I</span>
				<br>
			<?php } ?>


			</div>
		</div>

	</div>
</div>

</body>
</html>
