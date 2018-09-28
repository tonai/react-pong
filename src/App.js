import React, { Component } from 'react';

import { Game } from './components/Game/Game';

class App extends Component {
  state = {
    frames: []
  };

  onEachStep = time => {
    this.setState(state => {
      const frames = state.frames.filter(frame => frame > time - 1000);
      frames.push(time);
      return { frames };
    });
  };

  render() {
    const { frames } = this.state;
    console.log(frames.length);

    const appStyle = {
      position: 'relative'
    };
    const counterStyle = {
      color: 'white',
      left: '10px',
      position: 'absolute',
      top: '10px'
    };

    return (
      <div style={appStyle}>
        <Game onEachStep={this.onEachStep}/>
        <div style={counterStyle}>{frames.length}</div>
      </div>
    );
  }
}

export default App;
