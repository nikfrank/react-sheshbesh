import React from 'react';
import './App.css';

import Game from './Game';

import { initBoard, calculateBoardAfterMove, calculateBoardOutcomes, cpScore } from './util';


class App extends React.Component {

  state = {
    menuOpen: false,
    remoteGame: false,
    board: {
      chips: [...initBoard],
      whiteHome: 0,
      whiteJail: 0,
      blackHome: 0,
      blackJail: 0,

      turn: null,
      dice: [],
      legalMoves: [],

      cp: 'white',
    },
  }

  resetGame = ()=> this.setState({
    board: {
      chips: [...initBoard],
      whiteHome: 0,
      whiteJail: 0,
      blackHome: 0,
      blackJail: 0,

      turn: null,
      dice: [],
      legalMoves: [],

      cp: 'white',
    }
  })

  updateBoard = (board, cb)=> {
    if(!this.state.remoteGame)
      this.setState({ board: { ...this.state.board, ...board } }, cb);

    else {
      // sync new state to firebase
    }
  }

  onTurnChange = ()=> {
    if(!this.state.remoteGame) setTimeout(()=> this.setState({
      board: {
        ...this.state.board,
        dice: [],
        turn: ({ white: 'black', black: 'white' })[this.state.board.turn],
      },
    }), 1000 * this.state.board.dice.length - 500);

    else {
      // wait dice - 0.5s, update dice and turn on server
    }
  }

  roll = ()=>{
    let nextDice = [ Math.random()*6 +1, Math.random()*6 +1 ].map(Math.floor);
    let nextTurn = this.state.board.turn;
    
    if( nextDice[0] === nextDice[1] )
      nextDice = [...nextDice, ...nextDice];
    
    if( !this.state.board.turn ){
      // if remoteGame, check if there are initRolls to use
      // if there are, find one that works,
      // if I won, I'll update the turn dice and initRolls (new 30 random)
      // if I lost, I'll wait for snapshots
      
      if( nextDice[0] === nextDice[1] ){
        this.setState({ board: { ...this.state.board, dice: nextDice.slice(0,2) } });

        return setTimeout(()=> this.setState({
          board: { ...this.state.board, dice: [] },
        }, this.roll), 2000);
        
      } else nextTurn = nextDice[0] > nextDice[1] ? 'black' : 'white';
    }

    // make sure not to do this on remoteGame cpTurn
    this.setState({
      board: {
        ...this.state.board,
        turn: nextTurn,
        dice: nextDice,
      }
    });
  }

  cpMove = ()=>{
    if( this.state.remoteGame ) return;
    // wait for snapshots instead
    
    const options = calculateBoardOutcomes(this.state.board);

    if( !options.length ) return this.onTurnChange();

    const scoredOptions = options.map(option=> ({
      score: cpScore(option.board), moves: option.moves,
    }));

    const bestMoves = scoredOptions.sort((a, b)=>
      (a.score - b.score) * (this.state.board.cp === 'white' ? 1 : -1 )
    )[0].moves;

    for(let i=0; i<(bestMoves.length); i++)
      setTimeout(()=> this.updateBoard(
        calculateBoardAfterMove(this.state.board, bestMoves[i]),
        i === bestMoves.length - 1 ?   this.onTurnChange : null
      ), 800 + 900*i);

  }

  toggleMenu = ()=> this.setState({ menuOpen: !this.state.menuOpen })

  playOnline = ()=> this.setState({ remoteGame: true }, ()=>{
    this.toggleMenu();

    // onSnapshot remote game state
    // set "cp" to other user
  })
  
  playCp = ()=> this.setState({ remoteGame: false }, ()=>{
    this.toggleMenu();

    // cleanup any firebase listeners
  })
  
  render() {
    return (
      <div className="App">

        {this.state.remoteGame ? (
           <Game resetGame={this.resetGame}
                 updateBoard={this.updateBoard}
                 onTurnChange={this.onTurnChange}
                 roll={this.roll}
                 longPressRoll={this.toggleMenu}
                 cpMove={this.cpMove}
                 {...this.state.board} />
         ) : (
           <Game resetGame={this.resetGame}
                 updateBoard={this.updateBoard}
                 onTurnChange={this.onTurnChange}
                 roll={this.roll}
                 longPressRoll={this.toggleMenu}
                 cpMove={this.cpMove}
                 {...this.state.board} /> )}

           {this.state.menuOpen && (
              <div className='menu'>
                <label>
                  name:
                  <input value={this.state.nickname} onChange={this.setNickname}/>
                </label>
                <button onClick={this.playOnline}>play online</button>
                <button onClick={this.playCp}>play cp</button>
              </div>
            )}
      </div>
    );
  }
}

export default App;


//sheshbesh-1569175678502
