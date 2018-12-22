/*jshint sub:true*/
/*jshint laxcomma:true*/
/*jslint bitwise: true */
/*jslint for: true */
/*jslint long: true */
/*jslint single: true */
/*jslint white: true */
/*jslint multivar: false */

/*jshint -W069 */

// /* global featureDetection */
// /* global gc */
// /* global saveAs */
// /* global JSZip */
// /* global X2JS */
// /* global performance */

// anthonybrown/JSLint Options Descriptions
// https://gist.github.com/anthonybrown/9526822

"use strict";

var emu                   = {

};
emu.vars                  = {
	originUAM:false,
	dom : {},
	// uamwindow
	// user_id
	// UAMisReady
	emu_statuses : [
		'NO CATEGORY', // 0
		'Demo',        // 1
		'WIP',         // 2
		'Complete',    // 3
		'UCC2013',     // 4
		'UCC2014',     // 5
		'UCC2016',     // 6
		'UCC2018',     // 7
		'RESERVED',    // 8
	],
	gameFiles  : [] ,
	gameFile   : "" ,
	gameTitle  : "" ,
	baseURL    : "" ,
	iframeHTML : ""
};
emu.funcs                 = {
	/*
		WELCOME
		Downloading files.
		Loading files
		GAME
		Stop emu
		Reload emu
		Unload emu
	*/
	drawTextMessageOnEmuCanvas : function(text){
		// void ctx.fillRect(x, y, width, height);

		// Clear, then draw the text.
		var canvas = emu.vars.dom.view["emuCanvas"];
		canvas.getContext("2d").clearRect(0,0, canvas.width, canvas.height);

		canvas.getContext("2d").fillStyle = 'green';
		canvas.getContext("2d").fillRect(10, 10, 10, 10);

		// https://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
	},
	changeEmuSRC           : function(src, messageText){
		var emscripten_iframe = document.querySelector("#emscripten_iframe");
		// Is there an iframe there?
		if(null==emscripten_iframe){
			// console.log("No iframe here!");
			return;
		}
		else{
			// Create iframe.
			var newIframe = document.createElement('iframe');

			// Remove frameborder
			newIframe.setAttribute("frameBorder", "0");

			// Set id to emscripten_iframe.
			newIframe.id = "emscripten_iframe";

			// Get handle on the container for the iframe.
			var container = document.querySelector('#emscripten_iframe_container');

			newIframe.src=src;

			// Remove the existing iframe.
			document.querySelector('#emscripten_iframe').remove();

			newIframe.onload=function(){
				newIframe.onload=null;
				// console.log("newIframe.contentDocument:", newIframe.contentDocument);
				newIframe.contentDocument.querySelector("#MESSAGE").innerHTML = messageText;
			};

			// Append the iframe to the container.
			container.appendChild(newIframe);

		}
	},
	stopEmu                : function(){
		// This just changes the src of the iframe which drops it's data.
		// It can be resumed if emu.iframeHTML is populated correctly.
		if(emu.vars.gameFiles.length){
			let messageText = "The emulator has been stopped. You can restart the loaded game by pressing the \"RELOAD\" button.";
			emu.funcs.changeEmuSRC("iframe_msg_template.html", messageText);
		}
		else{
			return;
		}
		// emu.emu_setStatus('Stopped');
	},
	emu_reset              : function(){
		// Stop the emulator if it is active.
		// let messageText = "Choose a game.";
		let messageText = "";
		emu.funcs.changeEmuSRC("iframe_msg_template.html", messageText);

		// Reset.
		emu.vars.gameFiles  = [] ;
		emu.vars.gameFile   = "" ;
		emu.vars.gameTitle  = "" ;
		emu.vars.baseURL    = "" ;
		// emu.vars.iframeHTML = "" ;
	},
	emu_resetFull          : function(){
		// Stop the emulator if it is active.
		let messageText = "The emulator data has been cleared.";
		emu.funcs.changeEmuSRC("iframe_msg_template.html", messageText);

		// Reset.
		emu.vars.gameFiles  = [] ;
		emu.vars.gameFile   = "" ;
		emu.vars.gameTitle  = "" ;
		emu.vars.baseURL    = "" ;
		emu.vars.iframeHTML = "" ;
	},
	emu_getBuiltInGamelist : function(){
		var resolved = function(res){
			var addGamesByCategory = function( data, select ){
				// let select;
				let optgroup;
				let option;
				let frag;
				let thisFile;

				optgroup = document.createElement('optgroup');
				optgroup.setAttribute('label', data.groupTitle+" ("+data.data.length+")");
				frag = document.createDocumentFragment(optgroup);
				frag.appendChild(optgroup);

				// Add the records for this category.
				for(var i=0; i<data.data.length; i++){
					thisFile     = data.data[i];
					option       = document.createElement('option');
					option.value = thisFile.id;
					option.text  = thisFile.title;
					frag.appendChild(option);
				}

				// Create/Add option group - spacer
				optgroup = document.createElement('optgroup');
				optgroup.setAttribute('label', '');
				frag.appendChild(optgroup);

				select.appendChild(frag);
			};

			// Get handle on select menu DOM.
			var emu_builtInGames_select1 = emu.vars.dom.view.builtInGames_select;
			// Clear the options.
			emu_builtInGames_select1.length=1;
			// Clear the optgroups.
			emu_builtInGames_select1.querySelectorAll('optgroup').forEach(function(d,i,a){ d.remove(); });

			// Break the game data apart into separate categories.
			var categories = [
				{ 'groupTitle' : '== '+emu.vars.emu_statuses[3]+'' , 'data' : res.data.filter(function (e) { if(e.status == 3) { return e;} }) , } , // 'Complete   '
				{ 'groupTitle' : '== '+emu.vars.emu_statuses[7]+'' , 'data' : res.data.filter(function (e) { if(e.status == 7) { return e;} }) , } , // 'UCC2018    '
				{ 'groupTitle' : '== '+emu.vars.emu_statuses[6]+'' , 'data' : res.data.filter(function (e) { if(e.status == 6) { return e;} }) , } , // 'UCC2016    '
				{ 'groupTitle' : '== '+emu.vars.emu_statuses[5]+'' , 'data' : res.data.filter(function (e) { if(e.status == 5) { return e;} }) , } , // 'UCC2014    '
				{ 'groupTitle' : '== '+emu.vars.emu_statuses[4]+'' , 'data' : res.data.filter(function (e) { if(e.status == 4) { return e;} }) , } , // 'UCC2013    '
				{ 'groupTitle' : '== '+emu.vars.emu_statuses[1]+'' , 'data' : res.data.filter(function (e) { if(e.status == 1) { return e;} }) , } , // 'Demo       '
				{ 'groupTitle' : '== '+emu.vars.emu_statuses[2]+'' , 'data' : res.data.filter(function (e) { if(e.status == 2) { return e;} }) , } , // 'WIP        '
				{ 'groupTitle' : '== '+emu.vars.emu_statuses[8]+'' , 'data' : res.data.filter(function (e) { if(e.status == 8) { return e;} }) , } , // 'RESERVED   '
				{ 'groupTitle' : '== '+emu.vars.emu_statuses[0]+'' , 'data' : res.data.filter(function (e) { if(e.status == 0) { return e;} }) , } , // 'NO CATEGORY'
			];

			// Add the game data by category.
			categories.map(function(d,i,a){
				if(d.data.length){
					addGamesByCategory( d, emu_builtInGames_select1 );
				}

			});

		};
		var formData = {
			"o"       : "emu_getBuiltInGamelist",
			"_config" : { "processor" : "emu_p.php" }
		};
		var prom1 = emu.funcs.shared.serverRequest(formData).then( resolved, emu.funcs.shared.rejectedPromise );
	},
	loadGameFromList       : function(game){
		emu.vars.gameFile  = game ;
		emu.vars.gameTitle = game ;
		emu.funcs.loadGame();
	},
	getGameFiles           : function(methodType){
		// Displays the loaded files in a list. Play button is availble if the file is a .uze or .hex file.
		function addFileListToDisplay(){
			let doNotCreateLinks=true;

			// Get handle on destination div and clear it..
			var destdiv = document.querySelector("#emu_filesList_div");
			destdiv.innerHTML="";

			// Create the table template.
			var tableTemplate   = document.createElement("table");
			tableTemplate.classList.add("table1");

			// Create new document fragment and append the table template to it.
			let frag = document.createDocumentFragment();
			frag.appendChild( tableTemplate );

			// Get a handle on the fragment table.
			var fragTable=frag.querySelector("table");

			// Create the table template head at the top of the fragment table.
			let row   = fragTable.insertRow(0);
			row.innerHTML=""
			row.innerHTML+="<th>PLAY</th>"
			row.innerHTML+="<th>NAME</th>"
			row.innerHTML+="<th>BYTES</th>"

			// Get the game files list
			// Resort the files list so that the .uze and .hex are at the top.
			var list = [];
			list = list.concat(
				emu.vars.gameFiles.filter(function(d,i,a){
					let ext = (d.name.substr(-4, 4)).toLowerCase() ;
					if (ext == ".uze" || ext == ".hex") { return true; }
				}),
				emu.vars.gameFiles.filter(function(d,i,a){
					let ext = (d.name.substr(-4, 4)).toLowerCase() ;
					let isExecFile = (ext == ".uze" || ext == ".hex") ? 1 : 0;
					if (ext != ".uze" && ext != ".hex") { return true; }
				})
			);

			// Go through the files list and create the table rows.
			for(var i=0; i<list.length; i++){
				let record   = list[i].name;
				let filesize = list[i].filesize;
				let ext = (record.substr(-4, 4)).toLowerCase() ;
				let isExecFile = (ext == ".uze" || ext == ".hex") ? 1 : 0;
				let filesizeHTML = filesize.toLocaleString()+``;

				// Determine a shorter filename so that it will fit.
				let shortenedName = "";
				if(record.length>23){ shortenedName = record.substr(0, 15) + "..." + record.substr(-6); }
				else                { shortenedName=record;}

				// let playButton = "<button>PLAY</button>";
				let linkHTML   = "<button>linkHTML</button>";

				let playButton   = "<input type=\"button\" value=\"PLAY\" onclick=\"emu.funcs.loadGameFromList('"+record+"');\">";
				// let linkHTML     = `<a title="`+record+`" href='`+(href)+`' target="_blank">`+shortenedName+`</a>`;

				// Create the new row and the cells.
				let row   = fragTable.insertRow( fragTable.rows.length );
				let ceil0 = row.insertCell(0);
				let ceil1 = row.insertCell(1);
				let ceil2 = row.insertCell(2);

				// Add the data to each cell.
				ceil0.innerHTML = (isExecFile        ? playButton    : '--');
				ceil1.innerHTML = (doNotCreateLinks ? shortenedName : linkHTML);
				ceil2.innerHTML = filesizeHTML;
			}


			// Append the fragTable to the dest div.
			destdiv.appendChild(fragTable);
		}

		// Used by methods 1,3,4.
		var downloadFilesFromList = function(res){
			var finishFileLoading = function(proms){
				var promsOnly = proms.map(function(d,i,a){ return d.prom; });

				Promise.all(promsOnly).then(
					function(results){
						// Get the gamefile name.
						emu.vars.gameFile = res.remoteload.gamefile;

						// Get the game title.
						emu.vars.gameTitle = res.remoteload.title;

						emu.vars.baseURL = res.remoteload.baseURL;

						// Go through the data, correct the .uze header if needed, add file to gameFiles.
						proms.map(function(d,i,a){
							let view8 = fixUzeHeader(d.filename, results[i]);
							// Add the data.
							emu.vars.gameFiles.push( {
								'name'     : d.filename   ,
								'data'     : view8        ,
								'filesize' : view8.length ,
							} );
						});

						// Games are loaded. Make sure we can continue.
						var doWeLoadTheGame=true;
						if( ! emu.vars.gameFile.length  ){ console.log("No gamefile in emu.gameFile!"         ); doWeLoadTheGame=false; }
						if( ! emu.vars.gameFiles.length ){ console.log("No game files in emu.gameFiles!"      ); doWeLoadTheGame=false; }
						if( ! emu.vars.gameTitle.length ){ console.log("No gameTitle files in emu.gameTitles!"); doWeLoadTheGame=false; }
						if( ! emu.vars.baseURL.length   ){ console.log("No baseURL in emu.baseURL!"           ); doWeLoadTheGame=false; }

						if(doWeLoadTheGame){
							setTimeout(function(){

								// emu.addFileListToDisplay(false, true);
								addFileListToDisplay();

								emu.funcs.loadGame();

							}, 100);
						}
						else{
							console.warn("ABORT GAME LOAD!");
							return;
						}
					}
					,function(error) {
					}
				);
			};

			var proms = [];

			// Download each file.
			res.remoteload.files.map(function(d,i,a){
				proms.push(
					{
						"filename" : d.filename,
						"data":"",
						"prom":emu.funcs.shared.serverRequest( {
							"o":"", "_config":{"responseType":"arraybuffer", "processor":d.completefilepath}}
						) }
				)
			});

			// Now run the function that creates the Promise.all now that the promise array is fully populated.
			finishFileLoading(proms);
		};
		var returnJSON_byGameId = function(gameid){
			return new Promise(function(resolve,reject){
				var formData = {
					"o"       : "emu_returnJSON_byGameId",
					"gameId"  : gameid,
					"_config" : { "processor" : "emu_p.php" }
				};
				var prom1 = emu.funcs.shared.serverRequest(formData).then(
					resolve,
					emu.funcs.shared.rejectedPromise
				);
			});
		};

		// var loadFilesFromUserList = function(res){
		// 	var finishFileLoading = function(proms){
		// 		var promsOnly = proms.map(function(d,i,a){ return d.prom; });

		// 		Promise.all(promsOnly).then(
		// 			function(results){
		// 				// Get the gamefile name.
		// 				emu.vars.gameFile = res.remoteload.gamefile;

		// 				// Get the game title.
		// 				emu.vars.gameTitle = res.remoteload.title;

		// 				emu.vars.baseURL = res.remoteload.baseURL;

		// 				// Go through the data, correct the .uze header if needed, add file to gameFiles.
		// 				proms.map(function(d,i,a){
		// 					let view8 = fixUzeHeader(d.filename, results[i]);
		// 					// Add the data.
		// 					emu.vars.gameFiles.push( {
		// 						'name'     : d.filename   ,
		// 						'data'     : view8        ,
		// 						'filesize' : view8.length ,
		// 					} );
		// 				});

		// 				// Games are loaded. Make sure we can continue.
		// 				var doWeLoadTheGame=true;
		// 				if( ! emu.vars.gameFile.length  ){ console.log("No gamefile in emu.gameFile!"         ); doWeLoadTheGame=false; }
		// 				if( ! emu.vars.gameFiles.length ){ console.log("No game files in emu.gameFiles!"      ); doWeLoadTheGame=false; }
		// 				if( ! emu.vars.gameTitle.length ){ console.log("No gameTitle files in emu.gameTitles!"); doWeLoadTheGame=false; }
		// 				if( ! emu.vars.baseURL.length   ){ console.log("No baseURL in emu.baseURL!"           ); doWeLoadTheGame=false; }

		// 				if(doWeLoadTheGame){
		// 					setTimeout(function(){

		// 						// emu.addFileListToDisplay(false, true);
		// 						function addFileListToDisplay(){
		// 							let doNotCreateLinks=true;

		// 							// Get handle on destination div and clear it..
		// 							var destdiv = document.querySelector("#emu_filesList_div");
		// 							destdiv.innerHTML="";

		// 							// Create the table template.
		// 							var tableTemplate   = document.createElement("table");
		// 							tableTemplate.classList.add("table1");


		// 							// Create new document fragment and append the table template to it.
		// 							let frag = document.createDocumentFragment();
		// 							frag.appendChild( tableTemplate );

		// 							// Get a handle on the fragment table.
		// 							var fragTable=frag.querySelector("table");

		// 							// Create the table template head at the top of the fragment table.
		// 							let row   = fragTable.insertRow(0);
		// 							row.innerHTML=""
		// 							row.innerHTML+="<th>PLAY</th>"
		// 							row.innerHTML+="<th>NAME</th>"
		// 							row.innerHTML+="<th>BYTES</th>"

		// 							// Get the game files list
		// 							// Resort the files list so that the .uze and .hex are at the top.
		// 							var list = [];
		// 							list = list.concat(
		// 								emu.vars.gameFiles.filter(function(d,i,a){
		// 									let ext = (d.name.substr(-4, 4)).toLowerCase() ;
		// 									if (ext == ".uze" || ext == ".hex") { return true; }
		// 								}),
		// 								emu.vars.gameFiles.filter(function(d,i,a){
		// 									let ext = (d.name.substr(-4, 4)).toLowerCase() ;
		// 									let isExecFile = (ext == ".uze" || ext == ".hex") ? 1 : 0;
		// 									if (ext != ".uze" && ext != ".hex") { return true; }
		// 								})
		// 							);

		// 							// Go through the files list and create the table rows.
		// 							for(var i=0; i<list.length; i++){
		// 								let record   = list[i].name;
		// 								let filesize = list[i].filesize;
		// 								let ext = (record.substr(-4, 4)).toLowerCase() ;
		// 								let isExecFile = (ext == ".uze" || ext == ".hex") ? 1 : 0;
		// 								let filesizeHTML = filesize.toLocaleString()+``;

		// 								// Determine a shorter filename so that it will fit.
		// 								let shortenedName = "";
		// 								if(record.length>23){ shortenedName = record.substr(0, 15) + "..." + record.substr(-6); }
		// 								else                { shortenedName=record;}

		// 								let playButton = "<button>PLAY</button>";
		// 								let linkHTML   = "<button>linkHTML</button>";

		// 								// var playButton   = `<input type="button" value="PLAY" onclick="emu.load_chooserSuppliedGamefile('`+record+`');">`;
		// 								// var linkHTML     = `<a title="`+record+`" href='`+(href)+`' target="_blank">`+shortenedName+`</a>`;

		// 								// Create the new row and the cells.
		// 								let row   = fragTable.insertRow( fragTable.rows.length );
		// 								let ceil0 = row.insertCell(0);
		// 								let ceil1 = row.insertCell(1);
		// 								let ceil2 = row.insertCell(2);

		// 								// Add the data to each cell.
		// 								ceil0.innerHTML = (isExecFile        ? playButton    : '--');
		// 								ceil1.innerHTML = (doNotCreateLinks ? shortenedName : linkHTML);
		// 								ceil2.innerHTML = filesizeHTML;
		// 							}


		// 							// Append the fragTable to the dest div.
		// 							destdiv.appendChild(fragTable);
		// 						}
		// 						addFileListToDisplay();

		// 						emu.funcs.loadGame();

		// 					}, 100);
		// 				}
		// 				else{
		// 					console.warn("ABORT GAME LOAD!");
		// 					return;
		// 				}
		// 			}
		// 			,function(error) {
		// 			}
		// 		);
		// 	};

		// 	var proms = [];

		// 	// Download each file.
		// 	res.remoteload.files.map(function(d,i,a){
		// 		proms.push(
		// 			{
		// 				"filename" : d.filename,
		// 				"data":"",
		// 				"prom":emu.funcs.shared.serverRequest( {
		// 					"o":"", "_config":{"responseType":"arraybuffer", "processor":d.completefilepath}}
		// 				) }
		// 		)
		// 	});

		// 	// Now run the function that creates the Promise.all now that the promise array is fully populated.
		// 	finishFileLoading(proms);
		// };

		// Get DOM handles on the loading inputs.
		var emu_builtInGames_select1 = emu.vars.dom.view.builtInGames_select;
		var userFiles                = emu.vars.dom.view["emu_FilesFromUser"];
		// var select_UAM            = document.querySelector("#emu_userGames_fromUAM");

		// Allow the game load?
		if(methodType==1 && emu_builtInGames_select1.value==""){ return; }
		if(methodType==2 && !userFiles.files.length ){ return; }
		// if(methodType==3 && select_UAM.value==""    ){ return; }

		// Reset.
		emu.funcs.emu_reset();

		var fixUzeHeader = function(filename, data){
			let view8 = new Uint8Array( data );

			// Fix the header on the .uze file?
			if(filename.toLowerCase().indexOf(".uze") !=-1){
				let header = Array.prototype.slice.call( view8, 0,6 ).toString();
				if(header !== "85,90,69,66,79,88"){
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

		// Method #1 - Games DB

		if(methodType==1){
			// Was a valid DB selection made?
			if(emu_builtInGames_select1.value==""){ return; }

			let gameid = emu_builtInGames_select1.value;
			returnJSON_byGameId(gameid).then(
				function(res){
					downloadFilesFromList(res);
				}, emu.funcs.shared.rejectedPromise);
		}
		// Method #2 - User-supplied files.
		if(methodType==2){
			// Get the file list.
			// Use a file reader to read as array buffer.
			// Add each file to the gameFiles array.
			// Use Promise.all instead of something recursive.
			// console.log(userFiles.files, new Uint8Array( userFiles.files[0] ));

			if(!userFiles.files.length){
				console.log("No files.");
				// emu.gameFilesDownloading = false ;
				// emu.gameAllowedToLoad   = true ;
				// emu.addFileListToDisplay(false, false);
				return;
			}
			emu_builtInGames_select1.value="";

			var proms = [];

			// Do a File Reader on each file.
			for(let i=0; i<userFiles.files.length; i+=1){
				let d = userFiles.files[i];
				proms.push(
					{
						"filename" : d.name,
						"data":"",
						"prom": new Promise(function(resolve,reject){
							var reader = new FileReader();
							reader.onload = (function(e){
								resolve( e.target.result );
							});
							reader.readAsArrayBuffer(userFiles.files[0]);

						})
					}
				);
			}
			var promsOnly = proms.map(function(d,i,a){ return d.prom; });

			Promise.all(promsOnly).then(
				function(results){
					// Go through the data, correct the .uze header if needed, add file to gameFiles.
					proms.map(function(d,i,a){
						let view8 = fixUzeHeader(d.filename, results[i]);
						// Add the data.
						emu.vars.gameFiles.push( {
							'name'     : d.filename   ,
							'data'     : view8        ,
							'filesize' : view8.length ,
						} );
					});

					// Clear the file uploads from the file input.
					userFiles.value="";

					// Games are loaded. Make sure we can continue.
					var doWeLoadTheGame=true;
					if( ! emu.vars.gameFiles.length ){ console.log("No game files in emu.gameFiles!"      ); doWeLoadTheGame=false; }

					if(doWeLoadTheGame){
						setTimeout(function(){
							addFileListToDisplay();

							// Count the number of .uze and .hex files.
							let uzeCount=0;
							let hexCount=0;
							emu.vars.gameFiles.map(function(d,i,a){
								if     ( d.name.toLowerCase().indexOf(".uze") !=-1 ){ uzeCount++; }
								else if( d.name.toLowerCase().indexOf(".hex") !=-1 ){ hexCount++; }
							});

							// Only one .uze or .hex then we do an auto load.
							if(uzeCount+hexCount==1){
								// Load the first .uze or .hex that is found in the files list.
								for(let i=0; i<emu.vars.gameFiles.length; i+=1){
									if(
										emu.vars.gameFiles[i].name.toLowerCase().indexOf(".uze") !=-1 ||
										emu.vars.gameFiles[i].name.toLowerCase().indexOf(".hex") !=-1
									){
										emu.vars.gameFile  = emu.vars.gameFiles[i].name ;
										emu.vars.gameTitle = emu.vars.gameFiles[i].name ;
										emu.funcs.loadGame();
										break;
									}
								}
							}

						}, 100);
					}
					else{
						console.warn("ABORT GAME LOAD!");
						return;
					}
				}
				,emu.funcs.shared.rejectedPromise
			);



		}
		// Method #3 - JSON Remote Load.

	},
	emu_removeEmuIframes   : function(){
		// Remove previous iframe(s).
		var container = document.querySelector('#emscripten_iframe_container');
		var previousIframes = container.querySelectorAll('iframe');
		if( previousIframes.length){
			for(var i=0; i<previousIframes.length; i++){
				previousIframes[i].remove();
			}
		}
	},
	loadGame               : function(){
		if(!emu.vars.gameFiles.length){
			// console.log("No files are loaded.");
			return;
		}
		// Prevent game load if game is already loading.
		// Remove previous emulator iframes and event listeners.

		var emuFilesReady = function(data){
			// console.log("cuzebox.js          :", data["cuzebox.js"]);
			// console.log("cuzebox_minimal.html:", data["cuzebox_minimal.html"]);

			var newHTML = "";
			if(!emu.vars.iframeHTML.length){
				// Create config var.
				var config = '<script name="cuzebox_js">'+data["cuzebox.js"]+'</script>';

				// Fix the dataurl prefix.
				data["cuzebox.html.mem"] = data["cuzebox.html.mem"].replace("data:text/html;base64,", "data:application/octet-stream;base64,");

				// Replace the filename reference with the dataurl.
				config = config.replace("cuzebox.html.mem", data["cuzebox.html.mem"]);

				// Replace the placeholder text in the cuzebox_minimal.html file with the config var.
				newHTML = data["cuzebox_minimal.html"].replace("<!-- PLACE HOLDER FOR REPLACEMENT -->", config);

				// Cache the full html (including the replaced stuff) for easy reloading later.
				emu.vars.iframeHTML = newHTML;
			}
			else{
				// console.log("PART2: Using cached copy of the emulator.");
				newHTML=emu.vars.iframeHTML;
			}

			// Create iframe.
			var newIframe = document.createElement('iframe');
			// Remove frameborder
			newIframe.setAttribute("frameBorder", "0");

			// Set id to emscripten_iframe.
			newIframe.id = "emscripten_iframe";

			// Get handle on the container for the iframe.
			var container = document.querySelector('#emscripten_iframe_container');

			// Create iframe onload event listener.
			newIframe.onload=function(){
				// Open the iframe contentWindow.document.
				newIframe.contentWindow.document.open();

					// Write the newHTML to into it.
					newIframe.contentWindow.document.write(newHTML);

					// Close the iframe contentWindow.document.
					newIframe.contentWindow.document.close();

				// Display the new status of the emulator.
				// Detect auto-pause checkbox value.
					// If checked then pauseMainLoop for Emscripten
						// If the mouse is not currently over the iframe.
					// If not checked then just set the status as "Accepting input"
			};

			// Set the iframe src to "about:blank"

			// Remove previous emulator iframes and event listeners.
			if(document.querySelector("#emscripten_iframe")!=null){
				// document.querySelector("#emscripten_iframe").remove();
				emu.funcs.emu_removeEmuIframes();
			}

			// Append the iframe to the container.
			// var frag = document.createDocumentFragment();
			// frag.appendChild(newIframe);
			// container.appendChild(frag);

			// container.style.display="none";
			container.appendChild(newIframe);

			// emu.gameFilesDownloading = false ;
			// emu.gameAllowedToLoad    = true  ;
			// emu.emu_displayStatus();

		};

		document.querySelector("#emscripten_iframe").onload=function(){
			// emscripten_iframe.contentDocument.querySelector("td").innerHTML="TEST"
			document.querySelector("#emscripten_iframe").onload=null;
			this.contentDocument.querySelector("#MESSAGE").innerHTML="...LOADING...";
			if(emu.vars.iframeHTML.length){
				// console.log("PART 1: Using cached copy of the emulator.");
				emuFilesReady(null);
			}
			else{
				// Get the cuzebox_minimal.html file, cuzebox.html.mem, and the cuzebox.js files.
				var proms = [ ];
				proms.push(
					{
						"filename" : "cuzebox_minimal.html",
						"data":"",
						"prom":emu.funcs.shared.serverRequest( {
							"o":"", "_config":{"responseType":"text", "processor":"cuzebox_minimal.html"}}
						)
					},
					{
						"filename" : "cuzebox.js",
						"data":"",
						"prom":emu.funcs.shared.serverRequest( {
							"o":"", "_config":{"responseType":"text", "processor":"cuzebox.js"}}
						)
					},
					{
						"filename" : "cuzebox.html.mem",
						"data":"",
						"prom":
							new Promise(function(resolve,reject){
								emu.funcs.shared.serverRequest( {
									"o":"", "_config":{"responseType":"blob", "processor":"cuzebox.html.mem"}}
								).then(
									function(res){
										var reader = new FileReader();
										reader.onload = (function(e){ resolve( e.target.result ); });
										reader.readAsDataURL(res);
									},
									function(res){ console.log("error:", res); }
								);
							})
					},
					// data:application/octet-stream;base64,
				);
				var promsOnly = proms.map(function(d,i,a){ return d.prom; });
				var filenamesOnly = proms.map(function(d,i,a){ return d.filename; });
				Promise.all(promsOnly).then(
					function(res){
						var data = {};
						res.map(function(d,i,a){ data[ filenamesOnly[i] ]=res[i]; });
						emuFilesReady(data);
					},
					emu.funcs.shared.rejectedPromise
				);
			}
		};

		document.querySelector("#emscripten_iframe").src="iframe_msg_template.html";
	},
	emu_iframeFocusing     : function(e, typeOverride){
		var type = "";

		var emscripten_iframe = document.querySelector("#emscripten_iframe");
		// var emscripten_canvas = document.querySelector("#emuCanvas");

		// Is there an iframe there?
		if(null==emscripten_iframe){ console.log("no emscripten iframe."); return; }

		// Is it loaded and ready?
		else if(
			emscripten_iframe.contentWindow.Module &&
			emscripten_iframe.contentWindow.emulatorIframeIsReady===true
		){
			// Get the type.
			if(undefined==e){ type = typeOverride; }
			else            { type = e.type; }

			// Don't pause if the auto-pause checkbox is checked.
			// if( ! emu.vars.dom.view["emuControls_autopause"].checked ){ type="mouseenter"; }
			if( ! emu.vars.dom.view["emuControls_autopause_chk"].classList.contains("enabled") ){ type="mouseenter"; }

			// Make sure that the specified type is an accepted type.
			if(["mouseenter", "mouseleave"].indexOf(type) == -1){ return ; }

			// Should we focus the emulator iframe?
			if(["mouseenter"].indexOf(type) != -1){
				emscripten_iframe.focus();
				// emscripten_canvas.focus();
				emscripten_iframe.contentWindow.Module.resumeMainLoop();
			}

			// Should we blur the emulator iframe focus?.
			else if(["mouseleave"].indexOf(type) != -1){
				emscripten_iframe.blur();
				// emscripten_canvas.blur();
				emscripten_iframe.contentWindow.Module.pauseMainLoop();
			}
		}

	},
	emu_processUserUploads : function(e){
		console.log("processUserUploads", e);
		emu.funcs.getGameFiles(2);
	},
	emu_clickUserUpload    : function(e){
		emu.vars.dom.view["emu_FilesFromUser"].click();
	},

	emu_sendKeyEvent : function(type, key){
		var newEvent = undefined;

		switch(key){
			case "key_AltGr"  : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"AltRight","key":"Alt","keyCode":18,"which":18,"location":2})         ; break; }
			case "key_F1"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"F1","key":"F1","keyCode":112,"which":112,"location":0} )             ; break; }
			case "key_F2"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"F2","key":"F2","keyCode":113,"which":113,"location":0} )             ; break; }
			case "key_F3"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"F3","key":"F3","keyCode":114,"which":114,"location":0} )             ; break; }
			case "key_F4"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"F4","key":"F4","keyCode":115,"which":115,"location":0} )             ; break; }
			case "key_F5"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"F5","key":"F5","keyCode":116,"which":116,"location":0} )             ; break; }
			case "key_F6"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"F6","key":"F6","keyCode":117,"which":117,"location":0} )             ; break; }
			case "key_F7"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"F7","key":"F7","keyCode":118,"which":118,"location":0} )             ; break; }
			case "key_F8"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"F8","key":"F8","keyCode":119,"which":119,"location":0} )             ; break; }
			case "key_F9"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"F9","key":"F9","keyCode":120,"which":120,"location":0} )             ; break; }
			case "key_F10"    : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"F10","key":"F10","keyCode":121,"which":121,"location":0} )           ; break; }
			case "key_F11"    : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"F11","key":"F11","keyCode":122,"which":122,"location":0} )           ; break; }
			case "key_F12"    : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"F12","key":"F12","keyCode":123,"which":123,"location":0} )           ; break; }
			case "key_Q"      : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"KeyQ","key":"q","keyCode":81,"which":81,"location":0})               ; break; }
			case "key_W"      : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"KeyW","key":"w","keyCode":87,"which":87,"location":0})               ; break; }
			case "key_A"      : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"KeyA","key":"a","keyCode":65,"which":65,"location":0})               ; break; }
			case "key_S"      : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"KeyS","key":"s","keyCode":83,"which":83,"location":0})               ; break; }
			case "key_ENTER"  : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"Enter","key":"Enter","keyCode":13,"which":13,"location":0} )         ; break; }
			case "key_SPACE"  : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"Space","key":" ","keyCode":32,"which":32,"location":0} )             ; break; }
			case "key_LSHIFT" : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"ShiftLeft","key":"Shift","keyCode":16,"which":16,"location":1} )     ; break; }
			case "key_RSHIFT" : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"ShiftRight","key":"Shift","keyCode":16,"which":16,"location":2} )    ; break; }
			case "key_UP"     : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"ArrowUp","key":"ArrowUp","keyCode":38,"which":38,"location":0} )     ; break; }
			case "key_DOWN"   : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"ArrowDown","key":"ArrowDown","keyCode":40,"which":40,"location":0} ) ; break; }
			case "key_LEFT"   : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"ArrowLeft","key":"ArrowLeft","keyCode":37,"which":37,"location":0} ) ; break; }
			case "key_RIGHT"  : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"charCode":0,"code":"ArrowRight","key":"ArrowRight","keyCode":39,"which":39,"location":0} ) ; break; }
			default           : { return; break; }
		}

		var emscripten_iframe = document.querySelector("#emscripten_iframe");
		// Is there an iframe there?
		if(null==emscripten_iframe){
			// console.log("No iframe here!");
			return;
		}

		emscripten_iframe.contentDocument.dispatchEvent( newEvent );
	},
	addAllListeners        : function(){
		// Add the event listeners for the quick nav buttons.
		var allTitleNavGroups = document.querySelectorAll(".sectionDivs_title_options");
		allTitleNavGroups.forEach(function(d,i,a){
			d.querySelectorAll(".navOptions").forEach(function(d2,i2,a2){
				d2.addEventListener("click", function(){ changeView(this.getAttribute("newview")); }, false);
			});
		});

		// Handle new built-in DB game selection.
		emu.vars.dom.view.builtInGames_select.addEventListener("change", function(){ emu.funcs.getGameFiles("1") }, false);

		// Handle input focus on the emulator iframe. (Delegated)
		emu.vars.dom.view["emscripten_iframe_container"].addEventListener("mouseenter", emu.funcs.emu_iframeFocusing, false);
		emu.vars.dom.view["emscripten_iframe_container"].addEventListener("mouseleave", emu.funcs.emu_iframeFocusing, false);

		// Hidden file upload button.
		emu.vars.dom.view["emu_FilesFromUser"]             .addEventListener("change", emu.funcs.emu_processUserUploads, false);

		// Visible upload button.
		emu.vars.dom.view["emu_FilesFromUser_viewableBtn"] .addEventListener("click", emu.funcs.emu_clickUserUpload, false);

		emu.vars.dom.view["emuControls_stop"]   .addEventListener("click", emu.funcs.stopEmu, false);
		emu.vars.dom.view["emuControls_reload"] .addEventListener("click", emu.funcs.loadGame, false);
		emu.vars.dom.view["emuControls_unload"] .addEventListener("click", emu.funcs.emu_resetFull, false);

		emu.vars.dom.view["emuControls_autopause_btn"].addEventListener("click", function(e){
			// console.log("clicked: emuControls_autopause_btn:", this.id);
			// Toggle the enabled class.
			if( emu.vars.dom.view["emuControls_autopause_chk"].classList.contains("enabled") ){
				emu.vars.dom.view["emuControls_autopause_chk"].classList.remove("enabled");
			}
			else{
				emu.vars.dom.view["emuControls_autopause_chk"].classList.add("enabled");
			}

			if( emu.vars.dom.view["emuControls_autopause_chk"].classList.contains("enabled") ) {
				emu.funcs.emu_iframeFocusing(null, "mouseenter");
			}
			else {
				emu.funcs.emu_iframeFocusing(null, "mouseleave");
			}
		}, false);

		emu.vars.dom.view["emuControls_QUALITY"] .addEventListener("mousedown", function(){ emu.funcs.emu_sendKeyEvent("keydown", "key_F2"); }, false);
		emu.vars.dom.view["emuControls_QUALITY"] .addEventListener("mouseup", function(){ emu.funcs.emu_sendKeyEvent("keyup", "key_F2"); }, false);

		emu.vars.dom.view["emuControls_DEBUG"]   .addEventListener("mousedown", function(){ emu.funcs.emu_sendKeyEvent("keydown", "key_F3"); }, false);
		emu.vars.dom.view["emuControls_DEBUG"]   .addEventListener("mouseup", function(){ emu.funcs.emu_sendKeyEvent("keyup", "key_F3"); }, false);

		emu.vars.dom.view["emuControls_FLICKER"] .addEventListener("mousedown", function(){ emu.funcs.emu_sendKeyEvent("keydown", "key_F7"); }, false);
		emu.vars.dom.view["emuControls_FLICKER"] .addEventListener("mouseup", function(){ emu.funcs.emu_sendKeyEvent("keyup", "key_F7"); }, false);

		emu.vars.dom.view["emuControls_PAUSE"]   .addEventListener("mousedown", function(){ emu.funcs.emu_sendKeyEvent("keydown", "key_F9"); }, false);
		emu.vars.dom.view["emuControls_PAUSE"]   .addEventListener("mouseup", function(){ emu.funcs.emu_sendKeyEvent("keyup", "key_F9"); }, false);

		emu.vars.dom.view["emuControls_STEP"]    .addEventListener("mousedown", function(){ emu.funcs.emu_sendKeyEvent("keydown", "key_F10"); }, false);
		emu.vars.dom.view["emuControls_STEP"]    .addEventListener("mouseup", function(){ emu.funcs.emu_sendKeyEvent("keyup", "key_F10"); }, false);


	},

};
emu.funcs.UAM             = {
	// * Hide UAM.
	enableUAM         : function(){
		console.log("Enabling");
		emu.vars.originUAM      = true;
		emu.vars.uamwindow      = window.top;
		emu.vars.uamwindow_objs = emu.vars.uamwindow._debug_displayCustomGlobals(true);

		var htmlContain = document.querySelector("html");
		htmlContain.classList.add   ("wide");

		// console.log( "emu.vars.originUAM     :", emu.vars.originUAM     );
		// console.log( "emu.vars.uamwindow     :", emu.vars.uamwindow     );
		console.log( "emu.vars.uamwindow_objs:", emu.vars.uamwindow_objs);
		console.log( "emu.vars.uamwindow.shared.UAMisReady:", emu.vars.uamwindow.shared.UAMisReady);

		// Unhide UAM.
		document.querySelectorAll(".uamOnly").forEach(function(d,i,a){
			d.classList.remove("unavailableView");
			d.classList.add("enabled");
		});

		// Unhide the other nav options.
		document.querySelectorAll(".sectionDivs_title_options .navOptions.uamOnly").forEach(function(d,i,a){
			d.classList.remove("hidden");
		});

	},
	// * Show UAM.
	disableUAM        : function(){
		emu.vars.originUAM      = false;
		emu.vars.uamwindow      = undefined;
		emu.vars.uamwindow_objs = undefined;

		var htmlContain = document.querySelector("html");
		htmlContain.classList.remove("wide");

		document.querySelectorAll(".uamOnly").forEach(function(d,i,a){
			d.classList.add("unavailableView");
			d.classList.remove("enabled");
		});

		// Hide the other nav options.
		document.querySelectorAll(".sectionDivs_title_options .navOptions.uamOnly").forEach(function(d,i,a){
			d.classList.add("hidden");
		});


	},
	// * UAM setup.
	setupUAM          : function(){
		// console.clear();
		console.log("setup uam");

		// Show UAM, set some variables.
		emu.funcs.UAM.enableUAM();

		// setTimeout(function(){
			document.querySelector("#bodyHeader").style.display="none";
			document.querySelector("#bodyFooter").style.display="none";
			document.getElementById( 'bodyContainer' ).scrollIntoView( emu.funcs.quickNav.scrollIntoView_options );
		// }, 5);

		// Wait for UAM to finish loading... then continue.
		emu.vars.uamwindow.shared.UAMisReady.then(function(){
			console.log("uam promise is resolved... continuing with uam load");

			// Set up the UAM DOM.
			emu.funcs.domHandleCache_populate_UAM();

			// Add the UAM event listeners.
			emu.funcs.UAM.addEventListeners();

			// document.getElementById( 'emu_view' ).scrollIntoView( emu.funcs.quickNav.scrollIntoView_options );

			// Refresh the UAM games list data.
			// emu.funcs.UAM.input.uam_refreshGameList();

			// Auto-select the user's default game.
			// emu.funcs.UAM.input.uam_refreshGameList();

		});

	},
	addEventListeners : function(){
	}

};
emu.funcs.downloads       = {

};
emu.funcs.shared          = {
	serverRequest   : function(formData){
		// Make sure that a ._config key exists and that it has values.
		if( typeof formData._config              == "undefined" ){ formData._config = {}; }
		if( typeof formData._config.responseType == "undefined" ){ formData._config.responseType = "json" ; }
		if( typeof formData._config.hasFiles     == "undefined" ){ formData._config.hasFiles     = false  ; }
		if( typeof formData._config.filesHandle  == "undefined" ){ formData._config.filesHandle  = null   ; }
		if( typeof formData._config.method       == "undefined" ){ formData._config.method       = "POST" ; }
		if( typeof formData._config.processor    == "undefined" ){ formData._config.processor    = "index_p.php" ; }

		return new Promise(function(resolve, reject) {
			var progress_showPercent = function(){
			};

			var progress_hidePercent = function(){
			};

			// Event handlers.
			var updateProgress   = function(oEvent) {
				return;
				var text="Progress:";
				if (oEvent.lengthComputable) {
					var percentComplete = oEvent.loaded / oEvent.total * 100;
					console.log(text, "percentComplete:", percentComplete, oEvent);
				}
				else {
					// Unable to compute progress information since the total size is unknown
					// console.log(text, "cannot determine", oEvent);
				}
			} ;
			var transferComplete = function(evt)    {
				// The default responseType is text if it is not specified.
				// However, this function (serverRequest) defaults it to 'json' if it is not specified.
				var data={};

				switch( this.responseType ){
					case    'text'        : { data = this.responseText ; break; }
					case    'arraybuffer' : { data = this.response     ; break; }
					case    'blob'        : { data = this.response     ; break; }
					case    'json'        : { data = this.response     ; break; }
					default               : { data = this.responseText ; break; }
				}

				// console.log("554",this, this.responseType);
				resolve(data);
			} ;
			var transferFailed   = function(evt)    {
				console.log("An error occurred during the transfer.");
				reject({
					'type' : evt.type ,
					'xhr'  : xhr      ,
					'evt'  : evt      ,
				});
			} ;
			var transferCanceled = function(evt)    {
				console.log("The transfer has been canceled by the user.", evt);
			} ;
			var loadEnd          = function(e)      {
				// console.log("The transfer finished (although we don't know if it succeeded or not).", e);
				// try{ mc_inputs.funcs.activateProgressBar(false); } catch(e){ }
			} ;

			// Create the form.
			var fd = new FormData();
			var o = formData.o ;
			// fd.append("o" , formData.o );

			// Add the keys and values.
			for (var prop in formData) {
				// Skip the "_config" key.
				if( prop == "_config" ) { continue; }
				if( prop == "_config" ) { continue; }
				// Append the key and value.
				fd.append(prop , formData[prop] );
			}

			// Are there files included?
			if(formData._config.hasFiles){
				console.log("Uploading this many files:", formData._config.filesHandle.files.length);
				for(var i=0; i<formData._config.filesHandle.files.length; i++){
					console.log("On file "+(i+1)+" of "+formData._config.filesHandle.files.length, "("+formData._config.filesHandle.files[i].name+")");
					fd.append(formData._config.filesHandle.files[i].name, formData._config.filesHandle.files[i]);
				}
			}

			var xhr = new XMLHttpRequest();

			xhr.addEventListener( "progress" , updateProgress   );
			xhr.addEventListener( "load"     , transferComplete );
			xhr.addEventListener( "error"    , transferFailed   );
			xhr.addEventListener( "abort"    , transferCanceled );
			xhr.addEventListener( "loadend"  , loadEnd          );

			xhr.open(
				formData._config.method,
				formData._config.processor + "?o=" +o+ "&r=" + (new Date()).getTime(),
				true
			);

			// If a responseType was specified then use it.
			if(formData._config && formData._config.responseType){
				// switch( this.responseType ){
				// console.log(formData._config.responseType);
				switch( formData._config.responseType ){
					case    'text'        : { xhr.responseType = "text"       ; break; }
					case    'arraybuffer' : { xhr.responseType = "arraybuffer"; break; }
					case    'blob'        : { xhr.responseType = "blob"       ; break; }
					case    'json'        : { xhr.responseType = "json"       ; break; }
					default               : { xhr.responseType = "json"       ; break; }
				}
			}
			// Otherwise, it is almost always 'json' so specify that.
			else{
				xhr.responseType = "json";
			}

			// try{ mc_inputs.funcs.activateProgressBar(true); } catch(e){ }

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
	rejectedPromise : function(error){
		// mc_inputs.funcs.rejectedPromise
		console.log("ERROR", error);
	},
	setpixelated    : function(canvas){
		// https://stackoverflow.com/a/13294650
		canvas.getContext("2d").mozImageSmoothingEnabled    = false; // Firefox
		canvas.getContext("2d").imageSmoothingEnabled       = false; // Firefox
		canvas.getContext("2d").oImageSmoothingEnabled      = false; //
		canvas.getContext("2d").webkitImageSmoothingEnabled = false; //
		canvas.getContext("2d").msImageSmoothingEnabled     = false; //
	},
};
emu.funcs.quickNav        = {
	scrollIntoView_options : {
		behavior: "smooth",     // "auto", "instant", or "smooth".         Defaults to "auto".
		// , block   : "center"  // "start", "center", "end", or "nearest". Defaults to "center".
		// , inline  : "nearest" // "start", "center", "end", or "nearest". Defaults to "nearest".

		block:"start",
	},
};
emu.funcs.view            = {

};
emu.funcs.debug1          = {

};
emu.funcs.debug2          = {

};
emu.funcs.db              = {

};

emu.fullscreen = {
	test : function (elem){
		if     (typeof elem=="string") { elem=document.querySelector(elem); }
		else if(typeof elem=="object") { elem=elem; }
		else{
			console.log("Invalid typeof");
			return;
		}
		var makeFullScreen =
			elem.webkitRequestFullscreen ||
			elem.mozRequestFullScreen    ||
			elem.msRequestFullscreen     ||
			elem.requestFullscreen ;

		var exitFullScreen =
			document.webkitExitFullscreen ||
			document.mozCancelFullScreen  ||
			document.msExitFullscreen     ||
			document.exitFullscreen ;

		console.log(makeFullScreen, exitFullScreen);
	}
};

function changeView(newview){
	var allSectionDivs = document.querySelectorAll(".sectionDivs");
	var bodyContainer = document.querySelector("#bodyContainer");

	var emu_view   = document.querySelector("#emu_view");
	var emu_debug1 = document.querySelector("#emu_debug1");
	var emu_debug2 = document.querySelector("#emu_debug2");
	var emu_db     = document.querySelector("#emu_db");

	bodyContainer.scrollIntoView( emu.funcs.quickNav.scrollIntoView_options );

	var hideSections = function(){ allSectionDivs.forEach(function(d,i,a){ d.classList.remove("active"); }); }

	switch(newview){
		case "VIEW"   : { hideSections(); emu_view  .classList.add("active"); break; }
		case "DEBUG1" : { hideSections(); emu_debug1.classList.add("active"); break; }
		case "DEBUG2" : { hideSections(); emu_debug2.classList.add("active"); break; }
		case "DB"     : { hideSections(); emu_db    .classList.add("active"); break; }
		default : { break; }
	};
};

window.onload=function(){
	window.onload=null;

	console.log("****************************************");
	console.log("*** -- Online Uzebox Emulator v2b -- ***");
	console.log("****************************************");

	var continueApp = function(){
		// Populate the DOM handle caches.
		emu.funcs.domHandleCache_populate();
		// Add the event listeners.
		emu.funcs.addAllListeners();

		// Get the build-in games list.
		emu.funcs.emu_getBuiltInGamelist();

		// Check if this application has been loaded under UAM.
		var messageText = "<u><b>ONLINE UZEBOX EMULATOR</b></u><br><br>Choose a game.";
		try{
			// Loaded via iframe?
			if( window.self !== window.top ){
				// IN UAM?
				// Can the originUAM key be detected?
				if( window.top.shared.originUAM == true ){
					console.log("EMULATOR - ORIGIN: UAM" );

					// Set up UAM.
					emu.funcs.UAM.setupUAM();

					messageText = "<u><b>ONLINE UZEBOX EMULATOR</b></u><br><br>Choose a game.<br><br>(<span style='color:yellow;font-size: 90%;'>UAM ENABLED</span>)";
				}
				else {
					emu.funcs.UAM.disableUAM();
				}
		 	}
		 	else{
				emu.funcs.UAM.disableUAM();
		 	}
		}
		catch(e){
			emu.funcs.UAM.disableUAM();
		}

		emu.funcs.changeEmuSRC("iframe_msg_template.html", messageText);

		// Adjust the canvas output.
		document.querySelectorAll('canvas').forEach(function(d, i) {
			emu.funcs.shared.setpixelated(d);
		});

		// Switch to the default view.
		changeView("VIEW");
		// changeView("DEBUG1");
		// changeView("DEBUG2");
		// changeView("DB");
	};


	// Feature Loader config:
	featureDetection.config.usePhp         = true;
	featureDetection.config.useAsync       = true;
	featureDetection.config.includeText    = false; // Using false makes the database download smaller.
	featureDetection.config.includeWebsite = false; // Using false makes the database download smaller.
	// Load these libraries also:
	featureDetection.config.userReqs = [
		// "X2JS"    ,
		// "JSZip"    ,
		// "FileSaver",
	];
	// Feature detect/replace.
	featureDetection.funcs.init( continueApp );

};