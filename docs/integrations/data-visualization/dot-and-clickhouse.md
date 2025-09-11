---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['clickhouse', 'dot', 'ai', 'chatbot', 'mysql', 'integrate', 'ui', 'virtual assistant']
description: 'AI Chatbot | Dot is an intelligent virtual data assistant that answers business data questions, retrieves definitions and relevant data assets, and can even assist with data modelling, powered by ClickHouse.'
title: 'Dot'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import dot_03 from '@site/static/images/integrations/data-visualization/dot_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Dot

<CommunityMaintainedBadge/>

[Dot](https://www.getdot.ai/) is an intelligent **AI Data Analyst**. It connects directly to ClickHouse so you can ask business questions in plain English, discover data assets, validate definitions, and even assist with modelling — all through a conversational interface.

---

## Connecting Dot to ClickHouse {#connecting-dot-to-clickhouse}

<Image size="md" img={dot_01} alt="Configuring ClickHouse connection in Dot" border />
<br/>

1. In the Dot UI, go to **Settings → Connections**.  
2. Click on ***Add new connection*** and select **ClickHouse** as your data source.  
3. Enter the connection details:  
   - **Host**: ClickHouse server hostname or ClickHouse Cloud endpoint  
   - **Port**: `9440` (secure native interface) or `9000` (default TCP)  
   - **Username / Password**: a user with read access to your data  
   - **Database**: optionally set a default schema  
4. Click **Connect**.

<div style={{display: 'flex', gap: '20px'}}>
  <Image img={dot_02} alt="Dot generating SQL against ClickHouse" />
  <Image img={dot_03} alt="Browsing ClickHouse schemas and definitions in Dot" />
</div>
<br/>

---

## Querying Data with Dot {#querying-data-with-dot}

Once connected, Dot translates natural language questions into SQL queries against your ClickHouse instance. Examples:

- *“What are the top 10 most active users in the last 7 days?”*  
- *“Show me daily revenue trends over the past 3 months.”*  
- *“How many new signups came from Germany last week?”*  


Dot allows you to preview and edit the generated SQL before execution, ensuring accuracy and transparency.

---

## Data Discovery and Definitions {#data-discovery}

Dot isn’t just for queries — it helps with **schema exploration** and **data governance**:

- Browse databases, tables, and columns directly from ClickHouse  
- See column definitions and data types  
- Retrieve metric definitions and contextual metadata  
- Understand how fields are used across queries and dashboards  


This makes self-service easier for analysts and business users, while keeping data teams in control.

---

## Security and Governance {#security}

Dot is designed with enterprise readiness in mind:

- **Permissions & roles**: Dot respects ClickHouse’s native user roles and access controls  
- **Row-level security**: Supported where configured in ClickHouse  
- **TLS / SSL**: For ClickHouse Cloud, SSL is enabled by default; for on-premise, enable TLS manually  
- **Governance & validation**: Dot includes a training/validation space to reduce errors and keep data teams in control  
- **Compliance**: Dot is SOC 2 Type I certified  

---

## Supported Integrations Beyond ClickHouse {#integrations}

In addition to ClickHouse, Dot also integrates with:

- Data warehouses: Snowflake, BigQuery, Redshift, Databricks, AWS Athena, PostgreSQL, MySQL, SAP HANA, Motherduck/DuckDB  
- Semantic layers: dbt Semantic Layer, Looker  
- BI tools: Tableau, Metabase  
- Communication: Slack, Microsoft Teams  

This makes Dot a versatile layer on top of your modern data stack.

---

Now you can use **ClickHouse + Dot** to explore, validate, and analyze your data conversationally — combining high-performance analytics with AI-driven accessibility.