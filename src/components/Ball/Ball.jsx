import React, { PureComponent } from 'react';

export class Ball extends PureComponent {

  static defaultProps = {
    opacity: 1
  };

  render() {
    const { ballWidth, ballX, ballY, color, opacity } = this.props;

    const ballStyle = {
      backgroundColor: color,
      position: 'absolute',
      top: ballY,
      left: ballX,
      width: `${ballWidth}vh`,
      height: `${ballWidth}vh`,
      borderRadius: '50%',
      opacity: opacity
    };

    return <div style={ballStyle}/>;
  }

}
