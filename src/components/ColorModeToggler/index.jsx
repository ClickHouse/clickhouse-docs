import React from 'react';
import {useColorMode, useThemeConfig} from '@docusaurus/theme-common';
import styles from './styles.module.scss'

export default function ColorModeToggle({className = ''}) {
  const disabled = useThemeConfig().colorMode.disableSwitch;
  const {colorMode, setColorMode} = useColorMode();
  if (disabled) {
    return null;
  }

  const updateColor = () => {
    setColorMode( colorMode === 'dark' ? 'light' : 'dark', {persist: true})
  }
  
  return (
    <button className={`${styles.colorModeButton} ${className}`} onClick={updateColor}>
      {colorMode === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="31" height="31" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.3945 13.0269C18.7245 12.8719 19.0765 13.1969 18.9845 13.5499C18.6705 14.7519 18.0535 15.8959 17.1035 16.8459C14.2825 19.6669 9.76953 19.7259 7.02153 16.9779C4.27353 14.2299 4.33353 9.71589 7.15453 6.89489C8.10453 5.94489 9.24753 5.32789 10.4505 5.01389C10.8035 4.92189 11.1275 5.27389 10.9735 5.60389C9.97153 7.74289 10.3005 10.3049 11.9975 12.0019C13.6935 13.6999 16.2555 14.0289 18.3945 13.0269V13.0269Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="31" height="31" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          <circle cx="12" cy="12" r="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
