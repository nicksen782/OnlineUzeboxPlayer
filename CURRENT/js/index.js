var thefiles = [];
var sometest="";
// function supertest(arg1){
// 	console.info("arg1:", arg1);
// }

function loadUserGameIntoEmu(gamefile){

	var callback = function(resp) {
		resp = JSON.parse(resp);

		// Remove previous iframe. Create another one.
		document.getElementById('emscripten_iframe').remove();

		var iframe = document.createElement('iframe');
		iframe.setAttribute("frameBorder", "0");
		iframe.id = "emscripten_iframe";

		document.getElementById('emscripten_iframe_container').appendChild(iframe);

		iframe.contentWindow.document.open();
		iframe.contentWindow.document.write(resp.iframehtml);
		iframe.contentWindow.document.close();
	};

	document.getElementById('gameMenu_select').value = "";

	var thedata = {
		o: "loadUserGameIntoEmu",
		gamefile: gamefile
	};
	serverPOSTrequest(thedata, callback, "gateway_p.php");
}

function sendKeyToIframe(keyCode){
	var evt = new Event('keydown');
	evt.keyCode = keyCode;
	document.querySelector('#emscripten_iframe').contentDocument.dispatchEvent(evt);
}
function resizeEmulatorView(){
	// emulatorControls_resize
	var outer = document.getElementById('emscripten_iframe');
	var inner = outer.contentDocument.body;

	// Get the emulator inner canvas
	// var emuCanvas = outer.contentDocument.querySelector('#canvas');

	// Get the emulator container
	var thisIframeContainer = document.querySelector('#emscripten_iframe_container');

	// Get the emulator iframe
	var thisIframe = document.querySelector('#emscripten_iframe');

	// Get the middle emulator view container
	var middle_cont1 = document.querySelector('#middle_cont1');

	// Check if the inner #canvas exists.
	var iframeHTMLdimensions;
	try{
		iframeHTMLdimensions = document.getElementById('emscripten_iframe').contentDocument.querySelector('#canvas').getBoundingClientRect();
	}
	catch(e){
		console.info("The inner #canvas did not exist. Using inner html dimensions instead.");
		iframeHTMLdimensions = document.getElementById('emscripten_iframe').contentDocument.querySelector('html').getBoundingClientRect();
	}

	thisIframe.style.width           = iframeHTMLdimensions.width+"px";//emuCanvas.style.width;
	thisIframeContainer.style.width  = iframeHTMLdimensions.width+"px";//emuCanvas.style.width;

	thisIframe.style.height          = iframeHTMLdimensions.height+"px";//emuCanvas.style.height;
	thisIframeContainer.style.height = iframeHTMLdimensions.height+"px";//emuCanvas.style.height;
	middle_cont1.style.height        = iframeHTMLdimensions.height+"px";//emuCanvas.style.height;

	var midContainer = document.getElementById('middle_cont1') ;
	var lBorder = document.getElementById('gameframe_border_left')
	var rBorder = document.getElementById('gameframe_border_right')

	document.querySelector('.gameframe_border_left').style.width  = ((midContainer.getBoundingClientRect().width - iframeHTMLdimensions.width)/2) + "px";
	document.querySelector('.gameframe_border_right').style.width = ((midContainer.getBoundingClientRect().width - iframeHTMLdimensions.width)/2) + "px";

	// var zoom = screen.height / document.querySelector('body').offsetHeight*90; document.querySelector('html').style.zoom = +zoom+"%";
}
function viewSwitcher(view) {
	// First, hide everything.
	[].map.call(document.querySelectorAll('.views'),
		function(elem, index, elems) {
			elem.classList.remove('show');
		});
	[].map.call(document.querySelectorAll('.panels'),
		function(elem, index, elems) {
			elem.classList.remove('show');
		});

	// Now show the selected app view.
	switch (view) {
		case "emu":
			{
				document.getElementById('top_panel_right').classList.add('show');
				document.getElementById('top_panel_right_user').classList.add('show');
				document.getElementById('VIEW_emulator').classList.add('show');
				break;
			}
		case "gamedbman":
			{
				document.getElementById('top_panel_right_gamemanager').classList.add('show');
				document.getElementById('VIEW_gamedbmanager').classList.add('show');
				break;
			}
		default:
			{
				document.getElementById('top_panel_right').classList.add('show');
				document.getElementById('VIEW_emulator').classList.add('show');
				break;
			}

			// document.getElementById('stopEmulator_button').click();
	}

}
function loadGameIntoEmu(game){
	var callback = function(resp) {
		resp = JSON.parse(resp);
		// console.log("loadGame callback called. Number found:", resp.count, "(should be 1.)");

		// Remove previous iframe. Create another one.
		document.getElementById('emscripten_iframe').remove();

		var iframe = document.createElement('iframe');
		iframe.setAttribute("frameBorder", "0");
		iframe.id = "emscripten_iframe";

		document.getElementById('emscripten_iframe_container').appendChild(iframe);

		iframe.contentWindow.document.open();
		iframe.contentWindow.document.write(resp.iframehtml);
		iframe.contentWindow.document.close();
	};

	// var game = document.getElementById('gameMenu_select').value;

	var thedata = {
		o: "loadGame",
		game: game
	};
	serverPOSTrequest(thedata, callback, "gateway_p.php");
}

	function newFilesFromuser() {
		console.log("files:", this.files);
		var _this = this;

		// Clear the rows of the table.
		// Get a handle on the table and then clear the table.
		var userGameFiles = document.querySelector("#userGameFiles");
		userGameFiles.innerHTML = "";

		// NOTHING SHOULD ACTUALLY UPLOAD TO THE SERVER!

		// Create a local (global) variable of file data.
		thefiles=[];

		// Use the filereader api to convert data to blob/arraybuffer.
		for (var i = 0; i < _this.files.length; i++) {
			if(i==0){ userGameFiles.innerHTML += "Click gamefile to start:<br>"; }
			var reader = new FileReader();
			reader.onload = (function(e) {
				var filedata = e.target.result;
				var filedata2 = new Int8Array(filedata);
				console.log("the file data:", filedata);
				// console.log("e", e);
				// console.info(i, this.fileobj.name, this.fileext, filedata);
				thefiles.push(
					{filename:this.fileobj.name, completefilepath:filedata2, ext:this.fileext}
				);

				// Add contents to the new row's cells.
				userGameFiles.innerHTML += "<div class='userGameFileLink' onclick='loadUserGameIntoEmu(\""+this.fileobj.name+"\");'>" + this.fileobj.name + "</div>";
			});
			// Get the file extension.
			reader.fileobj = _this.files[i];
			reader.fileext = reader.fileobj.name.substr((~-reader.fileobj.name.lastIndexOf(".") >>> 0) + 2);
			reader.readAsArrayBuffer(reader.fileobj);

		}

	}
	function mouseEnterEmuIframe(){
		// console.log('enter');
		document.getElementById('emscripten_iframe').focus();
	}
	function emulatorControls_F2(){
		sendKeyToIframe(113); // F2
	}
	function emulatorControls_F3(){
		sendKeyToIframe(114); // F3
		setTimeout(function(){ resizeEmulatorView(); }, 250);
	}
	function emulatorControls_F7(){
		sendKeyToIframe(118); // F7
	}
	function emulatorControls_F8(){
		sendKeyToIframe(119); // F8
	}
	function stopEmulator(){
		document.getElementById('emscripten_iframe_container').querySelector('iframe').src = "loading.html";
		document.querySelector('#emulatorControls_title').innerHTML    ="";
		document.querySelector('#emulatorControls_gamefile').innerHTML ="";
	}
	function restartEmulator(){
		document.getElementById('gameMenu_select').dispatchEvent(new Event('change'));
	}
	function serverGameMenu_select(){
		var game = document.getElementById('gameMenu_select').value;
		loadGameIntoEmu(game);
		document.getElementById('gameMenu_select2').value = game;
		document.getElementById('gameMenu_select2').dispatchEvent(new Event('change'));
	}
	function serverGameDbMenu(){
		var callback = function(resp) {
			resp = JSON.parse(resp);
			var gamedata = resp.result;
			var filelist = resp.filelist;

			// Clear the form.
			document.getElementById('completeData_1game_buttons_cancel').click(); //dispatchEvent(new Event('click'));

			// Load the form with data.
			document.getElementById('completeData_1game_id').value = gamedata.id;
			document.getElementById('completeData_1game_title').value = gamedata.title;
			document.getElementById('completeData_1game_authors').value = gamedata.authors;
			document.getElementById('completeData_1game_gamedir').value = gamedata.gamedir;
			document.getElementById('completeData_1game_gamefile').value = gamedata.gamefile;
			document.getElementById('completeData_1game_added_by').value = gamedata.added_by;
			document.getElementById('completeData_1game_status').value = gamedata.status;
			document.getElementById('completeData_1game_when_added').value = gamedata.when_added;
			document.getElementById('completeData_1game_description_textarea').value = gamedata['description'];

			reloadGameFileList(gamedata, filelist);

			// Make visible the save and cancel buttons.
		};

		var game = document.getElementById('gameMenu_select2').value;
		document.getElementById('gameMenu_select').value = game;

		var thedata = {
			o: "loadGame_intoManager",
			game: game
		};
		serverPOSTrequest(thedata, callback, "gateway_p.php");
	}
	function gameDbFileUpdate(){
		var gameid=document.querySelector("#completeData_1game_id").value;
		newFileUpload(gameid);

	}
	function newFileUpload(id) {
	// Get a handle on the browse files button. It has the files.
	var files = document.querySelector('#newFileUpload_browse').files;

	// Quick sanity checks.
	if(!id){ alert("You will need to choose a game before you can actually add a file to it."); return; }
	if(!files.length){ alert("You will need to choose files to upload before you can actually upload them."); return; }

	// Create new FormData.
	var fd = new FormData();

	// Apply 'o' value.
	fd.append("o", "newFileUpload");
	fd.append("gameid", id);

	// Add files.
	for (var f = 0; f < files.length; f++) {
		fd.append("file_" + f, files[f]);
	}

	// Create new xhr.
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'gateway_p.php', true);

	// Configure onprogress (progress bar)
	xhr.upload.onprogress = function(e) {
		var updateBtn = document.getElementById('completeData_1game_buttons_update');
		if (e.lengthComputable) {
			var percentComplete = (e.loaded / e.total) * 100;
			//console.log(percentComplete + '% uploaded');
		}
	};

	// Configure what to do with the response.
	xhr.onload = function() {
		if (this.status == 200) {
			// Reset the filelist.
			document.querySelector('#newFileUpload_browse').value = "";
			var resp = JSON.parse(this.response);
			console.log('Server got:', resp);

			if(resp.unauthorized){ alert("You have no business using this feature. It has been disabled for a reason."); window.location.reload(); return; }
			else{
				console.log('Server got:', resp);
				// Reload the game list.
				reloadGameFileList(resp.gamedata, resp.filelist);
			}

		}
	};

	// Send the xhr.
	xhr.send(fd);
}
	function show_modal1(){ modal_1(true); }
	function hide_modal1(){ modal_1(false); }
	function modal_1(display){
		var darkener = document.querySelector("#darkener_modal_1");
		var modal = document.querySelector("#modal_1");

		if(display==true){
			// Show the modal darkener and the modal.
			darkener.classList.add('show');
			modal.classList.add('show');
		}
		else{
			// Hide the modal darkener and the modal.
			darkener.classList.remove('show');
			modal.classList.remove('show');
		}

	}
	function gameDbForm_cancel(){
		// Clear the form.
		[].map.call(document.querySelectorAll('#VIEW_gamedbmanager input[type="text"], #VIEW_gamedbmanager textarea'),
			function(elem, index, elems) {
				elem.value = "";
			}
		);
		// document.getElementById('gamefilelist').innerHTML = "";
		var thetable = document.querySelector("#filesInDirectory_table");
		for(var i = 1; i < thetable.rows.length;){
			thetable.deleteRow(i);
		}
		document.querySelector('#newFileUpload_browse').value = "";
	}
	function gameDbForm_update(){
		// Get the data from the form and pass it as an object to the game update function.
		var infoObj = {};
		infoObj.id          = document.getElementById('completeData_1game_id').value;
		infoObj.title       = document.getElementById('completeData_1game_title').value;
		infoObj.authors     = document.getElementById('completeData_1game_authors').value;
		infoObj.gamedir     = document.getElementById('completeData_1game_gamedir').value;
		infoObj.gamefile    = document.getElementById('completeData_1game_gamefile').value;
		infoObj.added_by    = document.getElementById('completeData_1game_added_by').value;
		infoObj.status      = document.getElementById('completeData_1game_status').value;
		infoObj.when_added  = document.getElementById('completeData_1game_when_added').value;
		infoObj.description = document.getElementById('completeData_1game_description_textarea').value;

		updateGameInfo(infoObj);
		// document.getElementById('completeData_1game_buttons_cancel').click(); //dispatchEvent(new Event('click'));
	}

window.onload = function() {
	if (window.opener && window.opener !== window) {
		// We have been opened by some other window. If compatible it will have a variable that we can read.
		console.log("**** Seems we have been opened up by Javascript! ****", window.opener.pageTitle);
	}

	// getGameList(false);	// Call but do not specify a game id.
	getGameList(gameid_GET, null);	// Call but do not specify a game id.

	viewSwitcher("emu");
	// viewSwitcher("gamedbman");

	resizeEmulatorView();

	document.getElementById('FilesFromUser').addEventListener('change', newFilesFromuser);
	// Emulator
	document.getElementById('emscripten_iframe_container').addEventListener('mouseenter', mouseEnterEmuIframe);

	// Emulator - Side panel (left)
	document.getElementById('emulatorControls_resize').addEventListener('click', resizeEmulatorView	);
	document.getElementById('emulatorControls_F2').addEventListener('click', emulatorControls_F2);
	document.getElementById('emulatorControls_F3').addEventListener('click', emulatorControls_F3);
	document.getElementById('emulatorControls_F7').addEventListener('click', emulatorControls_F7);
	document.getElementById('emulatorControls_F8').addEventListener('click', emulatorControls_F8 );

	// Emulator - Top-right panel
	document.getElementById('stopEmulator_button').addEventListener('click', stopEmulator );
	document.getElementById('restartEmulator_button').addEventListener('click', restartEmulator );
	document.getElementById('gameMenu_select').addEventListener('change', serverGameMenu_select );

	// Games DB
	document.getElementById('gameMenu_select2').addEventListener('change', serverGameDbMenu);
	document.getElementById('newFileUpload_save').addEventListener('click', gameDbFileUpdate);
	document.getElementById('gamedb_new').addEventListener('click', show_modal1 );
	document.getElementById('modal_1_CANCEL').addEventListener('click', hide_modal1 );
	document.getElementById('modal_1_SAVE').addEventListener('click', newGameRecord	);
	document.getElementById('darkener_modal_1').addEventListener('click', hide_modal1 );
	document.getElementById('completeData_1game_buttons_cancel').addEventListener('click', gameDbForm_cancel );
	document.getElementById('completeData_1game_buttons_update').addEventListener('click', gameDbForm_update );
};

function setGameFile(gamefile){
	document.getElementById('completeData_1game_gamefile').value = gamefile;
	document.getElementById('completeData_1game_buttons_update').click();
}
function reloadGameFileList(gamedata, filelist){
	// Get a handle on the table and then clear the table.
	var thetable = document.querySelector("#filesInDirectory_table");
	for(var i = 1; i < thetable.rows.length;){
		thetable.deleteRow(i);
	}
	var tbody = thetable.querySelector("tbody");
	var row ;
	var removeBtn;
	var removeGameFile_onclick_text;
	var gamefileBtn;
	var gamefileBtn_onclick_text;

	for (var f = 0; f < filelist.length; f++) {
		// Insert a new row for each file entry returned.
		row = thetable.insertRow(1);

		// Add contents to the new row's cells.
		var cell0 = row.insertCell(0); cell0.innerHTML = filelist[f] ;
		var cell1 = row.insertCell(1); cell1.innerHTML = "" ;
		var cell2 = row.insertCell(2); cell2.innerHTML = "<a href='" + gamedata.gamedir + filelist[f] + "' title='Download this file'>" + filelist[f] + "</a>" ;
		var cell3 = row.insertCell(3); cell3.innerHTML = "" ;

		removeBtn = document.createElement('input');
		removeGameFile_onclick_text = "removeGameFile('"+filelist[f]+"', '"+gamedata.id+"');";
		removeBtn.setAttribute('class', 'writeButton');
		removeBtn.setAttribute('onclick', removeGameFile_onclick_text);
		removeBtn.setAttribute('type', 'button');
		removeBtn.setAttribute('title', "removeGameFile"+filelist[f]+" ");
		removeBtn.setAttribute('value', "REMOVE");
		// removeBtn.classList.add('writeButton');
		cell1.appendChild(removeBtn);

		gamefileBtn = document.createElement('input');
		gamefileBtn_onclick_text = "setGameFile('"+filelist[f]+"');";
		gamefileBtn.setAttribute('class', 'writeButton');
		gamefileBtn.setAttribute('onclick', gamefileBtn_onclick_text);
		gamefileBtn.setAttribute('type', 'button');
		gamefileBtn.setAttribute('title', "setGameFile('"+filelist[f]+"'); ");
		gamefileBtn.setAttribute('value', "Set as gamefile (Auto-save)");
		// gamefileBtn.classList.add('writeButton');
		cell3.appendChild(gamefileBtn);

		// Add the new row to the table body.
		tbody.appendChild(row);
	}
}
function serverPOSTrequest(dataObj, callback, url) {
	// Display the progress animation.
	document.getElementById('progressBar').classList.add('show');
	document.getElementById('progressBar2').classList.add('show');

	var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance
	xmlhttp.open("POST", url ? url : "index_p.php"); // Use the specified url. If no url then use the default.

	if (!dataObj.fileupload) {
		xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	}

	else {
		xmlhttp.setRequestHeader("Content-Type", "multipart/form-data");
	}

	// xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4 && xmlhttp.status == "200") {
			document.getElementById('progressBar').classList.remove('show');
			document.getElementById('progressBar2').classList.remove('show');
			callback(xmlhttp.responseText);
			// Hide the progress animation.
		}
	}

	if (!dataObj.fileupload) {
		dataObj = Object.keys(dataObj).map(function(k) {
			return encodeURIComponent(k) + '=' + encodeURIComponent(dataObj[k]);
		}).join('&');
	}

	xmlhttp.send(dataObj);
}
function iframeIsReadyNow(currentgame, uzerom, filelist) {
	// Iframe reports that it is ready!
	console.info(
		"The emulator is ready!",
		"\n Game Title: ", currentgame,
		"\n Game File:  ", uzerom,
		"\n Filelist:   ", filelist,
		"\n\n"
	);

	document.querySelector('#emulatorControls_title').innerHTML    =""+currentgame;
	document.querySelector('#emulatorControls_gamefile').innerHTML =""+uzerom;

	document.getElementById('emscripten_iframe').focus();

	setTimeout(function(){ resizeEmulatorView(); }, 500);

}
function updateGameInfo(infoObj) {
	if(!infoObj.id){ alert("Game data is not loaded. You will need to choose a game from the list."); return; }

	var callback = function(resp) {
		resp = JSON.parse(resp);

		if(resp.unauthorized){ alert("You have no business using this feature. It has been disabled for a reason."); window.location.reload(); return; }
		else{
			console.log('Server got:', resp);
			// Reload the game list.
			getGameList(null, infoObj.id);
			// reloadGameFileList(resp.gamedata, resp.filelist);
		}

	};

	var thedata = infoObj;
	thedata.o = "updateGameInfo";

	serverPOSTrequest(thedata, callback, "gateway_p.php");
}
function AJAX_datarequest(){
	var xhr = new XMLHttpRequest();
	xhr.upload.addEventListener("progress", updateProgress);
	xhr.upload.addEventListener("load", transferComplete);
	xhr.upload.addEventListener("error", transferFailed);
	xhr.upload.addEventListener("abort", transferCanceled);

	// progress on transfers from the server to the client (downloads)
	function updateProgress (oEvent) {
	  if (oEvent.lengthComputable) {
	    var percentComplete = oEvent.loaded / oEvent.total;
	    // ...
	  } else {
	    // Unable to compute progress information since the total size is unknown
	    // ?
	  }
	}

	function transferComplete(evt) { console.log("The transfer is complete.");}

	function transferFailed(evt) { console.log("An error occurred while transferring the file."); }

	function transferCanceled(evt) { console.log("The transfer has been canceled by the user."); }

}
function removeGameFile(filename, gameid){

	var conf1 = confirm("Are you sure that you want to delete the file:\n\n"+filename+"?");
	console.log( "removeGameFile", filename, gameid, conf1 );

	if(!conf1){ alert("File deletion has been canceled."); return; }
	else{
		var conf2 = confirm("Last chance! This file is TOAST if you click OK. Are you sure that you want to delete the file:\n\n"+filename+"?");
		if(!conf2){ alert("File deletion has been canceled. (although you clicked OK once. Please be careful."); return; }
	}

	// Ask the system to remove the file.

	// Create new FormData.
	var fd = new FormData();

	// Apply 'o' value.
	fd.append("o", "removeGameFile");
	fd.append("filename", filename);
	fd.append("gameid", gameid);

	// Create new xhr.
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'gateway_p.php', true);

	// Configure onprogress (progress bar)
	xhr.upload.onprogress = function(e) {
		if (e.lengthComputable) {
			var percentComplete = (e.loaded / e.total) * 100;
			console.log(percentComplete + '% uploaded');
		}
	};

	// Configure what to do with the response.
	xhr.onload = function() {
		if (this.status == 200) {
			// Reset the filelist.
			var resp = JSON.parse(this.response);
			if(resp.unauthorized){ alert("You have no business using this feature. It has been disabled for a reason."); window.location.reload(); return; }
			else{
				console.log('Server got:', resp);
				reloadGameFileList(resp.gamedata, resp.filelist);
			}
		}
	};

	// Send the xhr.
	xhr.send(fd);

}
function newGameRecord(){
	// This creates a mostly new blank games db record and then loads it.

	// Send the new title to the server
	var fd = new FormData();

	// Apply 'o' value.
	fd.append("o", "newGameRecord");
	// Read the values in the modal's inputs.
	fd.append("title", document.querySelector("#modal_1_title").value);
	fd.append("gamedir", document.querySelector("#modal_1_gamedir").value);

	// Create new xhr.
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'gateway_p.php', true);

	// Configure onprogress (progress bar)
	xhr.upload.onprogress = function(e) {
		if (e.lengthComputable) {
			var percentComplete = (e.loaded / e.total) * 100;
			console.log(percentComplete + '% uploaded');
		}
	};

	// Configure what to do with the response.
	xhr.onload = function() {
		if (this.status == 200) {
			// Cancel out the modal.
			// document.getElementById('modal_1_CANCEL').click();
			hide_modal1();

			// Reset the filelist.
			var resp = JSON.parse(this.response);
			console.info("From server:", resp);

			if(resp.unauthorized){ alert("You have no business using this feature. It has been disabled for a reason."); window.location.reload(); return; }
			else{
				var callback = function(resp) {
					resp = JSON.parse(resp);
						console.log('Server got:', resp);

						var gamedata = resp.result;
						var filelist = resp.filelist;

						// Clear the form.
						document.getElementById('completeData_1game_buttons_cancel').click(); //dispatchEvent(new Event('click'));

						// Load the form with data.
						document.getElementById('completeData_1game_id').value = gamedata.id;
						document.getElementById('completeData_1game_title').value = gamedata.title;
						document.getElementById('completeData_1game_authors').value = gamedata.authors;
						document.getElementById('completeData_1game_gamedir').value = gamedata.gamedir;
						document.getElementById('completeData_1game_gamefile').value = gamedata.gamefile;
						document.getElementById('completeData_1game_added_by').value = gamedata.added_by;
						document.getElementById('completeData_1game_status').value = gamedata.status;
						document.getElementById('completeData_1game_when_added').value = gamedata.when_added;
						document.getElementById('completeData_1game_description_textarea').value = gamedata['description'];

						console.log(null, gamedata.id);
						getGameList(null, gamedata.id);

						// Make visible the save and cancel buttons.
				};

				var game = resp.gamedata.id;

				var thedata = {
					o: "loadGame_intoManager",
					game: game
				};
				serverPOSTrequest(thedata, callback, "gateway_p.php");

			}
		}
	};

	// Send the xhr.
	xhr.send(fd);


}

function getGameList(autostartGame, gameDbValue) {
	var callback = function(resp) {
		// Parse the array right away.
		resp = JSON.parse(resp);
		resp = resp.result;

		// Stop the emulator.
		document.getElementById('stopEmulator_button').click();

		// Prepare variables, get handle on the select menu.
		var menus = [ document.getElementById('gameMenu_select'), document.getElementById('gameMenu_select2') ];
		var option;
		var i;
		var optgroup;

		// Break down the response into array groups by status.
		function addToGamelistMenu(obj1, searchKey, searchValue, spacerLabel, titleLabel){
			var separatedArray = [];
			// Go through each index of the recordset.
			for (var i = 0; i < obj1.length; i++) {
				// Now look through a specific key of the current record.
				if(obj1[i][searchKey] == searchValue){ separatedArray.push(obj1[i]); }
			}

			// We have the matching status in a new array. Go through it and add to the games list menu.

			// If there are no status matches then just end this function.
			if(!separatedArray.length){ return; }

			// Create/Add option group - title
			optgroup = document.createElement('optgroup');
			optgroup.setAttribute('label', titleLabel+" ("+separatedArray.length+")");
			menus[m].appendChild(optgroup);

			// Add the new options under the title.
			for (i = 0; i < separatedArray.length; i++) {
				option = document.createElement('option');
				option.setAttribute('value', separatedArray[i].id);
				option.innerHTML = separatedArray[i].title;
				menus[m].appendChild(option);
			}

			// Create/Add option group - spacer
			optgroup = document.createElement('optgroup');
			optgroup.setAttribute('label', spacerLabel);
			menus[m].appendChild(optgroup);

			// return separatedArray;
		}
		for (var m = 0; m < menus.length; m++) {
			menus[m].length = 1;
			[].map.call(menus[m].querySelectorAll('optgroup'), function(elem, index, elems) { elem.remove(); });
			addToGamelistMenu(resp, 'status', '3', '', 'Complete');
			addToGamelistMenu(resp, 'status', '2', '', 'W.I.P.');
			addToGamelistMenu(resp, 'status', '1', '', 'Demo');
			addToGamelistMenu(resp, 'status', '0', '', 'Not Defined Yet');
			addToGamelistMenu(resp, 'status', '4', '', 'RESERVED');
			addToGamelistMenu(resp, 'status', '5', '', 'RESERVED');
		}

		if(autostartGame){
			document.getElementById('gameMenu_select').value = autostartGame;
			var game = document.getElementById('gameMenu_select').value;
			loadGameIntoEmu(game);
		}
		if(gameDbValue){
			console.info("POPULATED! gameDbValue", gameDbValue);
			document.getElementById('gameMenu_select2').value = gameDbValue;
		}

	};

	var thedata = {
		o: "getGameList"
	};
	this.serverPOSTrequest(thedata, callback, "gateway_p.php");
}
