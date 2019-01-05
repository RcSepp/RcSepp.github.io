function GLBanners(canvas, gl, content, contentType, skipIntroAnimation)
{
	var glBanners = this;
	var t, sdrImage, sdrShadow, meshQuad, bannerWidth, bannerHeight;

	const canvasBorderWidth = 8;
	const bannerBorderWidth = 11;
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
		gl_Position.z = clamp(gl_Position.z, 0.00001, 1.0);
		gl_Position.xy += gl_Position.z * zScale;
		gl_Position.z = clamp(1.0 - gl_Position.z, 0.0, 0.9999);
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
		gl_Position.z = 1.0 - clamp(gl_Position.z, 0.00001, 1.0);
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
	
	var banners = [], bannerIndices = [], bannerVisibility = [];
	content.forEach(function(c) {
		if (c.type === contentType && c.title && c.title !== '')
		{
			var thumbnail = c.thumbnail;// || (c.images && c.images.length !== 0 ? c.images[0] : null);
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
				alpha: 1.0, // Opacity [0 ... 1]
				pos: banners.length, // Location inside canvas
				z: 0.0 // Vertical positon [0 ... 1]
			});
		}
	});
	//banners = banners.slice(0, 1); // Uncomment this to only show the first banner (for debugging)
	bannerIndices = Array.create(banners.length, i => i);
	bannerVisibility = Array.create(banners.length, true);
	
	// Create banner element templates, to extract CSS information
	var tempProjectBanner = document.createElement("div");
	tempProjectBanner.style.display = "none";
	tempProjectBanner.id = "projectBanner";
	tempProjectBanner.appendChild(canvas.h2 = document.createElement("h2")); canvas.h2.className = "bannerTitle";
	tempProjectBanner.appendChild(canvas.p = document.createElement("p"));
	tempProjectBanner.appendChild(canvas.leftTag = document.createElement("p")); canvas.leftTag.className = "leftTag";
	tempProjectBanner.appendChild(canvas.rightTag = document.createElement("p")); canvas.rightTag.className = "rightTag";
	document.getElementById('content').appendChild(tempProjectBanner);
	
	// Initialize timer
	t = performance.now();

	this.resize = function(width) {
		if (gl === null || banners.length === 0)
			return;
		if (isUndefined(width)) width = gl.width;
		
		canvas.width = gl.width = width;
		bannerWidth = width - 2 * canvasBorderWidth;
		bannerHeight = Math.floor(bannerWidth * 0.25);
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
			bannerContext.fillStyle = $(element).css('color');
			//console.log(bannerContext.font);
			fontHeight = bannerContext.measureText('M').width + 8;
			return $(element).css('display') !== 'none';
		}
		
		// Create banners
		banners.forEach(function(banner) {
			var c = banner.content;
			bannerContext.fillStyle = "white";
			bannerContext.fillRect(0, 0, bannerWidth, bannerHeight);
			//bannerContext.fillStyle = "black";
			var y = bannerBorderWidth, bannerRight = bannerWidth - bannerBorderWidth;
			
			// Draw left tag
			if (c.year)
			{
				setFont(canvas.leftTag);
				bannerContext.fillText("Year: " + c.year, bannerBorderWidth, bannerHeight - bannerBorderWidth);
			}
			
			// Draw thumbnail
			if (banner.thumbnail)
			{
				var h = Math.floor(bannerHeight - 2 * bannerBorderWidth);
				var w = Math.floor(banner.thumbnail.width * h / banner.thumbnail.height);
				bannerContext.drawImage(banner.thumbnail, bannerRight -= w, bannerBorderWidth, w, h);
				bannerRight -= 8;
			}
			
			// Draw right tag
			if (c.type == 'publication' || (c.languages && c.languages.length !== 0))
			{
				setFont(canvas.rightTag);
				var text;
				if (c.type === 'project')
					text = (c.languages.length === 1 ? "Language: " : "Languages: ") + c.languages.join(", ");
				else if (c.type === 'publication')
					text = isString(c.subtype) ? c.subtype : c.subtype.join(", ");
				bannerContext.fillText(
					text,
					bannerRight - bannerContext.measureText(text).width,
					bannerHeight - bannerBorderWidth
				);
			}
			
			// Draw title
			setFont(canvas.h2);
			y = bannerContext.drawText(c.title, bannerBorderWidth, y + fontHeight, bannerRight - 4);
			y += parseInt($(canvas.h2).css('margin-bottom'));
			
			// Draw brief
			if (c.brief && setFont(canvas.p))
				y = bannerContext.drawText(c.brief, bannerBorderWidth, y + fontHeight, bannerRight - 4);
			
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
		Animation.call(this);
		
		this.update = function(banners, t, dt) {
			if (t < delay)
			{
				banners.forEach(banner => banner.alpha = 0.0);
				return true;
			}
			var f = (t - delay) / duration;
			
			for (var i = 0; i < banners.length; ++i)
			{
				banners[i].alpha = Math.clamp((f - i) / 2, 0, 1);
				banners[i].z = Math.sin(Math.clamp(f - i, 0, Math.PI));
			}
			
			return banners[banners.length - 1].alpha !== 1 || banners[banners.length - 1].z !== Math.sin(Math.PI);
		};
	}
	function VisibilityAnimation(target, duration)
	{
		Animation.call(this);
		
		this.update = function(banners, t, dt) {
			dt /= duration;
			
			var done = true;
			for (var i = 0; i < banners.length; ++i)
				if (banners[i].alpha !== target[i])
				{
					banners[i].alpha += Math.min(dt, Math.abs(target[i] - banners[i].alpha)) * Math.sign(target[i] - banners[i].alpha);
					done = done && banners[i].alpha === target[i];
				}
			
			return !done;
		};
	}
	function RearrangeAnimation(target, duration)
	{
		Animation.call(this);
		
		this.update = function(banners, t, dt) {
			dt /= duration;
			
			var done = true;
			for (var i = 0; i < banners.length; ++i)
				if (banners[i].pos !== target[i])
				{
					banners[i].pos += Math.min(dt, Math.abs(target[i] - banners[i].pos)) * Math.sign(target[i] - banners[i].pos);
					done = done && banners[i].pos === target[i];
				}
			
			return !done;
		};
	}
	function RaisedRearrangeAnimation(target, duration)
	{
		const raiseDurationFactor = 4; // Banners are raised while travelling raiseDurationFactor^(-1) times the distance of one banner's height
		
		Animation.call(this);
		
		this.update = function(banners, t, dt) {
			dt /= duration;
			
			var done = true;
			for (var i = 0; i < banners.length; ++i)
			{
				if (banners[i].alpha === 0.0)
				{
					// Don't animate hidden banners
					banners[i].pos = target[i];
					banners[i].z = 0.0;
					continue;
				}
				
				if (banners[i].pos !== target[i])
				{
					if (banners[i].pos < target[i])
					{
						var target_z = target[i] - banners[i].pos < 1 / raiseDurationFactor ? 0 : 1;
						banners[i].z += Math.min(raiseDurationFactor * dt, Math.abs(target_z - banners[i].z)) * Math.sign(target_z - banners[i].z);
					}
					banners[i].pos += Math.min(dt, Math.abs(target[i] - banners[i].pos)) * Math.sign(target[i] - banners[i].pos);
					done = done && banners[i].pos === target[i] && banners[i].z === 0.0;
				}
				else if (banners[i].z !== 0.0)
				{
					banners[i].z += Math.min(raiseDurationFactor * dt, Math.abs(0.0 - banners[i].z)) * Math.sign(0.0 - banners[i].z);
					done = done && banners[i].pos === target[i] && banners[i].z === 0.0;
				}
			}
			
			return !done;
		};
		this.estimateDistance = function() {
			var dist = 0.0;
			for (var i = 0; i < banners.length; ++i)
			{
				if (banners[i].alpha === 0.0)
					continue;
				dist = Math.max(dist, target[i] - banners[i].pos, banners[i].pos - target[i]);
			}
			return dist;
		};
		this.setDuration = d => duration = d;
	}
	/*function RaiseAnimation(target, duration)
	{
		Animation.call(this);
		
		this.update = function(banners, t, dt) {
			dt /= duration;
			
			var done = true;
			for (var i = 0; i < banners.length; ++i)
				if (banners[i].z !== target[i])
				{
					banners[i].z += Math.min(dt, Math.abs(target[i] - banners[i].z)) * Math.sign(target[i] - banners[i].z);
					done = done && banners[i].z === target[i];
				}
			
			return !done;
		};
	}*/
	
	if (!skipIntroAnimation)
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
		
		if (animations.length !== 0)
		{
			// Animate banners
			if (!animations[0].update(banners, t - (animations[0].startTime ? animations[0].startTime : animations[0].startTime = t), dt))
				animations.shift();
			
			banners.forEach(function(banner) {
				banner.alpha = Math.clamp(banner.alpha, 0, 1);
				banner.z = Math.clamp(banner.z, 0, 0.99999);
			});
		}
		var animating = animations.length !== 0;
		
		// >>> Render WebGL canvas
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		var mattrans = mat4.create();
		banners.forEach(function(banner) {
			if (banner.alpha === 0.0) return;
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
			if (banner.alpha === 0.0) return;
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
		var lineHeight = this.measureText('M').width + 8;

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
		return y;
	};

	canvas.onclick = function(event) {
		if (gl === null || banners.length === 0)
			return;
		
		// Compute mousepos in canvas space -> p
		var canvasBounds = canvas.getBoundingClientRect();
		var p = [event.clientX - canvasBounds.left, event.clientY - canvasBounds.top];
		
		if (p[0] >= canvasBorderWidth && p[0] < canvasBorderWidth + bannerWidth)
			for (var i = 0; i < banners.length; ++i)
				if (banners[i].alpha !== 0.0 &&
					p[1] >= canvasBorderWidth + banners[i].pos * (bannerHeight + bannerDistance) &&
					p[1] < canvasBorderWidth + banners[i].pos * (bannerHeight + bannerDistance) + bannerHeight)
				{
					if (event.ctrlKey)
						window.open("./index.html?view=" + makeId(banners[i].content.title, banners[i].content.id),'_blank');
					else
						window.location.href = "./index.html?view=" + makeId(banners[i].content.title, banners[i].content.id);
					break;
				}
	};

	this.filter = function(cbk) {
		// Compute bannerVisibility
		bannerVisibility = banners.map(banner => cbk(banner.content));
		console.log(bannerIndices);
		console.log(bannerVisibility);
		
		var rearrangeInfo = new Array(banners.length);
		for (var i = 0, j = 0; i < bannerIndices.length; ++i)
		{
			var idx = bannerIndices[i];
			var visible = bannerVisibility[idx];
			rearrangeInfo[idx] = {
				alpha: visible ? 1 : 0,
				pos: visible ? j++ : banners[idx].pos
			};
		}
		
		// Cancel pending rearrange or visibility animations
		animations = animations.filter(animation => !VisibilityAnimation.prototype.isPrototypeOf(animation) && !RearrangeAnimation.prototype.isPrototypeOf(animation));
		
		animate(new VisibilityAnimation(rearrangeInfo.map((info, i) => info.alpha === 1 && banners[i].alpha === 0 ? 0 : info.alpha), 400));
		animate(new RearrangeAnimation(rearrangeInfo.map(info => info.pos), 100));
		animate(new VisibilityAnimation(rearrangeInfo.map(info => info.alpha), 250));
	};
	
	this.sort = function(cbk) {
		// Cancel pending rearrange animations
		animations = animations.filter(animation => !RearrangeAnimation.prototype.isPrototypeOf(animation) && !RaisedRearrangeAnimation.prototype.isPrototypeOf(animation));
		
		// Visually sort banners using bubble sort
		var totalDistance = 0.0;
		bubbleSort2(bannerIndices,
			(a, b) => cbk ? cbk(banners[a].content, banners[b].content) : a < b, // If no cbk is provided, sort according to banners (default order)
			function(indices) {
				var rearrangeInfo = new Array(indices.length);
				var dist = 0.0;
				for (var i = 0, j = 0; i < indices.length; ++i)
				{
					var idx = indices[i];
					var visible = bannerVisibility[idx];
					rearrangeInfo[idx] = visible ? j++ : j;
				}
				var ani;
				animate(ani = new RaisedRearrangeAnimation(rearrangeInfo, 50)); // 50 ... Duration; This will be overwritten below
				
				// Compute maximum distance travelled during this animation and add this value to totalDistance
				totalDistance += ani.estimateDistance();
			}
		)
		
		// Compute a resonable animation speed, based on the total distance travelled by banners
		var duration = Math.min(500, 8400 / totalDistance);
		animations.forEach(function(animation) { if (RaisedRearrangeAnimation.prototype.isPrototypeOf(animation)) animation.setDuration(duration); });
		
		// Make sure banner state is consistent. If this function is called twice, this line will cause instant sorting!
		var rearrangeInfo = new Array(bannerIndices.length);
		for (var i = 0, j = 0; i < bannerIndices.length; ++i)
		{
			var idx = bannerIndices[i];
			var visible = bannerVisibility[idx];
			rearrangeInfo[idx] = visible ? j++ : j;
		}
		animate(new RaisedRearrangeAnimation(rearrangeInfo, 0));
	};
	
	function inverseIndex(indices)
	{
		var reverseIndices = new Array(indices.length);
		indices.forEach((idx, i) => reverseIndices[idx] = i);
		return reverseIndices;
	}
	function bubbleSort(a, smaller, swp)
	{
		for (var i = 0, j; i + 1 < a.length; ++i)
		{
			if (smaller(a[i + 1], a[i]))
			{
				var e = a[i];
				a[i] = a[i + 1];
				for (j = i + 2; j < a.length && smaller(a[j], e); ++j)
					a[j - 1] = a[j];
				--j;
				a[j] = e;
				swp(a);
				i = -1;
			}
		}
	}
	function bubbleSort2(a, smaller, swp) // Like bubbleSort(), but moving multiple banners at a time. bubbleSort2 is faster than bubbleSort
	{
		do
		{
			var again = false;
			for (var i = 0, j; i + 1 < a.length; ++i)
			{
				if (smaller(a[i + 1], a[i]))
				{
					var e = a[i];
					a[i] = a[i + 1];
					for (j = i + 2; j < a.length && smaller(a[j], e); ++j)
						a[j - 1] = a[j];
					--j;
					a[j] = e;
					
					i = j;
					again = true;
				}
			}
			if (again)
				swp(a);
		}
		while (again);
	}
}

GLBanners.create = function(content, contentType, skipIntroAnimation) {
	// Create WebGL canvas
	var canvas = document.createElement("canvas"); 
	canvas.style.width = "100%";
	canvas.style.display = "block";
	
	// Create WebGL context
	gl = canvas.getContext("webgl");
	return gl ? new GLBanners(canvas, gl, content, contentType, skipIntroAnimation) : null;
};