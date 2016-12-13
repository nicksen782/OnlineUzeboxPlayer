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



			<td>
				<input type="button" id="btn_stopGame" value="Stop Emulator"><br>
			</td>
			<td>
				<input type="button" id="btn_restartGame" value="Restart Emulator"><br>
			</td>
		</tr>
	</table>

<?php
	if( $_SERVER['HTTP_HOST'] == "dev-nicksen782.c9.io" || $_SERVER['SERVER_NAME'] == "dev-nicksen782.c9.io" ){ $devenvironment=true;}else{$devenvironment=false;}
	if($devenvironment){ echo '<a href="APP_gamemanager/gamemanager.php" target="_blank"> test</a>'; }
?>
<div>
        <h3>Controls:</h3>
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
          <li>F7: Toggle flicker reduction (slower with it on)</li>
          <li>F8: Toggle UZEM style keymapping (A, S, Y, X instead of Q, W, A, S)</li>
        </ul>
      </div>
</div>