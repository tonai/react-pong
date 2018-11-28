import { PureComponent } from 'react';

import { noteValues } from '../../../config/noteValues';

export class Oscillator extends PureComponent {

  static defaultProps = {
    duration: 0.1,
    note: 'A4',
    type: 'triangle' // 'sine', 'square', 'sawtooth', 'triangle'
  };

  componentDidMount() {
    const { duration, note, type } = this.props;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = noteValues[note];
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, duration);
  }

  render() {
    return null;
  }

}
