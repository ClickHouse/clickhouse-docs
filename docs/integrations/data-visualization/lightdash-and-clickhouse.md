---
sidebar_label: 'Lightdash'
sidebar_position: 131
slug: /integrations/lightdash
keywords: ['clickhouse', 'lightdash', 'data visualization', 'BI', 'semantic layer', 'dbt', 'self-serve analytics', 'connect']
description: 'Lightdash is a modern open-source BI tool built on top of dbt, enabling teams to explore and visualize data from ClickHouse through a semantic layer. Learn how to connect Lightdash to ClickHouse for fast, governed analytics powered by dbt.'
title: 'Connecting Lightdash to ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import lightdash_01 from '@site/static/images/integrations/data-visualization/lightdash_01.png';
import lightdash_02 from '@site/static/images/integrations/data-visualization/lightdash_02.png';
import lightdash_03 from '@site/static/images/integrations/data-visualization/lightdash_03.png';
import lightdash_04 from '@site/static/images/integrations/data-visualization/lightdash_04.png';
import lightdash_05 from '@site/static/images/integrations/data-visualization/lightdash_05.png';
import lightdash_06 from '@site/static/images/integrations/data-visualization/lightdash_06.png';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Lightdash

<PartnerBadge/>

Lightdash is the **AI-first BI platform** built for modern data teams, combining the openness of dbt with the performance of ClickHouse. By connecting ClickHouse to Lightdash, teams get an **AI-powered self-serve analytics experience** grounded in their dbt semantic layer, so every question is answered with governed, consistent metrics.

Developers love Lightdash for its open architecture, version-controlled YAML models, and integrations that fit directly into their workflow - from GitHub to the IDE.

This partnership brings together **ClickHouse’s speed** and **Lightdash’s developer experience**, making it easier than ever to explore, visualize, and automate insights with AI.

## Build an interactive dashboard with Lightdash and ClickHouse {#build-an-interactive-dashboard}

In this guide, you’ll see how **Lightdash** connects to **ClickHouse** to explore your dbt models and build interactive dashboards.  
The example below shows a finished dashboard powered by data from ClickHouse.

<Image size="md" img={lightdash_02} alt="Lightdash dashboard example" border />

<VerticalStepper headerLevel="h3">

### Gather connection data {#connection-data-required}

When setting up your connection between Lightdash and ClickHouse, you’ll need the following details:

- **Host:** The address where your ClickHouse database is running  
- **User:** Your ClickHouse database username  
- **Password:** Your ClickHouse database password  
- **DB name:** The name of your ClickHouse database  
- **Schema:** The default schema used by dbt to compile and run your project (found in your `profiles.yml`)  
- **Port:** The ClickHouse HTTPS interface port (default: `8443`)  
- **Secure:** Enable this option to use HTTPS/SSL for secure connections  
- **Retries:** Number of times Lightdash retries failed ClickHouse queries (default: `3`)  
- **Start of week:** Choose which day your reporting week starts; defaults to your warehouse setting

<ConnectionDetails />

---

### Configure your dbt profile for ClickHouse {#configuring-your-dbt-profile-for-clickhouse}

In Lightdash, connections are based on your existing **dbt project**.  
To connect ClickHouse, make sure your local `~/.dbt/profiles.yml` file contains a valid ClickHouse target configuration.

For example:

<Image size="md" img={lightdash_01} alt="Example profiles.yml configuration for a lightdash-clickhouse project" border />
<br/>

### Create a Lightdash project connected to ClickHouse {#creating-a-lightdash-project-connected-to-clickhouse}

Once your dbt profile is configured for ClickHouse, you’ll also need to connect your **dbt project** to Lightdash.

Because this process is the same for all data warehouses, we won’t go into detail here — you can follow the official Lightdash guide for importing a dbt project:

[Import a dbt project → Lightdash Docs](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#2-import-a-dbt-project?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

After connecting your dbt project, Lightdash will automatically detect your ClickHouse configuration from the `profiles.yml` file. Once the connection test succeeds, you’ll be able to start exploring your dbt models and building dashboards powered by ClickHouse.

---

### Explore your ClickHouse data in Lightdash {#exploring-your-clickhouse-data-in-lightdash}

Once connected, Lightdash automatically syncs your dbt models and exposes:

- **Dimensions** and **measures** defined in YAML  
- **Semantic layer logic**, such as metrics, joins, and explores  
- **Dashboards** powered by real-time ClickHouse queries  

You can now build dashboards, share insights, and even use **Ask AI** to generate visualizations directly on top of ClickHouse — no manual SQL required.

---

### Define metrics and dimensions in Lightdash {#defining-metrics-and-dimensions-in-lightdash}

In Lightdash, all **metrics** and **dimensions** are defined directly in your dbt model `.yml` files. This makes your business logic version-controlled, consistent, and fully transparent.

<Image size="md" img={lightdash_03} alt="Example of metrics being defined in the .yml file" border />
<br/>

Defining these in YAML ensures your team is using the same definitions across dashboards and analyses. For example, you can create reusable metrics like `total_order_count`, `total_revenue`, or `avg_order_value` right next to your dbt models — no duplication required in the UI.

To learn more about how to define these, see the following Lightdash guides:  
- [How to create metrics](https://docs.lightdash.com/guides/how-to-create-metrics?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)  
- [How to create dimensions](https://docs.lightdash.com/guides/how-to-create-dimensions?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### Query your data from tables {#querying-your-data-from-tables}

Once your dbt project is connected and synced with Lightdash, you can start exploring data directly from your **tables** (or “explores”).  
Each table represents a dbt model and includes the metrics and dimensions you’ve defined in YAML.

The **Explore** page is made up of five main areas:

1. **Dimensions and Metrics** — all fields available on the selected table  
2. **Filters** — restrict the data returned by your query  
3. **Chart** — visualize your query results  
4. **Results** — view the raw data returned from your ClickHouse database  
5. **SQL** — inspect the generated SQL query behind your results  

<Image size="lg" img={lightdash_04} alt="Lightdash Explore view showing dimensions, filters, chart, results, and SQL" border />

From here, you can build and adjust queries interactively — dragging and dropping fields, adding filters, and switching between visualization types such as tables, bar charts, or time series.

For a deeper look at explores and how to query from your tables, see:  
[An intro to tables and the Explore page → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/using-explores#an-intro-to-tables-and-the-explore-page?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### Build dashboards {#building-dashboards}

Once you’ve explored your data and saved visualizations, you can combine them into **dashboards** to share with your team.

Dashboards in Lightdash are fully interactive — you can apply filters, add tabs, and view charts powered by real-time ClickHouse queries.

You can also create new charts **directly from within a dashboard**, which helps keep your projects organized and clutter-free. Charts created this way are **exclusive to that dashboard** — they can’t be reused elsewhere in the project.

To create a dashboard-only chart:
1. Click **Add tile**  
2. Select **New chart**  
3. Build your visualization in the chart builder  
4. Save it — it will appear at the bottom of your dashboard  

<Image size="lg" img={lightdash_05} alt="Creating and organizing charts within a Lightdash dashboard" border />

Learn more about how to create and organize dashboards here:  
[Building dashboards → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/dashboards?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### Ask AI: self-serve analytics powered by dbt {#ask-ai}

**AI Agents** in Lightdash make data exploration truly self-serve.  
Instead of writing queries, users can simply ask questions in plain language — like *“What was our monthly revenue growth?”* — and the AI Agent automatically generates the right visualization, referencing your dbt-defined metrics and models to ensure accuracy and consistency.

It’s powered by the same semantic layer you use in dbt, meaning every answer stays governed, explainable, and fast — all backed by ClickHouse.

<Image size="lg" img={lightdash_06} alt="Lightdash Ask AI interface showing natural language query powered by dbt metrics" border />

:::tip
Learn more about AI Agents here: [AI Agents → Lightdash Docs](https://docs.lightdash.com/guides/ai-agents?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)
:::
</VerticalStepper>

## Learn more {#learn-more}

To learn more about connecting dbt projects to Lightdash, visit the [Lightdash Docs → ClickHouse setup](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#clickhouse?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs).
