![](https://img.shields.io/badge/developing-spare%20time-yellow)
![](https://img.shields.io/badge/version-0.9.0-success)

# MineSweeper aka "Campo Minato" in italian

It's been a lot now that I have been working on this game, i took it as a personal challenge, and usually I do accomplish what i want to do, even if it take a few sleepless nights and some strong headhaches.

## Why?

As you already know, this isn't the first nor the last minesweeper game, so "why?", well, as 99% of minesweeper out there, also this has been developed for practice purposes, since is developing is kind of challenging for new developers, but not too much, it really depends on which features you'd like to implement, and how.

## The Stack

"stack", LOL.

It's just plain JS and some SCSS for the styling, why haven't I used some fancy framework like react, vue or svelte? well, I've could, and probably I'll do some other games with them too, but for this i really wanted to break my head against the wall with some pure vanilla JS.

## Features
- [x] if you hit a bomb, is game over (imagine if this was missing lol);
- [x] right-click will flag/unflag the cell
- [x] clicking on a cell with zero bombs around her, will "open" all the surrounding cells, in a recursive way.
- [x] it has a fancy timer (no it's just a regular one)
- [x] I think the graphic it's kinda cool (exception made for the modal, I don't like it but i wouldn't know how doing it better)
- [x] it has a localStorage based "match history", every game is automatically saved and printed when lost/won
- [x] 5 diffent levels of difficulty, from "beginner" to "crazy"
- [x] the first click is always safe
- [x] just next to the mineSweeper header, it has a help button, which will flag a random bomb (not always helpfull)
  - the help cannot be asked if you havent clicked a cell yet
  - the help cannot be asked if you only have one bomb left (but you can always unflag some cells, assk help, and flag them back ;) )
- [x] has some displays swhowing some info about the game, like
  - number of flagged cells
  - number of "opened" cells
  - how many bombs you need to find to win the game (it's calculated based on the cells you flagged, not the real bombs, of ccourse, that would be too easy!)
  
  ## Next Features
  
  Since my vacations are gone, probably it will pass a lot of time before these are gonna implemented, but still
  - [ ] a settings panel, with things like (but not limited to)
    - changing the number of helps you can ask during a game
    - tweaking/turning off the match history
  - when clicking on an open cell, the surrounding cells will be "highlighted"
  - [x] when clicking on an open cell that has, in it's surrounding cells, a number of flagged cells equal to the number of bombs it has, the surrounding cells are gonna be opened, hoping you flagged them right, or, you know it.
  - [ ] I'm wondering in adding some translations, but actually in vanilla JS it's gonna be too much of "innerText" work, probably won't do this
  - [x] Adding light/dark themes, I never did this feature in any of my projects but I always wanted to, probably this is gonna be my first
  - [x] some SFX when clicking/losing/winning the game, with, of course, the chance of muting them.
  
  
  ### Probably no one is gonna see this repository/reading this, but if someone will, and has some advices or he'd like to share some knowledge to make this better (I know there's a lot that can be done here to make it better designed, faster and so much on) he's welcome!
