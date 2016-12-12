<div id="gameselect_menu">
	Choose an Uzebox game<br>
	<table>
		<tr>
			<td>Non-SD</td>
			<td><select id="chooseGameFromServer"><option value=""></option></select></td>
		</tr>
		<tr>
			<td>SD</td>
			<td><select id="chooseGameFromServerSD"><option value=""></option></select></td>
		</tr>
		<tr>



			<td colspan="2">
				<!--<input type="button" id="btn_startGame" value="Start Emulator"><br>-->
				<input type="button" id="btn_restartGame" value="Restart Emulator"><br>
			</td>
		</tr>
	</table>

<?php
	if( $_SERVER['HTTP_HOST'] == "dev-nicksen782.c9.io" || $_SERVER['SERVER_NAME'] == "dev-nicksen782.c9.io" ){ $devenvironment=true;}else{$devenvironment=false;}
	if($devenvironment){ echo '<a href="APP_gamemanager/gamemanager.php" target="_blank"> test</a>'; }
?>
<h3>Currently only Player 1's SNES controller is added, as follows:</h3>
<ul>
<li>Arrow keys: D-Pad</li>
<li>Q: Button Y</li>
<li>W: Button X</li>
<li>A: Button B</li>
<li>S: Button A</li>
<li>Enter: Start</li>
<li>Space: Select</li>
<li>Left shift: Left shift</li>
<li>Right shift: Right shift</li>
</ul>

<h4>The emulator itself can be controlled with the following keys:</h4>
<ul>
<li>ESC: Exit</li>
<li>F2: Toggle low quality display (faster, but blurry and ugly)</li>
<li>F3: Toggle debug informations (slightly faster with them off)</li>
<li>F4: Toggle frame rate limiter</li>
<li>F5: Toggle video capture (only if compiled in)</li>
<li>F7: Toggle frame merging (slower, eliminates flicker in some games)</li>
<li>F8: Toggle keymap between SNES and UZEM (Default: SNES)</li>
<li>F11: Toggle full screen</li>
</ul>
</div>