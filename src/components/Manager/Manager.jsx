import React, { PureComponent } from 'react';

import { Fps } from '../Fps/Fps';
import { Game } from '../Game/Game';
import { Score } from '../Score/Score';

export class Manager extends PureComponent {

  static defaultProps = {
    displayFps: true
  };

  state = {
    scorePlayer1: 0,
    scorePlayer2: 0,
    startPlayer: 'player1'
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

  render() {
    const { displayFps } = this.props;
    const { scorePlayer1, scorePlayer2, startPlayer } = this.state;

    const managerStyle = {
      position: 'relative'
    };
    const separatorStyle = {
      bottom: 0,
      borderColor: 'white',
      borderStyle: 'dashed',
      borderWidth: '0 2px 0 0',
      left: '50vw',
      position: 'absolute',
      top: 0,
      transform: 'transformX(-1px)',
      width: 0
    };

    return (
      <div style={managerStyle}>
        <Game
          gameKey={`${scorePlayer1}-${scorePlayer2}`}
          onEnd={this.onEnd}
          startPlayer={startPlayer}
        />
        <Score scorePlayer1={scorePlayer1} scorePlayer2={scorePlayer2} />
        <div style={separatorStyle} />
        {displayFps && (<Fps/>)}
      </div>
    );
  }

}
