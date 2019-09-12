import React from 'react';
import './App.css';

import Game from './Game';

class App extends React.Component {

  state = { menuOpen: false, games: [] }

  toggleMenu = ()=> this.setState({ menuOpen: !this.state.menuOpen })

  componentDidMount(){
    fetch('http://localhost:4000/game')
      .then(response => response.json())
      .then(({ games })=> this.setState({ games }));
  }

  render(){
    return (
      <div className='App'>
        <Game />
        <button className='menu-toggler' onClick={this.toggleMenu}>Menu</button>
        <div className={'sidenav '+(this.state.menuOpen ? 'open':'closed')}>
          <ul>{
            this.state.games.map(game=> (
              <li key={game.id}>
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
