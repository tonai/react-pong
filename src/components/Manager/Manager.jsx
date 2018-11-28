import React, { PureComponent } from 'react';

import { PLAYER_LEFT, PLAYER_RIGHT } from '../../config/players';

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
    startPlayer: PLAYER_LEFT,
    winner: false
  };

  onClick = () => {
    this.setState({
      scorePlayer1: 0,
      scorePlayer2: 0,
      startPlayer: PLAYER_LEFT,
      winner: false
    });
  };

  onEnd = winner => {
    const { settings: { firstTo } } = this.props;

    if (winner === PLAYER_LEFT) {
      this.setState(state => {
        const scorePlayer1 = state.scorePlayer1 + 1;
        if (scorePlayer1 < firstTo) {
          return {
            scorePlayer1,
            startPlayer: PLAYER_RIGHT
          };
        }
        return {
          scorePlayer1,
          winner: PLAYER_LEFT
        }
      });
    } else {
      this.setState(state => {
        const scorePlayer2 = state.scorePlayer2 + 1;
        if (scorePlayer2 < firstTo) {
          return {
            scorePlayer2,
            startPlayer: PLAYER_LEFT
          };
        }
        return {
          scorePlayer2,
          winner: PLAYER_RIGHT
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
        {winner === PLAYER_LEFT && (
          <div className="Manager__win">Player 1 win</div>
        )}
        {winner === PLAYER_RIGHT && (
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
