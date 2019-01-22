/* global emu */
/* global featureDetection */
/* global saveAs */
/* global localStorage */

emu.settings={
	funcs:{
		// *
		downloadFromLocalStorage : function(keyname){
			// BINARY : EMU_eeprom.bin
			// TEXT   : EMU_gp_config_mappings

			let data = undefined;

			// Check that the key exists in local storage.
			if (localStorage.getItem( keyname ) === null) {
				alert("ERROR: The specified key was not found in local storage.");
				return;
			}
			// Get the data from local storage.
			else{
				data = localStorage.getItem( keyname );
			}

			// This is a known binary file. It must be converted to arrayBuffer.
			if(keyname=="EMU_eeprom.bin"){
				data = data.split(",");
				data = emu.funcs.shared.arrayToArrayBuffer(data);
			}

			// Load FileSaver if needed.
			featureDetection.funcs.applyFeatures_fromList([ "FileSaver" ]).then(
				function(){
					// Convert to blob.
					var blob = new Blob( [ data ] , {type: "text/plain;charset=utf-8"});

					// Present the download. (Strip off the "EMU_" part.
					saveAs(blob, keyname.substring(keyname.indexOf('_')+1));
				}
				,emu.funcs.shared.rejectedPromise
			);
		},
		//
		getLocalStorageFileList : function(){
			let keys = Object.keys(localStorage).filter(function(d,i,a){
				if(d.split("_")[0]=="EMU"){
					return true;
				}
			});

			let localStorageFileListTable = emu.vars.dom.settings["localStorageFileListTable"];
			localStorageFileListTable.querySelectorAll("tr").forEach(function(d,i,a){if(i!=0){ d.remove();}});

			keys.map(function(d,i,a){
				let name =      d     ;
				let usedBytes = localStorage.getItem( d ).length;

				// Create new row.
				var row = localStorageFileListTable.insertRow(localStorageFileListTable.length);

				// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
				var cell1 = row.insertCell(0);
				var cell2 = row.insertCell(1);

				// Add some text to the new cells:
				cell1.innerHTML = "<span class=\"hyperlink1\" onclick=\"emu.settings.funcs.downloadFromLocalStorage('" + name + "')\">"+name+"</span>";
				cell2.innerHTML = usedBytes.toLocaleString()+" bytes";
			});



		},
		// *
		downloadFromEmscripten : function(filename){
			// Load FileSaver if needed.
			featureDetection.funcs.applyFeatures_fromList([ "FileSaver" ]).then(
				function(res){
					// Convert to blob.
					var blob = new Blob( [( emu.vars.innerEmu.Module.FS.readFile(filename) )] , {type: "text/plain;charset=utf-8"});

					// Present the download.
					saveAs(blob, filename);
				}
				,emu.funcs.shared.rejectedPromise
			);
		},
		// *
		getEmscriptenFileList : function(){
			let emscriptenFileListTable = emu.vars.dom.settings["emscriptenFileListTable"];
			emscriptenFileListTable.querySelectorAll("tr").forEach(function(d,i,a){if(i!=0){ d.remove();}});

			let keys  = Object.keys(emu.vars.innerEmu.Module.FS.root.contents).filter(function(d,i,a){ if(["dev","home","proc","tmp",].indexOf(d)==-1){ return true; }});
			keys.map(function(d,i,a){
				let thisRec = emu.vars.innerEmu.Module.FS.root.contents[d];
				let name =      thisRec.name     ;
				let usedBytes = thisRec.usedBytes;

				// Create new row.
				var row = emscriptenFileListTable.insertRow(emscriptenFileListTable.length);

				// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
				var cell1 = row.insertCell(0);
				var cell2 = row.insertCell(1);

				// Add some text to the new cells:
				cell1.innerHTML = "<span class=\"hyperlink1\" onclick=\"emu.settings.funcs.downloadFromEmscripten('" + name + "')\">"+name+"</span>";
				cell2.innerHTML = usedBytes.toLocaleString()+" bytes";
			});

		},
		// *
		displayRemoteLoadText : function(obj){
			if(!obj){
				emu.vars.dom.settings["remoteloadJson_container"].innerHTML="";
			}
			else{
				emu.vars.dom.settings["remoteloadJson_container"].innerHTML=JSON.stringify(obj,null,1);
			}
		}
	},
	addEventListeners:{
	},
};
