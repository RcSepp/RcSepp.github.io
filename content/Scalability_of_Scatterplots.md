### Abstract
In this thesis we discuss the representation of large high dimensional image databases with modern scatterplot-based visualization techniques.

We investigate scatterplot scalability both in terms of what is feasible (performance scalability) and what is reasonable (information scalability).

We create two interactive scatterplot-based visualizations for large-scale image datasets, the Global View and the Interactive Cell Plot.

The [Global View](content.html?view=GlobalView) is a desktop application for visualizing peta-scale simulations using in-situ generated image databases, developed in collaboration with the Los Alamos National Laboratory. Global View reads image databases in the Cinema database format. The loaded images are visualized by applying scripted visual mappings using our novel visual mapping scripting language. Using Global View, we compare different visual mappings for the MPAS Ocean dataset and conclude that the different mappings represent a trade-off between an intuitive viewing experience and showing multiple images simultaneously. Once a visual mapping is defined, the image database can be explored by traversing a three dimensional virtual environment of images. Our texture streaming algorithm dynamically loads and unloads images while the image database is explored, by monitoring the amount of allocated video memory.

The [Interactive Cell Plot](content.html?view=ExaPlot) is a JavaScript library for rendering large scatterplots with WebGL, developed in collaboration with the Allen Institute for Cell Science. Our efficient rendering technique enables us to render one million two dimensional data points at 60 frames per second and five million points at 25 frames per second.
We evaluate visualization parameters of the Interactive Cell Plot and five different thumbnail placement strategies in a qualitative user study. Our novel algorithms for boundary- and density-based labeling minimize occlusions of data points while also minimizing the distance between label and site.

We introduce density maps as an intermediate data structure for fast clustering, labeling, characteristic point detection and sample generation. By estimating density map generation runtime, our algorithm allows the user to directly control the performance-accuracy-trade-off of the density map creation algorithm.