import React, { PureComponent } from 'react';

export class Game extends PureComponent {

  static defaultProps = {
    playerWidth: 1,
    playerOffset: 5,
    player1Height: 10,
    player1Speed: 0.1,
    player2Height: 10,
    player2Speed: 0.1,
    ballWidth: 2,
  };

  state = {
    player1Y: 0,
    player2Y: 0,
    ballX: 0,
    ballY: 0,
    ballSpeed: 0,
    ballAngle: 0,
    winner: false,
  };

  player1Up = false;
  player1Down = false;
  player2Up = false;
  player2Down = false;

  time = null;
  start = 'player1';
  windowWidth = 0;
  windowHeight = 0;
  maxWidth = 0;
  maxHeight = 0;

  keyDown = (e) => {
    console.log(e.code);
    switch (e.code) {
      case 'KeyW':
        return this.player1Up = true;

      case 'KeyS':
        return this.player1Down = true;

      case 'ArrowUp':
        return this.player2Up = true;

      case 'ArrowDown':
        return this.player2Down = true;

      case 'Space':
      case 'Enter':
        return this.start = true;
    }
  };

  keyUp = (e) => {
    switch (e.code) {
      case 'KeyW':
        return this.player1Up = false;

      case 'KeyS':
        return this.player1Down = false;

      case 'ArrowUp':
        return this.player2Up = false;

      case 'ArrowDown':
        return this.player2Down = false;
    }
  };

  resize = () => {
    const { ballWidth } = this.props;
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.maxWidth = window.innerWidth - ballWidth * window.innerHeight / 100;
    this.maxHeight = window.innerHeight - ballWidth * window.innerHeight / 100;
  };

  step = (time) => {
    if (this.time) {
      const { player1Height, player1Speed, player2Height, player2Speed } = this.props;
      const delta = time - this.time;

      if (this.player1Down && !this.player1Up) {
        this.setState(state => ({ player1Y: Math.min(state.player1Y + delta * player1Speed, 100 - player1Height) }));
      } else if (!this.player1Down && this.player1Up) {
        this.setState(state => ({ player1Y: Math.max(state.player1Y - delta * player1Speed, 0) }));
      }

      if (this.player2Down && !this.player2Up) {
        this.setState(state => ({ player2Y: Math.min(state.player2Y + delta * player2Speed, 100 - player2Height) }));
      } else if (!this.player2Down && this.player2Up) {
        this.setState(state => ({ player2Y: Math.max(state.player2Y - delta * player2Speed, 0) }));
      }

      this.setState(this.getBallPosition.bind(this, delta));
    }
    this.time = time;
    requestAnimationFrame(this.step);
  };

  componentDidMount() {
    this.resize();
    window.addEventListener('keydown', this.keyDown);
    window.addEventListener('keyup', this.keyUp);
    window.addEventListener('resize', this.resize);
    requestAnimationFrame(this.step);
  }

  getBallPosition(delta, state) {
    switch (this.start) {
      case 'player1': {
        const { ballWidth, player1Height } = this.props;
        const { player1Y } = state;
        return {
          ballX: 6 * this.windowWidth / 100,
          ballY: (player1Y + player1Height / 2 - ballWidth / 2) * this.windowHeight / 100,
          ballSpeed: 0.1,
          ballAngle: Math.PI / 6,
        };
      }

      case 'player2': {
        const { ballWidth, player2Height } = this.props;
        const { player2Y } = state;
        return {
          ballX: 94 * this.windowWidth  / 100,
          ballY: (player2Y + player2Height / 2 - ballWidth / 2) * this.windowHeight / 100,
          ballSpeed: 0.1,
          ballAngle: 5 * Math.PI / 6,
        };
      }

      case true: {
        const { playerWidth, playerOffset } = this.props;
        const { ballX, ballY, ballAngle, ballSpeed } = state;

        const newState = {};
        newState.ballX = (Math.cos(ballAngle) * ballSpeed * delta) * this.windowWidth / 100 + ballX;
        newState.ballX = Math.max(Math.min(newState.ballX, this.maxWidth), 0);
        newState.ballY = (Math.sin(ballAngle) * ballSpeed * delta)  * this.windowHeight / 100 + ballY;

        // Collision with top or bottom sides.
        if (newState.ballY < 0) {
          newState.ballY = - newState.ballY;
          newState.ballAngle = - ballAngle;
        } else if (newState.ballY > this.maxHeight) {
          newState.ballY = 2 * this.maxHeight - newState.ballY;
          newState.ballAngle = - ballAngle;
        }

        // Collision with player1.
        if (ballX > (playerWidth + playerOffset) * this.windowWidth / 100 && newState.ballX <= (playerWidth + playerOffset) * this.windowWidth / 100) {
          newState.ballX = 2 * (playerWidth + playerOffset) * this.windowWidth / 100 - newState.ballX;
          newState.ballAngle = Math.PI - ballAngle;
        }

        // Collision with player2.
        if (ballX < (100 - playerWidth - playerOffset) * this.windowWidth / 100 && newState.ballX >= (100 - playerWidth - playerOffset) * this.windowWidth / 100) {
          newState.ballX = 2 * (100 - playerWidth - playerOffset) * this.windowWidth / 100 - newState.ballX;
          newState.ballAngle = Math.PI - ballAngle;
        }

        // Collision with left or right sides.
        if (ballX <= 0) {
          this.start = false;
          newState.winner = 'player2';
        } else
        if (ballX >= this.maxWidth) {
          this.start = false;
          newState.winner = 'player1';
        }

        return newState;
      }
    }
  }

  render() {
    const { ballWidth, playerOffset, playerWidth, player1Height, player2Height } = this.props;
    const { ballX, ballY, player1Y, player2Y, winner } = this.state;
    const gameStyle = {
      background: winner === 'player1' ? 'green' :  winner === 'player2' ? 'red' : 'black',
      position: 'relative',
      width: '100vw',
      height: '100vh',
    };
    const player1Style = {
      backgroundColor: 'white',
      position: 'absolute',
      top: `${player1Y}vh`,
      left: `${playerOffset}vw`,
      width: `${playerWidth}vw`,
      height: `${player1Height}vh`,
      //borderRadius: '0 50% 50% 0',
    };
    const player2Style = {
      backgroundColor: 'white',
      position: 'absolute',
      top: `${player2Y}vh`,
      right: `${playerOffset}vw`,
      width: `${playerWidth}vw`,
      height: `${player2Height}vh`,
      //borderRadius: '50% 0 0 50%',
    };
    const ballStyle = {
      backgroundColor: 'white',
      position: 'absolute',
      top: ballY,
      left: ballX,
      width: `${ballWidth}vh`,
      height: `${ballWidth}vh`,
      borderRadius: '50%',
    };

    return (
      <div style={gameStyle}>
        <div style={player1Style}/>
        <div style={player2Style}/>
        <div style={ballStyle}/>
      </div>
    );
  }

}