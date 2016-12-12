<!doctype html>
<html lang="en-us">

<head>
	<meta charset="utf-8">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Emscripten-Generated Code</title>
	<link rel="stylesheet" type="text/css" href="index.css">
	<!--<link rel="stylesheet" type="text/css" href="index.css">-->
	<script src="polyfills.js"></script>

</head>

<body>






<!--<div style="margin:20px;width:150px;height:150px;position:absolute;left:50px;top:250px;background-color:red;"></div>-->
<!--<div style="margin:20px;width:150px;height:150px;position:absolute;left:50px;top:50px;background-color:blue;"></div>-->
	<!--Corner floating menu-->
	<?php require_once("gameselect_menu.php"); ?>

	<div style="clear:both;"></div>

	<div id="middle">
		<div id="mid">
			<iframe id="emscripten_iframe" ></iframe>
		</div>
	</div>
	<div style="clear:both;"></div>

	<div id="bot">
		<?php require_once("bottom.php"); ?>
	</div>

	<script>
	function iframeIsReadyNow(){
		// Iframe reports that it is ready!
		console.info("Iframe reports that it is ready!");
		resizeIframe();
		document.body.style['background-color']='#263535';
		document.getElementsByTagName('html')[0].style['background-color']='#263535';
		document.getElementById('middle').style.visibility="visible";
	}

	window.onload = function(){
		getProjectNames();
		setTimeout(function() {
			// document.getElementById('mid').querySelector('iframe').addEventListener('mouseenter', function() { this.focus(); resizeIframe(); });
			document.getElementById('mid').addEventListener('mouseenter', function() { this.focus(); resizeIframe(); });

			document.getElementById('chooseGameFromServer').addEventListener('change',
				function(){
					document.getElementById('middle').style.visibility="hidden";
					document.body.style['background-color']='slategray';
					document.getElementsByTagName('html')[0].style['background-color']='slategray';

					// var url = "gamechanger_p.php?game="+this.value ;
					// console.log("url", url);
					// // window.location = url ;
					// console.info("Game change!");
					// document.getElementById('emscripten_iframe').src=url;

					loadGame();
				}
			);

			document.getElementById('btn_restartGame').addEventListener('click', function() {
				document.getElementById('chooseGameFromServer').dispatchEvent(new Event('change'));
			});

			// document.getElementById('btn_startGame').addEventListener('click', function() {
			// 	// document.getElementById('chooseGameFromServer').dispatchEvent(new Event('change'));
			// 	console.log("start it up!");
			// 	document.getElementById('emscripten_iframe').contentWindow.run();
			// });

			document.getElementById('mid').querySelector('iframe').src = "gamechanger_p.php";
		}, 1500);
	};

	function resizeIframe() {
		var outer = document.getElementById('emscripten_iframe');
		var inner = document.getElementById('emscripten_iframe').contentDocument.body;
		outer.focus();
		outer.height       = inner.scrollHeight;
		outer.width        = inner.scrollWidth;
		outer.style.height = inner.scrollHeight+"px";
		outer.style.width  = inner.scrollWidth+"px";
	}

	function serverPOSTrequest(dataObj, callback, url){
		// Display the progress animation.
		// document.getElementById('statusbuttonswrapper_progressbar').classList.add('show');

		var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
		xmlhttp.open("POST", url ? url : "index_p.php");   // Use the specified url. If no url then use the default.
		xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		// xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4 && xmlhttp.status == "200") {
				// document.getElementById('statusbuttonswrapper_progressbar').classList.remove('show');
				callback(xmlhttp.responseText);
				// Hide the progress animation.
			}
		}

		var dataObj = Object.keys(dataObj).map(function(k) {
			return encodeURIComponent(k) + '=' + encodeURIComponent(dataObj[k])
		}).join('&')

		xmlhttp.send(dataObj);
	};

	function loadGame(){
		var callback = function(resp){
			console.log("loadGame callback called");
			// Change the background colors back to their original. Hide the iframe.
			document.getElementById('middle').style.visibility="hidden";
			document.body.style['background-color']='slategray';
			document.getElementsByTagName('html')[0].style['background-color']='slategray';

			// Remove previous iframe. Create another one.
			console.log("bye iframe!");
			document.getElementById('emscripten_iframe').remove();

			console.log("we are about to actually attach the iframe to the dom!");
			var iframe = document.createElement('iframe');
			iframe.id="emscripten_iframe";
			var html = resp;
			document.getElementById('mid').appendChild(iframe);
			iframe.contentWindow.document.open();
			iframe.contentWindow.document.write(html);
			iframe.contentWindow.document.close();
			console.log("new iframe is attached!");
		};

		var game = document.getElementById('chooseGameFromServer').value ;

		var thedata = { o:"loadGame", game:game };
		this.serverPOSTrequest(	thedata, callback, "gamechanger_p.php" );

	}

	function getProjectNames() {
		var callback = function(resp){
			// Parse the array right away.
			resp = JSON.parse(resp).projectnames;
			// console.log("i'm here TOO!", resp);

			// Prepare variables, get handle on the select menu.
			var select2 = document.getElementById('chooseGameFromServer');
			select2.length=1;
			var option;

			// Add these files as options to the GAME select list.
			for(var i=0; i<resp.length; i++){
				if(resp[i].valid==1){
					option = document.createElement('option');
					option.setAttribute('value', resp[i].fullfilepath);
					option.innerHTML = resp[i].newname;
					select2.appendChild(option);
				}
			}

			// var optgroup1 = document.createElement('optgroup');
			// optgroup1.setAttribute('label', "");
			// select2.appendChild(optgroup1);
			// var optgroup2 = document.createElement('optgroup');
			// optgroup2.setAttribute('label', "Incorrect .uze headers");
			// select2.appendChild(optgroup2);

			// for(var i2 in resp){
			// 	if(resp[i2].valid==0){
			// 		option = document.createElement('option');
			// 		option.setAttribute('value', resp[i2].title);
			// 		option.innerHTML = "(*ERROR*) " + resp[i2].title ;
			// 		select2.appendChild(option);
			// 	}
			// }

			// var GETgame = '<?php //echo $_GET['game'] ?>';
			// 	console.log("***************GETgame:", GETgame);
			// if(GETgame.length>0){
			// 	window.history.replaceState({}, document.title, "?"+GETgame)
			// 	document.getElementById('chooseGameFromServer').value = GETgame;
			// }
			// if(GETgame.length>0){
			// 	console.log("GETgame:", GETgame);
			// 	// setTimeout(function(){
			// 		document.getElementById('chooseGameFromServer').value = GETgame;
					// var clean_uri = location.protocol + "//" + location.host + location.pathname;
					// window.history.replaceState({}, document.title, clean_uri);
			// 	// }, 500);
			// }

		};

		var thedata = { o:"getProjectNames" };
		this.serverPOSTrequest(	thedata, callback );
	};

	</script>

</body>

</html>