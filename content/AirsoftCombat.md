## Motivation
After programming a first person shooter with the [3D GameStudio engine](http://www.conitec.net/english/gstudio/index.php), I wanted to try creating a whole game from scratch. AirsoftCombat is a DirectX 9.0c based game where players shoot their enemies with airsoft guns.

## Components
Everything in this game is self-made, except sounds (downloaded free content), textures (downloaded free content) and weapon models (made by Markus Steinb&ouml;ck).

___

* Player and level models ... Modeled using CAD software
* Audio ... Gunshot sounds recorded from my own airsoft guns
* Shadows ... Based on the Direct3D sample code for stencil shadows
* HDR effects ... Based on the Direct3D sample code for HDR lighting (I extended the technique, by adding an 'afterimage' effect)
* Static lighting ... Precomputed lightmaps, rendered in my own radiosity renderer.
* Animations ... Hardcoded in painful detail work (I whish I had motion capture equipment ;) )
* Animated HUD ... Made in Microsoft Paint (yes, [Microsoft Paint](https://en.wikipedia.org/wiki/Microsoft_Paint))
* Physics ... I implemented ellipsoid-triangle intersections between player and level and ellipsoid-ellipsoid intersections between players. The used acceleration structure is a kd-tree

## Lessons learned
Besides being my first large C++ project, I learned some valuable lessons from this project.
Most notably:
1. For future projects I decided to separate game and engine. This decission has led to the [IronSightEngine](https://rcsepp.github.io/content.html?view=IronSightEngine)
2. For future projects I decided to outsource some of the algorithmic heavy lifting, by using a commercial physics engine. One of the modules of the IronSightEngine interfaces the Havok physics engine.