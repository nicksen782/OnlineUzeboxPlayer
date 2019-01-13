// Nickolas Andersen (nicksen782)
if(typeof window.getQueryStringAsObj != "function"){
	window.getQueryStringAsObj = function() {
		var str = window.location.search ;
		var obj = {} ;
		var part ;
		var i ;

		// Work with the string if there was one.
		if(str != ""){
			// Take off the "?".
			str = str.slice(1);

			// Split on "&".
			str = str.split("&");

			// Go through all the key=value and split them on "=".
			for(i=0; i<str.length; i+=1){
				// Split on "=".
				part = str[i].split("=");

				// Add this to the return object.
				obj[ part[0] ] = part[1];
			}
		}

		// Finally, return the object.
		return obj;
	};
}