---
sidebar_label: 'Artie'
sidebar_position: 12
keywords: ['clickhouse', 'Artie', 'connect', 'integrate', 'cdc', 'etl', 'data integration', 'real-time', 'streaming']
slug: /integrations/artie
description: 'Stream data into ClickHouse using Artie CDC streaming platform'
title: 'Connect Artie to ClickHouse'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import artie_signup from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_signup.png';
import artie_clickhouse_credentials from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_clickhouse_credentials.png';
import artie_edit_pipeline from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_edit_pipeline.png';

# Connect Artie to ClickHouse

<a href="https://www.artie.com/" target="_blank">Artie</a> is a fully managed CDC streaming platform that replicates production data into ClickHouse in real time, enabling low-latency analytics and downstream applications at scale.

## Overview

Artie is the modern data infrastructure layer for the AI era — a fully managed CDC streaming platform that keeps production data continuously in sync with your warehouse.

As companies activate their warehouses for real-time AI workloads, analytics, and customer-facing data products, they're standardizing on infrastructure that's fast, reliable, and built for scale.

Artie automates the entire ingestion lifecycle — change capture, merges, backfills, and observability — with zero engineering maintenance and deploys in minutes.

Leaders like Substack, ClickUp, and Alloy use Artie not just to solve today's pipeline issues, but to future-proof their data stack as their AI strategy accelerates.

<VerticalStepper headerLevel="h2">

## Create an Artie account {#1-create-an-artie-account}

Visit <a href="https://www.artie.com/contact" target="_blank">artie.com/contact</a> and complete the form to request access.

<Image img={artie_signup} size="lg" border alt="Artie signup page" />

## Find your ClickHouse credentials {#2-find-your-clickhouse-credentials}

After creating a service in ClickHouse Cloud, find the following required settings:

- **Warehouse Address**: For "Connect with:", select "Go", then copy the address highlighted in the image below
- **Service account username**
- **Service account password**

<Image img={artie_clickhouse_credentials} size="lg" border alt="ClickHouse Cloud connection credentials" />

:::note
If you have lost your password, you can reset it from the ClickHouse Cloud console.
:::

## Create a new deployment in Artie {#3-create-a-new-deployment-in-artie}

Head over to Artie with the information you have gathered from Step #2 and create a new deployment by following a 3 step process:

1. **Connect your source** - Configure your source database (PostgreSQL, MySQL, MongoDB, etc.)
2. **Choose the tables you want to replicate** - Select which tables to sync to ClickHouse
3. **Connect your destination** - Enter your ClickHouse credentials from Step #2

<Image img={artie_edit_pipeline} size="lg" border alt="Artie Edit Pipeline interface" />

</VerticalStepper>

## Contact Us

If you have any questions, please refer to <a href="https://docs.artie.com/" target="_blank">Artie docs</a> or reach out to the team at <a href="mailto:hi@artie.com">hi@artie.com</a>.
