function extras_preInit(filelist){
	loadFileSystem(filelist);
}

function extras_postRun(currentgame){
	setTimeout(function(){
		parent.iframeIsReadyNow() ;
		parent.document.getElementById('chooseGameFromServer').value = currentgame;
		// document.getElementById('controls').style.display = 'none';
		document.body.style['background-color'] = "rgba(0, 0, 0, 0.85)";
	}, 500);
}

// *******
function loadFileSystem(filelist) {
	for(var i=0; i<filelist.length; i++){
		addToFS(filelist[i].newname, filelist[i].fullfilepath);
		// addToFS2(filelist[i].newname, filelist[i].fullfilepath);
	}
}

function addToFS2(newname, fullfilepath) {
	console.info("Adding file:", newname, ", Path:", fullfilepath);
	FS.createPreloadedFile('/', newname  , fullfilepath      , true, true);
}

function addToFS(newname, fullfilepath) {
	Browser.asyncLoad(fullfilepath, (function(byteArray) {
		var ab_asString = ab2str(byteArray);

		var header = ab_asString.substring(0, 6);
		console.log(header, header==="UZEBOX");

		// if(header !== "UZEBOX"){
		// 	var ab_asString2 = "UZEBOX" + ab_asString ;
		// 	FS.createPreloadedFile('/', newname  , str2ab(ab_asString2)      , true, true);
		// 	return;
		// }
		// console.log("**1:", ab_asString, "\n\n**2:",ab_asString2);
		// var checkString="";
		// for(var i=0; i<byteArray.length && i<6; i++){
		// 	console.log("index:", i, "data:",byteArray[i], String.fromCharCode(byteArray[i]) );
		// 	checkString+=String.fromCharCode(byteArray[i]);
		// }
		// console.log(checkString);
		// byteArray[0] = "U".toLowerCase();
		// byteArray[1] = "Z".toLowerCase();
		// byteArray[2] = "E".toLowerCase();
		// byteArray[3] = "B".toLowerCase();
		// byteArray[4] = "O".toLowerCase();
		// byteArray[5] = "X".toLowerCase();
		// for(var i=0; i<byteArray.length && i<6; i++){
		// 	console.log("index:", i, "data:",byteArray[i], String.fromCharCode(byteArray[i]) );
		// 	// checkString+=String.fromCharCode(byteArray[i]);
		// }
		// console.log((byteArray));
		// FS.createDataFile('/', newname, byteArray, true, true, true);
		FS.createPreloadedFile('/', newname  , fullfilepath      , true, true);
	}), null);
}


function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}


