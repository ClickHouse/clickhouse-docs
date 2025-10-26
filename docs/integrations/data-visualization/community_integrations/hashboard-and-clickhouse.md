---
sidebar_label: 'Hashboard'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['clickhouse', 'Hashboard', 'connect', 'integrate', 'ui', 'analytics']
description: 'Hashboard is a robust analytics platform that can be easily integrated with ClickHouse for real-time data analysis.'
title: 'Connecting ClickHouse to Hashboard'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Connecting ClickHouse to Hashboard

<CommunityMaintainedBadge/>

[Hashboard](https://hashboard.com) is an interactive data exploration tool that enables anyone in your organization to track metrics and discover actionable insights. Hashboard issues live SQL queries to your ClickHouse database and is particularly useful for self-serve, ad hoc data exploration use cases.

<Image size="md" img={hashboard_01} alt="Hashboard data explorer interface showing interactive query builder and visualization" border />

<br/>

This guide will walk you through the steps to connect Hashboard with your ClickHouse instance. This information is also available on Hashboard's [ClickHouse integration documentation](https://docs.hashboard.com/docs/database-connections/clickhouse).

## Pre-requisites {#pre-requisites}

- A ClickHouse database either hosted on your own infrastructure or on [ClickHouse Cloud](https://clickhouse.com/).
- A [Hashboard account](https://hashboard.com/getAccess) and project.

## Steps to connect Hashboard to ClickHouse {#steps-to-connect-hashboard-to-clickhouse}

### 1. Gather your connection details {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Add a new database connection in Hashboard {#2-add-a-new-database-connection-in-hashboard}

1. Navigate to your [Hashboard project](https://hashboard.com/app).
2. Open the Settings page by clicking the gear icon in the side navigation bar.
3. Click `+ New Database Connection`.
4. In the modal, select "ClickHouse."
5. Fill in the **Connection Name**, **Host**, **Port**, **Username**, **Password**, and **Database** fields with the information gathered earlier.
6. Click "Test" to validate that the connection is configured successfully.
7. Click "Add"

Your ClickHouse database is now be connected to Hashboard and you can proceed by building [Data Models](https://docs.hashboard.com/docs/data-modeling/add-data-model), [Explorations](https://docs.hashboard.com/docs/visualizing-data/explorations), [Metrics](https://docs.hashboard.com/docs/metrics), and [Dashboards](https://docs.hashboard.com/docs/dashboards). See the corresponding Hashboard documentation for more detail on these features.

## Learn more {#learn-more}

For more advanced features and troubleshooting, visit [Hashboard's documentation](https://docs.hashboard.com/).
