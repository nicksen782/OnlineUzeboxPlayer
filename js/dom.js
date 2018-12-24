emu.funcs.domHandleCache_populate = function(){
	emu.vars.dom.view = {};

	// Test data load.
	emu.vars.dom.view["builtInGames_select"]           = document.querySelector("#emu_builtInGames_select");
	// Hidden file upload button.
	emu.vars.dom.view["emu_FilesFromUser"]             = document.querySelector("#emu_FilesFromUser");
	// Visible upload button.
	emu.vars.dom.view["emu_FilesFromUser_viewableBtn"] = document.querySelector("#emu_FilesFromUser_viewableBtn");
	// emscripten_iframe_container
	emu.vars.dom.view["emscripten_iframe_container"]  = document.querySelector("#emscripten_iframe_container");

	// User JSON load.
	emu.vars.dom.view["emu_FilesFromJSON"]  = document.querySelector("#emu_FilesFromJSON");
	emu.vars.dom.view["emu_FilesFromJSON_load"]  = document.querySelector("#emu_FilesFromJSON_load");

	// Emulator Controls.
	emu.vars.dom.view["emuControls_stop"]      = document.querySelector("#emuControls_stop")  ;
	emu.vars.dom.view["emuControls_reload"]    = document.querySelector("#emuControls_reload");
	emu.vars.dom.view["emuControls_unload"]    = document.querySelector("#emuControls_unload");
	emu.vars.dom.view["emuControls_autopause_chk"] = document.querySelector("#emuControls_autopause_chk");
	emu.vars.dom.view["emuControls_autopause_btn"] = document.querySelector("#emuControls_autopause_btn");

	emu.vars.dom.view["emuCanvas"]                 = document.querySelector("#emuCanvas");

	emu.vars.dom.view["emuControls_QUALITY"] = document.querySelector("#emuControls_QUALITY");
	emu.vars.dom.view["emuControls_DEBUG"]   = document.querySelector("#emuControls_DEBUG");
	emu.vars.dom.view["emuControls_FLICKER"] = document.querySelector("#emuControls_FLICKER");
	emu.vars.dom.view["emuControls_PAUSE"]   = document.querySelector("#emuControls_PAUSE");
	emu.vars.dom.view["emuControls_STEP"]    = document.querySelector("#emuControls_STEP");

	emu.vars.dom.view["emuGamepad_1_key_Q"]      = document.querySelector("#emuGamepad_1_key_Q") ;
	emu.vars.dom.view["emuGamepad_1_key_W"]      = document.querySelector("#emuGamepad_1_key_W") ;
	emu.vars.dom.view["emuGamepad_1_key_A"]      = document.querySelector("#emuGamepad_1_key_A") ;
	emu.vars.dom.view["emuGamepad_1_key_S"]      = document.querySelector("#emuGamepad_1_key_S") ;
	emu.vars.dom.view["emuGamepad_1_key_ENTER"]  = document.querySelector("#emuGamepad_1_key_ENTER") ;
	emu.vars.dom.view["emuGamepad_1_key_SPACE"]  = document.querySelector("#emuGamepad_1_key_SPACE") ;
	emu.vars.dom.view["emuGamepad_1_key_UP"]     = document.querySelector("#emuGamepad_1_key_UP") ;
	emu.vars.dom.view["emuGamepad_1_key_DOWN"]   = document.querySelector("#emuGamepad_1_key_DOWN") ;
	emu.vars.dom.view["emuGamepad_1_key_LEFT"]   = document.querySelector("#emuGamepad_1_key_LEFT") ;
	emu.vars.dom.view["emuGamepad_1_key_RIGHT"]  = document.querySelector("#emuGamepad_1_key_RIGHT") ;
	emu.vars.dom.view["emuGamepad_1_key_LSHIFT"] = document.querySelector("#emuGamepad_1_key_LSHIFT") ;
	emu.vars.dom.view["emuGamepad_1_key_RSHIFT"] = document.querySelector("#emuGamepad_1_key_RSHIFT") ;

	emu.vars.dom.view["emuGamepad_2_key_Q"]      = document.querySelector("#emuGamepad_2_key_Q") ;
	emu.vars.dom.view["emuGamepad_2_key_W"]      = document.querySelector("#emuGamepad_2_key_W") ;
	emu.vars.dom.view["emuGamepad_2_key_A"]      = document.querySelector("#emuGamepad_2_key_A") ;
	emu.vars.dom.view["emuGamepad_2_key_S"]      = document.querySelector("#emuGamepad_2_key_S") ;
	emu.vars.dom.view["emuGamepad_2_key_ENTER"]  = document.querySelector("#emuGamepad_2_key_ENTER") ;
	emu.vars.dom.view["emuGamepad_2_key_SPACE"]  = document.querySelector("#emuGamepad_2_key_SPACE") ;
	emu.vars.dom.view["emuGamepad_2_key_UP"]     = document.querySelector("#emuGamepad_2_key_UP") ;
	emu.vars.dom.view["emuGamepad_2_key_DOWN"]   = document.querySelector("#emuGamepad_2_key_DOWN") ;
	emu.vars.dom.view["emuGamepad_2_key_LEFT"]   = document.querySelector("#emuGamepad_2_key_LEFT") ;
	emu.vars.dom.view["emuGamepad_2_key_RIGHT"]  = document.querySelector("#emuGamepad_2_key_RIGHT") ;
	emu.vars.dom.view["emuGamepad_2_key_LSHIFT"] = document.querySelector("#emuGamepad_2_key_LSHIFT") ;
	emu.vars.dom.view["emuGamepad_2_key_RSHIFT"] = document.querySelector("#emuGamepad_2_key_RSHIFT") ;


};

emu.funcs.domHandleCache_populate_UAM = function(){
	if( emu.vars.originUAM == true ){
		emu.vars.dom.debug1 = {};
		emu.vars.dom.debug2 = {};
		emu.vars.dom.db = {};

		// UAM DOM: VIEW
		// UAM JSON load.
		emu.vars.dom.view["emu_FilesFromJSON_UAM"]       = document.querySelector("#emu_FilesFromJSON_UAM");
		emu.vars.dom.view["emu_FilesFromJSON_UAM_load"]  = document.querySelector("#emu_FilesFromJSON_UAM_load");

		// UAM game select menu.
		emu.vars.dom.view["emu_gameSelect_UAM_select"]   = document.querySelector("#emu_gameSelect_UAM_select");

		// UAM compile options.
		emu.vars.dom.view["emu_compileOptions_UAM_chk1"] = document.querySelector("#emu_compileOptions_UAM_chk1");
		emu.vars.dom.view["emu_compileOptions_UAM_chk2"] = document.querySelector("#emu_compileOptions_UAM_chk2");
		emu.vars.dom.view["emu_compileOptions_UAM_chk3"] = document.querySelector("#emu_compileOptions_UAM_chk3");
		emu.vars.dom.view["emu_compileOptions_UAM_chk4"] = document.querySelector("#emu_compileOptions_UAM_chk4");

		// UAM Compile/C2BIN actions.
		emu.vars.dom.view["emu_compile_UAM"] = document.querySelector("#emu_compile_UAM");
		emu.vars.dom.view["emu_c2bin_UAM"]   = document.querySelector("#emu_c2bin_UAM");
		emu.vars.dom.view["emu_c2bin2_UAM"]  = document.querySelector("#emu_c2bin2_UAM");

		// UAM compile output texts
		emu.vars.dom.view["emu_latestCompile"]   = document.querySelector("#emu_latestCompile");
		emu.vars.dom.view["emu_previousCompile"] = document.querySelector("#emu_previousCompile");

		emu.vars.dom.debug1["output"] = document.querySelector("#emu_debug1_output1 .output");
		emu.vars.dom.debug2["output"] = document.querySelector("#emu_debug1_output2 .output");
	}
}

