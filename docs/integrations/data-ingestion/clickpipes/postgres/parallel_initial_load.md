---
title: 'Parallel Snapshot In The Postgres ClickPipe'
description: 'Doc for explaining parallel snapshot in the Postgres ClickPipe'
slug: /integrations/clickpipes/postgres/parallel_initial_load
sidebar_label: 'How parallel snapshot works'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/snapshot_params.png'
import Image from '@theme/IdealImage';

This document explains parallelized snapshot/initial load in the Postgres ClickPipe works and talks about the snapshot parameters that can be used to control it.

## Overview {#overview-pg-snapshot}

Initial load is the first phase of a CDC ClickPipe, where the ClickPipe syncs the historical data of the tables in the source database over to ClickHouse, before then starting CDC. A lot of the times, developers do this in a single-threaded manner - such as using pg_dump or pg_restore, or using a single thread to read from the source database and write to ClickHouse.
However, the Postgres ClickPipe can parallelize this process, which can significantly speed up the initial load.

### CTID column in Postgres {#ctid-pg-snapshot}
In Postgres, every row in a table has a unique identifier called the CTID. This is a system column that is not visible to users by default, but it can be used to uniquely identify rows in a table. The CTID is a combination of the block number and the offset within the block, which allows for efficient access to rows.

### Logical partitioning {#logical-partitioning-pg-snapshot}
The Postgres ClickPipe uses the CTID column to logically partition source tables. It obtains the partitions by first performing a COUNT(*) on the source table, followed by a window function partitioning query to get the CTID ranges for each partition. This allows the ClickPipe to read the source table in parallel, with each partition being processed by a separate thread.

Let's talk about the below settings:

<Image img={snapshot_params} alt="Snapshot parameters" size="md"/>

#### Snapshot number of rows per partition {#numrows-pg-snapshot}

This setting controls how many rows constitute a partition. The ClickPipe will read the source table in chunks of this size, and  chunks are processed in parallel based on the initial load parallelism set. The default value is 100,000 rows per partition.

#### Initial load parallelism {#parallelism-pg-snapshot}

This setting controls how many partitions are processed in parallel. The default value is 4, which means that the ClickPipe will read 4 partitions of the source table in parallel. This can be increased to speed up the initial load, but it is recommended to keep it to a reasonable value depending on your source instance specs to avoid overwhelming the source database. The ClickPipe will automatically adjust the number of partitions based on the size of the source table and the number of rows per partition.

#### Snapshot number of tables in parallel {#tables-parallel-pg-snapshot}

Not really related to parallel snapshot, but this setting controls how many tables are processed in parallel during the initial load. The default value is 1. Note that is on top of the parallelism of the partitions, so if you have 4 partitions and 2 tables, the ClickPipe will read 8 partitions in parallel.

### Monitoring parallel snapshot in Postgres {#monitoring-parallel-pg-snapshot}

You can analyze **pg_stat_activity** to see the parallel snapshot in action. The ClickPipe will create multiple connections to the source database, each reading a different partition of the source table. If you see **FETCH** queries with different CTID ranges, it means that the ClickPipe is reading the source tables. You can also see the COUNT(*) and the partitioning query in here.

### Limitations {#limitations-parallel-pg-snapshot}

- The snapshot parameters cannot be edited after pipe creation. If you want to change them, you will have to create a new ClickPipe.
- When adding tables to an existing ClickPipe, you cannot change the snapshot parameters. The ClickPipe will use the existing parameters for the new tables.
- The partition key column should not contain `NULL`s, as they are skipped by the partitioning logic.
