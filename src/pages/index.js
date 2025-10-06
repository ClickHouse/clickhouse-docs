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

// ClickHouse Style Arrow Button Component
const ClickHouseArrowButton = ({ to, children, sx = {} }) => {
    return (
        <Link
            to={to}
            style={{
                color: 'var(--ifm-link-color)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                ...sx
            }}
            onMouseEnter={(e) => {
                e.target.style.transform = 'translateX(2px)';
                e.target.style.color = 'var(--ifm-link-hover-color)';
            }}
            onMouseLeave={(e) => {
                e.target.style.transform = 'translateX(0px)';
                e.target.style.color = 'var(--ifm-link-color)';
            }}
        >
            {children}
            <span style={{ marginLeft: '2px' }}>→</span>
        </Link>
    );
};

// Migration Option Button Component - Clean Design
const MigrationOptionButton = ({ icon, link, children }) => {
    return (
        <Card
            component={Link}
            to={link}
            sx={{
                width: '100%',
                height: '100%',
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                color: 'inherit',
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                boxShadow: 'none',
                padding: 2,
                gap: 1,
                '&:hover': {
                    textDecoration: 'none',
                    color: 'inherit',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                }
            }}
        >
            {/* Logo */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                }}
            >
                <img
                    src={useBaseUrl(icon)}
                    alt={children}
                    style={{
                        width: '32px',
                        height: '32px',
                        objectFit: 'contain'
                    }}
                />
            </Box>

            {/* Label */}
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 500,
                    fontSize: '11px',
                    lineHeight: 1.2,
                    color: 'text.primary',
                    textAlign: 'center',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                }}
            >
                {children}
            </Typography>
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
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            alignItems: 'center',
            minHeight: '260px',
            padding: { xs: '60px 24px 30px 24px', md: '10px 16px 0px 16px' },
            maxWidth: '1000px',
            margin: '0 auto',
            gap: { xs: 2, md: 3 }
        }}>
            {/* Left side - Logo and Text (matches Get Started column width) */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-start' }
            }}>
                <Box sx={{
                    marginBottom: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    width: '100%',
                    '& svg': {
                        width: { xs: '260px', md: 'auto' },
                        height: 'auto'
                    }
                }}>
                    <ClickHouseLogo />
                </Box>
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.2rem' },
                        fontWeight: 400,
                        color: 'text.secondary',
                        lineHeight: 1.4,
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        textAlign: { xs: 'center', md: 'left' }
                    }}
                >
                    Documentation for the fastest and most resource efficient real-time data warehouse and open-source database.
                </Typography>
            </Box>

            {/* Right side - Search and Ask AI (spans Learn and Reference columns) */}
            <Box sx={{
                gridColumn: { md: '2 / span 2' },
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, md: 2 },
                padding: { xs: '0', md: '0 60px' },
                width: { xs: '100%', md: 'auto' }
            }}>
                <Box sx={{
                    flex: 1,
                    maxWidth: { xs: 'none', md: '500px' }
                }}>
                    <SearchBar/>
                </Box>
                <p style={{ margin: '0 4px', fontSize: '14px' }}>or</p>
                <Button
                    variant="contained"
                    onClick={handleAskAIClick}
                    sx={{
                        height: '36px',
                        minWidth: { xs: '90px', md: '100px' },
                        borderRadius: '8px',
                        padding: { xs: '8px 12px', md: '8px 20px' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        textTransform: 'none',
                        backgroundColor: '#FAFF6A',
                        color: '#000000',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        fontWeight: 600,
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        flexShrink: 0,
                        '&:hover': {
                            backgroundColor: '#FAFF6A',
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
    const versionColor = colorMode === 'dark' ? '#FAFF6A' : '#1976d2';
    
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
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gridTemplateRows: 'auto',
                    gap: 3
                }}>
                    {/* Get Started Card - Row 1, Column 1 */}
                    <Card sx={{
                        height: '300px',
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 3,
                        border: '1px solid',
                        borderColor: 'divider',
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
                                    <h3 style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Get Started</h3>
                                    <p style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Learn the basics of ClickHouse</p>
                                </div>
                                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                                    <Link to="/getting-started/quick-start/cloud" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Quick start</Link>
                                    <Link to="/cloud/get-started" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>ClickHouse Cloud</Link>
                                    <Link to="/install" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Installation</Link>
                                    <Link to="/deployment-modes" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Deployment modes</Link>
                                    <Link to="/getting-started/example-datasets" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Sample datasets</Link>
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
                        border: '1px solid',
                        borderColor: 'divider',
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
                                    <h3 style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Learn</h3>
                                    <p style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Explore concepts and best practices</p>
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
                        border: '1px solid',
                        borderColor: 'divider',
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
                                    <h3 style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Reference</h3>
                                    <p style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Reference docs for everyday use</p>
                                </div>
                                <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                    <div>
                                        <Link to="/sql-reference/statements" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>SQL reference</Link>
                                        <Link to="/sql-reference/functions" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Functions</Link>
                                        <Link to="/engines" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Engines</Link>
                                        <Link to="/sql-reference/data-types" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Data types</Link>
                                        <Link to="/operations/settings/settings" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Settings</Link>
                                    </div>
                                    <div>
                                        <Link to="/operations/server-configuration-parameters/settings" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Server settings</Link>
                                        <Link to="/operations/system-tables" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>System tables</Link>
                                        <Link to="/changelog/cloud" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Cloud changelog</Link>
                                        <Link to="/changelog/oss" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>OSS changelog</Link>
                                    </div>
                                </div>
                            </CardContent>
                        </CardActionArea>
                    </Card>

                    {/* Migrate Card - Row 2, Full Width (spans all 3 columns) */}
                    <Card sx={{
                        gridColumn: { xs: '1', md: '1 / span 3' },
                        height: { xs: 'auto', md: '180px' },
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                            boxShadow: 6,
                        },
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        overflow: 'hidden'
                    }}>
                        {/* Left side - Full height image outside padding */}
                        <CardMedia
                            component="img"
                            sx={{
                                width: { xs: '100%', md: 120 },
                                height: { xs: '100px', md: '100%' },
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
                            flexDirection: { xs: 'column', md: 'row' },
                            padding: '16px',
                            gap: 3
                        }}>
                            {/* Text content */}
                            <Box sx={{
                                flex: { xs: '1', md: '0 0 auto' },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                minWidth: { xs: 'auto', md: '160px' },
                                maxWidth: { xs: 'none', md: '180px' }
                            }}>
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Migrate</h3>
                                <p style={{ fontSize: '13px', margin: '0 0 0 0', color: 'text.secondary', lineHeight: 1.3, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                                    Get your data into ClickHouse
                                </p>
                                <ClickHouseArrowButton
                                    to="/docs/integrations"
                                    sx={{
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        opacity: 0.8,
                                        color: 'inherit'
                                    }}
                                >
                                    View all integrations
                                </ClickHouseArrowButton>
                            </Box>
                            
                            {/* Right side - Grid of migration options */}
                            <Box sx={{
                                flex: 1,
                                display: 'flex',
                                justifyContent: { xs: 'center', md: 'flex-end' },
                                alignItems: 'center'
                            }}>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'repeat(4, 1fr)', md: 'repeat(7, 1fr)' },
                                    gridTemplateRows: { xs: 'repeat(4, 1fr)', md: '1fr' },
                                    gap: 1,
                                    width: '100%',
                                    maxWidth: { xs: '320px', md: '480px' },
                                    height: { xs: 'auto', md: '100%' }
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
                                        icon="/img/integrations/logo_kafka.svg"
                                        link="/docs/integrations/kafka"
                                    >
                                        Kafka
                                    </MigrationOptionButton>
                                    <MigrationOptionButton
                                        icon="/images/integrations/logos/logo_redpanda.png"
                                        link="/docs/integrations/kafka/kafka-table-engine"
                                    >
                                        Redpanda
                                    </MigrationOptionButton>
                                    <MigrationOptionButton
                                        icon="/images/integrations/logos/amazon_s3_logo.svg"
                                        link="/docs/sql-reference/table-functions/s3"
                                    >
                                        S3
                                    </MigrationOptionButton>
                                    <MigrationOptionButton
                                        icon="/images/integrations/logos/gcs.svg"
                                        link="/docs/sql-reference/table-functions/gcs"
                                    >
                                        GCS
                                    </MigrationOptionButton>
                                    <MigrationOptionButton
                                        icon="/images/integrations/logos/deltalake.svg"
                                        link="/docs/sql-reference/table-functions/deltalake"
                                    >
                                        Delta
                                    </MigrationOptionButton>
                                    <MigrationOptionButton
                                        icon="/images/integrations/logos/iceberg.png"
                                        link="/docs/sql-reference/table-functions/iceberg"
                                    >
                                        Iceberg
                                    </MigrationOptionButton>
                                    <MigrationOptionButton
                                        icon="/images/integrations/logos/hudi.png"
                                        link="/docs/sql-reference/table-functions/hudi"
                                    >
                                        Hudi
                                    </MigrationOptionButton>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Featured Section Title - spans all columns */}
                    <Box sx={{
                        gridColumn: { xs: '1', md: '1 / span 3' },
                        marginBottom: 1,
                        marginTop: 2
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '24px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            Featured
                        </Typography>
                    </Box>

                    {/* Featured Card 1 */}
                    <Card
                        component={Link}
                        to="/integrations/clickpipes/mongodb"
                        sx={{
                            height: '350px',
                            backgroundColor: 'background.paper',
                            color: 'text.primary',
                            boxShadow: 3,
                            border: '1px solid',
                            borderColor: 'divider',
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
                                height="120"
                                sx={{ width: '100%', objectFit: 'cover' }}
                                image={useBaseUrl('/images/homepage/mongodb_feature.png')}
                                alt="Feature 1"
                            />
                            <CardContent sx={{ 
                                color: 'text.primary',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                                                letterSpacing: '0.3px',
                                                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                                            }}
                                        >
                                            Tutorial
                                        </Typography>
                                    </Box>
                                    <h3 style={{ marginBottom: '8px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>MongoDB CDC to ClickHouse with Native JSON Support</h3>
                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                        <p style={{ color: 'text.secondary', opacity: 0.8, margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>We're excited to announce the private preview of the MongoDB Change Data Capture (CDC) connector in ClickPipes! Enabling customers to replicate their MongoDB collections to ClickHouse Cloud in just a few clicks. </p>
                                    </Box>
                                </Box>
                                <ClickHouseArrowButton
                                    to="/integrations/clickpipes/mongodb"
                                    sx={{
                                        marginTop: 'auto',
                                        paddingTop: '8px',
                                        display: 'block'
                                    }}
                                >
                                    Read more
                                </ClickHouseArrowButton>
                            </CardContent>
                        </CardActionArea>
                    </Card>

                    {/* Featured Card 2 */}
                    <Card
                        component={Link}
                        to="/use-cases/AI/MCP/remote_mcp"
                        sx={{
                            height: '350px',
                            backgroundColor: 'background.paper',
                            color: 'text.primary',
                            boxShadow: 3,
                            border: '1px solid',
                            borderColor: 'divider',
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
                                height="120"
                                sx={{ width: '100%', objectFit: 'cover' }}
                                image={useBaseUrl('/images/homepage/remote_mcp_featured.png')}
                                alt="Feature 2"
                            />
                            <CardContent sx={{ 
                                color: 'text.primary',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                backgroundColor: '#FAFF6A',
                                                color: '#f57c00',
                                                padding: '1px 6px',
                                                borderRadius: '8px',
                                                fontSize: '9px',
                                                fontWeight: 600,
                                                letterSpacing: '0.3px',
                                                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                                            }}
                                        >
                                            Guide
                                        </Typography>
                                    </Box>
                                    <h3 style={{ marginBottom: '8px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Enabling the ClickHouse Cloud Remote MCP Server</h3>
                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                        <p style={{ color: 'text.secondary', opacity: 0.8, margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>This guide explains how to enable and use the ClickHouse Cloud Remote MCP Server. We will use Claude Code as an MCP Client for this example.</p>
                                    </Box>
                                </Box>
                                <ClickHouseArrowButton
                                    to="/use-cases/AI/MCP/remote_mcp"
                                    sx={{
                                        marginTop: 'auto',
                                        paddingTop: '8px',
                                        display: 'block'
                                    }}
                                >
                                    Read more
                                </ClickHouseArrowButton>
                            </CardContent>
                        </CardActionArea>
                    </Card>

                    {/* Featured Card 3 */}
                    <Card
                        component={Link}
                        to="/best-practices/use-json-where-appropriate"
                        sx={{
                            height: '350px',
                            backgroundColor: 'background.paper',
                            color: 'text.primary',
                            boxShadow: 3,
                            border: '1px solid',
                            borderColor: 'divider',
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
                                height="120"
                                sx={{ width: '100%', objectFit: 'cover' }}
                                image={useBaseUrl('/images/homepage/json_featured.png')}
                                alt="Feature 3"
                            />
                            <CardContent sx={{ 
                                color: 'text.primary',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                                                letterSpacing: '0.3px',
                                                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                                            }}
                                        >
                                            Best Practice
                                        </Typography>
                                    </Box>
                                    <h3 style={{ marginBottom: '8px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Use JSON where appropriate</h3>
                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                        <p style={{ color: 'text.secondary', opacity: 0.8, margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>Wondering when to use the native JSON type over other types? In this guide we'll explain when you should and shouldn't make use of JSON.</p>
                                    </Box>
                                </Box>
                                <ClickHouseArrowButton
                                    to="/best-practices/use-json-where-appropriate"
                                    sx={{
                                        marginTop: 'auto',
                                        paddingTop: '8px',
                                        display: 'block'
                                    }}
                                >
                                    Read more
                                </ClickHouseArrowButton>
                            </CardContent>
                        </CardActionArea>
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
                main: '#FAFF6A',
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