import React from 'react';

import Board from './Board';
import Dice from './Dice';

import { calculateLegalMoves, calculateBoardAfterMove } from './util';


class Game extends React.Component {

  state = {
    selectedChip: null,
  }

  resetGame = ()=> this.setState({ selectedChip: null }, this.props.resetGame)
  
  spaceClicked = (clicked)=>{
    // if no dice, do nothing (wait for roll)
    if( !this.props.dice.length ) return;

    const { legalMoves } = this.props;

    // if turn is in jail
    if( this.props[ this.props.turn + 'Jail' ] ){
      const clickMove = legalMoves.find(({ moveFrom, moveTo }) => (
        (moveFrom === this.props.turn + 'Jail') &&
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
    const legalHomeMove = this.props.legalMoves.find(move => (
      (move.moveTo === this.props.turn + 'Home') && (move.moveFrom === clicked)
    ) );
    
    if( legalHomeMove ) this.makeMove( legalHomeMove );
  }

  roll = ()=> {
    if( this.props.dice.length ) return;
    this.props.roll();
  }

  makeMove = (move)=> this.setState({ selectedChip: null }, ()=>{
    const nextBoard = calculateBoardAfterMove(this.props, move);
    const nextLegalMoves = calculateLegalMoves(nextBoard);
    
    this.props.updateBoard({ ...nextBoard, legalMoves: nextLegalMoves });

    if( !nextLegalMoves.length ) this.props.onTurnChange();
  })

  componentDidUpdate(prevProps){
    if( this.props.whiteHome === 15 ){
      console.log('white wins');
      return this.props.resetGame();
    }
    
    if( this.props.blackHome === 15 ){
      console.log('black wins');
      return this.props.resetGame();
    }

    if(
      (prevProps.turn !== this.props.cp) &&
      (this.props.turn === this.props.cp) &&
      !this.props.dice.length
    )
      this.props.roll();

    if(
      (this.props.dice.length && !prevProps.dice.length && this.props.turn ) ||
      (!prevProps.turn && this.props.turn)
    )
      ( this.props.turn === this.props.cp ) ? (
        this.props.cpMove()
      ) : (
        this.props.updateBoard({ legalMoves: calculateLegalMoves(this.props) })
      );
  }  
  
  render() {
    return (
      <div className='game-container'>
        <Board chips={this.props.chips}
               onClick={this.spaceClicked}
               onDoubleClick={this.spaceDoubleClicked}
               selectedChip={this.state.selectedChip}
               whiteJail={this.props.whiteJail} whiteHome={this.props.whiteHome}
               blackJail={this.props.blackJail} blackHome={this.props.blackHome} />

        <div className='dice-container'>
          {!this.props.dice.length ? (
            <button onClick={this.roll}>roll</button>
          ) : (
            <Dice dice={this.props.dice} />
          )}
        </div>
      </div>
    );
  }
}

export default Game;
