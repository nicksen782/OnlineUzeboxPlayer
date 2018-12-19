emu.funcs.domHandleCache_populate = function(){
	emu.vars.dom.view       = {
		// Test data load.
		 "builtInGames_select"      : document.querySelector("#emu_builtInGames_select")
	};

};

emu.funcs.domHandleCache_populate_UAM = function(){
	if( emu.vars.originUAM == true ){
		// console.log("domHandleCache_populate_UAM");
		// UAM DOM: INPUT
		// emu.vars.dom.input.uam_refreshGameList = document.querySelector("#gc3_input_uam_refreshGameList")  ;
	}
}

