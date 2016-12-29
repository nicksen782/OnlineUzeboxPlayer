// ********************************
// Configure Module
var Module = {
  arguments : [arguments],
  preInit   : [function(){extras_preInit(filelist, uzerom);}],
  //preRun  : [function(){extras_preInit(filelist, uzerom);}],
  postRun   : [function(){extras_postRun(currentgame, uzerom);}],
  print: (function() {
	  var element = document.getElementById('output');
	  if (element) element.value = ''; // clear browser cache
	  return function(text) {
		if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
		// These replacements are necessary if you render to raw HTML
		console.log("FROM EMSCRIPTEN!", text);
		if (element) {
		  element.value += text + " \n ";
		  element.scrollTop = element.scrollHeight; // focus on bottom
		}
	  };
	})(),
	printErr: function(text) {
	  if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
	  if (0) { // XXX disabled for safety typeof dump == 'function') {
		dump(text + '\n'); // fast, straight to the real console
	  } else {
		console.error(text);
	  }
	},
  canvas    : (function() { return document.getElementById('canvas'); })(),
};

// cuzebox.js
var script = document.createElement('script');
script.src = "cuzebox.js";
document.body.appendChild(script);
// ********************************

function extras_preInit(filelist, uzerom){
	if     ( filelistType == 1 ){ filelist=filelist; }					// Keep the filelist the same.
	else if( filelistType == 2 ){ filelist=parent.window.thefiles; }	// Get the filelist from the parent window.
	else if( filelistType == 3 ){ filelist=window.opener.thefiles; }	// Get the filelist from the window opener.
	else if( filelistType == 4 ){ filelist=parent.window.thefiles2.files; }	// Get the filelist from the parent window.

	// Depending
	console.log("filelistType is this:::::", filelistType);
	loadFileSystem(filelist, uzerom);
		// Need to read the filelist from the parent window.
		// console.log(parent.window.document.querySelector('#FilesFromUser').files);
	// if (parent.window.opener && parent.window.opener !== window) {
	// 	console.log("**** cuzebox_extra: Seems we have been opened up by Javascript! ****");
	// }

}

function extras_postRun(currentgame, uzerom){
	setTimeout(function(){
		parent.iframeIsReadyNow(currentgame, uzerom, filelist) ;
		// mem stuff
		// window.onload=function(){ fsReady() };
	}, 500);
}

// *******
function loadFileSystem(filelist, uzerom) {
	console.log("The filelist:", filelist, filelist.length);
	for(var i=0; i<filelist.length; i++){
		// There are 2 methods of loading files. Direct arrayBuffer and download.
		if     ( filelistType == 1 ){ addToFS (filelist[i].filename, filelist[i].completefilepath, uzerom); }
		else if( filelistType == 2 ){ addToFS2(filelist[i].filename, filelist[i].completefilepath, uzerom); }
		else if( filelistType == 3 ){ addToFS2(filelist[i].filename, filelist[i].completefilepath, uzerom); }
		else if( filelistType == 4 ){ addToFS(filelist[i].filename, filelist[i].completefilepath, uzerom); }
	}
}

// NOT USED.
function addToFS2(filename, byteArray, uzerom) {
	// Only check the headers on .uze files. Don't check on .hex files.
	if( filename==uzerom && filename.substr(-4, 4) == ".uze" ){
		// Read the first six bytes of the byteArray. Does it spell UZEBOX?
		var header = byteArray.slice(0,6).toString();
		console.log("Checked uzerom header... GAMEFILE:", filename, "Values:", header);

		// Look for UZEBOX (as an ascii string here.)
		if(header !== "85,90,69,66,79,88"){
			// Mising 'UZEBOX'. Set those bytes to have 'UZEBOX'.
			byteArray[0] = 85; // U
			byteArray[1] = 90; // Z
			byteArray[2] = 69; // E
			byteArray[3] = 66; // B
			byteArray[4] = 79; // O
			byteArray[5] = 88; // X
			console.log("GAMEFILE:", filename, " -- The header has been corrected.");
		}
		else {
			console.log("The header is correct.");
		}
	}

	// Add the file to the FS.
	// FS.createDataFile('/', filename, byteArray, true, true, true);
	FS.createPreloadedFile('/', filename  , byteArray      , true, true);
	// FS.writeFile(filename+"blah"+filename, 'test');
}

function addToFS(filename, completefilepath, uzerom) {
	// console.log("completefilepath:", completefilepath);
	Browser.asyncLoad(completefilepath, (function(byteArray) {

		// Only check the headers on .uze files. Don't check on .hex files.
		if( filename==uzerom && filename.substr(-4, 4) == ".uze" ){
			// console.log("Checking uzerom header... GAMEFILE:", filename);
			// Read the first six bytes of the byteArray. Does it spell UZEBOX?
			var header = byteArray.slice(0,6).toString();

			// Look for UZEBOX (as an ascii string here.)
			if(header !== "85,90,69,66,79,88"){
				// Mising 'UZEBOX'. Set those bytes to have 'UZEBOX'.
				byteArray[0] = 85; // U
				byteArray[1] = 90; // Z
				byteArray[2] = 69; // E
				byteArray[3] = 66; // B
				byteArray[4] = 79; // O
				byteArray[5] = 88; // X
				console.log("GAMEFILE:", filename, " -- The header has been corrected.");
			}
			else {
				// console.log("The header is correct.");
			}
		}

		// Add the file to the FS.
		// FS.createDataFile('/', filename, byteArray, true, true, true);
		FS.createPreloadedFile('/', filename  , byteArray      , true, true);
		// FS.writeFile(filename+"blah"+filename, 'test');

	}), null);
}

// ********************************



	// Start CUzeBox
	// function fsReady() {

	// 	(function() {
	// 	  var memoryInitializer = 'cuzebox.html.mem';
	// 	  if (typeof Module['locateFile'] === 'function') {
	// 		memoryInitializer = Module['locateFile'](memoryInitializer);
	// 	  } else if (Module['memoryInitializerPrefixURL']) {
	// 		memoryInitializer = Module['memoryInitializerPrefixURL'] + memoryInitializer;
	// 	  }
	// 	  var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
	// 	  xhr.open('GET', memoryInitializer, true);
	// 	  xhr.responseType = 'arraybuffer';
	// 	  xhr.send(null);
	// 	})();

	// };



// ********************************
