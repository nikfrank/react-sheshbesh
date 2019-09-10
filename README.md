# sheshbesh fullstack build (react + nodejs)

It's 2020! (almost) We want to play sheshbesh against eachother anywhere in the world!

Let's build a game with google login that let's us play against our friends family and colleagues 

---

### Agenda

- [step 1: Build a 2-player local game in React using lots of SVGs](#step1)
- [step 2: Build a computer player for 1-player local game](#step2)
- [step 3: Build a game server with google oauth verification](#step3)
- [step 4: Deploy the solution to Heroku](#step4)


## Getting Started

`$ cd ~/code`

`$ npx create-react-app sheshbesh`

`$ cd sheshbesh`

`$ npm start`

you now have the default create-react-app starter running in your browser and can edit the `src` files live



<a name="step1"></a>
## step 1: Build a 2-player local game in React using lots of SVGs

We'll use [SVG in React](https://blog.lftechnology.com/using-svg-icons-components-in-react-44fbe8e5f91) to build our board

`$ touch src/Board.js`

<sub>./src/Board.js</sub>
```js
import React from 'react';

const Board = ()=> (
  <svg viewBox='0 0 1500 1000' className='Board'>
  </svg>
);

export default Board;
```


<sub>./src/App.js</sub>
```js
import React from 'react';
import './App.css';

import Board from './Board';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className='game-container'>
          <Board />
        </div>
      </div>
    );
  }
}

export default App;
```



### drawing an empty board

now let's draw the outline of our board with [svg rectangles](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect)


```js
import React from 'react';

const Board = ()=> (
  <svg viewBox='0 0 1500 1000' className='Board'>
      <rect x={0} y={0}
          height={1000} width={1500}
          fill='#fe9'
    />
    <rect x={0} y={0}
          height={1000} width={20}
          fill='#731'
    />
    <rect x={0} y={0}
          height={20} width={1500}
          fill='#731'
    />
    <rect x={0} y={980}
          height={20} width={1500}
          fill='#731'
    />
    <rect x={1400} y={0}
          height={1000} width={100}
          fill='#731'
    />
    <rect x={1410} y={20}
          height={960} width={80}
          fill='#510'
    />
    <rect x={660} y={0}
          height={1000} width={100}
          fill='#731'
    />
  </svg>
);

export default Board;
```


now we can go ahead and draw some triangles, using [svg polygon](https://www.w3schools.com/graphics/svg_polygon.asp)


<sub>./src/Board.js</sub>
```js
//...

    {[0, 180].map(angle=> (
      <g key={angle} style={{ transform: 'rotate('+angle+'deg)', transformOrigin:'47.33% 50%' }}>
        <polygon points='25,20 125,20 75,450' className='white-triangle' />
        <polygon points='131,20 231,20 181,450' className='black-triangle' />
        <polygon points='237,20 337,20 287,450' className='white-triangle' />
        <polygon points='343,20 443,20 393,450' className='black-triangle' />
        <polygon points='449,20 549,20 499,450' className='white-triangle' />
        <polygon points='555,20 655,20 605,450' className='black-triangle' />

        <polygon points='765,20 865,20 815,450' className='white-triangle' />
        <polygon points='871,20 971,20 921,450' className='black-triangle' />
        <polygon points='977,20 1077,20 1027,450' className='white-triangle' />
        <polygon points='1083,20 1183,20 1133,450' className='black-triangle' />
        <polygon points='1189,20 1289,20 1239,450' className='white-triangle' />
        <polygon points='1295,20 1395,20 1345,450' className='black-triangle' />
      </g>
    ))}


//...
```

47.33% is of course the center of our board (half of 1400 / 1500 = 7/15 = 0.4733333333)

which is where we want to rotate the triangles about in order to de-duplicate the code


<sub>./src/App.css</sub>
```css
.Board {
  max-height: 100vh;
  max-width: 100vw;
}

.white-triangle {
  stroke: black;
  fill: white;
}

.black-triangle {
  stroke: black;
  fill: black;
}
```

next, we can refactor the triangles even further


<sub>./src/Board.js</sub>
```js
//...

const centers = [
  1345, 1239, 1133, 1027, 921, 815, 605, 499, 393, 287, 181, 75,
];


//...


    {[0, 180].map(angle=> (
      <g key={angle} style={{ transform: 'rotate('+angle+'deg)', transformOrigin:'47.33% 50%' }}>
        {[...Array(12)].map((_, i)=>(
           <polygon key={i}
                    points={`${centers[i]-50},20 ${centers[i]+50},20 ${centers[i]},450`}
                    className={(i%2 ? 'black' : 'white')+'-triangle'} />
        ))}
      </g>
    ))}


```

our board looks great, now it needs pieces


### drawing pieces on the board

let's start up in our App by initializing our `state` with the initial `state` of a sheshbesh game


<sub>./src/App.js</sub>
```js
//...

const initBoard = [
  2, 0, 0, 0, 0, -5,
  0, -3, 0, 0, 0, 5,
  -5, 0, 0, 0, 3, 0,
  5, 0, 0, 0, 0, -2,
];

class App extends React.Component {

  state = {
    chips: [...initBoard],
    whiteHome: 0,
    whiteJail: 0,
    blackHome: 0,
    blackJail: 0,
  }

  render() {
    return (
      <div className="App">
        <div className='game-container'>
          <Board chips={this.state.chips}
                 whiteJail={this.state.whiteJail} whiteHome={this.state.whiteHome}
                 blackJail={this.state.blackJail} blackHome={this.state.blackHome} />
        </div>
      </div>
    );
  }
}

//...
```

what we'll find convenient is to keep track of the occupants of a space on the board using (+) positive numbers to represent black pieces (and how many), with (-) negative numbers representing white pieces (and how many)

of course, we'll need to also keep track of the pieces which are off the board (home / jail) at any given time for each player


now of course we can read the values as `props` inside the `Board` Component, and render some more SVG elements for them



<sub>./src/Board.js</sub>
```js
//...

const Board = ({
  whiteHome,
  blackHome,
  whiteJail,
  blackJail,
  chips,
})=> (
  //...

    {
      chips.map((chip, i)=> (
        <g key={i}>
          {[...Array(Math.abs(chip))].map((_, c)=> (
            <circle key={c} cx={centers[i]}
                    cy={ i < 12 ? (60 + 60*c) : (940 - 60*c) } r={30}
                    className={chip < 0 ? 'white-chip' : 'black-chip'}/>
          ))}

        </g>
      ))
    }

);

//...
```


notice of course that the pieces are radius 30 and we add 60 for each piece (`60*c`)

this will cause the pieces to line up one atop the other


<sub>./src/App.css</sub>
```css
//...

circle.white-chip {
  fill: white;
  stroke: #0aa;
  stroke-width: 10px;
}

circle.black-chip {
  fill: black;
  stroke: brown;
  stroke-width: 10px;
}
```

notice here the stroke overlaps from one piece to the next, which I like from a style point of view.

---


this is great until we have too many chips on the board!

if we test out what'd happen if we had 9 pieces on one chip

<sub>./src/App.js<sub>
```js
//...

const initBoard = [
  2, 0, 0, 0, 0, -9,
  0, -3, 0, 0, 0, 5,
  -5, 0, 0, 0, 3, 0,
  5, 0, 0, 0, 0, -2,
];

//...
```


we'll see that the chips go waaaaay over center

so we need a solution that causes the pieces to overlap when there's more than 6 of them


what we'll do is:

 - when there's 6 or fewer pieces, continue multiplying by 60
 - when there's more than 6 pieces, we'll reduce the multiplicand (60) by a bit for every extra piece
 

<sub>./src/Board.js</sub>
```js
//...

    {
      chips.map((chip, i)=> (
        <g key={i}>
          {[...Array(Math.abs(chip))].map((_, c)=> (
            <circle key={c} cx={centers[i]}
                    cy={ i < 12 ? (
                        60 + (60 - 5*Math.max(0, Math.abs(chip)-6))*c
                    ) : (
                        940 - (60 - 5*Math.max(0, Math.abs(chip)-6))*c
                    ) } r={30}
                    className={chip < 0 ? 'white-chip' : 'black-chip'}/>
          ))}
        </g>
      ))
    }


//...
```

now we can try this out with different numbers of pieces (only needs to work up to 15 of course) by editing the hardcoded initial board state


just remember to put it back eventually!

---

### moving the pieces around

our users will want to make moves and play the game, and have a comfortable time doing so

to make things easy, let's make some transparent rectangles above each of the spaces on the board for them to click

we'll collect single and double click events (we'll use the double clicks to move a piece home when that's allowed)


<sub>./src/Board.js</sub>
```js
//...

    {
      chips.map((chip, i)=> (
        <g key={i}>
          {[...Array(Math.abs(chip))].map((_, c)=> (
            <circle key={c} cx={centers[i]}
                    cy={ i < 12 ? (
                        60 + (60 - 5*Math.max(0, Math.abs(chip)-6))*c
                    ) : (
                        940 - (60 - 5*Math.max(0, Math.abs(chip)-6))*c
                    ) } r={30}
                    className={chip < 0 ? 'white-chip' : 'black-chip'}/>
          ))}

          <rect x={centers[i] - 50} width={100}
                y={ i < 12 ? 20 : 550 } height={430}
                fill='transparent' stroke='transparent'
                onDoubleClick={()=> onDoubleClick(i)}
                onClick={()=> onClick(i)} />

        </g>
      ))
    }

//...
```

<sub>./src/App.js</sub>
```js

//...

  spaceClicked = (index)=> {
    console.log('click', index);
  }

  spaceDoubleClicked = (index)=> {
    console.log('double click', index);
  }

  render() {
    return (
      <div className="App">
        <div className='game-container'>
          <Board chips={this.state.chips}
                 onClick={this.spaceClicked}
                 onDoubleClick={this.spaceDoubleClicked}
                 whiteJail={this.state.whiteJail} whiteHome={this.state.whiteHome}
                 blackJail={this.state.blackJail} blackHome={this.state.blackHome} />
        </div>
      </div>
    );
  }
}

//...
```

### jail and home

once we get our game running, we'll end up with pieces in jail or home. Let's render them now so we're ready for that later.

<sub>./src/App.js</sub>
```js
  state = {
    chips: [...initBoard],
    whiteHome: 15,
    whiteJail: 5,
    blackHome: 15,
    blackJail: 5,
  }
```

these are the maximum values for home or jail we need to account for

(of course it's possible to have more than 5 in jail, if you've taught your younger brother all the rules wrong and he keeps leaving all of his pieces vulnerable!)

remember in the last step we already passed `this.state.whiteHome`, `this.state.whiteJail`, `this.state.blackHome`, `this.state.blackJail` as `props` to our `Board` Component


<sub>./src/Board.js</sub>
```js
//...

    {
      [...Array(whiteJail)].map((_, i)=>(
        <circle key={i} cx={710}
                cy={ 60 + 60*i } r={30}
                className='white-chip'/>
      ))
    }
    {
      [...Array(blackJail)].map((_, i)=>(
        <circle key={i} cx={710}
                cy={ 940 - 60*i } r={30}
                className='black-chip'/>
      ))
    }

```

this will render the jailed pieces in the middle of the board on either side


```js
    {
      [...Array(whiteHome)].map((_, i)=> (
        <rect key={i} x={1420} y={25 + 25*i} height={20} width={60} className='white-home' />
      ))
    }
    {
      [...Array(blackHome)].map((_, i)=> (
        <rect key={i} x={1420} y={955 - 25*i} height={20} width={60} className='black-home' />
      ))
    }

//...
```

as for home, we've rendered the pieces on their sides (as rectangles... the precocious student may wish to style them with a linear gradient to appear more like the edge of a circular piece...)


we'll need some CSS for those home pieces...


<sub>./src/App.css
```css
rect.white-home {
  fill: #0aa;
}

rect.black-home {
  fill: brown;
}
```



now that we have all the pieces rendering we can start thinking through the logic of the game



### taking turns

we'll need a few more values in our `state` to keep track of the dice and whose turn it is

<sub>./src/App.js</sub>
```js
//...

  state = {
    chips: [...initBoard],
    whiteHome: 0,
    whiteJail: 0,
    blackHome: 0,
    blackJail: 0,

    turn: 'black',
    dice: [],
    selectedChip: null,
  }

//...
```

we'll also keep track of whether there's a chip selected (which we'll use when we start trying to move the pieces around)

now we should give the user a way to roll the dice so we can start playing


#### rolling dice

let's make a button and position it nicely in the middle of the Board

<sub>./src/App.js</sub>
```js
//...
        <Board .../>

        <div className='dice-container'>
          {!this.state.dice.length ? (
             <button onClick={this.roll}>roll</button>
          ) : this.state.dice}
        </div>

//...
```

<sub>./src/App.css</sub>
```css
.App {
  position: relative;
}

.dice-container {
  position: absolute;
  height: 100px;
  top: calc( 50% - 50px );

  width: 100px;
  left: calc( 47.33% - 50px );
}
```

and our roll function (instance method)

<sub>./src/App.js</sub>
```js
  roll = ()=> {
    if( this.state.dice.length ) return;

    this.setState({
      dice: [ Math.random()*6 +1, Math.random()*6 +1 ].map(Math.floor)
    })
  }
```

now we should be able to roll the dice once

we'll see that we need to do something about doubles!

we should give player 4 dice when they roll doubles...


<sub>./src/App.js</sub>
```js
  roll = ()=> {
    if( this.state.dice.length ) return;

    this.setState({
      dice: [ Math.random()*6 +1, Math.random()*6 +1 ].map(Math.floor)
    }, ()=>{
      if( this.state.dice[0] === this.state.dice[1] )
        this.setState({
          dice: [...this.state.dice, ...this.state.dice],
        });
    })
  }
```

here we're using the [setState callback](https://medium.com/better-programming/when-to-use-callback-function-of-setstate-in-react-37fff67e5a6c) to check the dice once we've made them, and update the `state` if it's doubles


now let's take a break from our busy lives to make a happy little component that draws dice on the screen.


`$ touch src/Dice.js`

<sub>./src/Dice.js</sub>
```js
import React from 'react';

const Dice = ({ dice })=>
  dice.map((die, i)=> (
    <svg viewBox='0 0 100 100' key={i} className='die'>
      <rect x={0} y={0} height={100} width={100} rx={12}/>

      {die === 1 ? (
         <circle cx={50} cy={50} r={10} />
      ): die === 2 ? (
         <g>
           <circle cx={33} cy={33} r={10} />
           <circle cx={67} cy={67} r={10} />
         </g>
      ): die === 3 ? (
         <g>
           <circle cx={33} cy={33} r={10} />
           <circle cx={50} cy={50} r={10} />
           <circle cx={67} cy={67} r={10} />
         </g>
      ): die === 4 ? (
        <g>
          <circle cx={33} cy={33} r={10} />
          <circle cx={33} cy={67} r={10} />
          <circle cx={67} cy={33} r={10} />
          <circle cx={67} cy={67} r={10} />
        </g>
      ): die === 5 ? (
        <g>
          <circle cx={33} cy={33} r={10} />
          <circle cx={33} cy={67} r={10} />
          <circle cx={67} cy={33} r={10} />
          <circle cx={50} cy={50} r={10} />
          <circle cx={67} cy={67} r={10} />
        </g>
      ): die === 6 ? (
        <g>
          <circle cx={33} cy={33} r={10} />
          <circle cx={33} cy={50} r={10} />
          <circle cx={33} cy={67} r={10} />
          <circle cx={67} cy={33} r={10} />
          <circle cx={67} cy={50} r={10} />
          <circle cx={67} cy={67} r={10} />
        </g>
      ): null}
    </svg>
  ));

export default Dice;
```

<sub>./src/App.js</sub>
```js
//...

import Dice from './Dice';

//...


          <div className='dice-container'>
            {!this.state.dice.length ? (
               <button onClick={this.roll}>roll</button>
            ) : (
               <Dice dice={this.state.dice} />
            )}
          </div>


```

and of course, we'll want to center them on the screen


<sub>./src/App.css</sub>
```css
body {
  overflow: hidden;
}

.Board {
  max-height: 100vh;
  max-width: 100vw;
}

.game-container {
  margin: 0 auto;
  height: 100vh;
  max-height: 66.666vw;
  width: 150vh;
  max-width: 100vw;
  position: relative;
}

.dice-container {
  position: absolute;
  height: 100px;
  top: calc( 50% - 50px );

  width: 100px;
  left: calc( 47.33% - 50px );

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.die {
  height: 40px;
  width: 40px;
  margin: 3px;
}

.die rect {
  fill: white;
  stroke: black;
  stroke-width: 4px;
}

.dice-container button {
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  outline: none;
  font-weight: 900;
}

//...
```


#### event logic for selecting and moving a piece

remember earlier of course we made some invisible rectangles for the user to click on

now we'll respond to the click events by selecting then moving pieces

in pseudocode

```
when the player clicks a space

 - if there are no dice, don't do anything
 - if the player is in jail, check if the space clicked is a legal move from jail
   - if so, move out of jail
   - otherwise do nothing
 - otherwise, the player isn't in jail
 - if there is not selectedChip, if this chip has legal moves, select it
 - otherwise, if this chip can be moved to legally, move there
 - if this chip IS the selected chip, unselect it
 
```

we can go ahead and write this into our `spaceClicked` function

<sub>./src/App.js</sub>
```js
//...

  spaceClicked = (clicked)=>{
    // if no dice, do nothing (wait for roll)
    if( !this.state.dice.length ) return;

    // if turn is in jail
    if( this.state[ this.state.turn + 'Jail' ] ){
      // if click is on valid move, this.makeMove(index) (return)
      
    } else {
      // if no chip selected
      if( this.state.selectedChip === null ){
        // if click is on turn's chips with legal moves, select that chip (return)
        
      } else {
        // else this is a second click
        // if the space selected is a valid move, this.makeMove(index)

        // if another click on the selectedChip, unselect the chip
        if( index === this.state.selectedChip )
          this.setState({ selectedChip: null });
      }
    }
  }
  
//...
```


to write the rest of this logic, we'll need two utility functions (which will be very useful later when we write our computer player)

`calculateLegalMoves` and `calculateBoardAfterMove`

here we'll need `calculateLegalMoves`, and in our `makeMove` function we'll need `calculateBoardAfterMove`



#### calculate legal moves

whenever the dice are rolled or a move is made, we'll want to calculate the legal moves available

if there are some, we will put them into `state.legalMoves` so the rest of our game can use that information

if there are none, the turn is over...


here our job is to calculate the moves, the rest we'll do in the next few sections

`$ touch src/util.js`


<sub>./src/util.js</sub>
```js
export const calculateLegalMoves = ({ chips, dice, turn, whiteJail, blackJail })=>{

};
```

again, I like to think through this type of problem in English, then translate to js

```
 - if there's no dice, there's no moves

 - if we're in jail, only spaces 0-5 (black) or 18-23 (white) can be moved to
   only if there are 1 or fewer opponent pieces (or our pieces are there)
   
 - otherwise, for every unique die, for every chip with our piece
   we can make a move to {chip + die} (black) or {chip - die} (white)
   only if there are 1 or fewer opponent pieces (or our pieces are there)
 
 - if all of our pieces are in the last 6 slots, we can move to home if
   the die is the exact distance to home OR
   the die is greater than our furthest piece and we're trying to move our furthest piece
```

we'll want to return our moves as an array of `{ moveFrom, moveTo, usedDie }` objects


```js
export const calculateLegalMoves = ({ chips, dice, turn, whiteJail, blackJail })=>{
  if( !dice.length ) return [];

  if( (turn === 'white') && (whiteJail > 0) ){
    // check if 23-18 are legal moves by dice
    return dice.filter(die => ( chips[ 24 - die ] <= 1 ))
               .map(die => ({ moveFrom: 'whiteJail', moveTo: 24 - die, usedDie: die }) );
    
  } else if( (turn === 'black') && (blackJail > 0) ){
    // check if 0-5 are legal moves by dice
    return dice.filter(die => ( chips[ die - 1 ] >= -1 ))
               .map(die => ({ moveFrom: 'blackJail', moveTo: die - 1, usedDie: die }) );
    
  } else {
    // for all dice we have, for all the chips we have, check if chip +/- die is legal

    // if all pieces are in last 6, calculate legal home moves
  }
};
```

moving from jail is fairly straightforward, let's use `.reduce` to calculate legal board moves

```
first, compute direction (+1 for black, -1 for white) for convenience

second, compute a list of unique dice so we don't compute dupilcate moves

for each of the chips, if it isn't our pieces, there aren't any new moves

if it is, then any unique die which leads to a legal move should make a new move

the new move should be from the chip we're inspecting, to die * direction away

all the new moves from this chip should be returned along with anything else we had so far
```



``` js
//...
    const direction = turn === 'black' ? 1 : -1;
    
    const uniqueDice = Array.from(new Set(dice));
    
    const legalMoves = chips.reduce((moves, chip, i)=> (
      ( chip * direction <= 0 ) ? moves : [
        ...moves,
        ...uniqueDice.filter(die => (
          (chips[ i + direction * die ] * direction >= -1)
        )).map(die => ({ moveFrom: i, moveTo: i + direction * die, usedDie: die })),
      ]
    ), []);

//...

```

and now the home moves, which although intuitive for people, are a bit more comlicated to code


```
calculate how far the furthest piece is from home

if > 6, no legal home moves (we already know we aren't in jail by the else block we're in)

for each spot between 0-5 (white) 18-23 (black)  we have a legal move if
 - we have the exact die OR
 - this is the furthest piece and we have a bigger die
 
 moveFrom will be the spot
 moveTo will be this player's home
 usedDie will be the exact die or the biggest die
```


```js
//...

    const legalHomeMoves = (
      furthestPiece > 6
    ) ? [] : (
      turn === 'white'
    ) ? [0, 1, 2, 3, 4, 5].filter(spot=> (
      (chips[spot] < 0) && (
        (uniqueDice.filter(die => die === spot+1).length) ||
        (uniqueDice.filter(die => ((die >= furthestPiece) && (spot+1 === furthestPiece))).length)
      )
    )).map(spot => ({
      moveFrom: spot,
      moveTo: 'whiteHome',
      usedDie: uniqueDice.find(die => die === spot+1) || Math.max(...uniqueDice),
    })

    ) : [23, 22, 21, 20, 19, 18].filter(spot=> (
      (chips[spot] > 0) && (
        (uniqueDice.filter(die => die === 24-spot).length) ||
        (uniqueDice.filter(die => ((die >= furthestPiece) && (24-spot === furthestPiece))).length)
      )
    )).map(spot => ({
      moveFrom: spot,
      moveTo: 'blackHome',
      usedDie: uniqueDice.find(die => die === 24-spot) || Math.max(...uniqueDice),
    }));
    
//...
```

that could perhaps use a refactor for being too wet, I'll leave that to the reader as an exercise!


now all we have to do is return all the legal moves

```js
//...

    return [
      ...legalMoves,
      ...legalHomeMoves,
    ];

//... (just close curlies)
```

it is at this time I found it convenient to move the `initBoard` const into the util file


<sub>./src/App.js</sub>
```js
//...

import { initBoard, calculateLegalMoves } from './util';

//... remove the previous declaration of initBoard
```


<sub>./src/util.js</sub>
```js
export const initBoard = [
  2, 0, 0, 0, 0, -5,
  0, -3, 0, 0, 0, 5,
  -5, 0, 0, 0, 3, 0,
  5, 0, 0, 0, 0, -2,
];

//...
```



#### testing our legal moves function

let's write some test cases so we can be confident in our outcome


`$ touch src/util.test.js`

we'll want to test:

 - moving out of jail (legal moves, no legal moves)
 - moving normally around the board
 - moving home


<sub>./src/util.test.js</sub>
```js
it('moves out of jail', ()=>{
  const moves = calculateLegalMoves({
    chips: initBoard,
    dice: [2, 6],
    turn: 'white',
    whiteJail: 1,
    blackJail: 0,
  });

  expect( moves ).toHaveLength( 1 );
  expect( moves[0] ).toEqual({ moveFrom: 'whiteJail', moveTo: 22, usedDie: 2 });
});
```

now if we can't get out

```js
//...

it('no moves out of jail', ()=>{
  const moves = calculateLegalMoves({
    chips: initBoard,
    dice: [6, 6],
    turn: 'white',
    whiteJail: 1,
    blackJail: 0,
  });

  expect( moves ).toHaveLength( 0 );
});
```

now for a normal move

```js
//...

it('moves around the board', ()=>{
  const moves = calculateLegalMoves({
    chips: initBoard,
    dice: [5, 2],
    turn: 'white',
    whiteJail: 0,
    blackJail: 0,
  });

  expect( moves ).toHaveLength( 6 );

  
  const moreMoves = calculateLegalMoves({
    chips: initBoard,
    dice: [6, 2],
    turn: 'white',
    whiteJail: 0,
    blackJail: 0,
  });

  expect( moreMoves ).toHaveLength( 7 );
});
```

here I've tested two cases just to make sure the "blocking" is working


now we should test that captures are legal moves

```js
//...

it('captures', ()=>{

  const captureBoard = [
    2, 2, -1, -1, -2, -2,
    0, 0, 0, 0, 0, -9,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 11,
  ];
  
  const moves = calculateLegalMoves({
    chips: captureBoard,
    dice: [2, 3],
    turn: 'black',
    whiteJail: 0,
    blackJail: 0,
  });

  expect( moves ).toHaveLength( 3 );
});

```



and for moving home, we'll need another arrangement of pieces

```js
//...

it('moves home', ()=>{

  const moveHomeBoard = [
    -15, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 5, 5, 5,
  ];
  
  const moves = calculateLegalMoves({
    chips: moveHomeBoard,
    dice: [6, 2],
    turn: 'black',
    whiteJail: 0,
    blackJail: 0,
  });

  expect( moves ).toHaveLength( 3 );
});

```


while that doesn't test every possible case, it is fairly exhaustive and should therefore make us feel more confident in our solution.



#### moving pieces

now we can return to our `spaceClicked` function, where we will use our `calculateLegalMoves` function to decide to make a move.


<sub>./src/App.js</sub>
```js
//...

  spaceClicked = (clicked)=>{
    // if no dice, do nothing (wait for roll)
    if( !this.state.dice.length ) return;

    const legalMoves = calculateLegalMoves(this.state);

    // if turn is in jail
    if( this.state[ this.state.turn + 'Jail' ] ){
      const clickMove = legalMoves.find(({ moveFrom, moveTo }) => (
        (moveFrom === this.state.turn + 'Jail') &&
        (moveTo === clicked)
      ));
      
      if( clickMove ) this.makeMove(clickMove);

```

that will take care of jail moves

we haven't written the `makeMove` function yet, but we will next, and it will take a move object as previously specified as input

```js
//...

    } else {
      // if no chip selected
      if( this.state.selectedChip === null ){
        if( legalMoves.filter(({ moveFrom }) => moveFrom === clicked ).length )
          this.setState({ selectedChip: clicked });
```

now only chips with legal moves may be selected


```js
      } else {
        const clickMove = legalMoves.find(({ moveFrom, moveTo }) => (
          (moveFrom === this.state.selectedChip) &&
          (moveTo === clicked)
        ));
        
        if( clickMove ) this.makeMove(clickMove);

        // if another click on the selectedChip, unselect the chip
        if( clicked === this.state.selectedChip )
          this.setState({ selectedChip: null });
      }
    }
  }

```

and finally, when a click is made after already selecting a chip to move from, we check if there's a legal move and call `makeMove`


most of the logic for making a move will be in calculating the next board after the move

so we'll code the `makeMove` function in the next section



#### calculate board after move

<sub>./src/util.js</sub>
```js
//...

export const calculateBoardAfterMove = (
  { chips, dice, turn, blackJail, whiteJail },
  { moveFrom, moveTo, usedDie },
)=>{

  //...

}
```

here we've already decided that the move is legal, our only goal is to calculate what the next state of the game should be


```
decrease the pieces on the from space (or jail)

increase the pieces on the to space (or home)

if the to space is a capture, increase the jail of the opponent
```

<sub>./src/util.js</sub>
```js
//...

export const calculateBoardAfterMove = (
  { chips, dice, turn, blackJail, whiteJail, blackHome, whiteHome },
  { moveFrom, moveTo, usedDie },
)=>{

  const direction = turn === 'black' ? 1 : -1;

  let nextDice = [
    ...dice.slice( 0, dice.indexOf(usedDie) ),
    ...dice.slice( dice.indexOf(usedDie) + 1)
  ];

  let nextChips = [...chips];
  let nextWhiteJail = whiteJail;
  let nextBlackJail = blackJail;
  let nextWhiteHome = whiteHome;
  let nextBlackHome = blackHome;

  if( typeof moveFrom === 'number' ) nextChips[ moveFrom ] -= direction;
  else {
    if( turn === 'black' ) nextBlackJail--;
    if( turn === 'white' ) nextWhiteJail--;
  }

  if( typeof moveTo === 'number' ){
    // if the to is a single opponent, move it to jail
    if( chips[moveTo] === -direction ){
      nextChips[moveTo] = direction;
      if( turn === 'black' ) nextWhiteJail++;
      if( turn === 'white' ) nextBlackJail++;

    } else {
      // increase a chip in the to
      nextChips[moveTo] += direction;
    }
  } else {
    // we're moving home
    if( turn === 'black' ) nextBlackHome++;
    if( turn === 'white' ) nextWhiteHome++;
  }

  return {
    dice: nextDice,
    chips: nextChips,
    turn,
    whiteJail: nextWhiteJail,
    whiteHome: nextWhiteHome,
    blackJail: nextBlackJail,
    blackHome: nextBlackHome,
  };
};
```

again here we're using `direction` as a convenient way to calculate things for either player


now we can call this function in our `makeMove`


<sub>./src/App.js</sub>
```js
//...

import { initBoard, calculateLegalMoves, calculateBoardAfterMove } from './util';

//...

  makeMove = (move)=> {
    this.setState({
      ...calculateBoardAfterMove(this.state, move),
      selectedChip: null
    });
  }

//...
```

ending the turn we'll need to deal with later



#### testing board after move (jail, captures, normal moves, home)

<sub>./src/util.test.js</sub>
```js
import { initBoard, calculateLegalMoves, calculateBoardAfterMove } from './util';

//...

```

again in our test, we will contrive some game states and test case moves

then we just need to check that the output is reasonable, so we can be confident in our code


```js
//...

it('moves pieces out of jail', ()=>{
  const { chips, dice, turn, whiteJail, blackJail, whiteHome, blackHome} =
    calculateBoardAfterMove({
      chips: initBoard,
      dice: [2, 6],
      turn: 'white',
      whiteJail: 1,
      blackJail: 0,
      whiteHome: 0,
      blackHome: 0,
    }, {
      moveFrom: 'whiteJail',
      moveTo: 22,
      usedDie: 2
    });

  expect( chips[22] ).toEqual( -1 );
  expect( dice ).toEqual([ 6 ]);
  expect( turn ).toEqual('white');
  expect( whiteJail ).toEqual( 0 );
  expect( blackJail ).toEqual( 0 );
  expect( whiteHome ).toEqual( 0 );
  expect( blackHome ).toEqual( 0 );
});

```

similarly for captures,

```js
//...

it('captures enemies', ()=>{
  const captureBoard = [
    2, 2, -1, -1, -2, -2,
    0, 0, 0, 0, 0, -9,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 11,
  ];

  const { chips, dice, turn, whiteJail, blackJail, whiteHome, blackHome} =
    calculateBoardAfterMove({
      chips: captureBoard,
      dice: [2, 3],
      turn: 'black',
      whiteJail: 0,
      blackJail: 0,
      whiteHome: 0,
      blackHome: 0,
    }, {
      moveFrom: 0,
      moveTo: 3,
      usedDie: 3
    });

  expect( chips[0] ).toEqual( 1 );
  expect( chips[3] ).toEqual( 1 );
  expect( dice ).toEqual([ 2 ]);
  expect( turn ).toEqual('black');
  expect( whiteJail ).toEqual( 1 );
  expect( blackJail ).toEqual( 0 );
  expect( whiteHome ).toEqual( 0 );
  expect( blackHome ).toEqual( 0 );
});
```

normal moves

```js
//...

it('moves pieces around the board', ()=>{
  const { chips, dice, turn, whiteJail, blackJail, whiteHome, blackHome} =
    calculateBoardAfterMove({
      chips: initBoard,
      dice: [2, 6],
      turn: 'white',
      whiteJail: 0,
      blackJail: 0,
      whiteHome: 0,
      blackHome: 0,
    }, {
      moveFrom: 23,
      moveTo: 17,
      usedDie: 6
    });

  expect( chips[23] ).toEqual( -1 );
  expect( chips[17] ).toEqual( -1 );
  expect( dice ).toEqual([ 2 ]);
  expect( turn ).toEqual('white');
  expect( whiteJail ).toEqual( 0 );
  expect( blackJail ).toEqual( 0 );
  expect( whiteHome ).toEqual( 0 );
  expect( blackHome ).toEqual( 0 );
});
```

and home moves... remembering of course to test both possible cases

```js
//...

it('moves pieces home furthest', ()=>{
  const moveHomeBoard = [
    -15, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 5, 5, 5,
  ];

  const { chips, dice, turn, whiteJail, blackJail, whiteHome, blackHome} =
    calculateBoardAfterMove({
      chips: moveHomeBoard,
      dice: [2, 6],
      turn: 'black',
      whiteJail: 0,
      blackJail: 0,
      whiteHome: 0,
      blackHome: 0,
    }, {
      moveFrom: 21,
      moveTo: 'blackHome',
      usedDie: 6,
    });

  expect( chips[21] ).toEqual( 4 );
  expect( dice ).toEqual([ 2 ]);
  expect( turn ).toEqual('black');
  expect( whiteJail ).toEqual( 0 );
  expect( blackJail ).toEqual( 0 );
  expect( whiteHome ).toEqual( 0 );
  expect( blackHome ).toEqual( 1 );
});

it('moves pieces home', ()=>{
  const moveHomeBoard = [
    -15, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 5, 5, 5,
  ];

  const { chips, dice, turn, whiteJail, blackJail, whiteHome, blackHome} =
    calculateBoardAfterMove({
      chips: moveHomeBoard,
      dice: [2, 6],
      turn: 'black',
      whiteJail: 0,
      blackJail: 0,
      whiteHome: 0,
      blackHome: 0,
    }, {
      moveFrom: 22,
      moveTo: 'blackHome',
      usedDie: 2,
    });

  expect( chips[22] ).toEqual( 4 );
  expect( dice ).toEqual([ 6 ]);
  expect( turn ).toEqual('black');
  expect( whiteJail ).toEqual( 0 );
  expect( blackJail ).toEqual( 0 );
  expect( whiteHome ).toEqual( 0 );
  expect( blackHome ).toEqual( 1 );
});
```


### ending the turn (blockades)

as we mentioned before, every time the array of legal moves changes (dice are rolled, a piece is moved), we will want to calculate a new array of legal moves

if that array is empty, the turn is over.

by storing the `legalMoves` in `state`, we could also (as homework!) highlight the chips which the player could move to / from


we will implement this by using [react setState callback](https://stackoverflow.com/questions/42038590/when-to-use-react-setstate-callback)


in our `roll` function and our `makeMove` function, we'll call a new function `updateLegalMoves` which will update the legal moves in `state`

that `setState` call will also have a callback to call another new function (we bill by the function) `checkTurnOver` which will trigger the `turn` change

<sub>./src/App.js</sub>
```js
//...

  makeMove = (move)=> {
    this.setState({
      ...calculateBoardAfterMove(this.state, move),
      selectedChip: null
    }, this.updateLegalMoves);
  }

  roll = ()=> {
    if( this.state.dice.length ) return;

    this.setState({ dice: [ Math.random()*6 +1, Math.random()*6 +1 ].map(Math.floor) }, ()=>{
      if( this.state.dice[0] === this.state.dice[1] )
        this.setState({
          dice: [...this.state.dice, ...this.state.dice],
        }, this.updateLegalMoves);
      
      else this.updateLegalMoves();
    })
  }

  updateLegalMoves = ()=> this.setState({
    legalMoves: calculateLegalMoves(this.state),
  }, this.checkTurnOver)

  checkTurnOver = ()=>{
    if( !this.state.legalMoves.length ) this.setState({
      turn: ({ black: 'white', white: 'black' })[this.state.turn],
      dice: [],
    });
  }
//...
```


we can also replace in `spaceClicked` our `calculateLegalMoves` call with

```js
//...

    const { legalMoves } = this.state;
    
//...
```

and we should really initialize `legalMoves` to `[]`

```js
//...

  state = {
    chips: [...initBoard],
    whiteHome: 0,
    whiteJail: 0,
    blackHome: 0,
    blackJail: 0,

    turn: 'black',
    dice: [],
    selectedChip: null,
    legalMoves: [],
  }

//...
```

and when there are no legal moves, but there are dices remaining, we should show that state for a few seconds so the player is not confused about the turn changing

```js
//...

  checkTurnOver = ()=>{
    if( this.state.whiteHome === 15 ) console.log('white wins');
    if( this.state.blackHome === 15 ) console.log('black wins');

    if( !this.state.legalMoves.length ) setTimeout(()=> this.setState({
      turn: ({ black: 'white', white: 'black' })[this.state.turn],
      dice: [],
    }), 1000* this.state.dice.length);
  }
  
//...
```


### moving home (double clicks)





### ending the game



<a name="step2"></a>
## step 2: Build a computer player for 1-player local game


<a name="step3"></a>
## step 3: Build a game server with google oauth verification


<a name="step4"></a>
## step 4: Deploy the solution to Heroku




This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
