import React from 'react';
import './App.css';

import Game from './Game';

import { initBoard } from './util';

class App extends React.Component {

  state = {
    localPlayer: 'black',
    localUser: 'nik',
    menuOpen: false,
    games: [],
    game: {
      id: null,
      board: {
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
    }
  }

  toggleMenu = ()=> this.setState({ menuOpen: !this.state.menuOpen })

  componentDidMount(){
    fetch('/game')
      .then(response => response.json())
      .then(({ games })=> this.setState({ games }));
  }

  selectGame = game => {
    const playerPosition = game.players.indexOf( this.state.localUser );
    if( playerPosition === 0 )
      this.setState({ game, localPlayer: 'black' });

    if( playerPosition === 1 )
      this.setState({ game, localPlayer: 'white' });
  }

  updateBoard = board=> {

    if( board.turn === this.state.localPlayer ){
      clearInterval( this.polling );
      this.polling = null;

    } else if( !this.polling ){
      this.polling = setInterval(this.loadCurrentGame, 800);
    }

    this.setState({ game: { ...this.state.game, board } });

    // later, send the update to the server
    fetch('/game/'+this.state.game.id, {
      body: JSON.stringify({ board }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    }).then(response => response.json())
      .then(message => console.log(message));
  }

  loadCurrentGame = ()=>
    fetch('/game/'+this.state.game.id)
      .then(response => response.json())
      .then(({ game })=> this.setState({
        game: { ...this.state.game, board: game.board }
      }))

  setLocalUser = e=> this.setState({ localUser: e.target.value })

  render(){
    return (
      <div className='App'>
        <Game board={this.state.game.board}
              onChange={this.updateBoard}
              localPlayer={this.state.localPlayer}
              mode='2p-remote' />
        <button className='menu-toggler' onClick={this.toggleMenu}>Menu</button>
        <div className={'sidenav '+(this.state.menuOpen ? 'open':'closed')}>
          <label>
            nickname
            <input value={this.state.localUser} onChange={this.setLocalUser} />
          </label>

          <ul className='games-list'>{
            this.state.games.map(game=> (
              <li key={game.id}
                  className={this.state.game.id === game.id ? 'selected' : ''}
                  onClick={()=> this.selectGame(game)}>
                {game.players}
                {game.game}
              </li>
            ))
          }</ul>
        </div>
      </div>
    );
  }
};

export default App;
