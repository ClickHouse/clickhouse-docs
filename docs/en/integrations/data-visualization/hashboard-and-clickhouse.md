---
sidebar_label: Hashboard
sidebar_position: 132
slug: /en/integrations/hashboard
keywords: [clickhouse, hashboard, connect, integrate, ui, analytics]
description: Hashboard is a robust analytics platform that can be easily integrated with ClickHouse for real-time data analysis.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_native.md';

# Connecting ClickHouse to Hashboard

[Hashboard](https://hashboard.com) is an interactive data exploration tool that enables anyone in your organization to track metrics and discover actionable insights. Hashboard issues live SQL queries to your ClickHouse database and is particularly useful for self-serve, adhoc data exploration use cases.  


<img src={require('./images/hashboard_01.png').default} class="image" alt="Hashboard data explorer" />  

<br/>

This guide will walk you through the steps to connect Hashboard with your ClickHouse instance. This information is also available on Hashboard's [ClickHouse integration documentation](https://docs.hashboard.com/docs/database-connections/clickhouse).


## Pre-requisites

- A ClickHouse database either hosted on your own infrastructure or on [ClickHouse Cloud](https://clickhouse.com/).
- A [Hashboard account](https://hashboard.com/getAccess) and project.

## Steps to Connect Hashboard to ClickHouse

### 1. Gather Your Connection Details

<ConnectionDetails />

### 2. Add a New Database Connection in Hashboard

1. Navigate to your [Hashboard project](https://hashboard.com/app).
2. Open the Settings page by clicking the gear icon in the side navigation bar.
3. Click `+ New Database Connection`.
4. In the modal, select "ClickHouse."
5. Fill in the **Connection Name**, **Host**, **Port**, **Username**, **Password**, and **Database** fields with the information gathered earlier.
6. Click "Test" to validate that the connection is configured successfully.
7. Click "Add"

Your ClickHouse database is now be connected to Hashboard and you can proceed by building [Data Models](https://docs.hashboard.com/docs/data-modeling/add-data-model), [Explorations](https://docs.hashboard.com/docs/visualizing-data/explorations), [Metrics](https://docs.hashboard.com/docs/metrics), and [Dashboards](https://docs.hashboard.com/docs/dashboards). See the corresponding Hashboard documentation for more detail on these features.

## Learn More

For more advanced features and troubleshooting, visit [Hashboard's documentation](https://docs.hashboard.com/).
