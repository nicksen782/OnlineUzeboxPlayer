	window.onload = function(){
		document.getElementById('newGame_saveButton').addEventListener('click', function(){
			console.log("clicked!", document.getElementById('newGame_uploadButton') );
		});
	};

	function gamedirList_nonSD(){
		var callback = function(resp){
			// console.log("initial resp:", resp);
			var games=JSON.parse(resp).listofroms;
			console.log("gamedirList_nonSD:",games, Object.keys(games).length );
			// document.getElementById('viewGameDB_results').innerHTML = "<pre>"+JSON.stringify(JSON.parse(resp), null, 1)+"</pre>";

			var cont;
			var title;
			var filename;
			var validheader;

			// Clear whatever rows are in the table body.
			var thetable = document.getElementById("gameslist2");
			for(var i = 1; i < thetable.rows.length;){
				thetable.deleteRow(i);
			}

			var table = document.getElementById("gameslist2");

			for(var i in games){
				var row = table.insertRow(1);
				var key               = row.insertCell(0);
				var title             = row.insertCell(1);
				var filename          = row.insertCell(2);
				var authors           = row.insertCell(3);
				var header            = row.insertCell(4);
				var description       = row.insertCell(5);
				var hashmatchwith     = row.insertCell(6);

				key.innerHTML         = i;
				title.innerHTML       = games[i].title;
				filename.innerHTML    = games[i].filename;
				authors.innerHTML     = games[i].authors;
				header.innerHTML      = games[i].validheader;
				description.innerHTML = games[i].description;
				hashmatchwith.innerHTML = games[i].hashmatchwith;
			}
// <tr>
// 	<td></td>
// 	<td></td>
// 	<td></td>
// 	<td></td>
// </tr>

			for(var i in games){
				cont = document.createElement('span');		 cont.setAttribute('class', 'cont');
				title = document.createElement('div');		 title.setAttribute('class', 'title'); title.innerHTML=games[i].title;
				filename = document.createElement('div');	 filename.setAttribute('class', 'filename');filename.innerHTML=games[i].filename;
				validheader = document.createElement('div'); validheader.setAttribute('class', 'validheader');validheader.innerHTML=games[i].validheader;
				cont.appendChild(title);
				cont.appendChild(filename);
				cont.appendChild(validheader);
				document.body.appendChild(cont);
			}

			// for(var i in games){
			// 	cont = document.createElement('span');		 cont.setAttribute('class', 'cont');
			// 	title = document.createElement('div');		 title.setAttribute('class', 'title'); title.innerHTML=games[i].title;
			// 	filename = document.createElement('div');	 filename.setAttribute('class', 'filename');filename.innerHTML=games[i].filename;
			// 	validheader = document.createElement('div'); validheader.setAttribute('class', 'validheader');validheader.innerHTML=games[i].validheader;
			// 	cont.appendChild(title);
			// 	cont.appendChild(filename);
			// 	cont.appendChild(validheader);
			// 	document.body.appendChild(cont);
			// }

		};

		var thedata = { o:"gamedirList_nonSD"};
		this.serverPOSTrequest(	thedata, callback, "gamemanager_p.php" );
	}

	function newGame(){
		var callback = function(resp){
			console.log("newGame:", resp);
		};

		var thedata = { o:"newGame"};
		thedata.title       = document.getElementById('newGame_form').querySelector("[name='title']").value;
		thedata.authors     = document.getElementById('newGame_form').querySelector("[name='authors']").value;
		thedata.description = document.getElementById('newGame_form').querySelector("[name='description']").value;
		thedata.addedby     = document.getElementById('newGame_form').querySelector("[name='addedby']").value;
		thedata.validheader = document.getElementById('newGame_form').querySelector("[name='validheader']").value;

		console.log(thedata);
		this.serverPOSTrequest(	thedata, callback, "gamemanager_p.php" );
	}

	function viewGameDB(){
		var callback = function(resp){
			// console.log("viewGameDB:", resp);
			document.getElementById('viewGameDB_results').innerHTML = "<pre>"+JSON.stringify(JSON.parse(resp), null, 1)+"</pre>";
		};

		var thedata = { o:"viewGameDB"};
		this.serverPOSTrequest(	thedata, callback, "gamemanager_p.php" );
	}


	function serverPOSTrequest(dataObj, callback, url){
		// Display the progress animation.
		// document.getElementById('statusbuttonswrapper_progressbar').classList.add('show');

		var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
		url = url ? url : "index_p.php";
		console.log("the freaking url!", url);
		xmlhttp.open("POST", url);   // Use the specified url. If no url then use the default.
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
	}




	function newGame_submitHandler(_this){
		var form = document.getElementById('myForm');
		var thedata = new FormData(form);
		console.log("newGame_submitHandler", thedata);
		thedata.append('o', "newGameXXX");
		console.log("newGame_submitHandler", form);
		// console.log("newGame_submitHandler", form, _this, _this.newGame_uploadButton.files);




// <!--thedata.append('fileToUpload', fileUploadDataOBJ.file);-->
	}

