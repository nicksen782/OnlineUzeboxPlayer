// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches

if (!Element.prototype.matches)
    Element.prototype.matches = Element.prototype.msMatchesSelector     || // IE9/10/11 & Edge
                                Element.prototype.webkitMatchesSelector || // Chrome <34, SF<7.1, iOS<8
                                Element.prototype.mozMatchesSelector       // FF<34
                                ;
