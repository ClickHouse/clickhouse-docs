import React from 'react';
import Navigation from '../../../../components/Navigation';
import styles from './styles.module.css';

// The primary menu displays the navbar items
export default function NavbarMobilePrimaryMenu() {
  return (
    <>
      <Navigation className={styles.primaryMenuMobile}/>
      <div className="nav-items-btns">
        <a href="https://console.clickhouse.cloud/signIn" className="sign-in ch-menu">
          <button className="click-button">Sign in</button>
        </a>
        <a href="https://console.clickhouse.cloud/signUp" className="click-button-anchor">
          <button className="click-button primary-btn">Get started</button>
        </a>
      </div>
    </>
  );
}
