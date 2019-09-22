import React from 'react';
import './App.css';

import Game from './Game';

import { initBoard, calculateBoardAfterMove, calculateBoardOutcomes, cpScore } from './util';


import { GoogleLogin } from 'react-google-login';

class App extends React.Component {

  state = {
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

  updateBoard = (board, cb)=> this.setState({ board: { ...this.state.board, ...board } }, cb)

  onTurnChange = ()=> setTimeout(()=> this.setState({
    board: {
      ...this.state.board,
      dice: [],
      turn: ({ white: 'black', black: 'white' })[this.state.board.turn],
    },
  }), 1000 * this.state.board.dice.length - 1000)

  roll = ()=>{
    let nextDice = [ Math.random()*6 +1, Math.random()*6 +1 ].map(Math.floor);
    let nextTurn = this.state.board.turn;
    
    if( nextDice[0] === nextDice[1] )
      nextDice = [...nextDice, ...nextDice];
    
    if( !this.state.board.turn ){
      if( nextDice[0] === nextDice[1] ){
        this.setState({ board: { ...this.state.board, dice: nextDice.slice(0,2) } });
        
        return setTimeout(()=> this.setState({
          board: { ...this.state.board, dice: [] },
        }, this.roll), 2000);
        
      } else nextTurn = nextDice[0] > nextDice[1] ? 'black' : 'white';
    }

    this.setState({
      board: {
        ...this.state.board,
        turn: nextTurn,
        dice: nextDice,
      }
    });
  }

  cpMove = ()=>{
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

  
  render() {
    return (
      <div className="App">

        <GoogleLogin
            clientId="sheshbesh-1569175678502.apps.googleusercontent.com"
            render={renderProps => (
                <button onClick={renderProps.onClick} disabled={renderProps.disabled}>This is my custom Google button</button>
              )}
            buttonText="Login"
            onSuccess={(...a)=> console.log(a)}
            onFailure={(...a)=> console.log(a)}
            cookiePolicy={'single_host_origin'}
        />
        
        <Game resetGame={this.resetGame}
              updateBoard={this.updateBoard}
              onTurnChange={this.onTurnChange}
              roll={this.roll}
              cpMove={this.cpMove}
              {...this.state.board} />
      </div>
    );
  }
}

export default App;


//sheshbesh-1569175678502
