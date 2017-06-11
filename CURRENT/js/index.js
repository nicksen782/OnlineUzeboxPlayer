// Global Variables:
var thefiles = [];
var thefiles2 = [];
var sometest="";
var ExternalClickPlay=false;

// Emulator Functions:
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
function loadUserGameIntoEmu2(gamefile){

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

		setTimeout(function(){
			// emulatorControls_F2();
			emulatorControls_F3();
		}, 2000);
	};

	document.getElementById('gameMenu_select').value = "";

	var thedata = {
		o: "loadUserGameIntoEmu2",
		gamefile: gamefile
	};
	serverPOSTrequest(thedata, callback, "gateway_p.php");
}
function sendKeyToIframe(keyCode){
	// var evt = new Event('keydown');
	var evt = new CustomEvent('keydown');

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
function loadGameIntoEmu(game){
	var callback = function(resp) {
		// console.log(resp);
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
	// console.log("files:", this.files);

	var _this = this;

	var userGameFiles = document.querySelector("#userGameFiles");

	var title1       = userGameFiles.querySelector('.title1');
	var title2       = userGameFiles.querySelector('.title2');
	var filelistdata = userGameFiles.querySelector('.filelistdata');
	var gamefiles    = userGameFiles.querySelector('.gamefiles');
	var datafiles    = userGameFiles.querySelector('.datafiles');
	var shortenedName = "";

	// Hide or show the sections depending on if there are any files ready.
	if(_this.files.length){
		title1.classList.add('hide');
		title2.classList.remove('hide');
		filelistdata.classList.remove('hide');
	}
	else{
		title1.classList.remove('hide');
		title2.classList.add('hide');
		filelistdata.classList.add('hide');
	}

	gamefiles.innerHTML = "";
	datafiles.innerHTML = "";

	// NOTHING SHOULD ACTUALLY UPLOAD TO THE SERVER!

	// Create a local (global) variable of file data.
	thefiles=[];

	// Use the filereader api to convert data to blob/arraybuffer.
	for (var i = 0; i < _this.files.length; i++) {
		// if(i==0){ userGameFiles.innerHTML += "Click gamefile to start:<br>"; }
		var reader = new FileReader();
		reader.onload = (function(e) {
			var filedata = e.target.result;
			var filedata2 = new Int8Array(filedata);
			// console.log("the file data:", filedata);
			// console.log("e", e);
			// console.info(i, this.fileobj.name, this.fileext, filedata);
			console.info("thefiles:", thefiles);
			thefiles.push(
				{filename:this.fileobj.name, completefilepath:filedata2, ext:this.fileext}
			);

			// Add contents to the new row's cells.
			if(this.fileext.toLowerCase()=='hex' || this.fileext.toLowerCase()=='uze'){
				if(this.fileobj.name.length>17){ shortenedName = this.fileobj.name.substr(0, 12) + "..." + this.fileobj.name.substr(-3, 3); }
				else                           { shortenedName = this.fileobj.name; }
				gamefiles.innerHTML += "<button onclick='loadUserGameIntoEmu(\""+this.fileobj.name+"\");'>PLAY</button><span class='userGameFileLink'>" + shortenedName + "</span><br>";
			}
			else {
				datafiles.innerHTML += "<div class='userDataFileLink'>" + this.fileobj.name + "</div>";
			}
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
function emulatorControls_F9(){
	sendKeyToIframe(120); // F8
}
function emulatorControls_F10(){
	sendKeyToIframe(121); // F8
}
function emulatorControls_gamepad(button){
	// button=button.getAttribute('name');
	// console.log(button, button.type, button.target.id); return;
	// console.log(window.event);
	button=button.target.id;
	// console.log(button);
	var evt = new CustomEvent('keypress');
	// var evt = new Event('keydown');

	// Directional pad.
	if(button=="dirUP"){ console.log("PRESSED dirUP"); sendKeyToIframe(38); evt.keyCode=38; } // dirUP (ArrowUp)
	if(button=="dirDN"){ console.log("PRESSED dirDN"); evt.keyCode=40; } // dirDN (ArrowDown)
	if(button=="dirLT"){ console.log("PRESSED dirLT"); evt.keyCode=37; } // dirLT (ArrowLeft)
	if(button=="dirRT"){ console.log("PRESSED dirRT"); evt.keyCode=39; } // dirRT (ArrowRight)

	// Start/Select.
	if(button=="select"){ evt.keyCode=32; } // select (Space)
	if(button=="start") { evt.keyCode=13; } // start (Enter)

	// Left/Right Shoulder buttons.
	if(button=="sL"){ evt.keyCode=16; evt.shiftKey=true; evt.which=16; evt.key="Shift"; evt.code = "ShiftLeft";  evt.location=1; } // sL (ShiftLeft)
	if(button=="sR"){ evt.keyCode=16; evt.shiftKey=true; evt.which=16; evt.key="Shift"; evt.code = "ShiftRight"; evt.location=2; } // sR (ShiftRight)

	// Y/B/X/A buttons.
	if(button=="btnY"){ evt.keyCode=81; evt.keyCode=32; evt.code = "KeyQ"; } // btnY (KeyQ)
	if(button=="btnB"){ evt.keyCode=65; evt.keyCode=32; evt.code = "KeyA"; } // btnB (KeyA)
	if(button=="btnX"){ evt.keyCode=87; evt.keyCode=32; evt.code = "KeyW"; } // btnX (KeyW)
	if(button=="btnA"){ evt.keyCode=83; evt.keyCode=32; evt.code = "KeyS"; } // btnA (KeyS)

evt.isTrusted=true;
	// console.log(button, evt);
	document.querySelector('#emscripten_iframe').contentDocument.dispatchEvent(evt);
}

function stopEmulator(){
	document.getElementById('emscripten_iframe_container').querySelector('iframe').src = "loading.html";
	document.querySelector('#emulatorControls_title').innerHTML    ="";
	document.querySelector('#emulatorControls_gamefile').innerHTML ="";
}
function restartEmulator(){
	document.getElementById('gameMenu_select').dispatchEvent(new Event('change'));
}
function nav_miniviewChange(){
	// console.log("nav_miniviewChange:", this, window.event);

	// Remove the active class from the nav tabs.
	[].map.call(document.querySelectorAll('#gameSourceNav .gameSourceNav_tab'), function(elem, index, elems) {
		// elem.addEventListener('click', nav_miniviewChange);
		elem.classList.remove('active');
	});

	// Remove the active class from the miniviews.
	[].map.call(document.querySelectorAll('.emulatorControls_section.miniview'), function(elem, index, elems) {
		elem.classList.remove('active');
	});

	// Add the active class to the nav tab that was clicked.
	this.classList.add('active');

	// Based on the nav button id, add the active class to the correct miniview.
	switch(this.id){
		case "gameSourceNav_SERVER" : {
			document.querySelector('#emulatorControls_section_gamefromserver').classList.add('active');
			break;
		}
		case "gameSourceNav_LOCAL" : {
			document.querySelector('#emulatorControls_section_gamefromlocal').classList.add('active');
			break;
		}
		case "gameSourceNav_URL" : {
			document.querySelector('#emulatorControls_section_gamefromurl').classList.add('active');
			break;
		}
	}
}
function iframeIsReadyNow(currentgame, uzerom, filelist) {
	// Iframe reports that it is ready!
	console.info(
		"The emulator is ready!",
		"\n Game Title: ", currentgame,
		"\n Game File:  ", uzerom,
		// "\n Filelist:   ", filelist,
		"\n\n"
	);

	document.querySelector('#emulatorControls_title').innerHTML    =""+currentgame;
	document.querySelector('#emulatorControls_gamefile').innerHTML =""+uzerom;

	document.getElementById('emscripten_iframe').focus();

	setTimeout(function(){ resizeEmulatorView(); }, 500);

}
function getGameFilesFromJSON(){
	var urlText = document.querySelector('#emulatorControls_section_gamefromurl_url').value;
	if(!urlText.length){ alert("The URL is empty. You must enter a valid URL."); return; }

	var onload_callback = function(data){
		// console.log("json datafile from server!", data);
		// urlText.split('/').reverse()[0];
		var basedir = urlText.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
		// console.log("basedir:", basedir);

		// Required for IE.
		if(typeof data == "string"){ data=JSON.parse(data); }

		thefiles2 = data;
		// var succ
		// Add the basedir to each file in the array.


		var shortendName = "";
		var resultsDiv = document.getElementById('userGameFiles_fromURL');
		resultsDiv.classList.add('show');
		// console.log("****** data: ", data);
		// console.log("****** data.title: ", data['title']);
		// console.log("****** data.title.length: ", data.title.length);
		if(data.title.length>20){ shortendName = data.title.substr(0, 17) + "..." + data.title.substr(-3, 3); }
		else                           { shortendName = data.title ; }
		resultsDiv.querySelector('div:nth-child(2)').innerHTML = shortendName + ":)<br>" ;

		for(var i=0; i<thefiles2.files.length; i++){
			(function (i) {
				thefiles2.files[i].completefilepath = basedir + "/" + thefiles2.files[i].completefilepath;//+"?r=" + Math.random() ;
				resultsDiv.querySelector('div:nth-child(2)').innerHTML += "<a target='_blank' href='"+thefiles2.files[i].completefilepath+"'>file"+i+"</a>, ";

				// This does actually download the file... and it gets cached. When requested by the emulator iframe the file comes from cache!
				ajaxGETfile(thefiles2.files[i].completefilepath, "arraybuffer",
					// success
					function(d){
						// console.log("****", thefiles2.files[i].completefilepath, "**********************thefiles2", thefiles2, data, basedir);
						thefiles2.files[i].completefilepath = new Int8Array(d);
						console.log("Successfully downloaded file number "+i+", NAME:", thefiles2.files[i].filename);

					},
					// fail
					function(d){ console.log("fail!",d, i, thefiles2.files.length ); }
				);

			})(i);
		}

		// console.info(thefiles2.files);


		// resultsDiv.querySelector('div:nth-child(1)').innerHTML = data.title ;

		var playOnclick = "loadUserGameIntoEmu2('"+data.gamefile+"')";

		document.querySelector('#emulatorControls_section_gamefromurl_play').setAttribute("onclick", playOnclick);

		// Check for a global variable set! It would have been set by UAM3 via querystring!

		// console.log("!!!@!@!@!@", ExternalClickPlay);
		if(ExternalClickPlay){
			setTimeout(function(){
				// console.log("!!!!!!!!!!!!!***************TRUE: ExternalClickPlay:", ExternalClickPlay);
				document.querySelector('#emulatorControls_section_gamefromurl_play').click();
			}, 450);
		}
	};
	var onerror_callback = function(){ console.log('getGameFilesFromJSON: ERROR!'); };
	ajaxGETfile(urlText, "json", onload_callback, onerror_callback);
}
function show_modal2(){ modal_2(true); }
function hide_modal2(){ modal_2(false); }
function modal_2(display){
	var darkener = document.querySelector("#darkener_modal_2");
	var modal = document.querySelector("#modal_2");

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

// function show_modal3(){ modal_3(true); }
// function hide_modal3(){ modal_3(false); }
function modal_3(display){
	var darkener = document.querySelector("#darkener_modal_3");
	var modal = document.querySelector("#modal_3");

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

// Shared Functions:
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
	[].map.call(document.querySelectorAll('.navButton'),
		function(elem, index, elems) {
			elem.classList.remove('active');
		});

	// Now show the selected app view.
	switch (view) {
		case "emu":
			{
				document.getElementById('top_panel_right').classList.add('show');
				document.getElementById('top_panel_right_user').classList.add('show');
				document.getElementById('VIEW_emulator').classList.add('show');
				document.getElementById('navButton_emu').classList.add('active');
				break;
			}
		case "gamedbman":
			{
				document.getElementById('top_panel_right_gamemanager').classList.add('show');
				document.getElementById('VIEW_gamedbmanager').classList.add('show');
				document.getElementById('navButton_gamedbman').classList.add('active');
				break;
			}
		case "misc":
			{
				// document.getElementById('top_panel_right_gamemanager').classList.add('show');
				document.getElementById('VIEW_misc').classList.add('show');
				document.getElementById('navButton_misc').classList.add('active');
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
			serverGameMenu_select();
			// loadGameIntoEmu(game);
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
function ajaxGETfile(url, responseType, onload_callback, onerror_callback) {
	var xhr = new XMLHttpRequest;
	xhr.open("GET", url, true);
	xhr.responseType = responseType ; // "arraybuffer";
	xhr.withCredentials = "true";
	xhr.onload = function xhr_onload() {
		if (xhr.status == 200 || xhr.status == 0 && xhr.response) { onload_callback(xhr.response) }
		else { onerror_callback() }
	};
	xhr.onerror = onerror_callback;
	xhr.send(null)
};
function clearJSONURL(){
	// console.log("clearJSONURL", this);
	document.querySelector('#emulatorControls_section_gamefromurl_url').value = "";
}

// Game Manager Functions:
function serverGameMenu_select(){
	var gameid = document.getElementById('gameMenu_select').value;
	var gamename = document.querySelector('#gameMenu_select option:checked').innerHTML;
	var directLink1=window.location.href+"?gameid="+gameid;
	var directLink2=window.location.href+"?gameid="+gameid+"&externalcontrol=true" ;

	console.log("Direct play URL (normal UI):", window.location.href+"?gameid="+gameid );
	console.log("Direct play URL (reduced UI):", window.location.href+"?gameid="+gameid );
	document.querySelector("#serverGame_directurl").innerHTML          = "<a title='"+gamename+"' target='_blank' href='"+directLink1+"'> Normal  UI (id "+gameid+")</a>";
	document.querySelector("#serverGame_directurl_min").innerHTML      = "<a title='"+gamename+"' target='_blank' href='"+directLink2+"'> Reduced UI (id "+gameid+")</a>";

	loadGameIntoEmu(gameid);
	document.getElementById('gameMenu_select2').value = gameid;
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
		// console.log('Server got:', resp);

		if(resp.unauthorized){ alert("You have no business using this feature. It has been disabled for a reason."); window.location.reload(); return; }
		else{
			// console.log('Server got:', resp);
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
	[].map.call(document.querySelectorAll('#VIEW_gamedbmanager input[type="text"], #VIEW_gamedbmanager textarea, #VIEW_gamedbmanager select'),
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
function setGameFile(gamefile){
	document.getElementById('completeData_1game_gamefile').value = gamefile;
	document.getElementById('completeData_1game_buttons_update').click();
}
function updateGameInfo(infoObj) {
	if(!infoObj.id){ alert("Game data is not loaded. You will need to choose a game from the list."); return; }

	var callback = function(resp) {
		resp = JSON.parse(resp);

		if(resp.unauthorized){ alert("You have no business using this feature. It has been disabled for a reason."); window.location.reload(); return; }
		else{
			// console.log('Server got:', resp);
			// Reload the game list.
			getGameList(null, infoObj.id);
			// reloadGameFileList(resp.gamedata, resp.filelist);
		}

	};

	var thedata = infoObj;
	thedata.o = "updateGameInfo";

	serverPOSTrequest(thedata, callback, "gateway_p.php");
}
function removeGameFile(filename, gameid){

	var conf1 = confirm("Are you sure that you want to delete the file:\n\n"+filename+"?");
	// console.log( "removeGameFile", filename, gameid, conf1 );

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
				// console.log('Server got:', resp);
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
						// console.log('Server got:', resp);

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

						// console.log(null, gamedata.id);
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

// Initial Setup:
window.onload = function() {
	// if (window.opener && window.opener !== window) {
		// We have been opened by some other window. If compatible it will have a variable that we can read.
		// console.log("**** Seems we have been opened up by Javascript! ****", window.opener.pageTitle);
	// }

	// getGameList(false);	// Call but do not specify a game id.
	// The value for 'gameid_GET' is from PHP in index.php.
	getGameList(gameid_GET, null);	// Call but do not specify a game id.
	if(gameid_GET) { serverGameMenu_select(); }

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
	document.getElementById('emulatorControls_F9').addEventListener('click', emulatorControls_F9 );
	document.getElementById('emulatorControls_F10').addEventListener('click', emulatorControls_F10 );

	document.getElementById('emulatorControls_section_gamefromurl_get').addEventListener('click', getGameFilesFromJSON );
	document.getElementById('emulatorControls_section_gamefromurl_clear').addEventListener('click', clearJSONURL );

	// Emulator overlay controls:
	document.getElementById('dirUP').addEventListener ('mousedown', emulatorControls_gamepad);
	document.getElementById('dirUP').addEventListener ('mouseup', emulatorControls_gamepad);

	document.getElementById('dirDN').addEventListener ('mousedown', emulatorControls_gamepad);
	document.getElementById('dirDN').addEventListener ('mouseup', emulatorControls_gamepad);

	document.getElementById('dirLT').addEventListener ('mousedown', emulatorControls_gamepad);
	document.getElementById('dirLT').addEventListener ('mouseup', emulatorControls_gamepad);

	document.getElementById('dirRT').addEventListener ('mousedown', emulatorControls_gamepad);
	document.getElementById('dirRT').addEventListener ('mouseup', emulatorControls_gamepad);

	document.getElementById('select').addEventListener('mousedown', emulatorControls_gamepad);
	document.getElementById('select').addEventListener('mouseup', emulatorControls_gamepad);

	document.getElementById('start').addEventListener ('mousedown', emulatorControls_gamepad);
	document.getElementById('start').addEventListener ('mouseup', emulatorControls_gamepad);

	document.getElementById('sL').addEventListener    ('mousedown', emulatorControls_gamepad);
	document.getElementById('sL').addEventListener    ('mouseup', emulatorControls_gamepad);

	document.getElementById('sR').addEventListener    ('mousedown', emulatorControls_gamepad);
	document.getElementById('sR').addEventListener    ('mouseup', emulatorControls_gamepad);

	document.getElementById('btnY').addEventListener  ('mousedown', emulatorControls_gamepad);
	document.getElementById('btnY').addEventListener  ('mouseup', emulatorControls_gamepad);

	document.getElementById('btnB').addEventListener  ('mousedown', emulatorControls_gamepad);
	document.getElementById('btnB').addEventListener  ('mouseup', emulatorControls_gamepad);

	document.getElementById('btnX').addEventListener  ('mousedown', emulatorControls_gamepad);
	document.getElementById('btnX').addEventListener  ('mouseup', emulatorControls_gamepad);

	document.getElementById('btnA').addEventListener  ('mousedown', emulatorControls_gamepad);
	document.getElementById('btnA').addEventListener  ('mouseup', emulatorControls_gamepad);


	[].map.call(document.querySelectorAll('#gameSourceNav .gameSourceNav_tab'), function(elem, index, elems) {
		elem.addEventListener('click', nav_miniviewChange);
	});

	var url = getUrlParameter("url");
	var externalcontrol = getUrlParameter("externalcontrol");
	ExternalClickPlay = getUrlParameter("ExternalClickPlay");

	console.log(
		"\n***************************",
		"\nurl:", url,
		"\nexternalcontrol:", externalcontrol,
		"\nExternalClickPlay:", ExternalClickPlay
	);

	// var urlParams = new URLSearchParams(window.location.search);
	// var url = (urlParams.get('url'));
	if(url){
		document.querySelector('#emulatorControls_section_gamefromurl_url').value = url ;
		document.querySelector('#gameSourceNav_URL').click();
	}
	if( externalcontrol =="true"){
		// Hide most of the UI to make the web page shorter and more narrow.

		// document.querySelector("html").style.display="none";

		document.querySelector("#top_panel").style.display="none";
		document.querySelector(".gameframe_border_top").style.display="none";
		document.querySelector(".gameframe_border_right").style.display="none";
		document.querySelector(".gameframe_border_left").style.display="none";
		document.querySelector(".gameframe_border_bottom").style.display="none";
		  //document.querySelector("#gameSourceNav").style.display="none";
		document.querySelector(".gameframe_").style.left="0px";
		document.querySelector(".gameframe_").style.width="632px";
		document.querySelector(".gameframe_").style['border-radius']="0px";
		// document.querySelector("#showEmuControls").style.display="none";
		// document.querySelector("#emulatorControls_resize").style.display="none";
		document.querySelector("#userGameFiles_fromURL_infotitle").style.display="none";
		document.querySelector("#userGameFiles_fromURL_infoinfo").style.display="none";
		document.querySelector("html").style.margin="0px";
		document.querySelector("html").style['margin-top']="0px";
		document.querySelector("html").style['padding']="0px";
		document.querySelector("html").style['height']="570px";
		document.querySelector("body").style['width']="850px";
		document.querySelector("body").style['margin']="auto";
		document.querySelector("body").style['text-align']="center";
		document.querySelector("#wrapAll").style['padding']="0px";
		document.querySelector("#content").style['padding-bottom']="0px";
		document.querySelector("#content").style['margin']="0px";
		document.querySelector("#content").style['border']="0px solid black;";
		document.querySelector("#middle").style['padding']="0px";

		document.querySelector("#middle_cont1").style['height']="515px";
		document.querySelector("#emscripten_iframe_container").style['height']="515px";
		document.querySelector("#emscripten_iframe").style['height']="515px";

		if( document.querySelector("#emulatorControls_section_gamefromurl_url").value ) {
			document.querySelector("#emulatorControls_section_gamefromurl_get").click();
		}

		// document.querySelector("html").style.display="block";
	}
	if( ExternalClickPlay =="true"){ ExternalClickPlay=true; console.info("Setting auto play to true!"); }

	// Emulator - Top-right panel
	document.getElementById('stopEmulator_button').addEventListener('click', stopEmulator );
	document.getElementById('restartEmulator_button').addEventListener('click', restartEmulator );
	document.getElementById('gameMenu_select').addEventListener('change', serverGameMenu_select );

	document.getElementById('top_panel_settings_gear').addEventListener('click', function(){
		if(window.opener){
			window.opener.document.querySelector('.sideTab_darkenerdiv').click();
			window.opener.document.querySelector('#UzeboxBridge_compile').click();

			setTimeout(function(){
			var html = window.opener.document.querySelector('#UzeboxBridge_window3_results').innerHTML;
			document.getElementById('emscripten_iframe').remove();

			var iframe = document.createElement('iframe');
			iframe.setAttribute("frameBorder", "0");
			iframe.id = "emscripten_iframe";

			document.getElementById('emscripten_iframe_container').appendChild(iframe);

			iframe.contentWindow.document.open();
			iframe.contentWindow.document.write(html);
			var cWindow = document.querySelector('#emscripten_iframe').contentDocument;
			// var cBody = cWindow.querySelector('body');
			// cBody.scrollTo(0, cBody.scrollHeight);
			iframe.contentWindow.document.close();
			document.querySelector('#emscripten_iframe').contentWindow.scrollTo(0,cWindow.body.scrollHeight);
			document.getElementById('modal_3').innerHTML = html;
			modal_3(true);


			}, 2000);

		}
		else{ return; }
		document.querySelector('#stopEmulator_button').click();
		document.querySelector('#gameSourceNav_URL').click();
		document.querySelector('#userGameFiles_fromURL').classList.remove('show');

		setTimeout(function(){
			document.querySelector('#emulatorControls_section_gamefromurl_get').click();
			window.opener.document.querySelector('.sideTab_darkenerdiv').click();
		}, 2500);
	});

	// Games DB
	document.getElementById('gameMenu_select2').addEventListener('change', serverGameDbMenu);
	document.getElementById('newFileUpload_save').addEventListener('click', gameDbFileUpdate);
	document.getElementById('gamedb_new').addEventListener('click', show_modal1 );
	document.getElementById('showEmuControls').addEventListener('click', show_modal2 );
	document.getElementById('modal_1_CANCEL').addEventListener('click', hide_modal1 );
	document.getElementById('modal_1_SAVE').addEventListener('click', newGameRecord	);
	document.getElementById('darkener_modal_1').addEventListener('click', hide_modal1 );
	document.getElementById('darkener_modal_2').addEventListener('click', hide_modal2 );
	document.getElementById('completeData_1game_buttons_cancel').addEventListener('click', gameDbForm_cancel );
	document.getElementById('completeData_1game_buttons_update').addEventListener('click', gameDbForm_update );
};