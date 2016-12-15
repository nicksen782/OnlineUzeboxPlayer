window.onload=function(){
	getGameList();

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
			console.log("loadGame callback called. Number found:", resp.count, "(should be 1.)");

			// return;
			// Change the background colors back to their original. Hide the iframe.
			// document.getElementById('middle').style.visibility="hidden";
			// document.body.style['background-color']='slategray';
			// document.getElementsByTagName('html')[0].style['background-color']='slategray';

			// Remove previous iframe. Create another one.
			// console.log("bye iframe!");
			document.getElementById('emscripten_iframe').remove();

			// console.log("we are about to actually attach the iframe to the dom!");
			var iframe = document.createElement('iframe');
			iframe.id="emscripten_iframe";
			document.getElementById('emscripten_iframe_container').appendChild(iframe);
			iframe.contentWindow.document.open();
			iframe.contentWindow.document.write(resp.iframehtml);
			iframe.contentWindow.document.close();
			console.log("new iframe is attached!");

		};

		var game = document.getElementById('gameMenu_select').value ;

		var thedata = { o:"loadGame", game:game };
		serverPOSTrequest(	thedata, callback, "gateway_p.php" );

	});

	// Set default game.
};

// DONE!
function serverPOSTrequest(dataObj, callback, url){
	// Display the progress animation.
	document.getElementById('progressBar').classList.add('show');

	var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
	xmlhttp.open("POST", url ? url : "index_p.php");   // Use the specified url. If no url then use the default.
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	// xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4 && xmlhttp.status == "200") {
			document.getElementById('progressBar').classList.remove('show');
			callback(xmlhttp.responseText);
			// Hide the progress animation.
		}
	}

	var dataObj = Object.keys(dataObj).map(function(k) {
		return encodeURIComponent(k) + '=' + encodeURIComponent(dataObj[k])
	}).join('&')

	xmlhttp.send(dataObj);
}

function resizeIframe() {
	var outer = document.getElementById('emscripten_iframe');
	// var inner = document.getElementById('emscripten_iframe').contentDocument.body;
	outer.style.height = document.getElementById('emscripten_iframe').contentWindow.document.body.clientHeight+"px";
	// outer.style.width  = document.getElementById('emscripten_iframe').contentWindow.document.body.width+"px";

	outer.height = document.getElementById('emscripten_iframe').contentWindow.document.body.clientHeight+"px";
	// outer.width  = document.getElementById('emscripten_iframe').contentWindow.document.body.width+"px";

	outer.focus();
}

function iframeIsReadyNow(currentgame, currentgameid){
	// Iframe reports that it is ready!
	console.info("Iframe reports that it is ready!", "game location:", currentgame, "game id:", currentgameid);
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
		// console.log("getGameList:", resp.length, resp);

		// Prepare variables, get handle on the select menu.
		var select2 = document.getElementById('gameMenu_select');
		select2.length=1;
		var option;
		var i;

		var optgroup1 = document.createElement('optgroup');
		optgroup1.setAttribute('label', "Correct .uze headers");
		select2.appendChild(optgroup1);

		// Add these files as options to the GAME select list.
		for(i=0; i<resp.length; i++){
			if(resp[i].validheader==1){
				option = document.createElement('option');
				option.setAttribute('value', resp[i].id);
				option.innerHTML = resp[i].title;
				select2.appendChild(option);
				// console.log("adding:", option);
			}
		}

		var optgroup2 = document.createElement('optgroup');
		optgroup2.setAttribute('label', "");
		select2.appendChild(optgroup2);

		var optgroup3 = document.createElement('optgroup');
		optgroup3.setAttribute('label', "Incorrect .uze headers");
		select2.appendChild(optgroup3);

		for(i=0; i<resp.length; i++){
			if(resp[i].validheader==0){
				option = document.createElement('option');
				option.setAttribute('value', resp[i].id);
				option.innerHTML = "(INVALID) " + resp[i].title;
				select2.appendChild(option);
				// console.log("adding:", option);
			}
		}

		document.getElementById('gameMenu_select').selectedIndex = 1;
	};

	var thedata = { o:"getGameList" };
	this.serverPOSTrequest(	thedata, callback, "gateway_p.php" );
}