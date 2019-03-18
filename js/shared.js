/*jshint sub:true*/
/*jshint laxcomma:true*/
/*jslint bitwise: true */
/*jslint for: true */
/*jslint long: true */
/*jslint single: true */
/*jslint white: true */
/*jslint multivar: false */

/*jshint -W069 */

/* global featureDetection */
/* global gc */
/* global saveAs */
/* global JSZip */
/* global X2JS */
/* global performance */
/* global getQueryStringAsObj */
/* global localStorage */
/* global emu */

// anthonybrown/JSLint Options Descriptions
// https://gist.github.com/anthonybrown/9526822
emu.funcs.shared = {
	// * Sets the canvas dimensions back to default.
	resetCanvasDimensions   : function(){
		emu.vars.dom.view["emuCanvas"].width="310";
		emu.vars.dom.view["emuCanvas"].height="228";
	},
	// * Display message on the canvas in the center.
	textOnCanvas            : function(obj) {
		// ctx.fillRect(0,0, Math.floor(ctx.measureText(obj.text).width), 48);

		// Set any not-set values in the obj.
		if (!obj)                             { obj = {}; }
		if (obj.canvas          == undefined) { obj.canvas          = emu.vars.dom.view["emuCanvas"]; }
		if (obj.font            == undefined) {
			// Set to the smaller font size if this is the smaller canvas.
			if(
				obj.canvas.width >=310 && obj.canvas.width <=320 &&
				obj.canvas.height >=228 && obj.canvas.height <=280
			) { obj.font            = "20px monospace"; }
			// It is the bigger one. Use the larger font size.
			else { obj.font         = "40px monospace"; }
		}
		if (obj.textAlign       == undefined) { obj.textAlign       = "center"; }
		if (obj.backgroundColor == undefined) { obj.backgroundColor = "rgba(255, 0, 0, 0.60)"; }
		if (obj.fontColor       == undefined) { obj.fontColor       = "white"; }
		if (obj.text            == undefined) { obj.text            = ""; }
		if (obj.textBaseline    == undefined) { obj.textBaseline    = "middle"; }

		// Parse fontsize, set fontsize, get ctx, textAlign.
		var fontSize = parseInt(obj.font);
		let ctx = obj.canvas.getContext("2d");
		ctx.font = obj.font;
		ctx.textAlign = obj.textAlign;

		// Don't let messages go beyond the canvas.
		if (obj.text.length > 23) { obj.text = obj.text.substr(0, 23); }
		obj.text = obj.text.trim();

		// Dimensions and coordinates for the rectangle.
		var rectX=0;
		var rectY=(obj.canvas.height/2)-fontSize*1.5;
		var rectW=Math.floor(obj.canvas.width);
		var rectH=fontSize*2.25;

		// Draw the rectangle.
		ctx.fillStyle = obj.backgroundColor;
		ctx.fillRect(rectX, rectY, rectW, rectH);

		// Draw the text.
		ctx.textBaseline=obj.textBaseline;
		ctx.fillStyle = obj.fontColor;
		ctx.fillText(obj.text , rectX+(rectW/2),rectY+(rectH/2));
	},
	// * Display message on the canvas in the top-left corner.
	textOnCanvas2           : function(obj) {
		let getMaxFontSize = function(text, font, ctx){
			let fontsize=22;
			do{
				fontsize--;
				ctx.font=fontsize+"px "+font;
			} while(ctx.measureText(text).width>ctx.canvas.width)
			return fontsize;
		};

		let hoverCanvas = document.createElement("canvas");
		let ctx = hoverCanvas.getContext("2d");
		hoverCanvas.id="emu_hover_canvas";

		hoverCanvas.width  = "150";
		hoverCanvas.height = "24";

		let maxFontSize = getMaxFontSize(obj.text, "monospace", hoverCanvas.getContext("2d"));
		hoverCanvas.width  = "150";
		hoverCanvas.height = maxFontSize+5;
		ctx.font = maxFontSize + "px monospace";
		ctx.fillStyle="white";
		ctx.fillText(obj.text, 0 , parseInt(ctx.font));

		// console.log(ctx.font);

		hoverCanvas.style["z-index"]         = "99999999";
		hoverCanvas.style["position"]        = "absolute";
		hoverCanvas.style["top"]             = 0+"px";//"525px"     ;
		hoverCanvas.style["left"]            = 0+"px";//"525px"     ;
		hoverCanvas.style["opacity"]         = "0";
		hoverCanvas.style["transition"]      = "opacity .75s ease-in-out";
		hoverCanvas.style["background-color"]= "rgba(255, 0, 0, 0.40)";

		// Remove the old one if it exists.
		if(document.querySelector("#emu_hover_canvas")){
			document.querySelector("#emu_hover_canvas").remove();
		}
		emu.vars.dom.view["emscripten_emu_container"].appendChild(hoverCanvas);

		// Wait 25 ms to fade in.
		setTimeout(function(){
			// Show it via opacity.
			hoverCanvas.style["opacity"] = "1";

			// Wait another 3 seconds to fade it.
			setTimeout(function(){
				// Hide it via opacity.
				hoverCanvas.style["opacity"] = "0";

				// Remove it right after it fades out.
				setTimeout(function(){
					hoverCanvas.remove();
				}, 450);
			}, 1500);

		}, 25);



	},
	textOnCanvas3           : function(obj) {
		let getMaxFontSize = function(text, font, ctx){
			let fontsize=22;
			do{
				fontsize--;
				ctx.font=fontsize+"px "+font;
			} while(ctx.measureText(text).width>ctx.canvas.width)
			return fontsize;
		};

		let hoverCanvas = document.createElement("canvas");
		let ctx = hoverCanvas.getContext("2d");
		hoverCanvas.id="emu_hover_canvas2";

		hoverCanvas.width  = "225";
		hoverCanvas.height = "24";

		let maxFontSize = getMaxFontSize(obj.text, "monospace", hoverCanvas.getContext("2d"));
		hoverCanvas.width  = "225";
		hoverCanvas.height = maxFontSize+5;
		ctx.font = maxFontSize + "px monospace";
		ctx.fillStyle="white";
		ctx.fillText(obj.text, 0 , parseInt(ctx.font));

		// console.log(ctx.font);

		hoverCanvas.style["z-index"]         = "99999999";
		hoverCanvas.style["position"]        = "absolute";
		hoverCanvas.style["top"]             = 30+"px";//"525px"     ;
		hoverCanvas.style["left"]            = 0+"px";//"525px"     ;
		hoverCanvas.style["opacity"]         = "0";
		hoverCanvas.style["transition"]      = "opacity .75s ease-in-out";
		hoverCanvas.style["background-color"]= "rgba(255, 0, 0, 0.40)";

		// Remove the old one if it exists.
		if(document.querySelector("#emu_hover_canvas2")){
			document.querySelector("#emu_hover_canvas2").remove();
		}
		emu.vars.dom.view["emscripten_emu_container"].appendChild(hoverCanvas);

		// Wait 25 ms to fade in.
		setTimeout(function(){
			// Show it via opacity.
			hoverCanvas.style["opacity"] = "1";

			// Wait another 3 seconds to fade it.
			setTimeout(function(){
				// Hide it via opacity.
				hoverCanvas.style["opacity"] = "0";

				// Remove it right after it fades out.
				setTimeout(function(){
					hoverCanvas.remove();
				}, 450);
			}, 1500);

		}, 25);



	},
	// * Turns the canvas image to gray-scale.
	grayTheCanvas           : function(canvas) {
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
	clearTheCanvas          : function(canvas) {
		var ctx = canvas.getContext("2d");
		// ctx.clearRect(0,0, canvas.width, canvas.height);
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	},
	// * Make an AJAX request.
	serverRequest           : function(formData) {
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
				if(this.status !=200){
					console.log(this.status);
					reject(this.status);
				}
				else{
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

					// Required for IE.
					if (formData._config.responseType == "json" && typeof data == "string") {
						data = JSON.parse(data);
					}

					resolve(data);
				}
			};
			var transferFailed = function(evt) {
				console.log("An error occurred during the transfer.");
				// xhr.onerror = function(){console.log("error" + xhr.status)}
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
				// console.log("Uploading this many files:", formData._config.filesHandle.files.length);
				for (var i = 0; i < formData._config.filesHandle.files.length; i++) {
					// console.log("On file " + (i + 1) + " of " + formData._config.filesHandle.files.length, "(" + formData._config.filesHandle.files[i].name + ")");
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
	activateProgressBar     : function(turnItOn) {
		let onClickListener = function(){ emu.funcs.shared.activateProgressBar(false); };

		let progressbarDiv = document.querySelector("#progressbarDiv");
		let entireBodyDiv  = document.querySelector("#entireBodyDiv");

		// Activate the progress bar and screen darkener.
		if (turnItOn === true) {
			entireBodyDiv.classList.add("active");
			progressbarDiv.classList.add("active");
			entireBodyDiv.addEventListener("click", onClickListener, false);
		}
		// De-activate the progress bar and screen darkener.
		else if (turnItOn === false) {
			entireBodyDiv.classList.remove("active");
			progressbarDiv.classList.remove("active");
			entireBodyDiv.removeEventListener("click", onClickListener, false);
		}
	},
	// * Used for rejected promises. Generic. Just displays the error to the console.
	rejectedPromise         : function(error) {
		alert("An error has occurred.\n\n" + JSON.stringify(error, null, 1));
		console.log("ERROR", error);
	},
	// * Used with .filter (after .map) to remove undefined arrays from .map.
	removeUndefines       : function(d,i,a) {
		if( d != undefined ) { return true; }
		else{ return false; }
	}  ,
	// * Removes the pixel smoothing settings on the specified canvas.
	setpixelated            : function(canvas) {
		// https://stackoverflow.com/a/13294650
		canvas.getContext("2d").mozImageSmoothingEnabled = false; // Firefox
		canvas.getContext("2d").imageSmoothingEnabled = false; // Firefox
		canvas.getContext("2d").oImageSmoothingEnabled = false; //
		canvas.getContext("2d").webkitImageSmoothingEnabled = false; //
		canvas.getContext("2d").msImageSmoothingEnabled = false; //
	},
	// * Helper function that converts an array to an array buffer.
	arrayToArrayBuffer      : function (array){
		// https://stackoverflow.com/q/34089569
		var length = array.length;
		var buffer = new ArrayBuffer( length );
		var view = new Uint8Array(buffer);
		for ( var i = 0; i < length; i++) {
		    view[i] = parseInt(array[i]);
		}
		return buffer;
	},
	// * Used by resizeEmuCanvas to determine the new width/height/aspect ratio when resizing the emu canvas.
	calculateAspectRatioFit : function(srcWidth, srcHeight, maxWidth, maxHeight) {
		// https://stackoverflow.com/a/14731922
		var newRatio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
		return {
			width : Math.floor(srcWidth  * newRatio) ,
			height: Math.floor(srcHeight * newRatio) ,
			ratio : newRatio
		};
	},
	//
	add_page_zoom_listener    : function(){
		// Add the event listener.
		window.addEventListener("resize", function(){ emu.funcs.shared.page_zoom(false); }, false);

		// Resize the page.
		emu.funcs.shared.page_zoom(false);
	},
	//
	remove_page_zoom_listener : function(){
		// Remove the event listener.
		window.removeEventListener("resize", function(){ emu.funcs.shared.page_zoom(true); }, false);

		// Resize the page back to a scale of 1.
		emu.funcs.shared.page_zoom(true);
	},
	//
	page_zoom : function(reset){
		function getViewportSize(w) {
			// https://stackoverflow.com/a/18284182/2731377

			// Use the specified window or the current window if no argument
			w = w || window;

			// This works for all browsers except IE8 and before
			if (w.innerWidth != null) return { w: w.innerWidth, h: w.innerHeight };

			// For IE (or any browser) in Standards mode
			var d = w.document;
			if (document.compatMode == "CSS1Compat"){
				return {
					w: d.documentElement.clientWidth,
					h: d.documentElement.clientHeight
				};
			}

			// For browsers in Quirks mode
			return { w: d.body.clientWidth, h: d.body.clientHeight };

		}
		var vp_dims = getViewportSize(window);
		var bodyWidth  = document.querySelector("body").clientWidth;
		var bodyHeight = document.querySelector("body").clientHeight;
		var scale=1;

		// Is this a scale reset?
		if(reset){
			scale=1;
		}

		// Don't shrink the view. Only enlarge.
		else if(bodyHeight > vp_dims.h){
			scale=1;
			// console.log("No scaling.");
			// return;
		}

		// Scaled body cannot go larger than the viewport height.
		else{
			while(
				scale*bodyHeight < vp_dims.h-40 &&
				scale*bodyWidth < vp_dims.w-40
			){ scale+=0.05; }
		}

		// console.log(scale);

		// Req for IE9
		// setTimeout(function(){
			// console.log(scale);
			document.querySelector("body").style['transform-origin'] = 'top';
			document.querySelector("body").style['-ms-transform']    = 'scale(' + scale + ')';
			document.querySelector("body").style['-moz-transform']   = 'scale(' + scale + ')';
			document.querySelector("body").style['transform']        = 'scale(' + scale + ')';
		// }, 1);

		// window.getComputedStyle(document.querySelector("body"), "")["transform"] ||
		// window.getComputedStyle(document.querySelector("body"), "")["-moz-transform"] ||
		// window.getComputedStyle(document.querySelector("body"), "")["-ms-transform"]

	}
};