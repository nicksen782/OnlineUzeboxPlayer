/**
 * Element.requestFullScreen() polyfill
 * @author Chris Ferdinandi
 * @license MIT
 */
if (!Element.prototype.requestFullscreen) {
	Element.prototype.requestFullscreen =
		Element.prototype.mozRequestFullscreen ||
		Element.prototype.webkitRequestFullscreen ||
		Element.prototype.msRequestFullscreen ||
		Element.prototype.mozFullScreen ;
}

/**
 * document.exitFullScreen() polyfill
 * @author Chris Ferdinandi
 * @license MIT
 */
if (!document.exitFullscreen) {
	document.exitFullscreen =
		document.mozExitFullscreen ||
		document.webkitExitFullscreen ||
		document.msExitFullscreen;
}

/**
 * document.fullscreenElement polyfill
 * Adapted from https://shaka-player-demo.appspot.com/docs/api/lib_polyfill_fullscreen.js.html
 * @author Chris Ferdinandi
 * @license MIT
 */
 /*
if (!document.fullscreenElement) {
	try{
		Object.defineProperty(document, 'fullscreenElement', {
			get: function() {
				return document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement;
			}
		});
	}
	catch(e){ console.log("Define: fullscreenElement: failure",e); }

	try{
		Object.defineProperty(document, 'fullscreenEnabled', {
			get: function() {
				return document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitFullscreenEnabled;
			}
		});
	}
	catch(e){ console.log("Define: fullscreenEnabled: failure",e); }
}
 */