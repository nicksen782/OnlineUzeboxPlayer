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

var emu             = {};
emu.vars            = {
	// * UAM vars.
	originUAM      : false     ,
	uamwindow      : undefined ,
	UAMisReady     : undefined ,
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

	// * Object that contains the flags/functions for the Emscripten instance.
	innerEmu : {
		// * Indicates if the Emscripten instance has finished loading.
		emulatorIsReady         : false,
		// * Indicates that the Emscripten instance should not load until some user input (mousemove on the emu canvas.)
		startEmuAfterUserInput  : false,
		// * Allows the Emscripten instance to start.
		startAfterMouseMove : function(){
			emu.vars.dom.view["emuCanvas"].removeEventListener("mousemove", emu.vars.innerEmu.startAfterMouseMove, false);
			emu.vars.innerEmu.startEmuAfterUserInput=false;
			emu.funcs.loadGame();
		} ,
		// * Used as a template to create a new Emscripten module.
		createDefaultModule     : function(){
			// Tells Emscripten what DOM element that it should be listening to for keyboard input.
			this["keyboardListeningElement"] = (function() { return emu.vars.dom.view["emuCanvas"] })();

			// this["noExitRuntime"] = 0;

			// Specifies which file the emulator should start.
			this["arguments"] = [ "" ];

			// The Emscripten output canvas.
			this["canvas"]    = (function() { return emu.vars.dom.view["emuCanvas"] })() ;

			// Do this before initialization.
			this["preInit"]   = [
				function(){ }
			];

			// Load the files from the files list.
			this["preRun"]    = [ function(){

				var GameFiles        = emu.vars.gameFiles;
				var FilesDownloading = emu.vars.gameFilesDownloading;

				// Filter any unpopulated records.

				// Load the CUzeBox eeprom.bin from localStorage to a file in Emscripten?
				let eeprombin = localStorage.getItem("EMU_eeprom.bin");
				if(eeprombin!=null){
					eeprombin = eeprombin.split(",");
					eeprombin = emu.funcs.shared.arrayToArrayBuffer(eeprombin);
					let eeprombin_view = new Uint8Array( eeprombin );
					let deleteIncludedEEPROMBIN = false;
					let IncludedEEPROMBIN_index = undefined;
					emu.vars.gameFiles.forEach(function(d,i,a){
						if(d.name=="eeprom.bin") {
							deleteIncludedEEPROMBIN=true;
							IncludedEEPROMBIN_index=i;
						}
					});

					console.log("Loaded eeprom.bin from localStorage.");

					// Was an eeprom.bin file part of the gamefiles? We can't have duplicates. Delete the old file.
					if(deleteIncludedEEPROMBIN==true || IncludedEEPROMBIN_index !=undefined){
						delete emu.vars.gameFiles[IncludedEEPROMBIN_index];
					}

					emu.vars.gameFiles.push({
						"name"    :"eeprom.bin",
						"data"    :eeprombin_view,
						"filesize":eeprombin_view.length,
					});

					emu.vars.gameFiles = emu.vars.gameFiles.filter(Boolean);

				}

				if(   FilesDownloading ) { throw new Error('GAME IS STILL LOADING     : FilesDownloading : ' + FilesDownloading); }
				if( ! GameFiles.length ) { throw new Error('NO FILES HAVE BEEN LOADED : GameFiles. Length: ' + GameFiles.length); }

				GameFiles.map(function(d,i,a){
					try     { emu.vars.innerEmu.Module["FS"].createPreloadedFile('/', d.name , d.data , true, true); }
					catch(e){
						console.log("Error loading file!", d.name, e);
						alert      ("Error loading file!", d.name, e);
					}
				});


			}];

			// Do this after initialization but before main() is called.
			this["postRun"]   = [
				// Set the emu ready flag.
				function(){
					emu.vars.innerEmu.emuIsReady();
				},

				// Focus on the emu canvas.
				function(){
					setTimeout(function(){
						// setInterval(function(){ document.querySelectorAll(".hover"); }, 250);
						// setInterval(function(){ console.log( "HOVERED", document.querySelectorAll(".hovered").length, document.querySelectorAll(".hover") ); }, 1000);

						// Don't pause if the auto-pause checkbox is checked.
						if (
							emu.vars.dom.view["emuControls_autopause_chk"].classList.contains("enabled") &&
							(
								emu.vars.dom.view["emu_misc_gamepads"]   .classList.contains("hovered") ||
								emu.vars.dom.view["emu_emulator_window"] .classList.contains("hovered")
							)
						) {
							emu.funcs.emu_focusing(null, "mouseenter");
						}
						else{
							emu.funcs.emu_focusing(null, "mouseleave");
						}
					}, 2000);
				}

				// Enable or disable the CUzeBox debug mode.
				,function(){
					// If this is NOT a UAM instance then auto-click the debug button which should turn off the debug bars.
					if(emu.vars.originUAM){
						setTimeout(function(){
							emu.vars.dom.view["emuControls_DEBUG"].dispatchEvent( new CustomEvent("mousedown") );
							emu.vars.dom.view["emuControls_DEBUG"].dispatchEvent( new CustomEvent("mouseup") );
						}, 50);
					}
				}
			];
			this["printErr"]  = function(text) {
				if (arguments.length > 1) { text = Array.prototype.slice.call(arguments).join(' '); }
				console.error(text);
			};
		},
		// * Used by resizeEmuCanvas to determine the new width/height/aspect ratio when resizing the emu canvas.
		calculateAspectRatioFit : function(srcWidth, srcHeight, maxWidth, maxHeight) {
			// https://stackoverflow.com/a/14731922
			var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
			return {
				width : Math.floor(srcWidth  * ratio) ,
				height: Math.floor(srcHeight * ratio) ,
				ratio : ratio
			};
		},
		// * Resizes the emu canvas to fit in its container.
		resizeEmuCanvas         : function(){
			var canvas        = emu.vars.dom.view["emuCanvas"];
			var Container     = document.querySelector("#emscripten_emu_container");
			var ContainerDims = Container.getBoundingClientRect();
			var newDims       = emu.vars.innerEmu.calculateAspectRatioFit(canvas.width, canvas.height, ContainerDims.width, ContainerDims.height);

			canvas.style.width  = newDims.width  +"px";
			canvas.style.height = newDims.height +"px";
		},
		// * Runs after the Emscripten instance is fully loaded. Sets flags, resizes the emu canvas.
		emuIsReady              : function(){
			emu.vars.innerEmu.emulatorIsReady = true;
			emu.vars.gameAllowedToLoad        = true;
			emu.vars.innerEmu.resizeEmuCanvas();
		},
		Module                  : { },
	}
};
emu.gamepads        = {
	// unmappedGamepads   : 0,

	// CONFIG GAME PAD BUTTON MAPPING FUNCTIONS/VARIABLES.
	mapping_newGamepads     : [],    // Holds the temporarly gamepad maps while in the gamepad config.
	prev_pollState          : false, // Flag for the the previous main gamepad poll state.
	prev_emuAutoPauseSetting: false, // Flag for the previous emulator auto-pause setting.
	gamepadMapPolling       : false, // Flag to indicate the basic gamepad polling is active.
	autoSet_buttonsToAssign : [],    // Holds the remaining buttons for autoset.
	lastAssignedButton      : "",    // Holds the last user assigned button. This prevents the next button from automatically being assigned the previous button.
	// * Starts the map all for a gamepad.
	mapAllButtons        : function(e){
		let onlyDeactivate=false;

		if(this.classList.contains("active")){ onlyDeactivate=true; }

		// Deactivate all setAll buttons.
		document.querySelectorAll(".gp_setAll").forEach(function(d,i,a){
			d.classList.remove("active");
		});

		// Clear any old buttonsToAssign.
		emu.gamepads.autoSet_buttonsToAssign=[];

		// Deactivate any set buttons that are active.
		emu.gamepads.deActivateSetButtons();

		if(onlyDeactivate==true){
			return;
		}

		// Activate THIS setAll button.
		this.classList.add("active");

		// Determine which group of set buttons we are working with.
		let tables = this.closest(".sectionWindow").querySelectorAll(".gamepadMappingTable");
		let setButtons=[];
		if(this.id=="gp1_setAll"){
			setButtons=tables[0].querySelectorAll(".gp_cfg_set");
		}
		else if(this.id=="gp2_setAll"){
			setButtons=tables[0].querySelectorAll(".gp_cfg_set");
		}

		// Set the queue for the autoset buttons. Create array (not object.)
		setButtons.forEach(function(d,i,a){
			emu.gamepads.autoSet_buttonsToAssign.push(d);
		} );
		if(emu.gamepads.autoSet_buttonsToAssign.length){
			emu.gamepads.autoSet_buttonsToAssign[0].classList.add("activeBtnMap");
		}

		// Set the first set button in the queue to be active.

		// setButtons.forEach(function(d,i,a){
		// 	emu.gamepads.map1Button.call( d );
		// });
	},
	// * Creates new map-config gamepad object.
	newTemplateMapEntry  : function(obj){
		emu.gamepads.mapping_newGamepads.push(
			{
				[obj.map_key] : {
					"name":obj.name+"**"+obj.vendor+"**"+obj.product,
					"btnMap":{
						"BTN_B"      : { "type":"", "index":"" , "true":"", "sign":"" },
						"BTN_Y"      : { "type":"", "index":"" , "true":"", "sign":"" },
						"BTN_START"  : { "type":"", "index":"" , "true":"", "sign":"" },
						"BTN_SELECT" : { "type":"", "index":"" , "true":"", "sign":"" },
						"BTN_UP"     : { "type":"", "index":"" , "true":"", "sign":"" },
						"BTN_DOWN"   : { "type":"", "index":"" , "true":"", "sign":"" },
						"BTN_LEFT"   : { "type":"", "index":"" , "true":"", "sign":"" },
						"BTN_RIGHT"  : { "type":"", "index":"" , "true":"", "sign":"" },
						"BTN_A"      : { "type":"", "index":"" , "true":"", "sign":"" },
						"BTN_X"      : { "type":"", "index":"" , "true":"", "sign":"" },
						"BTN_SL"     : { "type":"", "index":"" , "true":"", "sign":"" },
						"BTN_SR"     : { "type":"", "index":"" , "true":"", "sign":"" },
					}
				}
			}
		);
	},
	// * Update an in-RAM gamepad mapping at the gamepad config screen.
	modifyTempMapEntry   : function(gpIndex, btnKey, typeKey, index, trueVal, sign){
		// Get the object key for this gamepad.
		var key = Object.keys(emu.gamepads.mapping_newGamepads[gpIndex])[0];
		// Get a handle to the specific button record in the object.
		let thisEntry = emu.gamepads.mapping_newGamepads[gpIndex][key]["btnMap"]["BTN_"+btnKey];
		// Set the values.
		thisEntry["type"]  = typeKey;
		thisEntry["index"] = index;
		thisEntry["true"]  = trueVal;
		thisEntry["sign"]  = sign;
	},
	// * Main poll loop. Sets/activates gamepads, starts map template, polls for button press.
	mapping_gp_poll_loop : function(){
		// Generate the controller name ("status") if not already done.
		let src_gamepads = emu.gamepads.getSrcGamepads();
		if(!emu.vars.dom.gamepad["gp1_status"].innerHTML.length && src_gamepads.length>0){
			// console.log("assigning gamepad name (1)");
			let obj = emu.gamepads.generateGamepadName(src_gamepads[0]);
			emu.vars.dom.gamepad["gp1_status"].innerHTML = obj.name + "**"+ obj.vendor+"**"+obj.product;
			document.querySelector("#emu_gamepadConfig_P1.disconnected").classList.remove("disconnected");
			emu.gamepads.newTemplateMapEntry(obj);
		}
		if(!emu.vars.dom.gamepad["gp2_status"].innerHTML.length && src_gamepads.length>1){
			// console.log("assigning gamepad name (2)");
			let obj = emu.gamepads.generateGamepadName(src_gamepads[1]);
			emu.vars.dom.gamepad["gp2_status"].innerHTML = obj.name + "**"+ obj.vendor+"**"+obj.product;
			document.querySelector("#emu_gamepadConfig_P2.disconnected").classList.remove("disconnected");
			emu.gamepads.newTemplateMapEntry(obj);
		}

		let buttonWasSet=false;
		for(let i=0; i<emu.vars.dom.gamepad["gp_cfg_setBtns"].length; i+=1){

			let thisSetButton = emu.vars.dom.gamepad["gp_cfg_setBtns"][i];
			if(thisSetButton.classList.contains("activeBtnMap")){
				buttonWasSet = emu.gamepads.map1Button.call( thisSetButton );

				// Did the user press a button?
				if(buttonWasSet){
					// Deactivate all the set buttons.
					emu.gamepads.deActivateSetButtons();

					// Is autoset on?
					if(emu.gamepads.autoSet_buttonsToAssign.length){
						// Remove the first index. We just did that button.
						emu.gamepads.autoSet_buttonsToAssign.shift();
					}

					// Are there any autosets left?
					if(emu.gamepads.autoSet_buttonsToAssign.length){
						// Set the next set button as activeBtnMap.
						emu.gamepads.autoSet_buttonsToAssign[0].classList.add("activeBtnMap");
					}
					// No? We are all done with this gamepad then.
					else{
						// Deactivate all setAll buttons.
						document.querySelectorAll(".gp_setAll").forEach(function(d,i,a){
							d.classList.remove("active");
						});
					}
					break;
				}
			}
		}

		// Start another iteration of the gamepad polling loop.
		if(emu.gamepads.gamepadMapPolling==true){
			setTimeout(emu.gamepads.mapping_gp_poll_loop, 100);
		}
	},
	// * Unsets all the set buttons, sets the button that was clicked.
	activateSetButton    : function(){
		// Store the previous state.
		let wasAlreadySet = this.classList.contains("activeBtnMap");

		// Deactivate all the set buttons.
		emu.gamepads.deActivateSetButtons();

		// Only set this set button if it was not already set (acts like a toggle.)
		if(!wasAlreadySet){
			this.classList.add("activeBtnMap");
		}
	},
	// * Sets all the set buttons to non-active.
	deActivateSetButtons : function(){
		// Deactivate all the set buttons.
		emu.vars.dom.gamepad["gp_cfg_setBtns"].forEach(function(d,i,a){
			d.classList.remove("activeBtnMap");
		});
	},
	// * Looks for a gamepad button press. Sets the value in RAM, displays the value on the config screen.
	map1Button           : function(e){
		// Get the button name relative to this clicked "set" button.
		let key  = this.closest('td').getAttribute("name");
		// console.log(key);
		// Get the destination element where the result string will be stored.
		let dest = this.closest('td').nextElementSibling.querySelector("span[name='map']");

		// alert("Hold '"+key+"' on the gamepad while clicking 'OK'");

		// Poll the gamepads.
		let src_gamepads = emu.gamepads.getSrcGamepads();

		// console.log(src_gamepads);

		// Go through the src_gamepad array buttons and axis.
		var userHasSelectedAButton=false;
		var newHTML;
		for(let i=0; i<src_gamepads.length; i+=1){
			if(userHasSelectedAButton){
				return userHasSelectedAButton;
			}

			let buttons = src_gamepads[i].buttons.map(function(d,i,a){ return d.value; });
			let axes    = src_gamepads[i].axes.map(function(d,i,a){ return d; });

			// Get counts of buttons pressed.
			let axesNegCnt    = axes.filter(function(d,i,a){ if(d==-1) { return true; } }).length
			let axesPosCnt    = axes.filter(function(d,i,a){ if(d== 1) { return true; } }).length
			let buttonsNegCnt = buttons.filter(function(d,i,a){ if(d==-1) { return true; } }).length
			let buttonsPosCnt = buttons.filter(function(d,i,a){ if(d== 1) { return true; } }).length
			let inputCount    = (axesNegCnt+axesPosCnt+buttonsNegCnt+buttonsPosCnt) ;

			if(inputCount>1){
				// alert("Please only press one button at a time.");
				return userHasSelectedAButton;
			}
			else if(inputCount==0){
				// console.log("No buttons pressed.");
				return userHasSelectedAButton;
			}

			// Look through the axes/buttons for a non-zero value.
			if     (axesNegCnt    || axesPosCnt)   {
				let negIndex = axes.indexOf(-1);
				let posIndex = axes.indexOf( 1);

				if     (axes.indexOf(-1) !=-1){
					newHTML="a:"+negIndex+":-1";
					userHasSelectedAButton=true;
					emu.gamepads.modifyTempMapEntry(i, key, "axes", negIndex, -1, "-");
				}
				else if(axes.indexOf( 1) !=-1){
					newHTML="a:"+posIndex+":1";
					userHasSelectedAButton=true;
					emu.gamepads.modifyTempMapEntry(i, key, "axes", posIndex, 1, "+");
				}
				else{
					// console.log("Didn't actually press a axis??");
				}
			}
			else if(buttonsNegCnt || buttonsPosCnt){
				let negIndex = buttons.indexOf(-1);
				let posIndex = buttons.indexOf( 1);

				if     (buttons.indexOf(-1) !=-1){
					newHTML="b:"+negIndex+":-1";
					userHasSelectedAButton=true;
					emu.gamepads.modifyTempMapEntry(i, key, "buttons", negIndex, -1, "-");
				}
				else if(buttons.indexOf( 1) !=-1){
					newHTML="b:"+posIndex+":1";
					userHasSelectedAButton=true;
					emu.gamepads.modifyTempMapEntry(i, key, "buttons", posIndex, 1, "+");
				}
				else{
					// console.log("Didn't actually press a button??");
				}

			}

		}
		if(newHTML && emu.gamepads.lastAssignedButton != newHTML){
			dest.innerHTML = newHTML;
			emu.gamepads.lastAssignedButton = newHTML;
			return true;
		}
		else{
			return false;
		}


	},
	// * Turns off the main polling, opens the config window, handles emulator pause state.
	openGamepadConfig    : function(){
		// Reset the values in this section.
		emu.gamepads.mapping_newGamepads     = []
		emu.gamepads.prev_pollState          = false
		emu.gamepads.prev_emuAutoPauseSetting= false
		emu.gamepads.gamepadMapPolling       = false
		emu.gamepads.autoSet_buttonsToAssign = []
		emu.gamepads.lastAssignedButton      = ""

		// Stop the current gamepad polling if it is running.
		if(emu.gamepads.enabled){
			emu.gamepads.prev_pollState=emu.gamepads.enabled;
			emu.gamepads.enabled=true;
			emu.gamepads.init();
		}

		// Pause the emulator.
		if(emu.vars.dom.view["emuControls_autopause_chk"].classList.contains("enabled")){
			emu.gamepads.prev_emuAutoPauseSetting=true;
		}
		emu.vars.dom.view["emuControls_autopause_chk"].classList.add("enabled");
		emu.funcs.emu_focusing(null, "mouseleave");

		// Turn on very basic polling.
		emu.gamepads.gamepadMapPolling=true;
		setTimeout(emu.gamepads.mapping_gp_poll_loop, 100);

		// Open the gamepad config modal.
		emu.vars.dom.gamepad["gamepadConfigDiv"].classList.add('showModal');

	},
	// * Turns off the basic polling, closes the config window, handles emulator pause state.
	closeGamepadConfig   : function(){
		// Clear the flag for the gamepad map polling.
		emu.gamepads.gamepadMapPolling=false;

		// Wait a short bit to make sure any remaining polls complete.
		setTimeout(function(){
			// Close the gamepad config modal.
			emu.vars.dom.gamepad["gamepadConfigDiv"].classList.remove('showModal');

			// Restore the previous gamepad polling if it was enabled before.
			if(emu.gamepads.prev_pollState){
				emu.gamepads.enabled=false;
				emu.gamepads.init();
			}

			// Unpause the emulator.
			if(emu.gamepads.prev_emuAutoPauseSetting==true){
				emu.vars.dom.view["emuControls_autopause_chk"].classList.add("enabled");
				emu.funcs.emu_focusing(null, "mouseleave");
			}
			else{
				emu.vars.dom.view["emuControls_autopause_chk"].classList.remove("enabled");
				emu.funcs.emu_focusing(null, "mouseenter");
			}

		}, 250);


	},
	// * Updates the local gamepad mapping object for the displayed active gamepads.
	saveChanges : function(){
		// Go through all the new gamepad JSON.
		for(let i=0; i<emu.gamepads.mapping_newGamepads.length; i+=1){
			// Get the key.
			var key = Object.keys(emu.gamepads.mapping_newGamepads[i])[0];
			// Set that key (overwrite if it already exists) with the new data.
			emu.gamepads.gp_config_mappings[key] = emu.gamepads.mapping_newGamepads[i][key];
		}

		// Update LocalStorage with the full gp_config_mappings object.
		localStorage.setItem("EMU_gp_config_mappings", JSON.stringify(emu.gamepads.gp_config_mappings));

		// Tell the user the operation is done. Offer to close the config window.
		let conf = confirm("Changes saved (in RAM and LocalStorage) and ready for immediate use!\n\nPress 'OK' to close the config window.\n\nPress 'Cancel' to just close this message.");

		// If the user clicked 'OK' then close the config window.
		if(conf){
			emu.gamepads.closeGamepadConfig();
		}
	},
	// * Reads from the gp_config_mappings in RAM and provides a JSON download of the data.
	download    : function(){
		var EMU_gp_config_mappingsuser = JSON.parse(localStorage.getItem("EMU_gp_config_mappings"));
		if(EMU_gp_config_mappingsuser){
			// Load FileSaver if needed.
			featureDetection.funcs.applyFeatures_fromList([ "FileSaver" ]).then(
				function(res){
					// Convert to blob.
					var blob = new Blob( [JSON.stringify(EMU_gp_config_mappingsuser,null,0)] , {type: "text/plain;charset=utf-8"});
					// Present the download.
					saveAs(blob, "EMU_gp_config_mappings.json");
				}
				,emu.funcs.shared.rejectedPromise
			);

		}
	},
	// * Reads from a user-supplied gp_config_mappings file then integrates it and updates localStorage.
	upload      : function(){
		// Create a temporary input button.
		let input  = document.createElement("input");
		input.type = "file";
		input.id   = "tempGamepadFileUpload";
		// Create an onchange listener for when the user selects a file.
		input.onchange=function(){
			input.onchange=null;
			let prom = new Promise(function(resolve, reject) {
				// Set up the new FileReader.
				var reader = new FileReader();
				// Create the onload listener to handle the results.
				reader.onload = (function(e) {
					reader.onload=null;
					// Return the file data.
					resolve(e.target.result);
				});
				// Read the file.
				reader.readAsText(input.files[0]);

			});
			// Handle the results from the FileReader.
			prom.then(function(res){
				input=null;
				// Parse the JSON.
				let newJSON = JSON.parse(res);
				console.log(newJSON);

				let keys = Object.keys(newJSON);
				// Go through all the new gamepad JSON.
				for(let i=0; i<keys.length; i+=1){
					// Get the key.
					var key = keys[i];
					// Set that key (overwrite if it already exists) with the new data.
					emu.gamepads.gp_config_mappings[key] = newJSON[key];
				}

				// Update LocalStorage with the full gp_config_mappings object.
				localStorage.setItem("EMU_gp_config_mappings", JSON.stringify(emu.gamepads.gp_config_mappings));

				// Tell the user the operation is done. Offer to close the config window.
				let conf = confirm("Changes saved (in RAM and LocalStorage) and ready for immediate use!\n\nPress 'OK' to close the config window.\n\nPress 'Cancel' to just close this message.");

				// If the user clicked 'OK' then close the config window.
				if(conf){
					emu.gamepads.closeGamepadConfig();
				}

			}
			,emu.funcs.shared.rejectedPromise
			);
		};

		// Click it.
		input.click();

		// User selects file from their computer.
		// Read the file.
		// Integrate the file into the current game mappings.
	},

	// MAIN GAMEPAD FUNCTIONS/VARIABLES.
	enabled                : false,     // Saves the status of the main gamepad polling. Used in init to determine to init or de-init.
	gp_setTimeout_id       : undefined, // Stores the id returned by setTimeout.
	gp_raf_id              : undefined, // Stores the id returned by requestAnimationFrame.
	gp_poll_freq           : 16,        // Frequency of gamepad polling.
	gamepads               : [],        // Stores the found gamepads and some additional state data.
	// * Used in translation of Uzebox buttons to their bit position and the key the browser needs to send to get that button pressed in CUzeBox.
	uzeBox_gamepad_mapping : {
		"BTN_B"      : { "key":"key_A"     , "bitPos":0  },
		"BTN_Y"      : { "key":"key_Q"     , "bitPos":1  },
		"BTN_SELECT" : { "key":"key_SPACE" , "bitPos":2  },
		"BTN_START"  : { "key":"key_ENTER" , "bitPos":3  },
		"BTN_UP"     : { "key":"key_UP"    , "bitPos":4  },
		"BTN_DOWN"   : { "key":"key_DOWN"  , "bitPos":5  },
		"BTN_LEFT"   : { "key":"key_LEFT"  , "bitPos":6  },
		"BTN_RIGHT"  : { "key":"key_RIGHT" , "bitPos":7  },
		"BTN_A"      : { "key":"key_S"     , "bitPos":8  },
		"BTN_X"      : { "key":"key_W"     , "bitPos":9  },
		"BTN_SL"     : { "key":"key_RSHIFT", "bitPos":10 },
		"BTN_SR"     : { "key":"key_LSHIFT", "bitPos":11 },
	},
	// * Gamepad button mappings to Uzebox buttons. Specific to the gamepad.
	gp_config_mappings     : {
		// "2820:0009" : {
		// 	"name":"8Bitdo SNES30 GamePad**2820**0009",
		// 	"btnMap":{
		// 		"BTN_B"      : { "type":"buttons" , "index":1 , "true":1 , "sign":"+" },
		// 		"BTN_Y"      : { "type":"buttons" , "index":4 , "true":1 , "sign":"+" },
		// 		"BTN_START"  : { "type":"buttons" , "index":11, "true":1 , "sign":"+" },
		// 		"BTN_SELECT" : { "type":"buttons" , "index":10, "true":1 , "sign":"+" },
		// 		"BTN_UP"     : { "type":"axes"    , "index":1 , "true":-1, "sign":"-" },
		// 		"BTN_DOWN"   : { "type":"axes"    , "index":1 , "true":1 , "sign":"+" },
		// 		"BTN_LEFT"   : { "type":"axes"    , "index":0 , "true":-1, "sign":"-" },
		// 		"BTN_RIGHT"  : { "type":"axes"    , "index":0 , "true":1 , "sign":"+" },
		// 		"BTN_A"      : { "type":"buttons" , "index":0 , "true":1 , "sign":"+" },
		// 		"BTN_X"      : { "type":"buttons" , "index":3 , "true":1 , "sign":"+" },
		// 		"BTN_SL"     : { "type":"buttons" , "index":6 , "true":1 , "sign":"+" },
		// 		"BTN_SR"     : { "type":"buttons" , "index":7 , "true":1 , "sign":"+" },
		// 	}
		// },
		"05ac:111d" : {
			"name":"Gamepad**05ac**111d",
			"btnMap":{
				"BTN_B"      : { "type":"buttons" , "index":0 , "true":1 , "sign":"+" },
				"BTN_Y"      : { "type":"buttons" , "index":3 , "true":1 , "sign":"+" },
				"BTN_START"  : { "type":"buttons" , "index":11, "true":1 , "sign":"+" },
				"BTN_SELECT" : { "type":"buttons" , "index":10, "true":1 , "sign":"+" },
				"BTN_UP"     : { "type":"axes"    , "index":7 , "true":-1, "sign":"-" },
				"BTN_DOWN"   : { "type":"axes"    , "index":7 , "true":1 , "sign":"+" },
				"BTN_LEFT"   : { "type":"axes"    , "index":6 , "true":-1, "sign":"-" },
				"BTN_RIGHT"  : { "type":"axes"    , "index":6 , "true":1 , "sign":"+" },
				"BTN_A"      : { "type":"buttons" , "index":1 , "true":1 , "sign":"+" },
				"BTN_X"      : { "type":"buttons" , "index":4 , "true":1 , "sign":"+" },
				"BTN_SL"     : { "type":"buttons" , "index":6 , "true":1 , "sign":"+" },
				"BTN_SR"     : { "type":"buttons" , "index":7 , "true":1 , "sign":"+" },
			}
		},
		"1234:bead" : {
			"name":"vJoy - Virtual Joystick**1234**bead)",
			"btnMap":{
				"BTN_B"      : { "type":"buttons" , "index":0  , "true":1 , "sign":"+" },
				"BTN_Y"      : { "type":"buttons" , "index":1  , "true":1 , "sign":"+" },
				"BTN_START"  : { "type":"buttons" , "index":2  , "true":1 , "sign":"+" },
				"BTN_SELECT" : { "type":"buttons" , "index":3  , "true":1 , "sign":"+" },
				"BTN_UP"     : { "type":"buttons" , "index":4  , "true":1 , "sign":"+" },
				"BTN_DOWN"   : { "type":"buttons" , "index":5  , "true":1 , "sign":"+" },
				"BTN_LEFT"   : { "type":"buttons" , "index":6  , "true":1 , "sign":"+" },
				"BTN_RIGHT"  : { "type":"buttons" , "index":7  , "true":1 , "sign":"+" },
				"BTN_A"      : { "type":"buttons" , "index":8  , "true":1 , "sign":"+" },
				"BTN_X"      : { "type":"buttons" , "index":9  , "true":1 , "sign":"+" },
				"BTN_SL"     : { "type":"buttons" , "index":10 , "true":1 , "sign":"+" },
				"BTN_SR"     : { "type":"buttons" , "index":11 , "true":1 , "sign":"+" },
			}
		}
	},
	// * Gets a raw copy of navigator.gamepads() and strips out any null or blank values.
	getSrcGamepads      : function(){
		// Get the gamepad info. There are many different ways. Use the first one that returns data.
		let raw_gamepads = navigator.getGamepads ? navigator.getGamepads() : ( navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [] ) ;

		// Create blank array for the src_gamepads.
		let src_gamepads=[];

		// Copy the raw_gamepads into src_gamepads.
		for(let i=0; i<raw_gamepads.length; i+=1){
			// Is this actually a gamepad object? If not then don't add it.
			if("undefined"==typeof raw_gamepads[i] || raw_gamepads[i]==null){ continue; }

			// Add the gamepad. Use the same index value as indicated by the gamepad data.
			if(raw_gamepads[i]) { src_gamepads[ raw_gamepads[i].index ] = raw_gamepads[i] ; }
		}
		return src_gamepads;
	},
	// * Returns an object with the unique identifiers for a specified gamepad instance.
	generateGamepadName : function(thisPad){
		// Get the vendor and product id.
		let ff_id = thisPad.id.split("-").map(function(d,i,a){ return d.trim();} );
		let cr_id = thisPad.id.split(":").map(function(d,i,a){ return d.trim();} );
		let vendor  = "";
		let product = "";
		let name    = "";
		let map_key = "";
		let newMapping=undefined;

		// Is this a Firefox id string?
		if(ff_id.length==3){
			vendor  = ff_id[0].trim();
			product = ff_id[1].trim();
			name    = ff_id[2].trim();
		}
		// Is this a Chrome id string?
		else if(cr_id.length==3){
			// Need to clean up the string first.
			name    = cr_id[0].split("(")[0].trim();
			vendor  = cr_id[1].split(" Product")[0].trim();
			product = cr_id[2].split(")")[0].trim();
		}

		// Put together what the mapping key would be for this controller.
		map_key = vendor+":"+product;

		return {
			"name"   :name   ,
			"vendor" :vendor ,
			"product":product,
			"map_key":map_key,
		};

	},
	// * Handles updating the local gamepad cache, determining pressed buttons, sending keyboard events.
	handleInputs        : function(){
		// * Send the specified key from the specified player gamepad.
		function sendNewKey(i, btnPressed, btnReleased){
			let p2=function(i, dir){
				// Only act on player 2.
				if(i==1){
					if     (dir=="dn"){ emu.funcs.emu_sendKeyEvent("keydown", "key_RALT" , i+1); }
					else if(dir=="up"){ emu.funcs.emu_sendKeyEvent("keyup"  , "key_RALT" , i+1); }
				}
			}

			// Named constants.
			const BTN_SR     = 2048 // = ( 1<<11 ) ;
			const BTN_SL     = 1024 // = ( 1<<10 ) ;
			const BTN_X      = 512  // = ( 1<<9  ) ;
			const BTN_A      = 256  // = ( 1<<8  ) ;
			const BTN_RIGHT  = 128  // = ( 1<<7  ) ;
			const BTN_LEFT   = 64   // = ( 1<<6  ) ;
			const BTN_DOWN   = 32   // = ( 1<<5  ) ;
			const BTN_UP     = 16   // = ( 1<<4  ) ;
			const BTN_START  = 8    // = ( 1<<3  ) ;
			const BTN_SELECT = 4    // = ( 1<<2  ) ;
			const BTN_Y      = 2    // = ( 1<<1  ) ;
			const BTN_B      = 1    // = ( 1<<0  ) ;

			// If the button was pressed or held then send a keydown event.
			// If the button was released then send a keyup event.
			// If this the second iteration of this loop then send the key modifier to indicate player 2.

			if     ( btnPressed  & BTN_B     ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keydown", "key_A"      , i+1);   p2(i,"up"); }
			else if( btnReleased & BTN_B     ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keyup"  , "key_A"      , i+1);   p2(i,"up"); }

			if     ( btnPressed  & BTN_A     ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keydown", "key_S"      , i+1);   p2(i,"up"); }
			else if( btnReleased & BTN_A     ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keyup"  , "key_S"      , i+1);   p2(i,"up"); }

			if     ( btnPressed  & BTN_Y     ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keydown", "key_Q"      , i+1);   p2(i,"up"); }
			else if( btnReleased & BTN_Y     ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keyup"  , "key_Q"      , i+1);   p2(i,"up"); }

			if     ( btnPressed  & BTN_X     ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keydown", "key_W"      , i+1);   p2(i,"up"); }
			else if( btnReleased & BTN_X     ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keyup"  , "key_W"      , i+1);   p2(i,"up"); }

			if     ( btnPressed  & BTN_SL    ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keydown", "key_LSHIFT" , i+1);   p2(i,"up"); }
			else if( btnReleased & BTN_SL    ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keyup"  , "key_LSHIFT" , i+1);   p2(i,"up"); }

			if     ( btnPressed  & BTN_SR    ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keydown", "key_RSHIFT" , i+1);   p2(i,"up"); }
			else if( btnReleased & BTN_SR    ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keyup"  , "key_RSHIFT" , i+1);   p2(i,"up"); }

			if     ( btnPressed  & BTN_SELECT) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keydown", "key_SPACE"  , i+1);   p2(i,"up"); }
			else if( btnReleased & BTN_SELECT) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keyup"  , "key_SPACE"  , i+1);   p2(i,"up"); }

			if     ( btnPressed  & BTN_START ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keydown", "key_ENTER"  , i+1);   p2(i,"up"); }
			else if( btnReleased & BTN_START ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keyup"  , "key_ENTER"  , i+1);   p2(i,"up"); }

			if     ( btnPressed  & BTN_RIGHT ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keydown", "key_RIGHT"  , i+1);   p2(i,"up"); }
			else if( btnReleased & BTN_RIGHT ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keyup"  , "key_RIGHT"  , i+1);   p2(i,"up"); }

			if     ( btnPressed  & BTN_LEFT  ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keydown", "key_LEFT"   , i+1);   p2(i,"up"); }
			else if( btnReleased & BTN_LEFT  ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keyup"  , "key_LEFT"   , i+1);   p2(i,"up"); }

			if     ( btnPressed  & BTN_DOWN  ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keydown", "key_DOWN"   , i+1);   p2(i,"up"); }
			else if( btnReleased & BTN_DOWN  ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keyup"  , "key_DOWN"   , i+1);   p2(i,"up"); }

			if     ( btnPressed  & BTN_UP    ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keydown", "key_UP"     , i+1);   p2(i,"up"); }
			else if( btnReleased & BTN_UP    ) { p2(i,"dn");   emu.funcs.emu_sendKeyEvent("keyup"  , "key_UP"     , i+1);   p2(i,"up"); }
		}
		// * Update the local cache of gamepad objects.
		function getNewGamepadStates(){
			function update_gamepadObj(src_gamepads){
				// Create the data for new gamepads or update the gamepad key on the known gamepads.
				for(let i=0; i<src_gamepads.length; i+=1){
					let thisPad = src_gamepads[i];

					// Is this an unconfigured gamepad?
					if(
						!emu.gamepads.gamepads[thisPad.index] && // No data entry at this index.
						thisPad.id                                // And the src has data.
					){

						let newMapping=undefined;
						let map_key = emu.gamepads.generateGamepadName(thisPad).map_key;

						// Find the gamepad mapping:
						if( emu.gamepads.gp_config_mappings.hasOwnProperty(map_key) !=-1){
							// Assign the map.
							newMapping=emu.gamepads.gp_config_mappings[map_key];
						}

						// We don't already have a mapping for this gamepad. Did the user load a mapping?
						if(newMapping==undefined){
							// Cannot use this gamepad. A map must be created for it first.
							// emu.gamepads.unmappedGamepads
							// alert("test");
						}
						else{
							console.log("Gamepad found! Index:", thisPad.index, ", id:", thisPad.id, "map_key:", map_key);
							// Add the new gamepad.
							emu.gamepads.gamepads[ thisPad.index ] = {
								"gamepad"       : thisPad   ,
								"btnMap"        : newMapping,
								"btnPrev"       : 0         ,
								"lastTimestamp" : 0         ,
							};
						}
					}
					// Just update the gamepad data key but make sure that the cached data already exists.
					else if( emu.gamepads.gamepads[thisPad.id]){
						// console.log("Updating existing gamepad!", emu.gamepads.gamepads[i].btnPrev);
						emu.gamepads.gamepads[ thisPad.index ].gamepad = src_gamepads[i];
					}
					else{
						// Gamepad data is not cached and/or the src has no data.
						//
					}
				}
			}
			update_gamepadObj( emu.gamepads.getSrcGamepads() );
		}
		// * Reads gamepad instance. Uses the specified gamepad mapping and returns an Uzebox-compatible value for the gamepad button state.
		function findGpButtonsViaMapping (gp_obj){
			// gp_obj provides the custom values as well as the gamepad state.
			let map     = gp_obj.btnMap.btnMap;
			let axes    = gp_obj.gamepad.axes;
			let buttons = gp_obj.gamepad.buttons.map(function(d,i,a){ return d.value });

			// Return these after populating them.
			let uzeBin      = 0;
			let uzeKeys     = [];
			let browserKeys = [];

			// Look through the axes/buttons mappings.
			let map_keys = Object.keys(map);

			for(let i=0; i<map_keys.length; i+=1){
				let d=map_keys[i];
				let btn_value  = buttons[map[d].index];
				let axes_value = axes[map[d].index];

				if     (map[d].type=="buttons"){
					// Is the button at the specified button array index true?
					// ??? Look for what the "index" is.
					if(btn_value==1){
						// Get the key for that button.
						let key = map_keys[i];
						// Use the key to get the associated Uzebox gamepad key and the Uzebox bitPos.
						let uzeBtn = emu.gamepads.uzeBox_gamepad_mapping[key];
						let kb_key = uzeBtn.key;
						let bitPos = uzeBtn.bitPos;

						uzeBin |= (1<<bitPos);
						uzeKeys.push(key);
						browserKeys.push(kb_key);
					}
				}
				else if (map[d].type=="axes"){
					// Is the button at the specified button array index true?
					// ??? Look for what the "index" is.

					if(axes_value!=0){
						// Does the sign of the value match the designated sign for this button?
						let value_sign = Math.sign(axes_value) == -1 ? "-" : "+";
						let req_sign   = map[d].sign;

						if(value_sign == req_sign){
							// Get the key for that button.
							let key = map_keys[i];
							// Use the key to get the associated Uzebox gamepad key and the Uzebox bitPos.
							let uzeBtn = emu.gamepads.uzeBox_gamepad_mapping[key];
							let kb_key = uzeBtn.key;
							let bitPos = uzeBtn.bitPos;

							uzeBin |= (1<<bitPos);
							uzeKeys.push(key);
							browserKeys.push(kb_key);
						}

					}

				}
			}

			return {
				"uzeBin"     :uzeBin     ,
				"uzeKeys"    :uzeKeys    ,
				"browserKeys":browserKeys,
			};

		}

		// Read the source gamepad data, add to local cache if defined and not null and found button mapping.
		getNewGamepadStates();

		// var newHTML1="";
		// var newHTML2="";
		// var padsUsed=[];

		// Go through the gamepad list.
		for(let i=0; i<emu.gamepads.gamepads.length; i+=1){
			// Only two gamepads are allowed for now.
			if(i>1){ break; }

			// Get a handle to this gamepad.
			let padIndex = emu.gamepads.gamepads[i].gamepad.index;
			let thisPad   = emu.gamepads.gamepads[ padIndex ] ;

			// First, is the timestamp the same? If so, there has been no new input. Skip!
			if( thisPad.gamepad.timestamp == thisPad.lastTimestamp ){ continue; }

			// Decipher the input into Uzebox binary.
			let input = findGpButtonsViaMapping( thisPad );

			// Determine what buttons have changed.
			// Compare old data to new data.

			// The buttons held at the last poll.
			let btnPrev     = thisPad.btnPrev;//emu.gamepads.gamepads[i].btnHeld;
			// The buttons held at THIS poll.
			let btnHeld     = input.uzeBin;
			// The new buttons pressed at THIS poll.
			let btnPressed  = btnHeld & (btnHeld ^ btnPrev);
			// The buttons released at THIS poll.
			let btnReleased = btnPrev & (btnHeld ^ btnPrev);

			// Save the last timestamp.
			thisPad.lastTimestamp=thisPad.gamepad.timestamp;

			// Save the prevBtn state for the next poll.
			thisPad.btnPrev=btnHeld;

			// Indicate that this pad had activity.
			// padsUsed[i]=true;

			// Send the keys that the user pressed on the the gamepad.
			sendNewKey(i, btnPressed, btnReleased);

			// Add to the debug info.
			// let tempHTML = "";
			// tempHTML+='<table class="table1">';
			// tempHTML+='	<tr> <td>Map name:   </td> <td style="font-size:75%;"> ' + thisPad.btnMap.name +' </td> </tr>';
			// tempHTML+='	<tr> <td>btnPrev     </td> <td> ' + btnPrev     .toString(2).padStart(16, "0") +' </td> </tr>';
			// tempHTML+='	<tr> <td>btnHeld     </td> <td> ' + btnHeld     .toString(2).padStart(16, "0") +' </td> </tr>';
			// tempHTML+='	<tr> <td>btnPressed  </td> <td> ' + btnPressed  .toString(2).padStart(16, "0") +' </td> </tr>';
			// tempHTML+='	<tr> <td>btnReleased </td> <td> ' + btnReleased .toString(2).padStart(16, "0") +' </td> </tr>';
			// tempHTML+='	<tr> <td>pressed     </td> <td> ' + input.uzeKeys.join("<br>")                 +' </td> </tr>';
			// tempHTML+='</table>';
			// tempHTML+='<br>';

			// if     (i==0){ newHTML1+=tempHTML; }
			// else if(i==1){ newHTML2+=tempHTML; }
		}

		// Output some debug info:
		// document.querySelector("#gamepadConfig #gamepads_count").innerHTML = emu.gamepads.gamepads.length;
		// if(padsUsed[0]){ document.querySelector("#gamepadConfig #gamepad1_status").innerHTML = newHTML1; }
		// if(padsUsed[1]){ document.querySelector("#gamepadConfig #gamepad2_status").innerHTML = newHTML2; }

		// Request another animation frame.
		emu.gamepads.gp_setTimeout_id = setTimeout(function(){
			emu.gamepads.gp_raf_id = window.requestAnimationFrame(emu.gamepads.handleInputs);
		}, emu.gamepads.gp_poll_freq);

	},
	// * For activating or de-activating the gamepad polling.
	init                : function(){
		// Determine if this call should be an init or a de-init.
		let initialize=undefined;
		if(emu.gamepads.enabled==true){ initialize=false; }
		else                           { initialize=true; }

		// INIT:
		if     (initialize==true){
			// Check if localStorage has mapping values. If so then integrate them into the in-RAM mapping values.
			var EMU_gp_config_mappingsuser = JSON.parse(localStorage.getItem("EMU_gp_config_mappings"));
			if(EMU_gp_config_mappingsuser){
				let keys = Object.keys(EMU_gp_config_mappingsuser);
				// Go through all the new gamepad JSON.
				for(let i=0; i<keys.length; i+=1){
					// Get the key.
					var key = keys[i];
					// Set that key (overwrite if it already exists) with the new data.
					emu.gamepads.gp_config_mappings[key] = EMU_gp_config_mappingsuser[key];
				}
			}

			// Set first polling iteration.
			emu.gamepads.gp_setTimeout_id = setTimeout(function(){
				// Do the first requestAnimationFrame.
				emu.gamepads.gp_raf_id = window.requestAnimationFrame(emu.gamepads.handleInputs);

				// Set the flag to indicate that the gamepads ARE enabled.
				emu.gamepads.enabled=true;
			}, emu.gamepads.gp_poll_freq);

			// Indicate the new gamepad polling state.
			document.querySelector("#gamepadIcon_container1").classList.add("pollingActive");
			// console.log("GAMEPAD POLLING ENABLED");

		}
		// DE-INIT:
		else if(initialize==false){
			// Cancel the last polling iteration: setTimeout..
			window.clearTimeout( emu.gamepads.gp_setTimeout_id );

			// Cancel the last polling iteration: requestAnimationFrame.
			window.cancelAnimationFrame( emu.gamepads.gp_raf_id );

			// Set the flag to indicate that the gamepads are NOT enabled.
			emu.gamepads.enabled=false;

			// Indicate the new gamepad polling state.
			document.querySelector("#gamepadIcon_container1").classList.remove("pollingActive");
			// console.log("GAMEPAD POLLING DISABLED");
		}
	},
};
emu.funcs           = {
	addAllListeners: function() {
		let EL_gamepads = function(){
			// GAMEPAD CONFIG: Data Manager
			emu.vars.dom.gamepad["saveChanges"].addEventListener("click", emu.gamepads.saveChanges, false);
			emu.vars.dom.gamepad["download"   ].addEventListener("click", emu.gamepads.download, false);
			emu.vars.dom.gamepad["upload"     ].addEventListener("click", emu.gamepads.upload, false);

			// GAMEPAD CONFIG: Open and close buttons for the gamepad config modal.
			emu.vars.dom.gamepad["openBtn" ].addEventListener("click", emu.gamepads.openGamepadConfig, false);
			emu.vars.dom.gamepad["closeBtn"].addEventListener("click", emu.gamepads.closeGamepadConfig, false);

			// GAMEPAD CONFIG: Individual "set" buttons.
			var gpCfgBtns = emu.vars.dom.gamepad["gp_cfg_setBtns"];
			gpCfgBtns.forEach(function(d, i, a) {
				d.addEventListener("click", emu.gamepads.activateSetButton, false);
			});

			// GAMEPAD CONFIG: "setAll" buttons.
			emu.vars.dom.gamepad["gp1_setAll"].addEventListener("click", emu.gamepads.mapAllButtons, false);
			emu.vars.dom.gamepad["gp2_setAll"].addEventListener("click", emu.gamepads.mapAllButtons, false);
		};
		let EL_view = function(){
			window.onbeforeunload = function() {
				// On any sort of navigation make sure the eeprom.bin file in localStorage is updated.

				// Is the emulator active?
				if(emu.vars.innerEmu.emulatorIsReady==true){
					// Save the CUzeBox eeprom.bin file to localStorage.
					if( Object.keys(emu.vars.innerEmu.Module.FS.root.contents).indexOf("eeprom.bin") != -1 ){
						localStorage.setItem("EMU_eeprom.bin", emu.vars.innerEmu.Module.FS.readFile("eeprom.bin") );
						console.log("Saved eeprom.bin to localStorage.");
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
				emu.vars.innerEmu.resizeEmuCanvas();
				emu.funcs.emu_focusing(null, "mouseenter");
			}, false);
			emu.vars.dom.view["emuControls_FULLSCREEN"].addEventListener("click"   , emu.funcs.emuFullscreen, false);
			emu.vars.dom.view["emuCanvas"]             .addEventListener("dblclick", emu.funcs.emuFullscreen, false);

			// VIEW: File loading.
			emu.vars.dom.view["emu_FilesFromJSON"]            .addEventListener("click", function() { this.select(); }, false);
			emu.vars.dom.view["emu_FilesFromJSON_load"]       .addEventListener("click", function() { emu.funcs.getGameFiles("3"); }, false);
			emu.vars.dom.view["builtInGames_select"]          .addEventListener("change", function() { emu.funcs.getGameFiles("1") }, false);
			emu.vars.dom.view["emu_FilesFromUser"]            .addEventListener("change", emu.funcs.emu_processUserUploads, false);
			emu.vars.dom.view["emu_FilesFromUser_viewableBtn"].addEventListener("click", emu.funcs.emu_clickUserUpload, false);

			// VIEW: Canvas key events.
			emu.vars.dom.view["emuCanvas"].addEventListener("keydown", function(e){
				// Ask CUzeBox what keys are currently pressed. Then display them on the on-screen gamepads.
				if(emu.vars.innerEmu.emulatorIsReady){
					emu.funcs.showPressedKey();
				}
				// Handles auto-resizing of the emulator canvas when certain functions resize the canvas.
				switch(e.code){
					case 'F2'  : { setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 50); break; }
					case 'F3'  : { setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 50); break; }
					case 'F4'  : { setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 50); break; }
					case 'F12' : { setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 50); break; }
					default    : { break; }
				}
			});
			emu.vars.dom.view["emuCanvas"].addEventListener("keyup", function(e){
				// Ask CUzeBox what keys are currently pressed. Then display them on the on-screen gamepads.
				if(emu.vars.innerEmu.emulatorIsReady){
					emu.funcs.showPressedKey();
				}
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
			emu.vars.dom.view["emuControls_QUALITY"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_F2" , null); displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_QUALITY"].addEventListener("mouseup"  , function() { emu.funcs.emu_sendKeyEvent("keyup"  , "key_F2" , null); displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_DEBUG"]  .addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_F3" , null); displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_DEBUG"]  .addEventListener("mouseup"  , function() { emu.funcs.emu_sendKeyEvent("keyup"  , "key_F3" , null); displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_FLICKER"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_F7" , null); displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_FLICKER"].addEventListener("mouseup"  , function() { emu.funcs.emu_sendKeyEvent("keyup"  , "key_F7" , null); displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_PAUSE"]  .addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_F9" , null); displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_PAUSE"]  .addEventListener("mouseup"  , function() { emu.funcs.emu_sendKeyEvent("keyup"  , "key_F9" , null); displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_STEP"]   .addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_F10", null); displayCUzeBox_flags(); }, false);
			emu.vars.dom.view["emuControls_STEP"]   .addEventListener("mouseup"  , function() { emu.funcs.emu_sendKeyEvent("keyup"  , "key_F10", null); displayCUzeBox_flags(); }, false);

			// VIEW: Event listeners for the onscreen gamepad buttons.
			document.querySelectorAll("g.hover_group").forEach(function(d,i,a){
				// Get the pad and the name of the button.
				let pad=d.getAttribute("pad");
				let key=d.getAttribute("name");

				// Send the appropriate key. (Player 1)
				if(pad == "1"){
					d.addEventListener("mousedown" , function() { emu.funcs.emu_sendKeyEvent("keydown", key , 1); }, false);
					d.addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup"  , key , 1); }, false);
					d.addEventListener("mouseup"   , function() { emu.funcs.emu_sendKeyEvent("keyup"  , key , 1); }, false);
				}
				// Send the appropriate keys. (Player 2)
				else if(d.getAttribute("pad") == "2"){
					d.addEventListener("mousedown" , function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RALT" , 2); emu.funcs.emu_sendKeyEvent("keydown", key        , 2); }, false);
					d.addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup"  , key        , 2); emu.funcs.emu_sendKeyEvent("keyup"  , "key_RALT" , 2); }, false);
					d.addEventListener("mouseup"   , function() { emu.funcs.emu_sendKeyEvent("keyup"  , key        , 2); emu.funcs.emu_sendKeyEvent("keyup"  , "key_RALT" , 2); }, false);
				}
			});
		};

		EL_gamepads();
		EL_view();
	},

	emu_rotate: function() {
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
	// * Queries the database for a list of built-in games. Puts the results in a game select menu.

	// * Stops the Emscripten instance.
	stopEmu: function(showStoppedText) {
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
						console.log("Saved eeprom.bin to localStorage.");
					}

					// Abort the Emscripten module.
					emu.vars.innerEmu.Module.abort();

				} catch(e){
					// The abort always throws an exception so it always catches. This is expected.
					// console.log("A failure occurred at stopEmu:", e);
				}

				// // Stop the current gamepad polling if it is running.
				// if(emu.gamepads.enabled==true){
				// 	console.log("Gamepads were enabled. Disabling them now.");
				// 	emu.gamepads.prev_pollState=emu.gamepads.enabled;
				// 	emu.gamepads.enabled=true;
				// 	emu.gamepads.init();
				// }

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
	emu_reset: function() {
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
	emu_unload: function() {
		// Stop the emulator if it is active.
		emu.funcs.stopEmu(true);

		// Clear last image from the canvas.
		emu.funcs.shared.clearTheCanvas(emu.vars.dom.view["emuCanvas"]);

		// Indicate that there is not a game loaded.
		emu.funcs.shared.resetCanvasDimensions();
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
	// * Retrieve the built-in game list from the server.
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

			if(emu.vars.originUAM){
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
	loadGameFromList: function(game) {
		emu.vars.gameFile = game;
		emu.funcs.loadGame();
	},
	// * Downloads the specified file out of the game files list.
	downloadFile : function(filename){
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
	downloadZip : function(){
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
	getGameFiles: function(methodType) {
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
	loadGame : function(){
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
			emu.funcs.shared.textOnCanvas({ "canvas": emu.vars.dom.view["emuCanvas"], "text": "- MOUSE HERE TO START -" });
			emu.vars.dom.view["emuCanvas"].addEventListener("mousemove", emu.vars.innerEmu.startAfterMouseMove, false);
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
	emu_focusing: function(e, typeOverride) {
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

			displayCUzeBox_flags();
		}
		else{
			// console.log(
			// 	"emu_focusing: The emulator is not ready!" ,
			// 	"\n emu.vars.innerEmu.Module         :", emu.vars.innerEmu.Module          ,
			// 	"\n emu.vars.innerEmu.emulatorIsReady:", emu.vars.innerEmu.emulatorIsReady ,
			// 	'\n emu.vars.dom.view["emuControls_autopause_chk"].classList.contains("enabled") :', emu.vars.dom.view["emuControls_autopause_chk"].classList.contains("enabled")
			// );
		}

	},
	// * Loads gamefiles from the user.
	emu_processUserUploads: function(e) {
		emu.funcs.getGameFiles(2);
	},
	// * Just clicks the invisible upload button.
	emu_clickUserUpload: function(e) {
		emu.vars.dom.view["emu_FilesFromUser"].click();
	},
	// * Sends keyboard events to the Emscripten emulator.
	emu_sendKeyEvent: function(type, key, gamePadNumber) {
		// console.log("emu_sendKeyEvent:", type, key, gamePadNumber);
		// Get DOM handle to the emu canvas.
		var target = emu.vars.dom.view.emuCanvas;

		// Is there an element there?
		if (null == target) {
			// console.log("DOM element not found!");
			return;
		}

		// Create temp variables.
		var newEvent     = undefined;
		var newEvent_ALT = undefined;
		let altKey       = undefined;
		let location     = undefined;

		// Determine which key was specifed and create an event for it.
		switch (key) {
			// case "key_AltGr"  : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"altKey":false, "charCode":0,"code":"AltRight","key":"Alt","keyCode":18,"which":18,"location":2})         ; break; }
			case "key_RALT": { newEvent = window.crossBrowser_initKeyboardEvent(type, { "altKey": true, "charCode": 0, "code": "AltRight", "key": "Alt", "keyCode": 18, "which": 18, "location": 2 }); break; }
			case "key_F1"  : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F1", "key": "F1", "keyCode": 112, "which": 112, "location": 0 }); break; }
			case "key_F2"  : {
				newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F2", "key": "F2", "keyCode": 113, "which": 113, "location": 0 });
				setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 75);
				break;
			}
			case "key_F3"  : {
				newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F3", "key": "F3", "keyCode": 114, "which": 114, "location": 0 });
				setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 200);
				break;
			}
			case "key_F4":    {
				newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F4", "key": "F4", "keyCode": 115, "which": 115, "location": 0 });
				setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 100);
				break;
			}
			case "key_F5":    { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F5", "key": "F5", "keyCode": 116, "which": 116, "location": 0 }); break; }
			case "key_F6":    { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F6", "key": "F6", "keyCode": 117, "which": 117, "location": 0 }); break; }
			case "key_F7":    { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F7", "key": "F7", "keyCode": 118, "which": 118, "location": 0 }); break; }
			case "key_F8":    { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F8", "key": "F8", "keyCode": 119, "which": 119, "location": 0 }); break; }
			case "key_F9":    { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F9", "key": "F9", "keyCode": 120, "which": 120, "location": 0 }); break; }
			case "key_F10":   { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F10", "key": "F10", "keyCode": 121, "which": 121, "location": 0 }); break; }
			case "key_F11":   { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F11", "key": "F11", "keyCode": 122, "which": 122, "location": 0 }); break; }
			case "key_F12":   { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F12", "key": "F12", "keyCode": 123, "which": 123, "location": 0 }); break; }

			case "key_Q":     { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "KeyQ"      , "key": "q"         , "keyCode": 81, "which": 81, "location": 0 }); break; }
			case "key_W":     { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "KeyW"      , "key": "w"         , "keyCode": 87, "which": 87, "location": 0 }); break; }
			case "key_A":     { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "KeyA"      , "key": "a"         , "keyCode": 65, "which": 65, "location": 0 }); break; }
			case "key_S":     { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "KeyS"      , "key": "s"         , "keyCode": 83, "which": 83, "location": 0 }); break; }
			case "key_ENTER": { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "Enter"     , "key": "Enter"     , "keyCode": 13, "which": 13, "location": 0 }); break; }
			case "key_SPACE": { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "Space"     , "key": " "         , "keyCode": 32, "which": 32, "location": 0 }); break; }
			case "key_UP":    { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ArrowUp"   , "key": "ArrowUp"   , "keyCode": 38, "which": 38, "location": 0 }); break; }
			case "key_DOWN":  { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ArrowDown" , "key": "ArrowDown" , "keyCode": 40, "which": 40, "location": 0 }); break; }
			case "key_LEFT":  { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ArrowLeft" , "key": "ArrowLeft" , "keyCode": 37, "which": 37, "location": 0 }); break; }
			case "key_RIGHT": { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ArrowRight", "key": "ArrowRight", "keyCode": 39, "which": 39, "location": 0 }); break; }
			case "key_LSHIFT":{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ShiftLeft" , "key": "Shift"     , "keyCode": 16, "which": 16, "location": 1 }); break; }
			case "key_RSHIFT":{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ShiftRight", "key": "Shift"     , "keyCode": 16, "which": 16, "location": 2 }); break; }
			default:
				{ break; }
		}

		// Dispatch the key event.
		if (newEvent) {
			target.dispatchEvent(newEvent);
		}

	},
	//
	showPressedKey : function(){
		// A bit of delay is required otherwise the displayed gamepad states will not update properly.

		if( emu.vars.innerEmu.emulatorIsReady == false ) {
			// console.log("1 showPressedKey: The emu is not ready.");
			return;
		}

		setTimeout(function(){
			if( emu.vars.innerEmu.emulatorIsReady == false ) {
				// console.log("2 showPressedKey: The emu is not ready.");
				return;
			}

			let p1_state   = ~ emu.vars.innerEmu.Module._NRA_returnController(0) ;
			let p2_state   = ~ emu.vars.innerEmu.Module._NRA_returnController(1) ;

			let p1_key_UP     = document.querySelector("#emuGamepad_1_key_UP");
			let p1_key_DOWN   = document.querySelector("#emuGamepad_1_key_DOWN");
			let p1_key_LEFT   = document.querySelector("#emuGamepad_1_key_LEFT");
			let p1_key_RIGHT  = document.querySelector("#emuGamepad_1_key_RIGHT");
			let p1_key_SPACE  = document.querySelector("#emuGamepad_1_key_SPACE");
			let p1_key_ENTER  = document.querySelector("#emuGamepad_1_key_ENTER");
			let p1_key_LSHIFT = document.querySelector("#emuGamepad_1_key_LSHIFT");
			let p1_key_RSHIFT = document.querySelector("#emuGamepad_1_key_RSHIFT");
			let p1_key_Q      = document.querySelector("#emuGamepad_1_key_Q");
			let p1_key_W      = document.querySelector("#emuGamepad_1_key_W");
			let p1_key_A      = document.querySelector("#emuGamepad_1_key_A");
			let p1_key_S      = document.querySelector("#emuGamepad_1_key_S");

			if( (p1_state) & (1<<0)  ? 1 : 0 ){p1_key_A     .classList.add("active");} else{p1_key_A     .classList.remove("active");} // CU_CTR_SNES_M_B
			if( (p1_state) & (1<<1)  ? 1 : 0 ){p1_key_Q     .classList.add("active");} else{p1_key_Q     .classList.remove("active");} // CU_CTR_SNES_M_Y
			if( (p1_state) & (1<<2)  ? 1 : 0 ){p1_key_SPACE .classList.add("active");} else{p1_key_SPACE .classList.remove("active");} // CU_CTR_SNES_M_SELECT
			if( (p1_state) & (1<<3)  ? 1 : 0 ){p1_key_ENTER .classList.add("active");} else{p1_key_ENTER .classList.remove("active");} // CU_CTR_SNES_M_START
			if( (p1_state) & (1<<4)  ? 1 : 0 ){p1_key_UP    .classList.add("active");} else{p1_key_UP    .classList.remove("active");} // CU_CTR_SNES_M_UP
			if( (p1_state) & (1<<5)  ? 1 : 0 ){p1_key_DOWN  .classList.add("active");} else{p1_key_DOWN  .classList.remove("active");} // CU_CTR_SNES_M_DOWN
			if( (p1_state) & (1<<6)  ? 1 : 0 ){p1_key_LEFT  .classList.add("active");} else{p1_key_LEFT  .classList.remove("active");} // CU_CTR_SNES_M_LEFT
			if( (p1_state) & (1<<7)  ? 1 : 0 ){p1_key_RIGHT .classList.add("active");} else{p1_key_RIGHT .classList.remove("active");} // CU_CTR_SNES_M_RIGHT
			if( (p1_state) & (1<<8)  ? 1 : 0 ){p1_key_S     .classList.add("active");} else{p1_key_S     .classList.remove("active");} // CU_CTR_SNES_M_A
			if( (p1_state) & (1<<9)  ? 1 : 0 ){p1_key_W     .classList.add("active");} else{p1_key_W     .classList.remove("active");} // CU_CTR_SNES_M_X
			if( (p1_state) & (1<<10) ? 1 : 0 ){p1_key_LSHIFT.classList.add("active");} else{p1_key_LSHIFT.classList.remove("active");} // CU_CTR_SNES_M_LSH
			if( (p1_state) & (1<<11) ? 1 : 0 ){p1_key_RSHIFT.classList.add("active");} else{p1_key_RSHIFT.classList.remove("active");} // CU_CTR_SNES_M_RSH

			let p2_key_UP     = document.querySelector("#emuGamepad_2_key_UP");
			let p2_key_DOWN   = document.querySelector("#emuGamepad_2_key_DOWN");
			let p2_key_LEFT   = document.querySelector("#emuGamepad_2_key_LEFT");
			let p2_key_RIGHT  = document.querySelector("#emuGamepad_2_key_RIGHT");
			let p2_key_SPACE  = document.querySelector("#emuGamepad_2_key_SPACE");
			let p2_key_ENTER  = document.querySelector("#emuGamepad_2_key_ENTER");
			let p2_key_LSHIFT = document.querySelector("#emuGamepad_2_key_LSHIFT");
			let p2_key_RSHIFT = document.querySelector("#emuGamepad_2_key_RSHIFT");
			let p2_key_Q      = document.querySelector("#emuGamepad_2_key_Q");
			let p2_key_W      = document.querySelector("#emuGamepad_2_key_W");
			let p2_key_A      = document.querySelector("#emuGamepad_2_key_A");
			let p2_key_S      = document.querySelector("#emuGamepad_2_key_S");

			if( (p2_state) & (1<<0)  ? 1 : 0 ){p2_key_A     .classList.add("active");} else{p2_key_A     .classList.remove("active");} // CU_CTR_SNES_M_B
			if( (p2_state) & (1<<1)  ? 1 : 0 ){p2_key_Q     .classList.add("active");} else{p2_key_Q     .classList.remove("active");} // CU_CTR_SNES_M_Y
			if( (p2_state) & (1<<2)  ? 1 : 0 ){p2_key_SPACE .classList.add("active");} else{p2_key_SPACE .classList.remove("active");} // CU_CTR_SNES_M_SELECT
			if( (p2_state) & (1<<3)  ? 1 : 0 ){p2_key_ENTER .classList.add("active");} else{p2_key_ENTER .classList.remove("active");} // CU_CTR_SNES_M_START
			if( (p2_state) & (1<<4)  ? 1 : 0 ){p2_key_UP    .classList.add("active");} else{p2_key_UP    .classList.remove("active");} // CU_CTR_SNES_M_UP
			if( (p2_state) & (1<<5)  ? 1 : 0 ){p2_key_DOWN  .classList.add("active");} else{p2_key_DOWN  .classList.remove("active");} // CU_CTR_SNES_M_DOWN
			if( (p2_state) & (1<<6)  ? 1 : 0 ){p2_key_LEFT  .classList.add("active");} else{p2_key_LEFT  .classList.remove("active");} // CU_CTR_SNES_M_LEFT
			if( (p2_state) & (1<<7)  ? 1 : 0 ){p2_key_RIGHT .classList.add("active");} else{p2_key_RIGHT .classList.remove("active");} // CU_CTR_SNES_M_RIGHT
			if( (p2_state) & (1<<8)  ? 1 : 0 ){p2_key_S     .classList.add("active");} else{p2_key_S     .classList.remove("active");} // CU_CTR_SNES_M_A
			if( (p2_state) & (1<<9)  ? 1 : 0 ){p2_key_W     .classList.add("active");} else{p2_key_W     .classList.remove("active");} // CU_CTR_SNES_M_X
			if( (p2_state) & (1<<10) ? 1 : 0 ){p2_key_LSHIFT.classList.add("active");} else{p2_key_LSHIFT.classList.remove("active");} // CU_CTR_SNES_M_LSH
			if( (p2_state) & (1<<11) ? 1 : 0 ){p2_key_RSHIFT.classList.add("active");} else{p2_key_RSHIFT.classList.remove("active");} // CU_CTR_SNES_M_RSH
		}, 25);
	},

	emuFullscreen : function(){
		// The Emscripten way will not allow resizing.
		// emu.vars.innerEmu.Module.requestFullscreen()

		var canvas = emu.vars.dom.view["emscripten_emu_container"]

		// Go to fullscreen.
		if(!document.fullscreen){
			if      (canvas.requestFullscreen      ) { canvas.requestFullscreen();       }
			else if (canvas.webkitRequestFullscreen) { canvas.webkitRequestFullscreen(); }
			else if (canvas.mozRequestFullScreen   ) { canvas.mozRequestFullScreen();    }
			else if (canvas.msRequestFullscreen    ) { canvas.msRequestFullscreen();     }
		}

		// Exit to fullscreen.
		else{
			if      (document.exitFullscreen         ) { document.exitFullscreen();       }
			else if (document.webkitFullscreenElement) { document.webkitFullscreenElement(); }
			else if (document.mozFullScreenElement   ) { document.mozFullScreenElement();    }
			else if (document.msFullscreenElement    ) { document.msFullscreenElement();     }
		}
	},

};
emu.funcs.UAM       = {
	// * Adds the UAM event listeners.
	addEventListeners: function() {
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

		emu.funcs.db.addEventListeners();
	},

	// * Show UAM.
	enableUAM: function() {
		// Get values from UAM.
		emu.vars.originUAM      = true;
		emu.vars.uamwindow      = window.top;
		emu.vars.user_id        = emu.vars.uamwindow.shared.user_id;

		// Unhide UAM DOM.
		document.querySelectorAll(".uamOnly").forEach(function(d, i, a) {
			d.classList.remove("unavailableView");
			d.classList.add("enabled");
		});

		// Unhide the other nav options.
		document.querySelectorAll(".sectionDivs_title_options .navOptions.uamOnly").forEach(function(d, i, a) {
			d.classList.remove("hidden");
		});

		// Make the container wider. Shrink the emu windows.
		document.querySelector("html").classList.add("wide");
		document.querySelector("#emu_emulator").classList.add("largerEmuWindow");
		// emu.vars.dom.view["emuCanvas"].width="640";
		// emu.vars.dom.view["emuCanvas"].height="560";
	},
	// * Hide UAM.
	disableUAM: function() {
		// Unset the values that came from UAM.
		emu.vars.originUAM      = false;
		emu.vars.uamwindow      = undefined;
		emu.vars.user_id        = undefined;

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

		// Wait for UAM to finish loading... then continue.
		emu.vars.uamwindow.shared.UAMisReady.then(function() {
			// Hide the header and the footer then scroll the bodyContainer into view.
			document.querySelector("#bodyHeader").style.display = "none";
			document.querySelector("#bodyFooter").style.display = "none";
			document.getElementById('bodyContainer').scrollIntoView(emu.funcs.nav.scrollIntoView_options);

			// Set up the UAM DOM.
			emu.funcs.domHandleCache_populate_UAM();

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
		});
	},

	// * Queries the UAM database for games that match the user's user_id.
	getGamesListUAM: function() {
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
	compileGameUAM: function() {
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


	// Runs the C2BIN script for the selected UAM game.
	c2bin_UamGame: function() {
		console.log("emu_c2bin_UAM");
	},

	// Runs the C2BIN2 script for the selected UAM game.
	c2bin_UamGame_2: function() {
		console.log("emu_c2bin2_UAM");
	},

};
emu.funcs.downloads = {
};
emu.funcs.shared    = {
	// * Sets the canvas dimensions back to default.
	resetCanvasDimensions : function(){
		emu.vars.dom.view["emuCanvas"].width="310";
		emu.vars.dom.view["emuCanvas"].height="228";
	},
	// * Display message on the canvas in the top-left corner.
	textOnCanvas: function(obj) {
		// ctx.fillRect(0,0, Math.floor(ctx.measureText(obj.text).width), 48);
		if (!obj)                             { obj = {}; }
		if (obj.canvas          == undefined) { obj.canvas          = emu.vars.dom.view["emuCanvas"]; }
		if (obj.font            == undefined) {
			// Set to the smaller font size if this is the smaller canvas.
			if(
				obj.canvas.width >=310 && obj.canvas.width <=320 &&
				obj.canvas.height >=228 && obj.canvas.height <=280
			) { obj.font            = "20px monospace"; }
			// It is the bigger one. Use the larger font size.
			else { obj.font         = "40px monospace"; }
		}
		if (obj.textAlign       == undefined) { obj.textAlign       = "center"; }
		if (obj.backgroundColor == undefined) { obj.backgroundColor = "rgba(255, 0, 0, 0.60)"; }
		if (obj.fontColor       == undefined) { obj.fontColor       = "white"; }
		if (obj.text            == undefined) { obj.text            = ""; }
		if (obj.textBaseline    == undefined) { obj.textBaseline    = "middle"; }

		var fontSize = parseInt(obj.font);
		let ctx = obj.canvas.getContext("2d");
		ctx.font = obj.font;
		ctx.textAlign = obj.textAlign;

		// Don't let messages go beyond the canvas.
		if (obj.text.length > 23) { obj.text = obj.text.substr(0, 23); }
		obj.text = obj.text.trim();

		var rectX=0;
		var rectY=(obj.canvas.height/2)-fontSize*1.5;
		var rectW=Math.floor(obj.canvas.width);
		var rectH=fontSize*2.25;

		ctx.fillStyle = obj.backgroundColor;
		ctx.fillRect(rectX, rectY, rectW, rectH);

		ctx.textBaseline=obj.textBaseline;
		ctx.fillStyle = obj.fontColor;
		ctx.fillText(obj.text , rectX+(rectW/2),rectY+(rectH/2));
	},
	// * Turns the canvas image to gray-scale.
	grayTheCanvas: function(canvas) {
		var ctx = canvas.getContext("2d");
		var buff = ctx.getImageData(
			0, 0,
			canvas.width, canvas.height
		);
		for (var i = 0; i < buff.data.length; i += 4) {
			var red = buff.data[i + 0];
			var green = buff.data[i + 1];
			var blue = buff.data[i + 2];
			// var alpha = buff.data[i+3];

			var alpha = 128;
			// GRAYSCALE
			var avg = ((red) + (green) + (blue)) / 3;
			buff.data[i + 0] = avg;
			buff.data[i + 1] = avg;
			buff.data[i + 2] = avg;
			buff.data[i + 3] = alpha;
		}
		ctx.putImageData(buff, 0, 0);
	},
	// * Performs a fillRect on the specified canvas. (BLACK)
	clearTheCanvas: function(canvas) {
		var ctx = canvas.getContext("2d");
		// ctx.clearRect(0,0, canvas.width, canvas.height);
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	},
	// * Make an AJAX request.
	serverRequest: function(formData) {
		// Make sure that a ._config key exists and that it has values.
		if (typeof formData._config == "undefined") { formData._config = {}; }
		if (typeof formData._config.responseType == "undefined") { formData._config.responseType = "json"; }
		if (typeof formData._config.hasFiles == "undefined") { formData._config.hasFiles = false; }
		if (typeof formData._config.filesHandle == "undefined") { formData._config.filesHandle = null; }
		if (typeof formData._config.method == "undefined") { formData._config.method = "POST"; }
		if (typeof formData._config.processor == "undefined") { formData._config.processor = "index_p.php"; }

		return new Promise(function(resolve, reject) {
			var progress_showPercent = function() {};

			var progress_hidePercent = function() {};

			// Event handlers.
			var updateProgress = function(oEvent) {
				return;
				var text = "Progress:";
				if (oEvent.lengthComputable) {
					var percentComplete = oEvent.loaded / oEvent.total * 100;
					console.log(text, "percentComplete:", percentComplete, oEvent);
				}
				else {
					// Unable to compute progress information since the total size is unknown
					// console.log(text, "cannot determine", oEvent);
				}
			};
			var transferComplete = function(evt) {
				// The default responseType is text if it is not specified.
				// However, this function (serverRequest) defaults it to 'json' if it is not specified.
				var data = {};

				switch (this.responseType) {
					case 'text':
						{ data = this.responseText; break; }
					case 'arraybuffer':
						{ data = this.response; break; }
					case 'blob':
						{ data = this.response; break; }
					case 'json':
						{ data = this.response; break; }
					default:
						{ data = this.responseText; break; }
				}

				// console.log("554",this, this.responseType);
				resolve(data);
			};
			var transferFailed = function(evt) {
				console.log("An error occurred during the transfer.");
				reject({
					'type': evt.type,
					'xhr': xhr,
					'evt': evt,
				});
			};
			var transferCanceled = function(evt) {
				console.log("The transfer has been canceled by the user.", evt);
			};
			var loadEnd = function(e) {
				// console.log("The transfer finished (although we don't know if it succeeded or not).", e);
				try { emu.funcs.shared.activateProgressBar(false); }
				catch (e) {}
			};

			// Create the form.
			var fd = new FormData();
			var o = formData.o;
			// fd.append("o" , formData.o );

			// Add the keys and values.
			for (var prop in formData) {
				// Skip the "_config" key.
				if (prop == "_config") { continue; }
				if (prop == "_config") { continue; }
				// Append the key and value.
				fd.append(prop, formData[prop]);
			}

			// Are there files included?
			if (formData._config.hasFiles) {
				// console.log("Uploading this many files:", formData._config.filesHandle.files.length);
				for (var i = 0; i < formData._config.filesHandle.files.length; i++) {
					// console.log("On file " + (i + 1) + " of " + formData._config.filesHandle.files.length, "(" + formData._config.filesHandle.files[i].name + ")");
					fd.append(formData._config.filesHandle.files[i].name, formData._config.filesHandle.files[i]);
				}
			}

			var xhr = new XMLHttpRequest();

			xhr.addEventListener("progress", updateProgress);
			xhr.addEventListener("load", transferComplete);
			xhr.addEventListener("error", transferFailed);
			xhr.addEventListener("abort", transferCanceled);
			xhr.addEventListener("loadend", loadEnd);

			xhr.open(
				formData._config.method,
				formData._config.processor + "?o=" + o + "&r=" + (new Date()).getTime(),
				true
			);

			// If a responseType was specified then use it.
			if (formData._config && formData._config.responseType) {
				// switch( this.responseType ){
				// console.log(formData._config.responseType);
				switch (formData._config.responseType) {
					case 'text':
						{ xhr.responseType = "text"; break; }
					case 'arraybuffer':
						{ xhr.responseType = "arraybuffer"; break; }
					case 'blob':
						{ xhr.responseType = "blob"; break; }
					case 'json':
						{ xhr.responseType = "json"; break; }
					default:
						{ xhr.responseType = "json"; break; }
				}
			}
			// Otherwise, it is almost always 'json' so specify that.
			else {
				xhr.responseType = "json";
			}

			try { emu.funcs.shared.activateProgressBar(true); }
			catch (e) {}

			// setTimeout(function() { xhr.send(fd); }, 1);
			xhr.send(fd);
		});

		// USAGE EXAMPLE:
		// You can skip the _config part in most cases unless you want to specify a value there that isn't the default.
		//	var formData = {
		//		"o"       : "test",
		//		"somekey"  : "some value"           ,
		//		"_config" : {
		//			"responseType" : "json",
		//			"hasFiles"     : false ,
		//			"filesHandle"  : null  , // document.querySelector('#emu_gameDb_builtInGames_choose');
		//			"method"       : "POST", // POST or GET
		//			"processor"    : "index_p.php"
		//		}
		//	};
		//	var prom1 = mc_inputs.funcs.serverRequest(formData);

	},
	// * Show/hide the progress bar. Used by serverRequest.
	activateProgressBar: function(turnItOn) {
		// Activate the progress bar and screen darkener.
		if (turnItOn === true) {
			document.querySelector("#progressbarDiv").style.display = "block";
			document.querySelector("#entireBodyDiv").style.opacity = "1";
			document.querySelector("#entireBodyDiv").style.display = "block";
		}
		// De-activate the progress bar and screen darkener.
		else if (turnItOn === false) {
			document.querySelector("#progressbarDiv").style.display = "none";
			document.querySelector("#entireBodyDiv").style.opacity = "0";
			setTimeout(function() { document.querySelector("#entireBodyDiv").style.display = "none"; }, 50);
		}
	},
	// * Used for rejected promises. Generic. Just displays the error to the console.
	rejectedPromise: function(error) {
		console.log("ERROR", error);
	},
	// * Removes the pixel smoothing settings on the specified canvas.
	setpixelated: function(canvas) {
		// https://stackoverflow.com/a/13294650
		canvas.getContext("2d").mozImageSmoothingEnabled = false; // Firefox
		canvas.getContext("2d").imageSmoothingEnabled = false; // Firefox
		canvas.getContext("2d").oImageSmoothingEnabled = false; //
		canvas.getContext("2d").webkitImageSmoothingEnabled = false; //
		canvas.getContext("2d").msImageSmoothingEnabled = false; //
	},
	arrayToArrayBuffer : function (array){
		// https://stackoverflow.com/q/34089569
		var length = array.length;
		var buffer = new ArrayBuffer( length );
		var view = new Uint8Array(buffer);
		for ( var i = 0; i < length; i++) {
		    view[i] = parseInt(array[i]);
		}
		return buffer;
	},
};
emu.funcs.nav       = {
	// * Options for Element.scrollIntoView.
	scrollIntoView_options: {
		behavior: "smooth", // "auto", "instant", or "smooth".         Defaults to "auto".
		block: "start"
		// , block   : "center"  // "start", "center", "end", or "nearest". Defaults to "center".
		// , inline  : "nearest" // "start", "center", "end", or "nearest". Defaults to "nearest".
	},
	// * Changes the main application views.
	changeView: function(newview) {
		var allSectionDivs = document.querySelectorAll(".sectionDivs");
		var bodyContainer = document.querySelector("#bodyContainer");

		var emu_view   = emu.vars.dom.views["view_VIEW"  ] ;
		var emu_debug1 = emu.vars.dom.views["view_DEBUG1"] ;
		var emu_debug2 = emu.vars.dom.views["view_DEBUG2"] ;
		var emu_db     = emu.vars.dom.views["view_DB"    ] ;

		var emu_view_nav   = document.querySelectorAll('.navOptions[newview="VIEW"]');
		var emu_debug1_nav = document.querySelectorAll('.navOptions[newview="DEBUG1"]');
		var emu_debug2_nav = document.querySelectorAll('.navOptions[newview="DEBUG2"]');
		var emu_db_nav     = document.querySelectorAll('.navOptions[newview="DB"]');

		bodyContainer.scrollIntoView(emu.funcs.nav.scrollIntoView_options);

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
				break;
			}
			case "DEBUG1":{
				hideSections();
				hideNavs();
				emu_debug1.classList.add   ("active");
				emu_debug1.classList.remove("hidden");
				emu_debug1_nav.forEach(function(d,i,a){ d.classList.add   ("active"); });
				break;
			}
			case "DEBUG2":{
				hideSections();
				hideNavs();
				emu_debug2.classList.add   ("active");
				emu_debug2.classList.remove("hidden");
				emu_debug2_nav.forEach(function(d,i,a){ d.classList.add   ("active"); });
				break;
			}
			case "DB":{
				hideSections();
				hideNavs();
				emu_db.classList.add   ("active");
				emu_db.classList.remove("hidden");
				emu_db_nav.forEach(function(d,i,a){ d.classList.add   ("active"); });
				break;
			}
			default:{
				console.log("Invalid choice for newview");
				break;
			}
		};
	},
	// * Changes the misc nav views.
	changeMiscView: function(newview, navButton) {
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

emu.funcs.db  = {
// emu.funcs.emu_getBuiltInGamelist();
	// * Adds the UAM DB event listeners.
	addEventListeners: function() {
		//
		emu.vars.dom.db["gameSelect"].addEventListener("change", function() {
			emu.funcs.db.getData_oneGame();
		}, false);
		//
		emu.vars.dom.db["gameSelect_load"].addEventListener("click", function() {
			emu.funcs.db.getData_oneGame();
		}, false);

		// Hidden file upload button.
		emu.vars.dom.db["db_builtInGames_fileUpload"].addEventListener("change", function() {
			emu.funcs.db.gameDb_addFiles();
		}, false);

		// Visible upload button.
		emu.vars.dom.db["db_builtInGames_fileUpload_visible"].addEventListener("click", function() {
			if( emu.vars.dom.db['gameSelect'].value ){
				// Clear the files.
				emu.vars.dom.db['db_builtInGames_fileUpload'].value='';
				// Click the upload button.
				emu.vars.dom.db['db_builtInGames_fileUpload'].click();
			}
			else{
				emu.funcs.db.clearAllDisplayedGameData();
				alert('ERROR. You have not selected a game.');
			}
		}, false);

		// Update the data for the loaded game.
		emu.vars.dom.db["gameSelect_update"].addEventListener("click", function() {
			emu.funcs.db.gameDb_updateGameData();
		}, false);

		//
		emu.vars.dom.db["gameSelect_create"].addEventListener("click", function() {
			emu.funcs.db.gameDb_newGame();
		}, false);

		//
		emu.vars.dom.db["gameSelect_delete"].addEventListener("click", function() {
			emu.funcs.db.gameDb_deleteGame();
		}, false);
	},
	// * Puts the emu_status values into the select menu for "status".
	gameDb_populateStatusSelectMenu : function(){
		var option = undefined;
		var select = emu.vars.dom.db["dataField_status"];
		select.length=0;
		var frag = document.createDocumentFragment();

		for(var i=0; i<emu.vars.emu_statuses.length; i++){
			option = document.createElement('option');
			option.value = i;
			option.text = emu.vars.emu_statuses[i] + " (Status:"+i+")";
			frag.appendChild(option);
		}
		select.appendChild(frag);
	} ,
	// * Retrieves the data and file list for the specified game in the built-in games database.
	getData_oneGame                 : function(){
		var select = emu.vars.dom.db["gameSelect"];

		if(! select.value){
			// emu.gameDb.clearAllDisplayedGameData();
			console.log("No game selected.");
			alert      ("No game selected.");
			return;
		}

		// Get the game id.
		var gameid=select.value;

		// Request the game data from the server.
		var formData = {
			"o"      : "getData_oneGame",
			"gameid" : gameid,
			"_config": { "processor": "emu_p.php" }
		};

		emu.funcs.shared.serverRequest(formData).then(
			function(res){
				// Populate the data fields.
				emu.vars.dom.db["dataField_title"]       .value = res.data.gameData.title       ;
				emu.vars.dom.db["dataField_authors"]     .value = res.data.gameData.authors     ;
				emu.vars.dom.db["dataField_status"]      .value = res.data.gameData.status      ;
				emu.vars.dom.db["dataField_addedBy"]     .value = res.data.gameData.added_by    ;
				emu.vars.dom.db["dataField_gameid"]      .value = res.data.gameData.id          ;
				emu.vars.dom.db["dataField_gameDir"]     .value = res.data.gameData.gamedir     ;
				emu.vars.dom.db["dataField_whenAdded"]   .value = res.data.gameData.when_added   ;
				emu.vars.dom.db["dataField_gameFile"]    .value = res.data.gameData.gamefile    ;
				emu.vars.dom.db["dataField_gameFiles"]   .value = res.data.gameData.gamefiles   ;
				emu.vars.dom.db["dataField_description"] .value = res.data.gameData.description ;

				// Update the displayed filelist.
				emu.funcs.db.gameDb_updateFilelist(res.data);

				// Update the displayed game links.
				// emu.funcs.db.gameDb_createLinks();

			}
			,emu.funcs.shared.rejectedPromise
		);


	},
	// * Displays the file list returned for the game data and game directory contents.
	gameDb_updateFilelist           : function(data){
		var files_div1 = emu.vars.dom.db["db_files_included"];
		var files_div2 = emu.vars.dom.db["db_files_allInDir"];
		var gameId     = emu.vars.dom.db["gameSelect"].value;
		var gamefiles  = data.gameData.gamefiles  ;
		var dirfiles   = data.gameFiles;

		var newHTML ="";
		var newHTML1="";
		var newHTML2="";
		var chk_isGamefile;
		var chk_isMainGamefile;

		newHTML  += "";
		newHTML1 += "<table class='table1'>" + "<caption>Executable Game Files</caption><tr><th>Filename</th><th>Include</th><th>Core game file</th><th>Delete</th></tr>";
		newHTML2 += "<table class='table1'>" + "<caption>Support Game Files</caption><tr><th>Filename</th><th>Include</th><th>--</th>            <th>Delete</th></tr>";

		for(var i=0; i<dirfiles.length; i++){
			chk_isGamefile     = gamefiles.indexOf( dirfiles[i] ) == -1 ? '' : 'checked' ;
			chk_isMainGamefile = dirfiles[i].trim() == data.gameData.gamefile.trim() ? 'checked' : '';

			var filenameFull      = dirfiles[i] ;
			var ext = (filenameFull.substr(-4, 4)).toLowerCase() ;
			var isExecFile = (ext == ".uze" || ext == ".hex") ? 1 : 0;

			var displayedFilename = "" ;

			if(filenameFull.length>25){ displayedFilename = filenameFull.substr(0, 15) + "..." + filenameFull.substr(-10, 10); }
			else                      { displayedFilename = filenameFull; }

			var radio_html     = "<td><label><div style='text-align: center;'> <input onchange='emu.funcs.db.gameDb_updateMainGamefile();'  type='radio'    filename='"+dirfiles[i]+"' "+chk_isMainGamefile+" name='emu_mainGamefileGroup'> </div></label></td>" + "";
			var non_radio_html = "<td></td>";

			newHTML =
				"<tr>" +
					"<td title='"+filenameFull+"'>"+displayedFilename+"</td>" +
					"<td><label><div style='text-align: center;'> <input onchange='emu.funcs.db.gameDb_updateGamefilesText();' type='checkbox' filename='"+dirfiles[i]+"' "+chk_isGamefile+    "> </div></label></td>" +
					""+(isExecFile ? radio_html : non_radio_html) +
					"<td>       <div style='text-align: center;'> <input type='button' value='DELETE' onclick='emu.funcs.db.gameDb_deleteFile("+gameId+", \""+dirfiles[i]+"\")'></div></td>" +
				"</tr>";
			"";

			if  (isExecFile){ newHTML1+=newHTML; }
			else            { newHTML2+=newHTML; }
		}

		newHTML1 += "</table>";
		newHTML2 += "</table>";

		files_div1.innerHTML = newHTML1 ;
		files_div2.innerHTML = newHTML2 ;
	} ,
	// * Uploads the displayed value for the included game files.
	gameDb_updateGamefilesText      : function(){
		var input_gamefiles = emu.vars.dom.db["dataField_gameFiles"];
		var fs1 = emu.vars.dom.db["db_files_included"].id;
		var fs2 = emu.vars.dom.db["db_files_allInDir"].id;

		var checkboxes  = document.querySelectorAll(
			"#"+fs1+" [type='checkbox' ], #"+fs2+" [type='checkbox' ]"
		);

		input_gamefiles.value="";

		var gamefiles=[];
		for(var i=0; i<checkboxes.length; i++){
			if(checkboxes[i].checked){ gamefiles.push( checkboxes[i].getAttribute('filename') ); }
		}

		input_gamefiles.value = JSON.stringify(gamefiles);
	} ,
	// * Uploads the displayed value for the core game file.
	gameDb_updateMainGamefile       : function(){
		var mainGamefile     = document.querySelector("[name='emu_mainGamefileGroup']:checked").getAttribute('filename');
		var input_gamefile   = emu.vars.dom.db["dataField_gameFile"];
		input_gamefile.value = mainGamefile;
	} ,
	// * Reset all displayed game data.
	clearAllDisplayedGameData       : function(){
		// Clear all displayed game data.
		emu.vars.dom.db["dataField_title"]      .value="";
		emu.vars.dom.db["dataField_authors"]    .value="";
		emu.vars.dom.db["dataField_status"]     .value="";
		emu.vars.dom.db["dataField_addedBy"]    .value="";
		emu.vars.dom.db["dataField_gameid"]     .value="";
		emu.vars.dom.db["dataField_gameDir"]    .value="";
		emu.vars.dom.db["dataField_whenAdded"]  .value="";
		emu.vars.dom.db["dataField_gameFile"]   .value="";
		emu.vars.dom.db["dataField_gameFiles"]  .value="";
		emu.vars.dom.db["dataField_description"].value="";
		emu.vars.dom.db["db_files_included"].innerHTML="--";
		emu.vars.dom.db["db_files_allInDir"].innerHTML="--";
		emu.vars.dom.db["db_builtInGames_fileUpload"].value="";
	} ,
	// * Handles the upload of new game files.
	gameDb_addFiles                 : function(){
		var select = emu.vars.dom.db["gameSelect"];
		if(! select.value){
			// console.log("No game selected.");
			return;
		}
		var gameid = select.value;

		var files = emu.vars.dom.db["db_builtInGames_fileUpload"];
		// How many files?
		var filesText = "";
		for(var i=0; i<files.files.length; i++){
			filesText += "FILE: " + files.files[i].name + ", BYTES: " + files.files[i].size + "\n" ;
		}

		// Confirm the upload.
		var confirmed = confirm(
			"You are about to upload the following "+files.files.length+" files to the game directory:\n\n" +
			filesText + "" +
			"\n" +
			"Continue?" +
			""
		);

		if(!confirmed){
			// console.log("User has cancelled the file upload.");
			files.value="";
			return;
		}

		// Request the game data from the server.
		var formData = {
			"o"      : "gameDb_addFiles",
			"gameid" : gameid,
			"_config": {
				"filesHandle": files,
				"hasFiles"   : true,
				"processor"  : "emu_p.php"
			}
		};

		emu.funcs.shared.serverRequest(formData).then(
			function(res){
				files.value="";

				// Update the displayed filelist. Indicate NOT to update the game data, only the game file list.
				emu.funcs.db.gameDb_updateFilelist(res);
			}
			,emu.funcs.shared.rejectedPromise
		);

	} ,
	// * Deletes the specified file from the game's directory.
	gameDb_deleteFile               : function(gameid, filename){
		var select = emu.vars.dom.db["gameSelect"];
		if(! select.value){
			// console.log("No game selected.");
			return;
		}
		var gameid = select.value;

		// Confirm the deletion.
		if(
			!confirm(
				"You are about to delete the following "+1+" files:\n\n" +
				filename + "\n\n" + "Continue?"
			)
		){
			// console.log("User has cancelled the file delete.");
			return;
		}
		// Confirm again.
		if(! confirm("Are you certain?") ){
			// console.log("User has cancelled the file delete.");
			return;
		}

		// Request the game data from the server.
		var formData = {
			"o"        : "gameDb_deleteFile",
			"gameid"   : gameid,
			"filename" : filename,
			"_config"  : { "processor"  : "emu_p.php" }
		};

		emu.funcs.shared.serverRequest(formData).then(
			function(res){
				// Update the displayed filelist. Indicate NOT to update the game data, only the game file list.
				emu.funcs.db.gameDb_updateFilelist(res);
			}
			,emu.funcs.shared.rejectedPromise
		);
	},
	// * Updates the game data in the database with the data displayed on the form.
	gameDb_updateGameData           : function(){
		if(! emu.vars.dom.db["gameSelect"].value){
			// console.log("No game selected.");
			return;
		}

		var obj = {
			'title'       : emu.vars.dom.db["dataField_title"]      .value ,
			'authors'     : emu.vars.dom.db["dataField_authors"]    .value ,
			'gamefile'    : emu.vars.dom.db["dataField_gameFile"]   .value ,
			'status'      : emu.vars.dom.db["dataField_status"]     .value ,
			'added_by'    : emu.vars.dom.db["dataField_addedBy"]    .value ,
			'id'          : emu.vars.dom.db["dataField_gameid"]     .value ,
			'gamedir'     : emu.vars.dom.db["dataField_gameDir"]    .value ,
			'when_added'  : emu.vars.dom.db["dataField_whenAdded"]  .value ,
			'description' : emu.vars.dom.db["dataField_description"].value ,
			'gamefiles'   : emu.vars.dom.db["dataField_gameFiles"]  .value ,
		};

		// Request the game data from the server.
		var formData = {
			"o"      : "gameDb_updateGameData",
			"gameid" : obj.id,
			"data"   : JSON.stringify(obj),
			"_config": { "processor": "emu_p.php" }
		};

		emu.funcs.shared.serverRequest(formData).then(
			function(res){
				// Record the current values for the select menus.
				let value1 = emu.vars.dom.db["gameSelect"].value;
				let value2 = emu.vars.dom.view["builtInGames_select"].value;

				// Refresh both game lists.
				emu.funcs.emu_getBuiltInGamelist().then(function(){
					// Set the previously set values for the select menus.
					emu.vars.dom.db["gameSelect"].value            = value1;
					emu.vars.dom.view["builtInGames_select"].value = value2;

					// Refresh the selected game's data.
					emu.funcs.db.getData_oneGame();
				});
			}
			,emu.funcs.shared.rejectedPromise
		);

	} ,

	//
	gameDb_newGame : function(){
		// gameDb_newGame
		var title = prompt("Choose a title for the new game entry.\n\nYou can fill the rest of the values later.", "");

		if     (!title){
			// console.log("Action cancelled.");
			alert      ("Action cancelled.");
			return;
		}
		else if(title==""){
			// console.log("You did not choose a title");
			alert("You did not choose a title");
			return;
		}

		// var gamedir = title.replace(/\W/g, '_');

		// Request the game data from the server.
		var formData = {
			"o"       : "gameDb_newGame",
			"title"   : title,
			// "gamedir" : gamedir,
			"_config" : { "processor": "emu_p.php" }
		};

		emu.funcs.shared.serverRequest(formData).then(
			function(res){
				// Refresh both game lists.
				emu.funcs.emu_getBuiltInGamelist().then(function(){
					// Set to the new game.
					emu.vars.dom.db["gameSelect"].value = res.newGameId;

					// Refresh the selected game's data.
					emu.funcs.db.getData_oneGame();
				});

			}
			,emu.funcs.shared.rejectedPromise
		);

	},

	//
	gameDb_deleteGame               : function(){
		var select = emu.vars.dom.db["gameSelect"];
		if(! emu.vars.dom.db["gameSelect"].value){
			console.log("No game selected.");
			return;
		}
		var gameid = select.value;

		var gameTitle = emu.vars.dom.db["dataField_title"].value;
		var gameDir   = emu.vars.dom.db["dataField_gameDir"].value;

		if( !confirm(
				"You are about to delete the following game and ALL files within it:\n\n" +
				"Game directory: " + gameDir   + "\n" +
				"Game title: "     + gameTitle + "\n" +
				"Game id: "        + gameid    + "\n" +
				"\n" +
				"Continue?")
		){
			// console.log("User has cancelled the game delete.");
			return;
		}
		else{
			if(!confirm("Are you VERY certain?")){
				// console.log("User has cancelled the game delete.");
				return;
			}
		}

		// Request the game data from the server.
		var formData = {
			"o"       : "gameDb_deleteGame",
			"gameid"   : gameid,
			// "gamedir" : gamedir,
			"_config" : { "processor": "emu_p.php" }
		};

		emu.funcs.shared.serverRequest(formData).then(
			function(res){
				// Clear the displayed data for the deleted game.
				emu.funcs.db.clearAllDisplayedGameData();
				// Reload the built-in game lists.
				emu.funcs.emu_getBuiltInGamelist()();
			}
			,emu.funcs.shared.rejectedPromise
		);
	}
};

function displayCUzeBox_flags(){
	setTimeout(function(){
		var flags = emu.vars.innerEmu.Module._guicore_getflags();

		let GUICORE_SMALL      = emu.vars.innerEmu.Module._NRA_returnFlags(3) ? true : false;
		let GUICORE_GAMEONLY   = emu.vars.innerEmu.Module._NRA_returnFlags(4) ? true : false;
		let main_fmerge        = emu.vars.innerEmu.Module._NRA_returnFlags(5) ? true : false;
		let main_ispause       = emu.vars.innerEmu.Module._NRA_returnFlags(6) ? true : false;
		let main_isadvfr       = emu.vars.innerEmu.Module._NRA_returnFlags(7) ? true : false;
		// let GUICORE_NOVSYNC    = emu.vars.innerEmu.Module._NRA_returnFlags(2) ;
		// let GUICORE_FULLSCREEN = emu.vars.innerEmu.Module._NRA_returnFlags(1) ;

		if(!GUICORE_SMALL    ) { emu.vars.dom.view["emuControls_QUALITY"].classList.add   ('activated'); }
		else                   { emu.vars.dom.view["emuControls_QUALITY"].classList.remove('activated'); }
		if(!GUICORE_GAMEONLY ) { emu.vars.dom.view["emuControls_DEBUG"]  .classList.add   ('activated'); }
		else                   { emu.vars.dom.view["emuControls_DEBUG"]  .classList.remove('activated'); }
		if(main_fmerge       ) { emu.vars.dom.view["emuControls_FLICKER"].classList.add   ('activated'); }
		else                   { emu.vars.dom.view["emuControls_FLICKER"].classList.remove('activated'); }
		if(main_ispause      ) { emu.vars.dom.view["emuControls_PAUSE"]  .classList.add   ('activated'); }
		else                   { emu.vars.dom.view["emuControls_PAUSE"]  .classList.remove('activated'); }
		if(main_isadvfr      ) { emu.vars.dom.view["emuControls_STEP"]   .classList.add   ('activated'); }
		else                   { emu.vars.dom.view["emuControls_STEP"]   .classList.remove('activated'); }

	},5);

};

function toggleCore(){
	// Get a copy of the queryString data.
	let qs=getQueryStringAsObj();

	var newCore ="";
	var coreKeyFound=false;

	var newHref = window.location.href.split("?")[0] ;

	switch(emu.vars.core){
		case "WASM"  : { newCore ="ASMJS"; break; }
		case "ASMJS" : { newCore ="WASM" ; break; }
		default      : { newCore = emu.vars.core; break; }
	}

	Object.keys(qs).map(function(objectKey, index) {
		if(index==0){ newHref+="?"; }
		else{ newHref+="&"; }

		if(objectKey=="core") {
			coreKeyFound=true;
			newHref+="core" + "=" + newCore ;
		}
		else{
			newHref+=objectKey + "=" + qs[objectKey] ;
		}
	});

	// If "core" was not on the query string then make sure it is there.
	if(!coreKeyFound){
		// Were there other keys on the querystring?
		if( Object.keys(getQueryStringAsObj()).length ) { newHref+="&"; }
		// No? Put the "?".
		else{ newHref+="?"; }

		newHref+="core" + "=" + newCore ;
	}

	// Do the redirect.
	window.location.href=newHref;
}

window.onload = function() {
	window.onload = null;

	console.log("****************************************");
	console.log("*** -- Online Uzebox Emulator v2b -- ***");
	console.log("****************************************");

	var continueApp = function() {
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
				document.querySelector("#coresetting #coresetting_text").innerHTML="Using Web Assembly ";
				document.querySelector("#coresetting #coresetting_toggle").classList.remove("hidden");
				newJs.src = "CUzeBox_emu_core/emu_core_WASM.js";
			}
			// Load the ASMJS version instead.
			else{
				// console.log("Using asm.js");
				document.querySelector("#coresetting #coresetting_text").innerHTML="Using ASM.js ";
				document.querySelector("#coresetting #coresetting_toggle").classList.remove("hidden");
				newJs.src = "CUzeBox_emu_core/emu_core_ASMJS.js";
			}

			// Append the new script element.
			document.body.appendChild(newJs);

		}).then( function(){
			// Populate the DOM handle caches.
			emu.funcs.domHandleCache_populate();

			// Add the event listeners.
			emu.funcs.addAllListeners();

			// Check if this application has been loaded under UAM.
			try {
				// Loaded via iframe?
				if (window.self !== window.top) {
					// Can the originUAM key be detected?
					if (window.top.shared.originUAM == true) { emu.funcs.UAM.setupUAM(); }
					else                                     { emu.funcs.UAM.disableUAM(); }
				}
				else {
					emu.funcs.UAM.disableUAM();
				}
			}
			catch (e) { emu.funcs.UAM.disableUAM(); }

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

					if(!emu.vars.originUAM){
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
			document.querySelector("#gamepadIcon_container1").click();

		});

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
		// "FileSaver",
	];
	// Feature detect/replace.
	featureDetection.funcs.init(continueApp);

};
