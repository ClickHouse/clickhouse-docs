import React from 'react';
import styles from './Diagram.module.css';

type DiagramProps = {
    src: string;
    alt?: string;
    height?: number;
    width?: number;
};


export const Diagram = ({src, alt="diagram", height, width}: DiagramProps): JSX.Element => {
    return <div className={styles.diagram}>
        <img alt={alt} src={src} height={height} width={width}/>
    </div>
}
