import React, { PureComponent } from 'react';

export class Fps extends PureComponent {

  state = {
    frames: []
  };
  unmounted = false;

  onEachStep = time => {
    this.setState(state => {
      const frames = state.frames.filter(frame => frame > time - 1000);
      frames.push(time);
      return { frames };
    });
  };

  step = (time) => {
    if (!this.unmounted) {
      this.onEachStep(time);
      requestAnimationFrame(this.step);
    }
  };

  componentDidMount() {
    requestAnimationFrame(this.step);
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    const { frames } = this.state;

    const counterStyle = {
      color: 'red',
      left: '10px',
      position: 'absolute',
      top: '10px'
    };

    return (
      <div style={counterStyle}>{frames.length}</div>
    );
  }

}
