---
sidebar_label: 'Features'
slug: /integrations/dbt/features
sidebar_position: 2
description: 'Features for using dbt with ClickHouse'
keywords: ['clickhouse', 'dbt', 'features']
title: 'Features'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Features

<ClickHouseSupportedBadge/>

In this section, we provide documentation about some of the features available for dbt with ClickHouse.

### Index

<TOCInline toc={toc}  maxHeadingLevel={2} />


## Details about supported materializations

| Type                        | Supported? | Details                                                                                                                          |
|-----------------------------|------------|----------------------------------------------------------------------------------------------------------------------------------|
| view materialization        | YES        | Creates a [view](https://clickhouse.com/docs/en/sql-reference/table-functions/view/).                                            |
| table materialization       | YES        | Creates a [table](https://clickhouse.com/docs/en/operations/system-tables/tables/). See below for the list of supported engines. |
| incremental materialization | YES        | Creates a table if it doesn't exist, and then writes only updates to it.                                                         |
| ephemeral materialized      | YES        | Creates a ephemeral/CTE materialization.  This does model is internal to dbt and does not create any database objects            |

The following are [experimental features](https://clickhouse.com/docs/en/beta-and-experimental-features) in Clickhouse:

| Type                                    | Supported?        | Details                                                                                                                                                                                                                                         |
|-----------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Materialized View materialization       | YES, Experimental | Creates a [materialized view](https://clickhouse.com/docs/en/materialized-view).                                                                                                                                                                |
| Distributed table materialization       | YES, Experimental | Creates a [distributed table](https://clickhouse.com/docs/en/engines/table-engines/special/distributed).                                                                                                                                        |
| Distributed incremental materialization | YES, Experimental | Incremental model based on the same idea as distributed table. Note that not all strategies are supported, visit [this](https://github.com/ClickHouse/dbt-clickhouse?tab=readme-ov-file#distributed-incremental-materialization) for more info. |
| Dictionary materialization              | YES, Experimental | Creates a [dictionary](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary).                                                                                                                                                |


## View materialization

A dbt model can be created as a [ClickHouse view](https://clickhouse.com/docs/en/sql-reference/table-functions/view/)
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

## Table materialization

A dbt model can be created as a [ClickHouse table](https://clickhouse.com/docs/en/operations/system-tables/tables/) and
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

## Incremental materializations

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

### Incremental Model Strategies

`dbt-clickhouse` supports three incremental model strategies.

#### The Default (Legacy) Strategy

Historically ClickHouse has had only limited support for updates and deletes, in the form of asynchronous "mutations."
To emulate expected dbt behavior,
dbt-clickhouse by default creates a new temporary table containing all unaffected (not deleted, not changed) "old"
records, plus any new or updated records,
and then swaps or exchanges this temporary table with the existing incremental model relation. This is the only strategy
that preserves the original relation if something
goes wrong before the operation completes; however, since it involves a full copy of the original table, it can be quite
expensive and slow to execute.

#### The Delete+Insert Strategy

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

#### The Microbatch Strategy (Requires dbt-core >= 1.9)

The incremental strategy `microbatch` has been a dbt-core feature since version 1.9, designed to handle large
time-series data transformations efficiently. In dbt-clickhouse, it builds on top of the existing `delete_insert`
incremental strategy by splitting the increment into predefined time-series batches based on the `event_time` and
`batch_size` model configurations.

Beyond handling large transformations, microbatch provides the ability to:
- [Reprocess failed batches](https://docs.getdbt.com/docs/build/incremental-microbatch#retry).
- Auto-detect [parallel batch execution](https://docs.getdbt.com/docs/build/parallel-batch-execution).
- Eliminate the need for complex conditional logic in [backfilling](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills).

For detailed microbatch usage, refer to the [official documentation](https://docs.getdbt.com/docs/build/incremental-microbatch).

#### The Append Strategy

This strategy replaces the `inserts_only` setting in previous versions of dbt-clickhouse. This approach simply appends
new rows to the existing relation.
As a result duplicate rows are not eliminated, and there is no temporary or intermediate table. It is the fastest
approach if duplicates are either permitted
in the data or excluded by the incremental query WHERE clause/filter.

#### The insert_overwrite Strategy (Experimental)

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

## Materialized Views (Experimental)

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

### Data catchup

Currently, when creating a materialized view (MV), the target table is first populated with historical data before the
MV itself is created.

In other words, dbt-clickhouse initially creates the target table and preloads it with historical data based on the
query defined for the MV. Only after this step is the MV created.

If you prefer not to preload historical data during MV creation, you can disable this behavior by setting the catchup
config to False:

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```

### Refreshable Materialized Views

To use [Refreshable Materialized View](https://clickhouse.com/docs/en/materialized-view/refreshable-materialized-view),
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

### Limitations

* When creating a refreshable materialized view (MV) in ClickHouse that has a dependency, ClickHouse does not throw an
  error if the specified dependency does not exist at the time of creation. Instead, the refreshable MV remains in an
  inactive state, waiting for the dependency to be satisfied before it starts processing updates or refreshing.
  This behavior is by design, but it may lead to delays in data availability if the required dependency is not addressed
  promptly. Users are advised to ensure all dependencies are correctly defined and exist before creating a refreshable
  materialized view.
* As of today, there is no actual "dbt linkage" between the mv and its dependencies, therefore the creation order is not
  guaranteed.
* The refreshable feature was not tested with multiple mvs directing to the same target model.


## Dictionary materializations (experimental)

See the tests
in https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py for
examples of how to
implement materializations for ClickHouse dictionaries


## Distributed materializations (experimental)

Notes:

- dbt-clickhouse queries now automatically include the setting `insert_distributed_sync = 1` in order to ensure that
  downstream incremental
  materialization operations execute correctly. This could cause some distributed table inserts to run more slowly than
  expected.

### Distributed table materialization

Distributed table created with following steps:

1. Creates temp view with sql query to get right structure
2. Create empty local tables based on view
3. Create distributed table based on local tables.
4. Data inserts into distributed table, so it is distributed across shards without duplicating.

#### Distributed table model example

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

#### Generated migrations

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = ReplacingMergeTree
    ORDER BY (id, created_at)
    SETTINGS index_granularity = 8192;


CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```

### Distributed incremental materialization

Incremental model based on the same idea as distributed table, the main difficulty is to process all incremental
strategies correctly.

1. _The Append Strategy_ just insert data into distributed table.
2. _The Delete+Insert_ Strategy creates distributed temp table to work with all data on every shard.
3. _The Default (Legacy) Strategy_ creates distributed temp and intermediate tables for the same reason.

Only shard tables are replacing, because distributed table does not keep data.
The distributed table reloads only when the full_refresh mode is enabled or the table structure may have changed.

#### Distributed incremental model example

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

#### Generated migrations

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = MergeTree
    SETTINGS index_granularity = 8192;


CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```

## Snapshot

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

## Contracts and Constraints

Only exact column type contracts are supported. For example, a contract with a UInt32 column type will fail if the model
returns a UInt64 or other integer type.
ClickHouse also support _only_ `CHECK` constraints on the entire table/model. Primary key, foreign key, unique, and
column level CHECK constraints are not supported.
(See ClickHouse documentation on primary/order by keys.)

