## Motivation
Sinhala is a very beautiful language, spoken only in Sri Lanka. I especially like the intricate aesthetics of Sinhalese writing (Sinhala script).

#### Sinhala Hodi Potha
To learn this language, including its written form, I found [Sinhala Hodi Potha](https://play.google.com/store/apps/details?id=info.sayanthan.akshara&hl=en), a learning app for Sinhalese kids. The downside of this excellent app is that it always plays the sound of the spoken word at the same time as it displays the image. It's like hearing the answer while seeing the question.
To increase my learning efficiency, I extracted all the images and written phrases and created a flashcard app, written in C#. After I successfully used my flashcard program to learn all of the 156 words of the app, I browsed the internet for more Sinhala vocabulary in both written and spoken form. This isn't an easy task, considering that Sinhala is one of the least spoken languages on earth.

#### Lazy But Smart Sinhala
By far the best collection of learning materials online can be found on Dilshan's blog [Lazy But Smart Sinhala](http://www.lazybutsmartsinhala.com/) (LBSS). Dilshan translated countless words and phrases including high quality audio pronounciations. He presents these materials both on his blog and in downloadable premium material. I purchased [1500 LBSS Words & Phrases](http://www.lazybutsmartsinhala.com/1500-premium-edition/) and imported the material into my flashcard program.

#### Android App
I spent a lot of time learning all these new words whenever I had access to my laptop. In order to also learn words on-the-go, I also made a mobile version for my Android phone. The mobile version proofed to be even more fun and effective in learning Sinhala, so I planned to release it to the public. Flashcard based language learning apps are very common these days and I figured the most outstanding feature of my app is the fact that it teaches Sinhala. I shifted my focus from a general language-learning app to a purely Sinhala-learning app and removed all vocabulary from "Sinhala Hodi Potha", so it can be released as an addition to Dilshan's online learning materials.

## About the app
The app supports three game modes in increasing difficulty: **Listening**-, **reading**- and **writing** comprehension. In **listening mode**, a Sinhalese word or phrase is shown in writing and a spoken pronounciation is played. The user chooses between four possible translations in English. The reason why the written word is shown, is to prepare the user for reading mode. In **reading mode**, an English word or phrase is shown in writing. The user chooses between four possible written translations in Sinhala. By reading through each choice without the help of spoken pronounciations, the user is prepared for writing mode. In **writing mode**, an English word or phrase is again shown in writing, just like in 'reading' mode. However, this time no choices are presented to the user. The user types the translation into a textbox using a Sinhala keyboard. The Sinhala keyboard has to be installed beforehand. One possible app that supports a Sinhalese keyboard layout is [Gboard](https://play.google.com/store/apps/details?id=com.google.android.inputmethod.latin&hl=en).

The **prograss page** shows a pie chart of progress for listening-, reading- and writing modes, either for a single chapter or for all words. At the time of writing, the app contains 503 words and phrases.

The **chapters page** allows the user to select individual categories of vocabulary for training. Categories resemble chapters in the study book of [1500 LBSS Words & Phrases](http://www.lazybutsmartsinhala.com/1500-premium-edition/). The user can also choose to learn either just words, just phrases or both.

## Under the hood
The LBSS App is implemented in C# using the Xamarin.Android framework. This allowed me to copy large parts of my desktop program during the development of the mobile version.

Both desktop and mobile versions use a single SQLite database, containing written words and phrases in both English and Sinhala, spoken pronounciations and optionally pictures. The mobile app additionally uses a second SQLite database to store a user data (a history of correctly guessed words, as well as program options).

I imported written and spoken forms of the vocabulary from the pdf book and mp3 pronounciation guids of the [1500 LBSS Words & Phrases](http://www.lazybutsmartsinhala.com/1500-premium-edition/) study materials. To make this time consuming task as efficient as possible, I decided to go for a semi-automated approach. I wrote a C# program that automatically highlights continuous regions of audio from an mp3 file. I then select each of these regions and annotate them with written English and Sinhala by copying text from the pdf. When I'm done with a chapter, the program analyzes which of the sections resemble words and which resemble phrases and uploads everything into the SQLite database.

### Word selection
One of the most complex parts of the app is the randomized word selection. It is designed to optimize learning efficiency.

Without going into too much detail, let me describe the algorithm at a high level through the physical-flashcards metaphor:
Imagine having flashcards of all 1500 words and phrases stacked on a table. A typical learning strategy is to take a random selection of 10 cards into your hand and learning them one by one until you've guessed each of the 10 words or phrases correctly at least once. Then you would put back those 10 cards and pick up 10 different ones...
There are two potential areas of randomness in the described strategy: **(1)** How do you select which 10 cards to take into your hand and **(2)** how do you iterate through them? A third question arises from the fact that 'listening' and 'reading' strategies provided possible answer choices: **(3)** How do you select the wrong choices?
1. For the first question,cards are sorted by difficulty, based on a heuristic. The heuristic is a function of how many times each card has been guessed correctly in each of the three game modes and whether it resembles a word or phrase (phrases are considered more difficult than words). Cards are picked with a probability inversely proportional to their difficulty (easy words are more likely than hard ones). This way the first 10 words choosen are very simple words, that have been guessed correcty many times before, in order not to demotivate the user right from the start.
2. For the second question, the selection of 10 cards is initially in a uniformly random order. Whenever a word is guessed correctly, it is removed from the selection. If it is guessed wrong, then it is moved to the back of the selection with a probability proportional to how far back. Additionally, a counter keeps track how many rounds it takes the user to guess all 10 words correctly. Based on this counter, the probability function of the first question is altered for the next 10 cards. If the user guessed all cards correctly on the first try, then the next 10 cards will be more likely to be difficult.
3. For the third question, 100 cards are picked at random. The cards selected as wrong choices are the ones that are closest to the correct card (by measuring edit distance). This results in answer choices that are very similar, therefore increasing the difficulty. I implemented this measure to avoid situations where the correct choice stands out because all other choices are obviously wrong.


## Future work
The software is fully implemented and ready for release. I just need to import the remaining words and phrases from [1500 LBSS Words & Phrases](http://www.lazybutsmartsinhala.com/1500-premium-edition/).

I asked Dilshan if he would like to release this app as part of his premium learning materials on [lazybutsmartsinhala.com](http://www.lazybutsmartsinhala.com/), but haven't heared back from him.
Since he owns the rights to all of the vocabulary, the LBSS App will not be released until he accepts my offer.