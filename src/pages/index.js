import React from 'react';
import Layout from '@theme/Layout';
import homepage_styles from './homepage_styles.module.scss'
import {useColorMode} from "@docusaurus/theme-common";
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useVersions } from '@site/src/hooks/useVersions';
import ClickHouseLogoDark from '@site/static/img/ch_logo_docs_dark.svg';
import ClickHouseLogoLight from '@site/static/img/ch_logo_docs.svg';
import ClickHouseLogo from '@site/src/icons/ClickHouseLogo';
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

// Migration Option Button Component with Gradient Overlay
const MigrationOptionButton = ({ icon, link, children }) => {
    return (
        <Card 
            component={Link}
            to={link}
            sx={{
                width: '100%',
                height: '100%',
                aspectRatio: '1',
                position: 'relative',
                display: 'flex',
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: 2,
                borderRadius: 1,
                overflow: 'hidden',
                '&:hover': {
                    textDecoration: 'none',
                    color: 'inherit',
                    boxShadow: 4,
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease-in-out'
                }
            }}
        >
            {/* Background Image/Icon */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'background.paper',
                }}
            >
                <img 
                    src={useBaseUrl(icon)} 
                    alt={children}
                    style={{ 
                        width: '40px', 
                        height: '40px', 
                        objectFit: 'contain',
                        opacity: 0.7 
                    }}
                />
            </Box>
            
            {/* Gradient Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0) 40%)',
                }}
            />
            
            {/* Content */}
            <CardContent sx={{ 
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                flex: 1,
                padding: '8px !important',
                minWidth: 0
            }}>
                <Typography variant="body2" sx={{ 
                    fontWeight: 600, 
                    fontSize: '12px', 
                    lineHeight: 1.1,
                    color: '#fff',
                    textAlign: 'center',
                    textShadow: '0 1px 2px rgba(0,0,0,0.7)'
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
        // Open Kapa widget with the correct API
        if (window.Kapa && window.Kapa.open) {
            window.Kapa.open({
                mode: "ai"
            });
        } else {
            console.warn('Kapa widget not available. Make sure the widget script has loaded.');
        }
    };

    const LogoComponent = colorMode === 'dark' ? ClickHouseLogoDark : ClickHouseLogoLight;

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            alignItems: 'center',
            minHeight: '260px',
            padding: '10px 16px 0px 16px',
            maxWidth: '1000px',
            margin: '0 auto',
            gap: 3,
            '@media (max-width: 768px)': {
                gridTemplateColumns: '1fr',
                textAlign: 'center',
                padding: '60px 24px 30px 24px',
                gap: 3
            }
        }}>
            {/* Left side - Logo and Text (matches Get Started column width) */}
            <Box sx={{ 
                '@media (max-width: 768px)': {
                    gridColumn: '1'
                }
            }}>
                <Box sx={{ marginBottom: 2 }}>
                    <ClickHouseLogo />
                </Box>
                <Typography 
                    variant="h5" 
                    sx={{ 
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                        fontWeight: 400,
                        color: 'text.secondary',
                        lineHeight: 1.4
                    }}
                >
                    Documentation for the fastest and most resource efficient real-time data warehouse and open-source database.
                </Typography>
            </Box>
            
            {/* Right side - Search and Ask AI (spans Learn and Reference columns) */}
            <Box sx={{ 
                gridColumn: { xs: '1', sm: '1 / span 2', md: '2 / span 2' },
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                padding: '0 60px',
                '@media (max-width: 768px)': {
                    gridColumn: '1',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 2,
                    padding: '0'
                }
            }}>
                <Box sx={{ flex: 1, maxWidth: '500px' }}>
                    <SearchBar/>
                </Box>
                <Button
                    variant="contained"
                    onClick={handleAskAIClick}
                    sx={{
                        height: '36px',
                        minWidth: '100px',
                        borderRadius: '8px',
                        padding: '8px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        textTransform: 'none',
                        backgroundColor: '#faff69',
                        color: '#000000',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        fontWeight: 600,
                        flexShrink: 0,
                        '&:hover': {
                            backgroundColor: '#f5f464',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                        },
                    }}
                >
                    <img 
                        src={useBaseUrl('/images/homepage/ai.png')} 
                        alt="Ask AI"
                        style={{ 
                            width: '16px', 
                            height: '16px', 
                            objectFit: 'contain',
                            filter: 'brightness(0)'
                        }}
                    />
                    Ask AI
                </Button>
            </Box>
        </Box>
    );
}
const NavatticDemoSection = () => {
    return(
        <div className={homepage_styles.navatticDemoSection}>
            <NavatticDemo/>
        </div>
    )
};

const ExploreDocs = () => {
    const { colorMode } = useColorMode();
    const versions = useVersions();
    const versionColor = colorMode === 'dark' ? '#faff69' : '#1976d2';
    
    return (
        <div className={homepage_styles.exploreDocs}>
            <Box sx={{ 
                padding: '0 16px',
                minHeight: '400px',
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                {/* Unified Grid Layout */}
                <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gridTemplateRows: 'auto auto auto auto auto',
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
                                    <Link to="/getting-started/quick-start/cloud" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Quick start</Link>
                                    <Link to="/cloud/get-started" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>ClickHouse Cloud</Link>
                                    <Link to="/install" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Installation</Link>
                                    <Link to="/deployment-modes" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Deployment modes</Link>
                                    <Link to="/getting-started/example-datasets" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Example datasets</Link>
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
                                    <Link to="/managing-data/core-concepts" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Core concepts</Link>
                                    <Link to="/data-modeling/overview" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Data modelling</Link>
                                    <Link to="/best-practices" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Best practices</Link>
                                    <Link to="/operations/overview" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Performance & optimization</Link>
                                    <Link to="/guides/developer/overview" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Advanced guides</Link>
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
                                color: 'text.primary',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div>
                                    <h3>Reference</h3>
                                    <p>Reference docs for everyday use</p>
                                </div>
                                <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                    <Link to="/sql-reference/statements" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>SQL reference</Link>
                                    <Link to="/sql-reference/functions" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Functions</Link>
                                    <Link to="/engines" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Engines</Link>
                                    <Link to="/sql-reference/data-types" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Data types</Link>
                                    <Link to="/operations/settings/settings" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Settings</Link>
                                    <Link to="/operations/server-configuration-parameters/settings" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Server settings</Link>
                                    <Link to="/operations/system-tables" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>System tables</Link>
                                </div>
                            </CardContent>
                        </CardActionArea>
                    </Card>

                    {/* Migrate Card - Row 2, Columns 1-2 (spans 2 columns) */}
                    <Card sx={{ 
                        gridColumn: { xs: '1', sm: '1 / span 2', md: '1 / span 2' },
                        height: '180px',
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 3,
                        '&:hover': {
                            boxShadow: 6,
                        },
                        display: 'flex',
                        flexDirection: 'row',
                        overflow: 'hidden'
                    }}>
                        {/* Left side - Full height image outside padding */}
                        <CardMedia
                            component="img"
                            sx={{ 
                                width: 120,
                                height: '100%',
                                objectFit: 'cover',
                                flexShrink: 0
                            }}
                            image={useBaseUrl('/images/homepage/migration_icon.png')}
                            alt="Migration"
                        />
                        
                        <CardContent sx={{ 
                            backgroundColor: 'background.paper',
                            color: 'text.primary',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'row',
                            padding: '16px',
                            gap: 3
                        }}>
                            {/* Text content */}
                            <Box sx={{ 
                                flex: '0 0 auto',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                minWidth: '160px',
                                maxWidth: '180px'
                            }}>
                                <h3 style={{ margin: '0 0 3px 0', fontSize: '18px' }}>Migrate</h3>
                                <p style={{ fontSize: '13px', margin: '0 0 0 0', color: 'text.secondary', lineHeight: 1.3 }}>
                                    Get your data into ClickHouse
                                </p>
                                <Link 
                                    to="/docs/integrations" 
                                    style={{ 
                                        fontSize: '11px', 
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        opacity: 0.8
                                    }}
                                >
                                    View all integrations →
                                </Link>
                            </Box>
                            
                            {/* Right side - 3x2 Grid of square gradient cards */}
                            <Box sx={{ 
                                flex: 1, 
                                display: 'flex', 
                                justifyContent: 'flex-end',
                                alignItems: 'center'
                            }}>
                                <Box sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gridTemplateRows: 'repeat(2, 1fr)',
                                    gap: 1,
                                    width: '100%',
                                    maxWidth: '320px',
                                    height: '100%'
                                }}>
                                    <MigrationOptionButton
                                        icon="/docs/images/logo-postgres.svg"
                                        link="/docs/integrations/clickpipes/postgres"
                                    >
                                        Postgres
                                    </MigrationOptionButton>
                                    <MigrationOptionButton 
                                        icon="/docs/images/logo-snowflake.svg"
                                        link="/docs/migrations/snowflake"
                                    >
                                        Snowflake
                                    </MigrationOptionButton>
                                    <MigrationOptionButton 
                                        icon="/docs/images/logo-bigquery.svg"
                                        link="/docs/migrations/bigquery"
                                    >
                                        BigQuery
                                    </MigrationOptionButton>
                                    <MigrationOptionButton 
                                        icon="/docs/images/logo-redshift.svg"
                                        link="/docs/integrations/redshift"
                                    >
                                        Redshift
                                    </MigrationOptionButton>
                                    <MigrationOptionButton 
                                        icon="/docs/images/logo-mysql.svg"
                                        link="/docs/integrations/clickpipes/mysql"
                                    >
                                        MySQL
                                    </MigrationOptionButton>
                                    <MigrationOptionButton 
                                        icon="/docs/images/logo-elastic.svg"
                                        link="/docs/use-cases/observability/clickstack/migration/elastic"
                                    >
                                        Elastic
                                    </MigrationOptionButton>
                                    <MigrationOptionButton 
                                        icon="/docs/images/logo-mongo.svg"
                                        link="/docs/integrations/clickpipes/mongodb"
                                    >
                                        Mongo
                                    </MigrationOptionButton>
                                    <MigrationOptionButton
                                        icon="/docs/images/logo-druid.png"
                                        link="/docs"
                                    >
                                        Druid
                                    </MigrationOptionButton>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Featured Section Title - Row 3, spans all 3 columns */}
                    <Box sx={{ 
                        gridRow: 3,
                        gridColumn: { xs: '1', sm: '1 / span 2', md: '1 / span 3' },
                        marginBottom: 1,
                        marginTop: 2
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '24px' }}>
                            Featured
                        </Typography>
                    </Box>

                    {/* Featured Card 1 - Row 4, Column 1 */}
                    <Card 
                        component={Link}
                        to="/integrations/clickpipes/mongodb"
                        sx={{ 
                            gridRow: 4,
                            gridColumn: 1,
                            height: '300px',
                            backgroundColor: 'background.paper',
                            color: 'text.primary',
                            boxShadow: 3,
                            textDecoration: 'none',
                            '&:hover': {
                                boxShadow: 6,
                                textDecoration: 'none',
                                color: 'inherit',
                            },
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                        <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                            <CardMedia
                                component="img"
                                height="100"
                                sx={{ width: '100%' }}
                                image={useBaseUrl('/images/homepage/mongodb_feature.png')}
                                alt="Feature 1"
                            />
                            <CardContent sx={{ 
                                color: 'text.primary',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2',
                                                padding: '1px 6px',
                                                borderRadius: '8px',
                                                fontSize: '9px',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.3px'
                                            }}
                                        >
                                            Tutorial
                                        </Typography>
                                    </Box>
                                    <h3>MongoDB CDC to ClickHouse with Native JSON Support</h3>
                                    <p>We're excited to announce the private preview of the MongoDB Change Data Capture (CDC) connector in ClickPipes! Enabling customers to replicate their MongoDB collections to ClickHouse Cloud in just a few clicks. </p>
                                </div>
                                <Link
                                    to="/integrations/clickpipes/mongodb"
                                    style={{
                                        color: 'var(--click-color-link)',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        marginTop: 'auto',
                                        paddingTop: '8px',
                                        display: 'block'
                                    }}
                                >
                                    Read more →
                                </Link>
                            </CardContent>
                        </CardActionArea>
                    </Card>

                    {/* Featured Card 2 - Row 4, Column 2 */}
                    <Card 
                        component={Link}
                        to="/use-cases/AI/MCP/remote_mcp"
                        sx={{ 
                            gridRow: 4,
                            gridColumn: 2,
                            height: '300px',
                            backgroundColor: 'background.paper',
                            color: 'text.primary',
                            boxShadow: 3,
                            textDecoration: 'none',
                            '&:hover': {
                                boxShadow: 6,
                                textDecoration: 'none',
                                color: 'inherit',
                            },
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                        <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                            <CardMedia
                                component="img"
                                height="100"
                                sx={{ width: '100%' }}
                                image={useBaseUrl('/images/homepage/remote_mcp_featured.png')}
                                alt="Feature 2"
                            />
                            <CardContent sx={{ 
                                color: 'text.primary',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                backgroundColor: '#fff3e0',
                                                color: '#f57c00',
                                                padding: '1px 6px',
                                                borderRadius: '8px',
                                                fontSize: '9px',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.3px'
                                            }}
                                        >
                                            Guide
                                        </Typography>
                                    </Box>
                                    <h3>Enabling the ClickHouse Cloud Remote MCP Server</h3>
                                    <p>This guide explains how to enable and use the ClickHouse Cloud Remote MCP Server. We will use Claude Code as an MCP Client for this example.</p>
                                </div>
                                <Link
                                    to="/use-cases/AI/MCP/remote_mcp"
                                    style={{
                                        color: 'var(--click-color-link)',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        marginTop: 'auto',
                                        paddingTop: '8px',
                                        display: 'block'
                                    }}
                                >
                                    Read more →
                                </Link>
                            </CardContent>
                        </CardActionArea>
                    </Card>

                    {/* Featured Card 3 - Row 4, Column 3 */}
                    <Card 
                        component={Link}
                        to="/best-practices/use-json-where-appropriate"
                        sx={{ 
                            gridRow: 4,
                            gridColumn: 3,
                            height: '300px',
                            backgroundColor: 'background.paper',
                            color: 'text.primary',
                            boxShadow: 3,
                            textDecoration: 'none',
                            '&:hover': {
                                boxShadow: 6,
                                textDecoration: 'none',
                                color: 'inherit',
                            },
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                        <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                            <CardMedia
                                component="img"
                                height="100"
                                sx={{ width: '100%' }}
                                image={useBaseUrl('/images/homepage/json_featured.png')}
                                alt="Feature 3"
                            />
                            <CardContent sx={{ 
                                color: 'text.primary',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                backgroundColor: '#e8f5e8',
                                                color: '#2e7d32',
                                                padding: '1px 6px',
                                                borderRadius: '8px',
                                                fontSize: '9px',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.3px'
                                            }}
                                        >
                                            Best Practice
                                        </Typography>
                                    </Box>
                                    <h3>Use JSON where appropriate</h3>
                                    <p>Wondering when to use the native JSON type over other types? In this guide we'll explain when you should and shouldn't make use of JSON.</p>
                                </div>
                                <Link
                                    to="/best-practices/use-json-where-appropriate"
                                    style={{
                                        color: 'var(--click-color-link)',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        marginTop: 'auto',
                                        paddingTop: '8px',
                                        display: 'block'
                                    }}
                                >
                                    Read more →
                                </Link>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                    
                    {/* Changelog Cards Container - Row 2, Column 3 */}
                    <Box sx={{ 
                        gridRow: 2,
                        gridColumn: 3,
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

export default function Home() {
    return (
        <Layout title="ClickHouse Docs" description="ClickHouse Documentation - The fastest and most resource efficient real-time data warehouse">
            <HelloContent />
        </Layout>
    );
}