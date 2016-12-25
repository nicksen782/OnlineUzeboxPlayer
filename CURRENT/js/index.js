function reloadUserGameFileList(filelist){
	// Get a handle on the table and then clear the table.
	var thetable = document.querySelector("#userGameFiles");
	for(var i = 1; i < thetable.rows.length;){
		thetable.deleteRow(i);
	}
	var tbody = thetable.querySelector("tbody");
	var row ;
	var removeBtn;
	var removeGameFile_onclick_text;
	var gamefileBtn;
	var gamefileBtn_onclick_text;

	for (var f = 0; f< filelist.length; f++) {
		// Insert a new row for each file entry returned.
		row = thetable.insertRow(1);

		// Add contents to the new row's cells.
		var cell0 = row.insertCell(0); cell0.innerHTML = filelist[f] ;
		var cell1 = row.insertCell(1); cell1.innerHTML = "" ;

		removeBtn = document.createElement('button');
		removeGameFile_onclick_text = "removeGameFile('"+filelist[f]+"', '"+gamedata.id+"');";
		removeBtn.setAttribute('onclick', removeGameFile_onclick_text);
		removeBtn.setAttribute('title', "removeGameFile"+filelist[f]+" <--");
		removeBtn.innerHTML = "REMOVE";
		cell1.appendChild(removeBtn);

		// Add the new row to the table body.
		tbody.appendChild(row);
	}
}


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

	// var game = document.getElementById('gameMenu_select').value;

	var thedata = {
		o: "loadUserGameIntoEmu",
		gamefile: gamefile
	};
	serverPOSTrequest(thedata, callback, "gateway_p.php");
}

function sendKeyToIframe(keyCode){
	var evt = new Event('keydown');
	evt.keyCode = keyCode;
	document.querySelector('#emscripten_iframe').contentDocument.dispatchEvent(evt)
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

	var iframeHTMLdimensions = document.getElementById('emscripten_iframe').contentDocument.querySelector('html').getBoundingClientRect();
	// var iframeHTMLdimensions = document.getElementById('emscripten_iframe').contentDocument.querySelector('#canvas').getBoundingClientRect();

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

	// function addfiles(obj) {
	// 	// Has different FileReaders for different types of data uploads.
	// 	// This uses the correct FileReader which then within its callback function will store the actual file data and meta data.
	// 	var filedata;
	// 	var reader;
	// 	var _this = this;

	// 	// Cycle through all uploaded files and add them one at a time.
	// 	for (var i = 0; i < obj.files.length; i++) {
	// 		// Get the file extension.
	// 		obj.files[i].fileext = obj.files[i].name.substr((~-obj.files[i].name.lastIndexOf(".") >>> 0) + 2);

	// 		// Create FileReader to handle this type of data.
	// 		// Store the file after reading it.
	// 		reader = new FileReader();
	// 		reader.fileobj = obj.files[i];
	// 		reader.onload = (function(e) {
	// 			var filedata = e.target.result.split('"').join('');
	// 			_this.addfiletoFS(this.fileobj, filedata);
	// 		});

	// 		// Get the data.
	// 		if (
	// 			obj.files[i].fileext == "inc" ||
	// 			obj.files[i].fileext == "xml" ||
	// 			obj.files[i].fileext == "json" ||
	// 			obj.files[i]['type'] == "text/plain") {
	// 			// console.log("Reading file as text");
	// 			filedata = reader.readAsText((obj.files[i]));
	// 		}
	// 		else {
	// 			// Handle binary (non-plain-text files.)
	// 			// console.log("Reading file as dataurl");
	// 			filedata = reader.readAsDataURL(obj.files[i], obj);
	// 		}
	// 	}
	// }

window.onload = function() {
	if (window.opener && window.opener !== window) {
		// We have been opened by some other window. If compatible it will have a variable that we can read.
		console.log("**** Seems we have been opened up by Javascript! ****", window.opener.pageTitle);
	}

	document.getElementById('FilesFromUser').addEventListener('change', function() {
		console.log("files:", this.files);
		var _this = this;

		// Clear the rows of the table.
		// Get a handle on the table and then clear the table.
		var thetable = document.querySelector("#userGameFiles");
		for(var i = 1; i < thetable.rows.length;){
			thetable.deleteRow(i);
		}
		var tbody = thetable.querySelector("tbody");
		var row ;
		var removeBtn;
		var removeGameFile_onclick_text;

		// var _this = document.getElementById('FilesFromUser');

		// NOTHING SHOULD ACTUALLY UPLOAD TO THE SERVER!

		// Create a local (global) variable of file data.
		thefiles=[];
		// Use the filereader api to convert data to blob/arraybuffer.
		for (var i = 0; i < _this.files.length; i++) {
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

				// Insert a new row for each file entry returned.
				row = thetable.insertRow(1);

				// Add contents to the new row's cells.
				var cell0 = row.insertCell(0); cell0.innerHTML = "<span class='userGameFileLink' onclick='loadUserGameIntoEmu(\""+this.fileobj.name+"\");'>" + this.fileobj.name + "</span>";

				// Add the new row to the table body.
				tbody.appendChild(row);

			});
			// Get the file extension.
			reader.fileobj = _this.files[i];
			reader.fileext = reader.fileobj.name.substr((~-reader.fileobj.name.lastIndexOf(".") >>> 0) + 2);
			reader.readAsArrayBuffer(reader.fileobj);
		}


		// Trigger the new game load. It will use a different function to load the emulator.

	});

	getGameList(false);

	viewSwitcher("emu");
	// viewSwitcher("gamedbman");

resizeEmulatorView();

	// Emulator
	document.getElementById('emscripten_iframe_container').addEventListener('mouseenter', function() {
		document.getElementById('emscripten_iframe').focus();
	});

	// Emulator - Side panel (left)
	document.getElementById('emulatorControls_resize').addEventListener('click', function() {
		resizeEmulatorView();
	});
	document.getElementById('emulatorControls_F2').addEventListener('click', function() {
		sendKeyToIframe(113); // F2
	});
	document.getElementById('emulatorControls_F3').addEventListener('click', function() {
		sendKeyToIframe(114); // F3
		setTimeout(function(){ resizeEmulatorView(); }, 250);

	});
	document.getElementById('emulatorControls_F7').addEventListener('click', function() {
		sendKeyToIframe(118); // F7
	});
	document.getElementById('emulatorControls_F8').addEventListener('click', function() {
		sendKeyToIframe(119); // F8
	});

	// Emulator - Top-right panel
	document.getElementById('stopEmulator_button').addEventListener('click', function() {
		document.getElementById('emscripten_iframe_container').querySelector('iframe').src = "loading.html";
		document.getElementById('emulatorControls_title').innerHTML="TITLE:<br>"+"";
		document.getElementById('emulatorControls_gamefile').innerHTML="GAMEFILE:<br>"+"";
	});
	document.getElementById('restartEmulator_button').addEventListener('click', function() {
		document.getElementById('gameMenu_select').dispatchEvent(new Event('change'));
	});


	document.getElementById('gameMenu_select').addEventListener('change', function() {
		var game = document.getElementById('gameMenu_select').value;
		loadGameIntoEmu(game);
		return;
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

		var game = document.getElementById('gameMenu_select').value;

		var thedata = {
			o: "loadGame",
			game: game
		};
		serverPOSTrequest(thedata, callback, "gateway_p.php");

	});

	// Games DB
	document.getElementById('gameMenu_select2').addEventListener('change', function() {
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
			document.getElementById('completeData_1game_uses_sd').value = gamedata.uses_sd;
			document.getElementById('completeData_1game_addedby').value = gamedata.addedby;
			document.getElementById('completeData_1game_complete').value = gamedata.complete;
			document.getElementById('completeData_1game_lastupload').value = gamedata.lastupload;
			document.getElementById('completeData_1game_validheader').value = gamedata.validheader;
			document.getElementById('completeData_1game_description_textarea').value = gamedata['description'];

			reloadGameFileList(gamedata, filelist);

			// Make visible the save and cancel buttons.
		};

		var game = document.getElementById('gameMenu_select2').value;

		var thedata = {
			o: "loadGame_intoManager",
			game: game
		};
		serverPOSTrequest(thedata, callback, "gateway_p.php");

	});
	document.querySelector('#newFileUpload_save').addEventListener('click', function(e) {
		var gameid=document.querySelector("#completeData_1game_id").value;
		newFileUpload(gameid);
	}, false);
	document.getElementById('gamedb_new').addEventListener('click', function() {
		show_modal_1(true);
	});
	document.getElementById('modal_1_SAVE').addEventListener('click', function() {
		newGameRecord();
	});
	document.getElementById('darkener_modal_1').addEventListener('click', function() {
		// Cancel out the modal.
		document.getElementById('modal_1_CANCEL').click();
	});
	document.getElementById('modal_1_CANCEL').addEventListener('click', function() {
		// Hide the modal.
		show_modal_1(false);
	});
	document.getElementById('completeData_1game_buttons_cancel').addEventListener('click', function() {
		// Clear the form.
		[].map.call(document.querySelectorAll('#VIEW_gamedbmanager input[type="text"], #VIEW_gamedbmanager textarea'),
			function(elem, index, elems) {
				elem.value = "";
			});
		// document.getElementById('gamefilelist').innerHTML = "";
		var thetable = document.querySelector("#filesInDirectory_table");
		for(var i = 1; i < thetable.rows.length;){
			thetable.deleteRow(i);
		}
		document.querySelector('#newFileUpload_browse').value = "";
	});
	document.getElementById('completeData_1game_buttons_update').addEventListener('click', function() {
		// Get the data from the form and pass it as an object to the game update function.
		var infoObj = {};
		infoObj.id = document.getElementById('completeData_1game_id').value;
		infoObj.title = document.getElementById('completeData_1game_title').value;
		infoObj.authors = document.getElementById('completeData_1game_authors').value;
		infoObj.gamedir = document.getElementById('completeData_1game_gamedir').value;
		infoObj.gamefile = document.getElementById('completeData_1game_gamefile').value;
		infoObj.uses_sd = document.getElementById('completeData_1game_uses_sd').value;
		infoObj.addedby = document.getElementById('completeData_1game_addedby').value;
		infoObj.complete = document.getElementById('completeData_1game_complete').value;
		infoObj.lastupload = document.getElementById('completeData_1game_lastupload').value;
		infoObj.validheader = document.getElementById('completeData_1game_validheader').value;
		infoObj.description = document.getElementById('completeData_1game_description_textarea').value;

		updateGameInfo(infoObj);
		// document.getElementById('completeData_1game_buttons_cancel').click(); //dispatchEvent(new Event('click'));
	});


};

// DONE!
function setGameFile(gamefile){
	document.getElementById('completeData_1game_gamefile').value = gamefile;
	document.getElementById('completeData_1game_buttons_update').click();
}

// DONE!
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

		removeBtn = document.createElement('button');
		removeGameFile_onclick_text = "removeGameFile('"+filelist[f]+"', '"+gamedata.id+"');";
		removeBtn.setAttribute('onclick', removeGameFile_onclick_text);
		removeBtn.setAttribute('title', "removeGameFile"+filelist[f]+" <--");
		removeBtn.innerHTML = "REMOVE";
		cell1.appendChild(removeBtn);

		gamefileBtn = document.createElement('button');
		gamefileBtn_onclick_text = "setGameFile('"+filelist[f]+"');";
		gamefileBtn.setAttribute('onclick', gamefileBtn_onclick_text);
		gamefileBtn.setAttribute('title', "setGameFile('"+filelist[f]+"'); <--");
		gamefileBtn.innerHTML = "Set as gamefile (Auto-save)";
		cell3.appendChild(gamefileBtn);

		// Add the new row to the table body.
		tbody.appendChild(row);
	}
}

// DONE!
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

	document.getElementById('emulatorControls_title').innerHTML="TITLE:<br>"+currentgame;
	document.getElementById('emulatorControls_gamefile').innerHTML="GAMEFILE:<br>"+uzerom;

	document.getElementById('emscripten_iframe').focus();

	setTimeout(function(){ resizeEmulatorView(); }, 500);

}

// DONE!
function getGameList(gameid) {
	var callback = function(resp) {
		// Parse the array right away.
		resp = JSON.parse(resp);
		resp = resp.result;

		// Stop the emulator.
		document.getElementById('stopEmulator_button').click();

		// Prepare variables, get handle on the select menu.
		var menus = [];
		menus.push(document.getElementById('gameMenu_select'));
		menus.push(document.getElementById('gameMenu_select2'));
		var option;
		var i;
		var optgroup;
		// Needs to be a for loop... I guess.
		for (var m = 0; m < menus.length; m++) {
			// Clear menu options and optgroups.
			menus[m].length = 1;
			[].map.call(menus[m].querySelectorAll('optgroup'), function(elem, index, elems) {
				elem.remove();
			});

			// Create/Add option group.
			optgroup = document.createElement('optgroup');
			optgroup.setAttribute('label', "Correct .uze headers");
			menus[m].appendChild(optgroup);

			// Add games with valid headers to the list.
			for (i = 0; i < resp.length; i++) {
				if (resp[i].validheader == 1) {
					option = document.createElement('option');
					option.setAttribute('value', resp[i].id);
					option.innerHTML = resp[i].title;
					menus[m].appendChild(option);
				}
			}

			// Create/Add option group.
			optgroup = document.createElement('optgroup');
			optgroup.setAttribute('label', "");
			menus[m].appendChild(optgroup);

			// Create/Add option group.
			optgroup = document.createElement('optgroup');
			optgroup.setAttribute('label', "Incorrect .uze headers");
			menus[m].appendChild(optgroup);

			// Add games with invalid headers to the list.
			for (i = 0; i < resp.length; i++) {
				if (resp[i].validheader == 0) {
					option = document.createElement('option');
					option.setAttribute('value', resp[i].id);
					option.innerHTML = " " + resp[i].title;
					menus[m].appendChild(option);
				}
			}

			// Create/Add option group.
			optgroup = document.createElement('optgroup');
			optgroup.setAttribute('label', "");
			menus[m].appendChild(optgroup);

			// Create/Add option group.
			optgroup = document.createElement('optgroup');
			optgroup.setAttribute('label', "Incomplete");
			menus[m].appendChild(optgroup);

			// Add games to the list that are not ready yet.
			for (i = 0; i < resp.length; i++) {
				if (resp[i].complete != 1) {
					option = document.createElement('option');
					option.setAttribute('value', resp[i].id);
					option.innerHTML = " " + resp[i].title;
					menus[m].appendChild(option);
				}
			}

			menus[m].selectedIndex = "";
		}

		if(gameid){
			console.info("POPULATED! gameid", gameid);
			document.getElementById('gameMenu_select2').value = gameid;
		}

	};

	var thedata = {
		o: "getGameList"
	};
	this.serverPOSTrequest(thedata, callback, "gateway_p.php");
}

// DONE!
function updateGameInfo(infoObj) {
	var callback = function(resp) {
		resp = JSON.parse(resp);

		// Reload the game list.
		getGameList(infoObj.id);
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

// DONE!
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

			reloadGameFileList(resp.gamedata, resp.filelist);
		}
	};

	// Send the xhr.
	xhr.send(fd);
}

// DONE!
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
			console.log('Server got:', resp);
			reloadGameFileList(resp.gamedata, resp.filelist);
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
			document.getElementById('modal_1_CANCEL').click();

			// Reset the filelist.
			var resp = JSON.parse(this.response);
			console.info("From server:", resp);

			// reloadGameFileList(resp.gamedata, resp.filelist);



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
			document.getElementById('completeData_1game_uses_sd').value = gamedata.uses_sd;
			document.getElementById('completeData_1game_addedby').value = gamedata.addedby;
			document.getElementById('completeData_1game_complete').value = gamedata.complete;
			document.getElementById('completeData_1game_lastupload').value = gamedata.lastupload;
			document.getElementById('completeData_1game_validheader').value = gamedata.validheader;
			document.getElementById('completeData_1game_description_textarea').value = gamedata['description'];

			// reloadGameFileList(gamedata, filelist);
			console.log(gamedata.id);
			getGameList(gamedata.id);

			// Make visible the save and cancel buttons.
		};

		var game = resp.gamedata.id;

		var thedata = {
			o: "loadGame_intoManager",
			game: game
		};
		serverPOSTrequest(thedata, callback, "gateway_p.php");



		}
	};

	// Send the xhr.
	xhr.send(fd);


}

function show_modal_1(display){
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
