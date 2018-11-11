import React, { PureComponent } from 'react';

import { Ball } from '../Ball/Ball';
import { Player, PLAYER_LEFT, PLAYER_RIGHT } from '../Player/Player';

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
    ballSpeed: 0.5,
    ballAcceleration: 0.01,
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
    contact: 0
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
        return;

      case settings.player1Down:
        this.player1Down = true;
        return;

      case settings.player2Up:
        this.player2Up = true;
        return;

      case settings.player2Down:
        this.player2Down = true;
        return;

      case settings.player1Launch:
        if (startPlayer === 'player1') {
          this.stage = 'start';
        }
        return;

      case settings.player2Launch:
        if (startPlayer === 'player2') {
          this.stage = 'start';
        }
        return;

      default:
        return;
    }
  };

  keyUp = (e) => {
    const { settings } = this.props;

    switch (e.code) {
      case settings.player1Up:
        this.player1Up = false;
        return;

      case settings.player1Down:
        this.player1Down = false;
        return;

      case settings.player2Up:
        this.player2Up = false;
        return;

      case settings.player2Down:
        this.player2Down = false;
        return;

      default:
        return;
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
    const { pause } = this.props;

    if (this.time) {
      const delta = time - this.time;
      this.setState(this.getState.bind(this, delta));
    }

    this.time = time;
    if (this.stage !== 'end' && !pause && this.state.contact < 1) {
      requestAnimationFrame(this.step);
    } else {
      this.time = null;
    }
  };

  constructor(props) {
    super(props);
    this.resize();
    this.state.ballSpeed = props.ballSpeed;
    this.state.player1Y = 50 - props.player1Height / 2;
    // this.state.player2Y = 50 - props.player2Height / 2;
    this.state.player2Y = 51.6793;
  }

  checkCollision(state, newState, delta) {
    const { player1Height, player2Height, playerWidth, playerOffset } = this.props;
    const { ballAngle, ballSpeed, ballX, ballY, player1Y, player2Y } = state;

    newState.ballAngle = ballAngle;
    newState.ballX = Math.cos(ballAngle) * ballSpeed * delta + ballX;
    newState.ballY = Math.sin(ballAngle) * ballSpeed * delta + ballY;

    const collisions = [];

    // Collision with top or bottom sides.
    collisions[0] = this.getWindowCollision(state, newState, 0);
    collisions[1] = this.getWindowCollision (state, newState, this.windowHeight);

    // Collision with player1.
    collisions[2] = this.getPlayerCollision(
      state,
      newState,
      playerOffset * this.windowWidth / 100 + playerWidth * this.windowHeight / 100 - this.r1,
      player1Y * this.windowHeight / 100 + player1Height * this.windowHeight / 100 / 2,
      newState.player1Y * this.windowHeight / 100 + player1Height * this.windowHeight / 100 / 2,
      this.r1,
      player1Y * this.windowHeight / 100,
      player1Height * this.windowHeight / 100
    );

    // Collision with player2.
    collisions[3] = this.getPlayerCollision(
      state,
      newState,
      this.windowWidth - playerOffset * this.windowWidth / 100 - playerWidth * this.windowHeight / 100 + this.r2,
      player2Y * this.windowHeight / 100 + player2Height * this.windowHeight / 100 / 2,
      newState.player2Y * this.windowHeight / 100 + player2Height * this.windowHeight / 100 / 2,
      this.r2,
      player2Y * this.windowHeight / 100,
      player2Height * this.windowHeight / 100
    );

    const hasCollision = collisions.some(collision => collision.n !== Infinity);
    if (hasCollision) {
      const { ballAngle, ballX, ballY, n } = collisions.reduce((acc, collision) => {
        if (collision.n < acc.n) {
          acc = collision;
        }
        return acc;
      }, { n: Infinity });
      state.ballAngle = ballAngle;
      state.ballX = ballX;
      state.ballY = ballY;
      this.checkCollision(state, newState, delta * (1 - n))
    }
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

  getState(delta, state) {
    const { ballAcceleration, ballWidth, player1Height, player1Speed, player2Height, player2Speed, playerWidth, playerOffset } = this.props;
    const { ballSpeed, player1Y, player2Y } = state;
    const newState = {};

    if (state.contact) {
      newState.contact = state.contact + 1;
    }

    if (this.player1Down && !this.player1Up) {
      newState.player1Y = Math.min(player1Y + delta * player1Speed, 100 - player1Height);
    } else if (!this.player1Down && this.player1Up) {
      newState.player1Y = Math.max(player1Y - delta * player1Speed, 0);
    } else {
      newState.player1Y = player1Y;
    }

    if (this.player2Down && !this.player2Up) {
      newState.player2Y = Math.min(player2Y + delta * player2Speed, 100 - player2Height);
    } else if (!this.player2Down && this.player2Up) {
      newState.player2Y = Math.max(player2Y - delta * player2Speed, 0);
    } else {
      newState.player2Y = player2Y;
    }

    if (this.stage === 'start') {
      this.checkCollision({...state}, newState, delta);
      
      // Collision with left or right sides.
      if (newState.ballX <= 0) {
        this.onEnd('player2');
        newState.ballSpeed =  this.props.ballSpeed;
      } else
      if (newState.ballX >= this.maxWidth) {
        this.onEnd('player1');
        newState.ballSpeed =  this.props.ballSpeed;
      } else {
        newState.ballSpeed =  ballSpeed + ballAcceleration * delta / 1000;
      }
    } else if (this.stage === 'init') {
      if (this.props.startPlayer === 'player1') {
        newState.ballX = playerOffset * this.windowWidth / 100 + playerWidth * this.windowHeight / 100;
        newState.ballY = (newState.player1Y + player1Height / 2 - ballWidth / 2) * this.windowHeight / 100;
        newState.ballAngle = Math.PI / 6;
      } else {
        newState.ballX = this.windowWidth - playerOffset * this.windowWidth / 100 - playerWidth * this.windowHeight / 100 - ballWidth * this.windowHeight / 100;
        newState.ballY = (newState.player2Y + player2Height / 2 - ballWidth / 2) * this.windowHeight / 100;
        newState.ballAngle = 5 * Math.PI / 6;
      }
    }
    
    // Save previous state.
    newState.oldState = state;
    newState.oldOldState = state.oldState;
    newState.oldOldOldState = state.oldOldState;

    return newState;
  }

  getContactPointWithCircle(pX1, pY1, pX2, pY2, pR, bX1, bY1, bX2, bY2, bR, leftToRight) {
    // Input data :
    // Player start center point = pX1,pY1
    // Player end center point = pX2,pY2
    // Player radius = pR
    // Ball start center point = bX1,bY1
    // Ball end center point = bX2,bY2
    // Ball radius = bR
    // Ball direction = leftToRight

    // Unknowns :
    // Ball contact center point = bX,bY
    // Player contact center point = pX,pY

    // Variables :
    const R = bR + pR;
    const A = (bY2 - bY1) / (bX2 - bX1);
    const B = bY1 - (bY2 - bY1) / (bX2 - bX1) * bX1;

    // Equations :
    // EQ1 : R^2 = (bX - pX)^2 + (bY - pY)^2
    // EQ2 : bY = A * bX + B
    // EQ3 : pX = pX1 = pX2
    // EQ4 : (pY2 - pY1) * n = pY2 - pY
    // EQ5 : (bX2 - bX1) * n = bX2 - bX
    // EQ5 : (bY2 - bY1) * n = bY2 - bY

    // bX :
    // R^2 = (bX - pX1)^2 + (A * bX + B + (pY2 - pY1) * (bX2 - bX) / (bX2 - bX1) - pY2)^2
    // R^2 = (bX - pX1)^2 + (C * bX + D)^2

    // Variables :
    const C = A - (pY2 - pY1) / (bX2 - bX1);
    const D = B + (pY2 - pY1) / (bX2 - bX1) * bX2 - pY2

    // bX :
    // R^2 = bX^2 - 2 * pX1 * bX + pX1^2 + C^2 * bX^2 + 2 * C * D * bX + D^2
    // (1 + C^2) * bX^2 + 2 * (C * D - pX1) * bX + pX1^2 + D^2 - R^2 = 0

    // Variables :
    const a = 1 + Math.pow(C, 2);
    const b = 2 * (C * D - pX1);
    const c = Math.pow(pX1, 2) + Math.pow(D, 2) - Math.pow(R, 2);
    const delta = Math.pow(b, 2) - 4 * a * c;

    let bX;
    if (leftToRight > 0) {
      bX = (- b - Math.sqrt(delta)) / 2 / a;
    } else {
      bX = (- b + Math.sqrt(delta)) / 2 / a;
    }
    const bY = A * bX + B;
    const n = (bX2 - bX) / (bX2 - bX1);
    const pX = pX1;
    const pY = pY2 - (pY2 - pY1) * n;

    return { bX, bY, n: 1 - n, pX, pY };
  }

  getContactPointWithHLine(y, bX1, bY1, bX2, bY2, bR, bottomToTop) {
    // Input data :
    // Horizontal line equation = y
    // Ball start center point = bX1,bY1
    // Ball end center point = bX2,bY2
    // Ball radius = bR
    // Ball direction = bottomToTop

    // Unknowns :
    // Ball contact center point = bX,bY

    // Variables :
    const A = (bY2 - bY1) / (bX2 - bX1);
    const B = bY1 - (bY2 - bY1) / (bX2 - bX1) * bX1;

    // Equations :
    // EQ1 : bY = y - bR * bottomToTop
    // EQ2 : bY = A * bX + B
    // EQ3 : (bX2 - bX1) * n = bX2 - bX
    // EQ4 : (bY2 - bY1) * n = bY2 - bY

    const bY = y - bR * bottomToTop;
    const bX = (bY - B) / A;
    const n = (bX2 - bX) / (bX2 - bX1);

    return { bX, bY, n };
  }

  getPlayerCollision(state, newState, pX1, pY1, pY2, radius, playerY, playerHeight) {
    const { ballWidth } = this.props;
    const { ballX: x1, ballY: y1 } = state;
    const { ballX: x2, ballY: y2 } = newState;

    const ballRadius = ballWidth / 2 * this.windowHeight / 100;

    const bX1 = x1 + ballRadius;
    const bY1 = y1 + ballRadius;
    const dx1 = bX1 - pX1;
    const dy1 = bY1 - pY1;
    const d1 = Math.sqrt(Math.pow(dx1, 2) + Math.pow(dy1, 2));

    const bX2 = x2 + ballRadius;
    const bY2 = y2 + ballRadius;
    const dx2 = bX2 - pX1;
    const dy2 = bY2 - pY2;
    const d2 = Math.sqrt(Math.pow(dx2, 2) + Math.pow(dy2, 2));

    // Check if collision.
    if (d1 - ballRadius - radius > 0 && d2 - ballRadius - radius <= 0) {
      const { bX, bY, n, pX, pY } = this.getContactPointWithCircle(pX1, pY1, pX1, pY2, radius, bX1, bY1, bX2, bY2, ballRadius, (bX2 - bX1) / Math.abs(bX2 - bX1));

      // Continue if contact point is inside the player arc.
      if (bY >= playerY - ballRadius && bY <= playerY + playerHeight + ballRadius) {
        // Calculate new ball angle.
        const contactAngle = Math.atan((bY - pY) / (bX - pX));
        const incidenceAngle = state.ballAngle - contactAngle;
        const newBallAngle = state.ballAngle + Math.PI - 2 * incidenceAngle;

        // Set state.
        return {
          ballAngle: newBallAngle,
          ballX: bX - ballRadius,
          ballY: bY - ballRadius,
          n
        }
      }
    }

    return { n: Infinity };
  }

  getWindowCollision(state, newState, y) {
    const { ballWidth } = this.props;
    const { ballX: x1, ballY: y1 } = state;
    const { ballX: x2, ballY: y2 } = newState;

    const ballRadius = ballWidth / 2 * this.windowHeight / 100;
    const bX1 = x1 + ballRadius;
    const bY1 = y1 + ballRadius;
    const bX2 = x2 + ballRadius;
    const bY2 = y2 + ballRadius;

    const { bX, bY, n } = this.getContactPointWithHLine(y, bX1, bY1, bX2, bY2, ballRadius, (bY2 - bY1) / Math.abs(bY2 - bY1));

    if (n > 0 && n < 1) {
      // newState.contact = 1;
      return {
        ballAngle: - state.ballAngle,
        ballX: bX - ballRadius,
        ballY: bY - ballRadius,
        n
      };
    }

    return { n: Infinity };
  }

  init() {
    this.stage = 'init';
    requestAnimationFrame(this.step);
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
      overflow: 'hidden',
      position: 'relative',
      width: '100vw',
      height: '100vh',
    };

    return (
      <div style={gameStyle}>
        <Player color="white" playerHeight={player1Height} playerOffset={playerOffset} playerWidth={playerWidth} playerY={player1Y} position={PLAYER_LEFT} radius={this.r1} windowHeight={this.windowHeight} />
        <Player color="white" playerHeight={player2Height} playerOffset={playerOffset} playerWidth={playerWidth} playerY={player2Y} position={PLAYER_RIGHT} radius={this.r2} windowHeight={this.windowHeight} />
        {this.state.oldOldOldState && (<Ball ballWidth={ballWidth} ballY={this.state.oldOldOldState.ballY} ballX={this.state.oldOldOldState.ballX} color="white" opacity="0.2" />)}
        {this.state.oldOldState && (<Ball ballWidth={ballWidth} ballY={this.state.oldOldState.ballY} ballX={this.state.oldOldState.ballX} color="white" opacity="0.4" />)}
        {this.state.oldState && (<Ball ballWidth={ballWidth} ballY={this.state.oldState.ballY} ballX={this.state.oldState.ballX} color="white" opacity="0.6" />)}
        <Ball ballWidth={ballWidth} ballY={ballY} ballX={ballX} color="white" />
      </div>
    );
  }

}
