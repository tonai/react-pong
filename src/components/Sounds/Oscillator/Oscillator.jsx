import { PureComponent } from 'react';

import { noteValues } from '../../../config/noteValues';

import { audioContext } from '../../../services/audioContext';

export class Oscillator extends PureComponent {

  static defaultProps = {
    duration: 0.1,
    note: 'A4',
    type: 'triangle' // 'sine', 'square', 'sawtooth', 'triangle'
  };

  componentDidMount() {
    const { duration, note, type } = this.props;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = noteValues[note];
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration);
  }

  render() {
    return null;
  }

}
