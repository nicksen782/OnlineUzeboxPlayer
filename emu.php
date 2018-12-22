<!DOCTYPE html>
<html lang="en">

<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta charset="UTF-8">
	<link rel="icon" href="data:;base64,iVBORw0KGgo=">
	<title>Uzebox Emulator v2b</title>

	<!-- Basic styling -->
	<link rel="stylesheet" type="text/css" href="css/css_reset.css">
	<link rel="stylesheet" type="text/css" href="css/index.css">

	<!--JQUERY STUFF-->
	<!--<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">-->
	<!--<script src="https://code.jquery.com/jquery-1.12.4.js"></script>-->
	<!--<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>-->

	<script src="_featureLoader/js/featureLoader.js"></script>
	<script src="js/index.js"></script>
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
				<input type="button" value="Resize" onclick="document.querySelector('#emscripten_iframe').contentWindow.resizeIframe();;">
				<input type="button" value="Reload" onclick="document.location.href = document.location.href;">
				<input type="button" value="New Window" onclick="window.open(document.location.href);">
				<div class="navOptions" newview="TOP">TOP</div>
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
						<td>From database</td>
						<td>
							<select id="emu_builtInGames_select">
								<option value="">Choose a game</option>
							</select>
						</td>
					</tr>

					<tr>
						<td>From file(s)</td>
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
						<td>From JSON</td>
						<td>
							<input type="text" id="emu_FilesFromJSON" value="">
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

				<div id="emu_onscreenGamepads_nav">
					<div class="emu_onscreenGamepads_navItem">GAMEPADS</div>
					<div class="emu_onscreenGamepads_navItem">INFO/HELP</div>
					<div class="emu_onscreenGamepads_navItem">MISC</div>
				</div>

				<div class="emu_onscreenGamepads_navView">
				#1 #2
				</div>

				<div class="emu_onscreenGamepads_navView">
DB	Choose a built-in game.
User	Use your own game files.
JSON	Supply a URL to a remoteload.json file. You can play games hosted on other servers this way.

NOTE: JSON Method:
** On remote servers you MUST configure Access Control headers or this will not work!
** Example .htaccess config: View
				</div>

				<div class="emu_onscreenGamepads_navView">
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

		<!--<div id="emu_emuControls" class="sectionWindow">-->
		<!--	<div class="sectionWindow_title">Emulator Controls</div>-->
		<!--	<div class="sectionWindow_content">-->
		<!--	</div>-->
		<!--</div>-->

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
					<br>
					<input type="button" value="F2 QUALITY" class="emuControls" id="emuControls_QUALITY">
					<input type="button" value="F3 DEBUG"   class="emuControls" id="emuControls_DEBUG">
					<input type="button" value="F7 FLICKER" class="emuControls" id="emuControls_FLICKER">
					<input type="button" value="F9 PAUSE"   class="emuControls" id="emuControls_PAUSE">
					<input type="button" value="F10 STEP"   class="emuControls" id="emuControls_STEP">
				</div>
				<div id="emscripten_iframe_container">
					<canvas id="emuCanvas" width="100" height="100"></canvas>
					<iframe src="iframe_msg_template.html" frameBorder="0" id="emscripten_iframe"></iframe>
				</div>


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
								MARIO BROS<br>
								LOAD<br>
							</td>
						</tr>
						<tr>
							<td>OPTIONS</td>
							<td>
								Start after compile<br>
								Debug on failures  <br>
								Debug on errors    <br>
								Debug on warnings  <br>
							</td>
					</tr>
					</table>
					COMPILE C2BIN C2BIN2
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
				Debug panel #1
			</div>

			<div class="sectionDivs_title_options">
				<div class="navOptions" newview="TOP">TOP</div>
				<div class="navOptions uamOnly" newview="VIEW">VIEW</div>
				<div class="navOptions uamOnly" newview="DEBUG1">DEBUG1</div>
				<div class="navOptions uamOnly" newview="DEBUG2">DEBUG2</div>
				<div class="navOptions uamOnly" newview="DB">DB</div>
			</div>
		</div>
	</div>

	<div id="emu_debug2" class="sectionDivs">
		<div class="sectionDivs_title">
			<div class="sectionDivs_title_text">
				Debug panel #2
			</div>

			<div class="sectionDivs_title_options">
				<div class="navOptions" newview="TOP">TOP</div>
				<div class="navOptions uamOnly" newview="VIEW">VIEW</div>
				<div class="navOptions uamOnly" newview="DEBUG1">DEBUG1</div>
				<div class="navOptions uamOnly" newview="DEBUG2">DEBUG2</div>
				<div class="navOptions uamOnly" newview="DB">DB</div>
			</div>
		</div>
	</div>

	<div id="emu_db"     class="sectionDivs">
		<div class="sectionDivs_title">
			<div class="sectionDivs_title_text">
				Database Editor
			</div>

			<div class="sectionDivs_title_options">
				<div class="navOptions" newview="TOP">TOP</div>
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
</div>



</body>

</html>


