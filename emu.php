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

	<!--<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>-->
	<!--<script src="js/ie11polyfill.js"></script>-->

	<script src="_featureLoader/js/featureLoader.js"></script>
	<script src="js/emu.js"></script>
	<script src="js/dom.js"></script>
	<script src="js/crossBrowser_initKeyboardEvent.js"></script>
	<!--<script src="CUzeBox_emu_core/combinedFiles_emu.js"></script>-->
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

		<!--This window acts like a modal-->
		<div id="gamepadConfigDiv" class="sectionWindow">
			<div class="sectionWindow_title">
				gamepadConfigDiv
				<span id="gamepadConfig_closeBtn" class="hyperlink1 modalCloseBtn" >(CLOSE)</span>
			</div>

			<div class="sectionWindow_content">

				<div id="gamepadConfigDiv_pads"     class="sectionWindow">
					<div class="sectionWindow_title">
						PADS
					</div>

					<div class="sectionWindow_content">
						<!--Gamepad #1 Image-->
						<div id="emu_gamepadConfig_P1_status" class="emu_gamepadConfig_statuses"></div>
						<div id="emu_gamepadConfig_P1" class="emu_gamepadConfig_div disconnected" draggable="false">

							<figure>
								<svg
									width              ="420" height="160"
									viewBox            ="0 0 420 160"
									preserveAspectRatio="xMinYMin meet"
									version            ="1.1"
									xmlns              ="http://www.w3.org/2000/svg"
									xmlns:xlink        ="http://www.w3.org/1999/xlink"
									class="emu_gamepadConfig_svg"
								>
									<image width="420" height="160" xlink:href="img/CUzeBox_controls_modified.png"></image>
									<g pad="1" uzename="BTN_B"      name="key_A"      id="emuGamepad_1_key_W"      class="hover_group"> <circle cx="316" cy="110" r="15"                        ></circle></g>
									<g pad="1" uzename="BTN_Y"      name="key_Q"      id="emuGamepad_1_key_A"      class="hover_group"> <circle cx="280" cy="81"  r="15"                        ></circle></g>
									<g pad="1" uzename="BTN_SELECT" name="key_SPACE"  id="emuGamepad_1_key_SPACE"  class="hover_group"> <rect   x= "160" y ="77"         width="30" height="30" ></rect>  </g>
									<g pad="1" uzename="BTN_START"  name="key_ENTER"  id="emuGamepad_1_key_ENTER"  class="hover_group"> <rect   x= "200" y ="77"         width="30" height="30" ></rect>  </g>
									<g pad="1" uzename="BTN_UP"     name="key_UP"     id="emuGamepad_1_key_UP"     class="hover_group"> <rect   x= "90"  y ="48"         width="26" height="21" ></rect>  </g>
									<g pad="1" uzename="BTN_DOWN"   name="key_DOWN"   id="emuGamepad_1_key_DOWN"   class="hover_group"> <rect   x= "90"  y ="92"         width="26" height="21" ></rect>  </g>
									<g pad="1" uzename="BTN_LEFT"   name="key_LEFT"   id="emuGamepad_1_key_LEFT"   class="hover_group"> <rect   x= "64"  y ="70"         width="26" height="21" ></rect>  </g>
									<g pad="1" uzename="BTN_RIGHT"  name="key_RIGHT"  id="emuGamepad_1_key_RIGHT"  class="hover_group"> <rect   x= "116" y ="70"         width="26" height="21" ></rect>  </g>
									<g pad="1" uzename="BTN_A"      name="key_S"      id="emuGamepad_1_key_Q"      class="hover_group"> <circle cx="353" cy="81"  r="15"                        ></circle></g>
									<g pad="1" uzename="BTN_X"      name="key_W"      id="emuGamepad_1_key_S"      class="hover_group"> <circle cx="317" cy="52"  r="15"                        ></circle></g>
									<g pad="1" uzename="BTN_SL"     name="key_LSHIFT" id="emuGamepad_1_key_LSHIFT" class="hover_group"> <rect   x= "65"  y ="2"          width="75" height="15" ></rect>  </g>
									<g pad="1" uzename="BTN_SR"     name="key_RSHIFT" id="emuGamepad_1_key_RSHIFT" class="hover_group"> <rect   x= "280" y ="2"          width="75" height="15" ></rect>  </g>
								</svg>
							</figure>
						</div>

						<!--Gamepad #2 Image-->
						<div id="emu_gamepadConfig_P2_status" class="emu_gamepadConfig_statuses"></div>
						<div id="emu_gamepadConfig_P2" class="emu_gamepadConfig_div disconnected" draggable="false">
							<figure>
								<svg
									width              ="420" height="160"
									viewBox            ="0 0 420 160"
									preserveAspectRatio="xMinYMin meet"
									version            ="1.1"
									xmlns              ="http://www.w3.org/2000/svg"
									xmlns:xlink        ="http://www.w3.org/1999/xlink"
									class="emu_gamepadConfig_svg"
								>
									<image width="420" height="160" xlink:href="img/CUzeBox_controls_modified.png"></image>
									<g pad="1" uzename="BTN_B"      name="key_A"      id="emuGamepad_1_key_W"      class="hover_group"> <circle cx="316" cy="110" r="15"                        ></circle></g>
									<g pad="1" uzename="BTN_Y"      name="key_Q"      id="emuGamepad_1_key_A"      class="hover_group"> <circle cx="280" cy="81"  r="15"                        ></circle></g>
									<g pad="1" uzename="BTN_SELECT" name="key_SPACE"  id="emuGamepad_1_key_SPACE"  class="hover_group"> <rect   x= "160" y ="77"         width="30" height="30" ></rect>  </g>
									<g pad="1" uzename="BTN_START"  name="key_ENTER"  id="emuGamepad_1_key_ENTER"  class="hover_group"> <rect   x= "200" y ="77"         width="30" height="30" ></rect>  </g>
									<g pad="1" uzename="BTN_UP"     name="key_UP"     id="emuGamepad_1_key_UP"     class="hover_group"> <rect   x= "90"  y ="48"         width="26" height="21" ></rect>  </g>
									<g pad="1" uzename="BTN_DOWN"   name="key_DOWN"   id="emuGamepad_1_key_DOWN"   class="hover_group"> <rect   x= "90"  y ="92"         width="26" height="21" ></rect>  </g>
									<g pad="1" uzename="BTN_LEFT"   name="key_LEFT"   id="emuGamepad_1_key_LEFT"   class="hover_group"> <rect   x= "64"  y ="70"         width="26" height="21" ></rect>  </g>
									<g pad="1" uzename="BTN_RIGHT"  name="key_RIGHT"  id="emuGamepad_1_key_RIGHT"  class="hover_group"> <rect   x= "116" y ="70"         width="26" height="21" ></rect>  </g>
									<g pad="1" uzename="BTN_A"      name="key_S"      id="emuGamepad_1_key_Q"      class="hover_group"> <circle cx="353" cy="81"  r="15"                        ></circle></g>
									<g pad="1" uzename="BTN_X"      name="key_W"      id="emuGamepad_1_key_S"      class="hover_group"> <circle cx="317" cy="52"  r="15"                        ></circle></g>
									<g pad="1" uzename="BTN_SL"     name="key_LSHIFT" id="emuGamepad_1_key_LSHIFT" class="hover_group"> <rect   x= "65"  y ="2"          width="75" height="15" ></rect>  </g>
									<g pad="1" uzename="BTN_SR"     name="key_RSHIFT" id="emuGamepad_1_key_RSHIFT" class="hover_group"> <rect   x= "280" y ="2"          width="75" height="15" ></rect>  </g>
								</svg>
							</figure>
						</div>

						<div id="emu_gamepadConfig_notes1" class="disconnected" draggable="false">
							Ensure that your gamepad is connected and that you have pushed some buttons to activate it.
						</div>
					</div>
				</div>

				<div id="gamepadConfigDiv_mappings_P1" class="sectionWindow">
					<div class="sectionWindow_title">
						MAPPINGS
					</div>

					<div class="sectionWindow_content">
						<table class="table1 gamepadMappingTable">
							<caption>
								Gamepad #1 (Player 1)
								<br>
								<input id="gp1_setAll" class="gp_setAll" type="button" value="Set all">
							</caption>
							<tr>
								<td name="UP"    >UP    <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="DOWN"  >DOWN  <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="LEFT"  >LEFT  <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="RIGHT" >RIGHT <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="A"     >A     <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="B"     >B     <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="Y"     >Y     <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="X"     >X     <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="SELECT">SELECT<span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="START" >START <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="SL"    >SL    <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="SR"    >SR    <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
						</table>

						<hr>

					</div>
				</div>
				<div id="gamepadConfigDiv_mappings_P2" class="sectionWindow">
					<div class="sectionWindow_title">
						MAPPINGS
					</div>

					<div class="sectionWindow_content">
						<table class="table1 gamepadMappingTable">
							<caption>
								Gamepad #2 (Player 2)
								<br>
								<input id="gp2_setAll" class="gp_setAll" type="button" value="Set all">
							</caption>
							<tr>
								<td name="UP"    >UP    <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="DOWN"  >DOWN  <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="LEFT"  >LEFT  <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="RIGHT" >RIGHT <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="A"     >A     <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="B"     >B     <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="Y"     >Y     <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="X"     >X     <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="SELECT">SELECT<span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="START" >START <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="SL"    >SL    <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
							<tr>
								<td name="SR"    >SR    <span class="gp_cfg_set hyperlink2"></span></td> <td> <span name="map" class="buttonCode"></span> </td>
							</tr>
						</table>

						<hr>

					</div>
				</div>

				<div id="gamepadConfigDiv_datamanager" class="sectionWindow">
					<div class="sectionWindow_title">
						DATA MANAGER
					</div>

					<div class="sectionWindow_content">
						<div class="horizontalCenter">
							<input type="button" id="gpmap_saveChanges" value="Save changes">
							<input type="button" id="gpmap_download_maps" value="Download">
							<input type="button" id="gpmap_upload_maps" value="Upload">
						</div>
					</div>

				</div>
			</div>

		</div>

		<div class="sectionDivs_title">
			<div class="sectionDivs_title_text">
				ONLINE UZEBOX EMULATOR
			</div>

			<div class="sectionDivs_title_options">
				<input type="button" class="debugButtons uamOnly hidden" value="Reload"     onclick="document.location.href = document.location.href;">
				<input type="button" class="debugButtons uamOnly hidden" value="New Window" onclick="window.open(document.location.href);">

				<div class="navOptions uamOnly hidden" newview="TOP"   >TOP</div>
				<div class="navOptions uamOnly hidden" newview="VIEW"  >VIEW</div>
				<div class="navOptions uamOnly hidden" newview="DEBUG1">DEBUG1</div>
				<div class="navOptions uamOnly hidden" newview="DEBUG2">DEBUG2</div>
				<div class="navOptions uamOnly hidden" newview="DB"    >DB</div>
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
							<!--<input type="text" id="emu_FilesFromJSON" value="https://www.nicksen782.net/UzeBridge/NICKSEN782/BUBBLEBOBBLE/remoteload.json" placeholder="Enter JSON file URL">-->
							<!--<input type="text" id="emu_FilesFromJSON" value="https://dev3-nicksen782.c9users.io/non-web/Uzebox/RamTileTest_1/output/remoteload.json" placeholder="Enter JSON file URL">-->
							<input type="text" id="emu_FilesFromJSON" value="" placeholder="Paste JSON file URL">
							<input type="button" id="emu_FilesFromJSON_load" value="Load">
						</td>
					</tr>
				</table>
			</div>
		</div>

		<div id="emu_gameFiles" class="sectionWindow">
			<div class="sectionWindow_title">Game Files</div>
			<div class="sectionWindow_content">
				<div id="emu_filesList_div">
					No files are loaded.
				</div>
				<div id="emu_filesList_links">
				</div>
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
								<text x="25" y="20" style="font-size:18px;font-weight:bold;" fill="black">P1</text>
								<g pad="1" name="key_LEFT"   id="emuGamepad_1_key_LEFT"   class="hover_group"> <rect   x= "64"  y ="70"         width="26" height="21" ></rect>  </g>
								<g pad="1" name="key_UP"     id="emuGamepad_1_key_UP"     class="hover_group"> <rect   x= "90"  y ="48"         width="26" height="21" ></rect>  </g>
								<g pad="1" name="key_RIGHT"  id="emuGamepad_1_key_RIGHT"  class="hover_group"> <rect   x= "116" y ="70"         width="26" height="21" ></rect>  </g>
								<g pad="1" name="key_DOWN"   id="emuGamepad_1_key_DOWN"   class="hover_group"> <rect   x= "90"  y ="92"         width="26" height="21" ></rect>  </g>
								<g pad="1" name="key_SPACE"  id="emuGamepad_1_key_SPACE"  class="hover_group"> <rect   x= "160" y ="77"         width="30" height="30" ></rect>  </g>
								<g pad="1" name="key_ENTER"  id="emuGamepad_1_key_ENTER"  class="hover_group"> <rect   x= "200" y ="77"         width="30" height="30" ></rect>  </g>
								<g pad="1" name="key_LSHIFT" id="emuGamepad_1_key_LSHIFT" class="hover_group"> <rect   x= "65"  y ="2"          width="75" height="15" ></rect>  </g>
								<g pad="1" name="key_RSHIFT" id="emuGamepad_1_key_RSHIFT" class="hover_group"> <rect   x= "280" y ="2"          width="75" height="15" ></rect>  </g>
								<g pad="1" name="key_S"      id="emuGamepad_1_key_Q"      class="hover_group"> <circle cx="353" cy="81"  r="15"                        ></circle></g>
								<g pad="1" name="key_A"      id="emuGamepad_1_key_W"      class="hover_group"> <circle cx="316" cy="110" r="15"                        ></circle></g>
								<g pad="1" name="key_Q"      id="emuGamepad_1_key_A"      class="hover_group"> <circle cx="280" cy="81"  r="15"                        ></circle></g>
								<g pad="1" name="key_W"      id="emuGamepad_1_key_S"      class="hover_group"> <circle cx="317" cy="52"  r="15"                        ></circle></g>
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
								<text x="25" y="20" style="font-size:18px;font-weight:bold;" fill="black">P2</text>
								<g pad="2" name="key_LEFT"   id="emuGamepad_2_key_LEFT"   class="hover_group"> <rect   x ="64"  y ="70"         width="26" height="21" ></rect>  </g>
								<g pad="2" name="key_UP"     id="emuGamepad_2_key_UP"     class="hover_group"> <rect   x ="90"  y ="48"         width="26" height="21" ></rect>  </g>
								<g pad="2" name="key_RIGHT"  id="emuGamepad_2_key_RIGHT"  class="hover_group"> <rect   x ="116" y ="70"         width="26" height="21" ></rect>  </g>
								<g pad="2" name="key_DOWN"   id="emuGamepad_2_key_DOWN"   class="hover_group"> <rect   x ="90"  y ="92"         width="26" height="21" ></rect>  </g>
								<g pad="2" name="key_SPACE"  id="emuGamepad_2_key_SPACE"  class="hover_group"> <rect   x ="160" y ="77"         width="30" height="30" ></rect>  </g>
								<g pad="2" name="key_ENTER"  id="emuGamepad_2_key_ENTER"  class="hover_group"> <rect   x ="200" y ="77"         width="30" height="30" ></rect>  </g>
								<g pad="2" name="key_LSHIFT" id="emuGamepad_2_key_LSHIFT" class="hover_group"> <rect   x ="65"  y ="2"          width="75" height="15" ></rect>  </g>
								<g pad="2" name="key_RSHIFT" id="emuGamepad_2_key_RSHIFT" class="hover_group"> <rect   x ="280" y ="2"          width="75" height="15" ></rect>  </g>
								<g pad="2" name="key_S"      id="emuGamepad_2_key_Q"      class="hover_group"> <circle cx="353" cy="81"  r="15"                        ></circle></g>
								<g pad="2" name="key_A"      id="emuGamepad_2_key_W"      class="hover_group"> <circle cx="316" cy="110" r="15"                        ></circle></g>
								<g pad="2" name="key_Q"      id="emuGamepad_2_key_A"      class="hover_group"> <circle cx="280" cy="81"  r="15"                        ></circle></g>
								<g pad="2" name="key_W"      id="emuGamepad_2_key_S"      class="hover_group"> <circle cx="317" cy="52"  r="15"                        ></circle></g>
							</svg>
						</figure>
					</div>

				</div>

				<div class="emu_misc_view " id="emu_misc_info">
					Methods Of Game Loading:<br><br>
					** DB	Choose a built-in game.<br>
					** User	Use your own game files.<br>
					** JSON	Supply a URL to a remoteload.json file. You can play games hosted on other servers this way.<br>
					<br>

					NOTE: JSON Method:<br>
					** On remote servers you MUST configure Access Control headers or this will not work!<br>
					** Example .htaccess config: View<br>
				</div>

				<div class="emu_misc_view " id="emu_misc_misc">
					LINKS:<br>
					<br>
					Uzebox Forums<br>
					All Uzebox Games Online! (Cuzebox and Emscripten)<br>
					CUzeBox - a new Uzebox emulator in progress<br>
					<br>

					Github<br>
					nicksen782/OnlineUzeboxPlayer<br>
					Jubatian/cuzebox<br>
					<br>

					Uzebox Wiki<br>
					Games and Demos<br>
				</div>

			</div>
		</div>

		<div id="emu_emulator" class="sectionWindow">
			<div class="sectionWindow_title">
				Emulator Screen
				<div id="coresetting">
					<span id="coresetting_text"></span>
					<span id="coresetting_toggle" class="hyperlink1 hidden" onclick="toggleCore();">(Toggle core)</span>
				</div>

				<div id="gamepadIcon_container1" class="gamepadIcon_container" onclick="emu.gamepads.init();">
					<div class="gamepadIcon" title="(method 1) Click to configure your gamepad!"></div>
				</div>

				<span class="hyperlink1 modalOpenBtn" id="gamepadConfig_openBtn">(GAMEPAD CONFIG)</span>
			</div>
			<div class="sectionWindow_content">
				<div class="emu_emuControls" id="emu_emuControlsTOP">
					<button class="emuControls checkbox" id="emuControls_autopause_btn">
						<span id="emuControls_autopause_chk"></span>
						<span>AUTO-PAUSE</span>
					</button>
					<input type="button" value="Resize" class="emuControls" id="emuControls_resize">
					<input type="button" value="STOP"   class="emuControls" id="emuControls_stop">
					<input type="button" value="RELOAD" class="emuControls" id="emuControls_reload">
					<input type="button" value="UNLOAD" class="emuControls" id="emuControls_unload">
					<input style="display:none;" type="button" value="ROTATE" class="emuControls" id="emuControls_rotate">
				</div>

				<div class="emu_emuControls" id="emu_emuControlsBOTTOM">
					<input type="button" value="F2 QUALITY" class="emuControls" id="emuControls_QUALITY">
					<input type="button" value="F3 DEBUG"   class="emuControls" id="emuControls_DEBUG">
					<input type="button" value="F7 FLICKER" class="emuControls" id="emuControls_FLICKER">
					<input type="button" value="F9 PAUSE"   class="emuControls" id="emuControls_PAUSE">
					<input type="button" value="F10 STEP"   class="emuControls" id="emuControls_STEP">
					<input type="button" value="FULLSCREEN" class="emuControls" id="emuControls_FULLSCREEN">
				</div>

				<div id="emscripten_emu_container_outer">
					<div id="emscripten_emu_container">
						<!--<canvas tabindex="0" class="verticalAlign" id="emuCanvas" width="620" height="456"></canvas>-->
						<canvas tabindex="0" class="verticalAlign" id="emuCanvas" width="310" height="228"></canvas>
					</div>
				</div>

			</div>
		</div>

		<div id="emu_view_uam" class="uamOnly">
			<div id="emu_gameSelector_uam" class="sectionWindow uamOnly">
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

			<div id="emu_miniOutput1_uam" class="sectionWindow uamOnly">
				<div class="sectionWindow_title">Compile Output (last)</div>
				<div class="sectionWindow_content">
					<div id="emu_latestCompile" class="dataHolder EMULATOR_protected_Controls"><pre style="overflow: hidden;"></pre></div>
				</div>
			</div>

			<div id="emu_miniOutput2_uam" class="sectionWindow uamOnly">
				<div class="sectionWindow_title">Compile Output (previous)</div>
				<div class="sectionWindow_content">
					<div id="emu_previousCompile" class="dataHolder EMULATOR_protected_Controls"><pre style="overflow: hidden;"></pre></div>
				</div>
			</div>

		</div>

	</div>
	<div id="emu_debug1" class="sectionDivs uamOnly hidden">
		<div class="sectionDivs_title">
			<div class="sectionDivs_title_text">
				DEBUG PANEL #1
			</div>

			<div class="sectionDivs_title_options">
				<div class="navOptions uamOnly hidden" newview="TOP"   >TOP</div>
				<div class="navOptions uamOnly hidden" newview="VIEW"  >VIEW</div>
				<div class="navOptions uamOnly hidden" newview="DEBUG1">DEBUG1</div>
				<div class="navOptions uamOnly hidden" newview="DEBUG2">DEBUG2</div>
				<div class="navOptions uamOnly hidden" newview="DB"    >DB</div>
			</div>
		</div>

		<div id="emu_debug1_output1" class="sectionWindow uamOnly">
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
	<div id="emu_debug2" class="sectionDivs uamOnly hidden">
		<div class="sectionDivs_title">
			<div class="sectionDivs_title_text">
				DEBUG PANEL #2
			</div>

			<div class="sectionDivs_title_options">
				<div class="navOptions uamOnly hidden" newview="TOP"   >TOP</div>
				<div class="navOptions uamOnly hidden" newview="VIEW"  >VIEW</div>
				<div class="navOptions uamOnly hidden" newview="DEBUG1">DEBUG1</div>
				<div class="navOptions uamOnly hidden" newview="DEBUG2">DEBUG2</div>
				<div class="navOptions uamOnly hidden" newview="DB"    >DB</div>
			</div>
		</div>

		<div id="emu_debug2_output1" class="sectionWindow uamOnly">
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
	<div id="emu_db"     class="sectionDivs uamOnly hidden">
		<div class="sectionDivs_title">
			<div class="sectionDivs_title_text">
				DATABASE EDITOR
			</div>

			<div class="sectionDivs_title_options">
				<input type="button" class="debugButtons uamOnly hidden" value="Reload"     onclick="document.location.href = document.location.href;">
				<input type="button" class="debugButtons uamOnly hidden" value="New Window" onclick="window.open(document.location.href);">

				<div class="navOptions uamOnly hidden" newview="TOP"   >TOP</div>
				<div class="navOptions uamOnly hidden" newview="VIEW"  >VIEW</div>
				<div class="navOptions uamOnly hidden" newview="DEBUG1">DEBUG1</div>
				<div class="navOptions uamOnly hidden" newview="DEBUG2">DEBUG2</div>
				<div class="navOptions uamOnly hidden" newview="DB"    >DB</div>
			</div>
		</div>

		<div id="emu_db_gameChoice"   class="sectionWindow uamOnly">
			<div class="sectionWindow_title">Game Select</div>
			<div class="sectionWindow_content">
				<select id="db_gameSelect" class="myButton" >
					<option value="">Choose a game</option>
				</select>
				<input type="button" class="myButton" id="db_gameSelect_load"   value="Re-load selected game data">
			</div>
		</div>
		<div id="emu_db_gameMetadata" class="sectionWindow uamOnly">
			<div class="sectionWindow_title">Game Data</div>
			<div class="sectionWindow_content">
				<table class="table1">
					<tr> <td>Title</td>      <td> <input type="text" id="db_dataField_title"    value=""> </td> </tr>
					<tr> <td>Authors</td>    <td> <input type="text" id="db_dataField_authors"  value=""> </td> </tr>
					<tr> <td>Status</td>     <td> <select class="myButton"  id="db_dataField_status"><option value="0"></option></select> </td> </tr>
					<tr> <td>Added By</td>   <td> <input type="text" id="db_dataField_addedBy"   readonly value=""> </td> </tr>
					<tr> <td>Game Id</td>    <td> <input type="text" id="db_dataField_gameid"    readonly value=""> </td> </tr>
					<tr> <td>Game Dir</td>   <td> <input type="text" id="db_dataField_gameDir"   readonly value=""> </td> </tr>
					<tr> <td>When Added</td> <td> <input type="text" id="db_dataField_whenAdded" readonly value=""> </td> </tr>
					<tr> <td>Game File</td>  <td> <input type="text" id="db_dataField_gameFile"  readonly value=""> </td> </tr>
					<tr> <td>Game Files</td> <td> <input type="text" id="db_dataField_gameFiles" readonly value=""> </td> </tr>
				</table>
				<textarea id="db_dataField_description"></textarea>
			</div>
		</div>
		<div id="emu_db_files"        class="sectionWindow uamOnly">
			<div class="sectionWindow_title">GAME FILES</div>
			<div class="sectionWindow_content">
				<!--These are the files that the database says this game has. Additionally, a list of all files in the game directory.-->
				<!--Upload a game file with this button.-->

				<div id="emu_db_files_included">
					<!--emu_db_files_included-->
				</div>
				<div id="emu_db_files_allInDir">
					<!--emu_db_files_allInDir-->
				</div>
				<div id="emu_db_files_uploadDiv">
					<input type="file" id="db_builtInGames_fileUpload" multiple="">
					<input type="button" id="db_builtInGames_fileUpload_visible" value="Add files">
				</div>
			</div>
		</div>
		<div id="emu_db_options"      class="sectionWindow uamOnly">
			<div class="sectionWindow_title">OPTIONS</div>
			<div class="sectionWindow_content">
			<table class="table1">
					<caption>Options</caption>
					<tr> <td> <input type="button" class="myButton" id="db_gameSelect_update" value="Update selected game"> </td> </tr>
					<tr> <td> <input type="button" class="myButton" id="db_gameSelect_create" value="Create new game"> </td> </tr>
					<tr> <td> <input type="button" class="myButton" id="db_gameSelect_delete" value="Delete selected game"> </td> </tr>
				</table>

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


