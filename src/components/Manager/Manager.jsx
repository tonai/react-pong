import React, { PureComponent } from 'react';

import { Fps } from '../Fps/Fps';
import { Game } from '../Game/Game';
import { Score } from '../Score/Score';

import './Manager.css';

export class Manager extends PureComponent {

  static defaultProps = {
    displayFps: true,
    pause: false,
  };

  state = {
    scorePlayer1: 0,
    scorePlayer2: 0,
    startPlayer: 'player1',
    winner: false
  };

  onClick = () => {
    this.setState({
      scorePlayer1: 0,
      scorePlayer2: 0,
      startPlayer: 'player1',
      winner: false
    });
  };

  onEnd = winner => {
    const { settings: { firstTo } } = this.props;

    if (winner === 'player1') {
      this.setState(state => {
        const scorePlayer1 = state.scorePlayer1 + 1;
        if (scorePlayer1 < firstTo) {
          return {
            scorePlayer1,
            startPlayer: 'player2'
          };
        }
        return {
          scorePlayer1,
          winner: 'player1'
        }
      });
    } else {
      this.setState(state => {
        const scorePlayer2 = state.scorePlayer2 + 1;
        if (scorePlayer2 < firstTo) {
          return {
            scorePlayer2,
            startPlayer: 'player1'
          };
        }
        return {
          scorePlayer2,
          winner: 'player2'
        }
      });
    }
  };

  render() {
    const { displayFps, pause, settings } = this.props;
    const { scorePlayer1, scorePlayer2, startPlayer, winner } = this.state;

    return (
      <div className="Manager">
        <Game
          gameKey={`${scorePlayer1}-${scorePlayer2}`}
          onEnd={this.onEnd}
          pause={pause || winner}
          settings={settings}
          startPlayer={startPlayer}
        />
        <Score scorePlayer1={scorePlayer1} scorePlayer2={scorePlayer2} />
        <div className="Manager__separator" />
        {winner === 'player1' && (
          <div className="Manager__win">Player 1 win</div>
        )}
        {winner === 'player2' && (
          <div className="Manager__win">Player 2 win</div>
        )}
        {winner && (
          <button className="Manager__restart" onClick={this.onClick}>Restart</button>
        )}
        {displayFps && (<Fps/>)}
      </div>
    );
  }

}
