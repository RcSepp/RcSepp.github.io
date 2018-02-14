## Motivation
By the end of my highschool I had written multiple 3D rendering codes that all replicated a lot of code, e.g. Direct3D initialization code. I unified these codes in a Direct3D DLL (dynamic link library). Later, I added more modules like a DirectInput module and combined the modules into a unified framework.

Since I have always liked first-person-shooter video games, I named this framework IronSightEngine. An iron sight is the mechanical part on a gun used for aiming. It is one of the most important parts of the gun and it's source of accuracy. In a way, a game engine is to a game, what an iron sight is to a gun. Hence the name, IronSightEngine.

## IronSightEngine modules
The IronSightEngine consists of 24 separate modules. After a module is loaded, it is accessed via an extern pointer variable. The pointers for individual modules are three-letter acronyms (ISEngine: eng, ISDirect3D: d3d, ISWinSock: wsk, ...).

Modules marked with an asterisk (*) have wrappers for Python code.

___

#### Static libraries
* ISEngine* ... Code for initialization and loading other modules
* ISMath* ... Classes and algorithms for 2D-. 3D- and 4D vectors, planes, 4x4 matrices and quaternions
#### Graphics and GUI libraries
* ISDirect3D* ... Routines for content rendering with Direct3D 11
* ISOpenGL ... A subset of the routines of ISDirect3D, implemented with OpenGL (for cross-platform compatibility)
* ISGuiFactory ... Routines for creating user interfaces with Direct2D
* ISForms* ... Routines for creating user interfaces using the [Windows control library](https://msdn.microsoft.com/en-us/library/windows/desktop/bb773169(v=vs.85).aspx)
* ISImage ... Routines image file IO using the [FreeImage library](http://freeimage.sourceforge.net/)
#### Physics libraries
* ISHavok* ... Routines for adding physics to shapes created with ISDirect3D or ISOpenGL using the [Havok physics engine](https://www.havok.com/physics/)
#### Peripheral libraries
* ISDirectInput* ... Real time mouse and keyboard access through DirectInput
* ISWinInput ... Event based mouse and keyboard access using a WndProc callback
* ISWinMIDI ... Routines for IO to/from MIDI capable devices (keyboards, e-drum kits, etc.)
#### Audio libraries
* ISWinAudio* ... Routines for audio IO using [Windows Waveform Audio](https://msdn.microsoft.com/en-us/library/windows/desktop/dd757715(v=vs.85).aspx)
* ISXAudio2* ... Routines for audio output using [XAudio2](https://msdn.microsoft.com/en-us/library/windows/desktop/ee415813(v=vs.85).aspx)
#### Network libraries
* ISWinSock ... Routines for communication between applications via TCP or UDP
#### Algorithmic libraries
* ISRayTracer ... My own ray tracing library
* ISGameAI ... Path finding algorithms
#### Misc. wrappers for other libraies
* ISPbrt ... Wrapper library to the [Physically Based Rendering Toolkit](http://www.pbrt.org/) (a ray tracing library)
* ISFFmpeg ... Wrapper library for [FFmpeg](https://www.ffmpeg.org/) (a library for encoding and decoding of audio and video content)
* ISSQLite ... Wrapper library for [SQLite](https://www.sqlite.org/) (an SQL database engine)
* ISCryptoPP ... Wrapper library for [Crypto++](https://www.cryptopp.com/) (an encryption library)
* ISHaruPdf ... Wrapper library for the [Haru PDF library](http://libharu.org/)
* ISID3Lib ... Wrapper library for [id3lib](http://id3lib.sourceforge.net/) (a library for reading, writing, and manipulating ID3 tags)
#### Helper Libraries
* ISAsyncWorkers ... Routines for concurrent programming
* ISPythonScriptEngine ... Routines for enabling the Python wrappers of IronSightEngine modules