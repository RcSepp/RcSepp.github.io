## Gameplay
Two players, one of them controlled by the computer, try to eliminate each other by throwing grenades.

## The game board
The game board consists of hexagonal tiles, created from a heightmap. Tiles steeper than a fixed threshold (red tiles) cannot be traversed. The landscape gets flattened by grenade blasts.

## Interaction
The player is moved by clicking with the left mouse button and grenades are fired with the right mouse button. The player uses an A* search algorithm to find the shortest path to the point that the user clicked at. Grenades always explode after a fixed time. The height of the throw is automatically calculated so that the grenade explodes at the point the user clicked at (not before or after).

## AI
The opponent is controlled by the computer. It shoots at and walks towards the player, while avoiding to run into grenades.