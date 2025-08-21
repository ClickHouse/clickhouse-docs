---
title: 'Parallel Snapshot In The MySQL ClickPipe'
description: 'Doc for explaining parallel snapshot in the MySQL ClickPipe'
slug: /integrations/data-ingestion/clickpipes/mysql/parallel_initial_load
sidebar_label: 'How parallel snapshot works'
doc_type: explanation
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/snapshot_params.png'
import partition_key from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/partition_key.png'
import Image from '@theme/IdealImage';

This document explains parallelized snapshot/initial load in the MySQL ClickPipe works and talks about the snapshot parameters that can be used to control it.

## Overview {#overview-mysql-snapshot}

Initial load is the first phase of a CDC ClickPipe, where the ClickPipe syncs the historical data of the tables in the source database over to ClickHouse, before then starting CDC. A lot of the times, developers do this in a single-threaded manner.
However, the MySQL ClickPipe can parallelize this process, which can significantly speed up the initial load.

### Partition key column {#key-mysql-snapshot}

Once we've enabled the feature flag, you should see the below setting in the ClickPipe table picker (both during creation and editing of a ClickPipe):
<Image img={partition_key} alt="Partition key column" size="md"/>

The MySQL ClickPipe uses a column on your source table to logically partition the source tables. This column is called the **partition key column**. It is used to divide the source table into partitions, which can then be processed in parallel by the ClickPipe.

:::warning
The partition key column must be indexed in the source table to see a good performance boost. This can be seen by running `SHOW INDEX FROM <table_name>` in MySQL.
:::

### Logical partitioning {#logical-partitioning-mysql-snapshot}

Let's talk about the below settings:

<Image img={snapshot_params} alt="Snapshot parameters" size="md"/>

#### Snapshot number of rows per partition {#numrows-mysql-snapshot}
This setting controls how many rows constitute a partition. The ClickPipe will read the source table in chunks of this size, and chunks will be processed in parallel based on the initial load parallelism set. The default value is 100,000 rows per partition.

#### Initial load parallelism {#parallelism-mysql-snapshot}
This setting controls how many partitions will be processed in parallel. The default value is 4, which means that the ClickPipe will read 4 partitions of the source table in parallel. This can be increased to speed up the initial load, but it is recommended to keep it to a reasonable value depending on your source instance specs to avoid overwhelming the source database. The ClickPipe will automatically adjust the number of partitions based on the size of the source table and the number of rows per partition.

#### Snapshot number of tables in parallel {#tables-parallel-mysql-snapshot}
Not really related to parallel snapshot, but this setting controls how many tables will be processed in parallel during the initial load. The default value is 1. Note that is on top of the parallelism of the partitions, so if you have 4 partitions and 2 tables, the ClickPipe will read 8 partitions in parallel.

### Monitoring parallel snapshot in MySQL {#monitoring-parallel-mysql-snapshot}
You can run **SHOW processlist** in MySQL to see the parallel snapshot in action. The ClickPipe will create multiple connections to the source database, each reading a different partition of the source table. If you see **SELECT** queries with different ranges, it means that the ClickPipe is reading the source tables. You can also see the COUNT(*) and the partitioning query in here.

### Limitations {#limitations-parallel-mysql-snapshot}
- The snapshot parameters cannot be edited after pipe creation. If you want to change them, you will have to create a new ClickPipe.
- When adding tables to an existing ClickPipe, you cannot change the snapshot parameters. The ClickPipe will use the existing parameters for the new tables.
