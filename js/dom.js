/* global featureDetection */
/* global gc */
/* global saveAs */
/* global JSZip */
/* global X2JS */
/* global performance */
/* global emu */

emu.funcs.domHandleCache_populate = function(){
	emu.vars.dom.views = {};
	emu.vars.dom.view = {};
	emu.vars.dom.gamepad = {};

	emu.vars.dom.gamepad["openBtn" ]                  = document.querySelector("#gamepadConfig_openBtn");
	emu.vars.dom.gamepad["closeBtn"]                  = document.querySelector("#gamepadConfig_closeBtn");

	emu.vars.dom.gamepad["gamepadConfigDiv"]          = document.querySelector("#gamepadConfigDiv");
	emu.vars.dom.gamepad["gamepadConfigDiv_mappings_P1"] = document.querySelector("#gamepadConfigDiv_mappings_P1");
	emu.vars.dom.gamepad["gamepadConfigDiv_mappings_P2"] = document.querySelector("#gamepadConfigDiv_mappings_P2");
	emu.vars.dom.gamepad["gp_cfg_setBtns"]            = document.querySelectorAll(".gp_cfg_set");

	emu.vars.dom.gamepad["gp1_status"]                = document.querySelector("#emu_gamepadConfig_P1_status");
	emu.vars.dom.gamepad["gp2_status"]                = document.querySelector("#emu_gamepadConfig_P2_status");
	emu.vars.dom.gamepad["gp1_setAll"]                = document.querySelector("#gp1_setAll");
	emu.vars.dom.gamepad["gp2_setAll"]                = document.querySelector("#gp2_setAll");

	emu.vars.dom.gamepad["saveChanges"]    = document.querySelector("#gpmap_saveChanges");
	emu.vars.dom.gamepad["download"]       = document.querySelector("#gpmap_download_maps");
	emu.vars.dom.gamepad["upload"]         = document.querySelector("#gpmap_upload_maps");


	// emu.vars.dom.gamepad[""  ] = document.querySelector("#");
	// emu.vars.dom.gamepad[""  ] = document.querySelector("#");

	// VIEWS:
	emu.vars.dom.views["view_VIEW"  ] = document.querySelector("#emu_view");
	emu.vars.dom.views["view_DEBUG1"] = document.querySelector("#emu_debug1");
	emu.vars.dom.views["view_DEBUG2"] = document.querySelector("#emu_debug2");
	emu.vars.dom.views["view_DB"    ] = document.querySelector("#emu_db");

	// emu_filesList_div
	emu.vars.dom.view["emu_filesList_div"]  = document.querySelector("#emu_filesList_div");

	// Misc views: nav buttons
	emu.vars.dom.view["emu_misc_navs"]  = document.querySelectorAll("#emu_misc_nav .emu_misc_navItem");
	// Misc views: all views
	emu.vars.dom.view["emu_misc_view"]             = document.querySelectorAll(".emu_misc_view");

	// Misc views: individual views
	emu.vars.dom.view["emu_misc_gamepads"]         = document.querySelector(".emu_misc_gamepads");
	emu.vars.dom.view["emu_misc_info"]             = document.querySelector(".emu_misc_info");
	emu.vars.dom.view["emu_misc_misc"]             = document.querySelector(".emu_misc_misc");

	// Built-in games (non-UAM)
	emu.vars.dom.view["builtInGames_select"]           = document.querySelector("#emu_builtInGames_select");
	// Hidden file upload button.
	emu.vars.dom.view["emu_FilesFromUser"]             = document.querySelector("#emu_FilesFromUser");
	// Visible upload button.
	emu.vars.dom.view["emu_FilesFromUser_viewableBtn"] = document.querySelector("#emu_FilesFromUser_viewableBtn");
	// emscripten_emu_container
	emu.vars.dom.view["emscripten_emu_container"]  = document.querySelector("#emscripten_emu_container");

	// emuCanvas
	emu.vars.dom.view["emuCanvas"]  = document.querySelector("#emuCanvas");

	// emu_emulator
	emu.vars.dom.view["emu_emulator_window"]  = document.querySelector("#emu_emulator");

	// Gamepads
	emu.vars.dom.view["emu_misc_gamepads"]  = document.querySelector("#emu_misc_gamepads");

	// User JSON load.
	emu.vars.dom.view["emu_FilesFromJSON"]  = document.querySelector("#emu_FilesFromJSON");
	emu.vars.dom.view["emu_FilesFromJSON_load"]  = document.querySelector("#emu_FilesFromJSON_load");

	// Emulator Controls.
	emu.vars.dom.view["emuControls_stop"]      = document.querySelector("#emuControls_stop")  ;
	emu.vars.dom.view["emuControls_resize"]    = document.querySelector("#emuControls_resize")  ;
	emu.vars.dom.view["emuControls_reload"]    = document.querySelector("#emuControls_reload");
	emu.vars.dom.view["emuControls_unload"]    = document.querySelector("#emuControls_unload");
	emu.vars.dom.view["emuControls_rotate"]    = document.querySelector("#emuControls_rotate");
	emu.vars.dom.view["emuControls_autopause_chk"] = document.querySelector("#emuControls_autopause_chk");
	emu.vars.dom.view["emuControls_autopause_btn"] = document.querySelector("#emuControls_autopause_btn");

	emu.vars.dom.view["emuControls_QUALITY"] = document.querySelector("#emuControls_QUALITY");
	emu.vars.dom.view["emuControls_DEBUG"]   = document.querySelector("#emuControls_DEBUG");
	emu.vars.dom.view["emuControls_FLICKER"] = document.querySelector("#emuControls_FLICKER");
	emu.vars.dom.view["emuControls_PAUSE"]   = document.querySelector("#emuControls_PAUSE");
	emu.vars.dom.view["emuControls_STEP"]    = document.querySelector("#emuControls_STEP");
	emu.vars.dom.view["emuControls_FULLSCREEN"]    = document.querySelector("#emuControls_FULLSCREEN");

};

emu.funcs.domHandleCache_populate_UAM = function(){
	if( emu.vars.originUAM == true ){
		emu.vars.dom.debug1 = {};
		emu.vars.dom.debug2 = {};
		emu.vars.dom.db     = {};

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

		// UAM DOM: DEBUG1
		emu.vars.dom.debug1["output"] = document.querySelector("#emu_debug1_output1 .output");

		// UAM DOM: DEBUG2
		emu.vars.dom.debug2["output"] = document.querySelector("#emu_debug2_output1 .output");

		// UAM DOM: DB
		emu.vars.dom.db["gameSelect"]            = document.querySelector("#db_gameSelect"           );
		emu.vars.dom.db["gameSelect_load"]       = document.querySelector("#db_gameSelect_load"      );
		emu.vars.dom.db["gameSelect_update"]       = document.querySelector("#db_gameSelect_update"  );
		emu.vars.dom.db["gameSelect_create"]       = document.querySelector("#db_gameSelect_create"  );
		emu.vars.dom.db["gameSelect_delete"]       = document.querySelector("#db_gameSelect_delete"  );
		emu.vars.dom.db["dataFields_table"]      = document.querySelector("#db_dataFields_table"     );

		emu.vars.dom.db["dataField_title"]       = document.querySelector("#db_dataField_title"      );
		emu.vars.dom.db["dataField_authors"]     = document.querySelector("#db_dataField_authors"    );
		emu.vars.dom.db["dataField_status"]      = document.querySelector("#db_dataField_status"     );
		emu.vars.dom.db["dataField_addedBy"]     = document.querySelector("#db_dataField_addedBy"    );
		emu.vars.dom.db["dataField_gameid"]      = document.querySelector("#db_dataField_gameid"     );
		emu.vars.dom.db["dataField_gameDir"]     = document.querySelector("#db_dataField_gameDir"    );
		emu.vars.dom.db["dataField_whenAdded"]   = document.querySelector("#db_dataField_whenAdded"  );
		emu.vars.dom.db["dataField_gameFile"]    = document.querySelector("#db_dataField_gameFile"   );
		emu.vars.dom.db["dataField_gameFiles"]   = document.querySelector("#db_dataField_gameFiles"  );
		emu.vars.dom.db["dataField_description"] = document.querySelector("#db_dataField_description");

		emu.vars.dom.db["db_files_included"]     = document.querySelector("#emu_db_files_included");
		emu.vars.dom.db["db_files_allInDir"]     = document.querySelector("#emu_db_files_allInDir");

		// Hidden file upload button.
		emu.vars.dom.db["db_builtInGames_fileUpload"]         = document.querySelector("#db_builtInGames_fileUpload");
		// Visible upload button.
		emu.vars.dom.db["db_builtInGames_fileUpload_visible"] = document.querySelector("#db_builtInGames_fileUpload_visible");

	}
}

