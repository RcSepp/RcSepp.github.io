## Motivation
I programmed DrumTrainer, because I wanted to play may favorite game at the time, [Rock Band](https://en.wikipedia.org/wiki/Rock_Band), using my Roland TD-9 e-drum kit.
(This was before the capability to use e-drums via MIDI connector was introduced with Rock Band 3 in 2010.)

## Time Line
I made 4 versions of DrumTrainer over the years. RBC is the initial prototype. DrumTrainer is the main program. DrumTrainer2 and DrumTrainer3 are adaptions of the DrumTrainer code base to the [IronSightEngine](https://rcsepp.github.io/content.html?view=IronSightEngine) and to C# respectively.

#### RBC (Rock Band Clone) (2008)
I started this project in 2008. Since it was planned as a remake of the game Rock Band with e-drum support, I shamelessly called it RBC (Rock Band Clone).

This version is programmed in C++, using DirectX 9 for graphics and Direct Sound for audio. It plays a music track in the background while showing a drum tab in a similar way as classic rhythm games, like Guitar Hero or Rock Band.
Graphically, RBC supports high dynamic range (HDR) rendering, which was later disabled, because it negatively affects gameplay when many consecutive notes appear on screen.
RBC's trigger bar (at the bottom of the screen) resembles a guitar pickup, because I planned to later also support guitar input. However, it was later replaced with a more neutral trigger bar.


#### DrumTrainer (2009)
In 2009, I removed the background music for two reasons:
1. Any song performed by human musicians contains imperfections in timing. Keeping the song in sync with the displayed drum tap is a hard problem that requires manually annotating songs with timing information and gradually speeding up or slowing down either the song or tap.
2. Games like Rock Band use songs with separate recordings of each instrument, so that single instruments can be muted and played by the user. I couldn't find any freely available sources for such instrument-by-instrument recordings of popular songs.

I added the following features on top of RBC:
* MIDI support: RBC did not have the crucial ability to accept input from the drum kit. DrumTrainer does detect drum kit input and give feedback about which notes have been hit and how accurately they have been hit. Optionally, individual drums can be played by the program to reduce the difficulty when learning new songs. For example, I like learning a new song with the kick drum (horizontal line in DrumTrainer) set to automatic, so I can fully concentrate on my hand motions. The video on this page was recorded with all drums set to automatic, for the purpose of demonstration.
* Since DrumTrainer doesn't support background music, I've added the capability to play background tracks (i.e. guitar tracks) from MIDI files.
* Direct Sound was replaced by the successor: XAudio
* Additionally ASIO support was added to reduce audio latency
* DrumTrainer implements a VST host, so it can use the wide selection of available VST plugins for both MIDI background tracks and to play drum sounds from the drum kit.
* A main menu was added using the Windows Controls library.
* Audible metronome ticks were added to guide the user when no background tracks are played.


#### DrumTrainer2 (2012)
This version uses the [IronSightEngine](https://rcsepp.github.io/content.html?view=IronSightEngine).


#### DrumTrainer3 (2015)
This version is implemented in C#, using C# bindings for the [IronSightEngine](https://rcsepp.github.io/content.html?view=IronSightEngine).