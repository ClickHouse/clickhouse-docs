---
sidebar_label: 'Features and configurations'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: 'Features for using dbt with ClickHouse'
keywords: ['clickhouse', 'dbt', 'features']
title: 'Features and Configurations'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Features and Configurations

<ClickHouseSupportedBadge/>

In this section, we provide documentation about some of the features available for dbt with ClickHouse.

<TOCInline toc={toc}  maxHeadingLevel={3} />

## Profile.yml configurations {#profile-yml-configurations}

To connect to ClickHouse from dbt, you'll need to add a [profile](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles) to your `profiles.yml` file. A ClickHouse profile conforms to the following syntax:

```yaml
your_profile_name:
  target: dev
  outputs:
    dev:
      type: clickhouse

      # Optional
      schema: [default] # ClickHouse database for dbt models
      driver: [http] # http or native.  If not set this will be autodetermined based on port setting
      host: [localhost] 
      port: [8123]  # If not set, defaults to 8123, 8443, 9000, 9440 depending on the secure and driver settings 
      user: [default] # User for all database operations
      password: [<empty string>] # Password for the user
      cluster: [<empty string>] # If set, certain DDL/table operations will be executed with the `ON CLUSTER` clause using this cluster. Distributed materializations require this setting to work. See the following ClickHouse Cluster section for more details.
      verify: [True] # Validate TLS certificate if using TLS/SSL
      secure: [False] # Use TLS (native protocol) or HTTPS (http protocol)
      client_cert: [null] # Path to a TLS client certificate in .pem format
      client_cert_key: [null] # Path to the private key for the TLS client certificate
      retries: [1] # Number of times to retry a "retriable" database exception (such as a 503 'Service Unavailable' error)
      compression: [<empty string>] # Use gzip compression if truthy (http), or compression type for a native connection
      connect_timeout: [10] # Timeout in seconds to establish a connection to ClickHouse
      send_receive_timeout: [300] # Timeout in seconds to receive data from the ClickHouse server
      cluster_mode: [False] # Use specific settings designed to improve operation on Replicated databases (recommended for ClickHouse Cloud)
      use_lw_deletes: [False] # Use the strategy `delete+insert` as the default incremental strategy.
      check_exchange: [True] # Validate that clickhouse support the atomic EXCHANGE TABLES command.  (Not needed for most ClickHouse versions)
      local_suffix: [_local] # Table suffix of local tables on shards for distributed materializations.
      local_db_prefix: [<empty string>] # Database prefix of local tables on shards for distributed materializations. If empty, it uses the same database as the distributed table.
      allow_automatic_deduplication: [False] # Enable ClickHouse automatic deduplication for Replicated tables
      tcp_keepalive: [False] # Native client only, specify TCP keepalive configuration. Specify custom keepalive settings as [idle_time_sec, interval_sec, probes].
      custom_settings: [{}] # A dictionary/mapping of custom ClickHouse settings for the connection - default is empty.
      database_engine: '' # Database engine to use when creating new ClickHouse schemas (databases).  If not set (the default), new databases will use the default ClickHouse database engine (usually Atomic).
      threads: [1] # Number of threads to use when running queries. Before setting it to a number higher than 1, make sure to read the [read-after-write consistency](#read-after-write-consistency) section.
      
      # Native (clickhouse-driver) connection settings
      sync_request_timeout: [5] # Timeout for server ping
      compress_block_size: [1048576] # Compression block size if compression is enabled
```
### Schema vs Database {#schema-vs-database}

The dbt model relation identifier `database.schema.table` is not compatible with Clickhouse because Clickhouse does not
support a `schema`.
So we use a simplified approach `schema.table`, where `schema` is the Clickhouse database. Using the `default` database
is not recommended.

### SET Statement Warning {#set-statement-warning}

In many environments, using the SET statement to persist a ClickHouse setting across all DBT queries is not reliable
and can cause unexpected failures. This is particularly true when using HTTP connections through a load balancer that
distributes queries across multiple nodes (such as ClickHouse cloud), although in some circumstances this can also
happen with native ClickHouse connections. Accordingly, we recommend configuring any required ClickHouse settings in the
"custom_settings" property of the DBT profile as a best practice, instead of relying on a pre-hook "SET" statement as
has been occasionally suggested.

### Setting `quote_columns` {#setting-quote_columns}

To prevent a warning, make sure to explicitly set a value for `quote_columns` in your `dbt_project.yml`. See the [doc on quote_columns](https://docs.getdbt.com/reference/resource-configs/quote_columns) for more information.

```yaml
seeds:
  +quote_columns: false  #or `true` if you have CSV column headers with spaces
```

### About the ClickHouse Cluster {#about-the-clickhouse-cluster}

When using a ClickHouse cluster, you need to consider two things:
- Setting the `cluster` setting.
- Ensuring read-after-write consistency, especially if you are using more than one `threads`.

#### Cluster Setting {#cluster-setting}

The `cluster` setting in profile enables dbt-clickhouse to run against a ClickHouse cluster. If `cluster` is set in the profile, **all models will be created with the `ON CLUSTER` clause** by default—except for those using a **Replicated** engine. This includes:

- Database creation
- View materializations
- Table and incremental materializations
- Distributed materializations

Replicated engines will **not** include the `ON CLUSTER` clause, as they are designed to manage replication internally.

To **opt out** of cluster-based creation for a specific model, add the `disable_on_cluster` config:

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

table and incremental materializations with non-replicated engine will not be affected by `cluster` setting (model would
be created on the connected node only).

**Compatibility**

If a model has been created without a `cluster` setting, dbt-clickhouse will detect the situation and run all DDL/DML
without `on cluster` clause for this model.

#### Read-after-write Consistency {#read-after-write-consistency}

dbt relies on a read-after-insert consistency model. This is not compatible with ClickHouse clusters that have more than one replica if you cannot guarantee that all operations will go to the same replica. You may not encounter problems in your day-to-day usage of dbt, but there are some strategies depending on your cluster to have this guarantee in place:
- If you are using a ClickHouse Cloud cluster, you only need to set `select_sequential_consistency: 1` in your profile's `custom_settings` property. You can find more information about this setting [here](/operations/settings/settings#select_sequential_consistency).
- If you are using a self-hosted cluster, make sure all dbt requests are sent to the same ClickHouse replica. If you have a load balancer on top of it, try using some `replica aware routing`/`sticky sessions` mechanism to be able to always reach the same replica. Adding the setting `select_sequential_consistency = 1` in clusters outside ClickHouse Cloud is [not recommended](/operations/settings/settings#select_sequential_consistency).

## General information about features {#general-information-about-features}

### General model configurations {#general-model-configurations}

The following table shows configurations shared by some of the available materializations. For in-depth information about general dbt model configurations, see the [dbt documentation](https://docs.getdbt.com/category/general-configs):

| Option                 | Description                                                                                                                                                                                                                                                                                                          | Default if any |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine                 | The table engine (type of table) to use when creating tables                                                                                                                                                                                                                                                         | `MergeTree()`  |
| order_by               | A tuple of column names or arbitrary expressions. This allows you to create a small sparse index that helps find data faster.                                                                                                                                                                                        | `tuple()`      |
| partition_by           | A partition is a logical combination of records in a table by a specified criterion. The partition key can be any expression from the table columns.                                                                                                                                                                 |                |
| primary_key            | Like order_by, a ClickHouse primary key expression.  If not specified, ClickHouse will use the order by expression as the primary key                                                                                                                                                                                |                |
| settings               | A map/dictionary of "TABLE" settings to be used to DDL statements like 'CREATE TABLE' with this model                                                                                                                                                                                                                |                |
| query_settings         | A map/dictionary of ClickHouse user level settings to be used with `INSERT` or `DELETE` statements in conjunction with this model                                                                                                                                                                                    |                |
| ttl                    | A TTL expression to be used with the table.  The TTL expression is a string that can be used to specify the TTL for the table.                                                                                                                                                                                       |                |
| indexes                |  A list of [data skipping indexes](/optimize/skipping-indexes) to create. See [About data skipping indexes](#data-skipping-indexes) for details.                                                                                                                                                                     |                |
| sql_security           | The ClickHouse user to use when executing the view's underlying query. [Accepted values](/sql-reference/statements/create/view#sql_security): `definer`, `invoker`.                                                                                                                                                |                |
| definer                | If `sql_security` was set to `definer`, you have to specify any existing user or `CURRENT_USER` in the `definer` clause.                                                                                                                                                                                             |                |
| projections            | A list of [projections](/data-modeling/projections) to be created. Check [About projections](#projections) for details.                                                                                                                                                                                              |                |

#### About data skipping indexes {#data-skipping-indexes}

Data skipping indexes are only available for the `table` materialization. To add a list of data skipping indexes to a table, use the `indexes` configuration:

```sql
{{ config(
        materialized='table',
        indexes=[{
          'name': 'your_index_name',
          'definition': 'your_column TYPE minmax GRANULARITY 2'
        }]
) }}
```

#### About projections {#projections}

You can add [projections](/data-modeling/projections) to `table` and `distributed_table` materializations using the `projections` configuration:

```sql
{{ config(
       materialized='table',
       projections=[
           {
               'name': 'your_projection_name',
               'query': 'SELECT department, avg(age) AS avg_age GROUP BY department'
           }
       ]
) }}
```
**Note**: For distributed tables, the projection is applied to the `_local` tables, not to the distributed proxy table.

### Supported table engines {#supported-table-engines}

| Type                   | Details                                                                                   |
|------------------------|-------------------------------------------------------------------------------------------|
| MergeTree (default)    | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |

**Note**: for materialized views, all *MergeTree engines are supported.

### Experimental supported table engines {#experimental-supported-table-engines}

| Type              | Details                                                                   |
|-------------------|---------------------------------------------------------------------------|
| Distributed Table | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| Dictionary        | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

If you encounter issues connecting to ClickHouse from dbt with one of the above engines, please report an
issue [here](https://github.com/ClickHouse/dbt-clickhouse/issues).

### A note on model settings {#a-note-on-model-settings}

ClickHouse has several types/levels of "settings". In the model configuration above, two types of these are
configurable.  `settings` means the `SETTINGS`
clause used in `CREATE TABLE/VIEW` types of DDL statements, so this is generally settings that are specific to the
specific ClickHouse table engine. The new
`query_settings` is use to add a `SETTINGS` clause to the `INSERT` and `DELETE` queries used for model materialization (
including incremental materializations).
There are hundreds of ClickHouse settings, and it's not always clear which is a "table" setting and which is a "user"
setting (although the latter are generally
available in the `system.settings` table.)  In general the defaults are recommended, and any use of these properties
should be carefully researched and tested.

### Column Configuration {#column-configuration}

> **_NOTE:_** The column configuration options below require [model contracts](https://docs.getdbt.com/docs/collaborate/govern/model-contracts) to be enforced.

| Option | Description                                                                                                                                                | Default if any |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| codec  | A string consisting of arguments passed to `CODEC()` in the column's DDL. For example: `codec: "Delta, ZSTD"` will be compiled as `CODEC(Delta, ZSTD)`.    |    
| ttl    | A string consisting of a [TTL (time-to-live) expression](https://clickhouse.com/docs/guides/developer/ttl) that defines a TTL rule in the column's DDL. For example: `ttl: ts + INTERVAL 1 DAY` will be compiled as `TTL ts + INTERVAL 1 DAY`. |

#### Example of schema configuration {#example-of-schema-configuration}

```yaml
models:
  - name: table_column_configs
    description: 'Testing column-level configurations'
    config:
      contract:
        enforced: true
    columns:
      - name: ts
        data_type: timestamp
        codec: ZSTD
      - name: x
        data_type: UInt8
        ttl: ts + INTERVAL 1 DAY
```

#### Adding complex types {#adding-complex-types}

dbt automatically determines the data type of each column by analyzing the SQL used to create the model. However, in some cases this process may not accurately determine the data type, leading to conflicts with the types specified in the contract `data_type` property. To address this, we recommend using the `CAST()` function in the model SQL to explicitly define the desired type. For example:

```sql
{{
    config(
        materialized="materialized_view",
        engine="AggregatingMergeTree",
        order_by=["event_type"],
    )
}}

select
  -- event_type may be infered as a String but we may prefer LowCardinality(String):
  CAST(event_type, 'LowCardinality(String)') as event_type,
  -- countState() may be infered as `AggregateFunction(count)` but we may prefer to change the type of the argument used:
  CAST(countState(), 'AggregateFunction(count, UInt32)') as response_count, 
  -- maxSimpleState() may be infered as `SimpleAggregateFunction(max, String)` but we may prefer to also change the type of the argument used:
  CAST(maxSimpleState(event_type), 'SimpleAggregateFunction(max, LowCardinality(String))') as max_event_type
from {{ ref('user_events') }}
group by event_type
```

## Features {#features}

### Materialization: view {#materialization-view}

A dbt model can be created as a [ClickHouse view](/sql-reference/table-functions/view/)
and configured using the following syntax:

Project File (`dbt_project.yml`):
```yaml
models:
  <resource-path>:
    +materialized: view
```

Or config block (`models/<model_name>.sql`):
```python
{{ config(materialized = "view") }}
```

### Materialization: table {#materialization-table}

A dbt model can be created as a [ClickHouse table](/operations/system-tables/tables/) and
configured using the following syntax:

Project File (`dbt_project.yml`):
```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
```

Or config block (`models/<model_name>.sql`):
```python
{{ config(
    materialized = "table",
    engine = "<engine-type>",
    order_by = [ "<column-name>", ... ],
    partition_by = [ "<column-name>", ... ],
      ...
    ]
) }}
```

### Materialization: incremental {#materialization-incremental}

Table model will be reconstructed for each dbt execution. This may be infeasible and extremely costly for larger result sets or complex transformations. To address this challenge and reduce the build time, a dbt model can be created as an incremental ClickHouse table and is configured using the following syntax:

Model definition in `dbt_project.yml`:
```yaml
models:
  <resource-path>:
    +materialized: incremental
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
    +unique_key: [ <column-name>, ... ]
    +inserts_only: [ True|False ]
```

Or config block in `models/<model_name>.sql`:
```python
{{ config(
    materialized = "incremental",
    engine = "<engine-type>",
    order_by = [ "<column-name>", ... ],
    partition_by = [ "<column-name>", ... ],
    unique_key = [ "<column-name>", ... ],
    inserts_only = [ True|False ],
      ...
    ]
) }}
```

#### Configurations {#incremental-configurations}
Configurations that are specific for this materialization type are listed below:

| Option                   | Description                                                                                                                                                                                                                                                       | Required?                                                                            |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `unique_key`             | A tuple of column names that uniquely identify rows. For more details on uniqueness constraints, see [here](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional).                                                                                       | Required. If not provided altered rows will be added twice to the incremental table. |
| `inserts_only`           | It has been deprecated in favor of the `append` incremental `strategy`, which operates in the same way. If set to True for an incremental model, incremental updates will be inserted directly to the target table without creating intermediate table. . If `inserts_only` is set, `incremental_strategy` is ignored. | Optional (default: `False`)                                                          |
| `incremental_strategy`   | The strategy to use for incremental materialization.  `delete+insert`, `append`, `insert_overwrite`, or `microbatch` are supported.  For additional details on strategies, see [here](/integrations/dbt/features-and-configurations#incremental-model-strategies) | Optional (default: 'default')                                                        |
| `incremental_predicates` | Additional conditions to be applied to the incremental materialization (only applied to `delete+insert` strategy                                                                                                                                                                                    | Optional                      

#### Incremental Model Strategies {#incremental-model-strategies}

`dbt-clickhouse` supports three incremental model strategies.

##### The Default (Legacy) Strategy {#default-legacy-strategy}

Historically ClickHouse has had only limited support for updates and deletes, in the form of asynchronous "mutations."
To emulate expected dbt behavior,
dbt-clickhouse by default creates a new temporary table containing all unaffected (not deleted, not changed) "old"
records, plus any new or updated records,
and then swaps or exchanges this temporary table with the existing incremental model relation. This is the only strategy
that preserves the original relation if something
goes wrong before the operation completes; however, since it involves a full copy of the original table, it can be quite
expensive and slow to execute.

##### The Delete+Insert Strategy {#delete-insert-strategy}

ClickHouse added "lightweight deletes" as an experimental feature in version 22.8. Lightweight deletes are significantly
faster than ALTER TABLE ... DELETE
operations, because they don't require rewriting ClickHouse data parts. The incremental strategy `delete+insert`
utilizes lightweight deletes to implement
incremental materializations that perform significantly better than the "legacy" strategy. However, there are important
caveats to using this strategy:

- Lightweight deletes must be enabled on your ClickHouse server using the setting
  `allow_experimental_lightweight_delete=1` or you
  must set `use_lw_deletes=true` in your profile (which will enable that setting for your dbt sessions)
- Lightweight deletes are now production ready, but there may be performance and other problems on ClickHouse versions
  earlier than 23.3.
- This strategy operates directly on the affected table/relation (with creating any intermediate or temporary tables),
  so if there is an issue during the operation, the
  data in the incremental model is likely to be in an invalid state
- When using lightweight deletes, dbt-clickhouse enabled the setting `allow_nondeterministic_mutations`. In some very
  rare cases using non-deterministic incremental_predicates
  this could result in a race condition for the updated/deleted items (and related log messages in the ClickHouse logs).
  To ensure consistent results the
  incremental predicates should only include sub-queries on data that will not be modified during the incremental
  materialization.

##### The Microbatch Strategy (Requires dbt-core >= 1.9) {#microbatch-strategy}

The incremental strategy `microbatch` has been a dbt-core feature since version 1.9, designed to handle large
time-series data transformations efficiently. In dbt-clickhouse, it builds on top of the existing `delete_insert`
incremental strategy by splitting the increment into predefined time-series batches based on the `event_time` and
`batch_size` model configurations.

Beyond handling large transformations, microbatch provides the ability to:
- [Reprocess failed batches](https://docs.getdbt.com/docs/build/incremental-microbatch#retry).
- Auto-detect [parallel batch execution](https://docs.getdbt.com/docs/build/parallel-batch-execution).
- Eliminate the need for complex conditional logic in [backfilling](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills).

For detailed microbatch usage, refer to the [official documentation](https://docs.getdbt.com/docs/build/incremental-microbatch).

###### Available Microbatch Configurations {#available-microbatch-configurations}

| Option             | Description                                                                                                                                                                                                                                                                                                                                | Default if any |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | The column indicating "at what time did the row occur." Required for your microbatch model and any direct parents that should be filtered.                                                                                                                                                                                                 |                |
| begin              | The "beginning of time" for the microbatch model. This is the starting point for any initial or full-refresh builds. For example, a daily-grain microbatch model run on 2024-10-01 with begin = '2023-10-01 will process 366 batches (it's a leap year!) plus the batch for "today."                                                       |                |
| batch_size         | The granularity of your batches. Supported values are `hour`, `day`, `month`, and `year`                                                                                                                                                                                                                                                   |                |
| lookback           | Process X batches prior to the latest bookmark to capture late-arriving records.                                                                                                                                                                                                                                                           | 1              |
| concurrent_batches | Overrides dbt's auto detect for running batches concurrently (at the same time). Read more about [configuring concurrent batches](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches). Setting to true runs batches concurrently (in parallel). false runs batches sequentially (one after the other). |                |

##### The Append Strategy {#append-strategy}

This strategy replaces the `inserts_only` setting in previous versions of dbt-clickhouse. This approach simply appends
new rows to the existing relation.
As a result duplicate rows are not eliminated, and there is no temporary or intermediate table. It is the fastest
approach if duplicates are either permitted
in the data or excluded by the incremental query WHERE clause/filter.

##### The insert_overwrite Strategy (Experimental) {#insert-overwrite-strategy}

> [IMPORTANT]  
> Currently, the insert_overwrite strategy is not fully functional with distributed materializations.

Performs the following steps:

1. Create a staging (temporary) table with the same structure as the incremental model relation:
   `CREATE TABLE <staging> AS <target>`.
2. Insert only new records (produced by `SELECT`) into the staging table.
3. Replace only new partitions (present in the staging table) into the target table.

This approach has the following advantages:

- It is faster than the default strategy because it doesn't copy the entire table.
- It is safer than other strategies because it doesn't modify the original table until the INSERT operation completes
  successfully: in case of intermediate failure, the original table is not modified.
- It implements "partitions immutability" data engineering best practice. Which simplifies incremental and parallel data
  processing, rollbacks, etc.

The strategy requires `partition_by` to be set in the model configuration. Ignores all other strategies-specific
parameters of the model config.

### Materialization: materialized_view (Experimental) {#materialized-view}

A `materialized_view` materialization should be a `SELECT` from an existing (source) table. The adapter will create a
target table with the model name
and a ClickHouse MATERIALIZED VIEW with the name `<model_name>_mv`. Unlike PostgreSQL, a ClickHouse materialized view is
not "static" (and has
no corresponding REFRESH operation). Instead, it acts as an "insert trigger", and will insert new rows into the target
table using the defined `SELECT`
"transformation" in the view definition on rows inserted into the source table. See the [test file](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)
for an introductory example
of how to use this functionality.

Clickhouse provides the ability for more than one materialized view to write records to the same target table. To
support this in dbt-clickhouse, you can construct a `UNION` in your model file, such that the SQL for each of your
materialized views is wrapped with comments of the form `--my_mv_name:begin` and `--my_mv_name:end`.

For example the following will build two materialized views both writing data to the same destination table of the
model. The names of the materialized views will take the form `<model_name>_mv1` and `<model_name>_mv2` :

```sql
--mv1:begin
select a,b,c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a,b,c from {{ source('raw', 'table_2') }}
--mv2:end
```

> IMPORTANT!
>
> When updating a model with multiple materialized views (MVs), especially when renaming one of the MV names,
> dbt-clickhouse does not automatically drop the old MV. Instead,
> you will encounter the following warning:
`Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `

#### Data catch-up {#data-catch-up}

By default, when creating or recreating a materialized view (MV), the target table is first populated with historical data before the MV itself is created. You can disable this behavior by setting the `catchup` config to `False`.

| Operation | `catchup: True` (default) | `catchup: False` |
|-----------|---------------------------|------------------|
| Initial deployment (`dbt run`) | Target table backfilled with historical data | Target table created empty |
| Full refresh (`dbt run --full-refresh`) | Target table rebuilt and backfilled | Target table recreated empty, **existing data lost** |
| Normal operation | Materialized view captures new inserts | Materialized view captures new inserts |

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```

:::warning Data Loss Risk with Full Refresh
Using `catchup: False` with `dbt run --full-refresh` will **discard all existing data** in the target table. The table will be recreated empty and only capture new data going forward. Ensure you have backups if the historical data might be needed later.
:::

#### Refreshable Materialized Views {#refreshable-materialized-views}

To use [Refreshable Materialized View](/materialized-view/refreshable-materialized-view),
please adjust the following configs as needed in your MV model (all these configs are supposed to be set inside a
refreshable config object):

| Option                | Description                                                                                                                                                              | Required | Default Value |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------------|
| refresh_interval      | The interval clause (required)                                                                                                                                           | Yes      |               |
| randomize             | The randomization clause, will appear after `RANDOMIZE FOR`                                                                                                              |          |               |
| append                | If set to `True`, each refresh inserts rows into the table without deleting existing rows. The insert is not atomic, just like a regular INSERT SELECT.                  |          | False         |
| depends_on            | A dependencies list for the refreshable mv. Please provide the dependencies in the following format `{schema}.{view_name}`                                               |          |               |
| depends_on_validation | Whether to validate the existence of the dependencies provided in `depends_on`. In case a dependency doesn't contain a schema, the validation occurs on schema `default` |          | False         |

A config example for refreshable materialized view:

```python
{{
    config(
        materialized='materialized_view',
        refreshable={
            "interval": "EVERY 5 MINUTE",
            "randomize": "1 MINUTE",
            "append": True,
            "depends_on": ['schema.depend_on_model'],
            "depends_on_validation": True
        }
    )
}}
```

#### Limitations {#limitations}

* When creating a refreshable materialized view (MV) in ClickHouse that has a dependency, ClickHouse does not throw an
  error if the specified dependency does not exist at the time of creation. Instead, the refreshable MV remains in an
  inactive state, waiting for the dependency to be satisfied before it starts processing updates or refreshing.
  This behavior is by design, but it may lead to delays in data availability if the required dependency is not addressed
  promptly. Users are advised to ensure all dependencies are correctly defined and exist before creating a refreshable
  materialized view.
* As of today, there is no actual "dbt linkage" between the mv and its dependencies, therefore the creation order is not
  guaranteed.
* The refreshable feature was not tested with multiple mvs directing to the same target model.

### Materialization: dictionary (experimental) {#materialization-dictionary}

See the tests
in https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py for
examples of how to
implement materializations for ClickHouse dictionaries

### Materialization: distributed_table (experimental) {#materialization-distributed-table}

Distributed table created with following steps:

1. Creates temp view with sql query to get right structure
2. Create empty local tables based on view
3. Create distributed table based on local tables.
4. Data inserts into distributed table, so it is distributed across shards without duplicating.

Notes:
- dbt-clickhouse queries now automatically include the setting `insert_distributed_sync = 1` in order to ensure that
  downstream incremental
  materialization operations execute correctly. This could cause some distributed table inserts to run more slowly than
  expected.

#### Distributed table model example {#distributed-table-model-example}

```sql
{{
    config(
        materialized='distributed_table',
        order_by='id, created_at',
        sharding_key='cityHash64(id)',
        engine='ReplacingMergeTree'
    )
}}

select id, created_at, item
from {{ source('db', 'table') }}
```

#### Generated migrations {#distributed-table-generated-migrations}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = ReplacingMergeTree
    ORDER BY (id, created_at);

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```

#### Configurations {#distributed-table-configurations}
Configurations that are specific for this materialization type are listed below:

| Option                 | Description                                                                                                                                                                                                                                                                                                          | Default if any |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| sharding_key           | Sharding key determines the destination server when inserting into distributed engine table.  The sharding key can be random or as an output of a hash function                                                                                                                                                      | `rand()`)      |

### materialization: distributed_incremental (experimental) {#materialization-distributed-incremental}

Incremental model based on the same idea as distributed table, the main difficulty is to process all incremental
strategies correctly.

1. _The Append Strategy_ just insert data into distributed table.
2. _The Delete+Insert_ Strategy creates distributed temp table to work with all data on every shard.
3. _The Default (Legacy) Strategy_ creates distributed temp and intermediate tables for the same reason.

Only shard tables are replacing, because distributed table does not keep data.
The distributed table reloads only when the full_refresh mode is enabled or the table structure may have changed.

#### Distributed incremental model example {#distributed-incremental-model-example}

```sql
{{
    config(
        materialized='distributed_incremental',
        engine='MergeTree',
        incremental_strategy='append',
        unique_key='id,created_at'
    )
}}

select id, created_at, item
from {{ source('db', 'table') }}
```

#### Generated migrations {#distributed-incremental-generated-migrations}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = MergeTree;

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```

### Snapshot {#snapshot}

dbt snapshots allow a record to be made of changes to a mutable model over time. This in turn allows point-in-time
queries on models, where analysts can “look back in time” at the previous state of a model. This functionality is
supported by the ClickHouse connector and is configured using the following syntax:

Config block in `snapshots/<model_name>.sql`:
```python
{{
   config(
     schema = "<schema-name>",
     unique_key = "<column-name>",
     strategy = "<strategy>",
     updated_at = "<updated-at-column-name>",
   )
}}
```

For more information on configuration, check out the [snapshot configs](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs) reference page.

### Contracts and Constraints {#contracts-and-constraints}

Only exact column type contracts are supported. For example, a contract with a UInt32 column type will fail if the model
returns a UInt64 or other integer type.
ClickHouse also support _only_ `CHECK` constraints on the entire table/model. Primary key, foreign key, unique, and
column level CHECK constraints are not supported.
(See ClickHouse documentation on primary/order by keys.)

### Additional ClickHouse Macros {#additional-clickhouse-macros}

#### Model Materialization Utility Macros {#model-materialization-utility-macros}

The following macros are included to facilitate creating ClickHouse specific tables and views:

- `engine_clause` -- Uses the `engine` model configuration property to assign a ClickHouse table engine. dbt-clickhouse
  uses the `MergeTree` engine by default.
- `partition_cols` -- Uses the `partition_by` model configuration property to assign a ClickHouse partition key. No
  partition key is assigned by default.
- `order_cols` -- Uses the `order_by` model configuration to assign a ClickHouse order by/sorting key. If not specified
  ClickHouse will use an empty tuple() and the table will be unsorted
- `primary_key_clause` -- Uses the `primary_key` model configuration property to assign a ClickHouse primary key. By
  default, primary key is set and ClickHouse will use the order by clause as the primary key.
- `on_cluster_clause` -- Uses the `cluster` profile property to add an `ON CLUSTER` clause to certain dbt-operations:
  distributed materializations, views creation, database creation.
- `ttl_config` -- Uses the `ttl` model configuration property to assign a ClickHouse table TTL expression. No TTL is
  assigned by default.

#### s3Source Helper Macro {#s3source-helper-macro}

The `s3source` macro simplifies the process of selecting ClickHouse data directly from S3 using the ClickHouse S3 table
function. It works by
populating the S3 table function parameters from a named configuration dictionary (the name of the dictionary must end
in `s3`). The macro
first looks for the dictionary in the profile `vars`, and then in the model configuration. The dictionary can contain
any of the following
keys used to populate the parameters of the S3 table function:

| Argument Name         | Description                                                                                                                                                                                  |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket                | The bucket base url, such as `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`. `https://` is assumed if no protocol is provided.                                         |
| path                  | The S3 path to use for the table query, such as `/trips_4.gz`.  S3 wildcards are supported.                                                                                                  |
| fmt                   | The expected ClickHouse input format (such as `TSV` or `CSVWithNames`) of the referenced S3 objects.                                                                                         |
| structure             | The column structure of the data in bucket, as a list of name/datatype pairs, such as `['id UInt32', 'date DateTime', 'value String']`  If not provided ClickHouse will infer the structure. |
| aws_access_key_id     | The S3 access key id.                                                                                                                                                                        |
| aws_secret_access_key | The S3 secret key.                                                                                                                                                                           |
| role_arn              | The ARN of a ClickhouseAccess IAM role to use to securely access the S3 objects. See this [documentation](/cloud/data-sources/secure-s3) for more information.     |
| compression           | The compression method used with the S3 objects.  If not provided ClickHouse will attempt to determine compression based on the file name.                                                   |

See
the [S3 test file](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)
for examples of how to use this macro.

#### Cross database macro support {#cross-database-macro-support}

dbt-clickhouse supports most of the cross database macros now included in `dbt Core` with the following exceptions:

* The `split_part` SQL function is implemented in ClickHouse using the splitByChar function. This function requires
  using a constant string for the "split" delimiter, so the `delimeter` parameter used for this macro will be
  interpreted as a string, not a column name
* Similarly, the `replace` SQL function in ClickHouse requires constant strings for the `old_chars` and `new_chars`
  parameters, so those parameters will be interpreted as strings rather than column names when invoking this macro.

## Catalog Support {#catalog-support}

### dbt Catalog Integration Status {#dbt-catalog-integration-status}

dbt Core v1.10 introduced catalog integration support, which allows adapters to materialize models into external catalogs that manage open table formats like Apache Iceberg. **This feature is not yet natively implemented in dbt-clickhouse.** You can track the progress of this feature implementation in [GitHub issue #489](https://github.com/ClickHouse/dbt-clickhouse/issues/489).

### ClickHouse Catalog Support {#clickhouse-catalog-support}

ClickHouse recently added native support for Apache Iceberg tables and data catalogs. Most of the features are still `experimental`, but you can already use them if you use a recent ClickHouse version.

* You can use ClickHouse to **query Iceberg tables stored in object storage** (S3, Azure Blob Storage, Google Cloud Storage) using the [Iceberg table engine](/engines/table-engines/integrations/iceberg) and [iceberg table function](/sql-reference/table-functions/iceberg).

* Additionally, ClickHouse provides the [DataLakeCatalog database engine](/engines/database-engines/datalakecatalog), which enables **connection to external data catalogs** including AWS Glue Catalog, Databricks Unity Catalog, Hive Metastore, and REST Catalogs. This allows you to query open table format data (Iceberg, Delta Lake) directly from external catalogs without data duplication.

### Workarounds for Working with Iceberg and Catalogs {#workarounds-iceberg-catalogs}

You can read data from Iceberg tables or catalogs from your dbt project if you have already defined them in your ClickHouse cluster with the tools defined above. You can leverage the `source` functionality in dbt to reference these tables in your dbt projects. For example, if you want to access your tables in a REST Catalog, you can:

1. **Create a database pointing to an external catalog:**

```sql
-- Example with REST Catalog
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE iceberg_catalog
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```

2. **Define the catalog database and its tables as sources in dbt:** remember that the tables should already be available in ClickHouse

```yaml
version: 2

sources:
  - name: external_catalog
    database: iceberg_catalog
    tables:
      - name: orders
      - name: customers
```

3. **Use the catalog tables in your dbt models:**

```sql
SELECT 
    o.order_id,
    c.customer_name,
    o.order_date
FROM {{ source('external_catalog', 'orders') }} o
INNER JOIN {{ source('external_catalog', 'customers') }} c
    ON o.customer_id = c.customer_id
```

### Notes on the Workarounds {#benefits-workarounds}

The good things about these workarounds are:
* You'll have immediate access to different external table types and external catalogs without waiting for native dbt catalog integration.
* You'll have a seamless migration path when native catalog support becomes available.

But there are currently some limitations:
* **Manual setup:** Iceberg tables and catalog databases must be created manually in ClickHouse before they can be referenced in dbt.
* **No catalog-level DDL:** dbt cannot manage catalog-level operations like creating or dropping Iceberg tables in external catalogs. So you will not be able to create them right now from the dbt connector. Creating tables with the Iceberg() engines may be added in the future.
* **Write operations:** Currently, writing into Iceberg/Data Catalog tables is limited. Check the ClickHouse documentation to understand which options are available.
