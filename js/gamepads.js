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

emu.gamepads     = {
	//
	addAllListeners : function(){
		let EL_gamepads = function(){
			// GAMEPAD CONFIG: Data Manager
			emu.vars.dom.gamepad["saveChanges"     ].addEventListener("click", emu.gamepads.saveChanges, false);
			emu.vars.dom.gamepad["download"        ].addEventListener("click", emu.gamepads.download, false);
			emu.vars.dom.gamepad["upload"          ].addEventListener("click", emu.gamepads.upload, false);
			emu.vars.dom.gamepad["gpmap_clear_maps"].addEventListener("click", emu.gamepads.clearSavedMaps, false);
			emu.vars.dom.gamepad["gpmap_swap_p1_p2"].addEventListener("click", emu.gamepads.swap_p1_p2, false);

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

			// resetGamepadStates
			emu.vars.dom.gamepad["resetGamepadStates"].addEventListener("click", function(){ emu.gamepads.resetGamepadStates(); alert("Gamepad states have been reset."); }, false);

		};
		EL_gamepads();

	},

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

		// Do we swap the gamepad order?
		if(emu.gamepads.swapGamepads==1){
			src_gamepads = src_gamepads.reverse();
		}

		if(!emu.vars.dom.gamepad["gp1_status"].innerHTML.length && src_gamepads.length>0){
			// console.log("assigning gamepad name (1)");
			let obj = emu.gamepads.generateGamepadKey(src_gamepads[0]);
			emu.vars.dom.gamepad["gp1_status"].innerHTML = obj.name + "**"+ obj.vendor+"**"+obj.product + " (Index:"+src_gamepads[0].index+")";
			document.querySelector("#emu_gamepadConfig_P1").classList.remove("disconnected");
			emu.gamepads.newTemplateMapEntry(obj);
		}
		if(!emu.vars.dom.gamepad["gp2_status"].innerHTML.length && src_gamepads.length>1){
			// console.log("assigning gamepad name (2)");
			let obj = emu.gamepads.generateGamepadKey(src_gamepads[1]);
			emu.vars.dom.gamepad["gp2_status"].innerHTML = obj.name + "**"+ obj.vendor+"**"+obj.product + " (Index:"+src_gamepads[1].index+")";
			document.querySelector("#emu_gamepadConfig_P2").classList.remove("disconnected");
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

		// Reset the gamepad states. (may be a little redundant here.)
		emu.gamepads.resetGamepadStates();

		// Turn on very basic polling.
		emu.gamepads.gamepadMapPolling=true;
		setTimeout(emu.gamepads.mapping_gp_poll_loop, 100);

		// Switch to the main emulator view.
		// emu.funcs.nav.changeView("VIEW");

		// Open the gamepad config modal.
		emu.vars.dom.gamepad["gamepadConfigDiv"].classList.add('showModal');

	},
	// * Turns off the basic polling, closes the config window, handles emulator pause state.
	closeGamepadConfig   : function(){
		// Clear the flag for the gamepad map polling.
		emu.gamepads.gamepadMapPolling=false;

		// Close the gamepad config modal.
		emu.vars.dom.gamepad["gamepadConfigDiv"].classList.remove('showModal');

		// Reset the gamepad states.
		emu.gamepads.resetGamepadStates();

		// Wait a short bit to make sure any remaining polls complete.
		setTimeout(function(){
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

		}, 500);


	},
	// * Updates the local gamepad mapping object for the displayed active gamepads.
	saveChanges          : function(){
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
			// Clear the temp mappings.
			emu.gamepads.mapping_newGamepads=[];
			// Clear the settings for the gamepads (they will be re-read right away if normal polling was previously active.)
			emu.gamepads.gamepads=[];
			// Close this modal.
			emu.gamepads.closeGamepadConfig();
		}
	},
	// * Reads from the gp_config_mappings in RAM and provides a JSON download of the data.
	download             : function(){
		// var EMU_gp_config_mappingsuser = JSON.parse(localStorage.getItem("EMU_gp_config_mappings"));
		var EMU_gp_config_mappingsuser = emu.gamepads.gp_config_mappings;

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
	upload               : function(){
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
	// * Clears the maps that are saved in local storage. (Copy still remains in RAM.)
	clearSavedMaps       : function(){
		let conf = confirm("Are you sure that you want to clear the gamepad mappings that are stored in local storage?\n\nNOTE: The settings will remain in RAM until you refresh the browser window.");
		if(conf){ localStorage.removeItem("EMU_gp_config_mappings"); }
	},
	//
	swap_p1_p2           : function(){
		let activeGamepads = emu.gamepads.gamepads.map(function(d,i,a){
			if(d!=undefined){ return d; }
		});

		// Ensure that we have gamepads and that 2 are active.
		if( (activeGamepads.length==2 && activeGamepads[0]!=undefined && activeGamepads[1]!=undefined) ){
			// Set the gamepad swap flag. (This will cause the gamepads to be read in reverse order causing the last gamepad to be seen as player 1.)
			emu.gamepads.swapGamepads=!emu.gamepads.swapGamepads;

			// Reset the gamepad states.
			emu.gamepads.resetGamepadStates();
		}
		else{
			alert("ERROR: There must be two active gamepads for this feature to work.");
			return;
		}

	},

	// MAIN GAMEPAD FUNCTIONS/VARIABLES.
	swapGamepads : 0,
	totalNumGamepadsReady  : 0,
	gamepad_p1_isSet       : 0,
	gamepad_p2_isSet       : 0,
	p1_needs_mapping       : 0,
	p2_needs_mapping       : 0,
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
	// * Gamepad button mappings to Uzebox buttons. Specific to the gamepad. The included ones are gamepads I have.
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
	//
	resetGamepadStates : function(){
		// Does NOT clear the following:
		//	emu.gamepads.enabled
		//	emu.gamepads.gp_setTimeout_id
		//	emu.gamepads.gp_raf_id
		//	emu.gamepads.gp_poll_freq
		//	emu.gamepads.uzeBox_gamepad_mapping
		//	emu.gamepads.gp_config_mappings
		//	emu.gamepads.swapGamepads

		// Gamepad config screen: Clear the name displayed for the gamepads.
		emu.vars.dom.gamepad["gp1_status"].innerHTML="";
		emu.vars.dom.gamepad["gp2_status"].innerHTML="";

		// Gamepad config screen: Set each gamepad to disconnected.
		emu.vars.dom.gamepad["gp1_status"].classList.add("disconnected");
		emu.vars.dom.gamepad["gp2_status"].classList.add("disconnected");

		// Clear gamepad Individual "set" buttons.
		var gpCfgBtns = emu.vars.dom.gamepad["gp_cfg_setBtns"];
		gpCfgBtns.forEach(function(d, i, a) {
			d.classList.remove("activeBtnMap");
		});

		// Clear the gamepad "Set all" buttons.
		emu.vars.dom.gamepad["gp1_setAll"].remove("active");
		emu.vars.dom.gamepad["gp2_setAll"].remove("active");

		// Clear the other settings for the "Set all" feature.
		emu.gamepads.lastAssignedButton="";
		emu.gamepads.autoSet_buttonsToAssign=[];

		// Clear the temp mappings
		emu.gamepads.mapping_newGamepads=[];

		// Clear the gamepads.
		emu.gamepads.gamepads=[];

		// Reset all config flags.
		emu.gamepads.totalNumGamepadsReady = 0;
		emu.gamepads.gamepad_p1_isSet      = 0;
		emu.gamepads.gamepad_p2_isSet      = 0;
		emu.gamepads.p1_needs_mapping      = 0;
		emu.gamepads.p2_needs_mapping      = 0;

		// Player 1: Reset the displayed gamepad states.
		emu.vars.dom.view["gamepadIcon_container_p1"].classList.add("neverConnected");
		emu.vars.dom.view["gamepadIcon_container_p1"].classList.remove("known");
		emu.vars.dom.view["gamepadIcon_container_p1"].classList.remove("unconfigured");
		emu.vars.dom.view["gamepadIcon_container_p1"].classList.remove("connected");

		// Player 2: Reset the displayed gamepad states.
		emu.vars.dom.view["gamepadIcon_container_p2"].classList.add("neverConnected");
		emu.vars.dom.view["gamepadIcon_container_p2"].classList.remove("known");
		emu.vars.dom.view["gamepadIcon_container_p2"].classList.remove("unconfigured");
		emu.vars.dom.view["gamepadIcon_container_p2"].classList.remove("connected");
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
			// console.log("typeof raw_gamepads[i]:", typeof raw_gamepads[i], raw_gamepads[i], !raw_gamepads[i]);
			if("undefined"==typeof raw_gamepads[i]){ continue; }
			if(raw_gamepads[i]==null)              { continue; }
			if(!raw_gamepads[i])                   { continue; }

			// Add the gamepad. Use the same index value as indicated by the gamepad data.
			// console.log("adding:", raw_gamepads[i], raw_gamepads[i].index);
			if(raw_gamepads[i]) {
				src_gamepads[ raw_gamepads[i].index ] = raw_gamepads[i] ;
			}
		}

		// Any empty indexes can mess us up. Return an array WITHOUT empty indexes.
		src_gamepads = src_gamepads.map(function(d,i,a){ return d; }).filter(emu.funcs.shared.removeUndefines);
		return src_gamepads;
	},
	// * Returns an object with the unique identifiers for a specified gamepad instance.
	generateGamepadKey : function(thisPad){
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

			if     ( btnPressed  & BTN_B     ) { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_A"      , i+1); }
			else if( btnReleased & BTN_B     ) { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_A"      , i+1); }
			if     ( btnPressed  & BTN_A     ) { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_S"      , i+1); }
			else if( btnReleased & BTN_A     ) { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_S"      , i+1); }
			if     ( btnPressed  & BTN_Y     ) { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_Q"      , i+1); }
			else if( btnReleased & BTN_Y     ) { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_Q"      , i+1); }
			if     ( btnPressed  & BTN_X     ) { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_W"      , i+1); }
			else if( btnReleased & BTN_X     ) { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_W"      , i+1); }
			if     ( btnPressed  & BTN_SL    ) { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_LSHIFT" , i+1); }
			else if( btnReleased & BTN_SL    ) { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_LSHIFT" , i+1); }
			if     ( btnPressed  & BTN_SR    ) { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_RSHIFT" , i+1); }
			else if( btnReleased & BTN_SR    ) { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_RSHIFT" , i+1); }
			if     ( btnPressed  & BTN_SELECT) { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_SPACE"  , i+1); }
			else if( btnReleased & BTN_SELECT) { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_SPACE"  , i+1); }
			if     ( btnPressed  & BTN_START ) { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_ENTER"  , i+1); }
			else if( btnReleased & BTN_START ) { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_ENTER"  , i+1); }
			if     ( btnPressed  & BTN_RIGHT ) { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_RIGHT"  , i+1); }
			else if( btnReleased & BTN_RIGHT ) { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_RIGHT"  , i+1); }
			if     ( btnPressed  & BTN_LEFT  ) { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_LEFT"   , i+1); }
			else if( btnReleased & BTN_LEFT  ) { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_LEFT"   , i+1); }
			if     ( btnPressed  & BTN_DOWN  ) { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_DOWN"   , i+1); }
			else if( btnReleased & BTN_DOWN  ) { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_DOWN"   , i+1); }
			if     ( btnPressed  & BTN_UP    ) { emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_UP"     , i+1); }
			else if( btnReleased & BTN_UP    ) { emu.vars.innerEmu.emu_sendKeyEvent("keyup"  , "key_UP"     , i+1); }
		}
		// * Update the local cache of gamepad objects.
		function getNewGamepadStates(){
			function update_gamepadObj(src_gamepads){
				// Clear the "active" flag on each of the known gamepads.
				for(let i=0; i<emu.gamepads.gamepads.length; i+=1){
					let thisPad=emu.gamepads.gamepads[i];
					if(thisPad==undefined)         { continue; }
					if("undefined"==typeof thisPad){ continue; }
					if(thisPad==null)              { continue; }
					if(!thisPad)                   { continue; }
					thisPad.active=0;
				}

				// Do we swap the gamepad order?
				if(emu.gamepads.swapGamepads==1){
					src_gamepads = src_gamepads.reverse();
				}

				// Create the data for new gamepads or update the gamepad key on the known gamepads.
				for(let i=0; i<src_gamepads.length; i+=1){
					let thisPad = src_gamepads[i];

					try{ thisPad.index; }
					catch(e){ console.log(i, "ERROR:", e); continue;}

					// NEW GAMEPAD: Is this an unconfigured gamepad? Configure it.
					if(
						!emu.gamepads.gamepads[thisPad.index] && // No data entry at this index.
						thisPad.id                               // And the src has data.
					){
						let newMapping=undefined;
						let map_obj  = emu.gamepads.generateGamepadKey(thisPad);
						let map_key  = map_obj.map_key;
						let map_name = map_obj.name;

						// console.log(emu.gamepads.generateGamepadKey(thisPad));

						// Find the gamepad mapping:
						if( emu.gamepads.gp_config_mappings.hasOwnProperty(map_key) !=-1){
							// Assign the map.
							newMapping=emu.gamepads.gp_config_mappings[map_key];
						}

						// We don't already have a mapping for this gamepad. Did the user load a mapping?
						if(newMapping==undefined){
							// Cannot use this gamepad. A map must be created for it first.

							// Which gamepad would this be?
							let p1=emu.gamepads.gamepads.filter(function(d,i,a){ return d.player==1; });
							let p2=emu.gamepads.gamepads.filter(function(d,i,a){ return d.player==2; });

							// console.log(
							// 	"p1 found:", p1.length?"true ":"false",
							// 	"p2 found:", p2.length?"true ":"false",
							// );

							if   (!p1.length && emu.gamepads.p1_needs_mapping==false){
								// console.log("Player 1 gamepad needs mapping.");
								emu.gamepads.p1_needs_mapping=true;
								emu.vars.dom.view["gamepadIcon_container_p1"].classList.remove("neverConnected");
								emu.vars.dom.view["gamepadIcon_container_p1"].classList.add("known");
								emu.vars.dom.view["gamepadIcon_container_p1"].classList.add("unconfigured");
								emu.vars.dom.view["gamepadIcon_container_p1"].classList.remove("connected");
							}
							// else if(thisPad.index==1){
							if(!p2.length && emu.gamepads.p2_needs_mapping==false){
								// console.log("Player 2 gamepad needs mapping.");
								emu.gamepads.p2_needs_mapping=true;
								emu.vars.dom.view["gamepadIcon_container_p2"].classList.remove("neverConnected");
								emu.vars.dom.view["gamepadIcon_container_p2"].classList.add("known");
								emu.vars.dom.view["gamepadIcon_container_p2"].classList.add("unconfigured");
								emu.vars.dom.view["gamepadIcon_container_p2"].classList.remove("connected");
							}

							// Visually indicate this is unconfigured.
							// gamepadIcon_container_p1 .classList.add("unconfigured");
						}
						else{
							// Add the new gamepad.
							emu.gamepads.gamepads[ thisPad.index ] = {
								"gamepad"       : thisPad   ,
								"btnMap"        : newMapping,
								"btnPrev"       : 0         ,
								"lastTimestamp" : 0         ,
								"active"        : 1         ,
								"prevActive"    : 1         ,
							};

							let newPlayerNumber = undefined;

							// Configure the displayed gamepad statuses.
							if      (emu.gamepads.totalNumGamepadsReady==0){
								emu.gamepads.gamepad_p1_isSet=1;
								emu.gamepads.gamepads[ thisPad.index ].player=0;
								emu.gamepads.totalNumGamepadsReady++;
								newPlayerNumber=1;
								emu.gamepads.p1_needs_mapping=false;
								emu.vars.dom.view["gamepadIcon_container_p1"].title = map_name + " ("+map_key+", Index:"+thisPad.index+", Player "+newPlayerNumber+")";
								emu.vars.dom.view["gamepadIcon_container_p1"].classList.remove("neverConnected");
								emu.vars.dom.view["gamepadIcon_container_p1"].classList.add("known");
								emu.vars.dom.view["gamepadIcon_container_p1"].classList.remove("unconfigured");
								emu.vars.dom.view["gamepadIcon_container_p1"].classList.add("connected");
							}
							else if (emu.gamepads.totalNumGamepadsReady==1){
								emu.gamepads.gamepad_p2_isSet=1;
								emu.gamepads.gamepads[ thisPad.index ].player=1;
								emu.gamepads.totalNumGamepadsReady++;
								newPlayerNumber=2;
								emu.gamepads.p2_needs_mapping=false;
								emu.vars.dom.view["gamepadIcon_container_p2"].title = map_name + " ("+map_key+", Index:"+thisPad.index+", Player "+newPlayerNumber+")";
								emu.vars.dom.view["gamepadIcon_container_p2"].classList.remove("neverConnected");
								emu.vars.dom.view["gamepadIcon_container_p2"].classList.add("known");
								emu.vars.dom.view["gamepadIcon_container_p2"].classList.remove("unconfigured");
								emu.vars.dom.view["gamepadIcon_container_p2"].classList.add("connected");
							}

							console.log(
								"Gamepad found!",
								"||| Index:"  , thisPad.index   ,
								"||| Player:" , newPlayerNumber ,
								"||| id:"     , thisPad.id      ,
								"||| map_key:", map_key         ,
								" |||"
							);

						}
					}

					// UPDATE GAMEPAD: Existing gamepad: Update the gamepad data key and make sure that the cached data already exists.
					// else if( emu.gamepads.gamepads[thisPad.id]){
					else if( emu.gamepads.gamepads[thisPad.index] ){
						// console.log("Updating existing gamepad!", emu.gamepads.gamepads[i].btnPrev);
						emu.gamepads.gamepads[ thisPad.index ].gamepad = src_gamepads[i];

						// console.log("setting as active!");
						emu.gamepads.gamepads[ thisPad.index ].active = 1;
						emu.gamepads.gamepads[ thisPad.index ].prevActive = 1;

						// Configure the displayed gamepad statuses.
						if   (thisPad.index==0){
							emu.vars.dom.view["gamepadIcon_container_p1"].classList.remove("neverConnected");
							emu.vars.dom.view["gamepadIcon_container_p1"].classList.add("known");
							emu.vars.dom.view["gamepadIcon_container_p1"].classList.remove("unconfigured");
							emu.vars.dom.view["gamepadIcon_container_p1"].classList.add("connected");
						}
						else if(thisPad.index==1){
							emu.vars.dom.view["gamepadIcon_container_p2"].classList.remove("neverConnected");
							emu.vars.dom.view["gamepadIcon_container_p2"].classList.add("known");
							emu.vars.dom.view["gamepadIcon_container_p2"].classList.remove("unconfigured");
							emu.vars.dom.view["gamepadIcon_container_p2"].classList.add("connected");
						}

					}

				}

				// Find the known gamepads that are still set as active 0.
				for(let i=0; i<emu.gamepads.gamepads.length; i+=1){

					let thisPad=emu.gamepads.gamepads[i];

					if(thisPad==undefined)         { continue; }
					if("undefined"==typeof thisPad){ continue; }
					if(thisPad==null)              { continue; }
					if(!thisPad)                   { continue; }

					// console.log("thisPad:", "index:", thisPad.gamepad.index, "active:", thisPad.active);

					if( thisPad.prevActive && thisPad.active==0 ){
						// console.log("gamepad active 0");
						// Configure the displayed gamepad statuses.
						if   (thisPad.gamepad.index==0){
							// console.log("Adjust player1");
							emu.vars.dom.view["gamepadIcon_container_p1"].classList.remove("neverConnected");
							emu.vars.dom.view["gamepadIcon_container_p1"].classList.add("known");
							emu.vars.dom.view["gamepadIcon_container_p1"].classList.remove("unconfigured");
							emu.vars.dom.view["gamepadIcon_container_p1"].classList.remove("connected");
							thisPad.prevActive=0;
						}
						else if(thisPad.gamepad.index==1){
							// console.log("Adjust player2");
							emu.vars.dom.view["gamepadIcon_container_p2"].classList.remove("neverConnected");
							emu.vars.dom.view["gamepadIcon_container_p2"].classList.add("known");
							emu.vars.dom.view["gamepadIcon_container_p2"].classList.remove("unconfigured");
							emu.vars.dom.view["gamepadIcon_container_p2"].classList.remove("connected");
							thisPad.prevActive=0;
						}
					}
				}

				// Determine which previously connected gamepads are still connected.
				// Update that status on the known gamepad entry.
				// Get a list of index values provided by src_gamepads.
				// let src_ids   = src_gamepads.map(function(d,i,a){ return d.index; }).filter(emu.funcs.shared.removeUndefines);
				// Get a list of index values provided by emu.gamepads.gamepads.
				// let known_ids = emu.gamepads.gamepads.map(function(d,i,a){ return d.gamepad.index; }).filter(emu.funcs.shared.removeUndefines);

				// console.log(
				// 	"Known gamepads        :", emu.gamepads.gamepads.length, emu.gamepads.gamepads,
				// 	"Gamepads found in poll:", src_gamepads.length, src_gamepads
				// );
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

		// Go through the gamepad list.
		for(let i=0; i<emu.gamepads.gamepads.length; i+=1){
			// Only two gamepads are allowed for now.
			// if(i>1){ break; }

			// Is this gamepad in a valid and connected state? If not, then skip it.
			if("undefined"==typeof emu.gamepads.gamepads[i]){ continue; }
			if(emu.gamepads.gamepads[i]==null)              { continue; }
			if(!emu.gamepads.gamepads[i])                   { continue; }

			// console.log(emu.gamepads.gamepads[i], emu.gamepads.gamepads);

			// Get a handle to this gamepad.
			let padIndex = emu.gamepads.gamepads[i].gamepad.index;
			let thisPad   = emu.gamepads.gamepads[ padIndex ] ;

			// Which player uses this gamepad?
			let playerNumber = thisPad.player;

			if([0,1].indexOf(playerNumber) == -1){
				// console.log("Only two players are supported.");
				continue;
			}

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
			// sendNewKey(i, btnPressed, btnReleased);
			sendNewKey(playerNumber, btnPressed, btnReleased);
		}

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