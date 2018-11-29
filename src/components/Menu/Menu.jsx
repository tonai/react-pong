import React, { PureComponent } from 'react';

import './Menu.css';

export class Menu extends PureComponent {

  openMenu = () => {
    const { onToggleMenu } = this.props;
    onToggleMenu();
  };

  render() {
    const { menuIsOpen } = this.props;

    const bar1ClassNames = ['Menu__bar1'];
    const bar2ClassNames = ['Menu__bar2'];
    const bar3ClassNames = ['Menu__bar3'];
    let label = "Open menu";

    if (menuIsOpen) {
      bar1ClassNames.push('is-open');
      bar2ClassNames.push('is-open');
      bar3ClassNames.push('is-open');
      label = "Close menu";
    }

    return (
      <button className="Menu" onClick={this.openMenu} aria-label={label}>
        <div className={bar1ClassNames.join(' ')}/>
        <div className={bar2ClassNames.join(' ')}/>
        <div className={bar3ClassNames.join(' ')}/>
      </button>
    );
  }

}
