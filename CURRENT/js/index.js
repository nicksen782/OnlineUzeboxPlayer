function viewSwitcher(view){
	// First, hide everything.
	[].map.call(document.querySelectorAll('.views'),
		function(elem, index, elems) {
			elem.classList.remove('show');
	});
	[].map.call(document.querySelectorAll('.panels'),
		function(elem, index, elems) {
			elem.classList.remove('show');
	});

	// Now show the selected app view.
	switch(view) {
	    case "emu":{
			document.getElementById('top_panel_right').classList.add('show');
			document.getElementById('VIEW_emulator').classList.add('show');
	        break;
	    }
	    case "gamedbman":{
			document.getElementById('top_panel_right_gamemanager').classList.add('show');
			document.getElementById('VIEW_gamedbmanager').classList.add('show');
	        break;
	    }
	    default:{
	    	document.getElementById('top_panel_right').classList.add('show');
			document.getElementById('VIEW_emulator').classList.add('show');
	        break;
	    }

	    // document.getElementById('stopEmulator_button').click();
	}



}

window.onload=function(){
	getGameList();

	viewSwitcher("emu");
	// viewSwitcher("gamedbman");

	// Emulator
	document.getElementById('emscripten_iframe_container').addEventListener('mouseenter', function() {
		this.focus(); resizeIframe();
	});
	document.getElementById('emscripten_iframe_container').addEventListener('click', function(){
		// document.getElementById('emscripten_iframe_container').querySelector('iframe').src = "loading.html";
	});
	document.getElementById('stopEmulator_button').addEventListener('click', function(){
		document.getElementById('emscripten_iframe_container').querySelector('iframe').src = "loading.html";
	});
	document.getElementById('restartEmulator_button').addEventListener('click', function(){
		document.getElementById('gameMenu_select').dispatchEvent(new Event('change'));
	});
	document.getElementById('gameMenu_select').addEventListener('change', function(){
		var callback = function(resp){
			resp = JSON.parse(resp);
			// console.log("loadGame callback called. Number found:", resp.count, "(should be 1.)");

			// Remove previous iframe. Create another one.
			document.getElementById('emscripten_iframe').remove();

			var iframe = document.createElement('iframe');
			iframe.id="emscripten_iframe";
			document.getElementById('emscripten_iframe_container').appendChild(iframe);
			iframe.contentWindow.document.open();
			iframe.contentWindow.document.write(resp.iframehtml);
			iframe.contentWindow.document.close();
		};

		var game = document.getElementById('gameMenu_select').value ;

		var thedata = { o:"loadGame", game:game };
		serverPOSTrequest(	thedata, callback, "gateway_p.php" );

	});

	// Games DB
	document.getElementById('completeData_1game_buttons_cancel').addEventListener('click', function(){
		// Clear the form.
		[].map.call(document.querySelectorAll('#VIEW_gamedbmanager input[type="text"], #VIEW_gamedbmanager textarea'),
		function(elem, index, elems) { elem.value = ""; });

		document.getElementById('gamefilelist').innerHTML = "" ;

	});
	document.getElementById('completeData_1game_buttons_update').addEventListener('click', function(){
		// Get the data from the form and pass it as an object to the game update function.
		var infoObj = {};
		infoObj.id          = document.getElementById('completeData_1game_id').value          ;
		infoObj.title       = document.getElementById('completeData_1game_title').value       ;
		infoObj.authors     = document.getElementById('completeData_1game_authors').value     ;
		infoObj.gamedir     = document.getElementById('completeData_1game_gamedir').value     ;
		infoObj.gamefile    = document.getElementById('completeData_1game_gamefile').value    ;
		infoObj.uses_sd     = document.getElementById('completeData_1game_uses_sd').value     ;
		infoObj.addedby     = document.getElementById('completeData_1game_addedby').value     ;
		infoObj.lastupload  = document.getElementById('completeData_1game_lastupload').value  ;
		infoObj.validheader = document.getElementById('completeData_1game_validheader').value ;
		infoObj.description = document.getElementById('completeData_1game_description_textarea').value ;

		updateGameInfo(infoObj);
		document.getElementById('completeData_1game_buttons_cancel').click(); //dispatchEvent(new Event('click'));
	});
	document.getElementById('gameMenu_select2').addEventListener('change', function(){
		var callback = function(resp){
			resp = JSON.parse(resp);
			var gamedata = resp.result;
			var filelist = resp.filelist;
			// console.log(gamedata['description'], gamedata, filelist);

			// Clear the form.
			document.getElementById('completeData_1game_buttons_cancel').click(); //dispatchEvent(new Event('click'));

			// Load the form with data.
			document.getElementById('completeData_1game_id').value          = gamedata.id;
			document.getElementById('completeData_1game_title').value       = gamedata.title;
			document.getElementById('completeData_1game_authors').value     = gamedata.authors;
			document.getElementById('completeData_1game_gamedir').value     = gamedata.gamedir;
			document.getElementById('completeData_1game_gamefile').value    = gamedata.gamefile;
			document.getElementById('completeData_1game_uses_sd').value     = gamedata.uses_sd;
			document.getElementById('completeData_1game_addedby').value     = gamedata.addedby;
			document.getElementById('completeData_1game_lastupload').value  = gamedata.lastupload;
			document.getElementById('completeData_1game_validheader').value = gamedata.validheader;
			document.getElementById('completeData_1game_description_textarea').value = gamedata['description'];


			// console.log(filelist);
			var link;
			document.getElementById('gamefilelist').innerHTML += " -- "
			for(var f=0; f<filelist.length; f++){
				// link = document.createElement('a');
				// link.setAttribute('href', );
				// link.innerHTML = filelist[f];
				// document.getElementById('gamefilelist').appendChild(link);
				document.getElementById('gamefilelist').innerHTML += "<a href='"+gamedata.gamedir+filelist[f]+"' title='Download this file'>"+filelist[f]+"</a> -- ";
			}

			// Make visible the save and cancel buttons.
		};

		var game = document.getElementById('gameMenu_select2').value ;

		var thedata = { o:"loadGame_intoManager", game:game };
		serverPOSTrequest(	thedata, callback, "gateway_p.php" );

	});

};

// DONE!
function serverPOSTrequest(dataObj, callback, url){
	// Display the progress animation.
	document.getElementById('progressBar').classList.add('show');
	document.getElementById('progressBar2').classList.add('show');

	var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
	xmlhttp.open("POST", url ? url : "index_p.php");   // Use the specified url. If no url then use the default.

	if(!dataObj.fileupload){
		console.log("1");
		xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	}

	else{ console.log("2"); xmlhttp.setRequestHeader("Content-Type", "multipart/form-data"); }

	// xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4 && xmlhttp.status == "200") {
			document.getElementById('progressBar').classList.remove('show');
			document.getElementById('progressBar2').classList.remove('show');
			callback(xmlhttp.responseText);
			// Hide the progress animation.
		}
	}

	if(!dataObj.fileupload){
		console.log("3");
		dataObj = Object.keys(dataObj).map(function(k) {
			return encodeURIComponent(k) + '=' + encodeURIComponent(dataObj[k]);
		}).join('&');
	}

	xmlhttp.send(dataObj);
}

function resizeIframe() {
	var outer = document.getElementById('emscripten_iframe');
	outer.focus();

	return;
	// var inner = document.getElementById('emscripten_iframe').contentDocument.body;
	outer.style.height = document.getElementById('emscripten_iframe').contentWindow.document.body.clientHeight+"px";
	// outer.style.width  = document.getElementById('emscripten_iframe').contentWindow.document.body.width+"px";

	outer.height = document.getElementById('emscripten_iframe').contentWindow.document.body.clientHeight+"px";
	// outer.width  = document.getElementById('emscripten_iframe').contentWindow.document.body.width+"px";

}

function iframeIsReadyNow(currentgame){
	// Iframe reports that it is ready!
	console.info("Iframe reports that it is ready!", "Game Title:", currentgame, "\n\n");
	resizeIframe();
	// document.body.style['background-color']='#263535';
	// document.getElementsByTagName('html')[0].style['background-color']='#263535';
	// document.getElementById('middle').style.visibility="visible";
}

// DONE!
function getGameList() {
	var callback = function(resp){
		// Parse the array right away.
		resp = JSON.parse(resp);
		resp=resp.result;

		// Stop the emulator.
		document.getElementById('stopEmulator_button').click();

		// Prepare variables, get handle on the select menu.
		var menus = [];
		menus.push(document.getElementById('gameMenu_select'));
		menus.push(document.getElementById('gameMenu_select2'));
		var option;
		var i;
		var optgroup;
		// Needs to be a for loop... I guess.
		for(var m=0; m<menus.length; m++){
			// Clear menu options and optgroups.
			menus[m].length=1;
			[].map.call(menus[m].querySelectorAll('optgroup'), function(elem, index, elems) { elem.remove(); });

			// Create/Add option group.
			optgroup = document.createElement('optgroup');
			optgroup.setAttribute('label', "Correct .uze headers");
			menus[m].appendChild(optgroup);

			// Add games with valid headers to the list.
			for(i=0; i<resp.length; i++){
				if(resp[i].validheader==1){
					option = document.createElement('option');
					option.setAttribute('value', resp[i].id);
					option.innerHTML = resp[i].title;
					menus[m].appendChild(option);
				}
			}

			// Create/Add option group.
			optgroup = document.createElement('optgroup');
			optgroup.setAttribute('label', "");
			menus[m].appendChild(optgroup);

			// Create/Add option group.
			optgroup = document.createElement('optgroup');
			optgroup.setAttribute('label', "Incorrect .uze headers");
			menus[m].appendChild(optgroup);

			// Add games with invalid headers to the list.
			for(i=0; i<resp.length; i++){
				if(resp[i].validheader==0){
					option = document.createElement('option');
					option.setAttribute('value', resp[i].id);
					option.innerHTML = " " + resp[i].title;
					menus[m].appendChild(option);
				}
			}
			menus[m].selectedIndex = "";
		}

	};

	var thedata = { o:"getGameList" };
	this.serverPOSTrequest(	thedata, callback, "gateway_p.php" );
}

// DONE!
function updateGameInfo(infoObj){
	var callback = function(resp){
		resp = JSON.parse(resp);

		// Reload the game list.
		getGameList();
	};

	var thedata = infoObj ;
	thedata.o = "updateGameInfo";

	serverPOSTrequest(	thedata, callback, "gateway_p.php" );
}



function newFileUpload(arg1, arg2){
// var formData = new FormData();
// formData.append("thefile", file);
// xhr.send(formData);

	var callback = function(resp){
		console.log("uploadfile1:", resp);
		resp = JSON.parse(resp);
		console.log("uploadfile2:", resp);

		// Reload the game list.
		// getGameList();
	};
	var thedata = new FormData();
	thedata.append("o", "newFileUpload");
	thedata.append('fileupload', true);
	thedata.append('files', document.getElementById('newFileUpload_browse').files);

	serverPOSTrequest(	thedata, callback, "gateway_p.php" );

	// Gather up some values to send to the file uploader.
	// var fileUploadData = {
	// 	isUpload			: isUpload,
	// 	o					: "updateExistingFloorplan",
	// 	uploadUrl			: "index_p.php?upload=true",
	// 	// new_floorplan_name	: $scope.new_floorplan_name,
	// 	// new_description 	: $scope.new_description,
	// 	fileToUpload		: $scope.myFile2,
	// 	plant_id			: $scope.edit_floorplan_plantid,

	// 	"id"             : $scope.edit_id,
	// 	"id2"            : $scope.edit_id,
	// 	"description"    : $scope.edit_description,
	// 	"floorplan_name" : $scope.edit_floorplan_name,
	// };

	// angular.module('newburyPipeline').service('fileUpload3', ['$http', function ($http) {
	// 	this.uploadFileToUrl = function( fileUploadDataOBJ ){
	// 		// Prepare the data to be sent to the server.
	// 		var thedata = new FormData();

	// 		// Create form data dynamically based on the passed object.
	// 		for(var key in fileUploadDataOBJ){
	// 			thedata.append(key, fileUploadDataOBJ[key]);
	// 		}

	// 		// Configure the params for the server data message.
	// 		var params = {
	// 			method: "POST",
	// 			url: fileUploadDataOBJ.uploadUrl,
	// 			headers: {'Content-Type': undefined},
	// 			transformRequest: angular.identity,
	// 			data: thedata,
	// 		};

	// 		return $http(params).then(
	// 			function (d) {
	// 				// console.log("operation:", o, "", "status:", d.status);

	// 				// Return only the data portion of the response.
	// 				return d.data;
	// 			}
	// 		);
	// 	}
	// }]);
}