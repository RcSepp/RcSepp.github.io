## About the need for good colormaps
Floating point images are images with one- or more floating point encoded values per pixel. They are used in many scientific areas. ColorMoves handles the most common case where each pixel contains exactly one value. A standard practise of visualizing such images is by applying a nonlinear transfomation from the floating point value of a pixel to a color in RGB space. This transformation is called 'colormap'.

An example for a simple colormap is a linear **grayscale**. This colormap can be easily computed and is often used as a first visualization draft, but it limits the value range of the visualization to 256 shades of gray. The spectrum of colors that can be distinguished by human perception is even far less than 256.

We can widen the perceivable spectrum by utilizing all three channels of the RGB spectrum. The famously infamous **rainbow** colormap linearly traverses the space of hues to maximize the amount of distinguishable colors (the resolution) of the colormap. Like the grayscale colormap, the rainbow colormap can be used as a baseline that allows the scientist a first visual glimps at the image with plenty of resolution to make first judgements about data range and distribution. Unfortunately it has become common to use the rainbow colormap for more than just first drafts. Several studies have shown that rainbow colormaps aren't suited for paper-ready visualizatons, because (1) they contain nonlinear color transitions, (2) they ignore semantic meanings of colors and (3) they are uncomfortable to look at. Nonlinear color transitions make the viewer see iso-line-like patterns, because the RGB colorspace is perceived nonlinearly by humans. Semantic information of color is the meaning we associated with certain colors based on experience, like warm- vs. cold colors. The uncomfortableness of colormapped images may seem less important at first glance, but it does play a very important role when presenting visualizations to the general public. Also, some domain scientists study hundreds of visualizations each day, which raises the need for 'ergonomic' visualizations.

Established colormaps represent a tradeoff between the uniformity of the grayscale colormap and the high resolution of the rainbow colormap. **Divergent** colormaps like Ken Moorland's Cool/Warm colormap should be the preferred choice for simple visualizations.

Often information hides in the fine details of floating point image. Such details can't be visualized with any of the above mentioned colormaps. This lead to the development of **nested colormaps**. Nested colormaps consist of a low saturated outer colormap, that shows the entire data range and a higher saturated inner (nested) colormap, that shows an area of interest with high resolution. The effect of a nested colormap is like the effect of a magnifying glass held over the most important range of values.

Recent papers about colormapping have extended the idea of nested colormaps, showing ideal results with combinations of multiple nested colormaps tailored to each individual visualization.

Creating a professional linear or divergent colormap with a perceptually linear progression of colors from scratch is difficult and should be done by expert color artists. However, combining such professional colorscales into individual colormaps is rather simple. All a scientist needs to create colormaps in this way is the right tool: **ColorMoves**

## What is ColorMoves
ColorMoves is a tool for tailoring custom colormaps by combining professional colorscales using an interactive user interface.

The ColorMoves user interface consists of three regions:
* The image viewer renders the current colormap in realtime to a floating point image.
* The Histogram shows a distribution of values with the colors of the current colormap.
* The color picker is a palette of colorscales, that can be dragged into the histogram.

To utilize multiple color scales in a colormap, the colormap can be divided with pins. The I-shaped pin splits the colormap, while the U-shaped pin overlays a nested colormap. All pins can be dragged within the colormap. Our user studies have shown that scientists find the moving of pins to be an increadible tool for visualizing data, which is why we decided to name our tool ColorMoves.

## How it works

```javascript
function F32toI24(floats, bounds)
{
	var bytes = new Uint8Array(4 * floats.length);
	var i = 0, voffset = -bounds[0], vscale = 0xFFFFFE / (bounds[1] - bounds[0]);
	floats.forEach(function(value) {
		value += voffset;
		value *= vscale;
		value = Math.floor(value);
		value = Math.max(0, value);
		value = Math.min(0xFFFFFE, value);
		++value;
		bytes[i + 0] = (value >> 16) & 0xFF;
		bytes[i + 1] = (value >> 8) & 0xFF;
		bytes[i + 2] = (value >> 0) & 0xFF;
		bytes[i + 3] = 255;
		i += 4;
	});
	return bytes;
}
```