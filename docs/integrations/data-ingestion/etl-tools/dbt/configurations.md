---
sidebar_label: 'Configurations'
slug: /integrations/dbt/configurations
sidebar_position: 2
description: 'Configurations available for your dbt project'
keywords: ['clickhouse', 'dbt', 'configurations']
title: 'Configurations'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Configurations

<ClickHouseSupportedBadge/>

In this page you'll find the configurations available for your dbt project.

### Index

<TOCInline toc={toc}  maxHeadingLevel={2} />

## Profile.yml configurations

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
      
      # Native (clickhouse-driver) connection settings
      sync_request_timeout: [5] # Timeout for server ping
      compress_block_size: [1048576] # Compression block size if compression is enabled
```
### Schema vs Database

The dbt model relation identifier `database.schema.table` is not compatible with Clickhouse because Clickhouse does not
support a `schema`.
So we use a simplified approach `schema.table`, where `schema` is the Clickhouse database. Using the `default` database
is not recommended.


### About the ClickHouse Cluster

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

#### Compatibility

If a model has been created without a `cluster` setting, dbt-clickhouse will detect the situation and run all DDL/DML
without `on cluster` clause for this model.


## Model Configuration

| Option                 | Description                                                                                                                                                                                                                                                                                                          | Default if any |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine                 | The table engine (type of table) to use when creating tables                                                                                                                                                                                                                                                         | `MergeTree()`  |
| order_by               | A tuple of column names or arbitrary expressions. This allows you to create a small sparse index that helps find data faster.                                                                                                                                                                                        | `tuple()`      |
| partition_by           | A partition is a logical combination of records in a table by a specified criterion. The partition key can be any expression from the table columns.                                                                                                                                                                 |                |
| sharding_key           | Sharding key determines the destination server when inserting into distributed engine table.  The sharding key can be random or as an output of a hash function                                                                                                                                                      | `rand()`)      |
| primary_key            | Like order_by, a ClickHouse primary key expression.  If not specified, ClickHouse will use the order by expression as the primary key                                                                                                                                                                                |                |
| unique_key             | A tuple of column names that uniquely identify rows.  Used with incremental models for updates.                                                                                                                                                                                                                      |                |
| settings               | A map/dictionary of "TABLE" settings to be used to DDL statements like 'CREATE TABLE' with this model                                                                                                                                                                                                                |                |
| query_settings         | A map/dictionary of ClickHouse user level settings to be used with `INSERT` or `DELETE` statements in conjunction with this model                                                                                                                                                                                    |                |
| ttl                    | A TTL expression to be used with the table.  The TTL expression is a string that can be used to specify the TTL for the table.                                                                                                                                                                                       |                |
| indexes                | A list of indexes to create, available only for `table` materialization. For examples look at ([#397](https://github.com/ClickHouse/dbt-clickhouse/pull/397))                                                                                                                                                        |                |
| sql_security           | Allow you to specify which ClickHouse user to use when executing the view's underlying query. [`SQL SECURITY`](https://clickhouse.com/docs/sql-reference/statements/create/view#sql_security) has two legal values: `definer` `invoker`.                                                                             |                |
| definer                | If `sql_security` was set to `definer`, you have to specify any existing user or `CURRENT_USER` in the `definer` clause.                                                                                                                                                                                             |                |


### Incremental table configuration
Configurations that are specific for this materialization type are listed below:

| Option                   | Description                                                                                                                                                                                                                                                       | Required?                                                                            |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `unique_key`             | A tuple of column names that uniquely identify rows. For more details on uniqueness constraints, see [here](/docs/build/incremental-models#defining-a-unique-key-optional).                                                                                       | Required. If not provided altered rows will be added twice to the incremental table. |
| `inserts_only`           | It has been deprecated in favor of the `append` incremental `strategy`, which operates in the same way. If set to True for an incremental model, incremental updates will be inserted directly to the target table without creating intermediate table. . If `inserts_only` is set, `incremental_strategy` is ignored. | Optional (default: `False`)                                                          |
| `incremental_strategy`   | The strategy to use for incremental materialization.  `delete+insert`, `append`, `insert_overwrite`, or `microbatch` are supported.  For additional details on strategies, see [here](/integrations/data-ingestion/etl-tools/dbt/features#incremental-model-strategies) | Optional (default: 'default')                                                        |
| `incremental_predicates` | Additional conditions to be applied to the incremental materialization (only applied to `delete+insert` strategy                                                                                                                                                                                    | Optional                      

### Supported table engines

| Type                   | Details                                                                                   |
|------------------------|-------------------------------------------------------------------------------------------|
| MergeTree (default)    | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |

### Experimental supported table engines

| Type              | Details                                                                   |
|-------------------|---------------------------------------------------------------------------|
| Distributed Table | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| Dictionary        | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

If you encounter issues connecting to ClickHouse from dbt with one of the above engines, please report an
issue [here](https://github.com/ClickHouse/dbt-clickhouse/issues).

### A Note on Model Settings

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


## Column Configuration

> **_NOTE:_** The column configuration options below require [model contracts](https://docs.getdbt.com/docs/collaborate/govern/model-contracts) to be enforced.

| Option | Description                                                                                                                                                | Default if any |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| codec  | A string consisting of arguments passed to `CODEC()` in the column's DDL. For example: `codec: "Delta, ZSTD"` will be compiled as `CODEC(Delta, ZSTD)`.    |    
| ttl    | A string consisting of a [TTL (time-to-live) expression](https://clickhouse.com/docs/guides/developer/ttl) that defines a TTL rule in the column's DDL. For example: `ttl: ts + INTERVAL 1 DAY` will be compiled as `TTL ts + INTERVAL 1 DAY`. |

### Example

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


## Microbatch Configuration

| Option             | Description                                                                                                                                                                                                                                                                                                                                | Default if any |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | The column indicating "at what time did the row occur." Required for your microbatch model and any direct parents that should be filtered.                                                                                                                                                                                                 |                |
| begin              | The "beginning of time" for the microbatch model. This is the starting point for any initial or full-refresh builds. For example, a daily-grain microbatch model run on 2024-10-01 with begin = '2023-10-01 will process 366 batches (it's a leap year!) plus the batch for "today."                                                       |                |
| batch_size         | The granularity of your batches. Supported values are `hour`, `day`, `month`, and `year`                                                                                                                                                                                                                                                   |                |
| lookback           | Process X batches prior to the latest bookmark to capture late-arriving records.                                                                                                                                                                                                                                                           | 1              |
| concurrent_batches | Overrides dbt's auto detect for running batches concurrently (at the same time). Read more about [configuring concurrent batches](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches). Setting to true runs batches concurrently (in parallel). false runs batches sequentially (one after the other). |                |


## Additional ClickHouse Macros

### Model Materialization Utility Macros

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

### s3Source Helper Macro

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
| role_arn              | The ARN of a ClickhouseAccess IAM role to use to securely access the S3 objects. See this [documentation](https://clickhouse.com/docs/en/cloud/security/secure-s3) for more information.     |
| compression           | The compression method used with the S3 objects.  If not provided ClickHouse will attempt to determine compression based on the file name.                                                   |

See
the [S3 test file](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)
for examples of how to use this macro.

### Cross database macro support

dbt-clickhouse supports most of the cross database macros now included in `dbt Core` with the following exceptions:

* The `split_part` SQL function is implemented in ClickHouse using the splitByChar function. This function requires
  using a constant string for the "split" delimiter, so the `delimeter` parameter used for this macro will be
  interpreted as a string, not a column name
* Similarly, the `replace` SQL function in ClickHouse requires constant strings for the `old_chars` and `new_chars`
  parameters, so those parameters will be interpreted as strings rather than column names when invoking this macro.

## SET Statement Warning

In many environments, using the SET statement to persist a ClickHouse setting across all DBT queries is not reliable
and can cause unexpected failures. This is particularly true when using HTTP connections through a load balancer that
distributes queries across multiple nodes (such as ClickHouse cloud), although in some circumstances this can also
happen with native ClickHouse connections. Accordingly, we recommend configuring any required ClickHouse settings in the
"custom_settings" property of the DBT profile as a best practice, instead of relying on a prehook "SET" statement as
has been occasionally suggested.


## Setting `quote_columns`

To prevent a warning, make sure to explicitly set a value for `quote_columns` in your `dbt_project.yml`. See the [doc on quote_columns](/reference/resource-configs/quote_columns) for more information.

```yaml
seeds:
  +quote_columns: false  #or `true` if you have CSV column headers with spaces
```