import React, { PureComponent } from 'react';

import { Manager } from '../Manager/Manager';
import { Menu } from '../Menu/Menu';
import { Settings } from '../Settings/Settings';

export class App extends PureComponent {

  state = {
    menuIsOpen: false,
    settings: {
      firstTo: 3,
      player1Up: 'KeyW',
      player1Down: 'KeyS',
      player1Launch: 'Space',
      player2IA: false,
      player2Up: 'ArrowUp',
      player2Down: 'ArrowDown',
      player2Launch: 'Enter'
    }
  };

  onSettingsChange = (name, value) => {
    this.setState(state => ({
      settings: {
        ...state.settings,
        [name]: value
      }
    }));
  };

  onToggleMenu = () => {
    this.setState(state => ({
      menuIsOpen: !state.menuIsOpen
    }));
  };

  render() {
    const { menuIsOpen, settings } = this.state;

    return (
      <div>
        <Manager pause={menuIsOpen} settings={settings} />
        <Settings menuIsOpen={menuIsOpen} onSettingsChange={this.onSettingsChange} settings={settings} />
        <Menu onToggleMenu={this.onToggleMenu} menuIsOpen={menuIsOpen} />
      </div>
    );
  }

}
