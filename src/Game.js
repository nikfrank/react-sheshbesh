import React from 'react';

import Board from './Board';
import Dice from './Dice';

import { initBoard, calculateLegalMoves, calculateBoardAfterMove, calculateBoardOutcomes, cpScore } from './util';


class Game extends React.Component {

  state = {
    chips: [...initBoard],
    whiteHome: 0,
    whiteJail: 0,
    blackHome: 0,
    blackJail: 0,

    turn: null,
    dice: [],
    selectedChip: null,
    legalMoves: [],

    cp: 'white',
  }

  resetGame = ()=> this.setState({
    chips: [...initBoard],
    whiteHome: 0,
    whiteJail: 0,
    blackHome: 0,
    blackJail: 0,

    turn: null,
    dice: [],
    selectedChip: null,
    legalMoves: [],
  })

  spaceClicked = (clicked)=>{
    // if no dice, do nothing (wait for roll)
    if( !this.state.dice.length ) return;

    const { legalMoves } = this.state;

    // if turn is in jail
    if( this.state[ this.state.turn + 'Jail' ] ){
      const clickMove = legalMoves.find(({ moveFrom, moveTo }) => (
        (moveFrom === this.state.turn + 'Jail') &&
        (moveTo === clicked)
      ));
      
      if( clickMove ) this.makeMove(clickMove);
      
    } else {
      // if no chip selected
      if( this.state.selectedChip === null ){
        if( legalMoves.filter(({ moveFrom }) => moveFrom === clicked ).length )
          this.setState({ selectedChip: clicked });
        
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
  

  spaceDoubleClicked = (clicked)=> {
    const legalHomeMove = this.state.legalMoves.find(move => (
      (move.moveTo === this.state.turn + 'Home') && (move.moveFrom === clicked)
    ) );
    
    if( legalHomeMove )
      this.setState({
        ...calculateBoardAfterMove(this.state, legalHomeMove),
        selectedChip: null,
      }, this.updateLegalMoves);
  }

  makeMove = (move)=> {
    this.setState({
      ...calculateBoardAfterMove(this.state, move),
      selectedChip: null
    }, this.updateLegalMoves);
  }

  roll = ()=> {
    if( this.state.dice.length ) return;

    this.setState({ dice: [ Math.random()*6 +1, Math.random()*6 +1 ].map(Math.floor) }, ()=>{
      if( !this.state.turn ) {
        if( this.state.dice[0] === this.state.dice[1] )
          return setTimeout(()=> this.setState({ dice: [] }, this.roll), 2000);

        return this.setState({ turn: this.state.dice[0] > this.state.dice[1] ? 'black' : 'white' }, ()=>{
          this.state.turn === this.state.cp ? this.cpMove() : this.updateLegalMoves()
        });
      }

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
    if( this.state.whiteHome === 15 ){
      console.log('white wins');
      return this.resetGame();
    }
    
    if( this.state.blackHome === 15 ){
      console.log('black wins');
      return this.resetGame();
    }

    if( !this.state.legalMoves.length ) setTimeout(()=> this.setState({
      turn: ({ black: 'white', white: 'black' })[this.state.turn],
      dice: [],
    }, this.triggerCP), 1000* this.state.dice.length);
  }

  triggerCP = ()=> (this.state.turn === this.state.cp ? this.cpRoll() : null)

  cpRoll = ()=>{
    if( this.state.dice.length ) return;

    this.setState({ dice: [ Math.random()*6 +1, Math.random()*6 +1 ].map(Math.floor) }, ()=>{
      if( this.state.dice[0] === this.state.dice[1] )
        this.setState({
          dice: [...this.state.dice, ...this.state.dice],
        }, this.cpMove);
      
      else this.cpMove();
    });
  }
  
  cpMove = ()=>{
    const options = calculateBoardOutcomes(this.state);

    if( !options.length ) return this.checkTurnOver();

    const scoredOptions = options.map(option=> ({ score: cpScore(option.board), moves: option.moves }));

    const bestMoves = scoredOptions.sort((a, b)=> (a.score - b.score) * (this.state.cp === 'white' ? 1 : -1 ) )[0].moves;

    for(let i=0; i<(bestMoves.length); i++)
      setTimeout(()=> this.makeMove( bestMoves[i] ), 800 + 900*i);
  }
  
  render() {
    return (
      <div className='game-container'>
        <Board chips={this.state.chips}
               onClick={this.spaceClicked}
               onDoubleClick={this.spaceDoubleClicked}
               selectedChip={this.state.selectedChip}
               whiteJail={this.state.whiteJail} whiteHome={this.state.whiteHome}
               blackJail={this.state.blackJail} blackHome={this.state.blackHome} />

        <div className='dice-container'>
          {!this.state.dice.length ? (
            <button onClick={this.roll}>roll</button>
          ) : (
            <Dice dice={this.state.dice} />
          )}
        </div>
      </div>
    );
  }
}

export default Game;
