---
sidebar_label: 'Querio'
slug: /integrations/querio
keywords: ['clickhouse', 'Querio', 'connect', 'integrate', 'analytics', 'AI']
description: 'Querio is an AI-native analytics and business intelligence workspace. Connect ClickHouse to Querio to explore, visualize, and analyze live data using SQL, Python, and AI.'
title: 'Connect ClickHouse to Querio'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import querio_01 from '@site/static/images/integrations/data-visualization/querio_clickhouse_01.png';
import querio_02 from '@site/static/images/integrations/data-visualization/querio_clickhouse_02.png';
import querio_03 from '@site/static/images/integrations/data-visualization/querio_clickhouse_03.png';
import querio_04 from '@site/static/images/integrations/data-visualization/querio_clickhouse_04.png';
import Image from '@theme/IdealImage';

# Connecting ClickHouse to Querio

Querio is an AI-powered analytics and business intelligence workspace that lets teams query, explore, visualize, and generate insights from data using SQL, Python, and natural language. When you connect Querio to your ClickHouse database or warehouse, you can run live analytics at scale and build boards, notebooks, and AI-assisted reports on your ClickHouse data without moving it.

<Image size="lg" img={querio_01} alt="Querio analytics workspace" border />

## Gather Your Connection Details

To connect Querio to ClickHouse you’ll need the following connection info:

| Parameter | Description |
|-----------|-------------|
| `HOST` | The address of your ClickHouse server or cluster |
| `PORT` | Typically the secure native protocol port (e.g., 9440) or HTTP port if using HTTP |
| `DATABASE` | The database you want Querio to query |
| `USERNAME` | A dedicated user account you’ve created for Querio |
| `PASSWORD` | The password for the user account |

**Note:** If you use ClickHouse Cloud, connection details can be found in your cloud console. Self-managed ClickHouse admin can supply connection parameters for your deployment environment.

## Create your Querio account and connect ClickHouse

Log in or create your Querio workspace at https://app.querio.ai/

1. In Querio, go to **Settings → Data Sources** and click **Add Data Source**.
   <Image size="lg" img={querio_02} alt="Add data source in Querio" border />

2. Select **ClickHouse** from the list of database options.

3. Enter your connection details from above and save the configuration.
   <Image size="md" img={querio_03} alt="ClickHouse connection form in Querio" border />

4. Querio will validate your connection. Once successful, ClickHouse will be available as a data source across your workspace.

## Querying ClickHouse

After connecting Querio to ClickHouse, you can explore and analyze your data from anywhere in the platform. Create a SQL block or a Python cell in a Querio notebook, select ClickHouse as your data source, and run queries directly against your ClickHouse cluster. Use Querio’s visualization and AI tooling to surface insights, build boards, and share results.

<Image size="lg" img={querio_04} alt="Running ClickHouse queries in Querio" border />

## Additional Resources

- Querio documentation: https://docs.querio.ai  
- Querio getting started guides and tutorials: https://www.querio.ai

