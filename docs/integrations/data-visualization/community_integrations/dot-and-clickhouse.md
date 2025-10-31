---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['clickhouse', 'dot', 'ai', 'chatbot', 'mysql', 'integrate', 'ui', 'virtual assistant']
description: 'AI Chatbot | Dot is an intelligent virtual data assistant that answers business data questions, retrieves definitions and relevant data assets, and can even assist with data modelling, powered by ClickHouse.'
title: 'Dot'
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Dot

<CommunityMaintainedBadge/>

[Dot](https://www.getdot.ai/) is your **AI Data Analyst**.
It connects directly to ClickHouse so you can ask data questions in natural language, discover data, test hypotheses, and answer why questions — directly in Slack, Microsoft Teams, ChatGPT or the native Web UI.

## Pre-requisites {#pre-requisites}

- A ClickHouse database, either self-hosted or in [ClickHouse Cloud](https://clickhouse.com/cloud)  
- A [Dot](https://www.getdot.ai/) account  
- A [Hashboard](https://www.hashboard.com/) account and project.

## Connecting Dot to ClickHouse {#connecting-dot-to-clickhouse}

<Image size="md" img={dot_01} alt="Configuring ClickHouse connection in Dot (light mode)" border />
<br/>

1. In the Dot UI, go to **Settings → Connections**.  
2. Click on **Add new connection** and select **ClickHouse**.  
3. Provide your connection details:  
   - **Host**: ClickHouse server hostname or ClickHouse Cloud endpoint  
   - **Port**: `9440` (secure native interface) or `9000` (default TCP)  
   - **Username / Password**: user with read access  
   - **Database**: optionally set a default schema  
4. Click **Connect**.

<Image img={dot_02} alt="Connecting ClickHouse" size="sm"/>

Dot uses **query-pushdown**: ClickHouse handles the heavy number-crunching at scale, while Dot ensures correct and trusted answers.

## Highlights {#highlights}

Dot makes data accessible through conversation:

- **Ask in natural language**: Get answers without writing SQL.  
- **Why analysis**: Ask follow-up questions to understand trends and anomalies.  
- **Works where you work**: Slack, Microsoft Teams, ChatGPT, or the web app.  
- **Trusted results**: Dot validates queries against your schemas and definitions to minimize errors.  
- **Scalable**: Built on query-pushdown, pairing Dot’s intelligence with ClickHouse’s speed.

## Security and governance {#security}

Dot is enterprise-ready:

- **Permissions & roles**: Inherits ClickHouse user access controls  
- **Row-level security**: Supported if configured in ClickHouse  
- **TLS / SSL**: Enabled by default for ClickHouse Cloud; configure manually for self-hosted  
- **Governance & validation**: Training/validation space helps prevent hallucinations  
- **Compliance**: SOC 2 Type I certified

## Additional resources {#additional-resources}

- Dot website: [https://www.getdot.ai/](https://www.getdot.ai/)  
- Documentation: [https://docs.getdot.ai/](https://docs.getdot.ai/)  
- Dot app: [https://app.getdot.ai/](https://app.getdot.ai/)  

Now you can use **ClickHouse + Dot** to analyze your data conversationally — combining Dot’s AI assistant with ClickHouse’s fast, scalable analytics engine.
