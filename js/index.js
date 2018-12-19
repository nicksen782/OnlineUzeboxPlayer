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
	getGameFiles                 : function(methodType){
		// Get DOM handles on the loading inputs.
		var emu_builtInGames_select1 = emu.vars.dom.view.builtInGames_select;
		// var userFiles      = document.querySelector("#emu_FilesFromUser");
		// var select_UAM     = document.querySelector("#emu_userGames_fromUAM");

		// Allow the game load?
		if(methodType==1 && emu_builtInGames_select1.value==""){ return; }
		// if(methodType==2 && !userFiles.files.length ){ return; }
		// if(methodType==3 && select_UAM.value==""    ){ return; }

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
				else{
					console.log("GAMEFILE:", filename, " -- The header IS CORRECT.");
				}
			}

			return view8;
		};

		// Method #1 - Games DB
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

										let playButton = "<button>PLAY</button>";
										let linkHTML   = "<button>linkHTML</button>";

										// var playButton   = `<input type="button" value="PLAY" onclick="emu.load_chooserSuppliedGamefile('`+record+`');">`;
										// var linkHTML     = `<a title="`+record+`" href='`+(href)+`' target="_blank">`+shortenedName+`</a>`;

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

			var proms = [ ];

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
			var formData = {
				"o"       : "emu_returnJSON_byGameId",
				"gameId"  : gameid,
				"_config" : { "processor" : "emu_p.php" }
			};
			var prom1 = emu.funcs.shared.serverRequest(formData).then(
				downloadFilesFromList,
				emu.funcs.shared.rejectedPromise
			);
		};

		if(methodType==1){
			// Was a valid DB selection made?
			if(emu_builtInGames_select1.value==""){
				// console.log("An invalid game id was specified.");
				// alert      ("An invalid game id was specified.");
				return;
			}

			// Reset.
			emu.vars.gameFiles  = [] ;
			emu.vars.gameFile   = "" ;
			emu.vars.gameTitle  = "" ;
			emu.vars.baseURL    = "" ;
			emu.vars.iframeHTML = "" ;

			let gameid = emu_builtInGames_select1.value;
			returnJSON_byGameId(gameid);
		}
		// Method #2 - User-supplied files.
		// Method #3 - JSON Remote Load.

	},

	emu_removeEmuIframes         : function(){
		// Remove previous iframe(s).
		var container = document.querySelector('#emscripten_iframe_container');
		var previousIframes = container.querySelectorAll('iframe');
		if( previousIframes.length){
			for(var i=0; i<previousIframes.length; i++){
				previousIframes[i].remove();
			}
		}
	} ,

	emu_removeListeners          : function(){
		// Adds a mouseenter listener to the iframe container. On mouseenter it will give the Emscripten iframe the focus.
		var container          = document.querySelector('#emscripten_iframe_container');
		// var emscripten_iframe  = document.querySelector('#emscripten_iframe');

		container.onmouseenter = null ;
		container.onmousedown  = null ;
		container.onmouseleave = null ;
	}  ,


	loadGame : function(){
			// Prevent game load if game is already loading.
			// Remove previous emulator iframes and event listeners.

			var emuFilesReady = function(data){
				// console.log("cuzebox.js          :", data["cuzebox.js"]);
				// console.log("cuzebox_minimal.html:", data["cuzebox_minimal.html"]);

				// Create config var.
				var config = '<script name="cuzebox_js">'+data["cuzebox.js"]+'</script>';

				// Replace the placeholder text in the cuzebox_minimal.html file with the config var.
				var newHTML = data["cuzebox_minimal.html"].replace("<!-- PLACE HOLDER FOR REPLACEMENT -->", config);

				// Cache the full html (including the replaced stuff) for easy reloading later.
				emu.vars.iframeHTML = newHTML;

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
					// newIframe.src="about:blank";
					// newIframe.src="iframe_unloaded.html";
					newIframe.src="loading.html";

					// Remove previous emulator iframes and event listeners.
					if(document.querySelector("#emscripten_iframe")!=null){
						// document.querySelector("#emscripten_iframe").remove();
						emu.funcs.emu_removeEmuIframes();
						emu.funcs.emu_removeListeners();
					}

					// Append the iframe to the container.
					container.appendChild(newIframe);

					// emu.gameFilesDownloading = false ;
					// emu.gameAllowedToLoad    = true  ;
					// emu.emu_displayStatus();

			};

			// Get the cuzebox_minimal.html file and the cuzebox.js file.
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
				}
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




		return;
	},

	OLDloadGame                  : function(){
		// Bail if emu.gameFilesDownloading == true
		if( emu.gameFilesDownloading ){ console.warn("***Game file download is already in progress.***"); return; }

		// Remove previous iframe(s).
		emu.emu_removeEmuIframes();
		emu.emu_removeListeners();

		// Get the cuzebox_minimal.html file.
		emu.ajaxGETfile("cuzebox_minimal.html", "text", function(FILE1){
			// Get the cuzebox.js file.
			emu.ajaxGETfile("cuzebox.js", "text", function(FILE2){
				// Embed the cuzebox.js file.
				var config = `<script name="cuzebox_js">`+FILE2+`</script>`;

				// Put the script at the designated location in the file.
				var newHTML = FILE1.replace("<!-- PLACE HOLDER FOR REPLACEMENT -->", config);

				// Save this HTML for later resuming if the game is stopped but not unloaded.
				emu.iframeHTML = newHTML;

				var newIframe = document.createElement('iframe');
				newIframe.setAttribute("frameBorder", "0");
				newIframe.id = "emscripten_iframe";
				var container = document.querySelector('#emscripten_iframe_container');

				newIframe.onload=function(){
					newIframe.contentWindow.document.open();
					newIframe.contentWindow.document.write(newHTML);
					newIframe.contentWindow.document.close();
					emu.emu_addListeners();
					parent.window.emu.emu_displayStatus();

					if( document.querySelector("#emu_autoPauseChkbox").checked==true){
						setTimeout(function(){
							emu.emuIframe_Document = document.querySelector('#emscripten_iframe').contentDocument;
							emu.emuIframe_Window   = document.querySelector('#emscripten_iframe').contentWindow;
							if( document.querySelectorAll('#emscripten_iframe:hover').length ){
								emu.emu_setStatus('Accepting input');
							}
							else{
								newIframe.contentWindow.Module.pauseMainLoop();
								emu.emu_setStatus('Paused');
							}
						}, 500);
					}
					else{
						emu.emu_setStatus('Accepting input');
					}

					newIframe.onload=null;
				};

				newIframe.src="about:blank";
				container.appendChild(newIframe);

			}
			,function(){
				console.log("ERROR! 404 (Not Found)");
				emu.gameFilesDownloading = false ;
				emu.gameAllowedToLoad    = true  ;
				emu.emu_displayStatus();
				return;
			}
			);
		}
		,function(){
			console.log("ERROR! 404 (Not Found)");
			emu.gameFilesDownloading = false ;
			emu.gameAllowedToLoad    = true  ;
			emu.emu_displayStatus();
			return;
		}
		);
	},
	OLDemu_displayStatus         : function(){
		var app_emu_status = document.querySelector("#app_emu_status");
		if      (emu.gameFilesDownloading){
			app_emu_status.innerHTML = "Downloading...";

		}
		else if (emu.gameAllowedToLoad   ){
			app_emu_status.innerHTML = "Ready!";
		}
	},
	OLD_getGameFiles             : function(methodType){
			if(   emu.gameFilesDownloading ){
				console.warn("***Game file download is already in progress.***");
				return;
			}
			if( ! emu.gameAllowedToLoad    ){
				console.warn("***Game is still loading...***");
				return;
			}

			var select_builtIn = document.querySelector("#emu_builtInGames");
			var userFiles      = document.querySelector("#emu_FilesFromUser");
			var select_UAM     = document.querySelector("#emu_userGames_fromUAM");

			// Prevent the load attempt?
			if(methodType==1 && select_builtIn.value==""){ return; }
			if(methodType==2 && !userFiles.files.length ){ return; }
			if(methodType==3 && select_UAM.value==""    ){ return; }

			if( ! emu.gameFilesDownloading && emu.gameAllowedToLoad ){
				emu.gameFilesDownloading = true ;
				emu.gameAllowedToLoad   = false ;

				emu.emu_displayStatus();

				setTimeout(function(){
					// Bail if emu.gameFilesDownloading == true
					// if( emu.gameFilesDownloading ){ console.warn("***Game file download is already in progress.***"); return; }

					// Reset.
					emu.gameFiles  = [] ;
					emu.gameFile   = "" ;
					emu.gameTitle  = "" ;
					emu.baseURL    = "" ;
					emu.iframeHTML = "" ;

					var baseURL = "";

					var downloadFilesFromList = function( FILE1, baseURL ){

						// console.log("downloadFilesFromList:", "FILE1:", FILE1, "baseURL:", baseURL);
						//
						var fileList = [];

						// Get the gamefile name.
						emu.gameFile = FILE1.gamefile;

						// Get the game title.
						emu.gameTitle = FILE1.title;

						emu.baseURL = baseURL;

						// Get the files.
						for(var i=0; i<FILE1.files.length; i++){
							// Get the game filename.
							fileList.push(
								{
									'filename' : FILE1.files[i].filename ,
									'filesize' : 0 ,
								}
							);
						}

						var index = 0 ;
						var header    ;
						var record    ;
						var callback = function(){
							// Games are loaded.
							var doWeLoadTheGame=true;
							if( ! emu.gameFile.length  ){ console.log("No gamefile in emu.gameFile!"         ); doWeLoadTheGame=false; }
							if( ! emu.gameFiles.length ){ console.log("No game files in emu.gameFiles!"      ); doWeLoadTheGame=false; }
							if( ! emu.gameTitle.length ){ console.log("No gameTitle files in emu.gameTitles!"); doWeLoadTheGame=false; }
							if( ! emu.baseURL.length   ){ console.log("No baseURL in emu.baseURL!"           ); doWeLoadTheGame=false; }

							if(doWeLoadTheGame){
								setTimeout(function(){
									emu.addFileListToDisplay(false, true);
									emu.loadGame();
								}, 100);
							}
							else{
								console.warn("ABORT GAME LOAD!");
								return;
							}
						};
						var recursive = function( doThisOnFinish ){
							// Are we at the end?
							if(index>=fileList.length){
								emu.gameFilesDownloading = false ;
								emu.emu_displayStatus();
								doThisOnFinish();
								return;
							}

							// Set the file record.
							record = fileList[index];

							// Load the next file.
							emu.ajaxGETfile(baseURL+record.filename, "arraybuffer", function(data){
								// Create a view for the arraybuffer.
								var view8 = new Uint8Array( data );

								// Is this a .uze file?
								if( record.filename.substr(-4, 4) == ".uze" ){
									// Get the header.
									header = Array.prototype.slice.call( view8, 0,6 ).toString();

									// Look for UZEBOX in the header (as an ascii string.)
									if(header !== "85,90,69,66,79,88"){
										// Mising 'UZEBOX'. Set those bytes to have 'UZEBOX'.
										view8[0] = 85; // U
										view8[1] = 90; // Z
										view8[2] = 69; // E
										view8[3] = 66; // B
										view8[4] = 79; // O
										view8[5] = 88; // X
										console.log("GAMEFILE:", fileList[index].filename, " -- The header has been corrected.");
									}
								}

								emu.emu_setStatus('Downloaded file '+(index+1)+' of '+fileList.length+': '+record.filename+' ('+(view8.length).toLocaleString()+' bytes)');

								// Add to the file list.
								emu.gameFiles.push( {
									'name'     : record.filename ,
									'data'     : view8           ,
									'filesize' : view8.length ,
								});

								// Set index for the next file.
								index+=1;

								// Run the next iteration.
								setTimeout(function() {
									recursive( doThisOnFinish );

								}, 1);
							}
							,function(){
								console.log("ERROR! 404 (Not Found)");
								emu.gameFilesDownloading = false ;
								emu.gameAllowedToLoad    = true  ;
								emu.emu_displayStatus();
								return;
							}
							);

						};

						if(fileList.length){
							recursive( callback );
						}
					};

					// DONE -- methodType: DB (1) -- From the DB but returns a remoteload.json file.
					if(methodType==1){
						emu.returnJSON_byGameId(select_builtIn.value).then(function(FILE1){
							downloadFilesFromList(FILE1.remoteload, FILE1.remoteload.baseURL);
						});
					}

					// methodType: USER (2) -- Files are provided to the browser through file input.
					else if(methodType==2){
						emu.emu_filesFromUser(function(){
							emu.addFileListToDisplay(true, false);
							emu.gameFilesDownloading = false ;
							emu.gameAllowedToLoad    = true  ;
							emu.emu_displayStatus();
						});
					}

					// DONE -- methodType: JSON (3) -- Game files/settings are downloaded as indicated by the JSON file.
					else if(methodType==3){
						var origin   = window.location.href.split(window.location.pathname)[0];
						var gamedir  = select_UAM.options[select_UAM.selectedIndex].getAttribute('gamedir');

						baseURL = origin+"/"+gamedir+"/output/";
						emu.ajaxGETfile(baseURL+"remoteload.json", "json", function(FILE1){
							downloadFilesFromList(FILE1, baseURL);
						}
						,function(){
							console.log("ERROR! 404 (Not Found)");
							emu.gameFilesDownloading = false ;
							emu.gameAllowedToLoad    = true  ;
							emu.emu_displayStatus();
							return;
						}
						);
					}

					// DONE -- methodType: JSON (4) -- MANUAL URL ENTRY. Game files/settings are downloaded as indicated by the JSON file.
					else if(methodType==4){
						var userSuppliedJsonUrl = document.querySelector("#emu_JsonFromUser").value;
						var baseURL = userSuppliedJsonUrl.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');

						if(!userSuppliedJsonUrl){
							alert("No value entered for userSuppliedJsonUrl.");
							emu.gameFilesDownloading = false ;
							emu.gameAllowedToLoad    = true  ;
							emu.emu_displayStatus();
							return;
						}

						// emu.ajaxGETfile(baseDir+'/'+userSuppliedJsonUrl, "json",
						emu.ajaxGETfile(userSuppliedJsonUrl, "json",
							function(FILE1){
								// console.log("FILE1:", FILE1);

								// for(var i=0; i<FILE1.files.length; i++){
								// 	FILE1.files[i].filename= baseDir+'/'+FILE1.files[i].filename;
								// }

								downloadFilesFromList(FILE1, baseURL+'/');
							}
							,function(){
								console.log("ERROR! 404 (Not Found)");
								emu.gameFilesDownloading = false ;
								emu.gameAllowedToLoad    = true  ;
								emu.emu_displayStatus();
								return;
							}

						);
					}

				}, 5);
			}

		},

	addAllListeners : function(){
		// Add the event listeners for the quick nav buttons.
		var allTitleNavGroups = document.querySelectorAll(".sectionDivs_title_options");
		allTitleNavGroups.forEach(function(d,i,a){
			d.querySelectorAll(".navOptions").forEach(function(d2,i2,a2){
				d2.addEventListener("click", function(){ changeView(this.getAttribute("newview")); }, false);
			});
		});

		emu.vars.dom.view.builtInGames_select.addEventListener("change", function(){ emu.funcs.getGameFiles("1") }, false);
	}
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

		// Wait for UAM to finish loading... then continue.
		emu.vars.uamwindow.shared.UAMisReady.then(function(){
			console.log("uam promise is resolved... continuing with uam load");

			// Set up the UAM DOM.
			emu.funcs.domHandleCache_populate_UAM();

			// Add the UAM event listeners.
			emu.funcs.UAM.addEventListeners();

			// document.getElementById( 'emu_view' ).scrollIntoView( emu.funcs.quickNav.scrollIntoView_options );
			setTimeout(function(){
				document.getElementById( 'bodyContainer' ).scrollIntoView( emu.funcs.quickNav.scrollIntoView_options );
			}, 500);

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
		try{
			// Loaded via iframe?
			if( window.self !== window.top ){
				// IN UAM?
				// Can the originUAM key be detected?
				if( window.top.shared.originUAM == true ){
					console.log("EMULATOR - ORIGIN: UAM" );

					// Set up UAM.
					emu.funcs.UAM.setupUAM();
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