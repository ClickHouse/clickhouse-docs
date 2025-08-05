import React from 'react';
import Layout from '@theme/Layout';
import homepage_styles from './homepage_styles.module.scss'
import {useColorMode} from "@docusaurus/theme-common";
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ClickHouseLogo from '@site/static/img/ch_logo_docs_dark.svg';
import SearchBar from '@theme/SearchBar';
import clsx from 'clsx';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ColorModeToggle from "@theme-original/ColorModeToggle";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


const NavatticDemo = ({
  demoId = "cmbj9y9dx000004lbbeus84ns",
  width = "100%",
  height = "600px",
  className = ""
}) => {
    const src = `https://capture.navattic.com/${demoId}`;
    return (
        <div>
            <div className={homepage_styles.try_it_out}>Try out Cloud</div>
            <div className={homepage_styles.browser_header}>
                <div className={homepage_styles.traffic_lights}>
                    <div className={clsx(homepage_styles.traffic_light, homepage_styles.close)}></div>
                    <div className={clsx(homepage_styles.traffic_light, homepage_styles.minimize)}></div>
                    <div className={clsx(homepage_styles.traffic_light, homepage_styles.maximize)}></div>
                </div>

                <div className={homepage_styles.address_bar}>
                    <div className={homepage_styles.address_bar_text}>https://console.clickhouse.cloud</div>
                </div>
            </div>

            <div className={homepage_styles.browser_content}>
                <div className={homepage_styles.navatticDemo} style={{height}}>
                    <iframe
                        src={src}
                        style={{
                            border: 'none',
                            width: '100%',
                            height: '100%'
                        }}
                        data-navattic-demo-id={demoId}
                        allow="fullscreen"
                        title="Navattic Interactive Demo"
                        loading="lazy"
                    />
                </div>
            </div>
        </div>
    );
};

const HeroSection = () => {
    return (
        <div className={homepage_styles.heroSection}>
            <ClickHouseLogo className={homepage_styles.logo}/>
            <h2>The fastest and most resource efficient real-time data warehouse and open-source database.</h2>
            <SearchBar/>
    </div>
    );
}
const NavatticDemoSection = () => {
    return(
        <div className={homepage_styles.navatticDemoSection}>
            <NavatticDemo/>
        </div>
    )
}

const ExploreDocs = () => {
    const { colorMode } = useColorMode();
    const versionColor = colorMode === 'dark' ? '#FFE66D' : '#1976d2';
    
    return (
        <div className={homepage_styles.exploreDocs}>
            <Grid container spacing={3} justifyContent="center" alignItems="stretch" sx={{ padding: '0 16px', minHeight: '400px', maxWidth: '1400px', margin: '0 auto' }}>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Card sx={{ 
                        width: { xs: '100%', sm: '280px' },
                        maxWidth: '400px',
                        height: '300px',
                        minWidth: { xs: '280px', sm: '280px' },
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 3,
                        '&:hover': {
                            boxShadow: 6,
                        },
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                            <CardMedia
                                component="img"
                                height="100"
                                sx={{ width: '100%' }}
                                image={useBaseUrl('/images/homepage/get_started.png')}
                                alt="Learn ClickHouse"
                            />
                            <CardContent sx={{ 
                                backgroundColor: 'background.paper',
                                color: 'text.primary',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div>
                                    <h3>Get Started</h3>
                                    <p>Learn the basics of ClickHouse</p>
                                </div>
                                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                                    <Link to="/getting-started/quick-start/cloud" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Quick start guide</Link>
                                    <Link to="/install" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Installation</Link>
                                    <Link to="/install" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Tutorial</Link>
                                    <Link to="/install" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>ClickHouse Cloud</Link>
                                    <Link to="/install" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Playground</Link>
                                </div>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                    
                    {/* Changelog Cards stacked under Get Started */}
                    <Card sx={{ 
                        width: { xs: '100%', sm: '280px' },
                        maxWidth: '400px',
                        height: '80px',
                        display: 'flex',
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 3,
                        '&:hover': {
                            boxShadow: 6,
                        }
                    }}>
                        <CardMedia
                            component="img"
                            sx={{ width: 80, height: 80, objectFit: 'contain' }}
                            image={useBaseUrl('/images/homepage/cloud_icon.png')}
                            alt="Cloud Changelog"
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                            <CardContent sx={{ py: 1 }}>
                                <Typography component="div" variant="subtitle1" sx={{ fontSize: '0.9rem', mb: 0.5 }}>
                                    Cloud Changelog
                                </Typography>
                                <Typography
                                    variant="h6"
                                    component="div"
                                    sx={{ color: versionColor, fontWeight: 'bold' }}
                                >
                                    v24.12
                                </Typography>
                            </CardContent>
                        </Box>
                    </Card>
                    
                    <Card sx={{ 
                        width: { xs: '100%', sm: '280px' },
                        maxWidth: '400px',
                        height: '80px',
                        display: 'flex',
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 3,
                        '&:hover': {
                            boxShadow: 6,
                        }
                    }}>
                        <CardMedia
                            component="img"
                            sx={{ width: 80, height: 80, objectFit: 'contain' }}
                            image={useBaseUrl('/images/homepage/oss_icon.png')}
                            alt="OSS Changelog"
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                            <CardContent sx={{ py: 1 }}>
                                <Typography component="div" variant="subtitle1" sx={{ fontSize: '0.9rem', mb: 0.5 }}>
                                    OSS Changelog
                                </Typography>
                                <Typography
                                    variant="h6"
                                    component="div"
                                    sx={{ color: versionColor, fontWeight: 'bold' }}
                                >
                                    v24.12.1
                                </Typography>
                            </CardContent>
                        </Box>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Card sx={{ 
                        width: { xs: '100%', sm: '280px' },
                        maxWidth: '400px',
                        height: '300px',
                        minWidth: { xs: '280px', sm: '280px' },
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 3,
                        '&:hover': {
                            boxShadow: 6,
                        },
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                            <CardMedia
                                component="img"
                                height="100"
                                sx={{ width: '100%' }}
                                image={useBaseUrl('/images/homepage/learn.png')}
                                alt="Learn ClickHouse"
                            />
                            <CardContent sx={{ 
                                backgroundColor: 'background.paper',
                                color: 'text.primary',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div>
                                    <h3>Learn</h3>
                                    <p>Explore concepts and best practices</p>
                                </div>
                                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                                    <Link to="/managing-data/core-concepts" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Guides & Tutorials</Link>
                                    <Link to="/managing-data/core-concepts" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Best Practices</Link>
                                    <Link to="/managing-data/core-concepts" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Use Cases</Link>
                                    <Link to="/managing-data/core-concepts" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Developer Guide</Link>
                                    <Link to="/managing-data/core-concepts" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Integrations</Link>
                                </div>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Card sx={{ 
                        width: { xs: '100%', sm: '280px' },
                        maxWidth: '400px',
                        height: '300px',
                        minWidth: { xs: '280px', sm: '280px' },
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 3,
                        '&:hover': {
                            boxShadow: 6,
                        },
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                            <CardMedia
                                component="img"
                                height="100"
                                sx={{ width: '100%' }}
                                image={useBaseUrl('/images/homepage/reference.png')}
                                alt="ClickHouse Reference"
                            />
                            <CardContent sx={{ 
                                backgroundColor: 'background.paper',
                                color: 'text.primary',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div>
                                    <h3>Reference</h3>
                                    <p>Reference docs for everyday use</p>
                                </div>
                                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                                    <Link to="/sql-reference" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>SQL Reference</Link>
                                    <Link to="/sql-reference/functions" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Functions</Link>
                                    <Link to="/sql-reference/functions" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Engines</Link>
                                    <Link to="/sql-reference/functions" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Operations</Link>
                                    <Link to="/sql-reference/functions" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Interfaces</Link>
                                </div>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
}
const HelloContent = () => {
    const { colorMode } = useColorMode();
    
    const theme = createTheme({
        palette: {
            mode: colorMode === 'dark' ? 'dark' : 'light',
            primary: {
                main: '#FFE66D',
                contrastText: '#000000',
            },
            secondary: {
                main: '#1976d2',
            },
            background: {
                default: colorMode === 'dark' ? '#1a1a1a' : '#ffffff',
                paper: colorMode === 'dark' ? '#2d2d2d' : '#ffffff',
            },
            text: {
                primary: colorMode === 'dark' ? '#ffffff' : '#000000',
                secondary: colorMode === 'dark' ? '#b3b3b3' : '#666666',
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className={homepage_styles.topLevelContainer}>
                <div className={homepage_styles.yellowStrip}></div>
                <HeroSection/>
                <ExploreDocs/>
            </div>
        </ThemeProvider>
    );
};

export default function Hello() {
    return (
        <Layout title="Hello" description="Hello React Page">
            <HelloContent />
        </Layout>
    );
}