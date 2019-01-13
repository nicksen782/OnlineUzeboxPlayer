Flight of a Dragon, an intense runner - platformer where you, playing a land dragon, have to escape from your captors who wanted to break you in, to be used as a war machine.

As such, unlike the usual platformers, the dragon is quite sturdy, can withstand lots of abuse, you will often storm through opposition without caring for their vain attempts to hurt you, but to survive, you still have to manage your health wisely. Also since you want to flee, and at that, from being used for bloodshed, you don't want to kill, you don't want people to think about you or your race as monsters to be eradicated. Your score is reduced for kills. You might also free prisoners if you find such.

What is in the demo:

Almost the complete game mechanics can be tried out on a single level (the first level of the full game if that once gets released) with a limited set of enemies and items. There are many things missing however, notably lots of possibilities in creative level design to complicate further stages. The dragon may also develop his capabilities later (this actually works, but the first level doesn't contain related items).

Scores are saved, but their calculation might still need some balancing, and it will only become truly effective once more levels are added (currently the most critical is whether the level could be completed or not).

Usage notes:

Controls should be fairly user-friendly. The title slowly cycles through some screens including the high scores (so wait a bit to see them after starting). You may start the game with any button, then it will describe the controls. When achieving a high score, it does not display such help, there the score can be edited using the D-Pad, shift may be toggled with either fire or shift button, and saved with Start or Select.

Compiling:

The binaries are included (hex and uze), otherwise the package should compile okay by a "make". The path to Packrom may be set up in the Makefile.

Contents of the source:

This package only contains the compilable game source without the sources of the assets (sprites, map elements and such). Those are fairly large, mostly Gimp images. Upon request or after the UCC I will set up a GitHub repo with those included as well.

Hardware requirements:

Only the most minimal Uzebox configuration is required, the game doesn't access the SD card.

Tests:

The game should work properly on the real hardware, Uzem 1.4, and the latest CUzeBox (I tested on these).

Technology notes:

The game uses a heavily customized kernel, with Mode 74 (this is unchanged compared to the version on GitHub). The most notable feature of this customized kernel is a radically altered sound & music engine, the latter using a custom format for saving ROM space. Otherwise the kernel is heavily trimmed down to reduce size both in ROM and RAM, and has an alternate video sync generator ("kernel boost hack") to milk some more useful CPU cycles out of the machine.

The construction relies on fixed memory allocation both in ROM and RAM to utilize space efficiently. In RAM currently there are only 2 bytes free (but since the complete game logic is implemented, this isn't a bottleneck for further development). Despite that the game might look like filling in the entire ROM (below the bootloader), there are lots of space within currently left unused (appearing as holes due to the fixed allocation) reserved for various purposes. It should be possible to have a complete game with about a quarter hour of material for someone doing a speed run through it. (In the complete game the Uzebox logo will also be removed as it takes up so much space that could hold two levels of similar size like the demo level)

Arcade usage:

I intentionally tried to design so the game might be ported for arcade use, although I am not exactly sure what would be the precise requirements. Anyway, this is something for later.

At last, I hope it will be enjoyable!