import React, { Component } from 'react';

import './Settings.css';

export class Settings extends Component {

  onChange = event => {
    const { onSettingsChange } = this.props;
    const { name, value } = event.target;
    onSettingsChange && onSettingsChange(name, value);
  };

  onCheckChange = event => {
    const { onSettingsChange } = this.props;
    const { checked, name } = event.target;
    onSettingsChange && onSettingsChange(name, checked);
  };

  onKeyDown = event => {
    const { onSettingsChange } = this.props;
    const { nativeEvent: { code }, target: { name } } = event;
    if (code !== 'Tab') {
      onSettingsChange && onSettingsChange(name, code);
    }
  };

  render() {
    const { menuIsOpen, settings } = this.props;

    const settingsClassNames = ['Settings'];

    if (menuIsOpen) {
      settingsClassNames.push('is-open');
    }

    return (
      <div className={settingsClassNames.join(' ')}>
        <div className="Settings__content">
          <h1 className="Settings__title">Settings</h1>
          <form className="Settings__form">
            <fieldset className="Settings__fieldset" style={{ flex: 2 }}>
              <legend className="Settings__legend">Game</legend>
              <div className="Settings__group">
                <div className="Settings__field">
                  <label className="Settings__label" htmlFor="first-to">First to</label>
                  <input className="Settings__input" id="first-to" max="9" min="1" name="firstTo" onChange={this.onChange} type="number" value={settings.firstTo} />
                </div>
              </div>
            </fieldset>
            <fieldset className="Settings__fieldset" style={{ flex: 4 }}>
              <legend className="Settings__legend">Keys player 1</legend>
              <div className="Settings__group">
                <div className="Settings__field">
                  <label className="Settings__label" htmlFor="player1-up">Up</label>
                  <input className="Settings__input" id="player1-up" name="player1Up" onKeyDown={this.onKeyDown} value={settings.player1Up} />
                </div>
                <div className="Settings__field">
                  <label className="Settings__label" htmlFor="player1-down">Down</label>
                  <input className="Settings__input" id="player1-down" name="player1Down" onKeyDown={this.onKeyDown} value={settings.player1Down} />
                </div>
                <div className="Settings__field">
                  <label className="Settings__label" htmlFor="player1-launch">Launch</label>
                  <input className="Settings__input" id="player1-launch" name="player1Launch" onKeyDown={this.onKeyDown} value={settings.player1Launch} />
                </div>
              </div>
            </fieldset>
            <fieldset className="Settings__fieldset" style={{ flex: 4 }}>
              <legend className="Settings__legend">Keys player 2</legend>
              <div className="Settings__group">
                <div className="Settings__field">
                  <label className="Settings__label" htmlFor="player2-ia">IA</label>
                  <div className="Settings__input">
                    <input checked={settings.player2IA} id="player2-ia" name="player2IA" onChange={this.onCheckChange} type="checkbox" />
                  </div>
                </div>
                <div className="Settings__field">
                  <label className="Settings__label" htmlFor="player2-up">Up</label>
                  <input className="Settings__input" disabled={settings.player2IA} id="player2-up" name="player2Up" onKeyDown={this.onKeyDown} value={settings.player2Up} />
                </div>
                <div className="Settings__field">
                  <label className="Settings__label" htmlFor="player2-down">Down</label>
                  <input className="Settings__input" disabled={settings.player2IA} id="player2-down" name="player2Down" onKeyDown={this.onKeyDown} value={settings.player2Down} />
                </div>
                <div className="Settings__field">
                  <label className="Settings__label" htmlFor="player2-launch">Launch</label>
                  <input className="Settings__input" disabled={settings.player2IA} id="player2-launch" name="player2Launch" onKeyDown={this.onKeyDown} value={settings.player2Launch} />
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    );
  }

}
