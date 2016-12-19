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

window.onload = function() {
	getGameList();

	viewSwitcher("emu");
	// viewSwitcher("gamedbman");

	// Emulator
	document.getElementById('emscripten_iframe_container').addEventListener('mouseenter', function() {
		this.focus();
		resizeIframe();
	});
	document.getElementById('emscripten_iframe_container').addEventListener('click', function() {
		// document.getElementById('emscripten_iframe_container').querySelector('iframe').src = "loading.html";
	});
	document.getElementById('stopEmulator_button').addEventListener('click', function() {
		document.getElementById('emscripten_iframe_container').querySelector('iframe').src = "loading.html";
	});
	document.getElementById('restartEmulator_button').addEventListener('click', function() {
		document.getElementById('gameMenu_select').dispatchEvent(new Event('change'));
	});
	document.getElementById('gameMenu_select').addEventListener('change', function() {
		var callback = function(resp) {
			resp = JSON.parse(resp);
			// console.log("loadGame callback called. Number found:", resp.count, "(should be 1.)");

			// Remove previous iframe. Create another one.
			document.getElementById('emscripten_iframe').remove();

			var iframe = document.createElement('iframe');
			iframe.setAttribute("frameBorder", "0");
			// iframe.set
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
	document.querySelector('#newFileUpload_save').addEventListener('click', function(e) {
		var gameid=document.querySelector("#completeData_1game_id").value;
		newFileUpload(gameid);
	}, false);

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
		infoObj.lastupload = document.getElementById('completeData_1game_lastupload').value;
		infoObj.validheader = document.getElementById('completeData_1game_validheader').value;
		infoObj.description = document.getElementById('completeData_1game_description_textarea').value;

		updateGameInfo(infoObj);
		document.getElementById('completeData_1game_buttons_cancel').click(); //dispatchEvent(new Event('click'));
	});
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

};

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
	// document.getElementById('gamefilelist').innerHTML += " -- ";
	for (var f = 0; f < filelist.length; f++) {
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
		var cell2 = row.insertCell(2); cell2.innerHTML = "<a href='" + gamedata.gamedir + filelist[f] + "' title='Download this file'>" + filelist[f] + "</a>" ;

		// Add the new row to the table body.
		tbody.appendChild(row);

		// document.getElementById('gamefilelist').innerHTML += "<a href='" + gamedata.gamedir + filelist[f] + "' title='Download this file'>" + filelist[f] + "</a> -- ";

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

function resizeIframe() {
	var outer = document.getElementById('emscripten_iframe');
	outer.focus();

	return;
	// var inner = document.getElementById('emscripten_iframe').contentDocument.body;
	outer.style.height = document.getElementById('emscripten_iframe').contentWindow.document.body.clientHeight + "px";
	// outer.style.width  = document.getElementById('emscripten_iframe').contentWindow.document.body.width+"px";

	outer.height = document.getElementById('emscripten_iframe').contentWindow.document.body.clientHeight + "px";
	// outer.width  = document.getElementById('emscripten_iframe').contentWindow.document.body.width+"px";

}

function iframeIsReadyNow(currentgame) {
	// Iframe reports that it is ready!
	console.info("Iframe reports that it is ready!", "Game Title:", currentgame, "\n\n");
	resizeIframe();
	// document.body.style['background-color']='#263535';
	// document.getElementsByTagName('html')[0].style['background-color']='#263535';
	// document.getElementById('middle').style.visibility="visible";
}

// DONE!
function getGameList() {
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
			menus[m].selectedIndex = "";
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
		getGameList();
	};

	var thedata = infoObj;
	thedata.o = "updateGameInfo";

	serverPOSTrequest(thedata, callback, "gateway_p.php");
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