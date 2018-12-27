<!DOCTYPE html>
<html lang="en">

<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta charset="UTF-8">
	<link rel="icon" href="data:;base64,iVBORw0KGgo=">
	<title>Uzebox Emulator v2b</title>

	<!-- Basic styling -->
	<link rel="stylesheet" type="text/css" href="css/css_reset.css">
	<link rel="stylesheet" type="text/css" href="css/normalize801.css">
	<link rel="stylesheet" type="text/css" href="css/html5boilerplate.css">
	<link rel="stylesheet" type="text/css" href="css/customBaseline.css">
	<link rel="stylesheet" type="text/css" href="css/emu.css">

	<!--JQUERY STUFF-->
	<!--<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">-->
	<!--<script src="https://code.jquery.com/jquery-1.12.4.js"></script>-->
	<!--<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>-->

	<script src="_featureLoader/js/featureLoader.js"></script>
	<script src="js/emu.js"></script>
	<script src="js/dom.js"></script>
	<script src="js/crossBrowser_initKeyboardEvent.js"></script>
	<!--<script src="js/xml2json.min.js"></script>-->

<script>

// console.log(
// JSON.stringify({
// 	"charCode": e["charCode"] ,
// 	"code"    : e["code"]     ,
// 	"key"     : e["key"]      ,
// 	"keyCode" : e["keyCode"]  ,
// 	"which"   : e["which"]    ,
// 	"code"    : e["code"]     ,
// 	"location": e["location"]
// }, null, 0)
// );


</script>

</head>

<body>

<div id="bodyHeader">
	ONLINE UZEBOX EMULATOR V2B

</div>

<div id="bodyContainer">

	<div id="emu_view"   class="sectionDivs">
		<div class="sectionDivs_title">
			<div class="sectionDivs_title_text">
				ONLINE UZEBOX EMULATOR
			</div>

			<div class="sectionDivs_title_options">
				<input type="button" value="FULL SCREEN" onclick="emu.fullscreen.test('#emuCanvas');">
				<input type="button" value="Resize" onclick="document.querySelector('#emscripten_iframe').contentWindow.resizeIframe();">
				<input type="button" value="Reload" onclick="document.location.href = document.location.href;">
				<input type="button" value="New Window" onclick="window.open(document.location.href);">

				<div class="navOptions"         newview="TOP">TOP</div>
				<div class="navOptions uamOnly" newview="VIEW">VIEW</div>
				<div class="navOptions uamOnly" newview="DEBUG1">DEBUG1</div>
				<div class="navOptions uamOnly" newview="DEBUG2">DEBUG2</div>
				<div class="navOptions uamOnly" newview="DB">DB</div>
			</div>
		</div>

		<div id="emu_gameSelector" class="sectionWindow">
			<div class="sectionWindow_title">Game Selection</div>
			<div class="sectionWindow_content">

				<table class="table1">
					<tr>
						<td>Database</td>
						<td>
							<select id="emu_builtInGames_select">
								<option value="">Choose a game</option>
							</select>
						</td>
					</tr>

					<tr>
						<td>File(s)</td>
						<td>
							<!--Actual file upload buttons (hidden)-->
							<input id="emu_FilesFromUser" type="file" value="CHOOSE" multiple="">
							<!--Actual file upload buttons (hidden)-->

							<!--Visible upload buttons-->
							<input type="button" id="emu_FilesFromUser_viewableBtn" value="Import File(s)">
							<!--Visible upload buttons-->
						</td>
					</tr>

					<tr>
						<td>JSON</td>
						<td>
							<input type="text" id="emu_FilesFromJSON" value="https://www.nicksen782.net/UzeBridge/NICKSEN782/BUBBLEBOBBLE/remoteload.json" placeholder="Enter JSON file URL">
							<input type="button" id="emu_FilesFromJSON_load" value="Load">
						</td>
					</tr>
				</table>
			</div>
		</div>

		<div id="emu_gameFiles" class="sectionWindow">
			<div class="sectionWindow_title">emu_gameFiles</div>
			<div class="sectionWindow_content">
				<div id="emu_filesList_div">
					Loaded game files will appear here.
				</div>
				DOWNLOAD AS .ZIP
			</div>
		</div>

		<div id="emu_onscreenGamepads" class="sectionWindow">
			<div class="sectionWindow_title">Gamepads and Info</div>
			<div class="sectionWindow_content">

				<div id="emu_misc_nav">
					<div view="emu_misc_gamepads" class="emu_misc_navItem active">GAMEPADS</div>
					<div view="emu_misc_info"     class="emu_misc_navItem">INFO/HELP</div>
					<div view="emu_misc_misc"     class="emu_misc_navItem">MISC</div>
				</div>

				<div class="emu_misc_view noSelect active" id="emu_misc_gamepads" draggable="false">

					<div id="emu_onscreenGamepads_1" draggable="false">
						<figure>
							<svg
								width              ="420" height="160"
								viewBox            ="0 0 420 160"
								preserveAspectRatio="xMinYMin meet"
								version            ="1.1"
								xmlns              ="http://www.w3.org/2000/svg"
								xmlns:xlink        ="http://www.w3.org/1999/xlink"
								id                 ="emu_gamepad1"
							>
								<image width="420" height="160" xlink:href="img/CUzeBox_controls_modified.png"></image>
								<g class="hover_group"> <rect   id="emuGamepad_1_key_LEFT"   x= "64"  y ="70"         width="26" height="21" name="dirLT" ></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_1_key_UP"     x= "90"  y ="48"         width="26" height="21" name="dirUP" ></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_1_key_RIGHT"  x= "116" y ="70"         width="26" height="21" name="dirRT" ></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_1_key_DOWN"   x= "90"  y ="92"         width="26" height="21" name="dirDN" ></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_1_key_SPACE"  x= "160" y ="77"         width="30" height="30" name="select"></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_1_key_ENTER"  x= "200" y ="77"         width="30" height="30" name="start" ></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_1_key_LSHIFT" x= "65"  y ="2"          width="75" height="15" name="sL"    ></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_1_key_RSHIFT" x= "280" y ="2"          width="75" height="15" name="sR"    ></rect>  </g>
								<g class="hover_group"> <circle id="emuGamepad_1_key_Q"      cx="353" cy="81"  r="15"                        name="btnA"  ></circle></g>
								<g class="hover_group"> <circle id="emuGamepad_1_key_W"      cx="316" cy="110" r="15"                        name="btnB"  ></circle></g>
								<g class="hover_group"> <circle id="emuGamepad_1_key_A"      cx="280" cy="81"  r="15"                        name="btnY"  ></circle></g>
								<g class="hover_group"> <circle id="emuGamepad_1_key_S"      cx="317" cy="52"  r="15"                        name="btnX"  ></circle></g>
							</svg>
						</figure>
					</div>

					<div id="emu_onscreenGamepads_2" draggable="false">
						<figure>
							<svg
								width="420" height="160"
								viewBox            ="0 0 420 160"
								preserveAspectRatio="xMinYMin meet"
								version            ="1.1"
								xmlns              ="http://www.w3.org/2000/svg"
								xmlns:xlink        ="http://www.w3.org/1999/xlink"
								id                 ="emu_gamepad2"
							>
								<image width="420" height="160" xlink:href="img/CUzeBox_controls_modified.png"></image>
								<g class="hover_group"> <rect   id="emuGamepad_2_key_LEFT"   x ="64"  y ="70"         width="26" height="21" name="dirLT" ></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_2_key_UP"     x ="90"  y ="48"         width="26" height="21" name="dirUP" ></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_2_key_RIGHT"  x ="116" y ="70"         width="26" height="21" name="dirRT" ></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_2_key_DOWN"   x ="90"  y ="92"         width="26" height="21" name="dirDN" ></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_2_key_SPACE"  x ="160" y ="77"         width="30" height="30" name="select"></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_2_key_ENTER"  x ="200" y ="77"         width="30" height="30" name="start" ></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_2_key_LSHIFT" x ="65"  y ="2"          width="75" height="15" name="sL"    ></rect>  </g>
								<g class="hover_group"> <rect   id="emuGamepad_2_key_RSHIFT" x ="280" y ="2"          width="75" height="15" name="sR"    ></rect>  </g>
								<g class="hover_group"> <circle id="emuGamepad_2_key_Q"      cx="353" cy="81"  r="15"                        name="btnA"  ></circle></g>
								<g class="hover_group"> <circle id="emuGamepad_2_key_W"      cx="316" cy="110" r="15"                        name="btnB"  ></circle></g>
								<g class="hover_group"> <circle id="emuGamepad_2_key_A"      cx="280" cy="81"  r="15"                        name="btnY"  ></circle></g>
								<g class="hover_group"> <circle id="emuGamepad_2_key_S"      cx="317" cy="52"  r="15"                        name="btnX"  ></circle></g>
							</svg>
						</figure>
					</div>

				</div>

				<div class="emu_misc_view" id="emu_misc_info">
					DB	Choose a built-in game.
					User	Use your own game files.
					JSON	Supply a URL to a remoteload.json file. You can play games hosted on other servers this way.

					NOTE: JSON Method:
					** On remote servers you MUST configure Access Control headers or this will not work!
					** Example .htaccess config: View
				</div>

				<div class="emu_misc_view" id="emu_misc_misc">
					LINKS:

					Uzebox Forums
					All Uzebox Games Online! (Cuzebox and Emscripten)
					CUzeBox - a new Uzebox emulator in progress

					Github
					nicksen782/OnlineUzeboxPlayer
					Jubatian/cuzebox

					Uzebox Wiki
					Games and Demos
				</div>

			</div>
		</div>

		<div id="emu_emulator" class="sectionWindow">
			<div class="sectionWindow_title">Emulator Screen</div>
			<div class="sectionWindow_content">
				<div id="emu_emuControls2">
					<!--<label class="emuControls">-->
					<!--</label>-->

					<button class="emuControls checkbox" id="emuControls_autopause_btn">
						<span id="emuControls_autopause_chk"></span>
						<span>AUTO-PAUSE</span>
					</button>

					<input type="button" value="STOP" class="emuControls" id="emuControls_stop">
					<input type="button" value="RELOAD" class="emuControls" id="emuControls_reload">
					<input type="button" value="UNLOAD" class="emuControls" id="emuControls_unload">
					<input type="button" value="ROTATE" class="emuControls" id="emuControls_rotate">
				</div>

				<div id="emscripten_iframe_container_outer">
					<div id="emscripten_iframe_container">
						<canvas tabindex="0" id="emuCanvas" width="640" height="560"></canvas>
						<iframe src="iframe_msg_template.html" frameBorder="0" id="emscripten_iframe"></iframe>
					</div>
				</div>

					<input type="button" value="F2 QUALITY" class="emuControls" id="emuControls_QUALITY">
					<input type="button" value="F3 DEBUG"   class="emuControls" id="emuControls_DEBUG">
					<input type="button" value="F7 FLICKER" class="emuControls" id="emuControls_FLICKER">
					<input type="button" value="F9 PAUSE"   class="emuControls" id="emuControls_PAUSE">
					<input type="button" value="F10 STEP"   class="emuControls" id="emuControls_STEP">

			</div>
		</div>

		<div id="emu_view_uam" class="uamOnly enabled">
			<div id="emu_gameSelector_uam" class="sectionWindow uamOnly enabled">
				<div class="sectionWindow_title">Game Selection (UAM)</div>
				<div class="sectionWindow_content">
					<table class="table1">
						<tr>
							<td>GAME</td>
							<td>
								<input type="text" id="emu_FilesFromJSON_UAM"        value="" placeholder="Enter JSON file URL">
								<select id="emu_gameSelect_UAM_select">
									<option></option>
								</select>
								<input type="button" id="emu_FilesFromJSON_UAM_load" value="Load">
							</td>
						</tr>
						<tr>
							<td>OPTIONS</td>
							<td>
								<span class="checkbox_button" id="emu_compileOptions_UAM_chk1"><span class="checkbox enabled"></span></span>Start after compile
								<br>
								<span class="checkbox_button" id="emu_compileOptions_UAM_chk2"><span class="checkbox enabled"></span></span>Debug on failures
								<br>
								<span class="checkbox_button" id="emu_compileOptions_UAM_chk3"><span class="checkbox enabled"></span></span>Debug on errors
								<br>
								<span class="checkbox_button" id="emu_compileOptions_UAM_chk4"><span class="checkbox "       ></span></span>Debug on warnings
								<br>
							</td>
					</tr>
					</table>
						<input type="button" id="emu_compile_UAM" value="COMPILE">
						<input type="button" id="emu_c2bin_UAM" value="C2BIN">
						<input type="button" id="emu_c2bin2_UAM" value="C2BIN2">
				</div>
			</div>

			<div id="emu_miniOutput1_uam" class="sectionWindow uamOnly enabled">
				<div class="sectionWindow_title">Compile Output (last)</div>
				<div class="sectionWindow_content">
					<div id="emu_latestCompile" class="dataHolder EMULATOR_protected_Controls"><pre style="overflow: hidden;"></pre></div>
				</div>
			</div>

			<div id="emu_miniOutput2_uam" class="sectionWindow uamOnly enabled">
				<div class="sectionWindow_title">Compile Output (previous)</div>
				<div class="sectionWindow_content">
					<div id="emu_previousCompile" class="dataHolder EMULATOR_protected_Controls"><pre style="overflow: hidden;"></pre></div>
				</div>
			</div>

		</div>

	</div>

	<div id="emu_debug1" class="sectionDivs">
		<div class="sectionDivs_title">
			<div class="sectionDivs_title_text">
				DEBUG PANEL #1
			</div>

			<div class="sectionDivs_title_options">
				<input type="button" value="FULL SCREEN" onclick="emu.fullscreen.test('#emuCanvas');">
				<input type="button" value="Resize" onclick="document.querySelector('#emscripten_iframe').contentWindow.resizeIframe();">
				<input type="button" value="Reload" onclick="document.location.href = document.location.href;">
				<input type="button" value="New Window" onclick="window.open(document.location.href);">

				<div class="navOptions"         newview="TOP">TOP</div>
				<div class="navOptions uamOnly" newview="VIEW">VIEW</div>
				<div class="navOptions uamOnly" newview="DEBUG1">DEBUG1</div>
				<div class="navOptions uamOnly" newview="DEBUG2">DEBUG2</div>
				<div class="navOptions uamOnly" newview="DB">DB</div>
			</div>
		</div>

		<div id="emu_debug1_output1" class="sectionWindow uamOnly enabled">
			<div class="sectionWindow_title">
				Full Compile Output
					<input type="button" onclick="document.querySelector('#emu_compile_UAM').click();" value="COMPILE">
					<input type="button" onclick="document.querySelector('#emu_c2bin_UAM').click();"   value="C2BIN">
					<input type="button" onclick="document.querySelector('#emu_c2bin2_UAM').click();"  value="C2BIN2">
			</div>
			<div class="sectionWindow_content">
				<div class="output"></div>
			</div>
		</div>

	</div>

	<div id="emu_debug2" class="sectionDivs">
		<div class="sectionDivs_title">
			<div class="sectionDivs_title_text">
				DEBUG PANEL #2
			</div>

			<div class="sectionDivs_title_options">
				<input type="button" value="FULL SCREEN" onclick="emu.fullscreen.test('#emuCanvas');">
				<input type="button" value="Resize" onclick="document.querySelector('#emscripten_iframe').contentWindow.resizeIframe();">
				<input type="button" value="Reload" onclick="document.location.href = document.location.href;">
				<input type="button" value="New Window" onclick="window.open(document.location.href);">

				<div class="navOptions"         newview="TOP">TOP</div>
				<div class="navOptions uamOnly" newview="VIEW">VIEW</div>
				<div class="navOptions uamOnly" newview="DEBUG1">DEBUG1</div>
				<div class="navOptions uamOnly" newview="DEBUG2">DEBUG2</div>
				<div class="navOptions uamOnly" newview="DB">DB</div>
			</div>
		</div>

		<div id="emu_debug2_output1" class="sectionWindow uamOnly enabled">
			<div class="sectionWindow_title">
				DEBUG #2
				<input type="button" onclick="document.querySelector('#emu_compile_UAM').click();" value="COMPILE">
				<input type="button" onclick="document.querySelector('#emu_c2bin_UAM').click();"   value="C2BIN">
				<input type="button" onclick="document.querySelector('#emu_c2bin2_UAM').click();"  value="C2BIN2">
			</div>

			<div class="sectionWindow_content">
				<div class="output"></div>
			</div>
		</div>

	</div>

	<div id="emu_db"     class="sectionDivs">
		<div class="sectionDivs_title">
			<div class="sectionDivs_title_text">
				DATABASE EDITOR
			</div>

			<div class="sectionDivs_title_options">
				<input type="button" value="FULL SCREEN" onclick="emu.fullscreen.test('#emuCanvas');">
				<input type="button" value="Resize" onclick="document.querySelector('#emscripten_iframe').contentWindow.resizeIframe();">
				<input type="button" value="Reload" onclick="document.location.href = document.location.href;">
				<input type="button" value="New Window" onclick="window.open(document.location.href);">

				<div class="navOptions"         newview="TOP">TOP</div>
				<div class="navOptions uamOnly" newview="VIEW">VIEW</div>
				<div class="navOptions uamOnly" newview="DEBUG1">DEBUG1</div>
				<div class="navOptions uamOnly" newview="DEBUG2">DEBUG2</div>
				<div class="navOptions uamOnly" newview="DB">DB</div>
			</div>
		</div>

		<div id="emu_db_gameChoice"   class="sectionWindow uamOnly enabled">
			<div class="sectionWindow_title">emu_db_gameChoice</div>
			<div class="sectionWindow_content">
			</div>
		</div>
		<div id="emu_db_gameMetadata" class="sectionWindow uamOnly enabled">
			<div class="sectionWindow_title">emu_db_gameMetadata</div>
			<div class="sectionWindow_content">
			</div>
		</div>
		<div id="emu_db_files"        class="sectionWindow uamOnly enabled">
			<div class="sectionWindow_title">emu_db_files</div>
			<div class="sectionWindow_content">
			</div>
		</div>
		<div id="emu_db_upload"       class="sectionWindow uamOnly enabled">
			<div class="sectionWindow_title">emu_db_upload</div>
			<div class="sectionWindow_content">
			</div>
		</div>

	</div>


</div>
<div id="bodyFooter">
UAM5 (2018) Nickolas Andersen (nicksen782)
	<table id="paletteViewTable">
		<tr>
			<td> <div class="notVisible">&nbsp-;&nbsp;</div> </td>
			<td> <div title="bgcolor1" class="bgcolor1">&nbsp;</div> </td>
			<td> <div title="bgcolor2" class="bgcolor2">&nbsp;</div> </td>
			<td> <div title="bgcolor3" class="bgcolor3">&nbsp;</div> </td>
			<td> <div title="bgcolor4" class="bgcolor4">&nbsp;</div> </td>
			<td> <div title="bgcolor5" class="bgcolor5">&nbsp;</div> </td>

			<td> <div class="notVisible">&nbsp;-&nbsp;</div> </td>
			<td> <div title="color-primary-0" class="color-primary-0">&nbsp;</div> </td>
			<td> <div title="color-primary-1" class="color-primary-1">&nbsp;</div> </td>
			<td> <div title="color-primary-2" class="color-primary-2">&nbsp;</div> </td>
			<td> <div title="color-primary-3" class="color-primary-3">&nbsp;</div> </td>
			<td> <div title="color-primary-4" class="color-primary-4">&nbsp;</div> </td>

			<td> <div class="notVisible">&nbsp;-&nbsp;</div> </td>
			<td> <div title="color-secondary-1-0" class="color-secondary-1-0">&nbsp;</div> </td>
			<td> <div title="color-secondary-1-1" class="color-secondary-1-1">&nbsp;</div> </td>
			<td> <div title="color-secondary-1-2" class="color-secondary-1-2">&nbsp;</div> </td>
			<td> <div title="color-secondary-1-3" class="color-secondary-1-3">&nbsp;</div> </td>
			<td> <div title="color-secondary-1-4" class="color-secondary-1-4">&nbsp;</div> </td>

			<td> <div class="notVisible">&nbsp;-&nbsp;</div> </td>
			<td> <div title="color-secondary-2-0" class="color-secondary-2-0">&nbsp;</div> </td>
			<td> <div title="color-secondary-2-1" class="color-secondary-2-1">&nbsp;</div> </td>
			<td> <div title="color-secondary-2-2" class="color-secondary-2-2">&nbsp;</div> </td>
			<td> <div title="color-secondary-2-3" class="color-secondary-2-3">&nbsp;</div> </td>
			<td> <div title="color-secondary-2-4" class="color-secondary-2-4">&nbsp;</div> </td>
			<td> <div class="notVisible">&nbsp;-&nbsp;</div> </td>
		</tr>
	</table>
</div>

<div id="entireBodyDiv" class="modals" onclick="emu.funcs.shared.activateProgressBar(false);"></div>
<div id="progressbarDiv"></div>

</body>

</html>


