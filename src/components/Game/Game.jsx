import React, { PureComponent } from 'react';

const END_TIMEOUT = 500;

export class Game extends PureComponent {

  static defaultProps = {
    pause: false,
    playerWidth: 2,
    playerOffset: 5,
    player1Height: 10,
    player1Speed: 0.1,
    player2Height: 10,
    player2Speed: 0.1,
    ballWidth: 2,
    ballSpeed: 0.05,
    ballAcceleration: 0.001,
    startPlayer: 'player1',
    gameKey: '0-0',
  };

  state = {
    player1Y: 0,
    player2Y: 0,
    ballX: 0,
    ballY: 0,
    ballSpeed: 0,
    ballAngle: 0,
  };

  player1Up = false;
  player1Down = false;
  player2Up = false;
  player2Down = false;

  r1 = 0;
  r2 = 0;
  windowWidth = 0;
  windowHeight = 0;
  maxWidth = 0;
  maxHeight = 0;

  time = null;
  stage = 'init';

  keyDown = (e) => {
    const { settings, startPlayer } = this.props;

    switch (e.code) {
      case settings.player1Up:
        this.player1Up = true;
        break;

      case settings.player1Down:
        this.player1Down = true;
        break;

      case settings.player2Up:
        this.player2Up = true;
        break;

      case settings.player2Down:
        this.player2Down = true;
        break;

      case settings.player1Launch:
        if (startPlayer === 'player1') {
          this.stage = 'start';
        }
        break;

      case settings.player2Launch:
        if (startPlayer === 'player2') {
          this.stage = 'start';
        }
        break;
    }
  };

  keyUp = (e) => {
    const { settings } = this.props;

    switch (e.code) {
      case settings.player1Up:
        this.player1Up = false;
        break;

      case settings.player1Down:
        this.player1Down = false;
        break;

      case settings.player2Up:
        this.player2Up = false;
        break;

      case settings.player2Down:
        this.player2Down = false;
        break;
    }
  };

  resize = () => {
    const { ballWidth, playerWidth, player1Height, player2Height } = this.props;

    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.maxWidth = window.innerWidth - ballWidth * window.innerHeight / 100;
    this.maxHeight = window.innerHeight - ballWidth * window.innerHeight / 100;

    const a1 = Math.atan(player1Height / 2 / playerWidth);
    const b1 = Math.PI - 2 * a1;
    this.r1 = player1Height / (2 * Math.sin(b1)) * this.windowHeight / 100;

    const a2 = Math.atan(player2Height / 2 / playerWidth);
    const b2 = Math.PI - 2 * a2;
    this.r2 = player2Height / (2 * Math.sin(b2)) * this.windowHeight / 100;
  };

  step = (time) => {
    const { player1Height, player1Speed, player2Height, player2Speed, pause, ballAcceleration } = this.props;

    if (this.time) {
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

      this.setState(this.getBallState.bind(this, delta));
    }

    this.time = time;
    if (this.stage !== 'end' && !pause) {
      requestAnimationFrame(this.step);
    } else {
      this.time = null;
    }
  };

  constructor(props) {
    super(props);
    this.resize();
    this.state.ballSpeed = props.ballSpeed;
  }

  componentDidMount() {
    window.addEventListener('keydown', this.keyDown);
    window.addEventListener('keyup', this.keyUp);
    window.addEventListener('resize', this.resize);
    requestAnimationFrame(this.step);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.gameKey !== this.props.gameKey) {
      this.init();
    }
    if (prevProps.pause && !this.props.pause) {
      requestAnimationFrame(this.step);
    }
  }

  getBallState(delta, state) {
    if (this.stage === 'start') {
      const { ballAcceleration, playerWidth, playerOffset, player1Height, player2Height } = this.props;
      const { ballX, ballY, ballAngle, ballSpeed, player1Y, player2Y } = state;

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
      this.managePlayerCollision(
        state,
        newState,
        playerOffset * this.windowWidth / 100 + playerWidth * this.windowHeight / 100 - this.r1,
        player1Y * this.windowHeight / 100 + player1Height * this.windowHeight / 100 / 2,
        this.r1,
        player1Y * this.windowHeight / 100,
        player1Height * this.windowHeight / 100
      );

      // Collision with player2.
      this.managePlayerCollision(
        state,
        newState,
        this.windowWidth - playerOffset * this.windowWidth / 100 - playerWidth * this.windowHeight / 100 + this.r2,
        player2Y * this.windowHeight / 100 + player2Height * this.windowHeight / 100 / 2,
        this.r2,
        player2Y * this.windowHeight / 100,
        player2Height * this.windowHeight / 100
      );

      // Collision with left or right sides.
      if (ballX <= 0) {
        this.onEnd('player2');
        newState.ballSpeed =  this.props.ballSpeed;
      } else
      if (ballX >= this.maxWidth) {
        this.onEnd('player1');
        newState.ballSpeed =  this.props.ballSpeed;
      } else {
        newState.ballSpeed =  ballSpeed + ballAcceleration * delta / 1000;
      }

      return newState;
    } else if (this.stage === 'init') {
      if (this.props.startPlayer === 'player1') {
        const { ballWidth, playerWidth, playerOffset, player1Height } = this.props;
        const { player1Y } = state;
        return {
          ballX: playerOffset * this.windowWidth / 100 + playerWidth * this.windowHeight / 100,
          ballY: (player1Y + player1Height / 2 - ballWidth / 2) * this.windowHeight / 100,
          ballAngle: Math.PI / 6,
        };
      } else {
        const { ballWidth, playerWidth, playerOffset, player2Height } = this.props;
        const { player2Y } = state;
        return {
          ballX: this.windowWidth - playerOffset * this.windowWidth / 100 - playerWidth * this.windowHeight / 100 - ballWidth * this.windowHeight / 100,
          ballY: (player2Y + player2Height / 2 - ballWidth / 2) * this.windowHeight / 100,
          ballAngle: 5 * Math.PI / 6,
        };
      }
    }
  }

  getContactPoint(A, B, R, cx, cy, dir) {
    // Calculate coordinates of contact point :
    // EQ1 : R^2 = (X-cx)^2 + (Y-cy)^2
    // R = ballRadius+radius
    // EQ2 : Y = A * X + B
    // A = (cy2-cy1)/(cx2-cx1)
    // B = cy1-(cy2-cy1)/(cx2-cx1)*cx1
    // => R^2 = (X-cx)^2 + (A*X+B-cy)^2
    // => R^2 = X^2 - 2*cx*X + cx^2 + A^2*X^2 + 2*A*(B-cy)*X + (B-cy)^2
    // => (1+A^2) * X^2 + 2*(A*(B-cy)-cx) * X + cx^2 + (B-cy)^2 - R^2 = 0

    const a = 1 + Math.pow(A, 2);
    const b = 2 * (A * (B - cy) - cx);
    const c = Math.pow(cx, 2) + Math.pow(B - cy, 2) - Math.pow(R, 2);
    const delta = Math.pow(b, 2) - 4 * a * c;

    let X;
    if (dir > 0) {
      X = (- b - Math.sqrt(delta)) / 2 / a;
    } else {
      X = (- b + Math.sqrt(delta)) / 2 / a;
    }

    return {
      X,
      Y: A * X + B
    };
  }

  init() {
    this.stage = 'init';
    requestAnimationFrame(this.step);
  }

  managePlayerCollision(state, newState, cx, cy, radius, playerY, playerHeight) {
    const { ballWidth } = this.props;
    const { ballX: x1, ballY: y1 } = state;
    const { ballX: x2, ballY: y2 } = newState;

    const ballRadius = ballWidth / 2 * this.windowHeight / 100;

    const cx1 = x1 + ballRadius;
    const cy1 = y1 + ballRadius;
    const dx1 = cx1 - cx;
    const dy1 = cy1 - cy;
    const d1 = Math.sqrt(Math.pow(dx1, 2) + Math.pow(dy1, 2));

    const cx2 = x2 + ballRadius;
    const cy2 = y2 + ballRadius;
    const dx2 = cx2 - cx;
    const dy2 = cy2 - cy;
    const d2 = Math.sqrt(Math.pow(dx2, 2) + Math.pow(dy2, 2));

    // Check if collision.
    if (d1 - ballRadius - radius > 0 && d2 - ballRadius - radius <= 0) {
      // Calculate coordinates of contact point.
      const A = (cy2 - cy1) / (cx2 - cx1);
      const B = cy1 - (cy2 - cy1) / (cx2 - cx1) * cx1;
      const R = ballRadius + radius;
      const { X, Y } = this.getContactPoint(A, B, R, cx, cy, cx1 < cx2);

      // Continue if contact point is inside the player arc.
      if (Y >= playerY - ballRadius && Y <= playerY + playerHeight + ballRadius) {
        // Calculate new ball angle.
        const alpha = Math.atan((Y - cy) / (X - cx));
        const beta = Math.atan((Y - cy2) / (X - cx2));
        const gamma = beta - alpha;
        const ballAngle = state.ballAngle + Math.PI - 2 * gamma;

        // Calculate rebound distance.
        const fullDistance = Math.sqrt(Math.pow(cx2 - cx1, 2) + Math.pow(cy2 - cy1, 2));
        const contactDistance = Math.sqrt(Math.pow(cx2 - X, 2) + Math.pow(cy2 - Y, 2));
        const reboundDistance = fullDistance - contactDistance;

        // Set state.
        newState.ballAngle = ballAngle;
        newState.ballX = X + Math.cos(ballAngle) * reboundDistance - ballRadius;
        newState.ballY = Y + Math.sin(ballAngle) * reboundDistance - ballRadius;
      }
    }
  }

  onEnd(winner) {
    const { onEnd } = this.props;
    this.stage = 'end';
    setTimeout(() => onEnd(winner), END_TIMEOUT);
  }

  render() {
    const { ballWidth, playerOffset, playerWidth, player1Height, player2Height } = this.props;
    const { ballX, ballY, player1Y, player2Y } = this.state;
    const gameStyle = {
      background: 'black',
      position: 'relative',
      width: '100vw',
      height: '100vh',
    };
    const player1Style = {
      position: 'absolute',
      top: `${player1Y}vh`,
      left: `${playerOffset}vw`,
      width: `${playerWidth}vh`,
      height: `${player1Height}vh`,
    };
    const player2Style = {
      position: 'absolute',
      top: `${player2Y}vh`,
      right: `${playerOffset}vw`,
      width: `${playerWidth}vh`,
      height: `${player2Height}vh`,
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
        <svg style={player1Style} viewBox={`0 0 ${playerWidth} ${player1Height}`}>
          <path d={`M 0,0 A ${this.r1 * 100 / this.windowHeight},${this.r1 * 100 / this.windowHeight} 0 0,1 0,${player1Height} z`} fill="white" />
        </svg>
        <svg style={player2Style} viewBox={`0 0 ${playerWidth} ${player1Height}`}>
          <path d={`M ${playerWidth},0 A ${this.r2 * 100 / this.windowHeight},${this.r2 * 100 / this.windowHeight} 1 0,0 ${playerWidth},${player1Height} z`} fill="white" />
        </svg>
        <div style={ballStyle}/>
      </div>
    );
  }

}
