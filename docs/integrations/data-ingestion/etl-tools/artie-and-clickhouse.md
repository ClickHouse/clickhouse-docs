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
import artie_edit_pipeline from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_edit_pipeline.png';
import analytics from '@site/static/images/integrations/data-ingestion/etl-tools/artie/analytics.png';
import monitor from '@site/static/images/integrations/data-ingestion/etl-tools/artie/monitor.png';
import schema_notification from '@site/static/images/integrations/data-ingestion/etl-tools/artie/schema_notification.png';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';

# Connect Artie to ClickHouse

<a href="https://www.artie.com/" target="_blank">Artie</a> is fully managed real-time data streaming platform that replicates production data into ClickHouse, unlocking customer-facing analytics, operational workflows, and Agentic AI in production.

## Overview {#overview}

Artie is the modern data infrastructure layer for the AI era — a fully managed real-time data streaming platform that keeps production data continuously in sync with your warehouse.

As companies activate their warehouses for real-time AI workloads, operational analytics, and customer-facing data products, they're standardizing on infrastructure that's fast, reliable, and built for scale.

We give companies the kind of streaming pipelines and deep observability that Netflix, DoorDash, and Instacart built in-house, without hiring 10+ engineers and spending 1-2 years on platform work. Artie automates the entire ingestion lifecycle — change capture, merges, backfills, and observability — with zero engineering maintenance and deploys in minutes.

Leaders like ClickUp, Substack, and Alloy use Artie not just to solve today's pipeline issues, but to future-proof their data stack as their AI strategy accelerates.

<VerticalStepper headerLevel="h2">

## Create an Artie account {#1-create-an-artie-account}

Visit <a href="https://www.artie.com/contact" target="_blank">artie.com/contact</a> and complete the form to request access.

<Image img={artie_signup} size="md" border alt="Artie signup page" />

## Find your ClickHouse credentials {#2-find-your-clickhouse-credentials}

After creating a service in ClickHouse Cloud, find the following required settings:

<ConnectionDetails />

## Create a new pipeline in Artie {#3-create-a-new-pipeline-in-artie}

Head over to Artie with the information you have gathered from previous steps and create a new pipeline by following a 3 step process.

1. **Connect your source** - Configure your source database (Postgres, MySQL, Events API, etc)
2. **Choose the tables you want to replicate** - Select which tables to sync to ClickHouse
3. **Connect your destination** - Enter your ClickHouse credentials

<Image img={artie_edit_pipeline} size="lg" border alt="Artie Edit Pipeline interface" />

</VerticalStepper>

## Contact Us {#contact-us}

If you have any questions, please refer to our <a href="https://www.artie.com/docs/destinations/clickhouse" target="_blank">ClickHouse docs</a> or reach out to the team at <a href="mailto:hi@artie.com">hi@artie.com</a>.

## Product Screenshots {#product-screenshots}

Analytics Portal
<Image img={analytics} size="md" border alt="Analytics Portal"/>

Pipeline and table specific monitors
<Image img={monitor} size="md" border alt="Built-in monitoring"/>

Daily schema change notifications
<Image img={schema_notification} size="md" border alt="Schema notification"/>
