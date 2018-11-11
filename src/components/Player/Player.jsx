import React, { PureComponent } from 'react';

export const PLAYER_LEFT = 'PLAYER_LEFT';
export const PLAYER_RIGHT = 'PLAYER_RIGHT';

export class Player extends PureComponent {

  static defaultProps = {
    opacity: 1
  };

  render() {
    const { color, opacity, playerHeight, playerOffset, playerWidth, playerY, position, radius, windowHeight } = this.props;

    const playerStyle = {
      position: 'absolute',
      top: `${playerY}vh`,
      width: `${playerWidth}vh`,
      height: `${playerHeight}vh`,
    };

    if (position === PLAYER_LEFT) {
      playerStyle.left = `${playerOffset}vw`;
      return (
        <svg style={playerStyle} viewBox={`0 0 ${playerWidth} ${playerHeight}`}>
          <path d={`M 0,0 A ${radius * 100 / windowHeight},${radius * 100 / windowHeight} 0 0,1 0,${playerHeight} z`} fill={color} fillOpacity={opacity} />
        </svg>
      );
    } else if (position === PLAYER_RIGHT) {
      playerStyle.right = `${playerOffset}vw`;
      return (
        <svg style={playerStyle} viewBox={`0 0 ${playerWidth} ${playerHeight}`}>
          <path d={`M ${playerWidth},0 A ${radius * 100 / windowHeight},${radius * 100 / windowHeight} 1 0,0 ${playerWidth},${playerHeight} z`} fill={color} fillOpacity={opacity} />
        </svg>
      );
    }

    return null;
  }

}
