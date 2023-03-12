// Take care of vendor prefixes.
self.postMessage = self.postMessage || self.webkitPostMessage;

_WORKER = {
    canvas: undefined,
    ctx   : undefined,

    clearTheCanvas: function(){
        ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
	textOnCanvas            : function(obj) {
        obj.canvas = canvas;
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
		// let ctx = obj.canvas.getContext("2d");
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
    setpixelated            : function() {
		// https://stackoverflow.com/a/13294650
		ctx.mozImageSmoothingEnabled = false; // Firefox
		ctx.imageSmoothingEnabled = false; // Firefox
		ctx.oImageSmoothingEnabled = false; //
		ctx.webkitImageSmoothingEnabled = false; //
		ctx.msImageSmoothingEnabled = false; //
	},
    grayTheCanvas           : function() {
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
};

self.onmessage = function(event) {
	switch( event.data.mode ){
		case "init"          : { init(event);           break; }
		case "clearTheCanvas": { _WORKER.clearTheCanvas(event); break; }
		case "textOnCanvas"  : { _WORKER.textOnCanvas(event); break; }
		case "setpixelated"  : { _WORKER.setpixelated(event); break; }
		case "grayTheCanvas" : { _WORKER.grayTheCanvas(event); break; }

		// Unmatched function.
		default     : { 
            console.log("ERROR: Unmatched mode"); 
            self.postMessage( { "mode" : event.data.mode, "data" : "", "success":false }, [] );
            break; 
        }
	}
};

function init(event){
    canvas = event.data.data.canvas;
    ctx = canvas.getContext("2d");
    console.log("init:", canvas, ctx);
}