import React, { PureComponent } from 'react';

export class Score extends PureComponent {

  fillArray(score) {
    const array = [];
    array[0] = score !== 1 && score !== 4;
    array[1] = score !== 1 && score !== 2 && score !== 3 && score !== 7;
    array[2] = score !== 5 && score !== 6;
    array[3] = score !== 0 && score !== 1 && score !== 7;
    array[4] = score === 0 || score === 2 || score === 6 || score === 8;
    array[5] = score !== 2;
    array[6] = score !== 1 && score !== 4 && score !== 7;
    return array;
  }

  render() {
    const { scorePlayer1, scorePlayer2 } = this.props;

    const player1ScoreStyle = {
      height: '18vh',
      left: '25vw',
      position: 'absolute',
      top: '5vh',
      transform: 'translateX(-50%)',
      width: '10vh',
    };
    const player2ScoreStyle = {
      height: '18vh',
      position: 'absolute',
      right: '25vw',
      top: '5vh',
      transform: 'translateX(-50%)',
      width: '10vh',
    };
    const pathStyle = {
      stroke: 'white',
      strokeWidth: '0.1px',
      transition: 'fill 400ms'
    };

    const fill1 = this.fillArray(scorePlayer1);
    const fill2 = this.fillArray(scorePlayer2);

    return (
      <div>
        <svg style={player1ScoreStyle} viewBox="0 0 10 18">
          <path style={pathStyle} d="M1,1 L2,0 8,0 9,1 8,2 2,2 Z" fill={fill1[0] ? 'white' : 'transparent'} />
          <path style={pathStyle} d="M1,1 L2,2 2,8 1,9 0,8 0,2 Z" fill={fill1[1] ? 'white' : 'transparent'} />
          <path style={pathStyle} d="M9,1 L10,2 10,8 9,9 8,8 8,2 Z" fill={fill1[2] ? 'white' : 'transparent'} />
          <path style={pathStyle} d="M1,9 L2,8 8,8 9,9 8,10 2,10 Z" fill={fill1[3] ? 'white' : 'transparent'} />
          <path style={pathStyle} d="M1,9 L2,10 2,16 1,17 0,16 0,10 Z" fill={fill1[4] ? 'white' : 'transparent'} />
          <path style={pathStyle} d="M9,9 L10,10 10,16 9,17 8,16 8,10 Z" fill={fill1[5] ? 'white' : 'transparent'} />
          <path style={pathStyle} d="M1,17 L2,16 8,16 9,17 8,18 2,18 Z" fill={fill1[6] ? 'white' : 'transparent'} />
        </svg>
        <svg style={player2ScoreStyle} viewBox="0 0 10 18">
          <path style={pathStyle} d="M1,1 L2,0 8,0 9,1 8,2 2,2 Z" fill={fill2[0] ? 'white' : 'transparent'} />
          <path style={pathStyle} d="M1,1 L2,2 2,8 1,9 0,8 0,2 Z" fill={fill2[1] ? 'white' : 'transparent'} />
          <path style={pathStyle} d="M9,1 L10,2 10,8 9,9 8,8 8,2 Z" fill={fill2[2] ? 'white' : 'transparent'} />
          <path style={pathStyle} d="M1,9 L2,8 8,8 9,9 8,10 2,10 Z" fill={fill2[3] ? 'white' : 'transparent'} />
          <path style={pathStyle} d="M1,9 L2,10 2,16 1,17 0,16 0,10 Z" fill={fill2[4] ? 'white' : 'transparent'} />
          <path style={pathStyle} d="M9,9 L10,10 10,16 9,17 8,16 8,10 Z" fill={fill2[5] ? 'white' : 'transparent'} />
          <path style={pathStyle} d="M1,17 L2,16 8,16 9,17 8,18 2,18 Z" fill={fill2[6] ? 'white' : 'transparent'} />
        </svg>
      </div>
    );
  }

}
