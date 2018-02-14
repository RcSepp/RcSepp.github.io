function GLBanners(canvas, gl, content, contentType)
{
	var glBanners = this;
	var t, sdrImage, sdrShadow, meshQuad, bannerWidth, bannerHeight, banners;

	const canvasBorderWidth = 8;
	const bannerBorderWidth = 8;
	const bannerDistance = 16;

	var Shaders = {};
	Shaders.vsImage =
	`attribute vec3 vpos;
	attribute vec2 vtexcoord;
	uniform mat4 matWorldViewProj;
	uniform vec2 zScale;
	varying vec2 uv;

	void main()
	{
		gl_Position = matWorldViewProj * vec4(vpos, 1.0);
		gl_Position.z = clamp(gl_Position.z, 0.0, 1.0);
		gl_Position.xy += gl_Position.z * zScale;
		uv = vtexcoord;
	}
	`;
	Shaders.fsImage =
	`precision mediump float;
	varying vec2 uv;
	uniform sampler2D uSampler;
	uniform float alpha;

	void main()
	{
		gl_FragColor = texture2D(uSampler, uv);
		gl_FragColor.a = alpha;
	}
	`;
	Shaders.vsShadow =
	`attribute vec3 vpos;
	uniform mat4 matWorldViewProj;

	void main()
	{
		gl_Position = matWorldViewProj * vec4(vpos, 1.0);
		gl_Position.z = clamp(gl_Position.z, 0.0, 1.0);
	}
	`;
	Shaders.fsShadow =
	`precision mediump float;
	uniform float alpha;

	void main()
	{
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5 * alpha);
	}
	`;
	
	// >>> Initialize
	
	this.getCanvas = () => canvas;
	
	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);
	gl.enable(gl.BLEND);
	//gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
	
	// Create shaders
	sdrImage = new Shader(gl, Shaders.vsImage, Shaders.fsImage);
	sdrImage.matWorldViewProj = sdrImage.u4x4f("matWorldViewProj");
	sdrImage.zScale = sdrImage.u2f("zScale");
	sdrImage.alpha = sdrImage.u1f("alpha");
	sdrImage.alpha(1);
	sdrShadow = new Shader(gl, Shaders.vsShadow, Shaders.fsShadow);
	sdrShadow.matWorldViewProj = sdrShadow.u4x4f("matWorldViewProj");
	sdrShadow.alpha = sdrShadow.u1f("alpha");
	sdrShadow.alpha(1);
	
	// Create a 2D quad mesh
	meshQuad = new Mesh(gl, new Float32Array([
		// Positions
		0, 1, 0,
		0, 0, 0,
		1, 1, 0,
		1, 0, 0
	]), null, null, null, new Float32Array([
		// Texture coordinates
		0, 1,
		0, 0,
		1, 1,
		1, 0
	]));
	
	banners = [];
	content.forEach(function(c) {
		if (c.type === contentType && c.title && c.title !== '')
		{
			var thumbnail = c.thumbnail || (c.images && c.images.length !== 0 ? c.images[0] : null);
			if (thumbnail)
			{
				var img = new Image();
				img.onload = () => glBanners.resize();
				img.src = thumbnail;
				thumbnail = img;
			}
			banners.push( {
				content: c,
				texture: null,
				thumbnail: thumbnail,
				visible: true, // Visibility
				alpha: 1.0, // Opacity [0 ... 1]
				pos: banners.length, // Location inside canvas
				z: 0.0 // Vertical positon [0 ... 1]
			});
		}
	});
	//banners = banners.slice(0, 1); // Uncomment this to only show the first banner (for debugging)
	
	// Create banner element templates, to extract CSS information. These elements aren't added to the DOM tree
	var tempProjectBanner = document.createElement("div");
	tempProjectBanner.id = "projectBanner";
	tempProjectBanner.appendChild(canvas.h2 = document.createElement("h2"));
	tempProjectBanner.appendChild(canvas.p = document.createElement("p"));
	
	// Initialize timer
	t = performance.now();

	this.resize = function(width) {
		if (gl === null || banners.length === 0)
			return;
		if (isUndefined(width)) width = gl.width;
		
		canvas.width = gl.width = width;
		bannerWidth = width - 2 * canvasBorderWidth;
		bannerHeight = Math.floor(bannerWidth * 0.2);
		canvas.height = gl.height = banners.length * bannerHeight + (banners.length - 1) * bannerDistance + 2 * canvasBorderWidth;
		canvas.style.height = gl.height + "px";
		gl.viewport(0, 0, gl.width, gl.height);
		sdrImage.zScale(8 / gl.width, 16 / gl.height);
		//console.log(canvas.width);
		//console.log(gl.height);
		
		// Create 2D canvas
		var bannerCanvas = document.createElement('canvas');
		bannerCanvas.width = bannerWidth;
		bannerCanvas.height = bannerHeight;
		//console.log(bannerWidth);
		//console.log(bannerHeight);
		var bannerContext = bannerCanvas.getContext("2d", {alpha: false});
		
		var fontHeight, setFont = function (element) {
			bannerContext.font =
				$(element).css('font-weight') + " " + 
				$(element).css('font-style') + " " + 
				//$(element).css('font-variant') + " " + 
				$(element).css('font-size') + " " + 
				$(element).css('font-family');
			//console.log(bannerContext.font);
			fontHeight = bannerContext.measureText('M').width;
			return $(element).css('display') !== 'none';
		}
		
		// Create banners
		banners.forEach(function(banner) {
			var c = banner.content;
			bannerContext.fillStyle = "white";
			bannerContext.fillRect(0, 0, bannerWidth, bannerHeight);
			bannerContext.fillStyle = "black";
			var y = bannerBorderWidth;
			
			// Draw title
			setFont(canvas.h2);
			bannerContext.fillText(c.title, bannerBorderWidth, y += fontHeight);
			y += parseInt($(canvas.h2).css('margin-bottom'));
			
			// Draw thumbnail
			var thumbnail = c.thumbnail || (c.images && c.images.length !== 0 ? c.images[0] : null);
			var bannerRight = bannerWidth - 2 * bannerBorderWidth;
			if (banner.thumbnail)
			{
				var h = Math.floor(bannerHeight - 2 * bannerBorderWidth);
				var w = Math.floor(banner.thumbnail.width * h / banner.thumbnail.height);
				bannerContext.drawImage(banner.thumbnail, bannerRight -= w, bannerBorderWidth, w, h);
				bannerRight -= 8;
			}
			
			// Draw brief
			if (c.brief && setFont(canvas.p))
				bannerContext.drawText(c.brief, bannerBorderWidth, y += fontHeight, bannerRight);
			
			// Draw border
			bannerContext.beginPath();
			bannerContext.lineWidth = "6";
			bannerContext.strokeStyle = "darkGray";
			bannerContext.rect(0, 0, bannerWidth, bannerHeight); 
			bannerContext.stroke();
			bannerContext.beginPath();
			bannerContext.lineWidth = "1";
			bannerContext.strokeStyle = "black";
			bannerContext.rect(0, 0, bannerWidth, bannerHeight); 
			bannerContext.stroke();
			
			//download("canvas.png", bannerCanvas.toDataURL());
			banner.texture = LoadTextureFromCanvas(gl, bannerCanvas);
		});
		
		this.invalidate();
	};

	var invalidating = false;
	var invalidate = this.invalidate = function() {
		if (gl === null || banners.length === 0)
			return;
		if (!invalidating)
		{
			invalidating = true;
			t = performance.now();
			window.requestAnimFrame(render);
		}
	};
	
	function Animation()
	{
		this.startTime = null;
		this.update = function(banners, t) {};
	}
	var animations = [];
	function animate(animation)
	{
		animations.push(animation);
		invalidate();
	}
	
	function IntroAnimation(delay, duration)
	{
		banners.forEach(function(banner) {
			banner.visible = false;
			banner.alpha = 0.0;
		});
		
		Animation.call(this);
		this.update = function(banners, t) {
			if (t < delay)
				return true;
			var f = (t - delay) / duration;
			
			for (var i = 0; i < banners.length; ++i)
			{
				banners[i].visible = f > i;
				banners[i].z = Math.sin(Math.clamp(f - i, 0, Math.PI));
			}
			
			return f <= banners.length - 1 || f - (banners.length - 1) < Math.PI;
		};
	}
	function RearrangeAnimation(rearrangeInfo, duration)
	{
		for (var i = 0; i < banners.length; ++i)
			banners[i].visible = rearrangeInfo[i].visible;
		
		Animation.call(this);
		this.update = function(banners, t) {
			/*var f = t / duration;
			
			for (var i = 0; i < banners.length; ++i)
			{
				if (rearrangeInfo[i].visible && banners[i].alpha < 1.0)
					banners[i].alpha *= f;
				else if (!rearrangeInfo[i].visible && banners[i].alpha > 0.0)
					banners[i].alpha *= 1 - f;
			}
			
			if (f <= 1)
				return true;
			else
			{
				for (var i = 0; i < banners.length; ++i)
					banners[i].visible = rearrangeInfo[i].visible;
				return false;
			}*/
			return false;
		};
	}
	
	// Create intro animation
	animate(new IntroAnimation(
		100, // Delay [ms]
		200 // Duration per banner [ms] (controls animation speed)
	));

	function render()
	{
		if (gl === null || banners.length === 0)
		{
			invalidating = false;
			return;
		}
		
		// Update dt and t
		var tn = performance.now();
		dt = tn - t;
		t = tn;
		
		var animating = false;
		if (animations.length !== 0)
		{
			// Initialize banner--z
			banners.forEach(function(banner) {
				banner.z = 0.0;
			});
			
			// Animate banners
			for (var a = 0; a < animations.length;)
			{
				var animation = animations[a];
				if (!animation.update(banners, t - (animation.startTime ? animation.startTime : animation.startTime = t)))
					animations.splice(a, 1);
				else
					++a;
			}
		}
		// Validate animated-z and animate banner-alpha based banner-visible
		banners.forEach(function(banner) {
			banner.alpha = Math.clamp(banner.alpha + (banner.visible ? dt : -dt) / 1000, 0, 1);
			animating |= (banner.visible === true && banner.alpha !== 1.0) || (banner.visible === false && banner.alpha !== 0.0);
			banner.z = Math.clamp(banner.z, 0, 1);
		});
		animating |= animations.length !== 0;
		//console.log(banners[0].alpha);
		
		// >>> Render WebGL canvas
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		var mattrans = mat4.create();
		banners.forEach(function(banner) {
			if (banner.alpha <= 0.0) return;
			var x = canvasBorderWidth, y = canvasBorderWidth + banner.pos * (bannerHeight + bannerDistance);
			
			mat4.identity(mattrans);
			mat4.scale(mattrans, mattrans, [1, -1, 1]);
			mat4.translate(mattrans, mattrans, [-1, -1, 0]);
			mat4.translate(mattrans, mattrans, [2 * x / gl.width, 2 * y / gl.height, banner.z]);
			mat4.scale(mattrans, mattrans, [2 * bannerWidth / gl.width, 2 * bannerHeight / gl.height, 1]);
			
			meshQuad.bind(sdrImage, banner.texture);
			sdrImage.matWorldViewProj(mattrans);
			sdrImage.alpha(banner.alpha);
			meshQuad.draw();
		});
		
		meshQuad.bind(sdrShadow);
		banners.forEach(function(banner) {
			if (banner.alpha <= 0.0) return;
			var x = canvasBorderWidth, y = canvasBorderWidth + banner.pos * (bannerHeight + bannerDistance);
			
			mat4.identity(mattrans);
			mat4.scale(mattrans, mattrans, [1, -1, 1]);
			mat4.translate(mattrans, mattrans, [-1, -1, 0]);
			mat4.translate(mattrans, mattrans, [2 * x / gl.width, 2 * y / gl.height, banner.z]);
			mat4.scale(mattrans, mattrans, [2 * bannerWidth / gl.width, 2 * bannerHeight / gl.height, 1]);
			
			sdrShadow.matWorldViewProj(mattrans);
			sdrShadow.alpha(banner.alpha);
			meshQuad.draw();
		});
		
		if (animating)
			window.requestAnimFrame(render);
		else
			invalidating = false;
	}

	CanvasRenderingContext2D.prototype.drawText = function(text, x, y, maxWidth) {
		var words = text.split(' ');
		var line = '';
		var lineHeight = this.measureText('M').width;

		for(var n = 0; n < words.length; n++)
		{
			var testLine = line + words[n] + ' ';
			var metrics = this.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0)
			{
				this.fillText(line, x, y);
				line = words[n] + ' ';
				y += lineHeight;
			}
			else
				line = testLine;
		}
		this.fillText(line, x, y);
	};

	canvas.onmousedown = function(event) {
		if (gl === null || banners.length === 0)
			return;
		
		// Compute mousepos in canvas space -> p
		var canvasBounds = canvas.getBoundingClientRect();
		var p = [event.clientX - canvasBounds.left, event.clientY - canvasBounds.top];
		
		if (p[0] >= canvasBorderWidth && p[0] < canvasBorderWidth + bannerWidth)
			for (var i = 0; i < banners.length; ++i)
				if (banners[i].alpha > 0.0 &&
					p[1] >= canvasBorderWidth + banners[i].pos * (bannerHeight + bannerDistance) &&
					p[1] < canvasBorderWidth + banners[i].pos * (bannerHeight + bannerDistance) + bannerHeight)
				{
					window.location.href = "./index.html?view=" + makeId(banners[i].content.title);
					break;
				}
	};

	this.selectLanguages = function(languages) {
		var rearrangeInfo = new Array(banners.length);
		for (var i = 0; i < banners.length; ++i)
		{
			rearrangeInfo[i] = {
				visible: banners[i].content.languages.every(l => languages.indexOf(l) !== -1),
				pos: i
			};
		}
		
		animations = animations.filter(animation => !RearrangeAnimation.prototype.isPrototypeOf(animation)); // Remove pending rearrange animations
		animate(new RearrangeAnimation(rearrangeInfo, 1000));
	};
}

GLBanners.create = function(content, contentType) {
	// Create WebGL canvas
	var canvas = document.createElement("canvas"); 
	canvas.style.width = "100%";
	canvas.style.display = "block";
	
	// Create WebGL context
	gl = canvas.getContext("webgl");
	return gl ? new GLBanners(canvas, gl, content, contentType) : null;
};