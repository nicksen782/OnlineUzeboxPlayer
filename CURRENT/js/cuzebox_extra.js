function extras_preInit(filelist, uzerom){
	loadFileSystem(filelist, uzerom);
}

function extras_postRun(currentgame){
	setTimeout(function(){
		parent.iframeIsReadyNow(currentgame) ;
	}, 500);
}

// *******
function loadFileSystem(filelist, uzerom) {
	var checkheader ;
	for(var i=0; i<filelist.length; i++){
		checkheader = filelist[i].filename == uzerom ? true : false ;
		addToFS(filelist[i].filename, filelist[i].completefilepath, checkheader);
		// addToFS2(filelist[i].filename, filelist[i].completefilepath);
	}
}

function addToFS2(filename, completefilepath) {
	console.info("Adding file:", filename, ", Path:", completefilepath);
	FS.createPreloadedFile('/', filename  , completefilepath      , true, true);
}

function addToFS(filename, completefilepath, checkheader) {
	// console.log("completefilepath:", completefilepath);
	Browser.asyncLoad(completefilepath, (function(byteArray) {

		if(checkheader==true){
			console.log("Checking uzerom header...");
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
				console.log("The header has been corrected.");
			}
			else {
				console.log("The header is correct.");
			}
		}

		// Add the file to the FS.
		// FS.createDataFile('/', filename, byteArray, true, true, true);
		FS.createPreloadedFile('/', filename  , byteArray      , true, true);

	}), null);
}