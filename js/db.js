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

emu.funcs.db     = {
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

		// New game.
		emu.vars.dom.db["gameSelect_create"].addEventListener("click", function() {
			emu.funcs.db.gameDb_newGame();
		}, false);

		// Delete game.
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

function getDataFromUzeboxGamesAndDemos(){
	var formData = {
		"o": "getDataFromUzeboxGamesAndDemos",
		"_config": { "processor": "emu_p.php" }
	};
	var prom1 = emu.funcs.shared.serverRequest(formData).then(
		function(res){
			let doc = new DOMParser().parseFromString(res.data, 'text/html');

			var rows = doc.querySelector("#bodyContent table").querySelectorAll("tr");

			var data = [];

			for(var i=0; i<rows.length; i+=1){
				if(i==0){continue;}
				let thisrow=rows[i];
				let td0=thisrow.querySelectorAll("td")[0];
				let td1=thisrow.querySelectorAll("td")[1];
				let td2=thisrow.querySelectorAll("td")[2];
				let td3=thisrow.querySelectorAll("td")[3];
				let td4=thisrow.querySelectorAll("td")[4];

				let wikilink = td1.querySelector("a").href;
				let gamename = td1.querySelector("a").innerText;
				let genre = td2.innerHTML;
				let author = td3.innerHTML;
				let status = td4.innerHTML;

				data.push({
					"wikilink": wikilink,
					"gamename": gamename,
					"genre   ": genre   ,
					"author  ": author  ,
					"status  ": status  ,
				});

			}

			console.log( data );
			// console.log( (data.sort(function(a, b) {
			// 	if(a.author < b.author) { return -1; }
			// 	if(a.author > b.author) { return 1; }
			// 	return 0;
			// }))) ;

		}, emu.funcs.shared.rejectedPromise);
	return prom1;
}