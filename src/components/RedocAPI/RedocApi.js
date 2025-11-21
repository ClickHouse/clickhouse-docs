import React from 'react';
import { RedocStandalone } from 'redoc';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './styles.module.scss'

export default function RedocApi({ embedded = false }) {
    const { colorMode } = useColorMode();
    const isDarkMode = colorMode === 'dark';

    return (
        <div className={embedded ? styles.embeddedContainer : ''}>
            <RedocStandalone
                specUrl="/docs/apis/openapi.json"
                options={{
                    scrollYOffset: 60,
                    theme: {
                        colors: {
                            primary: {
                                main: isDarkMode ? '#faff69' : '#ffcc00',
                            },
                            text: {
                                primary: isDarkMode ? '#ffffff' : '#000000',
                                secondary: isDarkMode ? '#b4b4b4' : '#666666',
                            },
                            border: {
                                dark: isDarkMode ? '#444444' : '#cccccc',
                                light: isDarkMode ? '#333333' : '#eeeeee',
                            },
                            http: {
                                get: '#6bbd5b',
                                post: '#248fb2',
                                put: '#9b708b',
                                options: '#d3ca12',
                                patch: '#e09d43',
                                delete: '#e27a7a',
                                basic: '#999',
                                link: '#31bbb6',
                                head: '#c167e4',
                            },
                        },
                        sidebar: {
                            backgroundColor: isDarkMode ? '#1b1b1d' : '#fafafa',
                            textColor: isDarkMode ? '#ffffff' : '#000000',
                        },
                        rightPanel: {
                            backgroundColor: isDarkMode ? '#1b1b1d' : '#263238',
                        },
                        typography: {
                            fontSize: '14px',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            headings: {
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                            },
                            code: {
                                fontSize: '13px',
                                backgroundColor: isDarkMode ? '#2d2d30' : '#f5f5f5',
                                color: isDarkMode ? '#d4d4d4' : '#000000',
                            },
                        },
                    }
                }}
                className={styles.redoc}
            />
        </div>
    );
}

