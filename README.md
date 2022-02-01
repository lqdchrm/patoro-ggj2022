# One Step Ahead

A game about battling with robots. Push the buttons to add moves to your moves list or use the keyboard. All players will move at the same time. Try not to fall into holes.

A game by PaToRo done at the Global Game Jam Trier 2022.

Have fun 💕

## Game Rules

This game is played in Turns, every Player resolves its Turn the same time. In each Turn you have one Action. Possible Actions are:
- *Move left*  
  Moves your Character left
- *Move Right*  
  Moves your Character right
- *Move Up*  
  Moves your Character up
- *Move Down*  
  Moves your Character down
- *Turn Left*  
  Turns your Character Left
- *Turn Right*  
  Turns your Character Right
- *Fire*  
  Fires a Fire ball in your looking direction. It will move one space per
  round. When you fired you can fire again after using 3 times the reload
  command.
- *Reload*    
  Reloads your fireball
- *Hole*  
  Creates a hole in 3x2 in front of you.
- *Fill*  
  Fills a at least the hole in front of you. Depending on the surrounding
  tiles it can fill up to 3x2 in front of you.
- *Skip*  
  You will do nothing this round.

If you haven't submit a command after 2 seconds you have no command in your list
you will automatically skip. Except you haven't done any turn yet, so new
players can get an overview.

If you run Into an hole it will take 3 Turns to fall down. After that you get
respawn at your starting point.

The game has no definite end play as long as you want.

There are two powerups in the center of the map. After you moved onto one of the
cross marked fields the next shot you perform will result in an multi shot.

## Test it on Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/lqdchrm/patoro-ggj2022)

## Build

```bash
npm install
npm run dev
```

## Run

```bash
npm install
npm run start
```
