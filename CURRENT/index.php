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
				<div class="navButton">
					Emulator
				</div>
				<?php if($devenvironment == true){ ?>
				<div class="navButton">
					Games DB
				</div>
				<?php } ?>

			</div>
		</div>

		<div id="top_panel_right">
			<select id="gameMenu_select">
				<option value=""> - Choose a game - </option>
			</select>
			<input id="stopEmulator_button" type="button" value="Stop Emulator">
			<input id="restartEmulator_button" type="button" value="Restart Emulator">
			<br>
			<div id="progressBar"></div>
		</div>

		<div id="top_panel_settings_gear"></div>

	</div>

	<div id="content">

		<div id="middle">
			<div class="gameframe_border">
				<div id="emscripten_iframe_container">
					<iframe id="emscripten_iframe" src="loading.html"></iframe>
				</div>
			</div>
		</div>

	</div>
</div>

</body>
</html>