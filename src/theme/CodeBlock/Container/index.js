import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import styles from './styles.module.css';
export default function CodeBlockContainer({as: As, ...props}) {
  return (
    <As
      // Polymorphic components are hard to type, without `oneOf` generics
      {...props}
      className={clsx(
        props.className,
        styles.codeBlockContainer,
        ThemeClassNames.common.codeBlock,
      )}
    />
  );
}
