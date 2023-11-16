---
sidebar_label: Home
displayed_sidebar: docs
slug: /
sidebar_position: 1
title: ClickHouse Docs
keywords: [clickhouse, docs, knowledge base]
pagination_next: null
hide_title: true
id: home-page
---

import ClickHouseLogo from '@site/src/icons/ClickHouseLogo';
import IconCloud from '@site/src/icons/IconCloud';
import IconCluster from '@site/src/icons/IconCluster';
import IconDatasets from '@site/src/icons/IconDatasets';
import IconChangelog from '@site/src/icons/IconChangelog';
import IconSupport from '@site/src/icons/IconSupport';
import IconTerminal from '@site/src/icons/IconTerminal';
import IconSingleNode from '@site/src/icons/IconSingleNode';
import IconSQLConsole from '@site/src/icons/IconSQLConsole';
import IconLightning from '@site/src/icons/IconLightning';
import IconDownload from '@site/src/icons/IconDownload';

export const Hero = ({ children, color}) => {
    return (
        <div className='home-page-hero'>
            <div className='home-page-hero-left'>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '12px'}}>
                    <ClickHouseLogo width='220px' color='black' />
                </div>
                <div style={{fontSize: '16px', lineHeight: '1.4'}}>Learn how to use ClickHouse through guides, reference documentation, and videos</div>
            </div>
            <div className='home-page-hero-right'>
                <a href='/docs/en/getting-started/quick-start' className='home-page-hero-button'>
                    <div style={{fontWeight: '600', fontSize: '18px', marginBottom: '12px', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <div style={{ display: 'flex', float: 'left', margin: 0, marginRight: '8px'}}><IconLightning iconWidth={'24px'}/></div>
                        <div>Quick Start</div>
                    </div>
                    <div>Get started with ClickHouse in 5 minutes</div>
                </a>
                <a href='/docs/en/install' className='home-page-hero-button'>
                    <div style={{fontWeight: '600', fontSize: '18px', marginBottom: '12px', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <div style={{ display: 'flex', float: 'left', margin: 0, marginRight: '8px'}}><IconDownload iconWidth={'24px'}/></div>
                        <div>Install</div>
                    </div>
                    <div>Install guides for every platform</div>
                </a>
                <a href='https://clickhouse.com/cloud' className='home-page-hero-button'>
                    <div style={{fontWeight: '600', fontSize: '18px', marginBottom: '12px', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <div style={{ display: 'flex', float: 'left', margin: 0, marginRight: '8px'}}><IconCloud iconWidth={'24px'}/></div>
                        <div>Cloud</div>
                    </div>
                    <div>The fastest way to get started with ClickHouse</div>
                </a>
            </div>
        </div>
    )
}

export const HomePageOptionButton = ({ children, icon, iconWidth, svgIcon, link }) => {
    return (
        <a
            href={link || '#'}
            className='home-page-option-button'>
            <div className='home-page-option-icon'>
                {
                    svgIcon ? svgIcon : (
                        <img className='home-svg' src={icon} style={{width: iconWidth || '28px'}} />
                    )
                }
            </div>
            <div style={{ fontWeight: '500' }}>{children}</div>
        </a>
    )
}

export const ConnectToClickHouse = ({ children, color}) => {
    return (
        <div className='home-page-section'>
            <div className='home-page-section-left'>
                <div style={{fontWeight: '600', fontSize: '18px', marginBottom: '24px'}}>Connect to ClickHouse</div>
                <div style={{marginBottom: '12px'}}>Connect your application to ClickHouse in just a few minutes</div>
                <div><a href='/docs/en/interfaces/overview'>View all clients and drivers &rarr;</a></div>
            </div>
            <div>
                <div className='home-page-button-container'>
                    <HomePageOptionButton svgIcon={<IconTerminal iconWidth='28px' />} link='/docs/en/integrations/sql-clients/clickhouse-client-local'>ClickHouse CLI</HomePageOptionButton>
                    <HomePageOptionButton svgIcon={<IconSQLConsole iconWidth='28px' />} link='/docs/en/get-started/sql-console'>Cloud SQL Console</HomePageOptionButton>
                    <HomePageOptionButton icon='/docs/images/logo-nodejs.svg' link='/docs/en/integrations/language-clients/javascript'>Node.js</HomePageOptionButton>
                </div>
                <div className='home-page-button-container'>
                    <HomePageOptionButton icon='/docs/images/logo-java.svg' link='/docs/en/integrations/java'>Java</HomePageOptionButton>
                    <HomePageOptionButton icon='/docs/images/logo-python.svg' link='/docs/en/integrations/python'>Python</HomePageOptionButton>
                    <HomePageOptionButton icon='/docs/images/logo-go.svg' link='/docs/en/integrations/go'>Go</HomePageOptionButton>
                </div>
            </div>
        </div>
    )
}

export const MigrateToClickHouse = ({ children, color}) => {
    return (
        <div className='home-page-section'>
            <div className='home-page-section-left'>
                <div style={{fontWeight: '600', fontSize: '18px', marginBottom: '24px'}}>Migrate to ClickHouse</div>
                <div style={{marginBottom: '12px'}}>Load your data from other databases, data warehouses, and object storage</div>
                <div><a href='#'>View all integrations &rarr;</a></div>
            </div>
            <div>
                <div className='home-page-button-container'>
                    <HomePageOptionButton icon='/docs/images/logo-snowflake.svg' link='/docs/en/migrations/snowflake'>Snowflake</HomePageOptionButton>
                    <HomePageOptionButton icon='/docs/images/logo-bigquery.svg' link='/docs/en/migrations/bigquery'>BigQuery</HomePageOptionButton>
                    <HomePageOptionButton icon='/docs/images/logo-redshift.svg' link='/docs/en/integrations/redshift'>Redshift</HomePageOptionButton>
                </div>
                <div className='home-page-button-container'>
                    <HomePageOptionButton icon='/docs/images/logo-postgres.svg' link='/docs/en/integrations/postgresql'>Postgres</HomePageOptionButton>
                    <HomePageOptionButton icon='/docs/images/logo-mysql.svg' link='/docs/en/integrations/mysql'>MySQL</HomePageOptionButton>
                    <HomePageOptionButton icon='/docs/images/logo-s3.svg' link='/docs/en/integrations/s3'>S3</HomePageOptionButton>
                </div>
            </div>
        </div>
    )
}

export const DeployClickHouse = ({ children, color}) => {
    return (
        <div className='home-page-section'>
            <div className='home-page-section-left'>
                <div style={{fontWeight: '600', fontSize: '18px', marginBottom: '24px'}}>Deploy ClickHouse</div>
                <div style={{marginBottom: '12px'}}>Deploy ClickHouse to our cloud or on your own infrastructure</div>
            </div>
            <div className='home-page-button-container'>
                <HomePageOptionButton svgIcon={<IconCloud iconWidth='28px' />} link='https://clickhouse.com/cloud'>Cloud</HomePageOptionButton>
                <HomePageOptionButton svgIcon={<IconSingleNode iconWidth='28px' />} link='/docs/en/architecture/single-node-deployment'>Single Node Deployment</HomePageOptionButton>
                <HomePageOptionButton svgIcon={<IconCluster iconWidth='28px' />} link='/docs/en/architecture/cluster-deployment'>Cluster Deployment</HomePageOptionButton>
            </div>
        </div>
    )
}

export const MoreResources = ({ children, color}) => {
    return (
        <div className='home-page-section'>
            <div className='home-page-section-left'>
                <div style={{fontWeight: '600', fontSize: '18px', marginBottom: '10px'}}>Additional resources</div>
            </div>
            <div>
                <div className='home-page-button-container'>
                    <HomePageOptionButton svgIcon={<IconSupport iconWidth='28px' />} link='https://clickhouse.com/support/program'>Contact Support</HomePageOptionButton>
                    <HomePageOptionButton svgIcon={<IconChangelog iconWidth='28px' />} link='/docs/en/whats-new/changelog'>Changelog</HomePageOptionButton>
                    <HomePageOptionButton svgIcon={<IconDatasets iconWidth='28px' />} link='/docs/en/getting-started/example-datasets'>Sample Datasets</HomePageOptionButton>
                </div>
            </div>
        </div>
    )
}

export const HomeContainer = () => {
    return (
        <div className='home-container'>
            <Hero />
            <ConnectToClickHouse />
            <MigrateToClickHouse />
            <DeployClickHouse />
            <MoreResources />
        </div>
    )
}

<HomeContainer />
