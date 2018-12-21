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

	// Emulator Controls.
	emu.vars.dom.view["emuControls_stop"]      = document.querySelector("#emuControls_stop")  ;
	emu.vars.dom.view["emuControls_reload"]    = document.querySelector("#emuControls_reload");
	emu.vars.dom.view["emuControls_unload"]    = document.querySelector("#emuControls_unload");
	emu.vars.dom.view["emuControls_autopause"] = document.querySelector("#emuControls_autopause");

	// emu.vars.dom.view["emuControls_autopause"] = document.querySelector("#emuControls_autopause");
	// emu.vars.dom.view["emuControls_autopause"] = document.querySelector("#emuControls_autopause");
	// emu.vars.dom.view["emuControls_autopause"] = document.querySelector("#emuControls_autopause");
	// emu.vars.dom.view["emuControls_autopause"] = document.querySelector("#emuControls_autopause");
	// emu.vars.dom.view["emuControls_autopause"] = document.querySelector("#emuControls_autopause");
};

emu.funcs.domHandleCache_populate_UAM = function(){
	if( emu.vars.originUAM == true ){
		// console.log("domHandleCache_populate_UAM");
		// UAM DOM: INPUT
		// emu.vars.dom.input.uam_refreshGameList = document.querySelector("#gc3_input_uam_refreshGameList")  ;
	}
}

