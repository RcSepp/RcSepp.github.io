var nav, aTitle, aSubtitle, ulMain, cmdOpenTopMenu, divContent, measureDiv;
var menuOpen = false, topNavHeight, thumbnailWidth;
var glBanners = null;

function onLoad()
{
	nav = document.getElementById('navTop');
	aTitle = document.getElementById('aTitle');
	aSubtitle = document.getElementById('aSubtitle');
	ulMain = document.getElementById('ulMain');
	cmdOpenTopMenu = document.getElementById('cmdOpenTopMenu');
	divContent = document.getElementById('content');
	measureDiv = document.getElementById('measureDiv');
	
	onResize();
	
	var request = new XMLHttpRequest();
	request.open("GET", "content/content.json", true);
	request.overrideMimeType("application/json; charset=utf8");
	request.onload = function(event) {
		if (request.readyState === 4 && request.status === 200)
		{
			var content = JSON.parse(request.responseText).content;
			onContentLoaded(content, getURLParameter("view"));
		}
	}
	request.send();
}

String.prototype.replaceTex = function(cbk) {
	var result = "", lastmatchEnd = 0;
	
	// Find \
	for (var i = 0; i < this.length;)
		if (this[i] === '\\')
		{
			var matchBegin = i++;
			if (i == this.length)
				break;
			if (this[i] === '\\') // Ignore \\
			{
				++i;
				continue;
			}
			
			// Find end of keyword
			while (i < this.length && /[a-z0-9_\*]/i.test(this[i])) ++i;
			if (i == this.length) break;
			var keywordEnd = i;
			if(keywordEnd - matchBegin === 1)
				continue; // Ignore single \
			
			// Find {param}*
			var params = [];
			while (true)
			{
				// Skip white-space
				while (i < this.length && /\s/i.test(this[i])) ++i;
				if (i == this.length) break;
				
				// Skip [param]
				if (this[i] === '[')
				{
					++i;
					for (var d = 1; i < this.length; ++i)
					{
						if (this[i] === '[')
							++d;
						else if (this[i] === ']' && --d == 0)
							break;
					}
					++i;
				}
				
				if (this[i] !== '{')
					break;
				var paramBegin = ++i;
				
				// Find paramEnd by performing bracket balancing
				for (var d = 1; i < this.length; ++i)
				{
					if (this[i] === '{')
						++d;
					else if (this[i] === '}' && --d == 0)
						break;
				}
				if (i == this.length) break;
				var paramEnd = i++;
				
				params.push(this.substr(paramBegin, paramEnd - paramBegin).replaceTex(cbk));
			}
			
			//console.log(this.substr(matchBegin, i - matchBegin));
			//console.log(this.substr(matchBegin, keywordEnd - matchBegin));
			//console.log(params);
			var cmd = this.substr(matchBegin + 1, keywordEnd - matchBegin - 1);
			//var match = this.substr(matchBegin, i - matchBegin);
			var match = '\\' + cmd + (params.length == 0 ? "" : '{' + params.join("}{") + '}');
			var replacement = cbk(match, cmd, params);
			//console.log(this.substr(matchBegin, i - matchBegin));
			result += this.substr(lastmatchEnd, matchBegin - lastmatchEnd) + replacement;
			
			lastmatchEnd = i;
		}
		else
			++i;
		
		result += this.substr(lastmatchEnd, this.length - lastmatchEnd)
		return result;
};

function loadResume()
{
/*console.log(`
\\cCentry*{2017}{SMC Data Challenge 2017}{Smokey Mountain Computational Science and Engineering Conference}{\\URL{https://smc-datachallenge.ornl.gov/2017/}}{\\textbf{Best Solution}}
{Data mining atomically resolved images for material properties}{}
\\cventry{2009}{ARGE 3D-CAD Competition}{Category: ProEngineer - Advanced}{\\url{http://www.3d-cad.at}}{\\textbf{1\\textsuperscript{st} Place}}{3D model and animation of the thesis \\emph{Automated Guided Vehicle}}
\\cventry{2004}{ARGE 3D-CAD Competition}{}{\\url{http://www.3d-cad.at}}{\\textbf{2\\textsuperscript{nd} Place}}{3D model and animation of a recreational vehicle}
`.replaceTex(function(match, cmd, params) {
	return cmd == "URL" ? cmd : match;
}));
return;*/
	
	var request = new XMLHttpRequest();
	request.open("GET", "resume/Resume - Sebastian Klaassen.tex", true);
	//request.overrideMimeType("application/x-tex; charset=utf8");
	request.overrideMimeType("text/plain; charset=utf8");
	request.onload = function(event) {
		if (request.readyState === 4 && request.status === 200)
		{
			// Get LaTeX string
			var tex = request.responseText;
			
			// Remove comments
			tex = tex.replace(/%.*\n/g, '');
			
			// Replace '--' with '-'
			tex = tex.replace(/--/g, ' - ');
			
			// Replace LaTeX commands with HTML tags
			tex = tex.replaceTex(function(match, cmd, params) {
				switch(cmd)
				{
				case 'textbf': return "<b>" + params[0] + "</b>";
				case 'textit': return "<i>" + params[0] + "</i>";
				case 'textsc': return "<span style='font-variant: small-caps;'>" + params[0] + "</span>";
				case 'emph': return "<var>" + params[0] + "</var>";
				case 'normalfont': case 'textnormal': return "</b>" + params[0] + "<b>"; //TODO: Lazy fix
				case 'textsuperscript': return "<sup>" + params[0] + "</sup>";
				case 'url':
					var linkText = params[0], link = params[0];
					var p = link.indexOf('|');
					if (p !== -1)
					{
						linkText = link.substr(p + 1);
						link = link.substr(0, p);
					}
					return "<a href='" + link + "' target='_blank'>" + linkText + "</a>";
					//return "";
				case 'item': return "<li>", "</li>";
				case 'caption': return " " + params[0];
				
				case 'section': return "<tr><th align='right' valign='top' style='width: 150px;'></th><th valign='top'>" + params + "</th></tr>";
				case 'subsection': return "<tr><td align='right' valign='top'></td><td valign='top' style='color: blue;'>" + params + "</td></tr>";
				case 'cvitem': return "<tr><td align='right' valign='top'>" + params[0] + "</td><td valign='top'>" + params.slice(1).join(', ') + "</td></tr>";
				case 'linksection':
					var target = undefined;
					if (params.length !== 0)
					{
						var targetParam = params.shift();
						if (isString(targetParam) && targetParam.length !== 0)
							target = "index.html?view=" + targetParam;
					}
					return '<a class="linkRow" href="' + target + '">' + params[0] + '</a>';
				case 'linkentry':
					var target = undefined;
					if (params.length !== 0)
					{
						var targetParam = params.shift();
						if (isString(targetParam) && targetParam.length !== 0)
							target = "index.html?view=" + targetParam;
					}
					// Falls through
				case 'cventry':
					var details = "";
					if (params.length >= 1 && params[1] !== '') details = "<b>" + params[1] + "</b>";
					if (params.length >= 2 && params[2] !== '') details = (details === '' ? '' : details + ", ") + "<i>" + params[2] + "</i>";
					if (params.length >= 3 && params[3] !== '') details = (details === '' ? '' : details + ", ") + params[3];
					if (params.length >= 4 && params[4] !== '') details = (details === '' ? '' : details + ", ") + params[4];
					if (details !== '') details += ".";
					if (params.length >= 5 && params[5] !== '') details = (details === '' ? '' : details + "<br>") + params[5];
					if (target)
						return `<tr class='linkRow'>
									<td align='right' valign='top'>
										<a class="overlay" href="{2}" style="position:absolute"></a>
										<div class="linkRowBody">{0}</div>
									</td>
									<td valign='top'>
										<a class="overlay" href="{2}" style="position:absolute"></a>
										<div class="linkRowBody">{1}</div>
									</td>
								</tr>`.format(params[0], details, target);
					else
						return `<tr>
									<td align='right' valign='top'>{0}</td>
									<td valign='top'>{1}</td>
								</tr>`.format(params[0], details);
				case 'begin':
				case 'end':
				case 'moderncvstyle':
				case 'documentclass':
				case 'usepackage':
				case 'moderncvcolor':
				case 'firstname':
				case 'familyname':
				case 'title':
				case 'vspace':
				case 'vspace*':
				case 'setlength':
				case 'address':
				case 'mobile':
				case 'email':
				case 'extrainfo':
				case 'homepage':
				case 'makecvtitle':
				case 'newcommand':
					console.log(cmd);
					console.log(params);
					return ''; // Ignore
				default: return match; // Keep
				}
			});
			
			// Handle inherent line breaks ('\n\n')
			tex = tex.replace(/\n\n\s*/g, function(match) { return "<br>"; });
			
			// Remove single line breaks ('\n')
			tex = tex.replace(/\n/g, function(match, firstChar) { return ''; });
			
			// Remove newline
			tex = tex.replace(/\\\\/g, "<br>");
			tex = tex.replace(/\\newline/g, "<br>");
			
			// Handle escaped characters
			tex = tex.replace(/\\#/g, "#");
			tex = tex.replace(/\\&/g, "&");
			
			tex = "<br><table class='resumeTable' cellspacing='0' cellpadding='0'>" + tex + "</table>";
			//console.log(tex);
			
			var element = document.createElement("div"); 
			element.id = "htmlContainer";
			element.className = "tex2jax_process";
			element.innerHTML = tex;
			divContent.appendChild(element);
		}
	}
	request.send();
}

var makeId = function(title, id) {
	if (id)
		return id;
	
	id = title.replaceAll(' ', '');
	var p = id.indexOf(':');
	if (p !== -1)
		id = id.substr(0, p);
	return encodeURIComponent(id);
};
function onContentLoaded(content, view)
{
	var addElement = function(parent, type, parameters) {
		var element = document.createElement(type); 
		for (p in parameters)
			element[p] = parameters[p];
		parent.appendChild(element);
		return element;
	};
	var insertElement = function(parent, prev, type, parameters) {
		var element = document.createElement(type); 
		for (p in parameters)
			element[p] = parameters[p];
		parent.insertAfter(element, prev);
		return element;
	};
	
	var selectLanguages = null, selectTypes = null;
	switch (view)
	{
	case null:
		addElement(divContent, "pre", { innerHTML:
`
<h2>Sebastian Klaassen</h2>
Computer Scientist<br>
Oak Ridge TN, 37830<br>
<img src="email.jpg"></img>
<h2>Resume</h2>
<a href='resume/Resume - Sebastian Klaassen.pdf' target='_blank'>PDF download</a>
`
		});
		loadResume();
		break;
	
	case 'projects':
		// >>> Create project filter controls
		var divFilters = addElement(divContent, "table", {id: "filterTable"});
		
		// Create language filter controls
		var trFilter = addElement(divFilters, "tr");
		addElement(trFilter, "td", { innerText: "Languages: ", valign: "top" });
		selectLanguages = addElement(trFilter, "select", { multiple: true, id: "selectLanguages" });
		
		// Create subtype filter controls
		var trFilter = addElement(divFilters, "tr");
		addElement(trFilter, "td", { innerText: "Project types: ", valign: "top" });
		selectTypes = addElement(trFilter, "select", { multiple: true, id: "selectTypes" });
		selectLanguages.onchange = selectTypes.onchange = function () {
			var selectedLanguages = $(selectLanguages).val();
			selectedLanguages = selectedLanguages ? selectedLanguages : [];
			var selectedTypes = $(selectTypes).val();
			selectedTypes = selectedTypes ? selectedTypes : [];
			$(".content").each((i, e) => e.style.display = 
				(e.content.languages.some(l => selectedLanguages.indexOf(l) !== -1) &&
				e.content.subtype && selectedTypes.indexOf(e.content.subtype) !== -1)
				? "inherit" : "none"
			);
		};
		
		// Create sort order filter controls
		var trFilter = addElement(divFilters, "tr");
		addElement(trFilter, "td", { innerText: "Sort by: ", valign: "top" });
		var selectSort = addElement(trFilter, "select", { id: "selectSort" });
		["Default", "Title", "Year"].forEach(key => addElement(selectSort, "option", { value: key, innerText: key}));
		selectSort.onchange = function() {
			var $banners = $(".content");
			switch($(this).val())
			{
				case "Default": $banners.sort((e1, e2) => e1.index < e2.index ? -1 : (e1.index > e2.index ? 1 : 0)); break;
				case "Title": $banners.sort((e1, e2) => e1.content.title < e2.content.title ? -1 : (e1.content.title > e2.content.title ? 1 : 0)); break;
				case "Year": $banners.sort((e1, e2) => e2.content.year - e1.content.year); break;
			}
			$(divContent).append($banners);
		};
		$("#selectSort").selectize({
			create: true
		});
	case 'publications':
		var contentType = view.substr(0, view.length - 1);
		var languages = {}, subtype = {};
		content.forEach(function(c) {
			if (c.type !== contentType || !c.title || c.title === '')
				return;
			if (c.languages && c.languages.length !== 0)
				c.languages.forEach(language => languages[language] = true);
			if (c.subtype)
				subtype[c.subtype] = true;
		});
		
		glBanners = GLBanners.create(content, contentType);
		if (glBanners !== null)
		{
			divContent.appendChild(glBanners.getCanvas());
			glBanners.resize(Math.floor(divContent.computeInnerWidth()));
			if (selectLanguages && selectTypes)
				selectLanguages.onchange = selectTypes.onchange = function () {
					var selectedLanguages = $(selectLanguages).val();
					selectedLanguages = selectedLanguages ? selectedLanguages : [];
					var selectedTypes = $(selectTypes).val();
					selectedTypes = selectedTypes ? selectedTypes : [];
					glBanners.filter(content =>
						content.languages.some(l => selectedLanguages.indexOf(l) !== -1) &&
						content.subtype && selectedTypes.indexOf(content.subtype) !== -1
					);
				};
			if (selectSort)
				selectSort.onchange = function() {
					switch($(this).val())
					{
						case "Default": glBanners.sort(null); break;
						case "Title": glBanners.sort((c1, c2) => c1.title < c2.title); break;
						case "Year": glBanners.sort((c1, c2) => c1.year > c2.year); break;
					}
				};
		}
		else
			content.forEach(function(c, i) {
				if (c.type !== contentType || !c.title || c.title === '')
					return;
				
				///>>> Add banner
				
				var id = makeId(c.title, c.id);
				var thumbnail = c.thumbnail;// || (c.images && c.images.length !== 0 ? c.images[0] : null);
				
				var banner = addElement(divContent, "a", { id: "projectBanner", className: "content", href: "./index.html?view=" + id, content: c, index: i });
				
				if (thumbnail) addElement(banner, "img", { src: thumbnail, alt: c.title });
				
				var bannerContainer = addElement(banner, "div", { className: "container" });
				var title = addElement(bannerContainer, "h2", { className: "bannerTitle", innerText: c.title });
				if (c.brief)
					var brief = addElement(bannerContainer, "p", { innerText: c.brief });
				if (c.year)
					addElement(bannerContainer, "p", { className: "leftTag", innerText: "Year: " + c.year });
				if (c.type === 'project' && c.languages && c.languages.length !== 0)
					addElement(bannerContainer, "p", { className: "rightTag", innerText: (c.languages.length === 1 ? "Language: " : "Languages: ") + c.languages.join(", ") });
				else if (c.type === 'publication')
					addElement(bannerContainer, "p", { className: "rightTag", innerText: isString(c.subtype) ? c.subtype : c.subtype.join(", ") });
			});
		
		if (view === 'projects')
		{
			// Fill filter controls
			languages = Object.keys(languages).sort();
			languages.forEach(language => addElement(selectLanguages, "option", { value: language, innerText: language}));
			$("#selectLanguages").selectize({
				items: languages
			});
			subtype = Object.keys(subtype).sort();
			subtype.forEach(type => addElement(selectTypes, "option", { value: type, innerText: type}));
			$("#selectTypes").selectize({
				items: subtype
			});
		}
		break;
		
	default:
		var c = content.find(function(c) { return makeId(c.title, c.id) === view; });
		if (c)
		{
			// >>> Create content page
			
			var id = makeId(c.title, c.id);
			
			if (c.images && c.images.length !== 0)
			{
				/*var divContentImage = addElement(divContent, "div", { id: "divContentImage" });
				var imgContentImage = addElement(divContentImage, "img", { alt: c.title, onclick: function() { window.open(this.src); } });
				var videoContentImage = addElement(divContentImage, "video", { controls: true });
				var activeNobe;
				if (c.images.length === 1)
				{
					if (c.images[0].endsWith('.mp4') || c.images[0].endsWith('.webm') || c.images[0].endsWith('.ogg'))
					{
						imgContentImage.style.display = 'none';
						videoContentImage.style.display = 'block';
						videoContentImage.src = c.images[0];
					}
					else
					{
						videoContentImage.style.display = 'none';
						imgContentImage.style.display = 'block';
						imgContentImage.src = c.images[0];
					}
				}
				else
					for (var i = 0; i < c.images.length; ++i)
					{
						var nobe = addElement(divContentImage, "input", {
							id: "nobe",
							type: "image", 
							src: "nobe.png",
							fileName: c.images[i],
							fileType: (c.images[i].endsWith('.mp4') || c.images[i].endsWith('.webm') || c.images[i].endsWith('.ogg')) ? 'video' : 'image',
							onclick: function(event) {
								activeNobe.style.opacity = 0.5;
								activeNobe = event.target;
								if (activeNobe.fileType === 'video')
								{
									imgContentImage.style.display = 'none';
									videoContentImage.style.display = 'block';
									videoContentImage.src = activeNobe.fileName;
								}
								else
								{
									videoContentImage.style.display = 'none';
									imgContentImage.style.display = 'block';
									imgContentImage.src = activeNobe.fileName;
								}
								activeNobe.style.opacity = 1;
							}
						});
						nobe.style.marginLeft = (i - c.images.length / 2) * 28 + 'px';
						if (i === 0)
						{
							activeNobe = nobe;
							if (activeNobe.fileType === 'video')
							{
								imgContentImage.style.display = 'none';
								videoContentImage.style.display = 'block';
								videoContentImage.src = activeNobe.fileName;
							}
							else
							{
								videoContentImage.style.display = 'none';
								imgContentImage.style.display = 'block';
								imgContentImage.src = activeNobe.fileName;
							}
						}
						else
							nobe.style.opacity = 0.5;
					}*/
				
				var pswpElement = document.querySelectorAll('.pswp')[0];
				var items = []; // Will be filled dynamically
				var options = {
					index: 0, // Will be set dynamically
					getThumbBoundsFn: function(index) {
						var thumbnail = items[index]._img,
							pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
							rect = thumbnail.getBoundingClientRect(); 
						
						return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
					},
					loop: false,
					shareEl: false,
					history: false
				};
				
				var divContentImage = addElement(divContent, "div", { id: "divContentImage" });
				for (var i = 0; i < c.images.length; ++i)
				{
					var src = c.images[i].split('|');
					if (src.length < 3)
					{
						console.warn("Malformated image src: " + c.images[i]);
						continue;
					}
					var imageUrl = "content/" + src[0];
					var imageThumbnailUrl = "content/thumbnails/" + src[0].replace(/\.[^/.]+$/, ".jpg");
					var imageWidth = parseInt(src[1]);
					var imageHeight = parseInt(src[2]);
					var imageLabel = src.length > 3 ? src[3] : undefined;
					var imageIsVideo = imageUrl.endsWith('.mp4') || imageUrl.endsWith('.webm') || imageUrl.endsWith('.ogg');
					
					var figure = addElement(divContentImage, "figure", { itemprop: "associatedMedia", itemscope: true, itemtype: "http://schema.org/ImageObject", index: i });
					var figureLink = addElement(figure, "a", { href: imageUrl, itemprop: "contentUrl", 'data-size': "600x400" });
					figureLink.onclick = function(event) {
						event = event || window.event;
						event.preventDefault ? event.preventDefault() : event.returnValue = false;
						var figure = event.target || event.srcElement;
						
						while (figure.tagName.toUpperCase() !== "FIGURE")
							figure = figure.parentElement;
						
						// Initializes and opens PhotoSwipe
						options.index = figure.index;
						var pswp = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
						pswp.listen('afterChange', function() {
							//console.log('afterChange');
							checkVideo();
							if (!isUndefined(pswp.currItem.videosrc))
							{
								sizeVideo(pswp.viewportSize, pswp.currItem.vw,  pswp.currItem.vh);
								videoRunning = true;
							}
						});
						pswp.listen('resize', function () {
							//console.log('resize');
							if (videoRunning)
								sizeVideo(pswp.viewportSize, pswp.currItem.vw,  pswp.currItem.vh);
						});
						pswp.listen('close', function () { /*console.log('close');*/ checkVideo(); });
						pswp.listen('beforeChange', function () { /*console.log('beforeChange');*/ checkVideo(); });
						pswp.init();
					};
					var figureThumbnail = addElement(figureLink, "img", { src: imageThumbnailUrl, itemprop: "thumbnail", alt: "Image description" });
					if (imageIsVideo)
						addElement(figureLink, "span", { style: "position: absolute; top: 0px; left: 0px; bottom: 0px; right: 0px; background: url(video-icon.svg) no-repeat center center; background-size: 25%;" });
					/*if (imageLabel)
					{
						figure.style.paddingBottom = "4px";
						addElement(figureLink, "figcaption", { itemprop: "caption description", innerText: imageLabel });
					}*/
					
					if (imageIsVideo)
						items.push({
//							src: imageUrl,
							w: imageWidth,
							h: imageHeight,
							_img: figureThumbnail,
							title: imageLabel,
vw: imageWidth, vh: imageHeight,
html: "<video controls=true src=" + imageUrl + "></video>",
videosrc: imageUrl
						});
					else
						items.push({
							src: imageUrl,
							w: imageWidth,
							h: imageHeight,
							_img: figureThumbnail,
							title: imageLabel
						});
				}
			}
			
			/*var index = content.indexOf(c);
			if (index > 1)
			{
				var cmdPrev = addElement(divContent, "button", { innerText: "Prev" });
				cmdPrev.onclick = function() {
					window.location.href = "./index.html?view=" + makeId(content[index - 1].title, content[index - 1].id);
				};
			}
			if (index + 1 < content.length && content[index + 1].type == )TODO
			{
				var cmdNext = addElement(divContent, "button", { innerText: "Next" });
				cmdNext.onclick = function() {
					window.location.href = "./index.html?view=" + makeId(content[index + 1].title, content[index + 1].id);
				};
			}
			var cmdBack = addElement(divContent, "button", { innerText: "Back" });
			cmdBack.onclick = function() {
				//while (divContent.hasChildNodes())
				//	divContent.removeChild(divContent.lastChild);
				//onContentLoaded(content, c.type + 's', true);
				window.location.href = "./index.html?view=" + c.type + 's';
			};*/
			
			var elementBeforeDetails = addElement(divContent, "h1", { innerText: c.title });
			
			if (c.abstract)
			{
				if (c.details)
					addElement(divContent, "h2", { innerText: "Abstract" });
				elementBeforeDetails = addElement(divContent, "p", { innerHTML: c.abstract });
			}
			else if (c.brief)
				elementBeforeDetails = addElement(divContent, "p", { innerText: c.brief });
			
			if (c.details)
			{
				if (ValidURL(c.details))
				{
					var request = new XMLHttpRequest();
					request.open("GET", c.details.startsWith("file:///") ? c.details.substr("file:///".length) : c.details, true);
					//request.overrideMimeType("application/x-tex; charset=utf8");
					request.overrideMimeType("text/plain; charset=utf8");
					request.onload = function(event) {
						if (request.readyState === 4 && request.status === 200)
						{
							/*if (c.details.endsWith(".tex"))
							{
								// Get LaTeX string
								var tex = request.responseText;
								
								// Remove comments
								tex = tex.replace(/%.*\n/g, '');
								
								// Replace LaTeX commands with HTML tags
								var close = "";
								var _ = function(str, open) {
									str = close + str;
									close = open ? open : "";
									return str;
								};
								tex = tex.replace(/\\(\D?\w*)(?:{([^}]*)})?(?:\[([^\]]*)\])?(?:{([^}]*)})?/g, function(match, cmd, params) {
									//console.log([match, cmd, params]);
									switch(cmd)
									{
									case 'begin':
										switch(params)
										{
										case 'itemize': return _("<ul>");
										case 'algorithm': return _("<p class='algorithm_head'><b>Algorithm 1</b>");
										case 'algorithmic': return _("</p><p class='algorithm_body'>");//case 'algorithmic': return _("</p><pre class='algorithm_body'><code>");
											
										case 'document':
											return _(''); // Ignore
										default: return _(match); // Keep
										}
									case 'end':
										switch(params)
										{
										case 'itemize': return _("</ul>");
										case 'algorithmic': return _("</p>");//case 'algorithmic': return _("<code></pre>");
											
										case 'document':
										case 'algorithm':
											return _(''); // Ignore
										default: return _(match); // Keep
										}
										
									case 'section': return _("<h1>" + params + "</h1>");
									case 'textbf': return _("<b>" + params + "</b>");
									case 'emph': return _("<var>" + params + "</var>");
									case 'cite':
										var linkText = params, link = params;
										var p = link.indexOf('|');
										if (p !== -1)
										{
											linkText = link.substr(p + 1);
											link = link.substr(0, p);
										}
										return _("<a href='" + link + "' target='_blank'>" + linkText + "</a>");
									case 'item': return _("<li>", "</li>");
									case 'caption': return _(" " + params);
									
									case 'Procedure': return _("<br> 1: <b>procedure</b> " + params);
									case 'EndProcedure': return _("");
									case 'State': return _("<br> 1: ");
									case 'BState': return _("<br> 1: ");
									case 'If': return _("<br> 1: <b>if</b> " + params + " <b>then</b>");
									case 'EndIf': return _("");
									case 'Return': return _("<b>return</b> ");
										
									case 'documentclass':
									case 'label':
										return _(''); // Ignore
									default: return _(match); // Keep
									}
								});
								
								// Handle inherent line breaks ('\n\n')
								tex = tex.replace(/\n\n\s*(\S)/g, function(match, firstChar) {
									return firstChar === '<' ? '<' : "<br>&emsp;" + firstChar;
								});
								
								//console.log(tex);
								
								insertElement(divContent, elementBeforeDetails, "div", { id: "htmlContainer", className: "tex2jax_process", innerHTML: tex });
							}
							else*/ if (c.details.endsWith(".md"))
							{
								var converter = new showdown.Converter();
								converter.setFlavor('github');
								var html = converter.makeHtml(request.responseText);
								insertElement(divContent, elementBeforeDetails, "div", { id: "htmlContainer", className: "tex2jax_process", innerHTML: html });
							}
						}
					}
					request.send();
				}
				else // If c.details isn't a URL, ...
					addElement(divContent, "div", { id: "htmlContainer", innerHTML: c.details });
			}
			
			if (c.links && c.links.length !== null)
			{
				addElement(divContent, "h2", { innerText: "Links" });
				
				for(var link in c.links)
				{
					var divLink = addElement(divContent, "div", { id: "contentLink" });
					addElement(divLink, "p", { innerText: link + ':' });
					var linkText = link = c.links[link];
					var p = link.indexOf('|');
					if (p !== -1)
					{
						linkText = link.substr(p + 1);
						link = link.substr(0, p);
					}
					addElement(divLink, "a", { innerText: linkText, href: link, target: "_blank" });
				}
			}
		}
	}
	
	onResize();
}


function onResize()
{
	var html = document.documentElement;
	var body = document.body;
	var width = window.innerWidth || html.clientWidth || body.clientWidth;
	var height = window.innerHeight|| html.clientHeight|| body.clientHeight;
	
	var dpi_x = measureDiv.offsetWidth, dpi_y = measureDiv.offsetHeight;
	
	/*var viewportHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
	if (width > 960)
		nav.style.height = viewportHeight + 'px';*/
	
	var rect = nav.getBoundingClientRect();
	var s = Math.min((rect.right - rect.left) * 0.15, (rect.bottom - rect.top) * 0.3);
	nav.style.padding = s + 'px';
	
	if (width > 960)
	{
		divContent.style.left = rect.right + 'px';
		divContent.style.top = '0px';
		divContent.style.width = (width - (rect.right - rect.left)) + 'px';
	}
	else
	{
		divContent.style.left = '0px';
		divContent.style.top = rect.bottom + 'px';
		divContent.style.width = width + 'px';
		//console.log(width + 'px');
	}
	var CONTENT_SIZE = 7.3 * dpi_x;
	var padding = Math.max(width > 480 ? 0.8 * dpi_x : 8, (width - rect.right - CONTENT_SIZE) / 2);
	divContent.style.paddingLeft = divContent.style.paddingRight = padding + 'px';
	var divContentImage = document.getElementById("divContentImage");
	if (divContentImage)
		divContentImage.style.marginLeft = divContentImage.style.marginRight = -padding + 'px';
	
	var bannerWidth = divContent.computeInnerWidth(), bannerHeight = bannerWidth * 0.25;
	
	if (glBanners !== null)
		glBanners.resize(Math.floor(bannerWidth));
	
	
	rect = cmdOpenTopMenu.getBoundingClientRect();
	cmdOpenTopMenu.style.width = rect.bottom - rect.top + 'px';
	
	
	var rect = divContent.getBoundingClientRect();
	var banners = document.querySelectorAll('#projectBanner');
	for (var i = 0; i < banners.length; ++i)
		banners[i].style.height = bannerHeight + 'px';//(rect.right - rect.left) * 0.2 + 'px';
	
	
	if (menuOpen && width > 960)
		cmdOpenTopMenu_onclick();
}

function cmdOpenTopMenu_onclick()
{
	menuOpen = !menuOpen;
	if (menuOpen)
	{
		cmdOpenTopMenu.innerHTML = '&times;';
		cmdOpenTopMenu.style.fontSize = '38px';
		ulMain.style.display = 'initial';
	}
	else
	{
		cmdOpenTopMenu.innerHTML = '&#8801;';
		cmdOpenTopMenu.style.fontSize = '26px';
		ulMain.style.display = 'none';
	}
	//onResize();
}





var videoRunning = false;

function checkVideo()
{
	if (videoRunning) {
		$("video").each(function () { this.pause() });
		$('video').css({visibility: 'hidden' })
		videoRunning = false;
	}
}

function sizeVideo(vp, imgW, imgH)
{
	var winW = vp.x;
	var winH = vp.y -100;
	var imgRatio = imgW / imgH;
	var tWidth = winW;
	var tHeight = winH;
	function scaleWB() { tWidth = winW; tHeight = tWidth / imgRatio; }
	function scaleBW() { tHeight = winH; tWidth = tHeight * imgRatio; }
	if (imgRatio >= 1)
	{
		scaleWB();
		if (tHeight > winH) { scaleBW(); }
		if (tWidth > imgW) { tWidth = imgW; tHeight = imgH; }
	}
	else
	{
		scaleBW();
		if (tWidth > winW) { scaleWB(); }
		if (tHeight > imgH) { tWidth = imgW; tHeight = imgH; }
	}
	var tLeft = (winW - tWidth) / 2;
	var tTop = (winH - tHeight) / 2;
	$('video').css({'left':tLeft, 'top':tTop, 'width':tWidth, 'height':tHeight , visibility: 'visible' });
}