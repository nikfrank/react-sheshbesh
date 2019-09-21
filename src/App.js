import React from 'react';
import './App.css';

import Game from './Game';

import { initBoard } from './util';


class App extends React.Component {
  
  render() {
    return (
      <div className="App">
        <Game />
      </div>
    );
  }
}

export default App;
