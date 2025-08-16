import React from 'react';
import Layout from '@theme/Layout';
import homepage_styles from './homepage_styles.module.scss'
import {useColorMode} from "@docusaurus/theme-common";
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useVersions } from '@site/src/hooks/useVersions';
import ClickHouseLogoDark from '@site/static/img/ch_logo_docs_dark.svg';
import ClickHouseLogoLight from '@site/static/img/ch_logo_docs.svg';
import SearchBar from '@theme/SearchBar';
import clsx from 'clsx';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
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

// Sparkle Icon Component
const SparkleIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill={color}
    >
        <path d="M12 0l3.09 6.91L22 10l-6.91 3.09L12 20l-3.09-6.91L2 10l6.91-3.09L12 0z"/>
        <path d="M19 0l1.5 3.5L24 5l-3.5 1.5L19 10l-1.5-3.5L14 5l3.5-1.5L19 0z"/>
        <path d="M7 14l1 2.5L11 17l-3 1.5L7 21l-1-2.5L3 17l3-1.5L7 14z"/>
    </svg>
);

// Migration Option Button Component
const MigrationOptionButton = ({ icon, link, children }) => {
    return (
        <Card 
            component={Link}
            to={link}
            sx={{
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                backgroundColor: 'background.paper',
                border: '1px solid #ddd',
                boxShadow: 1,
                '&:hover': {
                    backgroundColor: 'rgba(245, 245, 245, 0.8)',
                    textDecoration: 'none',
                    color: 'inherit',
                    boxShadow: 2,
                }
            }}
        >
            <CardContent sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                padding: '8px !important',
                minWidth: 0
            }}>
                <Box
                    sx={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <img 
                        src={useBaseUrl(icon)} 
                        alt={children}
                        style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                    />
                </Box>
                <Typography variant="caption" sx={{ 
                    fontWeight: 500, 
                    fontSize: '11px', 
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {children}
                </Typography>
            </CardContent>
        </Card>
    );
};

const HeroSection = () => {
    const { colorMode } = useColorMode();
    const handleAskAIClick = () => {
        // Open Kapa widget
        if (window.kapa && window.kapa.open) {
            window.kapa.open();
        }
    };

    const LogoComponent = colorMode === 'dark' ? ClickHouseLogoDark : ClickHouseLogoLight;

    return (
        <div className={homepage_styles.heroSection}>
            <LogoComponent className={homepage_styles.logo}/>
            <h2>The fastest and most resource efficient real-time data warehouse and open-source database.</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', flexWrap: 'nowrap' }}>
                <SearchBar/>
                <Button
                    variant="contained"
                    onClick={handleAskAIClick}
                    sx={{
                        backgroundColor: '#2d2d2d',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        height: '40px',
                        padding: '8px 16px',
                        textTransform: 'none',
                        fontSize: '14px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        '&:hover': {
                            backgroundColor: '#404040',
                        },
                        '& .MuiButton-startIcon': {
                            marginLeft: 0,
                            marginRight: 0,
                            display: 'flex',
                            alignItems: 'center',
                        }
                    }}
                >
                    <SparkleIcon size={16} color="#ffffff" />
                    Ask AI
                </Button>
            </div>
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
    const versions = useVersions();
    const versionColor = colorMode === 'dark' ? '#faff69' : '#1976d2';
    
    return (
        <div className={homepage_styles.exploreDocs}>
            <Box sx={{ 
                padding: '0 16px',
                minHeight: '400px',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {/* Unified Grid Layout */}
                <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gridTemplateRows: 'auto auto',
                    gap: 3
                }}>
                    {/* Get Started Card - Row 1, Column 1 */}
                    <Card sx={{ 
                        height: '300px',
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

                    {/* Learn Card - Row 1, Column 2 */}
                    <Card sx={{ 
                        height: '300px',
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

                    {/* Reference Card - Row 1, Column 3 */}
                    <Card sx={{ 
                        height: '300px',
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

                    {/* Changelog Cards Container - Row 2, Column 1 */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2
                    }}>
                        <Card 
                            component={Link}
                            to={versions.cloud.link}
                            sx={{ 
                                height: '80px',
                                display: 'flex',
                                backgroundColor: 'background.paper',
                                color: 'text.primary',
                                boxShadow: 3,
                                textDecoration: 'none',
                                '&:hover': {
                                    boxShadow: 6,
                                    textDecoration: 'none',
                                    color: 'inherit',
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
                                        {versions.cloud.version}
                                    </Typography>
                                </CardContent>
                            </Box>
                        </Card>
                        
                        <Card 
                            component={Link}
                            to={versions.oss.link}
                            sx={{ 
                                height: '80px',
                                display: 'flex',
                                backgroundColor: 'background.paper',
                                color: 'text.primary',
                                boxShadow: 3,
                                textDecoration: 'none',
                                '&:hover': {
                                    boxShadow: 6,
                                    textDecoration: 'none',
                                    color: 'inherit',
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
                                        {versions.oss.version}
                                    </Typography>
                                </CardContent>
                            </Box>
                        </Card>
                    </Box>
                    
                    {/* Migrate Card - Row 2, Columns 2-3 (spans 2 columns) */}
                    <Card sx={{ 
                        gridColumn: { xs: '1', sm: '1 / span 2', md: '2 / span 2' },
                        height: '180px',
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 3,
                        '&:hover': {
                            boxShadow: 6,
                        },
                        display: 'flex',
                        flexDirection: 'row'
                    }}>
                        <CardContent sx={{ 
                            backgroundColor: 'background.paper',
                            color: 'text.primary',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'row',
                            padding: '16px',
                            gap: 3
                        }}>
                            {/* Left side - Text content */}
                            <Box sx={{ 
                                flex: '0 0 auto',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                minWidth: '160px',
                                maxWidth: '180px'
                            }}>
                                <h3 style={{ margin: '0 0 3px 0', fontSize: '18px' }}>Migrate</h3>
                                <p style={{ fontSize: '13px', margin: '0', color: 'text.secondary', lineHeight: 1.3 }}>
                                    Migrate from your existing data platform
                                </p>
                            </Box>
                            
                            {/* Right side - 4x2 Grid of icons */}
                            <Grid container spacing={0.5} sx={{ flex: 1 }}>
                                <Grid item xs={3}>
                                    <MigrationOptionButton
                                        icon="/docs/images/logo-postgres.svg"
                                        link="/docs/integrations/postgresql"
                                    >
                                        Postgres
                                    </MigrationOptionButton>
                                </Grid>
                                <Grid item xs={3}>
                                    <MigrationOptionButton 
                                        icon="/docs/images/logo-snowflake.svg"
                                        link="/docs/migrations/snowflake"
                                    >
                                        Snowflake
                                    </MigrationOptionButton>
                                </Grid>
                                <Grid item xs={3}>
                                    <MigrationOptionButton 
                                        icon="/docs/images/logo-bigquery.svg"
                                        link="/docs/migrations/bigquery"
                                    >
                                        BigQuery
                                    </MigrationOptionButton>
                                </Grid>
                                <Grid item xs={3}>
                                    <MigrationOptionButton 
                                        icon="/docs/images/logo-redshift.svg"
                                        link="/docs/integrations/redshift"
                                    >
                                        Redshift
                                    </MigrationOptionButton>
                                </Grid>
                                <Grid item xs={3}>
                                    <MigrationOptionButton 
                                        icon="/docs/images/logo-mysql.svg"
                                        link="/docs/integrations/mysql"
                                    >
                                        MySQL
                                    </MigrationOptionButton>
                                </Grid>
                                <Grid item xs={3}>
                                    <MigrationOptionButton 
                                        icon="/docs/images/logo-s3.svg"
                                        link="/docs/integrations/s3"
                                    >
                                        S3
                                    </MigrationOptionButton>
                                </Grid>
                                <Grid item xs={3}>
                                    <MigrationOptionButton 
                                        icon="/docs/images/logo-snowflake.svg"
                                        link="/docs/migrations/snowflake"
                                    >
                                        Snowflake
                                    </MigrationOptionButton>
                                </Grid>
                                <Grid item xs={3}>
                                    <MigrationOptionButton 
                                        icon="/docs/images/logo-bigquery.svg"
                                        link="/docs/migrations/bigquery"
                                    >
                                        BigQuery
                                    </MigrationOptionButton>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
                
            </Box>
        </div>
    );
}
const HelloContent = () => {
    const { colorMode } = useColorMode();
    
    const theme = createTheme({
        palette: {
            mode: colorMode === 'dark' ? 'dark' : 'light',
            primary: {
                main: '#faff69',
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