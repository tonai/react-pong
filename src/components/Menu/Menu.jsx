import React, { Component } from 'react';

import './Menu.css';

export class Menu extends Component {

  openMenu = () => {
    const { onToggleMenu } = this.props;
    onToggleMenu();
  };

  render() {
    const { menuIsOpen } = this.props;

    const bar1ClassNames = ['Menu__bar1'];
    const bar2ClassNames = ['Menu__bar2'];
    const bar3ClassNames = ['Menu__bar3'];

    if (menuIsOpen) {
      bar1ClassNames.push('is-open');
      bar2ClassNames.push('is-open');
      bar3ClassNames.push('is-open');
    }

    return (
      <button className="Menu" onClick={this.openMenu}>
        <div className={bar1ClassNames.join(' ')}/>
        <div className={bar2ClassNames.join(' ')}/>
        <div className={bar3ClassNames.join(' ')}/>
      </button>
    );
  }

}
