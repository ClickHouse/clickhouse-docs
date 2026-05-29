---
title: 'Migrate from BigQuery to ClickHouse Cloud using CDC'
slug: /migrations/bigquery/migrate-using-clickpipes
description: 'How to migrate your data from BigQuery to ClickHouse Cloud using ClickPipes for initial load replication'
keywords: ['BigQuery', 'migration', 'ClickPipes', 'initial load']
sidebar_label: 'Migrate using ClickPipes'
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step2.png';
import dashboard from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/dashboard.png';
import Image from '@theme/IdealImage';

<BetaBadge/>

This guide walks you through how you can migrate your BigQuery projects to ClickHouse Cloud with ClickPipes, a managed CDC solution available in ClickHouse Cloud.
It uses the Stack Overflow dataset as a practical example.

## Pre-requisites {#pre-requisites}

Before proceeding with this migration guide, make sure you have the following:

- A ClickHouse Cloud account, with an empty service that you will be using for the migration
- You have completed the [**BigQuery to ClickHouse migration guide setup**](/migrations/bigquery/dataset-setup) guide which walks you through how to set up the example dataset used in this guide
- You have an understanding of how [primary/order by keys](/best-practices/choosing-a-primary-key) work in ClickHouse
- You have read [**Schema design**](/data-modeling/schema-design)

## Migration approach and benefits {#overview}

Change Data Capture (CDC) is the process by which tables are kept in sync between two databases.
This is significantly more complex if updates and deletes are to be handled in near real-time.
ClickHouse Cloud offers a managed CDC solution for easily transferring data BigQuery and ClickHouse Cloud.

## Migration steps {#setup-clickpipe-and-migrate-data}

With the Stack Overflow dataset set up in your BigQuery project, and a GCS bucket and service account key in hand,
you're now ready to use ClickPipes to ingest the data.
Follow the steps below to set up the BigQuery ClickPipe:

<VerticalStepper type="numbered" headerLevel="h3">

### Select the data source {#1-select-the-data-source}

1. Open the [ClickHouse Cloud console](https://console.clickhouse.cloud/) 
2. Select the service you wish to use, or create a new empty service
2. Select **Data sources** in the main navigation menu and click **Create ClickPipe**.
3. Click the **BigQuery** tile.

### Set up your ClickPipe connection {#2-setup-your-clickpipe-connection}

To set up a new ClickPipe, you must provide details on how to connect to and authenticate with your BigQuery data warehouse, as well as a staging GCS bucket.

1. Give your ClickPipe a name, for example **bigquery-stackoverflow-clickpipe**
2. Upload the `.json` key for the service account you created and downloaded in the [**BigQuery to ClickHouse migration guide setup**](/migrations/bigquery/dataset-setup) guide.
3. Select [**Initial load only**](/integrations/clickpipes/bigquery/overview#initial-load) as the **Replication method**.
4. Under **GCS staging bucket URL**, enter the gsutil URI of your bucket which you obtained earlier.
5. Click **Next** to validate.

### Configure your ClickPipe connection {#3-configure}

You can select the number of parallel threads for initial load, snapshot number of rows per partition, and the number of tables to snapshot in parallel.
For the purposes of this guide, you can leave these as default.
Click **Next**

### Configure tables {#4-configure-tables}

You will be asked if you want to use an existing database or create a new database.
Select **New database** and give it a name like "stackoverflow".

For the purposes of this guide, you can deselect the "Prefix default destination table names with schema name",
and leave the "Preserve NULL values from source" toggle unselected.

Expand the dropdown named **stackoverflow** to view the tables available to ClickPipes from your BigQuery project.
Turn the **Select all tables** toggle switch on.

At this stage it is necessary to give thought to how to order the data, as choosing an effective primary key (sorting key) in ClickHouse is crucial for query performance and storage efficiency.
Sorting keys must also be defined on table creation and can't be added after.

You must define a sorting key for the replicated tables in order to optimize query performance in ClickHouse. Otherwise, the sorting key will be set as `tuple()`, which means no primary index will be created and ClickHouse will perform full table scans for all queries on the table.

For each of the selected tables, click the **Advanced settings** toggle, and set the following settings per table:

| Table          | Engine               | Custom partitioning key for initial load | Custom sorting key                          |
|----------------|----------------------|------------------------------------------|---------------------------------------------|
| `badges`       | `MergeTree`          | -                                        | `(UserId, Class, Date)`                     |
| `comments`     | `MergeTree`          | `toYear(CreationDate)`                   | `(PostId, CreationDate)`                    |
| `postHistory`  | `MergeTree`          | `toYear(CreationDate)`                   | `(PostId, CreationDate, PostHistoryTypeId)` |
| `postLinks`    | `MergeTree`          | -                                        | `(PostId, RelatedPostId)`                   |
| `posts`        | `ReplacingMergeTree` | `toYear(CreationDate)`                   | `(PostTypeId, toDate(CreationDate), Id)`    |
| `users`        | `ReplacingMergeTree` | `toYear(CreationDate)`                   | `(Id)`                                      |
| `votes`        | `MergeTree`          | `toYear(CreationDate)`                   | `(PostId, VoteTypeId, CreationDate)`        |

Decisions for your custom partitioning key, and custom sorting key often come down to what your access patterns look like.
To better understand how to set up your ClickHouse schema, see the article [**Schema design**](/data-modeling/schema-design)
which uses the same data set.

### Configure permissions {#configure-permissions}

ClickPipes will create a dedicated user for writing data into a destination table. You can select a role for this internal user using a custom role or one of the predefined roles.
Select **Full access**, and

### Complete setup {#complete-setup}

:::note
Ingesting all the data will take around 40 minutes to complete, and incur a cost of around \$10 in compute.
We recommend using a free trial account with \$300 in credits.
:::

Click **Create ClickPipe** to complete the setup. You'll be redirected to the overview page, where you can the progress of the initial load and click through to see the details for your BigQuery ClickPipes.

You should see a new ClickPipe listed with type **BigQuery**. You can click it to open a monitoring dashboard that 
shows you progress on the amount of data ingested, the overall status of the pipe, and per table statuses.

<Image img={dashboard} alt="BigQuery ClickPipe monitoring dashboard" size="lg"/>

</VerticalStepper>
