import React from 'react';
import './App.css';

import Board from './Board';
import Dice from './Dice';

import { initBoard, calculateLegalMoves, calculateBoardAfterMove } from './util';


class App extends React.Component {

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
  

  spaceDoubleClicked = (index)=> {
    return;
    //// if it's a doubleClick & chip can go home, makeMove(go home)

    const legalHomeMoves = calculateLegalMoves(
      this.state.chips, this.state.dice, this.state.turn,
      this.state.whiteJail, this.state.blackJail
    ).filter(move => (
      (move.moveTo === this.state.turn + 'Home') && (move.moveFrom === index)
    ) );
    
    if( legalHomeMoves.length ){

      let usedDie = this.state.turn === 'black' ? 24 - index : index + 1;

      if( !~this.state.dice.indexOf(usedDie) )
        usedDie = this.state.dice.find(die => die > usedDie);
      
      
      this.setState({
        selectedChip: null,
        chips: this.state.chips.map((chip, i)=> (
          i !== index
        ) ? chip : (
          this.state.turn === 'white' ? chip + 1 : chip - 1
        )),
        
        dice: [
          ...this.state.dice.slice( 0, this.state.dice.indexOf(usedDie) ),
          ...this.state.dice.slice( this.state.dice.indexOf(usedDie) + 1)
        ],

        [this.state.turn + 'Home']: this.state[ this.state.turn + 'Home' ] + 1,

      }, this.checkTurnOver);
      
    }
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
    if( this.state.whiteHome === 15 ) console.log('white wins');
    if( this.state.blackHome === 15 ) console.log('black wins');

    if( !this.state.legalMoves.length ) setTimeout(()=> this.setState({
      turn: ({ black: 'white', white: 'black' })[this.state.turn],
      dice: [],
    }), 1000* this.state.dice.length);
  }

  render() {
    return (
      <div className="App">
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
      </div>
    );
  }
}

export default App;
