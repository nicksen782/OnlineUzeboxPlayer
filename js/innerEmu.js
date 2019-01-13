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

// * Object that contains the flags/functions for the Emscripten instance.
emu.vars.innerEmu = {
	// * Contains the active Emscripten instance.
	Module                  : { },
	// * Indicates if the Emscripten instance has finished loading.
	emulatorIsReady         : false,
	// * Indicates that the Emscripten instance should not load until some user input (mousemove on the emu canvas.)
	startEmuAfterUserInput  : false,
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
			function(){
				// Reset the previous state of GUICORE_SMALL back to default.
				emu.vars.prev_GUICORE_SMALL=true;
			}
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

				// console.log("Loaded eeprom.bin from localStorage.");
				emu.funcs.shared.textOnCanvas2({"text":"Loaded EEPROM"});

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
				// Don't pause if the auto-pause checkbox is checked.
				if (
					emu.vars.dom.view["emuControls_autopause_chk"].classList.contains("enabled") &&
					(
						emu.vars.dom.view["emu_misc_gamepads"]   .classList.contains("hovered") ||
						emu.vars.dom.view["emu_emulator_window"] .classList.contains("hovered")
					)
				) {
					setTimeout(function(){ emu.funcs.emu_focusing(null, "mouseenter"); }, 2000);
				}
				else{
					setTimeout(function(){ emu.funcs.emu_focusing(null, "mouseleave"); }, 2000);
				}
			}

			// Enable or disable the CUzeBox debug mode.
			,function(){
				// If this is NOT a UAM instance then auto-click the debug button which should turn off the debug bars.
				if(
					emu.vars.originUAM
					&& emu.vars.UAM_active
					// && emu.vars.UAMDATA.permKeys.indexOf("emu_canCompile")!=-1
				){
					// if(emu.vars.UAMDATA.permKeys.indexOf("emu_canCompile")!=-1 ){
					setTimeout(function(){
						emu.vars.innerEmu.emu_sendKeyEvent("keydown", "key_F3" , 1);
						emu.vars.innerEmu.emu_sendKeyEvent("keyup", "key_F3" , 1);
						emu.vars.innerEmu.displayCUzeBox_flags();
					}, 50);
				}
			}
		];
		this["printErr"]  = function(text) {
			if (arguments.length > 1) { text = Array.prototype.slice.call(arguments).join(' '); }
			console.error(text);
		};
	},
	// * Resizes the emu canvas to fit in its container.
	resizeEmuCanvas         : function(){
		var canvas        = emu.vars.dom.view["emuCanvas"];
		var Container     = document.querySelector("#emscripten_emu_container");
		var ContainerDims = Container.getBoundingClientRect();
		var newDims       = emu.funcs.shared.calculateAspectRatioFit(
			canvas.width,
			canvas.height,
			ContainerDims.width,
			ContainerDims.height
		);

		canvas.style.width  = newDims.width  +"px";
		canvas.style.height = newDims.height +"px";
	},
	// * Runs after the Emscripten instance is fully loaded. Sets flags, resizes the emu canvas.
	emuIsReady              : function(){
		emu.vars.innerEmu.emulatorIsReady = true;
		emu.vars.gameAllowedToLoad        = true;
		emu.vars.innerEmu.resizeEmuCanvas();
		emu.vars.innerEmu.displayCUzeBox_flags();

		// Start the gamepad polling if it was running previously.
		if(emu.gamepads.prev_pollState==true){
			// console.log("Gamepads were disabled. Enabling them now.");
			emu.gamepads.prev_pollState=false;
			emu.gamepads.enabled=false;
			emu.gamepads.init();
		}
	},
	// * Sends keyboard events to the Emscripten emulator.
	emu_sendKeyEvent        : function(type, key, gamePadNumber) {
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
			case "key_RALT"  : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "altKey": true, "charCode": 0, "code": "AltRight", "key": "Alt", "keyCode": 18, "which": 18, "location": 2 }); break; }
			case "key_F1"    : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F1", "key": "F1", "keyCode": 112, "which": 112, "location": 0 }); break; }
			case "key_F2"    : {
				newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F2", "key": "F2", "keyCode": 113, "which": 113, "location": 0 });
				setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 75);
				break;
			}
			case "key_F3"    : {
				newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F3", "key": "F3", "keyCode": 114, "which": 114, "location": 0 });
				setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 200);
				break;
			}
			case "key_F4"    : {
				newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F4", "key": "F4", "keyCode": 115, "which": 115, "location": 0 });
				setTimeout(function(){ emu.vars.innerEmu.resizeEmuCanvas(); }, 100);
				break;
			}
			case "key_F5"    : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F5"        , "key": "F5"        , "keyCode": 116, "which": 116, "location": 0 } ); break; }
			case "key_F6"    : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F6"        , "key": "F6"        , "keyCode": 117, "which": 117, "location": 0 } ); break; }
			case "key_F7"    : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F7"        , "key": "F7"        , "keyCode": 118, "which": 118, "location": 0 } ); break; }
			case "key_F8"    : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F8"        , "key": "F8"        , "keyCode": 119, "which": 119, "location": 0 } ); break; }
			case "key_F9"    : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F9"        , "key": "F9"        , "keyCode": 120, "which": 120, "location": 0 } ); break; }
			case "key_F10"   : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F10"       , "key": "F10"       , "keyCode": 121, "which": 121, "location": 0 } ); break; }
			case "key_F11"   : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F11"       , "key": "F11"       , "keyCode": 122, "which": 122, "location": 0 } ); break; }
			case "key_F12"   : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F12"       , "key": "F12"       , "keyCode": 123, "which": 123, "location": 0 } ); break; }
			case "key_Q"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "KeyQ"      , "key": "q"         , "keyCode": 81 , "which": 81 , "location": 0 } ); break; }
			case "key_W"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "KeyW"      , "key": "w"         , "keyCode": 87 , "which": 87 , "location": 0 } ); break; }
			case "key_A"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "KeyA"      , "key": "a"         , "keyCode": 65 , "which": 65 , "location": 0 } ); break; }
			case "key_S"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "KeyS"      , "key": "s"         , "keyCode": 83 , "which": 83 , "location": 0 } ); break; }
			case "key_ENTER" : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "Enter"     , "key": "Enter"     , "keyCode": 13 , "which": 13 , "location": 0 } ); break; }
			case "key_SPACE" : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "Space"     , "key": " "         , "keyCode": 32 , "which": 32 , "location": 0 } ); break; }
			case "key_UP"    : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ArrowUp"   , "key": "ArrowUp"   , "keyCode": 38 , "which": 38 , "location": 0 } ); break; }
			case "key_DOWN"  : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ArrowDown" , "key": "ArrowDown" , "keyCode": 40 , "which": 40 , "location": 0 } ); break; }
			case "key_LEFT"  : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ArrowLeft" , "key": "ArrowLeft" , "keyCode": 37 , "which": 37 , "location": 0 } ); break; }
			case "key_RIGHT" : { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ArrowRight", "key": "ArrowRight", "keyCode": 39 , "which": 39 , "location": 0 } ); break; }
			case "key_LSHIFT": { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ShiftLeft" , "key": "Shift"     , "keyCode": 16 , "which": 16 , "location": 1 } ); break; }
			case "key_RSHIFT": { newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ShiftRight", "key": "Shift"     , "keyCode": 16 , "which": 16 , "location": 2 } ); break; }
			default:
				{ break; }
		}

		// Dispatch the key event.
		if (newEvent) {
			let RALT_newEvent_UP   = window.crossBrowser_initKeyboardEvent("keyup"  , { "altKey": true, "charCode": 0, "code": "AltRight", "key": "Alt", "keyCode": 18, "which": 18, "location": 2 });
			let RALT_newEvent_DOWN = window.crossBrowser_initKeyboardEvent("keydown", { "altKey": true, "charCode": 0, "code": "AltRight", "key": "Alt", "keyCode": 18, "which": 18, "location": 2 });

			if(gamePadNumber==1){
				if     (type=="keydown"){
					target.dispatchEvent(RALT_newEvent_UP);
					target.dispatchEvent(newEvent);
					target.dispatchEvent(RALT_newEvent_UP);
				}
				else if(type=="keyup"){
					target.dispatchEvent(RALT_newEvent_UP);
					target.dispatchEvent(newEvent);
					target.dispatchEvent(RALT_newEvent_UP);
				}
			}
			// if gamePadNumber is 2 then also send the RALT.
			if(gamePadNumber==2){
				if     (type=="keydown"){
					target.dispatchEvent(RALT_newEvent_DOWN);
					target.dispatchEvent(newEvent);
					target.dispatchEvent(RALT_newEvent_UP);
				}
				else if(type=="keyup"){
					target.dispatchEvent(RALT_newEvent_DOWN);
					target.dispatchEvent(newEvent);
					target.dispatchEvent(RALT_newEvent_UP);
				}
			}

		}

		// Get the pressed key and show it on the on-screen gamepads.
		window.requestAnimationFrame( emu.vars.innerEmu.showPressedKey );

	},
	// * Allows the Emscripten instance to start. Used with Direct Play links since audio will not play unless initiated by user input.
	startAfterMouseClick    : function(){
		// Remove the temporary listener.
		emu.vars.dom.view["emuCanvas"].removeEventListener("mousedown", emu.vars.innerEmu.startAfterMouseClick, false);
		// Clear the flag.
		emu.vars.innerEmu.startEmuAfterUserInput=false;
		// File should already be downloaded. Now load the game.
		emu.funcs.loadGame();
	} ,
	// * Queries CUzeBox for and then displays the status of the active buttons. Uses _NRA_returnController
	showPressedKey          : function(){
		// A bit of delay is required otherwise the displayed gamepad states will not update properly.
		if( emu.vars.innerEmu.emulatorIsReady == false ) {
			// console.log("1 showPressedKey: The emu is not ready.");
			return;
		}

		setTimeout(function(){
			// Named constants.
			const BTN_B      = 1   ; // = ( 1<<0  ) ;
			const BTN_Y      = 2   ; // = ( 1<<1  ) ;
			const BTN_SELECT = 4   ; // = ( 1<<2  ) ;
			const BTN_START  = 8   ; // = ( 1<<3  ) ;
			const BTN_UP     = 16  ; // = ( 1<<4  ) ;
			const BTN_DOWN   = 32  ; // = ( 1<<5  ) ;
			const BTN_LEFT   = 64  ; // = ( 1<<6  ) ;
			const BTN_RIGHT  = 128 ; // = ( 1<<7  ) ;
			const BTN_A      = 256 ; // = ( 1<<8  ) ;
			const BTN_X      = 512 ; // = ( 1<<9  ) ;
			const BTN_SL     = 1024; // = ( 1<<10 ) ;
			const BTN_SR     = 2048; // = ( 1<<11 ) ;

			// Ask CUzeBox for the gamepad states.
			let p1_state   = ~emu.vars.innerEmu.Module._NRA_returnController(0) ;
			let p2_state   = ~emu.vars.innerEmu.Module._NRA_returnController(1) ;

			// console.log(p1_state.toString(2).padStart(16,"0"), p1_state.toString(2));
			// console.log(p2_state.toString(2).padStart(16,"0"), p2_state.toString(2));

			// Gamepad #1
			if( (p1_state) & (BTN_B     ) ? 1 : 0 ){emu.vars.dom.view["p1_key_A"]     .classList.add("active");} else{emu.vars.dom.view["p1_key_A"]     .classList.remove("active");}
			if( (p1_state) & (BTN_Y     ) ? 1 : 0 ){emu.vars.dom.view["p1_key_Q"]     .classList.add("active");} else{emu.vars.dom.view["p1_key_Q"]     .classList.remove("active");}
			if( (p1_state) & (BTN_SELECT) ? 1 : 0 ){emu.vars.dom.view["p1_key_SPACE"] .classList.add("active");} else{emu.vars.dom.view["p1_key_SPACE"] .classList.remove("active");}
			if( (p1_state) & (BTN_START ) ? 1 : 0 ){emu.vars.dom.view["p1_key_ENTER"] .classList.add("active");} else{emu.vars.dom.view["p1_key_ENTER"] .classList.remove("active");}
			if( (p1_state) & (BTN_UP    ) ? 1 : 0 ){emu.vars.dom.view["p1_key_UP"]    .classList.add("active");} else{emu.vars.dom.view["p1_key_UP"]    .classList.remove("active");}
			if( (p1_state) & (BTN_DOWN  ) ? 1 : 0 ){emu.vars.dom.view["p1_key_DOWN"]  .classList.add("active");} else{emu.vars.dom.view["p1_key_DOWN"]  .classList.remove("active");}
			if( (p1_state) & (BTN_LEFT  ) ? 1 : 0 ){emu.vars.dom.view["p1_key_LEFT"]  .classList.add("active");} else{emu.vars.dom.view["p1_key_LEFT"]  .classList.remove("active");}
			if( (p1_state) & (BTN_RIGHT ) ? 1 : 0 ){emu.vars.dom.view["p1_key_RIGHT"] .classList.add("active");} else{emu.vars.dom.view["p1_key_RIGHT"] .classList.remove("active");}
			if( (p1_state) & (BTN_A     ) ? 1 : 0 ){emu.vars.dom.view["p1_key_S"]     .classList.add("active");} else{emu.vars.dom.view["p1_key_S"]     .classList.remove("active");}
			if( (p1_state) & (BTN_X     ) ? 1 : 0 ){emu.vars.dom.view["p1_key_W"]     .classList.add("active");} else{emu.vars.dom.view["p1_key_W"]     .classList.remove("active");}
			if( (p1_state) & (BTN_SL    ) ? 1 : 0 ){emu.vars.dom.view["p1_key_LSHIFT"].classList.add("active");} else{emu.vars.dom.view["p1_key_LSHIFT"].classList.remove("active");}
			if( (p1_state) & (BTN_SR    ) ? 1 : 0 ){emu.vars.dom.view["p1_key_RSHIFT"].classList.add("active");} else{emu.vars.dom.view["p1_key_RSHIFT"].classList.remove("active");}

			// Gamepad #2
			if( (p2_state) & (BTN_B     ) ? 1 : 0 ){emu.vars.dom.view["p2_key_A"]     .classList.add("active");} else{emu.vars.dom.view["p2_key_A"]     .classList.remove("active");}
			if( (p2_state) & (BTN_Y     ) ? 1 : 0 ){emu.vars.dom.view["p2_key_Q"]     .classList.add("active");} else{emu.vars.dom.view["p2_key_Q"]     .classList.remove("active");}
			if( (p2_state) & (BTN_SELECT) ? 1 : 0 ){emu.vars.dom.view["p2_key_SPACE"] .classList.add("active");} else{emu.vars.dom.view["p2_key_SPACE"] .classList.remove("active");}
			if( (p2_state) & (BTN_START ) ? 1 : 0 ){emu.vars.dom.view["p2_key_ENTER"] .classList.add("active");} else{emu.vars.dom.view["p2_key_ENTER"] .classList.remove("active");}
			if( (p2_state) & (BTN_UP    ) ? 1 : 0 ){emu.vars.dom.view["p2_key_UP"]    .classList.add("active");} else{emu.vars.dom.view["p2_key_UP"]    .classList.remove("active");}
			if( (p2_state) & (BTN_DOWN  ) ? 1 : 0 ){emu.vars.dom.view["p2_key_DOWN"]  .classList.add("active");} else{emu.vars.dom.view["p2_key_DOWN"]  .classList.remove("active");}
			if( (p2_state) & (BTN_LEFT  ) ? 1 : 0 ){emu.vars.dom.view["p2_key_LEFT"]  .classList.add("active");} else{emu.vars.dom.view["p2_key_LEFT"]  .classList.remove("active");}
			if( (p2_state) & (BTN_RIGHT ) ? 1 : 0 ){emu.vars.dom.view["p2_key_RIGHT"] .classList.add("active");} else{emu.vars.dom.view["p2_key_RIGHT"] .classList.remove("active");}
			if( (p2_state) & (BTN_A     ) ? 1 : 0 ){emu.vars.dom.view["p2_key_S"]     .classList.add("active");} else{emu.vars.dom.view["p2_key_S"]     .classList.remove("active");}
			if( (p2_state) & (BTN_X     ) ? 1 : 0 ){emu.vars.dom.view["p2_key_W"]     .classList.add("active");} else{emu.vars.dom.view["p2_key_W"]     .classList.remove("active");}
			if( (p2_state) & (BTN_SL    ) ? 1 : 0 ){emu.vars.dom.view["p2_key_LSHIFT"].classList.add("active");} else{emu.vars.dom.view["p2_key_LSHIFT"].classList.remove("active");}
			if( (p2_state) & (BTN_SR    ) ? 1 : 0 ){emu.vars.dom.view["p2_key_RSHIFT"].classList.add("active");} else{emu.vars.dom.view["p2_key_RSHIFT"].classList.remove("active");}
		}, 25);
	},
	// * Clears the displayed pressed keys on the gamepad.
	clearDisplayedPressedKeys          : function(){
		// Gamepad #1
		emu.vars.dom.view["p1_key_A"]     .classList.remove("active");
		emu.vars.dom.view["p1_key_Q"]     .classList.remove("active");
		emu.vars.dom.view["p1_key_SPACE"] .classList.remove("active");
		emu.vars.dom.view["p1_key_ENTER"] .classList.remove("active");
		emu.vars.dom.view["p1_key_UP"]    .classList.remove("active");
		emu.vars.dom.view["p1_key_DOWN"]  .classList.remove("active");
		emu.vars.dom.view["p1_key_LEFT"]  .classList.remove("active");
		emu.vars.dom.view["p1_key_RIGHT"] .classList.remove("active");
		emu.vars.dom.view["p1_key_S"]     .classList.remove("active");
		emu.vars.dom.view["p1_key_W"]     .classList.remove("active");
		emu.vars.dom.view["p1_key_LSHIFT"].classList.remove("active");
		emu.vars.dom.view["p1_key_RSHIFT"].classList.remove("active");

		// Gamepad #2
		emu.vars.dom.view["p2_key_A"]     .classList.remove("active");
		emu.vars.dom.view["p2_key_Q"]     .classList.remove("active");
		emu.vars.dom.view["p2_key_SPACE"] .classList.remove("active");
		emu.vars.dom.view["p2_key_ENTER"] .classList.remove("active");
		emu.vars.dom.view["p2_key_UP"]    .classList.remove("active");
		emu.vars.dom.view["p2_key_DOWN"]  .classList.remove("active");
		emu.vars.dom.view["p2_key_LEFT"]  .classList.remove("active");
		emu.vars.dom.view["p2_key_RIGHT"] .classList.remove("active");
		emu.vars.dom.view["p2_key_S"]     .classList.remove("active");
		emu.vars.dom.view["p2_key_W"]     .classList.remove("active");
		emu.vars.dom.view["p2_key_LSHIFT"].classList.remove("active");
		emu.vars.dom.view["p2_key_RSHIFT"].classList.remove("active");
	},
	// * Toggles full screen on the emulator canvas.
	emuFullscreen           : function(){
		// The Emscripten way.
		// emu.vars.innerEmu.Module.requestFullscreen()

		// The standard way.
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
			if      (document.exitFullscreen         ) { document.exitFullscreen();          }
			else if (document.webkitFullscreenElement) { document.webkitFullscreenElement(); }
			else if (document.mozFullScreenElement   ) { document.mozFullScreenElement();    }
			else if (document.msFullscreenElement    ) { document.msFullscreenElement();     }
		}
	},
	// * Queries CUzeBox for and then displays the status of certain CUzeBox flags. Uses _NRA_returnFlags
	displayCUzeBox_flags    : function (){
		if( emu.vars.innerEmu.emulatorIsReady == false ) {
			// console.log("1 displayCUzeBox_flags: The emu is not ready.");
			return;
		}

		setTimeout(function(){
			// var flags = emu.vars.innerEmu.Module._guicore_getflags();

			let GUICORE_SMALL      = emu.vars.innerEmu.Module._NRA_returnFlags(3) ? true : false; // Small view or larger view
			let GUICORE_GAMEONLY   = emu.vars.innerEmu.Module._NRA_returnFlags(4) ? true : false; // Game-only or Debug
			let main_fmerge        = emu.vars.innerEmu.Module._NRA_returnFlags(5) ? true : false; // Flicker
			let main_ispause       = emu.vars.innerEmu.Module._NRA_returnFlags(6) ? true : false; // Pause
			let main_isadvfr       = emu.vars.innerEmu.Module._NRA_returnFlags(7) ? true : false; // Step
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

		},25);
	},
	// * Clears the displayed CUzeBox flags.
	clearDisplayedCUzeBox_flags    : function (){
		setTimeout(function(){
			emu.vars.dom.view["emuControls_QUALITY"].classList.remove('activated');
			emu.vars.dom.view["emuControls_DEBUG"]  .classList.remove('activated');
			emu.vars.dom.view["emuControls_FLICKER"].classList.remove('activated');
			emu.vars.dom.view["emuControls_PAUSE"]  .classList.remove('activated');
			emu.vars.dom.view["emuControls_STEP"]   .classList.remove('activated');

		},25);
	},
	// * Reloads the application and specifies the alternate Emscripten emu core.
	toggleCore              : function(){
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
	},

};