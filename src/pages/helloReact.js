import React from 'react';
import Layout from '@theme/Layout';
import homepage_styles from './homepage_styles.module.scss'
import {useColorMode} from "@docusaurus/theme-common";
import Link from '@docusaurus/Link';
import BookIcon from '@site/static/img/book.svg';
import RocketIcon from '@site/static/img/rocket.svg';
import LightbulbOnIcon from '@site/static/img/lightbulb-on.svg';
import ClickHouseLogo from '@site/static/img/ch_logo_docs_dark.svg';
import SearchBar from '@theme/SearchBar';
import clsx from 'clsx';

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
    return (
        <div className={homepage_styles.exploreDocs}>
            <div className={homepage_styles.panel}>
                <div className={homepage_styles.panel_heading}>
                    <RocketIcon/>
                    <h2>Get started</h2>
                </div>
                <div className={homepage_styles.panel_links}>
                    <Link>What is ClickHouse?</Link>
                    <Link>Get started - Cloud</Link>
                    <Link>Get started - Self-managed</Link>
                    <Link>Install</Link>
                    <Link>Migration guide</Link>
                </div>
            </div>
            <div className={homepage_styles.panel}>
                <div className={homepage_styles.panel_heading}>
                    <LightbulbOnIcon/>
                    <h2>Learn</h2>
                </div>
                <div className={homepage_styles.panel_links}>
                    <Link>Concepts</Link>
                    <Link>Best practices</Link>
                    <Link>Use case guides</Link>
                    <Link>Example datasets</Link>
                </div>
            </div>
            <div className={homepage_styles.panel}>
                <div className={homepage_styles.panel_heading}>
                    <BookIcon/>
                    <h2>Reference</h2>
                </div>
                <div className={homepage_styles.panel_links}>
                    <Link>Syntax</Link>
                    <Link>Settings</Link>
                    <Link>Formats</Link>
                    <Link>Engines</Link>
                    <Link>Functions</Link>
                    <Link>Data types</Link>
                </div>
            </div>
        </div>
    );
}
export default function Hello() {
    return (
        <Layout title="Hello" description="Hello React Page">
            <div className={homepage_styles.topLevelContainer}>
                <div className={homepage_styles.yellowStrip}></div>
                <HeroSection/>
                <ExploreDocs/>
            </div>
        </Layout>
    );
}