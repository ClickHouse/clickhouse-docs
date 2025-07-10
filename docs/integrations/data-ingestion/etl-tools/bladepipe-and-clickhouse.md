---
sidebar_label: 'BladePipe'
sidebar_position: 20
keywords: ['clickhouse', 'BladePipe', 'connect', 'integrate', 'cdc', 'etl', 'data integration']
slug: /integrations/bladepipe
description: 'Stream data into ClickHouse using BladePipe data pipelines'
title: 'Connect BladePipe to ClickHouse'
---

import Image from '@theme/IdealImage';
import bp_ck_1 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_1.png';
import bp_ck_2 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_2.png';
import bp_ck_3 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_3.png';
import bp_ck_4 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_4.png';
import bp_ck_5 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_5.png';
import bp_ck_6 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_6.png';
import bp_ck_7 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_7.png';
import bp_ck_8 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_8.png';
import bp_ck_9 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_9.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Connect BladePipe to ClickHouse

<CommunityMaintainedBadge/>


<a href="https://www.bladepipe.com/" target="_blank">BladePipe</a> is a real-time end-to-end data integration tool with sub-second latency, boosting seamless data flow across platforms. 

ClickHouse is one of BladePipe's pre-built connectors, allowing users to integrate data from various sources into ClickHouse automatically. This page will show how to load data into ClickHouse in real time step by step.

## Supported sources {#supported-sources}
Currently BladePipe supports for data integration to ClickHouse from the following sources:
- MySQL/MariaDB/AuroraMySQL
- Oracle
- PostgreSQL/AuroraPostgreSQL
- MongoDB
- Kafka
- PolarDB-MySQL
- OceanBase
- TiDB

More sources are to be supported.


<VerticalStepper headerLevel="h2">
## Download and run BladePipe {#1-run-bladepipe}
1. Log in to <a href="https://www.bladepipe.com/" target="_blank">BladePipe Cloud</a>.

2. Follow the instructions in <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_docker" target="_blank">Install Worker (Docker)</a> or <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_binary" target="_blank">Install Worker (Binary)</a> to download and install a BladePipe Worker.

  :::note
  Alternatively, you can download and deploy <a href="https://doc.bladepipe.com/productOP/onPremise/installation/install_all_in_one_binary" target="_blank">BladePipe Enterprise</a>.
  :::

## Add ClickHouse as a target {#2-add-clickhouse-as-a-target}

  :::note
  1. BladePipe supports ClickHouse version `20.12.3.3` or above.
  2. To use ClickHouse as a target, make sure that the user has SELECT, INSERT and common DDL permissions. 
  :::

1. In BladePipe, click "DataSource" > "Add DataSource".

2. Select `ClickHouse`, and fill out the settings by providing your ClickHouse host and port, username and password, and click "Test Connection".

    <Image img={bp_ck_1} size="lg" border alt="Add ClickHouse as a target" />

3. Click "Add DataSource" at the bottom, and a ClickHouse instance is added.

## Add MySQL as a source {#3-add-mysql-as-a-source}
In this tutorial, we use a MySQL instance as the source, and explain the process of loading MySQL data to ClickHouse.

:::note
To use MySQL as a source, make sure that the user has the <a href="https://doc.bladepipe.com/dataMigrationAndSync/datasource_func/MySQL/privs_for_mysql" target="_blank">required permissions</a>. 
:::

1. In BladePipe, click "DataSource" > "Add DataSource".

2. Select `MySQL`, and fill out the settings by providing your MySQL host and port, username and password, and click "Test Connection".

    <Image img={bp_ck_2} size="lg" border alt="Add MySQL as a source" />

3. Click "Add DataSource" at the bottom, and a MySQL instance is added.


## Create a pipeline {#4-create-a-pipeline}

1. In BladePipe, click "DataJob" > "Create DataJob".

2. Select the added MySQL and ClickHouse instances and click "Test Connection" to ensure BladePipe is connected to the instances. Then, select the databases to be moved.
   <Image img={bp_ck_3} size="lg" border alt="Select source and target" />

3. Select "Incremental" for DataJob Type, together with the "Full Data" option.
   <Image img={bp_ck_4} size="lg" border alt="Select sync type" />


4. Select the tables to be replicated.
   <Image img={bp_ck_5} size="lg" border alt="Select tables" />

5. Select the columns to be replicated.
   <Image img={bp_ck_6} size="lg" border alt="Select columns" />


6. Confirm the DataJob creation, and the DataJob runs automatically.
    <Image img={bp_ck_8} size="lg" border alt="DataJob is running" />


## Verify the data {#5-verify-the-data}
1. Stop data write in MySQL instance and wait for ClickHouse to merge data.
:::note
Due to the unpredictable timing of ClickHouse's automatic merging, you can manually trigger a merging by running the `OPTIMIZE TABLE xxx FINAL;` command. Note that there is a chance that this manual merging may not always succeed.

Alternatively, you can run the `CREATE VIEW xxx_v AS SELECT * FROM xxx FINAL;` command to create a view and perform queries on the view to ensure the data is fully merged.
:::

2. Create a <a href="https://doc.bladepipe.com/operation/job_manage/create_job/create_period_verification_correction_job" target="_blank">Verification DataJob</a>. Once the Verification DataJob is completed, review the results to confirm that the data in ClickHouse is the same as the data in MySQL.
   <Image img={bp_ck_9} size="lg" border alt="Verify data" />
