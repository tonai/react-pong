import { PureComponent } from 'react';

export class IA extends PureComponent {

  componentDidUpdate() {
    const { ballY, oldBallY, playerY, playerHeight, settings } = this.props;

    if (ballY < oldBallY) {
      this.dispatchEvent('keyup', settings.player2Down);
    } else if (ballY > oldBallY) {
      this.dispatchEvent('keyup', settings.player2Up);
    }

    if (ballY < playerY && ballY < oldBallY) {
      this.dispatchEvent('keydown', settings.player2Up);
    } else if (ballY > playerY + playerHeight && ballY > oldBallY) {
      this.dispatchEvent('keydown', settings.player2Down);
    }

    if (ballY > playerY + playerHeight / 2 && ballY <= oldBallY) {
      this.dispatchEvent('keyup', settings.player2Up);
    } else if (ballY < playerY + playerHeight / 2 && ballY >= oldBallY) {
      this.dispatchEvent('keyup', settings.player2Down);
    }
  }

  dispatchEvent(type, code) {
    const event = new Event(type);
    event.code = code;
    window.dispatchEvent(event);
  }

  render() {
    return null;
  }

}
