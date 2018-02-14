### Credits
PoorTogether was developed by Johannes Preisinger ([LinkedIn](https://www.linkedin.com/in/johannes-preisinger-85a5a910a/)) and me. Most of the game was implemented by Johannes. I implemented physics, path finding and AI control.

### The Game
The protagonist (the green circle) finds himself alone and with no money in a foreign city surrounded by ongoing war. He doesn't speak the local language, but luckily he meets someone who happens to understand him (the red circle). The only chance of survival is to follow the stranger around the city.

The green circle learns to make money by begging on the busy streets so he can buy food at the store. As he spends more time with the red circle, he learns to speak the local language and integrate himself into society ...

### The AI System
PoorTogether is a 2D game that uses the Unity engine. At the time of development a severe bug in Unity made it impossible to use 2D path finding and 2D physics at the same time, because one operated on the x-y-plane, while the other one operated on the x-z-plane. Therefore we had to implement path finding ourself.

At daytime 500 AI-controlled citizens are roaming through the streets simultaneously to simulate a busy town. The main challenge of the AI system was was to move all these NPCs realistically through narrow streets while avoiding "traffic jams".

## How it works
Every NPC gets assigned a random target in the city. The fastest route to the target is computed using an A* search algorithm. Like a modern GPS system, the algorithm avoids congestion by (1) favoring wide streets and (2) trying to maintain an even distribution of citizens per street. When a path is found the citizen moves according to a combination of (1) the shortest path towards the next street and (2) a tendency towards the right side of the street (to minimize head-on collisions). When the target is reached, the NPC gets assigned another random target.

The red circle moves using the same path finding system, but with scripted targets.

## Results
We successfully simulated the experience of traveling through busy streets with minimum impact on CPU time (see video).
