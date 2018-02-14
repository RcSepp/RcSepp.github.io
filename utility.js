function isUndefined(x)
{
	return typeof x === 'undefined'
}

function isFunction(x)
{
	return typeof x === 'function'
}

function isArray(x)
{
	return Object.prototype.toString.call(x) === "[object Array]";
}

function isString(x)
{
	return typeof x === 'string'
}

function isNumber(x)
{
	return typeof x === 'number'
}

function isObject(x)
{
	var t = typeof x;
	return t !== 'undefined' && t !== 'function' && t !== 'string' && t !== 'number' && Object.prototype.toString.call(x) !== "[object Array]"
}

Array.create = function(n, func) {
	var array = new Array(n);
	if (isFunction(func))
		for (var i = 0; i < n; ++i)
			array[i] = func(i);
	else
		array.fill(func);
	return array;
};

function getURLParameter(name) //Source: http://stackoverflow.com/a/11582513
{
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

function getScrollbarWidth() // Source: http://stackoverflow.com/a/13382873
{
	var outer = document.createElement("div");
	outer.style.visibility = "hidden";
	outer.style.width = "100px";
	outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

	document.body.appendChild(outer);

	var widthNoScroll = outer.offsetWidth;
	// force scrollbars
	outer.style.overflow = "scroll";

	// add innerdiv
	var inner = document.createElement("div");
	inner.style.width = "100%";
	outer.appendChild(inner);        

	var widthWithScroll = inner.offsetWidth;

	// remove divs
	outer.parentNode.removeChild(outer);

	return widthNoScroll - widthWithScroll;
}

String.prototype.replaceAll = function(search, replacement) { // Source: http://stackoverflow.com/a/17606289
	var target = this;
	return target.replace(new RegExp(search, 'g'), replacement);
};


Array.intersection = function(a, b) { //Source: http://stackoverflow.com/a/16227294
	// Loop over shorter array
	var t;
	if (b.length > a.length) t = b, b = a, a = t;
	
	return a
		.filter(function (e) { return b.indexOf(e) !== -1; }) // Find intersection
		.filter(function (e, i, c) { return c.indexOf(e) === i; }) // Remove duplicates
	;
}


function ValidURL(str) //Source: http://stackoverflow.com/a/1701911
{
	var regexp = /(file|https?):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
	return regexp.test(str);
}

Node.prototype.insertAfter = function(newNode, referenceNode) { //Source: http://stackoverflow.com/a/4793630
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};

var _downloader;
function download(filename, contentUrl)
{
	if (!_downloader)
		document.body.appendChild(_downloader = document.createElement('a'));
	
	_downloader.href = contentUrl;
	_downloader.download = filename;
	_downloader.click();
}

HTMLDivElement.prototype.computeInnerWidth = function() { // Source: https://stackoverflow.com/a/23270007
	var style = this.currentStyle || window.getComputedStyle(this),
		width = this.offsetWidth,
		margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight),
		padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
		border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
	return width + margin - padding + border;
};

window.requestAnimFrame = (function() {
return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
			window.setTimeout(callback, 1000/60);
		};
})();

Math.clamp = function(f, min, max)
{
	return f <= min ? min : (f >= max ? max : f);
}

if (!String.prototype.format) {
	/**
	 * Source: http://stackoverflow.com/a/4673436
	 * @param {...*} var_args
	 */
	String.prototype.format = function(var_args) {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}