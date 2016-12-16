function viewSwitcher(view){
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
	switch(view) {
	    case "emu":{
			document.getElementById('top_panel_right').classList.add('show');
			document.getElementById('VIEW_emulator').classList.add('show');
	        break;
	    }
	    case "gamedbman":{
			document.getElementById('top_panel_right_gamemanager').classList.add('show');
			document.getElementById('VIEW_gamedbmanager').classList.add('show');
	        break;
	    }
	    default:{
	    	document.getElementById('top_panel_right').classList.add('show');
			document.getElementById('VIEW_emulator').classList.add('show');
	        break;
	    }

	    // document.getElementById('stopEmulator_button').click();
	}



}

window.onload=function(){

	getGameList('gameMenu_select');
	getGameList('gameMenu_select2');

	viewSwitcher("emu");
	// viewSwitcher("gamedbman");

	document.getElementById('emscripten_iframe_container').addEventListener('mouseenter', function() {
		this.focus(); resizeIframe();
	});

	document.getElementById('emscripten_iframe_container').addEventListener('click', function(){
		// document.getElementById('emscripten_iframe_container').querySelector('iframe').src = "loading.html";
	});

	document.getElementById('stopEmulator_button').addEventListener('click', function(){
		document.getElementById('emscripten_iframe_container').querySelector('iframe').src = "loading.html";
	});

	document.getElementById('restartEmulator_button').addEventListener('click', function(){
		document.getElementById('gameMenu_select').dispatchEvent(new Event('change'));
	});

	document.getElementById('gameMenu_select').addEventListener('change', function(){
		var callback = function(resp){
			resp = JSON.parse(resp);
			// console.log("loadGame callback called. Number found:", resp.count, "(should be 1.)");

			// Remove previous iframe. Create another one.
			document.getElementById('emscripten_iframe').remove();

			var iframe = document.createElement('iframe');
			iframe.id="emscripten_iframe";
			document.getElementById('emscripten_iframe_container').appendChild(iframe);
			iframe.contentWindow.document.open();
			iframe.contentWindow.document.write(resp.iframehtml);
			iframe.contentWindow.document.close();
		};

		var game = document.getElementById('gameMenu_select').value ;

		var thedata = { o:"loadGame", game:game };
		serverPOSTrequest(	thedata, callback, "gateway_p.php" );

	});

	document.getElementById('completeData_1game_buttons_cancel').addEventListener('click', function(){
		// Clear the form.
		[].map.call(document.querySelectorAll('#VIEW_gamedbmanager input[type="text"], #VIEW_gamedbmanager textarea'),
		function(elem, index, elems) { elem.value = ""; });

		document.getElementById('gamefilelist').innerHTML = "  " ;

		console.log("Form cleared. No changes have been made.");
	});
	document.getElementById('completeData_1game_buttons_update').addEventListener('click', function(){
		// Get the data from the form and pass it as an object to the game update function.
		var infoObj = {};
		infoObj.id          = document.getElementById('completeData_1game_id').value          ;
		infoObj.title       = document.getElementById('completeData_1game_title').value       ;
		infoObj.authors     = document.getElementById('completeData_1game_authors').value     ;
		infoObj.gamedir     = document.getElementById('completeData_1game_gamedir').value     ;
		infoObj.gamefile    = document.getElementById('completeData_1game_gamefile').value    ;
		infoObj.uses_sd     = document.getElementById('completeData_1game_uses_sd').value     ;
		infoObj.addedby     = document.getElementById('completeData_1game_addedby').value     ;
		infoObj.lastupload  = document.getElementById('completeData_1game_lastupload').value  ;
		infoObj.validheader = document.getElementById('completeData_1game_validheader').value ;
		infoObj.description = document.getElementById('completeData_1game_description').value ;

		updateGameInfo(infoObj);
	});
	document.getElementById('gameMenu_select2').addEventListener('change', function(){
		var callback = function(resp){
			resp = JSON.parse(resp);
			var gamedata = resp.result;
			var filelist = resp.filelist;
			console.log(gamedata, filelist);

			// Clear the form.
			document.getElementById('completeData_1game_buttons_cancel').click(); //dispatchEvent(new Event('click'));

			// Load the form with data.
			document.getElementById('completeData_1game_id').value          = gamedata.id;
			document.getElementById('completeData_1game_title').value       = gamedata.title;
			document.getElementById('completeData_1game_authors').value     = gamedata.authors;
			document.getElementById('completeData_1game_gamedir').value     = gamedata.gamedir;
			document.getElementById('completeData_1game_gamefile').value    = gamedata.gamefile;
			document.getElementById('completeData_1game_uses_sd').value     = gamedata.uses_sd;
			document.getElementById('completeData_1game_addedby').value     = gamedata.addedby;
			document.getElementById('completeData_1game_lastupload').value  = gamedata.lastupload;
			document.getElementById('completeData_1game_validheader').value = gamedata.validheader;
			document.getElementById('completeData_1game_description').value = gamedata.description;

			document.getElementById('gamefilelist').innerHTML = filelist.toString().split(',').join(', ');

			// Make visible the save and cancel buttons.
		};

		var game = document.getElementById('gameMenu_select2').value ;

		var thedata = { o:"loadGame_intoManager", game:game };
		serverPOSTrequest(	thedata, callback, "gateway_p.php" );

	});

};

// DONE!
function serverPOSTrequest(dataObj, callback, url){
	// Display the progress animation.
	document.getElementById('progressBar').classList.add('show');
	document.getElementById('progressBar2').classList.add('show');

	var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
	xmlhttp.open("POST", url ? url : "index_p.php");   // Use the specified url. If no url then use the default.
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	// xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4 && xmlhttp.status == "200") {
			document.getElementById('progressBar').classList.remove('show');
			document.getElementById('progressBar2').classList.remove('show');
			callback(xmlhttp.responseText);
			// Hide the progress animation.
		}
	}

	var dataObj = Object.keys(dataObj).map(function(k) {
		return encodeURIComponent(k) + '=' + encodeURIComponent(dataObj[k])
	}).join('&')

	xmlhttp.send(dataObj);
}

function resizeIframe() {
	var outer = document.getElementById('emscripten_iframe');
	// var inner = document.getElementById('emscripten_iframe').contentDocument.body;
	outer.style.height = document.getElementById('emscripten_iframe').contentWindow.document.body.clientHeight+"px";
	// outer.style.width  = document.getElementById('emscripten_iframe').contentWindow.document.body.width+"px";

	outer.height = document.getElementById('emscripten_iframe').contentWindow.document.body.clientHeight+"px";
	// outer.width  = document.getElementById('emscripten_iframe').contentWindow.document.body.width+"px";

	outer.focus();
}

function iframeIsReadyNow(currentgame, currentgameid){
	// Iframe reports that it is ready!
	console.info("Iframe reports that it is ready!", "game location:", currentgame, "game id:", currentgameid);
	resizeIframe();
	// document.body.style['background-color']='#263535';
	// document.getElementsByTagName('html')[0].style['background-color']='#263535';
	// document.getElementById('middle').style.visibility="visible";
}

// DONE!
function getGameList(whichSelect) {
	var callback = function(resp){
		// Parse the array right away.
		resp = JSON.parse(resp);
		resp=resp.result;
		// console.log("getGameList:", resp.length, resp);

		// Prepare variables, get handle on the select menu.
		var select2 = document.getElementById(whichSelect);
		select2.length=1;
		var option;
		var i;

		var optgroup1 = document.createElement('optgroup');
		optgroup1.setAttribute('label', "Correct .uze headers");
		select2.appendChild(optgroup1);

		// Add these files as options to the GAME select list.
		for(i=0; i<resp.length; i++){
			if(resp[i].validheader==1){
				option = document.createElement('option');
				option.setAttribute('value', resp[i].id);
				option.innerHTML = resp[i].title;
				select2.appendChild(option);
				// console.log("adding:", option);
			}
		}

		var optgroup2 = document.createElement('optgroup');
		optgroup2.setAttribute('label', "");
		select2.appendChild(optgroup2);

		var optgroup3 = document.createElement('optgroup');
		optgroup3.setAttribute('label', "Incorrect .uze headers");
		select2.appendChild(optgroup3);

		for(i=0; i<resp.length; i++){
			if(resp[i].validheader==0){
				option = document.createElement('option');
				option.setAttribute('value', resp[i].id);
				option.innerHTML = "(INVALID) " + resp[i].title;
				select2.appendChild(option);
				// console.log("adding:", option);
			}
		}

		document.getElementById(whichSelect).selectedIndex = 1;
	};

	var thedata = { o:"getGameList" };
	this.serverPOSTrequest(	thedata, callback, "gateway_p.php" );
}

// DONE!
function updateGameInfo(infoObj){
	var callback = function(resp){
		resp = JSON.parse(resp);

		// Reload the data.
		document.getElementById('gameMenu_select2').dispatchEvent(new Event('change'));
	};

	var thedata = infoObj ;
	thedata.o = "updateGameInfo";

	serverPOSTrequest(	thedata, callback, "gateway_p.php" );

}