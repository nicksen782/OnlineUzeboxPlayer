/*jshint sub:true*/
/*jshint laxcomma:true*/
/*jslint bitwise: true */
/*jslint for: true */
/*jslint long: true */
/*jslint single: true */
/*jslint white: true */
/*jslint multivar: false */

/*jshint -W069 */

/* global featureDetection */
/* global gc */
/* global saveAs */
/* global JSZip */
/* global X2JS */
/* global performance */
/* global getQueryStringAsObj */
/* global localStorage */
/* global emu */

// anthonybrown/JSLint Options Descriptions
// https://gist.github.com/anthonybrown/9526822

"use strict";

// shim layer with setTimeout fallback
if(typeof window.requestAnimationFrame == "undefined"){
	window.requestAnimFrame = (function(){
		return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame  ||
		window.mozRequestAnimationFrame     ||
		function( callback ){ window.setTimeout(callback, 1000 / 60); };
	})();
}
if(typeof window.cancelAnimationFrame == "undefined"){
	window.cancelAnimationFrame = (function(){
		return window.mozCancelAnimationFrame ||
		window.webkitCancelAnimationFrame     ||
		window.cancelAnimationFrame           ||
		function( callback ){ window.setTimeout(callback, 1000 / 60); };
	})();
}

var emu          = {};
emu.vars         = {
	// * UAM vars.
	originUAM      : false     ,
	UAM_active     : false     ,
	UAMDATA        : undefined ,
	user_id        : undefined ,

	// * Holds the DOM cache.
	dom: {},

	// * Holds the category values for the built-in games.
	emu_statuses: [
		'NO CATEGORY', // 0
		'Demo'       , // 1
		'WIP'        , // 2
		'Complete'   , // 3
		'UCC2013'    , // 4
		'UCC2014'    , // 5
		'UCC2016'    , // 6
		'UCC2018'    , // 7
		'RESERVED'   , // 8
	],

	// * Holds the data and binary for each loaded game file and the file to start CUzeBox with.
	gameFiles: [],
	gameFile : "",

	// Holds the previous state of GUICORE_SMALL. It is set to true by default.
	prev_GUICORE_SMALL : true,

};
emu.funcs        = {
	// * Adds event listeners.
	addAllListeners       : function() {
		// Add the gamepad listeners.
		emu.gamepads.addAllListeners();

		let EL_view = function(){
			window.onbeforeunload = function() {
				// On any sort of navigation make sure the eeprom.bin file in localStorage is updated.

				// Is the emulator active?
				if(emu.vars.innerEmu.emulatorIsReady==true){
					// Save the CUzeBox eeprom.bin file to localStorage.
					if( Object.keys(emu.vars.innerEmu.Module.FS.root.contents).indexOf("eeprom.bin") != -1 ){
						localStorage.setItem("EMU_eeprom.bin", emu.vars.innerEmu.Module.FS.readFile("eeprom.bin") );
						// console.log("Saved eeprom.bin to localStorage.");
						emu.funcs.shared.textOnCanvas2({"Saved EEPROM":""});
					}
				}
				return;
			};

			// VIEW: Navigation (misc views.)
			emu.vars.dom.view["emu_misc_navs"].forEach(function(d, i, a) {
				d.addEventListener("click", function() { emu.funcs.nav.changeMiscView(this.getAttribute("view"), this) }, false);
			});

			// VIEW: Navigation (main views.)
			var allTitleNavGroups = document.querySelectorAll(".sectionDivs_title_options");
			allTitleNavGroups.forEach(function(d, i, a) {
				d.querySelectorAll(".navOptions").forEach(function(d2, i2, a2) {
					d2.addEventListener("click", function() { emu.funcs.nav.changeView(this.getAttribute("newview")); }, false);
				});
			});

			// VIEW: Fullscreen mode.
			document                                   .addEventListener("fullscreenchange", function(e) {
				if( emu.vars.innerEmu.emulatorIsReady !== false ) {
					// console.log("1 fullscreen: The emu is not ready.");
					// Determine which quality mode CUzeBox was in.
					let GUICORE_SMALL      = emu.vars.innerEmu.Module._NRA_returnFlags(3) ? true : false; // Small view or larger view


					// If small then make big.
					if(GUICORE_SMALL){
						// Save the previous GUICORE_SMALL value.
						emu.vars.prev_GUICORE_SMALL = GUICORE_SMALL;

						setTimeout(function(){
							// console.log("Switching to increased resolution.");
							emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_F2" , 1);
							emu.vars.innerEmu.emu_sendKeyEvent("keyup", "key_F2" , 1);
							emu.vars.innerEmu.displayCUzeBox_flags();
						}, 25);
					}
					// If big then return the resolution to the previous state.
					else{
						if(emu.vars.prev_GUICORE_SMALL){
							setTimeout(function(){
								// console.log("returning to previous resolution");
								emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_F2" , 1);
								emu.vars.innerEmu.emu_sendKeyEvent("keyup", "key_F2" , 1);
								emu.vars.innerEmu.displayCUzeBox_flags();
							}, 25);
						}
						else{
							// console.log("Already at increased resolution.");
						}
					}

					// Resize the canvas to fit.
					emu.vars.innerEmu.resizeEmuCanvas();

					// Make sure the full screen has focus.
					emu.funcs.emu_focusing(null, "mouseenter");
				}
			}, false);
			emu.vars.dom.view["emuControls_FULLSCREEN"].addEventListener("click"   , emu.vars.innerEmu.emuFullscreen, false);
			emu.vars.dom.view["emuCanvas"]             .addEventListener("dblclick", emu.vars.innerEmu.emuFullscreen, false);

			// VIEW: File loading.
			emu.vars.dom.view["emu_FilesFromJSON"]            .addEventListener("click", function() { this.select(); }, false);
			emu.vars.dom.view["emu_FilesFromJSON_load"]       .addEventListener("click", function() { emu.funcs.getGameFiles("3"); }, false);
			emu.vars.dom.view["builtInGames_select"]          .addEventListener("change", function() { emu.funcs.getGameFiles("1") }, false);
			emu.vars.dom.view["emu_FilesFromUser"]            .addEventListener("change", emu.funcs.emu_processUserUploads, false);
			emu.vars.dom.view["emu_FilesFromUser_viewableBtn"].addEventListener("click", emu.funcs.emu_clickUserUpload, false);

			// VIEW: Canvas key events.
			emu.vars.dom.view["emuCanvas"].addEventListener("keydown", function(e){
				// // Ask CUzeBox what keys are currently pressed. Then display them on the on-screen gamepads.
				if(emu.vars.innerEmu.emulatorIsReady){ emu.vars.innerEmu.showPressedKey(); }

				// Handles auto-resizing of the emulator canvas when certain functions resize the canvas.
				switch(e.code){
					case 'F2'  : { setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 50); break; } // Quality
					case 'F3'  : { setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 50); break; } // Debug
					case 'F4'  : { setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 50); break; } // Vsync limiter
					case 'F12' : { setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 50); break; }
					default    : { break; }
				}
			});
			emu.vars.dom.view["emuCanvas"].addEventListener("keyup", function(){
				// Ask CUzeBox what keys are currently pressed. Then display them on the on-screen gamepads.
				if(emu.vars.innerEmu.emulatorIsReady){ emu.vars.innerEmu.showPressedKey(); }
			});

			// VIEW: Handle input focus on the emulator. (Delegated)
			emu.vars.dom.view["emu_misc_gamepads"]  .addEventListener("mouseenter", function() { this.classList.add(   "hovered"); emu.funcs.emu_focusing(null, "mouseenter"); }, false);
			emu.vars.dom.view["emu_misc_gamepads"]  .addEventListener("mouseleave", function() { this.classList.remove("hovered"); emu.funcs.emu_focusing(null, "mouseleave"); }, false);
			emu.vars.dom.view["emu_emulator_window"].addEventListener("mouseenter", function() { this.classList.add(   "hovered"); emu.funcs.emu_focusing(null, "mouseenter"); }, false);
			emu.vars.dom.view["emu_emulator_window"].addEventListener("mouseleave", function() { this.classList.remove("hovered"); emu.funcs.emu_focusing(null, "mouseleave"); }, false);

			// VIEW: Emulator controls (TOP ROW)
			emu.vars.dom.view["emuControls_stop"]  .addEventListener("click", function(){ emu.funcs.stopEmu(true); }, false);
			emu.vars.dom.view["emuControls_resize"].addEventListener("click", function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, false);
			emu.vars.dom.view["emuControls_reload"].addEventListener("click", emu.funcs.loadGame, false);
			emu.vars.dom.view["emuControls_unload"].addEventListener("click", emu.funcs.emu_unload, false);
			emu.vars.dom.view["emuControls_rotate"].addEventListener("click", emu.funcs.emu_rotate, false);
			emu.vars.dom.view["emuControls_autopause_btn"].addEventListener("click", function() {
				// Get a handle on the DOM element.
				let autopause_chk = emu.vars.dom.view["emuControls_autopause_chk"];

				// Toggle the enabled class.
				autopause_chk.classList.toggle("enabled");

				// Determine if the emu should be paused or unpaused.
				if (autopause_chk.classList.contains("enabled")) { emu.funcs.emu_focusing(null, "mouseenter"); }
				else { emu.funcs.emu_focusing(null, "mouseleave"); }
			}, false);

			// VIEW: Emulator controls (SECOND ROW)
			emu.vars.dom.view["emuControls_QUALITY"].addEventListener("mousedown", function() { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_F2" , 1); emu.vars.innerEmu.displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_QUALITY"].addEventListener("mouseup"  , function() { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_F2" , 1); emu.vars.innerEmu.displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_DEBUG"]  .addEventListener("mousedown", function() { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_F3" , 1); emu.vars.innerEmu.displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_DEBUG"]  .addEventListener("mouseup"  , function() { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_F3" , 1); emu.vars.innerEmu.displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_FLICKER"].addEventListener("mousedown", function() { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_F7" , 1); emu.vars.innerEmu.displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_FLICKER"].addEventListener("mouseup"  , function() { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_F7" , 1); emu.vars.innerEmu.displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_PAUSE"]  .addEventListener("mousedown", function() { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_F9" , 1); emu.vars.innerEmu.displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_PAUSE"]  .addEventListener("mouseup"  , function() { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_F9" , 1); emu.vars.innerEmu.displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_STEP"]   .addEventListener("mousedown", function() { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_F10", 1); emu.vars.innerEmu.displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_STEP"]   .addEventListener("mouseup"  , function() { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_F10", 1); emu.vars.innerEmu.displayCUzeBox_flags(); }, false);

			// VIEW: Event listeners for the onscreen gamepad buttons.
			document.querySelectorAll("svg g.hover_group").forEach(function(d,i,a){
				// Get the pad and the name of the button.
				let pad    = d.getAttribute("pad");
				let key    = d.getAttribute("name");
				let closestG = d.closest("g");
				// let uzebtn = d.getAttribute("uzebtn");

				// Send the appropriate key. (Player 1)
				if(pad == "1"){
					closestG.addEventListener("mousedown" , function() { emu.vars.innerEmu.emu_sendKeyEvent("keydown", key , 1); }, true);
					closestG.addEventListener("mouseleave", function() { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , key , 1); }, true);
					closestG.addEventListener("mouseup"   , function() { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , key , 1); }, true);
				}
				// Send the appropriate keys. (Player 2)
				else if(pad == "2"){
					closestG.addEventListener("mousedown" , function() { emu.vars.innerEmu.emu_sendKeyEvent("keydown", key , 2); }, false);
					closestG.addEventListener("mouseleave", function() { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , key , 2); }, false);
					closestG.addEventListener("mouseup"   , function() { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , key , 2); }, false);
				}
			});

			// VIEW: Gamepad polling, Emu core switch
			emu.vars.dom.view["gamepadIcon_poll"].addEventListener("click" , emu.gamepads.init           , false);
			emu.vars.dom.view["emuCore_switch"]  .addEventListener("click" , emu.vars.innerEmu.toggleCore, false);
		};
		EL_view();

		// UAM login, logout, open buttons.
		if(emu.vars.originUAM==true){
			emu.vars.dom.uamLogin["uam_login"] .addEventListener("click", function(){ emu.funcs.UAM.openModal("uamlogin" ); }, false);
			emu.vars.dom.uamLogin["uam_logout"].addEventListener("click", function(){ emu.funcs.UAM.openModal("uamlogout"); }, false);
			emu.vars.dom.uamLogin["openUAM"].forEach(function(d, i, a) {
				d.addEventListener("click", emu.funcs.UAM.openUamInNewWindow, false);
			});
		}

	},
	// * Stops the Emscripten instance.
	stopEmu               : function(showStoppedText) {
		// This just removes the Emscripten instance.
		// The game can be restarted there are still game files loaded.
		if (emu.vars.gameFiles.length) {
			emu.funcs.shared.grayTheCanvas(emu.vars.dom.view["emuCanvas"]);
			if(showStoppedText){
				emu.funcs.shared.resetCanvasDimensions();
				emu.funcs.shared.textOnCanvas({ "canvas": emu.vars.dom.view["emuCanvas"], "text": " - STOPPED - " });

			}

			// Abort the current emulator instance?
			if(emu.vars.innerEmu.Module.abort) {
				try{
					// Save the CUzeBox eeprom.bin file to localStorage before we end the Emscripten instance?
					if( Object.keys(emu.vars.innerEmu.Module.FS.root.contents).indexOf("eeprom.bin") !=-1 ){
						localStorage.setItem("EMU_eeprom.bin", emu.vars.innerEmu.Module.FS.readFile("eeprom.bin") );
						// console.log("Saved eeprom.bin to localStorage.");
						emu.funcs.shared.textOnCanvas2({"text":"Saved EEPROM"});
					}

					// Clear the displayed CUzeBox flags.
					emu.vars.innerEmu.clearDisplayedCUzeBox_flags();

					// Clear the displayed pressed keys.
					emu.vars.innerEmu.clearDisplayedPressedKeys();

					// Abort the Emscripten module. Needs to be the last thing in this "try" since it will trigger the catch.
					emu.vars.innerEmu.Module.abort();


				} catch(e){
					// The abort always throws an exception so it always catches. This is expected.
					// console.log("A failure occurred at stopEmu:", e);
				}

				// Stop the current gamepad polling if it is running.
				if(emu.gamepads.enabled==true){
					// console.log("Gamepads were enabled. Disabling them now.");
					emu.gamepads.prev_pollState=true;
					emu.gamepads.enabled=true;
					emu.gamepads.init();
				}

			}
			// Clear Module.
			emu.vars.innerEmu.Module = null;

			// Reset Module.
			emu.vars.innerEmu.Module = new emu.vars.innerEmu.createDefaultModule();

			// Indicate that there is not a game loaded.
			emu.vars.innerEmu.emulatorIsReady=false;
		}
		else {
			return;
		}
	},
	// * Will clear the cached game file data. Leaves the Emscripten core intact.
	emu_reset             : function() {
		// Stop the emulator if it is active.
		emu.funcs.stopEmu(false);

		// Clear last image from the canvas.
		emu.funcs.shared.clearTheCanvas(emu.vars.dom.view["emuCanvas"]);
		emu.funcs.shared.resetCanvasDimensions();

		// Reset.
		emu.vars.gameFiles = [];
		emu.vars.gameFile  = "";

		document.querySelector("#emu_filesList_links").innerHTML="";
	},
	// * Will clear the cached game file data AND put a "GAME NOT LOADED" message on the emu canvas.
	emu_unload            : function() {
		// Stop the emulator if it is active.
		emu.funcs.stopEmu(true);

		// Clear last image from the canvas.
		emu.funcs.shared.resetCanvasDimensions();
		emu.funcs.shared.clearTheCanvas(emu.vars.dom.view["emuCanvas"]);

		// Indicate that there is not a game loaded.
		emu.funcs.shared.textOnCanvas({ "canvas": emu.vars.dom.view["emuCanvas"], "text": " - GAME NOT LOADED - " });

		// Reset.
		emu.vars.gameFiles = [];
		emu.vars.gameFile  = "";

		// Clear the selected DB game.
		emu.vars.dom.view.builtInGames_select.value = "";

		// Clear the displayed filelist.
		emu.vars.dom.view["emu_filesList_div"].innerHTML="No files are loaded.";

		document.querySelector("#emu_filesList_links").innerHTML="";
	},
	// * Queries the database for a list of built-in games. Puts the results in a game select menu.
	emu_getBuiltInGamelist: function() {
		var resolved = function(res) {
			// Used to add games by category.
			var addGamesByCategory = function(data, select) {
				// let select;
				let optgroup;
				let option;
				let frag;
				let thisFile;

				optgroup = document.createElement('optgroup');
				optgroup.setAttribute('label', data.groupTitle + " (" + data.data.length + ")");
				frag = document.createDocumentFragment(optgroup);
				frag.appendChild(optgroup);

				// Add the records for this category.
				for (var i = 0; i < data.data.length; i++) {
					thisFile = data.data[i];
					option = document.createElement('option');
					option.value = thisFile.id;
					option.text = thisFile.title;
					frag.appendChild(option);
				}

				// Create/Add option group - spacer
				optgroup = document.createElement('optgroup');
				optgroup.setAttribute('label', '');
				frag.appendChild(optgroup);

				select.appendChild(frag);
			};

			if(typeof res=="string"){ res = JSON.parse(res); } // IE11 Fix:

			// Break the game data apart into separate categories.
			var categories = [
				{ 'groupTitle': '== ' + emu.vars.emu_statuses[3] + '', 'data': res.data.filter(function(e) { if (e.status == 3) { return true; } }), }, // 'Complete   '
				{ 'groupTitle': '== ' + emu.vars.emu_statuses[7] + '', 'data': res.data.filter(function(e) { if (e.status == 7) { return true; } }), }, // 'UCC2018    '
				{ 'groupTitle': '== ' + emu.vars.emu_statuses[6] + '', 'data': res.data.filter(function(e) { if (e.status == 6) { return true; } }), }, // 'UCC2016    '
				{ 'groupTitle': '== ' + emu.vars.emu_statuses[5] + '', 'data': res.data.filter(function(e) { if (e.status == 5) { return true; } }), }, // 'UCC2014    '
				{ 'groupTitle': '== ' + emu.vars.emu_statuses[4] + '', 'data': res.data.filter(function(e) { if (e.status == 4) { return true; } }), }, // 'UCC2013    '
				{ 'groupTitle': '== ' + emu.vars.emu_statuses[1] + '', 'data': res.data.filter(function(e) { if (e.status == 1) { return true; } }), }, // 'Demo       '
				{ 'groupTitle': '== ' + emu.vars.emu_statuses[2] + '', 'data': res.data.filter(function(e) { if (e.status == 2) { return true; } }), }, // 'WIP        '
				{ 'groupTitle': '== ' + emu.vars.emu_statuses[8] + '', 'data': res.data.filter(function(e) { if (e.status == 8) { return true; } }), }, // 'RESERVED   '
				{ 'groupTitle': '== ' + emu.vars.emu_statuses[0] + '', 'data': res.data.filter(function(e) { if (e.status == 0) { return true; } }), }, // 'NO CATEGORY'
			];

			// Get handle on select menu DOM.
			var emu_builtInGames_select1 = emu.vars.dom.view["builtInGames_select"];
			// Clear the options.
			emu_builtInGames_select1.length = 1;
			// Clear the optgroups.
			emu_builtInGames_select1.querySelectorAll('optgroup').forEach(function(d, i, a) { d.remove(); });
			// Add the game data by category.
			categories.map(function(d, i, a) {
				if (d.data.length) { addGamesByCategory(d, emu_builtInGames_select1); }
			});

			if(emu.vars.UAM_active){
				// Get handle on select menu DOM.
				var emu_builtInGames_select2 = emu.vars.dom.db["gameSelect"];
				// Clear the options.
				emu_builtInGames_select2.length = 1;
				// Clear the optgroups.
				emu_builtInGames_select2.querySelectorAll('optgroup').forEach(function(d, i, a) { d.remove(); });
				// Add the game data by category.
				categories.map(function(d, i, a) {
					if (d.data.length) { addGamesByCategory(d, emu_builtInGames_select2); }
				});
			}
		};
		var formData = {
			"o": "emu_getBuiltInGamelist",
			"_config": { "processor": "emu_p.php" }
		};
		var prom1 = emu.funcs.shared.serverRequest(formData).then(resolved, emu.funcs.shared.rejectedPromise);
		return prom1;
	},
	// * Used by the "PLAY" button in the game files list. Starts the specified game.
	loadGameFromList      : function(game) {
		emu.vars.gameFile = game;
		emu.funcs.loadGame();
	},
	// * Downloads the specified file out of the game files list.
	downloadFile          : function(filename){
		var file  = emu.vars.gameFiles.filter(function(d,i,a){ if(d.name==filename) {return true;}});
		var gametitle = emu.vars.dom.view["builtInGames_select"].options[emu.vars.dom.view["builtInGames_select"].selectedIndex].innerText;

		if(file.length){ file=file[0]; } else {
			console.log("The file was NOT found.");
			alert      ("The file was NOT found.");
			return;
		}

		// Load FileSaver if needed.
		featureDetection.funcs.applyFeatures_fromList([ "FileSaver" ]).then(
			function(res){
				// Convert to blob.
				var blob = new Blob( [file.data] , {type: "text/plain;charset=utf-8"});
				// Present the download.
				saveAs(blob, filename);
			}
			,emu.funcs.shared.rejectedPromise
		);

	},
	// * Downloads all loaded game files as a .zip.
	downloadZip           : function(){
		// var datas  = emu.vars.gameFiles.filter(function(d,i,a){ if(d.name==filename) {return true;}});
		var datas  = emu.vars.gameFiles;
		var gametitle = emu.vars.dom.view["builtInGames_select"].options[emu.vars.dom.view["builtInGames_select"].selectedIndex].innerText;

		if(! datas.length){
			console.log("No game files have been loaded.");
			alert      ("No game files have been loaded.");
			return;
		}

		// Load JSZip and FileSaver if needed.
		featureDetection.funcs.applyFeatures_fromList([ "JSZip", "FileSaver" ]).then(
			function(){
				var zip = new JSZip();

				for(var i=0; i<datas.length; i+=1){ zip.file( datas[i].name, datas[i].data ); }

				zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 9 } })
				.then(
					function(content) {
						saveAs(content, gametitle+".zip");
					}
					,emu.funcs.shared.rejectedPromise
				);
			}
			,emu.funcs.shared.rejectedPromise
		);
	},
	// * Retrieves/loads game files.
	getGameFiles          : function(methodType) {
		// Get DOM handles on the loading inputs.
		var emu_builtInGames_select1 = emu.vars.dom.view.builtInGames_select;
		var userFiles = emu.vars.dom.view["emu_FilesFromUser"];
		var jsonInput = emu.vars.dom.view["emu_FilesFromJSON"];
		var jsonInputUAM = emu.vars.dom.view["emu_FilesFromJSON_UAM"];

		var gameid;

		// Allow the game load?
		if (methodType == 1 && emu_builtInGames_select1.value == "") { console.log("method #1: no value."); return; }
		if (methodType == 2 && !userFiles.files.length)              { console.log("method #2: no value."); return; }
		if (methodType == 3 && jsonInput.value == "")                { console.log("method #3: no value."); return; }
		if (methodType == 4 && jsonInputUAM.value == "")             { console.log("method #4: no value."); return; }

		var addFileListToDisplay  = function() {
			// let doNotCreateLinks = true;
			let doNotCreateLinks = false;

			// Get handle on destination div and clear it..
			var destdiv = document.querySelector("#emu_filesList_div");
			destdiv.innerHTML = "";

			var destdiv2 = document.querySelector("#emu_filesList_links");
			destdiv2.innerHTML = "";

			// Create the table template.
			var tableTemplate = document.createElement("table");
			tableTemplate.classList.add("table1");

			// Create new document fragment and append the table template to it.
			let frag = document.createDocumentFragment();
			frag.appendChild(tableTemplate);

			// Get a handle on the fragment table.
			var fragTable = frag.querySelector("table");

			// Create the table template head at the top of the fragment table.
			let row = fragTable.insertRow(0);
			row.innerHTML = ""
			row.innerHTML += "<th>PLAY</th>"
			row.innerHTML += "<th>NAME</th>"
			row.innerHTML += "<th>BYTES</th>"

			// Get the game files list
			// Resort the files list so that the .uze and .hex are at the top.
			var list = [];
			list = list.concat(
				emu.vars.gameFiles.filter(function(d, i, a) {
					let ext = (d.name.substr(-4, 4)).toLowerCase();
					if (ext == ".uze" || ext == ".hex") { return true; }
				}),
				emu.vars.gameFiles.filter(function(d, i, a) {
					let ext = (d.name.substr(-4, 4)).toLowerCase();
					let isExecFile = (ext == ".uze" || ext == ".hex") ? 1 : 0;
					if (ext != ".uze" && ext != ".hex") { return true; }
				})
			);

			// Go through the files list and create the table rows.
			for (var i = 0; i < list.length; i++) {
				let record = list[i].name;
				let filesize = list[i].filesize;
				let ext = (record.substr(-4, 4)).toLowerCase();
				let isExecFile = (ext == ".uze" || ext == ".hex") ? 1 : 0;
				let filesizeHTML = filesize.toLocaleString() + "";

				// Determine a shorter filename so that it will fit.
				let shortenedName = "";
				if (record.length > 23) { shortenedName = record.substr(0, 15) + "..." + record.substr(-6); }
				else { shortenedName = record; }

				let playButton = "<input type=\"button\" value=\"PLAY\" class=\"playButton\" onclick=\"emu.funcs.loadGameFromList('" + record + "');\">";
				let linkHTML   = "<span class=\"hyperlink1\" onclick=\"emu.funcs.downloadFile('"+record+"');\">"+record+"</span> ";

				// Create the new row and the cells.
				let row = fragTable.insertRow(fragTable.rows.length);
				let ceil0 = row.insertCell(0);
				let ceil1 = row.insertCell(1);
				let ceil2 = row.insertCell(2);


				// Add the data to each cell.
				ceil0.innerHTML = (isExecFile ? playButton : '--');
				ceil0.style["text-align"] = "center";
				ceil1.innerHTML = (doNotCreateLinks ? shortenedName : linkHTML);
				ceil2.innerHTML = filesizeHTML;
			}

			// Append the fragTable to the dest div.
			destdiv.appendChild(fragTable);

			// <a href="https://dev3-nicksen782.c9users.io/web/ACTIVE/UAM5/uam5.php?gameid=100">Direct Play URL</a>
			// downloadZip
			// DOWNLOAD AS .ZIP
			//

			// Create game url and download as zip table.
			var gameLinksHTML = "";
			let gameURL_link=window.location.origin + window.location.pathname + "?gameid="+gameid;
			gameLinksHTML += "<table id='gameLinksTable'>";
			gameLinksHTML += "	<tr>";
			gameLinksHTML += "		<td> <a target='_blank' href='"+gameURL_link+"' class='hyperlink1 gamelinks"+(gameid ? '': ' notVisible')+"'>Direct Play URL</a></td>";
			gameLinksHTML += "		<td> <span onclick='emu.funcs.downloadZip();' class='hyperlink1 gamelinks'>DOWNLOAD AS .ZIP</span> </td>";
			gameLinksHTML += "	</tr>";
			gameLinksHTML += "</table>";

			destdiv2.innerHTML += gameLinksHTML;
		}
		var finishFileLoading     = function(proms, res, loadNow) {
			var promsOnly = proms.map(function(d, i, a) { return d.prom; });

			Promise.all(promsOnly).then(
				function(results) {
					// Go through the data, correct the .uze header if needed, add file to gameFiles.
					proms.map(function(d, i, a) {
						let view8 = fixUzeHeader(d.filename, results[i]);
						// Add the data.
						emu.vars.gameFiles.push({
							'name': d.filename,
							'data': view8,
							'filesize': view8.length,
						});
					});

					// JSON downloads.
					if (methodType == 1 || methodType == 3 || methodType == 4) {
						// Get the gamefile name.
						emu.vars.gameFile = res.remoteload.gamefile;

						// Games are loaded. Make sure we can continue.
						var doWeLoadTheGame = true;
						if (!emu.vars.gameFile.length) { console.log("No gamefile in emu.gameFile!");
							doWeLoadTheGame = false; }
						if (!emu.vars.gameFiles.length) { console.log("No game files in emu.gameFiles!");
							doWeLoadTheGame = false; }

						if (doWeLoadTheGame) {
							setTimeout(function() {

								// emu.addFileListToDisplay(false, true);
								addFileListToDisplay();

								if (loadNow) {
									emu.funcs.loadGame();
								}

							}, 100);
						}
						else {
							console.warn("ABORT GAME LOAD!");
							return;
						}
					}

					// User-supplied files downloads.
					else if (methodType == 2) {
						// Clear the file uploads from the file input.
						userFiles.value = "";

						// Games are loaded. Make sure we can continue.
						var doWeLoadTheGame = true;
						if (!emu.vars.gameFiles.length) { console.log("No game files in emu.gameFiles!");
							doWeLoadTheGame = false; }

						if (doWeLoadTheGame) {
							setTimeout(function() {
								addFileListToDisplay();

								// Count the number of .uze and .hex files.
								let uzeCount = 0;
								let hexCount = 0;
								emu.vars.gameFiles.map(function(d, i, a) {
									if (d.name.toLowerCase().indexOf(".uze") != -1) { uzeCount++; }
									else if (d.name.toLowerCase().indexOf(".hex") != -1) { hexCount++; }
								});

								// Only one .uze or .hex then we do an auto load.
								if (uzeCount + hexCount == 1) {
									// Load the first .uze or .hex that is found in the files list.
									for (let i = 0; i < emu.vars.gameFiles.length; i += 1) {
										if (
											emu.vars.gameFiles[i].name.toLowerCase().indexOf(".uze") != -1 ||
											emu.vars.gameFiles[i].name.toLowerCase().indexOf(".hex") != -1
										) {
											emu.vars.gameFile = emu.vars.gameFiles[i].name;
											emu.funcs.loadGame();
											break;
										}
									}
								}

							}, 100);
						}
						else {
							console.warn("ABORT GAME LOAD!");
							return;
						}

					}
				},
				function(error) {}
			);
		};
		var downloadFilesFromList = function(res) {
			var proms = [];

			// Download each file.
			res.remoteload.files.map(function(d, i, a) {
				proms.push({
					"filename": d.filename,
					"data": "",
					"prom": emu.funcs.shared.serverRequest({
						"o": "",
						"_config": { "responseType": "arraybuffer", "processor": d.completefilepath }
					})
				})
			});

			// Now run the function that creates the Promise.all now that the promise array is fully populated.
			finishFileLoading(proms, res, true);
		};
		var returnJSON_byGameId   = function(gameid) {
			return new Promise(function(resolve, reject) {
				var formData = {
					"o": "emu_returnJSON_byGameId",
					"gameId": gameid,
					"_config": { "processor": "emu_p.php" }
				};
				var prom1 = emu.funcs.shared.serverRequest(formData).then(
					resolve,
					emu.funcs.shared.rejectedPromise
				);
			});
		};
		var loadUserFilelist      = function() {
			// Get the file list.
			// Use a file reader to read as array buffer.
			// Add each file to the gameFiles array.
			// Use Promise.all instead of something recursive.

			if (!userFiles.files.length) {
				console.log("No files.");
				// emu.gameFilesDownloading = false ;
				// emu.gameAllowedToLoad   = true ;
				// emu.addFileListToDisplay(false, false);
				return;
			}
			emu_builtInGames_select1.value = "";

			var proms = [];

			// Do a File Reader on each file.
			for (let i = 0; i < userFiles.files.length; i += 1) {
				let d = userFiles.files[i];
				proms.push({
					"filename": d.name,
					"data": "",
					"prom": new Promise(function(resolve, reject) {
						var reader = new FileReader();
						reader.onload = (function(e) {
							resolve(e.target.result);
						});
						reader.readAsArrayBuffer(userFiles.files[i]);

					})
				});
			}

			emu.vars.dom.view["emu_FilesFromUser"].value="";

			finishFileLoading(proms, null, true);
		};
		var fixUzeHeader          = function(filename, data) {
			let view8 = new Uint8Array(data);

			// Fix the header on the .uze file?
			if (filename.toLowerCase().indexOf(".uze") != -1) {
				let header = Array.prototype.slice.call(view8, 0, 6).toString();
				if (header !== "85,90,69,66,79,88") {
					// Mising 'UZEBOX'. Set those bytes to have 'UZEBOX'.
					view8[0] = 85; // U
					view8[1] = 90; // Z
					view8[2] = 69; // E
					view8[3] = 66; // B
					view8[4] = 79; // O
					view8[5] = 88; // X
					console.log("GAMEFILE:", filename, " -- The header has been corrected.");
				}
			}

			return view8;
		};

		// Reset the cached game files.
		emu.funcs.emu_reset();

		// Clear the emu canvas and put a loading message on it while the game is loading.
		emu.funcs.shared.clearTheCanvas(emu.vars.dom.view["emuCanvas"]);
		emu.funcs.shared.textOnCanvas({ "canvas": emu.vars.dom.view["emuCanvas"], "text": " - LOAD GAME FILES - " });

		// Method #1 - Games DB
		if (methodType == 1) {
			gameid = emu_builtInGames_select1.value;
			returnJSON_byGameId(gameid).then(
				function(res) {
					if(typeof res=="string"){ res = JSON.parse(res); } // IE11 Fix:
					downloadFilesFromList(res);
				}, emu.funcs.shared.rejectedPromise);
		}

		// Method #2 - User-supplied files.
		else if (methodType == 2) {
			loadUserFilelist();
		}

		// Method #3 - JSON Remote Load.
		else if (methodType == 3) {
			// Get the specified remoteload.json file.
			let getRemoteLoadJson = emu.funcs.shared.serverRequest({
				"o": "",
				"_config": { "responseType": "json", "processor": jsonInput.value }
			});

			getRemoteLoadJson.then(
				function(res) {
					emu_builtInGames_select1.value = "";
					if(typeof res=="string"){ res = JSON.parse(res); } // IE11 Fix:
					let baseURL = jsonInput.value.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
					res = { "remoteload": res };
					res.remoteload.baseURL = baseURL;
					res.remoteload.files.map(function(d, i, a) {
						d.completefilepath = baseURL + "/" + d.completefilepath;
					});
					downloadFilesFromList(res);
				}, emu.funcs.shared.rejectedPromise
			);
		}

		// Method #4 - JSON Remote Load UAM. (Nearly identical to method 3.)
		else if (methodType == 4) {
			// Get the specified remoteload.json file.
			let getRemoteLoadJson = emu.funcs.shared.serverRequest({
				"o": "",
				"_config": { "responseType": "json", "processor": jsonInputUAM.value }
			});

			getRemoteLoadJson.then(
				function(res) {
					emu_builtInGames_select1.value = "";
					if(typeof res=="string"){ res = JSON.parse(res); } // IE11 Fix:
					let baseURL = jsonInputUAM.value.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
					res = { "remoteload": res };
					res.remoteload.baseURL = baseURL;
					res.remoteload.files.map(function(d, i, a) {
						d.completefilepath = baseURL + "/" + d.completefilepath;
					});
					downloadFilesFromList(res);
				}, emu.funcs.shared.rejectedPromise
			);
		}

	},
	// * Loads the cached game files into a new Emscripten instance.
	loadGame              : function(){
		if (!emu.vars.gameFiles.length) {
			// console.log("No files are loaded.");
			return;
		}

		// The gameFile should be populated and so should all the game's files.
		if (!emu.vars.gameFile.length) {
			// console.log("No game file was specified.");
			return;
		}

		// Prevent a game from autoloading when using querystring unless the user has clicked the canvas.
		if(emu.vars.innerEmu.startEmuAfterUserInput){
			emu.funcs.shared.clearTheCanvas(emu.vars.dom.view["emuCanvas"]);
			emu.funcs.shared.textOnCanvas({ "canvas": emu.vars.dom.view["emuCanvas"], "text": "- CLICK HERE TO START -" });
			emu.vars.dom.view["emuCanvas"].addEventListener("mousedown", emu.vars.innerEmu.startAfterMouseClick, false);
			return;
		}

		// Start new Emscripen instance by modifying Module.arguments and then running the Emscritpen module function.
		emu.funcs.stopEmu(false);

		// Edit Module: Set the game file.
		emu.vars.innerEmu.Module.arguments = [emu.vars.gameFile];

		// Start the new instance.
		emu.vars.innerEmu.UOP( emu.vars.innerEmu.Module );
	},
	// * Sets/Clears focus to the emu canvas, pauses/unpauses Emscripten.
	emu_focusing          : function(e, typeOverride) {
		// Temp variable.
		var type = "";

		// Get DOM handle to the emu canvas.
		var target = emu.vars.dom.view.emuCanvas;

		// Is there an element there?
		if (null == target) {
			// console.log("no Emscripten canvas.");
			return;
		}

		// Is it loaded and ready?
		else if (
			emu.vars.innerEmu.Module &&
			emu.vars.innerEmu.emulatorIsReady
		) {
			// Get the type.
			if (undefined == e) { type = typeOverride; }
			else { type = e.type; }

			// Don't pause if the auto-pause checkbox is checked.
			if (!emu.vars.dom.view["emuControls_autopause_chk"].classList.contains("enabled")) { type = "mouseenter"; }

			// Make sure that the specified type is an accepted type.
			if (["mouseenter", "mouseleave"].indexOf(type) == -1) { return; }

			// Should we focus the emulator canvas?
			if (["mouseenter"].indexOf(type) != -1) {
				target.focus();
				emu.vars.innerEmu.Module.resumeMainLoop();
			}

			// Should we blur the emulator canvas focus?.
			else if (["mouseleave"].indexOf(type) != -1) {
				target.blur();
				emu.vars.innerEmu.Module.pauseMainLoop();

				// Draw PAUSED to the canvas.
				emu.funcs.shared.grayTheCanvas(emu.vars.dom.view["emuCanvas"]);
				emu.funcs.shared.textOnCanvas({ "canvas": emu.vars.dom.view["emuCanvas"], "text": " - PAUSED - " });
			}

			emu.vars.innerEmu.displayCUzeBox_flags();
		}
		else{
			// console.log( "emu_focusing: The emulator is not ready!" );
		}

	},
	// * Loads gamefiles from the user.
	emu_processUserUploads: function(e) {
		emu.funcs.getGameFiles(2);
	},
	// * Just clicks the invisible upload button for game files from the user's computer.
	emu_clickUserUpload   : function(e) {
		emu.vars.dom.view["emu_FilesFromUser"].click();
	},

	// NOT COMPLETE
	emu_rotate            : function() {
		return;
		// emu_rotate
		var canvas = emu.vars.dom.view.emuCanvas;
		var container = emu.vars.dom.view.emscripten_emu_container;

		emu.vars.rotateDeg = 0;
		emu.vars.rotateDeg = 90;
		emu.vars.rotateDeg = 180;
		emu.vars.rotateDeg = 270;
		emu.vars.rotateDeg = 360;
		// Get current rotation value.
		// 90  // aspect ratio needs to 1:1.
		// 180 // aspect ratio 8:7 (normal)
		// 270 // aspect ratio needs to be 1:1.
		// 360 // aspect ratio 8:7 (normal)
	},

};
emu.funcs.UAM    = {
	// * Adds the UAM event listeners.
	addEventListeners  : function() {
		// Permissions are required.
		// if(emu.vars.UAMDATA.permKeys.indexOf("emu_canCompile") !=-1 ){
		// }

		// emu.funcs.db.addEventListeners();

		// <iframe src="uamlogin.html" frameBorder="0" style="border: 0; width: 300px; height: 100px; border-radius:5px; "></iframe>

	},
	// * Opens the UAM main application in a new window.
	openUamInNewWindow : function(){
		window.open("../index.php");
	},
	// * Handles the opening/closing of modals.
	openModal          : function(whichModal){
		let onClickListener = function(){ closeAllModals(); };
		let entireBodyDiv = document.querySelector("#entireBodyDiv");
		let uamModal = emu.vars.dom.uamLogin["uamModal"];
		let oldiframe = document.querySelector("#uamIframe");
		if(oldiframe){ oldiframe.remove(); }
		let iframe = document.createElement("iframe");
		iframe.id="uamIframe";
		iframe.setAttribute("frameBorder","0");


		let url="";

		// Closes all modals.
		function closeAllModals(){
			// Hide the entireBodyDiv.
			let entireBodyDiv = document.querySelector("#entireBodyDiv");
			entireBodyDiv.removeEventListener("click", onClickListener, false);
			entireBodyDiv.classList.remove("active");

			// Hide all the modals.
			var allModals = document.querySelectorAll(".modals");
			allModals.forEach(function(d,i,a){ d.classList.remove("active"); });
		};

		// Close all modals.
		closeAllModals();

		// Open which modal?
		switch(whichModal){
			case "closeAllModals" : { return; break; }
			case "uamlogin"       : { url="../uamlogin.html?view=loginDIV" ; break; }
			case "uamlogout"      : { url="../uamlogin.html?view=logoutDIV"; break; }
			default               : { return; break; }
		};

		// Add screen darkener and event listener.
		entireBodyDiv.classList.add("active");
		entireBodyDiv.addEventListener("click", onClickListener, false);

		// Show the specified modal.
		uamModal.appendChild(iframe);
		iframe.onload=function(){
			iframe.onload=null;
			emu.vars.dom.uamLogin["uamModal"].classList.add("active");
		};
		iframe.src=url;

	},
	// * Show UAM.
	enableUAM          : function() {
		// Get values from UAM.
		emu.vars.originUAM      = true;
		emu.vars.UAM_active     = true;
		emu.vars.user_id        = emu.vars.UAMDATA.user_id;

		// Determine what will be visible to the user.
		if(
			   emu.vars.UAMDATA.permKeys.indexOf("emu_canCompile")    !=-1
			&& emu.vars.UAMDATA.permKeys.indexOf("emu_isUamGameUser") !=-1
		){
			// Show
		}

		if(
			   emu.vars.UAMDATA.permKeys.indexOf("emu_isDbAdmin") !=-1
			&& emu.vars.UAMDATA.permKeys.indexOf("emu_isDbUser") !=-1
		){

		}

		// // Unhide UAM DOM.
		// document.querySelectorAll(".uamOnly").forEach(function(d, i, a) {
		// 	d.classList.remove("unavailableView");
		// 	d.classList.add("enabled");
		// });

		// // Unhide the other nav options.
		// document.querySelectorAll(".sectionDivs_title_options .navOptions.uamOnly").forEach(function(d, i, a) {
		// 	d.classList.remove("hidden");
		// });

		// Permissions are required.
		if(
			   emu.vars.UAMDATA.permKeys.indexOf("emu_canCompile") !=-1
			)
		{
			// // Make the container wider. Shrink the emu windows.
			// document.querySelector("html").classList.add("wide");
			// document.querySelector("#emu_emulator").classList.add("largerEmuWindow");

			// Set the other options.
			setTimeout(function(){
				// Show the compile options for the VIEW view.
				emu.vars.dom.view["emu_view_uam"].classList.add("enabled");
				emu.vars.dom.view["emu_view_uam"].classList.remove("unavailableView");

				// Show the VIEW nav buttons.
				document.querySelectorAll(".sectionDivs_title_options .navOptions[newview='VIEW']").forEach(function(d, i, a) {
					d.classList.remove("hidden");
					d.classList.remove("uamOnly");
				});
				// Show the DEBUG1 nav buttons.
				document.querySelectorAll(".sectionDivs_title_options .navOptions[newview='DEBUG1']").forEach(function(d, i, a) {
					d.classList.remove("hidden");
					d.classList.remove("uamOnly");
				});
				// Show the DEBUG2 nav buttons.
				document.querySelectorAll(".sectionDivs_title_options .navOptions[newview='DEBUG2']").forEach(function(d, i, a) {
					d.classList.remove("hidden");
					d.classList.remove("uamOnly");
				});

				// Add the event listeners for the compile options.
				// UAM JSON load.
				emu.vars.dom.view["emu_FilesFromJSON_UAM"].addEventListener("change", function() {
					this.select();
				}, false);
				emu.vars.dom.view["emu_FilesFromJSON_UAM_load"].addEventListener("click", function() {
					let uam_gamelist = emu.vars.dom.view["emu_gameSelect_UAM_select"];
					emu.vars.dom.view["emu_FilesFromJSON_UAM"].value = uam_gamelist.options[uam_gamelist.selectedIndex].getAttribute("remoteload");
					emu.funcs.getGameFiles("4");
				}, false);

				// UAM game select menu.
				emu.vars.dom.view["emu_gameSelect_UAM_select"].addEventListener("change", function() {
					let uam_gamelist = emu.vars.dom.view["emu_gameSelect_UAM_select"];
					emu.vars.dom.view["emu_FilesFromJSON_UAM"].value = uam_gamelist.options[uam_gamelist.selectedIndex].getAttribute("remoteload");
				}, false);

				// UAM compile options.
				var compileOptions_function = function(e) {
					// Toggle the enabled class on the "checkbox".
					let check = this.querySelector(".checkbox");
					if (check.classList.contains("enabled")) { check.classList.remove("enabled") }
					else { check.classList.add("enabled") }
				};
				var compileOptions = document.querySelectorAll("#emu_view_uam .checkbox_button");
				compileOptions.forEach(function(d, i, a) {
					d.addEventListener("click", compileOptions_function, false);
				});

				// UAM Compile/C2BIN actions.
				emu.vars.dom.view["emu_compile_UAM"].addEventListener("click", emu.funcs.UAM.compileGameUAM, false);
				emu.vars.dom.view["emu_c2bin_UAM"].addEventListener("click", emu.funcs.UAM.c2bin_UamGame, false);
				emu.vars.dom.view["emu_c2bin2_UAM"].addEventListener("click", emu.funcs.UAM.c2bin_UamGame_2, false);
			}, 175);

			// .sectionDivs_title_options newview="TOP"
			// .sectionDivs_title_options newview="VIEW"
			// .sectionDivs_title_options newview="DEBUG1"
			// .sectionDivs_title_options newview="DEBUG2"
			// .sectionDivs_title_options newview="DB"

		}

		if(	emu.vars.UAMDATA.permKeys.indexOf("emu_isDbAdmin") !=-1 ){
			// Show the VIEW nav buttons.
			document.querySelectorAll(".sectionDivs_title_options .navOptions[newview='VIEW']").forEach(function(d, i, a) {
				d.classList.remove("hidden");
				d.classList.remove("uamOnly");
			});

			// Show the DB nav buttons.
			document.querySelectorAll(".sectionDivs_title_options .navOptions[newview='DB']").forEach(function(d, i, a) {
				d.classList.remove("hidden");
				d.classList.remove("uamOnly");
			});

			// Add the event listeners.
			emu.funcs.db.addEventListeners();
		}
	},
	// * Hide UAM.
	disableUAM         : function() {
		// Unset the values that came from UAM.
		// emu.vars.originUAM      = false;
		// emu.vars.UAM_active     = false;
		// emu.vars.user_id        = undefined;

		// Hide UAM DOM.
		document.querySelectorAll(".uamOnly").forEach(function(d, i, a) {
			d.classList.add("unavailableView");
			d.classList.remove("enabled");
		});

		// Hide the other nav options.
		document.querySelectorAll(".sectionDivs_title_options .navOptions.uamOnly").forEach(function(d, i, a) {
			d.classList.add("hidden");
		});

		// Make the container normal width. Enlarge the emu windows.
		document.querySelector("html").classList.remove("wide");
		document.querySelector("#emu_emulator").classList.remove("largerEmuWindow");
		// emu.vars.dom.view["emuCanvas"].width="640";
		// emu.vars.dom.view["emuCanvas"].height="560";
	},
	// * UAM setup: Show UAM, set DOM, Listeners, get game list.
	setupUAM: function() {
		// Show UAM, set some variables.
		emu.funcs.UAM.enableUAM();

		// Scroll the bodyHeader into view.
		document.getElementById('bodyHeader').scrollIntoView(emu.funcs.nav.scrollIntoView_options);

		// Set up the UAM DOM.
		// emu.funcs.domHandleCache_populate_UAM();

		// Add the UAM event listeners.
		emu.funcs.UAM.addEventListeners();

		// Set the initial state of the auto-pause checkbox.
		emu.vars.dom.view["emuControls_autopause_chk"].classList.add("enabled");

		// Refresh the UAM games list data and auto-select the user's default game.
		emu.funcs.UAM.getGamesListUAM();

		// DB: Populate the status select menu with values.
		emu.funcs.db.gameDb_populateStatusSelectMenu();

		// Switch to the main emulator view.
		emu.funcs.nav.changeView("VIEW");

		// Put a default value for user JSON.
		// emu.vars.dom.view["emu_FilesFromJSON"].value = "https://dev3-nicksen782.c9users.io/non-web/Uzebox/RamTileTest_1/output/remoteload.json";
	},
	// * Queries the UAM database for games that match the user's user_id.
	getGamesListUAM    : function() {
		// Queries the database for the current user's games.

		// Get the current user's user id.
		let user_id = emu.vars.user_id;
		if (!user_id) {
			console.log("No user_id. Are you logged into UAM?");
			alert      ("No user_id. Are you logged into UAM?");
			return;
		}

		// Request the games list for the user.
		var formData = {
			"o": "gameman_manifest_user",
			"user_id": user_id,
			"_config": { "processor": "emu_p.php" }
		};
		emu.funcs.shared.serverRequest(formData).then(
			function(res) {
				// Get handles to the data.
				let gameList_UAM = res.data;
				let defaultGame = res.defaultGame;

				// Get handle on DOM select, reset length to 1, modify the first option with the game count..
				let uam_gamelist = emu.vars.dom.view["emu_gameSelect_UAM_select"];
				uam_gamelist.options.length = 1;
				uam_gamelist.options[0].text = gameList_UAM.length + " games";
				uam_gamelist.options[0].value = "";

				// Variables to use while populating the option data.
				let option = undefined;
				let frag = document.createDocumentFragment();

				// Populate the games list select menu.
				gameList_UAM.map(function(d, i, a) {
					option = document.createElement("option");
					option.setAttribute("gameid", d.gameId);
					option.setAttribute("gamename", d.gameName);
					option.setAttribute("author_user_id", d.author_user_id);
					option.setAttribute("UAMdir", d.UAMdir);
					option.setAttribute("gamedir", d.gamedir);
					option.setAttribute("remoteload", window.location.origin + "/" + d.gamedir + "/output/remoteload.json");
					option.value = d.gameId;
					option.text = d.gameName;
					frag.appendChild(option);
				});
				// Add the fragment to the select.
				uam_gamelist.appendChild(frag);

				// Auto select the default game.
				uam_gamelist.value = defaultGame;

				// Load the default games's JSON url.
				emu.vars.dom.view["emu_FilesFromJSON_UAM"].value = uam_gamelist.options[uam_gamelist.selectedIndex].getAttribute("remoteload");
			}, emu.funcs.shared.rejectedPromise
		);

	},
	// * Compiles the selected UAM game.
	compileGameUAM     : function() {
		// Get the current user's user id.
		let user_id = emu.vars.user_id;
		// Prevent this action if the user_id was not found.
		if (!user_id) {
			console.log("No user_id. Are you logged into UAM?");
			alert      ("No user_id. Are you logged into UAM?");
			return;
		}

		// Get some DOM handles.
		let emu_gameSelect_UAM_select = emu.vars.dom.view["emu_gameSelect_UAM_select"];
		let emu_latestCompile = emu.vars.dom.view["emu_latestCompile"];
		let emu_previousCompile = emu.vars.dom.view["emu_previousCompile"];
		let output1 = emu.vars.dom.debug1["output"];
		let output2 = emu.vars.dom.debug2["output"];

		// Get some values.
		let gameid = emu_gameSelect_UAM_select.value;
		let gamename = emu_gameSelect_UAM_select.options[emu_gameSelect_UAM_select.selectedIndex].text;
		let UAM_chk1 = emu.vars.dom.view["emu_compileOptions_UAM_chk1"].querySelector(".checkbox").classList.contains("enabled");
		let UAM_chk2 = emu.vars.dom.view["emu_compileOptions_UAM_chk2"].querySelector(".checkbox").classList.contains("enabled");
		let UAM_chk3 = emu.vars.dom.view["emu_compileOptions_UAM_chk3"].querySelector(".checkbox").classList.contains("enabled");
		let UAM_chk4 = emu.vars.dom.view["emu_compileOptions_UAM_chk4"].querySelector(".checkbox").classList.contains("enabled");

		var formData = {
			"o": "compile_UamGame",
			"gameId": gameid,
			"user_id": user_id,
			"_config": { "processor": "emu_p.php" }
		};
		emu.funcs.shared.serverRequest(formData).then(
			function(res) {
				// console.log(res);
				let compileCount = res.c2binCount;
				let c2binCount = res.compileCount;
				let error = res.error;
				let execResults = res.execResults;
				let info = res.info;
				let info2 = res.info2;
				let json = res.json;
				let link1 = res.link1;
				let link2 = res.link2;
				let link3 = res.link3;

				// Display cflow data links.
				// var emu_cflowpdfDiv = document.querySelector("#emu_cflowpdfDiv");
				// emu_cflowpdfDiv.innerHTML  = "<a href='//"+data.link1+"' target='_blank'>(Latest cflow.pdf)</a>, ";
				// emu_cflowpdfDiv.innerHTML += "<a href='//"+data.link2+"' target='_blank'>(Latest cflow.txt)</a>, ";
				// emu_cflowpdfDiv.innerHTML += "<a href='//"+data.link3+"' target='_blank'>(Latest lastbuild.txt)</a>";

				// Work with debug output 1
				var preStyle = "";
				var errorstring = " font-weight: bolder;background-color: black;color: red;border:2px solid ghostwhite;";
				var warningstring = " font-weight: bolder;background-color: black;color: yellow;border:2px solid ghostwhite;";
				// Check the response for errors and warnings. Replace each instance with some much more noticable HTML/CSS.
				var thestring2 = res.execResults
					.split("error:").join("<span class='emu_errors'   style='" + errorstring + "'> ERROR:   </span>")
					.split("warning:").join("<span class='emu_warnings' style='" + warningstring + "'> WARNING: </span>")
					.split("make: *** ").join("<br><br><span class='emu_failures' style='" + errorstring + "'> FAILURE! </span> make: *** ");
				// Get a count of errors and warnings.
				var count_failures = thestring2.split("<br><br><span class='emu_failures' style='" + errorstring + "'> FAILURE! </span> make: *** ").length - 1;
				var count_errors = thestring2.split("<span class='emu_errors'   style='" + errorstring + "'> ERROR:   </span>").length - 1;
				var count_warnings = thestring2.split("<span class='emu_warnings' style='" + warningstring + "'> WARNING: </span>").length - 1;
				output1.innerHTML = "<div style='color:greenyellow;'><pre style=\"" + preStyle + ">" + thestring2 + "</pre><br>";

				// Work with debug output 2
				var table_from_Obj = function(dat, caption) {
					// console.log(dat, caption);
					var table1 = "width:500px; border-collapse: collapse; margin: 0px; padding: 0px; empty-cells: show;";
					var table_css = "background-color:#888888; color:black; margin:auto;";
					var td1 = "border: 1px solid black !important; margin: 0px; padding: 4px; empty-cells: show;";
					var grey = "background-color:#dddddd;";

					var outputHTML = "";
					outputHTML += "<table style='" + table1 + table_css + "'>";
					outputHTML += "<caption style='padding: 5px; background-color: #7dafa4; font-weight: bold;'>" + caption + "</caption>";
					outputHTML +=
						"<tr>" +
						"	<th style='" + td1 + grey + "font-size: 18px;text-align:center;font-weight:bold;text-decoration:underline;'>Type</th>" +
						"	<th style='" + td1 + grey + "font-size: 18px;text-align:center;font-weight:bold;text-decoration:underline;'>Name</th>" +
						"	<th style='" + td1 + grey + "font-size: 18px;text-align:center;font-weight:bold;text-decoration:underline;'>Size</th>" +
						"	<th style='" + td1 + grey + "font-size: 18px;text-align:center;font-weight:bold;text-decoration:underline;'>Class</th>" +
						"	<th style='" + td1 + grey + "font-size: 18px;text-align:center;font-weight:bold;text-decoration:underline;'>Section</th>" +
						"	<th style='" + td1 + grey + "font-size: 18px;text-align:center;font-weight:bold;text-decoration:underline;'>File</th>" +
						"	<th style='" + td1 + grey + "font-size: 18px;text-align:center;font-weight:bold;text-decoration:underline;'>Line</th>" +
						"</tr>" +
						"";

					for (var i = 0; i < dat.length; i++) {
						outputHTML +=
							"<tr>" +
							"	<td style='" + td1 + "font-size: 16px;text-align:center;'> " + dat[i].type + " </td>" +
							"	<td style='" + td1 + "font-size: 16px;'> " + dat[i].name + " </td>" +
							"	<td style='" + td1 + "font-size: 16px;text-align:center;'> " + dat[i].size + " </td>" +
							"	<td style='" + td1 + "font-size: 16px;'> " + dat[i].class + " </td>" +
							"	<td style='" + td1 + "font-size: 16px;text-align:center;'> " + dat[i].section + " </td>" +
							"	<td style='" + td1 + "font-size: 16px;'> " + dat[i].file + " </td>" +
							"	<td style='" + td1 + "font-size: 16px;text-align:center;'> " + dat[i].line + " </td>" +
							"</tr>" +
							"";
					}
					outputHTML += "</table>";
					return outputHTML;
				};

				var bss_objects          = table_from_Obj(res.info2.bss_objects.data, res.info2.bss_objects['caption']);
				var text_funcs           = table_from_Obj(res.info2.text_funcs.data, res.info2.text_funcs['caption']);
				var text_objects         = table_from_Obj(res.info2.text_objects.data, res.info2.text_objects['caption']);
				var text_objects_progmem = table_from_Obj(res.info2.text_objects_progmem.data, res.info2.text_objects_progmem['caption']);
				var other                = table_from_Obj(res.info2.other.data, res.info2.other['caption']);

				output2.innerHTML = "<span id='emu_dataTop'></span>";
				// emu_console2.innerHTML += "<pre>"+data.cflow           + "</pre><br><br>";
				output2.innerHTML += bss_objects + "<br>";
				output2.innerHTML += text_funcs + "<br>";
				output2.innerHTML += text_objects + "<br>";
				output2.innerHTML += text_objects_progmem + "<br>";
				output2.innerHTML += other + "<br>";

				// Work with emu_previousCompile
				emu_previousCompile.innerHTML = emu_latestCompile.innerHTML;

				// Work with emu_latestCompile
				var consoleOutputString = thestring2.split("--STARTLASTBUILD.TXT--");
				consoleOutputString = consoleOutputString[1];
				consoleOutputString = consoleOutputString.substr(0, consoleOutputString.indexOf("---ENDLASTBUILD.TXT---"));
				consoleOutputString += "\n";
				consoleOutputString += "\n";
				consoleOutputString += "FAILURES :" + count_failures + "\n";
				consoleOutputString += "ERRORS   :" + count_errors + "\n";
				consoleOutputString += "WARNINGS :" + count_warnings + "\n";
				consoleOutputString += "\n";
				consoleOutputString += "\n";
				consoleOutputString += "COMPILE COUNT :" + compileCount + "\n";
				consoleOutputString += "C2BIN COUNT   :" + c2binCount + "\n";
				consoleOutputString = consoleOutputString
					.replace(/\r\n/g, "\n")                         // Normalize to Unix line endings.
					.replace(/\n\n/g, "\n")                         // Remove double line-breaks;
					.replace("AVR Memory Usage\n", "")              // Remove this line.
					.replace("----------------\n", "")              // Remove this line.
					.replace("Device: atmega644\n", "")             // Remove this line.
					.replace("(.text + .data + .bootloader)\n", "") // Remove this line.
					.replace("(.data + .bss + .noinit)\n\n", "")    // Remove this line.
					.replace(/  /g, " ")                            // Replace all double-spaces with one space.
					.replace(/\n/g, "\r\n")                         // Normalize to Windows line endings.
					.trim();
				emu_latestCompile.innerHTML = consoleOutputString;

				// Start after compile
				if (UAM_chk1) {
					emu.funcs.getGameFiles("4");
				}
				// Debug on failures
				if (UAM_chk2 && count_failures) {
					emu.funcs.nav.changeView("DEBUG1");
					output1.scrollTop = output1.querySelector(".emu_failures").offsetTop - 15;
				}
				// Debug on errors
				if (UAM_chk3 && count_errors) {
					emu.funcs.nav.changeView("DEBUG1");
					output1.scrollTop = output1.querySelector(".emu_errors").offsetTop - 15;
				}
				// Debug on warnings
				if (UAM_chk4 && count_warnings) {
					emu.funcs.nav.changeView("DEBUG1");
					output1.scrollTop = output1.querySelector(".emu_warnings").offsetTop - 15;
				}

			}, emu.funcs.shared.rejectedPromise
		);

	},

	// NOT COMPLETE Runs the C2BIN script for the selected UAM game.
	c2bin_UamGame      : function() {
		console.log("emu_c2bin_UAM");
	},
	// NOT COMPLETE Runs the C2BIN2 script for the selected UAM game.
	c2bin_UamGame_2    : function() {
		console.log("emu_c2bin2_UAM");
	},

};
emu.funcs.nav    = {
	// * Options for Element.scrollIntoView.
	scrollIntoView_options: {
		behavior: "smooth", // "auto", "instant", or "smooth".         Defaults to "auto".
		block: "start"
		// , block   : "center"  // "start", "center", "end", or "nearest". Defaults to "center".
		// , inline  : "nearest" // "start", "center", "end", or "nearest". Defaults to "nearest".
	},
	// * Resizes the html container.
	resizeHtmlContainer   : function(size){
		// console.log("resizeHtmlContainer:", size);

		if(size=="wide"){
			document.querySelector("html").classList.add("wide");
			document.querySelector("#emu_emulator").classList.add("largerEmuWindow");
		}
		if(size=="narrow"){
			document.querySelector("html").classList.remove("wide");
			document.querySelector("#emu_emulator").classList.remove("largerEmuWindow");
		}
	},
	// * Changes the main application views.
	changeView            : function(newview) {
		var allSectionDivs = document.querySelectorAll(".sectionDivs");
		var bodyHeader = document.querySelector("#bodyHeader");

		var emu_view   = emu.vars.dom.views["view_VIEW"  ] ;
		var emu_debug1 = emu.vars.dom.views["view_DEBUG1"] ;
		var emu_debug2 = emu.vars.dom.views["view_DEBUG2"] ;
		var emu_db     = emu.vars.dom.views["view_DB"    ] ;

		var emu_view_nav   = document.querySelectorAll('.navOptions[newview="VIEW"]');
		var emu_debug1_nav = document.querySelectorAll('.navOptions[newview="DEBUG1"]');
		var emu_debug2_nav = document.querySelectorAll('.navOptions[newview="DEBUG2"]');
		var emu_db_nav     = document.querySelectorAll('.navOptions[newview="DB"]');

		bodyHeader.scrollIntoView(emu.funcs.nav.scrollIntoView_options);

		var hideSections = function() {
			allSectionDivs.forEach(function(d, i, a) {
				d.classList.remove("active");
				d.classList.add("hidden");
			});
		}
		var hideNavs = function() {
			emu_view_nav  .forEach(function(d,i,a){ d.classList.remove("active"); });
			emu_debug1_nav.forEach(function(d,i,a){ d.classList.remove("active"); });
			emu_debug2_nav.forEach(function(d,i,a){ d.classList.remove("active"); });
			emu_db_nav    .forEach(function(d,i,a){ d.classList.remove("active"); });
		}

		switch (newview) {
			case "VIEW":{
				hideSections();
				hideNavs();
				emu_view.classList.add   ("active");
				emu_view.classList.remove("hidden");
				emu_view_nav.forEach(function(d,i,a){ d.classList.add   ("active"); });

				// Resize the html container.
				if( emu.vars.UAMDATA.permKeys.indexOf("emu_canCompile") !=-1 ){ emu.funcs.nav.resizeHtmlContainer("wide"); }
				else{ emu.funcs.nav.resizeHtmlContainer("narrow"); }

				break;
			}
			case "DEBUG1":{
				hideSections();
				hideNavs();
				emu_debug1.classList.add   ("active");
				emu_debug1.classList.remove("hidden");
				emu_debug1_nav.forEach(function(d,i,a){ d.classList.add   ("active"); });

				// Resize the html container.
				if( emu.vars.UAMDATA.permKeys.indexOf("emu_canCompile") !=-1 ){ emu.funcs.nav.resizeHtmlContainer("wide"); }
				else{ emu.funcs.nav.resizeHtmlContainer("narrow"); }

				break;
			}
			case "DEBUG2":{
				hideSections();
				hideNavs();
				emu_debug2.classList.add   ("active");
				emu_debug2.classList.remove("hidden");
				emu_debug2_nav.forEach(function(d,i,a){ d.classList.add   ("active"); });

				// Resize the html container.
				if( emu.vars.UAMDATA.permKeys.indexOf("emu_canCompile") !=-1 ){ emu.funcs.nav.resizeHtmlContainer("wide"); }
				else{ emu.funcs.nav.resizeHtmlContainer("narrow"); }

				break;
			}
			case "DB":{
				hideSections();
				hideNavs();
				emu_db.classList.add   ("active");
				emu_db.classList.remove("hidden");
				emu_db_nav.forEach(function(d,i,a){ d.classList.add   ("active"); });

				// Resize the html container.
				emu.funcs.nav.resizeHtmlContainer("narrow");

				break;
			}
			default:{
				console.log("Invalid choice for newview");
				break;
			}
		};
	},
	// * Changes the misc nav views.
	changeMiscView        : function(newview, navButton) {
		// Remove the active class on all nav buttons and views.
		emu.vars.dom.view["emu_misc_navs"].forEach(function(d, i, a) {
			d.classList.remove("active");
		});
		emu.vars.dom.view["emu_misc_view"].forEach(function(d, i, a) {
			d.classList.remove("active");
		});

		// Set the clicked nav button to active.
		navButton.classList.add("active");

		// Show the view associated with the nav button.
		document.querySelector("#" + newview).classList.add("active");

	},
};

window.onload = function() {
	window.onload = null;

	console.log("****************************************");
	console.log("*** -- Online Uzebox Emulator v2b -- ***");
	console.log("****************************************");

	var continueApp = function() {
		// Do the application init.
		var formData = {
			"o": "emu_init",
			"_config": { "processor": "emu_p.php" }
		};
		emu.funcs.shared.serverRequest(formData).then(function(res){
			// Set the UAM status.
			emu.vars.originUAM  = res.UAMFOUND;
			emu.vars.UAM_active = (res.UAMFOUND && res.UAMDATA.hasActiveLogin);

			// Add the returned data into the local cache.
			emu.vars.UAMDATA   = res.UAMDATA;

			// Populate the DOM handle caches.
			emu.funcs.domHandleCache_populate();

			// ** HANDLE UAM INTEGRATION **
			// If no UAM was found then show nothing for UAM (Dialog A).
			if(!res.UAMFOUND){
				document.querySelector("#UAM_status_A").classList.add("show");
				emu.funcs.UAM.disableUAM();
			}
			// If UAM and there is an active login then show dialog B.
			else if(res.UAMDATA.hasActiveLogin==1){
				// Populate the UAM DOM handle caches.
				emu.funcs.domHandleCache_populate_UAM();

				// Put the user's name in the status.
				document.querySelector("#UAM_status_username").innerHTML = res.UAMDATA.username;

				emu.funcs.UAM.setupUAM();

				// Show the dialog.
				document.querySelector("#UAM_status_B").classList.add("show");

			}
			// If UAM and there is not an active login then show dialog C.
			else if(res.UAMDATA.hasActiveLogin==0){
				// Populate the UAM DOM handle caches.
				emu.funcs.domHandleCache_populate_UAM();

				document.querySelector("#UAM_status_C").classList.add("show");
			}

			// ** HANDLE WASM/ASMJS **
			// Add the emulation core before continuing.
			new Promise(function(resolve,reject){
				let qs=getQueryStringAsObj();
				let core="";
				let browserHasWebAssembly = (typeof WebAssembly == "object" && typeof WebAssembly.instantiate == "function");

				if      (qs["core"]=="WASM") { core="WASM";  }
				else if (qs["core"]=="ASMJS"){ core="ASMJS";  }

				// Was core specified on the query string?
				if(core){
					// Was core "WASM" and is Web Assembly available?
					if(core=="WASM" && (browserHasWebAssembly) ){ core="WASM"; }
					// Was core "ASMJS" or is Web Assembly NOT available?
					else if(core=="ASMJS"){ core="ASMJS"; }
				}

				// No? Can we use Web Assembly?
				else if( (browserHasWebAssembly) ){ core="WASM"; }
				// No? Then use ASM.js
				else{ core="ASMJS"; }

				emu.vars.core = core;
				var newJs=document.createElement("script");
				newJs.onload = function(){ resolve(); };

				// Load the Web Assemby version?
				if(core=="WASM"){
					// console.log("Using Web Assembly");
					document.querySelector("#coresetting #coresetting_text").innerHTML="Using Web ASM";
					document.querySelector("#coresetting #coresetting_toggle").classList.remove("hidden");
					newJs.src = "CUzeBox_emu_core/emu_core_WASM.js";
				}
				// Load the ASMJS version instead.
				else{
					// console.log("Using asm.js");
					document.querySelector("#coresetting #coresetting_text").innerHTML="Using ASM.JS";
					document.querySelector("#coresetting #coresetting_toggle").classList.remove("hidden");
					newJs.src = "CUzeBox_emu_core/emu_core_ASMJS.js";
				}

				// Append the new script element.
				document.body.appendChild(newJs);

			}).then( function(){
				// Add the event listeners.
				emu.funcs.addAllListeners();

				// Put a default value for user JSON.
				if(window.location.host=="dev3-nicksen782.c9users.io"){
					emu.vars.dom.view["emu_FilesFromJSON"].value = "https://dev3-nicksen782.c9users.io/non-web/Uzebox/RamTileTest_1/output/remoteload.json";
				}

				// Get the build-in games list.
				emu.funcs.emu_getBuiltInGamelist().then(
					function(){
						emu.funcs.shared.clearTheCanvas(emu.vars.dom.view["emuCanvas"]);
						emu.funcs.shared.textOnCanvas({ "canvas": emu.vars.dom.view["emuCanvas"], "text": " - GAME NOT LOADED - " });

						// Adjust the canvas output.
						document.querySelectorAll('canvas').forEach(function(d, i) {
							emu.funcs.shared.setpixelated(d);
						});

						// Switch to the default view.
						emu.funcs.nav.changeView("VIEW");

						if(!emu.vars.UAM_active){
							// Look for settings provided via query string.
							let qs=getQueryStringAsObj();

							if     (qs["gameid"]){
								// Select this game in the menu
								emu.vars.innerEmu.startEmuAfterUserInput = true;
								emu.vars.dom.view["builtInGames_select"].value=qs["gameid"];
								emu.funcs.getGameFiles(1);
							}
							else if(qs["url"]){
								emu.vars.innerEmu.startEmuAfterUserInput = true;
								emu.vars.dom.view["emu_FilesFromJSON"].value = qs["url"];
								emu.funcs.getGameFiles(3);
							}

						}
						else{
							// emu.funcs.nav.changeView("DB");
						}
					}
				);

				// Turn on the gamepad polling.
				emu.vars.dom.view["gamepadIcon_poll"].click();

				// Ensure the emu canvas has a good size fit.
				emu.vars.innerEmu.resizeEmuCanvas();
			});

		}, emu.funcs.shared.rejectedPromise);

	};

	// Feature Loader config:
	featureDetection.config.usePhp         = true;
	featureDetection.config.useAsync       = true;
	featureDetection.config.includeText    = false; // Using false makes the database download smaller.
	featureDetection.config.includeWebsite = false; // Using false makes the database download smaller.

	// Load these libraries also:
	featureDetection.config.userReqs = [
		// "X2JS"    ,
		"getQueryStringAsObj"    ,
		"crossBrowser_initKeyboardEvent",
	];

	// Load these files also:
	// featureDetection.config.userFiles = [
	// 	"js/gamepad.js",
	// ];

	// Feature detect/replace.
	featureDetection.funcs.init(continueApp);

};
