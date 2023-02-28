import React from 'react';
import {useColorMode, useThemeConfig} from '@docusaurus/theme-common';
import ColorModeToggle from '@theme/ColorModeToggle';
import styles from './styles.module.css'
export default function NavbarColorModeToggle({className}) {
  const disabled = useThemeConfig().colorMode.disableSwitch;
  const {colorMode, setColorMode} = useColorMode();
  if (disabled) {
    return null;
  }
  return (
    <button className={styles.colorModeButton} onClick={() => setColorMode(mode => mode === 'dark' ? 'light' : 'dark')}>
      <ColorModeToggle
        className={className}
        value={colorMode}
      />
      <span>{`${colorMode} Mode`}</span>
    </button>
  );
}
