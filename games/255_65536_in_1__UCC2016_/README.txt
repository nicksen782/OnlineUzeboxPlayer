65536 in 1

I'm happy to finally release this, as I started it back in 2012 with
rough versions of the games. It was in a drawer for 4 years until I finally
polished everything and added the missing games. The result is a consistent
experience comparable to those chinese cartridges we used to buy
in the 90s and early 00s with a ludicrous amount of games, some good, some bad.

65536 glorious games packed into less than 60kB.
Figuring out the games is supposed to be part of the fun,
like it was back in the day when you didn't have the manual.
Anyway, I'm leaving instructions for the judges to make their job
easier (only for the harder ones).

Greed: Nim
Slide: Marumbi at the bottom
Trollen: Wappo variation, green and orange are _not_ the same
Monster: Wumpus
Rich: Deal or no deal
The other 65531 should be easy to figure out.

No need for the SD card as most of the tiles and effects are generated
on the fly. I found the perfect ram/flash balance and I was able to get
away with a tiny tileset to fit everything in 60k and just enough
ram to implement a decent level generator for Monster without having
to sacrifice the important elements in other games (specially Trollen).

I compiled and tested it with gcc 6.2, I'm providing both source, hex and
uze. I will push my local repository to github once the results are out.
