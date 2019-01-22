/* global performance */

// NOTE: "eval" is used here.
// Eval should NOT be used on any code that you do not 100% control.
// All code that will be seen by eval actually comes from a folder within the application.
// The code cannot be changed by a third party unless the server copy is actually updated.

var featureDetection = {
	reqs:{
	},
	backup_console : {},
	config:{
		usePhp                : false ,
		useAsync              : true  ,
		includeText           : false ,
		includeWebsite        : false ,
		hideProgressInConsole : false ,
		useLocalStorageCache  : false ,
		userReqs   : [] ,
		userFiles  : []
	},
	version: "vd1 1.1.0",
	funcs:{
		// UNFINISHED
		applyUserJsFiles : function(){
			return new Promise(function(resolve,reject){ resolve(); });
		},

		// Performs eval within the specified context on a string.
		evalInContext             : function(js, context) {
			// featureDetection.funcs.evalInContext(data, window);
			return function() { eval(js) ; }.call(context);
		} ,
		// Checks if the feature has already been loaded.
		isTheFeatureAlreadyLoaded : function(feature){
			// NOTE: Returning a true means that the feature already exists or it is an unknown feature.
			// NOTE: Returning a true means do not try to load the specified feature.

			var keys = Object.keys(featureDetection.reqs);

			// Check right away if the feature's test will pass.
			try{
				// Does the test pass?
				if( eval(featureDetection.reqs[feature].test) === false ){
					// This feature does not exist and CAN be loaded.
					return false;
				}
				else                                                    {
					// This feature already exists.
					return true;
				}
			}
			catch(e){
				// Is the requested feature one that is known to us?
				if     ( keys.indexOf(feature) == -1 ){
					console.warn("  -- UNKNOWN FEATURE:", feature, "(E:1)");
					// Unknown feature. Don't try to load it.
					return true;
				}

				// Similar check to the one above (likely redunant.)
				else if( featureDetection.reqs[feature] == undefined ){
					console.warn("  -- UNKNOWN FEATURE:", feature, "(E:2)");
					// Unknown feature. Don't try to load it.
					return true;
				}

				// This feature CAN be loaded.
				else{
					// This feature does not exist and CAN be loaded.
					return false;
				}
			}

		}      ,
		// Loads the specified features via an array.
		applyFeatures_fromList    : function(features){
			// Used if the loading method was PHP:
			var PHP_combinedFeatures2 = function(features){
				return new Promise(function(resolve,reject){
					var new_features = [];
					for(var i=0; i<features.length; i+=1){
						// Remove the feature from the list if it is already known to be loaded.
						if( ! featureDetection.funcs.isTheFeatureAlreadyLoaded( features[i] ) ){
							new_features.push( features[i] );
						}
					}

					if( !new_features.length ) {
						resolve();
						return;
					}

					var finished = function(data) {
						data = xhr.response;
						data = JSON.parse(data);

						// Find the matching key in the response. Eval the response. Perform the test again. Indicate success or failure.
						new_features.map(function(d,i,a){
							// Eval this entry.
							featureDetection.funcs.evalInContext(data[d], window);

							// Perform test then indicate success or failure.
							try{
								if( eval(featureDetection.reqs[d].test) == true ){
									featureDetection.reqs[d].have=true;
									console.log("  LOADED: ("+featureDetection.reqs[d].type+") ->" , d ,  " (OK)" );

									// if(featureDetection.config.useLocalStorageCache){}
								}
								else{
									featureDetection.reqs[d].have=false;
									featureDetection.backup_console.log("** FAILURE TO LOAD: ("+featureDetection.reqs[d].type+") ->" , d ,  " (ERROR)" );
									throw "Feature was NOT successfully loaded: "+d;
								}
							}
							catch(e){
								featureDetection.reqs[d].have=false;
								featureDetection.backup_console.log("** FAILURE TO LOAD: ("+featureDetection.reqs[d].type+") ->" , d ,  " (ERROR)" );
								throw "Feature was NOT successfully loaded: "+d;
							}
						});

						resolve();
					};
					var error = function(data) {
						featureDetection.backup_console.log("error:", this, data);
						reject(data);
					};
					var xhr = new XMLHttpRequest();
					xhr.addEventListener("load", finished);
					xhr.addEventListener("error", error);

					var fd   = new FormData();
					var o    = "getData2" ;
					fd.append("o"           , o);
					fd.append("missingReqs" , new_features );

					var url = "_featureLoader/_p/featureLoader_p.php?o="+o+"&missingReqs="+new_features.join(",");
					// console.log(url);
					xhr.open(
						"POST", // Type of method (GET/POST)
						url  // Destination
					, true);
					xhr.send(fd);

				});
			};
			// Used if the loading method was not PHP:
			var JS_features = function(features, syncType){
				var loadFeature = function(feature){
					return new Promise(function(resolve, reject){
						// Skip the loading of this feature if it is already known to be loaded.
						if( featureDetection.funcs.isTheFeatureAlreadyLoaded( feature ) ){
							resolve();
							return;
						}

						var type = featureDetection.reqs[feature].type;
						var url  = featureDetection.reqs[feature].url;

						var finished = function(data) {
							data = xhr.response;
							// Eval the JavaScript that was sent back. This will load the code.
							featureDetection.funcs.evalInContext(data, window);

							// Check if the feature's test will pass.
							try{
								// Does the test pass?
								if( eval(featureDetection.reqs[feature].test) == true ){
									featureDetection.reqs[feature].have=true;
									console.log("  LOADED: ("+featureDetection.reqs[feature].type+") ->" , feature ,  " (OK)" );

									// if(featureDetection.config.useLocalStorageCache){}
								}
								else {
									featureDetection.reqs[feature].have=false;
									throw "Feature was NOT successfully loaded.";
								}
							}
							catch(e){
								featureDetection.reqs[feature].have=false;
								featureDetection.backup_console.log("** FAILURE TO LOAD: ("+featureDetection.reqs[feature].type+") ->" , feature ,  " (ERROR)" );
							}

							resolve();
						};
						var error = function(data) {
							featureDetection.backup_console.log("error:", this, data);
							reject(data);
						};

						var xhr = new XMLHttpRequest();
						xhr.addEventListener("load", finished);
						xhr.addEventListener("error", error);

						xhr.open(
							"POST", // Type of method (GET/POST)
							url     // Destination
						, true);
						xhr.send();
					});
				};

				return new Promise(function(resolve,reject){
					// The Promise.all inside this function will be started AFTER the array of promises has been populated.
					var promiseAll = function(proms){
						Promise.all(proms).then(
							function(results){
								resolve();
							}
							,function(error) {
								featureDetection.backup_console.log("error:", error);
								reject();
							}
						);
					};

					// Start all downloads at once.
					if     (syncType=="async"){
						// Create an array of promises.
						var proms = [];
						for(var i=0; i<features.length; i+=1){
							var key = features[i];
							proms.push( loadFeature( key ) );
						}

						// Now run the function that creates the Promise.all now that the promise array is fully populated.
						promiseAll(proms);
					}
					// Do one download at a time.
					else if(syncType=="sync"){
						if(features.length){
							var fileIndex=0;
							var iterative = function(){
								// Is this the last file?
								if(fileIndex >= features.length){
									resolve();;
									return;
								}
								var key = features[fileIndex];
								loadFeature( key ).then(
									function(res){
										// Increment the file index.
										fileIndex++;
										// Start the next download process.
										iterative();
									},
									function(res){ featureDetection.backup_console.log("ERROR:", res); reject(); }
								);

							};
							iterative();
						}
						else{
							resolve();
						}
					}
				});
			};

			return new Promise(function(resolve,reject){
				// Use PHP?
				if(featureDetection.config.usePhp===true){
					// Get the code for each feature as one download.
					PHP_combinedFeatures2(features).then(
						function(res){
							resolve(res);
						},
						function(res){ featureDetection.backup_console.log("ERROR", res); reject(res); }
					);
				}
				// No PHP. Use JavaScript.
				else{
					// Use Promise.all to start all downloads? (ASYNC)
					if     (featureDetection.config.useAsync===true){
						JS_features(features, "async").then(
							function(res){
								resolve(res);
							},
							function(res){ featureDetection.backup_console.log("ERROR", res); reject(res); }
						);
					}
					// Chain each download one after the other? (SYNC)
					else{
						JS_features(features, "sync").then(
							function(res){
								resolve(res);
							},
							function(res){ featureDetection.backup_console.log("ERROR", res); reject(res); }
						);
					}
				}

			});
		}     ,
		// Retrieve the features database from the server.
		getDatabase               : function(){
			// if(featureDetection.config.usePhp===true){
			return new Promise(function(resolve,reject){
				var method;
				var url;

				var finished = function(data) {
					data = JSON.parse(xhr.response);
					var keys = Object.keys(data);

					for(var i=0; i<keys.length; i+=1){
						featureDetection.reqs[ keys[i] ] = data[ keys[i] ];
					}

					resolve(data);
				};
				var error = function(data) {
					featureDetection.backup_console.log("error:", this, data);
					reject();
				};

				var xhr = new XMLHttpRequest();
				xhr.addEventListener("load", finished);
				xhr.addEventListener("error", error);

				var fd   = new FormData();
				var o    = "getDb" ;

				// Use PHP?
				if(featureDetection.config.usePhp===true){
					method="POST";
					fd.append("o" , o);
					fd.append("includeText"    , featureDetection.config.includeText   );
					fd.append("includeWebsite" , featureDetection.config.includeWebsite);
					url="_featureLoader/_p/featureLoader_p.php?o="+o;
				}
				// No PHP. Use JavaScript.
				else {
					method="GET";
					url="_featureLoader/featureLoader.json?o="+o;
				}

				xhr.open(
					method, // Type of method (GET/POST)
					url     // Destination
				, true);

				xhr.send(fd);
			});
		}             ,
		// Run the tests within the feature list to determine what needs to be loaded.
		detectAndApply            : function(){
			var detect = function(){
				return new Promise(function(resolve, reject){
					var missingReqs = [];

					// Do the test for each required library. Set the have flag.
					for(var k in featureDetection.reqs){
						try{
							// TEST: check for a result of false.
							// If the test is false or throws an exception it will be caught.
							if( eval(featureDetection.reqs[k].test) === false){
								throw "The specified feature is missing.";
							}
							// No error? The feature already exists.
							else{
								// console.log("You have this feature already:", k);
								featureDetection.reqs[k].have=true;
								featureDetection.reqs[k].hadNatively=true;
							}

						}
						catch(e){
							// An exception was thrown. The feature is missing.
							featureDetection.reqs[k].have=false;

							// Add it to the missing list IF the feature is required at the start of the program.
							// Can install the feature later at the point WHEN it is needed.
							if(featureDetection.reqs[k].req==true){
								missingReqs.push(k);
								featureDetection.reqs[k].hadNatively=false;
							}

						}
					}

					// Resolve the promise and return the list of missing required features.
					resolve( missingReqs ) ;
				});
			};

			return new Promise(function(resolve,reject){
				// Get the config and feature file from the server. (one file.)
				featureDetection.funcs.getDatabase().then(
					function(res){
						// Detect.
						detect().then(
							function(missingReqs){
								// var new_missingReqs=[];
								var libs_missingReqs=[];
								var polys_missingReqs=[];
								var f;

								// Before applying, add in any userReqs.
								if( featureDetection.config.userReqs.length ){
									// Only userReqs that are NOT already in missingReqs will be added.
									for(f=0; f<featureDetection.config.userReqs.length; f+=1){
										if( missingReqs.indexOf(featureDetection.config.userReqs[f]) ==-1){
											missingReqs.push( featureDetection.config.userReqs[f] );
											featureDetection.reqs[ missingReqs[f] ].req=true;
										}
									}
								}

								// Change the order of the missingReqs so that polyfills load before libraries.
								var keys_libs  = ( missingReqs.filter(function(d,i,a){ if(featureDetection.reqs[d].type=="library")  { return d; } } ) );
								var keys_polys = ( missingReqs.filter(function(d,i,a){
									if(
										featureDetection.reqs[d].type=="polyfill"       ||
										featureDetection.reqs[d].type=="customFunction"
										) { return d; }
									}
								));
								for(f=0; f<keys_libs.length; f+=1 ){ libs_missingReqs .push( keys_libs[f]  ); }
								for(f=0; f<keys_polys.length; f+=1){ polys_missingReqs.push( keys_polys[f] ); }

								// Apply.

								// Apply the libs.
								var prom1=featureDetection.funcs.applyFeatures_fromList(polys_missingReqs);
								prom1.then(
									function(res){
										// Then apply the polys.
										featureDetection.funcs.applyFeatures_fromList(libs_missingReqs).then(
											function(res){
												resolve(res);
											},
											function(res){ featureDetection.backup_console.log("error", res); reject(res); }
										);
									},
									function(res){ featureDetection.backup_console.log("error", res); reject(res); }
								);

							},
							function(res){ featureDetection.backup_console.log("error", res); reject(res); }
						);

					},
					function(res){ featureDetection.backup_console.log("fail", res); reject(res); }
				);

			});

		}             ,
		// // featureDetection.config.userFiles;
		userFiles : function(){
			return new Promise(function(resolve, reject){
				featureDetection.backup_console.log("userFiles: This feature is not ready yet.");
				resolve();
			});

			// featureDetection.config.userFiles.

			// If set to PHP then ask PHP to provide the specified files in one download.
			if(featureDetection.config.usePhp===true){}

			// // No PHP. Use JavaScript to request all files.
			else{
				// Use Promise.all to start all downloads? (ASYNC)
				if     (featureDetection.config.useAsync===true){
					// The Promise.all inside this function will be started AFTER the array of promises has been populated.
					var promiseAll = function(proms){
						Promise.all(proms).then(
							function(results){
								resolve();
							}
							,function(error) {
								featureDetection.backup_console.log("error:", error);
								reject();
							}
						);
					};
				}
				// Chain each download one after the other? (SYNC)
				else{
				}
			}
		},
		// This will perform the feature detection and feature loading.
		init                      : function(callback){
			featureDetection.backup_console = { };
			var methods = Object.keys(window.console);
			// Backup console.
			for(var i=0;i<methods.length;i++){
				featureDetection.backup_console[ methods[i] ] = console[ methods[i] ];
			}

			if(featureDetection.config.hideProgressInConsole){
				// Disable console.
				for(var i=0;i<methods.length;i++){
					console[ methods[i] ] = function(){};
				}
			}

			console.log("FEATURE DETECTION/APPLY: START");
			var startTS = performance.now();
			var endTS = 0;
			var duration = 0;

			// Because it is possible that Promise support is not available yet, this function takes a callback instead of returning a Promise.
			var nextStep = function(callback){
				featureDetection.funcs.detectAndApply().then(
					function(res){

					featureDetection.funcs.applyUserJsFiles().then(
						function(){
							endTS = performance.now();
							duration = (endTS-startTS).toFixed(2);
							console.log("FEATURE DETECTION/APPLY: END" + " ("+duration+" ms)", res ? res : "");

							if(featureDetection.config.hideProgressInConsole){
								// Restore and enable console.
								for(var i=0;i<methods.length;i++){
									console[ methods[i] ] = featureDetection.backup_console[ methods[i] ];
									// featureDetection.backup_console[ methods[i] ] = undefined;
								}

								// featureDetection.backup_console=undefined;
							}

							callback(
								{
									res      : res,
									duration : duration
								}
							);
						},
						function(res){ featureDetection.backup_console.log("error"  , res); }
					);
					},
					function(res){ featureDetection.backup_console.log("error"  , res); }
				);
			};

			// Do we have Promise support?
			if(typeof Promise=="undefined"){
				// No. Add Promise support via the Bluebird Promise library.
				var js    = document.createElement("script");
				js.onload = function(){ nextStep(callback); };
				js.src    = "_featureLoader/libs/bluebird.min.js";
				document.body.appendChild(js);
			}
			// We already have Promise support. Go to the next step.
			else{
				nextStep(callback);
			}

		}
	}
};

	// EXAMPLE USAGE:
	/*

In the <head> of the HTML:
<script src="js/featureLoader.js"></script>

For the function that loads when your page it ready:

window.onload = function(){
	window.onload = null;

	// Feature Loader config:
	featureDetection.config.usePhp                = false;
	featureDetection.config.useAsync              = true;
	featureDetection.config.includeText           = false; // Using false makes the database download smaller.
	featureDetection.config.includeWebsite        = false; // Using false makes the database download smaller.
	featureDetection.config.hideProgressInConsole = false; // Using false hides anything that Feature Loader would output other than an error.

	// Load these libraries also:
	featureDetection.config.userReqs = [
		// "JSZip"    ,
		// "FileSaver",
		// "sha512"   ,
		// "chartsJs" ,
		// "momentJs"
	];

	console.log("**********************************");
	console.log("*** -- Feature Loader 1.1.0 -- ***");
	console.log("**********************************");

	// Feature detect/replace.
	featureDetection.funcs.init(
		function(res){
			var endTS=performance.now().toFixed(1);
			clearInterval(intervalId);

			// Ready to continue with the rest of the application setup!
			drawResultsTable() ;
			updateLoadtime(res.duration);
		}
	);

};

	*/