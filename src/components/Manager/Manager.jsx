import React, { PureComponent } from 'react';

import { Game } from '../Game/Game';

export class Manager extends PureComponent {

  static defaultProps = {
    displayFps: true
  };

  state = {
    frames: [],
    scorePlayer1: 0,
    scorePlayer2: 0,
    startPlayer: 'player1'
  };

  onEachStep = time => {
    this.setState(state => {
      const frames = state.frames.filter(frame => frame > time - 1000);
      frames.push(time);
      return { frames };
    });
  };

  onEnd = winner => {
    if (winner === 'player1') {
      this.setState(state => ({
        scorePlayer1: state.scorePlayer1 + 1,
        startPlayer: 'player2'
      }));
    } else {
      this.setState(state => ({
        scorePlayer2: state.scorePlayer2 + 1,
        startPlayer: 'player1'
      }));
    }
  };

  step = (time) => {
    this.onEachStep(time);
    requestAnimationFrame(this.step);
  };

  componentDidMount() {
    const { displayFps } = this.props;
    if (displayFps) {
      requestAnimationFrame(this.step);
    }
  }

  render() {
    const { displayFps } = this.props;
    const { frames, scorePlayer1, scorePlayer2, startPlayer } = this.state;

    const managerStyle = {
      position: 'relative'
    };
    const counterStyle = {
      color: 'white',
      left: '10px',
      position: 'absolute',
      top: '10px'
    };

    return (
      <div style={managerStyle}>
        <Game
          gameKey={`${scorePlayer1}-${scorePlayer2}`}
          onEnd={this.onEnd}
          startPlayer={startPlayer}
        />
        {displayFps && (<div style={counterStyle}>{frames.length}</div>)}
      </div>
    );
  }

}
