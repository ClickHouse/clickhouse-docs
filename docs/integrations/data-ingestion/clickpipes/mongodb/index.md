---
sidebar_label: 'Ingesting Data from MongoDB to ClickHouse'
description: 'Describes how to seamlessly connect your MongoDB to ClickHouse Cloud.'
slug: /integrations/clickpipes/mongodb
title: 'Ingesting data from MongoDB to ClickHouse (using CDC)'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mongodb_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-tile.png'
import mongodb_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-connection-details.png'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';

# Ingesting data from MongoDB to ClickHouse (using CDC)

<BetaBadge/>

:::info
Ingesting data from MongoDB to ClickHouse Cloud via ClickPipes is in public beta.
:::

:::note
In the ClickHouse Cloud console and documentation, "table" and "collection" are used interchangeably for MongoDB.
:::

You can use ClickPipes to ingest data from your MongoDB database into ClickHouse Cloud. The source MongoDB database can be hosted on-premises or in the cloud using services like MongoDB Atlas.

## Prerequisites {#prerequisites}

To get started, you first need to ensure that your MongoDB database is correctly configured for replication. The configuration steps depend on how you're deploying MongoDB, so please follow the relevant guide below:

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [Generic MongoDB](./mongodb/source/generic)

Once your source MongoDB database is set up, you can continue creating your ClickPipe.

## Create your ClickPipe {#create-your-clickpipe}

Make sure you are logged in to your ClickHouse Cloud account. If you don't have an account yet, you can sign up [here](https://cloud.clickhouse.com/).

1. In the ClickHouse Cloud console, navigate to your ClickHouse Cloud Service.

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. Select the `Data Sources` button on the left-side menu and click on "Set up a ClickPipe".

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. Select the `MongoDB CDC` tile.

<Image img={mongodb_tile} alt="Select MongoDB" size="lg" border/>

### Add your source MongoDB database connection {#add-your-source-mongodb-database-connection}

4. Fill in the connection details for your source MongoDB database which you configured in the prerequisites step.

   :::info
   Before you start adding your connection details make sure that you have whitelisted ClickPipes IP addresses in your firewall rules. On the following page you can find a [list of ClickPipes IP addresses](../index.md#list-of-static-ips).
   For more information refer to the source MongoDB setup guides linked at [the top of this page](#prerequisites).
   :::

   <Image img={mongodb_connection_details} alt="Fill in connection details" size="lg" border/>

Once the connection details are filled in, click `Next`.

#### Configure advanced settings {#advanced-settings}

You can configure the advanced settings if needed. A brief description of each setting is provided below:

- **Sync interval**: This is the interval at which ClickPipes will poll the source database for changes. This has an implication on the destination ClickHouse service, for cost-sensitive users we recommend to keep this at a higher value (over `3600`).
- **Pull batch size**: The number of rows to fetch in a single batch. This is a best effort setting and may not be respected in all cases.
- **Snapshot number of tables in parallel**: This is the number of tables that will be fetched in parallel during the initial snapshot. This is useful when you have a large number of tables and you want to control the number of tables fetched in parallel.

### Configure the tables {#configure-the-tables}

5. Here you can select the destination database for your ClickPipe. You can either select an existing database or create a new one.

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

6. You can select the tables you want to replicate from the source MongoDB database. While selecting the tables, you can also choose to rename the tables in the destination ClickHouse database.

### Review permissions and start the ClickPipe {#review-permissions-and-start-the-clickpipe}

7. Select the "Full access" role from the permissions dropdown and click "Complete Setup".

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

## What's next? {#whats-next}

Once you've set up your ClickPipe to replicate data from MongoDB to ClickHouse Cloud, you can focus on how to query and model your data for optimal performance.

## Caveats {#caveats}

Here are a few caveats to note when using this connector:

- We require MongoDB version 5.1.0+.
- We use MongoDB's native Change Streams API for CDC, which relies on the MongoDB oplog to capture real-time changes. 
- Documents from MongoDB are replicated into ClickHouse as JSON type by default. This allows for flexible schema management and makes it possible to use the rich set of JSON operators in ClickHouse for querying and analytics. You can learn more about querying JSON data [here](https://clickhouse.com/docs/sql-reference/data-types/newjson).
- Self-serve PrivateLink configuration is not currently available. If you are on AWS and require PrivateLink, please reach out to db-integrations-support@clickhouse.com or create a support ticket — we will work with you to enable it.
