import React, { PureComponent } from 'react';

import { PLAYER_LEFT, PLAYER_RIGHT } from '../../config/players';

import { getContactPointWithCircle, getContactPointWithHLine, getContactPointWithPoint } from '../../services/collisionManager';

import { Ball } from '../Ball/Ball';
import { IA } from '../IA/IA';
import { Oscillator } from '../Sounds/Oscillator/Oscillator';
import { Player } from '../Player/Player';

const END_TIMEOUT = 500;

export class Game extends PureComponent {

  static defaultProps = {
    ballAcceleration: 0.01,
    ballOffset: 1,
    ballSpeed: 0.5,
    ballWidth: 2,
    gameKey: '0-0',
    pause: false,
    player1Height: 10,
    player1Speed: 0.1,
    player2Height: 10,
    player2Speed: 0.1,
    playerOffset: 5,
    playerWidth: 2,
    startPlayer: PLAYER_LEFT
  };

  state = {
    ballAngle: 0,
    ballSpeed: 0,
    ballX: 0,
    ballY: 0,
    oldOldOldState: null,
    oldOldState: null,
    oldState: null,
    player1Y: 0,
    player2Y: 0,
    sound: null
  };

  player1Up = false;
  player1Down = false;
  player2Up = false;
  player2Down = false;

  player1Touch = null;
  player2Touch = null;
  touches = {};

  r1 = 0;
  r2 = 0;
  windowWidth = 0;
  windowHeight = 0;
  maxWidth = 0;
  maxHeight = 0;

  time = null;
  stage = null;

  handleKeyDown = (event) => {
    const { settings, startPlayer } = this.props;

    switch (event.code) {
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
        if (startPlayer === PLAYER_LEFT && this.stage === 'init') {
          this.stage = 'start';
        }
        return;

      case settings.player2Launch:
        if (startPlayer === PLAYER_RIGHT && this.stage === 'init') {
          this.stage = 'start';
        }
        return;

      default:
        return;
    }
  };

  handleKeyUp = (event) => {
    const { settings } = this.props;

    switch (event.code) {
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

  handlePlayer1Down = (event) => {
    const { pageX, pageY, pointerId } = event;
    const { player1Height, playerOffset, playerWidth, startPlayer } = this.props;
    const { player1Y } = this.state;

    const left = playerOffset * this.windowWidth / 100;
    const top = player1Y * this.windowHeight / 100;
    const width = playerWidth * this.windowHeight / 100;
    const height = player1Height * this.windowHeight / 100;

    if (left <= pageX && left + width >= pageX && top <= pageY && top + height >= pageY)  {
      this.touches[pointerId] = { offsetY: pageY - top, pageY, player: PLAYER_LEFT };
      this.player1Touch = pointerId;
    } else if (pageX < this.windowWidth / 2 && startPlayer === PLAYER_LEFT && this.stage === 'init') {
      this.stage = 'start';
    }
  };

  handlePlayer2Down = (event) => {
    const { pageX, pageY, pointerId } = event;
    const { player2Height, playerOffset, playerWidth, startPlayer } = this.props;
    const { player2Y } = this.state;

    const right = this.windowWidth - playerOffset * this.windowWidth / 100;
    const top = player2Y * this.windowHeight / 100;
    const width = playerWidth * this.windowHeight / 100;
    const height = player2Height * this.windowHeight / 100;

    if (right - width <= pageX && right >= pageX && top <= pageY && top + height >= pageY)  {
      this.touches[pointerId] = { offsetY: pageY - top, pageY, player: PLAYER_RIGHT };
      this.player2Touch = pointerId;
    } else if (pageX > this.windowWidth / 2 && startPlayer === PLAYER_RIGHT && this.stage === 'init') {
      this.stage = 'start';
    }
  };

  handlePlayer1Move = (event) => {
    const { pageY, pointerId } = event;

    const touch = this.touches[pointerId];
    if (touch && touch.player === PLAYER_LEFT) {
      const { player1Y } = this.state;
      const top = player1Y * this.windowHeight / 100;

      if (top + touch.offsetY - pageY > 0 && pageY < touch.pageY) {
        this.player1Down = false;
        this.player1Up = true;
      } else if (top + touch.offsetY - pageY < 0 && pageY > touch.pageY) {
        this.player1Down = true;
        this.player1Up = false;
      }
      touch.pageY = pageY;
    }
  };

  handlePlayer2Move = (event) => {
    const { pageY, pointerId } = event;

    const touch = this.touches[pointerId];
    if (touch && touch.player === PLAYER_RIGHT) {
      const { player2Y } = this.state;
      const top = player2Y * this.windowHeight / 100;


      if (top + touch.offsetY - pageY > 0 && pageY < touch.pageY) {
        this.player2Down = false;
        this.player2Up = true;
      } else if (top + touch.offsetY - pageY < 0 && pageY > touch.pageY) {
        this.player2Down = true;
        this.player2Up = false;
      }
      touch.pageY = pageY;
    }
  };

  handlePointerUp = (event) => {
    const { pointerId } = event;

    const touch = this.touches[pointerId];
    if (touch) {
      if (touch.player === PLAYER_LEFT) {
        this.player1Down = false;
        this.player1Up = false;
        this.player1Touch = null;
      } else if (touch.player === PLAYER_RIGHT) {
        this.player2Down = false;
        this.player2Up = false;
        this.player2Touch = null;
      }
      delete this.touches[pointerId];
    }
  };

  handleResize = () => {
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
    if (this.stage !== 'end' && !pause) {
      requestAnimationFrame(this.step);
    } else {
      this.time = null;
    }
  };

  constructor(props) {
    super(props);
    this.handleResize();
    this.state.player1Y = 50 - props.player1Height / 2;
    this.state.player2Y = 50 - props.player2Height / 2;
  }

  checkCollision(state, newState, delta, pastCollisions = []) {
    const { player1Height, player2Height } = this.props;
    const { ballAngle, ballSpeed, ballX, ballY, player1Y, player2Y } = state;

    newState.ballAngle = ballAngle;
    newState.ballX = Math.cos(ballAngle) * ballSpeed * delta + ballX;
    newState.ballY = Math.sin(ballAngle) * ballSpeed * delta + ballY;

    const collisions = [];

    // Collision with top or bottom sides.
    if (pastCollisions.indexOf(0) === -1) {
      collisions[0] = this.getWindowCollision(state, newState, 0);
    }
    if (pastCollisions.indexOf(1) === -1) {
      collisions[1] = this.getWindowCollision(state, newState, this.windowHeight);
    }

    // Collision with player1.
    if (pastCollisions.indexOf(2) === -1) {
      collisions[2] = this.getPlayerCollision(
        state,
        newState,
        this.r1,
        player1Y * this.windowHeight / 100,
        newState.player1Y * this.windowHeight / 100,
        player1Height * this.windowHeight / 100,
        true
      );
    }

    // Collision with player2.
    if (pastCollisions.indexOf(3) === -1) {
      collisions[3] = this.getPlayerCollision(
        state,
        newState,
        this.r2,
        player2Y * this.windowHeight / 100,
        newState.player2Y * this.windowHeight / 100,
        player2Height * this.windowHeight / 100,
        false
      );
    }

    const hasCollision = collisions.some(collision => collision.n !== Infinity);
    if (hasCollision) {
      const { ballAngle, ballX, ballY, index, n, sound } = collisions.reduce((acc, collision, index) => {
        if (collision.n < acc.n) {
          acc = { ...collision, index };
        }
        return acc;
      }, { n: Infinity });
      state.ballAngle = ballAngle;
      state.ballX = ballX;
      state.ballY = ballY;
      newState.sound = {
        ...sound,
        key: state.sound ? state.sound.key + 1 : 0
      };
      pastCollisions.push(index);
      this.checkCollision(state, newState, delta * (1 - n), pastCollisions)
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleResize);
    this.init();
  }

  componentDidUpdate(prevProps) {
    if (this.stage === 'reset') {
      this.stage = 'init';
      requestAnimationFrame(this.step);
    }
    if (prevProps.gameKey !== this.props.gameKey) {
      this.init();
    }
    if (prevProps.pause && !this.props.pause) {
      requestAnimationFrame(this.step);
    }
  }

  getBallStateOnInitPhase(state, player) {
    const { ballOffset, ballWidth, player1Height, player2Height, playerOffset, playerWidth } = this.props;
    const { player1Y, player2Y } = state;

    if (player === PLAYER_LEFT) {
      return {
        ballAngle: Math.PI / 6,
        ballX: playerOffset * this.windowWidth / 100 + (playerWidth + ballOffset) * this.windowHeight / 100,
        ballY: (player1Y + player1Height / 2 - ballWidth / 2) * this.windowHeight / 100
      };
    }

    return {
      ballAngle: 5 * Math.PI / 6,
      ballX: this.windowWidth - playerOffset * this.windowWidth / 100 - (playerWidth + ballOffset) * this.windowHeight / 100 - ballWidth * this.windowHeight / 100,
      ballY: (player2Y + player2Height / 2 - ballWidth / 2) * this.windowHeight / 100
    };
  }

  getState(delta, state) {
    const { ballAcceleration, player1Height, player1Speed, player2Height, player2Speed, } = this.props;
    const { ballSpeed, player1Y, player2Y } = state;
    const newState = {};

    // New player 1 position.
    if (this.player1Down && !this.player1Up) {
      newState.player1Y = Math.min(player1Y + delta * player1Speed, 100 - player1Height);
    } else if (!this.player1Down && this.player1Up) {
      newState.player1Y = Math.max(player1Y - delta * player1Speed, 0);
    } else {
      newState.player1Y = player1Y;
    }

    // New player 2 position.
    if (this.player2Down && !this.player2Up) {
      newState.player2Y = Math.min(player2Y + delta * player2Speed, 100 - player2Height);
    } else if (!this.player2Down && this.player2Up) {
      newState.player2Y = Math.max(player2Y - delta * player2Speed, 0);
    } else {
      newState.player2Y = player2Y;
    }

    // Stop player 1 movement and if position has reached its goal (touch).
    if (this.player1Touch) {
      const touch = this.touches[this.player1Touch];
      if (touch && newState.player1Y * this.windowHeight / 100 > touch.pageY - touch.offsetY && this.player1Down) {
        this.player1Down = false;
        newState.player1Y = (touch.pageY - touch.offsetY) * 100 / this.windowHeight;
      } else if (touch && newState.player1Y * this.windowHeight / 100 < touch.pageY - touch.offsetY && this.player1Up) {
        this.player1Up = false;
        newState.player1Y = (touch.pageY - touch.offsetY) * 100 / this.windowHeight;
      }
    }

    // Stop player 2 movement and if position has reached its goal (touch).
    if (this.player2Touch) {
      const touch = this.touches[this.player2Touch];
      if (touch && newState.player2Y * this.windowHeight / 100 > touch.pageY - touch.offsetY && this.player2Down) {
        this.player2Down = false;
        newState.player2Y = (touch.pageY - touch.offsetY) * 100 / this.windowHeight;
      } else if (touch && newState.player2Y * this.windowHeight / 100 < touch.pageY - touch.offsetY && this.player2Up) {
        this.player2Up = false;
        newState.player2Y = (touch.pageY - touch.offsetY) * 100 / this.windowHeight;
      }
    }

    if (this.stage === 'start') {
      // Check for collisions.
      this.checkCollision({...state}, newState, delta);
      
      // Collision with left or right sides.
      if (newState.ballX <= 0) {
        this.onEnd(PLAYER_RIGHT);
        newState.sound = {
          note: 'A3',
          key: state.sound ? state.sound.key + 1 : 0
        };
      } else
      if (newState.ballX >= this.maxWidth) {
        this.onEnd(PLAYER_LEFT);
        newState.sound = {
          note: 'A3',
          key: state.sound ? state.sound.key + 1 : 0
        };
      } else {
        newState.ballSpeed =  ballSpeed + ballAcceleration * delta / 1000;
      }
    } else if (this.stage === 'init') {
      // Move ball accordingly to player movement.
      const { ballAngle, ballX, ballY } = this.getBallStateOnInitPhase(newState, this.props.startPlayer);
      newState.ballAngle = ballAngle;
      newState.ballX = ballX;
      newState.ballY = ballY;
    }
    
    // Save previous state.
    newState.oldState = state;
    newState.oldOldState = state.oldState;
    newState.oldOldOldState = state.oldOldState;

    return newState;
  }

  getPlayerCollision(state, newState, radius, tEY1, tEY2, playerHeight, left) {
    let { ballWidth, playerWidth, playerOffset } = this.props;
    const { ballAngle, ballX: x1, ballY: y1 } = state;
    const { ballX: x2, ballY: y2 } = newState;

    const ballRadius = ballWidth / 2 * this.windowHeight / 100;
    playerWidth = playerWidth * this.windowHeight / 100;
    playerOffset = playerOffset * this.windowWidth / 100;

    // Player center.
    const pX1 = left
      ? playerOffset + playerWidth - radius
      : this.windowWidth - playerOffset - playerWidth + radius;
    const pY1 = tEY1 + playerHeight / 2;
    const pY2 = tEY2 + playerHeight / 2;

    // Ball center.
    const bX1 = x1 + ballRadius;
    const bY1 = y1 + ballRadius;
    const bX2 = x2 + ballRadius;
    const bY2 = y2 + ballRadius;

    // Continue only if th ball is going from the right direction.
    if (!left && bX2 - bX1 < 0 || left && bX2 - bX1 > 0) {
      return { n: Infinity };
    }

    const cPWC = getContactPointWithCircle(pX1, pY1, pX1, pY2, radius, bX1, bY1, bX2, bY2, ballRadius);
    // Continue if contact point is inside the player arc.
    if (cPWC.n !== Infinity && cPWC.bY + ballRadius >= cPWC.pY - playerHeight / 2 && cPWC.bY - ballRadius <= cPWC.pY + playerHeight / 2) {
      const { bX, bY, n, pX, pY } = cPWC;

      // Calculate new ball angle.
      const contactAngle = Math.atan((bY - pY) / (bX - pX));
      const incidenceAngle = ballAngle - contactAngle;
      const newBallAngle = ballAngle + Math.PI - 2 * incidenceAngle;

      // Set state.
      return {
        ballAngle: newBallAngle,
        ballX: bX - ballRadius,
        ballY: bY - ballRadius,
        n,
        sound: { note: 'A5' }
      }
    }

    // Top extremity.
    const eX1 = left ? playerOffset : this.windowWidth - playerOffset;

    const cPWPT = getContactPointWithPoint(eX1, tEY1, eX1, tEY2, bX1, bY1, bX2, bY2, ballRadius, pX1, pY1, radius);
    // Check if collision with top extremity.
    if (cPWPT.n !== Infinity) {
      const { bX, bY, n } = cPWPT;

      // Calculate new ball angle.
      const contactAngle = Math.asin((playerWidth / 2) / radius) / 2;
      const incidenceAngle = Math.PI / 2 - ballAngle + contactAngle;
      const newBallAngle = ballAngle + Math.PI + 2 * incidenceAngle;

      // Set state.
      return {
        ballAngle: newBallAngle,
        ballX: bX - ballRadius,
        ballY: bY - ballRadius,
        n,
        sound: { note: 'A5' }
      }
    }

    // Bottom extremity.
    const bEY1 = tEY1 + playerHeight;
    const bEY2 = tEY2 + playerHeight;

    const cPWPB = getContactPointWithPoint(eX1, bEY1, eX1, bEY2, bX1, bY1, bX2, bY2, ballRadius, pX1, pY1, radius);
    // Check if collision with top extremity.
    if (cPWPB.n !== Infinity) {
      const { bX, bY, n } = cPWPB ;

      // Calculate new ball angle.
      const contactAngle = Math.asin((playerWidth / 2) / radius) / 2;
      const incidenceAngle = Math.PI / 2 - ballAngle + contactAngle;
      const newBallAngle = ballAngle + Math.PI + 2 * incidenceAngle;

      // Set state.
      return {
        ballAngle: newBallAngle,
        ballX: bX - ballRadius,
        ballY: bY - ballRadius,
        n,
        sound: { note: 'A5' }
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

    const { bX, bY, n } = getContactPointWithHLine(y, bX1, bY1, bX2, bY2, ballRadius, (bY2 - bY1) / Math.abs(bY2 - bY1));

    if (n > 0 && n < 1) {
      return {
        ballAngle: - state.ballAngle,
        ballX: bX - ballRadius,
        ballY: bY - ballRadius,
        n,
        sound: {}
      };
    }

    return { n: Infinity };
  }

  init() {
    const { ballSpeed, startPlayer } = this.props;
    this.stage = 'reset';
    this.setState(state => ({
      ...this.getBallStateOnInitPhase(state, startPlayer),
      ballSpeed,
      oldOldOldState: null,
      oldOldState: null,
      oldState: null,
      sound: null
    }));
  }

  onEnd(winner) {
    const { onEnd } = this.props;
    this.stage = 'end';
    setTimeout(() => onEnd(winner), END_TIMEOUT);
  }

  render() {
    const { ballWidth, playerOffset, playerWidth, player1Height, player2Height, settings } = this.props;
    const { ballX, ballY, player1Y, player2Y, sound } = this.state;

    const gameStyle = {
      background: 'black',
      overflow: 'hidden',
      position: 'relative',
      width: '100vw',
      height: '100vh',
    };

    const player1TouchAreaStyle = {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '50vw',
      height: '100vh',
    };

    const player2TouchAreaStyle = {
      position: 'absolute',
      top: '0',
      right: '0',
      width: '50vw',
      height: '100vh',
    };

    return (
      <div style={gameStyle} >
        <Player
          color="white"
          playerHeight={player1Height}
          playerOffset={playerOffset}
          playerWidth={playerWidth}
          playerY={player1Y}
          position={PLAYER_LEFT}
          radius={this.r1}
          windowHeight={this.windowHeight}
        />
        <Player
          color="white"
          playerHeight={player2Height}
          playerOffset={playerOffset}
          playerWidth={playerWidth}
          playerY={player2Y}
          position={PLAYER_RIGHT}
          radius={this.r2}
          windowHeight={this.windowHeight}
        />
        {this.state.oldOldOldState && (<Ball
          ballWidth={ballWidth}
          ballY={this.state.oldOldOldState.ballY}
          ballX={this.state.oldOldOldState.ballX}
          color="white"
          opacity="0.2"
        />)}
        {this.state.oldOldState && (<Ball
          ballWidth={ballWidth}
          ballY={this.state.oldOldState.ballY}
          ballX={this.state.oldOldState.ballX}
          color="white"
          opacity="0.4"
        />)}
        {this.state.oldState && (<Ball
          ballWidth={ballWidth}
          ballY={this.state.oldState.ballY}
          ballX={this.state.oldState.ballX}
          color="white"
          opacity="0.6"
        />)}
        <Ball ballWidth={ballWidth} ballY={ballY} ballX={ballX} color="white" />
        <div
          onPointerDown={this.handlePlayer1Down}
          onPointerMove={this.handlePlayer1Move}
          onPointerUp={this.handlePointerUp}
          style={player1TouchAreaStyle}
        />
        <div
          onPointerDown={this.handlePlayer2Down}
          onPointerMove={this.handlePlayer2Move}
          onPointerUp={this.handlePointerUp}
          style={player2TouchAreaStyle}
        />
        {settings.player2IA && this.state.oldState && (<IA
          ballY={ballY * 100 / this.windowHeight}
          oldBallY={this.state.oldState.ballY * 100 / this.windowHeight}
          playerY={player2Y}
          playerHeight={player2Height}
          settings={settings}
        />)}
        {sound && (<Oscillator {...sound}/>)}
      </div>
    );
  }

}
