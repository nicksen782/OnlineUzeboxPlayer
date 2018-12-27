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

var emu = {};
emu.vars = {
	// UAM vars.
	originUAM: false,
	uamwindow: undefined,
	uamwindow_objs: undefined,
	user_id: undefined,
	UAMisReady: undefined,

	// Holds the DOM cache.
	dom: {},

	// Holds the category values for the built-in games.
	emu_statuses: [
		'NO CATEGORY', // 0
		'Demo', // 1
		'WIP', // 2
		'Complete', // 3
		'UCC2013', // 4
		'UCC2014', // 5
		'UCC2016', // 6
		'UCC2018', // 7
		'RESERVED', // 8
	],

	//
	gameFiles: [],
	gameFile: "",
	gameTitle: "",
	baseURL: "",
	iframeHTML: ""
};
emu.funcs = {
	//
	recreateEmptyIframe: function() {
		var emscripten_iframe = document.querySelector("#emscripten_iframe");
		// Is there an iframe there?
		if (null == emscripten_iframe) {
			// console.log("No iframe here!");
			return;
		}
		else {
			// Create iframe.
			var newIframe = document.createElement('iframe');

			// Remove frameborder
			newIframe.setAttribute("frameBorder", "0");

			// Set id to emscripten_iframe.
			newIframe.id = "emscripten_iframe";

			// Get handle on the container for the iframe.
			var container = document.querySelector('#emscripten_iframe_container');

			newIframe.src = "about:blank";

			// Remove the existing iframe.
			document.querySelector('#emscripten_iframe').remove();

			newIframe.onload = function() {
				newIframe.onload = null;
			};

			// Append the iframe to the container.
			container.appendChild(newIframe);
		}
	},
	// * Stops the Emscripten instance by removing it's iframe and replacing the iframe with a blank one.
	stopEmu: function() {
		// This just removes the Emscripten iframe.
		// The game can be restarted if emu.vars.iframeHTML is populated.
		if (emu.vars.gameFiles.length) {
			// let messageText = "The emulator has been stopped. You can restart the loaded game by pressing the \"RELOAD\" button.";
			emu.funcs.recreateEmptyIframe();
			emu.funcs.shared.grayTheCanvas(emu.vars.dom.view["emuCanvas"]);
			emu.funcs.shared.textOnCanvas({ "canvas": emu.vars.dom.view["emuCanvas"], "text": " - STOPPED - " });
		}
		else {
			return;
		}
	},
	// * Will clear the cached game file data. Leaves the Emscripten core iframeHTML intact.
	emu_reset: function() {
		// Stop the emulator if it is active.
		emu.funcs.recreateEmptyIframe();

		// Clear last image from the canvas.
		emu.funcs.shared.clearTheCanvas(emu.vars.dom.view["emuCanvas"]);

		// Reset.
		emu.vars.gameFiles = [];
		emu.vars.gameFile = "";
		emu.vars.gameTitle = "";
		emu.vars.baseURL = "";
	},
	// * Will clear the cached game file data AND put a "GAME NOT LOADED" message on the emu canvas.
	emu_resetFull: function() {
		// Stop the emulator if it is active.
		emu.funcs.recreateEmptyIframe();

		// Clear last image from the canvas.
		emu.funcs.shared.clearTheCanvas(emu.vars.dom.view["emuCanvas"]);

		// Indicate that there is not a game loaded.
		emu.funcs.shared.textOnCanvas({ "canvas": emu.vars.dom.view["emuCanvas"], "text": " - GAME NOT LOADED - " });

		// Reset.
		emu.vars.gameFiles = [];
		emu.vars.gameFile = "";
		emu.vars.gameTitle = "";
		emu.vars.baseURL = "";
		// emu.vars.iframeHTML = "" ;

		emu.vars.dom.view.builtInGames_select.value = "";
	},
	// *
	emu_rotate: function() {
		console.log(JSON.stringify(emu.vars.iframeHTML.substr(0, 100), null, 1));
		emu.vars.iframeHTML="";
		console.log("cleared:", emu.vars.iframeHTML);
		return;
		console.log("emu_rotate: not ready yet!");
		alert("emu_rotate: not ready yet!");
		return;
		// emu_rotate
		var canvas = emu.vars.dom.view.emuCanvas;
		var container = emu.vars.dom.view.emscripten_iframe_container;

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

			// Get handle on select menu DOM.
			var emu_builtInGames_select1 = emu.vars.dom.view.builtInGames_select;
			// Clear the options.
			emu_builtInGames_select1.length = 1;
			// Clear the optgroups.
			emu_builtInGames_select1.querySelectorAll('optgroup').forEach(function(d, i, a) { d.remove(); });

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

			// Add the game data by category.
			categories.map(function(d, i, a) {
				if (d.data.length) {
					addGamesByCategory(d, emu_builtInGames_select1);
				}

			});

		};
		var formData = {
			"o": "emu_getBuiltInGamelist",
			"_config": { "processor": "emu_p.php" }
		};
		var prom1 = emu.funcs.shared.serverRequest(formData).then(resolved, emu.funcs.shared.rejectedPromise);
	},
	// * Used by the "PLAY" button in the game files list. Starts the specified game.
	loadGameFromList: function(game) {
		emu.vars.gameFile = game;
		emu.vars.gameTitle = game;
		console.log(emu.vars);
		emu.funcs.loadGame();
	},
	// *
	getGameFiles: function(methodType) {
		// Get DOM handles on the loading inputs.
		var emu_builtInGames_select1 = emu.vars.dom.view.builtInGames_select;
		var userFiles = emu.vars.dom.view["emu_FilesFromUser"];
		var jsonInput = emu.vars.dom.view["emu_FilesFromJSON"];
		var jsonInputUAM = emu.vars.dom.view["emu_FilesFromJSON_UAM"];

		// Allow the game load?
		if (methodType == 1 && emu_builtInGames_select1.value == "") { console.log("method #1: no value."); return; }
		if (methodType == 2 && !userFiles.files.length) { console.log("method #2: no value."); return; }
		if (methodType == 3 && jsonInput.value == "") { console.log("method #3: no value."); return; }
		if (methodType == 4 && jsonInputUAM.value == "") { console.log("method #4: no value."); return; }

		var addFileListToDisplay = function() {
			let doNotCreateLinks = true;

			// Get handle on destination div and clear it..
			var destdiv = document.querySelector("#emu_filesList_div");
			destdiv.innerHTML = "";

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
				let filesizeHTML = filesize.toLocaleString() + ``;

				// Determine a shorter filename so that it will fit.
				let shortenedName = "";
				if (record.length > 23) { shortenedName = record.substr(0, 15) + "..." + record.substr(-6); }
				else { shortenedName = record; }

				// let playButton = "<button>PLAY</button>";
				let linkHTML = "<button>linkHTML</button>";

				let playButton = "<input type=\"button\" value=\"PLAY\" style=\"width:85%;font-size: 10px;\" onclick=\"emu.funcs.loadGameFromList('" + record + "');\">";
				// let linkHTML     = `<a title="`+record+`" href='`+(href)+`' target="_blank">`+shortenedName+`</a>`;

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
		}
		var finishFileLoading = function(proms, res, loadNow) {
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

						// Get the game title.
						emu.vars.gameTitle = res.remoteload.title;

						emu.vars.baseURL = res.remoteload.baseURL;

						// Games are loaded. Make sure we can continue.
						var doWeLoadTheGame = true;
						if (!emu.vars.gameFile.length) { console.log("No gamefile in emu.gameFile!");
							doWeLoadTheGame = false; }
						if (!emu.vars.gameFiles.length) { console.log("No game files in emu.gameFiles!");
							doWeLoadTheGame = false; }
						if (!emu.vars.gameTitle.length) { console.log("No gameTitle files in emu.gameTitles!");
							doWeLoadTheGame = false; }
						if (!emu.vars.baseURL.length) { console.log("No baseURL in emu.baseURL!");
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
											emu.vars.gameTitle = emu.vars.gameFiles[i].name;
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
		var returnJSON_byGameId = function(gameid) {
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
		var loadUserFilelist = function() {
			// Get the file list.
			// Use a file reader to read as array buffer.
			// Add each file to the gameFiles array.
			// Use Promise.all instead of something recursive.
			// console.log(userFiles.files, new Uint8Array( userFiles.files[0] ));

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

			finishFileLoading(proms, null, true);
		};
		var fixUzeHeader = function(filename, data) {
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
			let gameid = emu_builtInGames_select1.value;
			returnJSON_byGameId(gameid).then(
				function(res) {
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
	// * Removes any and all iframes from with the emscripten_iframe_container.
	emu_removeEmuIframes: function() {
		// Remove previous iframe(s).
		var container = document.querySelector('#emscripten_iframe_container');
		var previousIframes = container.querySelectorAll('iframe');
		if (previousIframes.length) {
			for (var i = 0; i < previousIframes.length; i++) {
				previousIframes[i].remove();
			}
		}
	},
	// * Loads the cached game files into a new Emscripten instance.
	loadGame: function() {
		if (!emu.vars.gameFiles.length) {
			// console.log("No files are loaded.");
			return;
		}

		// Runs after the Emscripten core files are loaded.
		var emuFilesReady = function(data) {
			var newHTML = "";

			// If the iframeHTML is NOT already cached.
			if (!emu.vars.iframeHTML.length) {
				// Create config var.
				var config = '<script name="cuzebox_js">' + data["cuzebox.js"] + '</script>';

				// Fix the dataurl prefix.
				data["cuzebox.html.mem"] = data["cuzebox.html.mem"].replace("data:text/html;base64,", "data:application/octet-stream;base64,");

				// Replace the filename reference with the dataurl.
				config = config.replace("cuzebox.html.mem", data["cuzebox.html.mem"]);

				// Replace the placeholder text in the cuzebox_minimal.html file with the config var.
				newHTML = data["cuzebox_minimal.html"].replace("<!-- PLACE HOLDER FOR REPLACEMENT -->", config);

				// Cache the full html (including the replaced stuff) for easy reloading later.
				emu.vars.iframeHTML = newHTML;
			}
			// If the iframeHTML is already cached.
			else {
				// console.log("PART2: Using cached copy of the emulator.");
				newHTML = emu.vars.iframeHTML;
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
			newIframe.onload = function() {
				// Open the iframe contentWindow.document.
				newIframe.contentWindow.document.open();

				// Write the newHTML to into it.
				newIframe.contentWindow.document.write(newHTML);

				// Close the iframe contentWindow.document.
				newIframe.contentWindow.document.close();

				// Detect auto-pause checkbox value.
				setTimeout(function() {
					// If checked then pauseMainLoop for Emscripten
					if (!emu.vars.dom.view["emuControls_autopause_chk"].classList.contains("enabled")) {
						emu.funcs.emu_iframeFocusing(null, "mouseenter");
					}
					// If not checked then just set the status as "Accepting input"
					else {
						// But NOT if the mouse is not currently over the emu window or gamepads.
						var hasHover1 = emu.vars.dom.view["emu_emulator_window"].classList.contains("hovered");
						var hasHover2 = emu.vars.dom.view["emu_misc_gamepads"].classList.contains("hovered");
						if (!hasHover1 && !hasHover2) { emu.funcs.emu_iframeFocusing(null, "mouseleave"); }
					}
				}, 2000);
			};

			// Remove previous emulator iframes and event listeners.
			if (document.querySelector("#emscripten_iframe") != null) {
				emu.funcs.emu_removeEmuIframes();
			}

			// Append the iframe to the container.
			container.appendChild(newIframe);
		};

		// Runs after the blank iframe loads.
		document.querySelector("#emscripten_iframe").onload = function() {
			document.querySelector("#emscripten_iframe").onload = null;
			if (emu.vars.iframeHTML.length) {
				// console.log("PART 1: Using cached copy of the emulator.");
				emuFilesReady(null);
			}
			else {
				// Get the cuzebox_minimal.html file, cuzebox.html.mem, and the cuzebox.js files.
				var proms = [];
				proms.push({
						"filename": "cuzebox_minimal.html",
						"data": "",
						"prom": emu.funcs.shared.serverRequest({
							"o": "",
							"_config": { "responseType": "text", "processor": "cuzebox_minimal.html" }
						})
					}, {
						"filename": "cuzebox.js",
						"data": "",
						"prom": emu.funcs.shared.serverRequest({
							"o": "",
							"_config": { "responseType": "text", "processor": "cuzebox.js" }
						})
					}, {
						"filename": "cuzebox.html.mem",
						"data": "",
						"prom": new Promise(function(resolve, reject) {
							emu.funcs.shared.serverRequest({
								"o": "",
								"_config": { "responseType": "blob", "processor": "cuzebox.html.mem" }
							}).then(
								function(res) {
									var reader = new FileReader();
									reader.onload = (function(e) { resolve(e.target.result); });
									reader.readAsDataURL(res);
								},
								function(res) { console.log("error:", res); }
							);
						})
					},
					// data:application/octet-stream;base64,
				);
				var promsOnly = proms.map(function(d, i, a) { return d.prom; });
				var filenamesOnly = proms.map(function(d, i, a) { return d.filename; });
				Promise.all(promsOnly).then(
					function(res) {
						var data = {};
						res.map(function(d, i, a) { data[filenamesOnly[i]] = res[i]; });
						emuFilesReady(data);
					},
					emu.funcs.shared.rejectedPromise
				);
			}
		};

		emu.funcs.shared.clearTheCanvas(emu.vars.dom.view["emuCanvas"]);
		emu.funcs.shared.textOnCanvas({ "canvas": emu.vars.dom.view["emuCanvas"], "text": " - STARTING GAME... - " });

		document.querySelector("#emscripten_iframe").src = "about:blank";
	},
	// * Sets/Clears focus to the emu iframe, pauses/unpauses Emscripten.
	emu_iframeFocusing: function(e, typeOverride) {
		// Temp variable.
		var type = "";

		// Get DOM handle to the emu iframe.
		var emscripten_iframe = document.querySelector("#emscripten_iframe");

		// Is there an iframe there?
		if (null == emscripten_iframe) { console.log("no emscripten iframe."); return; }

		// Is it loaded and ready?
		else if (
			emscripten_iframe.contentWindow.emu &&
			emscripten_iframe.contentWindow.emulatorIframeIsReady === true
		) {
			// Get the type.
			if (undefined == e) { type = typeOverride; }
			else { type = e.type; }

			// Don't pause if the auto-pause checkbox is checked.
			if (!emu.vars.dom.view["emuControls_autopause_chk"].classList.contains("enabled")) { type = "mouseenter"; }

			// Make sure that the specified type is an accepted type.
			if (["mouseenter", "mouseleave"].indexOf(type) == -1) { return; }

			// Should we focus the emulator iframe?
			if (["mouseenter"].indexOf(type) != -1) {
				emscripten_iframe.focus();
				// emscripten_iframe.contentWindow.Module.resumeMainLoop();
				emscripten_iframe.contentWindow.emu.resumeMainLoop();
			}

			// Should we blur the emulator iframe focus?.
			else if (["mouseleave"].indexOf(type) != -1) {
				emscripten_iframe.blur();
				// emscripten_iframe.contentWindow.Module.pauseMainLoop();
				emscripten_iframe.contentWindow.emu.pauseMainLoop();

				// Draw PAUSED to the canvas.
				emu.funcs.shared.grayTheCanvas(emu.vars.dom.view["emuCanvas"]);
				emu.funcs.shared.textOnCanvas({ "canvas": emu.vars.dom.view["emuCanvas"], "text": " - PAUSED - " });
			}
		}

	},
	// * Accepts gamefiles from the user.
	emu_processUserUploads: function(e) {
		emu.funcs.getGameFiles(2);
	},
	// * Just clicks the invisible upload button.
	emu_clickUserUpload: function(e) {
		emu.vars.dom.view["emu_FilesFromUser"].click();
	},

	// * Sends keyboard events to the iframe.
	emu_sendKeyEvent: function(type, key, gamePadNumber) {
		// Get DOM handle to the emu iframe.
		var emscripten_iframe = document.querySelector("#emscripten_iframe");

		// Is there an iframe there?
		if (null == emscripten_iframe) {
			// console.log("No iframe here!");
			return;
		}

		// Create temp variables.
		var newEvent = undefined;
		var newEvent_ALT = undefined;
		let altKey = undefined;
		let location = undefined;

		// Determine which key was specifed and create an event for it.
		switch (key) {
			// case "key_AltGr"  : { newEvent = window.crossBrowser_initKeyboardEvent(type, {"altKey":false, "charCode":0,"code":"AltRight","key":"Alt","keyCode":18,"which":18,"location":2})         ; break; }
			case "key_RALT":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "altKey": true, "charCode": 0, "code": "AltRight", "key": "Alt", "keyCode": 18, "which": 18, "location": 2 }); break; }
			case "key_F1":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F1", "key": "F1", "keyCode": 112, "which": 112, "location": 0 }); break; }
			case "key_F2":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F2", "key": "F2", "keyCode": 113, "which": 113, "location": 0 }); break; }
			case "key_F3":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F3", "key": "F3", "keyCode": 114, "which": 114, "location": 0 }); break; }
			case "key_F4":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F4", "key": "F4", "keyCode": 115, "which": 115, "location": 0 }); break; }
			case "key_F5":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F5", "key": "F5", "keyCode": 116, "which": 116, "location": 0 }); break; }
			case "key_F6":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F6", "key": "F6", "keyCode": 117, "which": 117, "location": 0 }); break; }
			case "key_F7":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F7", "key": "F7", "keyCode": 118, "which": 118, "location": 0 }); break; }
			case "key_F8":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F8", "key": "F8", "keyCode": 119, "which": 119, "location": 0 }); break; }
			case "key_F9":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F9", "key": "F9", "keyCode": 120, "which": 120, "location": 0 }); break; }
			case "key_F10":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F10", "key": "F10", "keyCode": 121, "which": 121, "location": 0 }); break; }
			case "key_F11":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F11", "key": "F11", "keyCode": 122, "which": 122, "location": 0 }); break; }
			case "key_F12":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "F12", "key": "F12", "keyCode": 123, "which": 123, "location": 0 }); break; }
			case "key_Q":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "KeyQ", "key": "q", "keyCode": 81, "which": 81, "location": 0 }); break; }
			case "key_W":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "KeyW", "key": "w", "keyCode": 87, "which": 87, "location": 0 }); break; }
			case "key_A":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "KeyA", "key": "a", "keyCode": 65, "which": 65, "location": 0 }); break; }
			case "key_S":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "KeyS", "key": "s", "keyCode": 83, "which": 83, "location": 0 }); break; }
			case "key_ENTER":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "Enter", "key": "Enter", "keyCode": 13, "which": 13, "location": 0 }); break; }
			case "key_SPACE":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "Space", "key": " ", "keyCode": 32, "which": 32, "location": 0 }); break; }
			case "key_UP":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ArrowUp", "key": "ArrowUp", "keyCode": 38, "which": 38, "location": 0 }); break; }
			case "key_DOWN":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ArrowDown", "key": "ArrowDown", "keyCode": 40, "which": 40, "location": 0 }); break; }
			case "key_LEFT":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ArrowLeft", "key": "ArrowLeft", "keyCode": 37, "which": 37, "location": 0 }); break; }
			case "key_RIGHT":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ArrowRight", "key": "ArrowRight", "keyCode": 39, "which": 39, "location": 0 }); break; }
			case "key_LSHIFT":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ShiftLeft", "key": "Shift", "keyCode": 16, "which": 16, "location": 1 }); break; }
			case "key_RSHIFT":
				{ newEvent = window.crossBrowser_initKeyboardEvent(type, { "charCode": 0, "code": "ShiftRight", "key": "Shift", "keyCode": 16, "which": 16, "location": 2 }); break; }
			default:
				{ break; }
		}

		// Dispatch the key event.
		if (newEvent) {
			emscripten_iframe.contentDocument.dispatchEvent(newEvent);
		}

	},
	addAllListeners: function() {
		// Add the event listeners for the quick nav buttons.
		var allTitleNavGroups = document.querySelectorAll(".sectionDivs_title_options");
		allTitleNavGroups.forEach(function(d, i, a) {
			d.querySelectorAll(".navOptions").forEach(function(d2, i2, a2) {
				d2.addEventListener("click", function() { emu.funcs.nav.changeView(this.getAttribute("newview")); }, false);
			});
		});

		// Handle new built-in DB game selection.
		emu.vars.dom.view.builtInGames_select.addEventListener("change", function() { emu.funcs.getGameFiles("1") }, false);

		// Handle input focus on the emulator iframe. (Delegated)
		emu.vars.dom.view["emu_misc_gamepads"].addEventListener("mouseenter", function() { this.classList.add("hovered");
			emu.funcs.emu_iframeFocusing(null, "mouseenter"); }, false);
		emu.vars.dom.view["emu_misc_gamepads"].addEventListener("mouseleave", function() { this.classList.remove("hovered");
			emu.funcs.emu_iframeFocusing(null, "mouseleave"); }, false);
		emu.vars.dom.view["emu_emulator_window"].addEventListener("mouseenter", function() { this.classList.add("hovered");
			emu.funcs.emu_iframeFocusing(null, "mouseenter"); }, false);
		emu.vars.dom.view["emu_emulator_window"].addEventListener("mouseleave", function() { this.classList.remove("hovered");
			emu.funcs.emu_iframeFocusing(null, "mouseleave"); }, false);

		// Hidden file upload button.
		emu.vars.dom.view["emu_FilesFromUser"].addEventListener("change", emu.funcs.emu_processUserUploads, false);

		// Visible upload button.
		emu.vars.dom.view["emu_FilesFromUser_viewableBtn"].addEventListener("click", emu.funcs.emu_clickUserUpload, false);

		emu.vars.dom.view["emuControls_stop"].addEventListener("click", emu.funcs.stopEmu, false);
		emu.vars.dom.view["emuControls_reload"].addEventListener("click", emu.funcs.loadGame, false);
		emu.vars.dom.view["emuControls_unload"].addEventListener("click", emu.funcs.emu_resetFull, false);
		emu.vars.dom.view["emuControls_rotate"].addEventListener("click", emu.funcs.emu_rotate, false);

		emu.vars.dom.view["emuControls_autopause_btn"].addEventListener("click", function() {
			// Get a handle on the DOM element.
			let autopause_chk = emu.vars.dom.view["emuControls_autopause_chk"];

			// Toggle the enabled class.
			autopause_chk.classList.toggle("enabled");

			// Determine if the emu should be paused or unpaused.
			if (autopause_chk.classList.contains("enabled")) { emu.funcs.emu_iframeFocusing(null, "mouseenter"); }
			else { emu.funcs.emu_iframeFocusing(null, "mouseleave"); }
		}, false);

		emu.vars.dom.view["emuControls_QUALITY"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_F2", null); }, false);
		emu.vars.dom.view["emuControls_QUALITY"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_F2", null); }, false);
		emu.vars.dom.view["emuControls_DEBUG"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_F3", null); }, false);
		emu.vars.dom.view["emuControls_DEBUG"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_F3", null); }, false);
		emu.vars.dom.view["emuControls_FLICKER"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_F7", null); }, false);
		emu.vars.dom.view["emuControls_FLICKER"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_F7", null); }, false);
		emu.vars.dom.view["emuControls_PAUSE"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_F9", null); }, false);
		emu.vars.dom.view["emuControls_PAUSE"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_F9", null); }, false);
		emu.vars.dom.view["emuControls_STEP"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_F10", null); }, false);
		emu.vars.dom.view["emuControls_STEP"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_F10", null); }, false);

		// Y
		emu.vars.dom.view["emuGamepad_1_key_Q"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_Q", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_Q"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_Q", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_Q"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_Q", 1); }, false);

		// X
		emu.vars.dom.view["emuGamepad_1_key_W"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_W", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_W"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_W", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_W"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_W", 1); }, false);

		// B
		emu.vars.dom.view["emuGamepad_1_key_A"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_A", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_A"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_A", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_A"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_A", 1); }, false);

		// A
		emu.vars.dom.view["emuGamepad_1_key_S"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_S", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_S"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_S", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_S"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_S", 1); }, false);

		emu.vars.dom.view["emuGamepad_1_key_ENTER"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_ENTER", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_ENTER"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_ENTER", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_ENTER"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_ENTER", 1); }, false);

		emu.vars.dom.view["emuGamepad_1_key_SPACE"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_SPACE", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_SPACE"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_SPACE", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_SPACE"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_SPACE", 1); }, false);

		emu.vars.dom.view["emuGamepad_1_key_UP"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_UP", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_UP"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_UP", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_UP"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_UP", 1); }, false);

		emu.vars.dom.view["emuGamepad_1_key_DOWN"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_DOWN", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_DOWN"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_DOWN", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_DOWN"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_DOWN", 1); }, false);

		emu.vars.dom.view["emuGamepad_1_key_LEFT"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_LEFT", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_LEFT"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_LEFT", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_LEFT"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_LEFT", 1); }, false);

		emu.vars.dom.view["emuGamepad_1_key_RIGHT"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RIGHT", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_RIGHT"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_RIGHT", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_RIGHT"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_RIGHT", 1); }, false);

		emu.vars.dom.view["emuGamepad_1_key_LSHIFT"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_LSHIFT", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_LSHIFT"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_LSHIFT", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_LSHIFT"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_LSHIFT", 1); }, false);

		emu.vars.dom.view["emuGamepad_1_key_RSHIFT"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RSHIFT", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_RSHIFT"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_RSHIFT", 1); }, false);
		emu.vars.dom.view["emuGamepad_1_key_RSHIFT"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_RSHIFT", 1); }, false);

		// Y
		emu.vars.dom.view["emuGamepad_2_key_Q"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RALT", 2);
			emu.funcs.emu_sendKeyEvent("keydown", "key_Q", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_Q"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_Q", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_Q"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_Q", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);

		// X
		emu.vars.dom.view["emuGamepad_2_key_W"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RALT", 2);
			emu.funcs.emu_sendKeyEvent("keydown", "key_W", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_W"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_W", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_W"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_W", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);

		// B
		emu.vars.dom.view["emuGamepad_2_key_A"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RALT", 2);
			emu.funcs.emu_sendKeyEvent("keydown", "key_A", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_A"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_A", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_A"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_A", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);

		// A
		emu.vars.dom.view["emuGamepad_2_key_S"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RALT", 2);
			emu.funcs.emu_sendKeyEvent("keydown", "key_S", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_S"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_S", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_S"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_S", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);

		emu.vars.dom.view["emuGamepad_2_key_ENTER"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RALT", 2);
			emu.funcs.emu_sendKeyEvent("keydown", "key_ENTER", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_ENTER"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_ENTER", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_ENTER"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_ENTER", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);

		emu.vars.dom.view["emuGamepad_2_key_SPACE"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RALT", 2);
			emu.funcs.emu_sendKeyEvent("keydown", "key_SPACE", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_SPACE"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_SPACE", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_SPACE"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_SPACE", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);

		emu.vars.dom.view["emuGamepad_2_key_UP"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RALT", 2);
			emu.funcs.emu_sendKeyEvent("keydown", "key_UP", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_UP"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_UP", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_UP"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_UP", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);

		emu.vars.dom.view["emuGamepad_2_key_DOWN"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RALT", 2);
			emu.funcs.emu_sendKeyEvent("keydown", "key_DOWN", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_DOWN"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_DOWN", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_DOWN"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_DOWN", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);

		emu.vars.dom.view["emuGamepad_2_key_LEFT"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RALT", 2);
			emu.funcs.emu_sendKeyEvent("keydown", "key_LEFT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_LEFT"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_LEFT", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_LEFT"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_LEFT", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);

		emu.vars.dom.view["emuGamepad_2_key_RIGHT"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RALT", 2);
			emu.funcs.emu_sendKeyEvent("keydown", "key_RIGHT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_RIGHT"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_RIGHT", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_RIGHT"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_RIGHT", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);

		emu.vars.dom.view["emuGamepad_2_key_LSHIFT"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RALT", 2);
			emu.funcs.emu_sendKeyEvent("keydown", "key_LSHIFT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_LSHIFT"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_LSHIFT", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_LSHIFT"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_LSHIFT", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);

		emu.vars.dom.view["emuGamepad_2_key_RSHIFT"].addEventListener("mousedown", function() { emu.funcs.emu_sendKeyEvent("keydown", "key_RALT", 2);
			emu.funcs.emu_sendKeyEvent("keydown", "key_RSHIFT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_RSHIFT"].addEventListener("mouseup", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_RSHIFT", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);
		emu.vars.dom.view["emuGamepad_2_key_RSHIFT"].addEventListener("mouseleave", function() { emu.funcs.emu_sendKeyEvent("keyup", "key_RSHIFT", 2);
			emu.funcs.emu_sendKeyEvent("keyup", "key_RALT", 2); }, false);

		document.addEventListener("fullscreenchange", function(e) {
			// console.log(e, this);
			document.querySelector('#emscripten_iframe').contentWindow.resizeIframe();
		}, false);

		emu.vars.dom.view["emu_FilesFromJSON"].addEventListener("click", function() { this.select(); }, false);
		emu.vars.dom.view["emu_FilesFromJSON_load"].addEventListener("click", function() { emu.funcs.getGameFiles("3"); }, false);

		// Misc views: nav buttons
		emu.vars.dom.view["emu_misc_navs"].forEach(function(d, i, a) {
			d.addEventListener("click", function() { emu.funcs.nav.changeMiscView(this.getAttribute("view"), this) }, false);
		});
	},

};
emu.funcs.UAM = {
	// * Show UAM.
	enableUAM: function() {
		// Get values from UAM.
		emu.vars.originUAM = true;
		emu.vars.uamwindow = window.top;
		emu.vars.uamwindow_objs = emu.vars.uamwindow._debug_displayCustomGlobals(true);
		emu.vars.user_id = emu.vars.uamwindow.shared.user_id;

		// Unhide UAM.
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
		document.querySelector("#emu_emulator").classList.remove("largerEmuWindow");
		document.querySelector("#emscripten_iframe_container").classList.remove("largerEmuWindow_container");
	},
	// * Hide UAM.
	disableUAM: function() {
		// Unset the values that came from UAM.
		emu.vars.originUAM = false;
		emu.vars.uamwindow = undefined;
		emu.vars.uamwindow_objs = undefined;
		emu.vars.user_id = undefined;

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
		document.querySelector("#emu_emulator").classList.add("largerEmuWindow");
		document.querySelector("#emscripten_iframe_container").classList.add("largerEmuWindow_container");
	},
	// * UAM setup: Show UAM, set DOM, Listeners, get game list.
	setupUAM: function() {
		// Show UAM, set some variables.
		emu.funcs.UAM.enableUAM();

		// Wait for UAM to finish loading... then continue.
		emu.vars.uamwindow.shared.UAMisReady.then(function() {
			document.querySelector("#bodyHeader").style.display = "none";
			document.querySelector("#bodyFooter").style.display = "none";
			document.getElementById('bodyContainer').scrollIntoView(emu.funcs.nav.scrollIntoView_options);

			// Set up the UAM DOM.
			emu.funcs.domHandleCache_populate_UAM();

			// Add the UAM event listeners.
			emu.funcs.UAM.addEventListeners();

			emu.vars.dom.view["emuControls_autopause_chk"].classList.add("enabled");

			// Refresh the UAM games list data.
			// Auto-select the user's default game.
			emu.funcs.UAM.getGamesListUAM();

			// Switch to the main emulator view.
			emu.funcs.nav.changeView("VIEW");
		});

	},
	// * Compiles the selected UAM game.
	compileGameUAM: function() {
		// Get the current user's user id.
		let user_id = emu.vars.user_id;
		// Prevent this action if the user_id was not found.
		if (!user_id) {
			console.log("No user_id. Are you logged into UAM?");
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
				console.log(res);
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
				output1.innerHTML = `<div style='color:greenyellow;'><pre style="` + preStyle + `">` + thestring2 + `</pre><br>`;

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

				var bss_objects = table_from_Obj(res.info2.bss_objects.data, res.info2.bss_objects['caption']);
				var text_funcs = table_from_Obj(res.info2.text_funcs.data, res.info2.text_funcs['caption']);
				var text_objects = table_from_Obj(res.info2.text_objects.data, res.info2.text_objects['caption']);
				var text_objects_progmem = table_from_Obj(res.info2.text_objects_progmem.data, res.info2.text_objects_progmem['caption']);
				var other = table_from_Obj(res.info2.other.data, res.info2.other['caption']);

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
					.replace(/\r\n/g, "\n") // Normalize to Unix line endings.
					.replace(/\n\n/g, "\n") // Remove double line-breaks;
					.replace("AVR Memory Usage\n", "") // Remove this line.
					.replace("----------------\n", "") // Remove this line.
					.replace("Device: atmega644\n", "") // Remove this line.
					.replace("(.text + .data + .bootloader)\n", "") // Remove this line.
					.replace("(.data + .bss + .noinit)\n\n", "") // Remove this line.
					.replace(/  /g, " ") // Replace all double-spaces with one space.
					.replace(/\n/g, "\r\n") // Normalize to Windows line endings.
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

	// * Queries the UAM database for games that match the user's user_id.
	getGamesListUAM: function() {
		// Queries the database for the current user's games.

		// Get the current user's user id.
		let user_id = emu.vars.user_id;
		if (!user_id) {
			console.log("No user_id. Are you logged into UAM?");
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
	}

};
emu.funcs.downloads = {

};
emu.funcs.shared = {
	// * Display message on the canvas in the top-left corner.
	textOnCanvas: function(obj) {
		if (!obj) { obj = {}; }
		if (obj.canvas == undefined) { obj.canvas = emu.vars.dom.view["emuCanvas"]; }
		if (obj.font == undefined) { obj.font = "40px monospace"; }
		if (obj.textAlign == undefined) { obj.textAlign = "left"; }
		if (obj.backgroundColor == undefined) { obj.backgroundColor = "rgba(255, 0, 0, 0.5)"; }
		if (obj.fontColor == undefined) { obj.fontColor = "white"; }
		if (obj.text == undefined) { obj.text = "     "; }

		let ctx = obj.canvas.getContext("2d");
		ctx.font = obj.font;
		ctx.textAlign = obj.textAlign;

		// Don't let messages go beyond the canvas.
		if (obj.text.length > 22) { obj.text = obj.text.substr(0, 22); }

		ctx.fillStyle = obj.backgroundColor;
		// ctx.fillRect(0,0, Math.floor(ctx.measureText(obj.text).width), 48);
		ctx.fillRect(0, 0, Math.floor(obj.canvas.width), 48);

		ctx.fillStyle = obj.fontColor;
		ctx.fillText(obj.text, 0, 40);
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
				console.log("Uploading this many files:", formData._config.filesHandle.files.length);
				for (var i = 0; i < formData._config.filesHandle.files.length; i++) {
					console.log("On file " + (i + 1) + " of " + formData._config.filesHandle.files.length, "(" + formData._config.filesHandle.files[i].name + ")");
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
	}
};
emu.funcs.nav = {
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

		var emu_view = document.querySelector("#emu_view");
		var emu_debug1 = document.querySelector("#emu_debug1");
		var emu_debug2 = document.querySelector("#emu_debug2");
		var emu_db = document.querySelector("#emu_db");

		bodyContainer.scrollIntoView(emu.funcs.nav.scrollIntoView_options);

		var hideSections = function() {
			allSectionDivs.forEach(function(d, i, a) {
				d.classList.remove("active");
				d.classList.add("hidden");
			});
		}

		switch (newview) {
			case "VIEW":
				{ hideSections();emu_view.classList.add("active");emu_view.classList.remove("hidden"); break; }
			case "DEBUG1":
				{ hideSections();emu_debug1.classList.add("active");emu_debug1.classList.remove("hidden"); break; }
			case "DEBUG2":
				{ hideSections();emu_debug2.classList.add("active");emu_debug2.classList.remove("hidden"); break; }
			case "DB":
				{ hideSections();emu_db.classList.add("active");emu_db.classList.remove("hidden"); break; }
			default:
				{ break; }
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
emu.funcs.view = {

};
emu.funcs.db = {};

emu.fullscreen = {
	test: function(elem) {
		var i = document.getElementById("emscripten_iframe_container_outer");
		// var i = document.getElementById("emscripten_iframe_container");
		// var i = document.getElementById("emu_emulator");

		// go full-screen
		if (i.requestFullscreen) { i.requestFullscreen(); }
		else if (i.webkitRequestFullscreen) { i.webkitRequestFullscreen(); }
		else if (i.mozRequestFullScreen) { i.mozRequestFullScreen(); }
		else if (i.msRequestFullscreen) { i.msRequestFullscreen(); }

		// setTimeout(function(){
		// 	document.querySelector('#emscripten_iframe').contentWindow.resizeIframe();
		// }, 1000);
	},
};


window.onload = function() {
	window.onload = null;

	console.log("****************************************");
	console.log("*** -- Online Uzebox Emulator v2b -- ***");
	console.log("****************************************");

	var continueApp = function() {
		// Populate the DOM handle caches.
		emu.funcs.domHandleCache_populate();
		// Add the event listeners.
		emu.funcs.addAllListeners();

		// Get the build-in games list.
		emu.funcs.emu_getBuiltInGamelist();

		// Check if this application has been loaded under UAM.
		var messageText = "<u><b>ONLINE UZEBOX EMULATOR</b></u><br><br>Choose a game.";
		try {
			// Loaded via iframe?
			if (window.self !== window.top) {
				// IN UAM?
				// Can the originUAM key be detected?
				if (window.top.shared.originUAM == true) {
					console.log("EMULATOR - ORIGIN: UAM");

					// Set up UAM.
					emu.funcs.UAM.setupUAM();

					messageText = "<u><b>ONLINE UZEBOX EMULATOR</b></u><br><br>Choose a game.<br><br>(<span style='color:yellow;font-size: 90%;'>UAM ENABLED</span>)";
				}
				else {
					emu.funcs.UAM.disableUAM();
				}
			}
			else {
				emu.funcs.UAM.disableUAM();
			}
		}
		catch (e) {
			emu.funcs.UAM.disableUAM();
		}

		emu.funcs.recreateEmptyIframe();
		emu.funcs.shared.clearTheCanvas(emu.vars.dom.view["emuCanvas"]);
		// emu.funcs.shared.grayTheCanvas( emu.vars.dom.view["emuCanvas"] );
		emu.funcs.shared.textOnCanvas({ "canvas": emu.vars.dom.view["emuCanvas"], "text": " - GAME NOT LOADED - " });

		// Adjust the canvas output.
		document.querySelectorAll('canvas').forEach(function(d, i) {
			emu.funcs.shared.setpixelated(d);
		});

		// Switch to the default view.
		emu.funcs.nav.changeView("VIEW");
	};


	// Feature Loader config:
	featureDetection.config.usePhp = true;
	featureDetection.config.useAsync = true;
	featureDetection.config.includeText = false; // Using false makes the database download smaller.
	featureDetection.config.includeWebsite = false; // Using false makes the database download smaller.
	// Load these libraries also:
	featureDetection.config.userReqs = [
		// "X2JS"    ,
		// "JSZip"    ,
		// "FileSaver",
	];
	// Feature detect/replace.
	featureDetection.funcs.init(continueApp);

};
