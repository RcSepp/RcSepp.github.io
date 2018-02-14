## Motivation
This project arose from an argument, that one could vastly improve the performance of the game [Minecraft](https://minecraft.net/) by rendering boxes with a geometry shader.

### Modeling
The player model was designed and animated by myself.
Box textures are from the official [Minecraft](https://minecraft.net/) game.
The level is generated from a heightmap.
The skybox was rendered using [Terragen](http://planetside.co.uk/).

### Rendering
The game is rendered using Direct3D 11. Boxes are stored as a 3D matrix of 16 bit values. Each value stores the box type (8-bit) and the box rotation (8-bit). The box matrix is passed to the geometry shader as a constant buffer to render boxes. Whenever the level is altered, a subsection of the box matrix is updated.

### Physics
Collision detection is handled by Havok physics. Boxes can't be implemented as separate colliders, because Havok has a limit on the number of live colliders. One could bake a static model from all boxes, but then the full level collider would have to be updated everytime a box is added or removed.
Instead, I implemented a custom "box-level" collider in Havok. To minimize the memory footprint, the box-level collider uses the same box matrix as input as the geometry shader. It uses a ray casting algorithm commonly used in volume rendering of 3D Cartesian lattices to implement collision detection.

### Interaction
The player can be moved either with classic first-person controls, or from a third person view, by clicking where the player should walk to. This is implemented using A* path finding (similar to the algorithm implemented in the project HotPotato).

### Usage of the IronSightEngine
TinyMiner uses the modules ISEngine, ISMath, ISDirect3D, ISDirctInput, ISXAudio2 and ISHavok.