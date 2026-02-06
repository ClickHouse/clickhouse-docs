---
sidebar_label: 'Materialization: materialized_view'
slug: /integrations/dbt/materialization-materialized-view
sidebar_position: 4
description: 'Using the materialized_view materialization in dbt-clickhouse'
keywords: ['clickhouse', 'dbt', 'materialized view', 'refreshable', 'external target table', 'catchup']
title: 'Materialized Views'
doc_type: 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Materialized Views

<ClickHouseSupportedBadge/>

A `materialized_view` materialization should be a `SELECT` from an existing (source) table. Unlike PostgreSQL, a ClickHouse materialized view is not "static" (and has no corresponding REFRESH operation). Instead, it acts as an **insert trigger**, inserting new rows into a target table by applying the defined `SELECT` transformation on rows inserted into the source table. See the [ClickHouse materialized view documentation](/materialized-view) for more details on how materialized views work in ClickHouse.

:::note
For general materialization concepts and shared configurations (engine, order_by, partition_by, etc.), see the [Materializations](/integrations/dbt/materializations) page.
:::

## How the target table is managed {#target-table-management}

When you use the `materialized_view` materialization, dbt-clickhouse needs to create both a **materialized view** and a **target table** where the transformed rows are inserted. There are two ways to manage the target table:

| Approach | Description | Status |
|----------|-------------|--------|
| **Implicit target** | dbt-clickhouse creates and manages the target table automatically within the same model. The target table schema is inferred from the MV's SQL. | Stable |
| **Explicit target** | You define the target table as a separate `table` materialization and reference it from your MV model using the `materialization_target_table()` macro. The MV is created with a `TO` clause pointing to that table. | **Experimental** |

The approach you choose affects how schema changes, full refreshes, and multi-MV setups are handled. The following sections describe each approach in detail.

## Materialization with implicit target {#implicit-target}

This is the default behavior. When you define a `materialized_view` model, the adapter will:

1. Create a **target table** with the model name
2. Create a ClickHouse **materialized view** with the name `<model_name>_mv`

The target table schema is inferred from the columns in the MV's `SELECT` statement. All resources (target table + MVs) share the same model configuration.

```sql
-- models/events_mv.sql
{{
    config(
        materialized='materialized_view',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)'
    )
}}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date, event_type
```

See the [test file](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py) for additional examples.

### Multiple materialized views {#multiple-materialized-views}

ClickHouse allows more than one materialized view to write records to the same target table. To support this in dbt-clickhouse with the implicit target approach, you can construct a `UNION` in your model file, wrapping the SQL for each materialized view with comments of the form `--my_mv_name:begin` and `--my_mv_name:end`.

For example, the following will build two materialized views both writing data to the same destination table of the model. The names of the materialized views will take the form `<model_name>_mv1` and `<model_name>_mv2`:

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

### How to iterate the target table schema {#how-to-iterate-the-target-table-schema}

Starting with **dbt-clickhouse version 1.9.8**, you can control how the target table schema is iterated when `dbt run` encounters different columns in the MV's SQL.

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    on_schema_change='fail'  # this setting
)}}
```

By default, dbt will not apply any changes to the target table (`ignore` setting value), but you can change this setting to follow the same behavior as the `on_schema_change` config [in incremental models](https://docs.getdbt.com/docs/build/incremental-models#what-if-the-columns-of-my-incremental-model-change).

Also, you can use this setting as a safety mechanism. If you set it to `fail`, the build will fail if the columns in the MV's SQL differ from the target table that was created by the first `dbt run`.

### Data catch-up {#data-catch-up}

By default, when creating or recreating a materialized view (MV), the target table is first populated with historical data before the MV itself is created (`catchup=True`). You can disable this behavior by setting the `catchup` config to `False`.

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False  # this setting
)}}
```

| Operation | `catchup: True` (default) | `catchup: False` |
|-----------|---------------------------|------------------|
| Initial deployment (`dbt run`) | Target table backfilled with historical data | Target table created empty |
| Full refresh (`dbt run --full-refresh`) | Target table rebuilt and backfilled | Target table recreated empty, **existing data lost** |
| Normal operation | Materialized view captures new inserts | Materialized view captures new inserts |


:::warning Data Loss Risk with Full Refresh
Using `catchup: False` with `dbt run --full-refresh` will **discard all existing data** in the target table. The table will be recreated empty and only capture new data going forward. Ensure you have backups if the historical data might be needed later.
:::

## Materialization with explicit target (Experimental) {#explicit-target}

:::warning Experimental
This feature is experimental and available starting from **dbt-clickhouse version 1.10**. The API may change based on community feedback.
:::

By default, dbt-clickhouse creates and manages both the target table and the materialized view(s) within a single model (the [implicit target](#implicit-target) approach described above). This approach has some limitations:

- All resources (target table + MVs) share the same configuration. If multiple MVs are pointing to the same target table, they must be defined together using `UNION ALL` syntax.
- All these resources cannot be iterated separately, all need to be managed using the same model file.
- You cannot easily control the name of each MV.
- All settings are shared between the target table and the MVs, making it difficult to configure each resource individually and to reason about which configuration belongs to each resource.

The **explicit target** feature allows you to define the target table separately as a regular `table` materialization and then reference it from your materialized view models.

### Benefits {#explicit-target-benefits}

- **Fully separated resources**: Now each resource can be defined separately, improving readability
- **1:1 resources between dbt and CH**: Now you can use dbt tooling to manage and iterate them separately.
- **Different configurations now available**: Now a different configuration can be applied to each one.
- **No more need to keep naming conventions**: Now all resources are created using the name that the user gives, not the custom one added with the _mv for MVs.

### Limitations {#explicit-target-limitations}
- Target table definition is not natural to dbt: it’s not a SQL that will read from a source table, so we loss here dbt validations. MV’s SQL will still get validated using dbt utilities and its compatibility with the target table’s columns will be validated at CH level.

- We found some problems related to limitations to the `ref()` function used to reference models between them. We have created an issue in the dbt-core repo and we are currently talking with them [to look for possible solutions (dbt-labs/dbt-core#12319)](https://github.com/dbt-labs/dbt-core/issues/12319):
  - When `ref()` is called from inside the config block, it returns the current model, not the one shared. This blocks us from defining it in the config() section, forcing us to use a comment to add this dependency. We are following the same pattern as defined in the dbt docs with [the "--depends_on:" approach](https://docs.getdbt.com/reference/dbt-jinja-functions/ref#forcing-dependencies).
  - `ref()` is used to track upstream dependencies, not downstream, and it has implications internally: It works for us as this forces the target table to be created first, but in the dependency chart in the generated documentation, the target table will be drawn as another upstream dependency, not downstream, making it a bit difficult to understand.
  - `unit-test` also forces us to define some data for the target table even when the idea is not to read from it. The workaround is just to leave the data for this table empty.


### Usage {#explicit-target-usage}

**Step 1: Define the target table as a regular table model**

```sql
-- models/events_daily.sql
{{
    config(
        materialized='table',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)',
        partition_by='toYYYYMM(event_date)'
    )
}}

SELECT
    toDate(now()) AS event_date,
    '' AS event_type,
    toUInt64(0) AS total
WHERE 0  -- Creates empty table with correct schema
```

The `WHERE 0` clause creates an empty table with the correct schema. This is necessary because the target table needs to exist before the MVs are created.

**Step 2: Define materialized views pointing to the target table**

```sql
-- models/page_events_aggregator.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'page_events') }}
GROUP BY event_date, event_type
```

```sql
-- models/mobile_events_aggregator.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'mobile_events') }}
GROUP BY event_date, event_type
```

The `materialization_target_table()` macro tells dbt-clickhouse to create the MV with a `TO` clause pointing to the specified table instead of creating its own target table.

### Configuration options {#explicit-target-configuration}

When using explicit target tables, the following configurations apply:

**On the target table (`materialized='table'`):**

| Option | Description | Default |
|--------|-------------|---------|
| `on_schema_change` | How to handle schema changes when the table is used by dbt-managed MVs. Set to `fail` by default for tables with MVs pointing to them. | `fail` (when MVs exist) |
| `repopulate_from_mvs_on_full_refresh` | On `--full-refresh`, instead of running the table's SQL, rebuild the table by executing INSERT-SELECTs using the SQL from all MVs pointing to it. | `False` |

**On the materialized view (`materialized='materialized_view'`):**

| Option | Description | Default |
|--------|-------------|---------|
| `catchup` | Whether to backfill historical data when the MV is created. | `True` |

### Behavior comparison {#explicit-target-behavior}

| Operation | Implicit Target MV | Explicit Target MV |
|-----------|-------------|-------------------|
| First `dbt run` | Creates target table + MV(s) | Creates MV with `TO` clause (target table must exist) |
| Subsequent `dbt run` | All resources managed together | MV updated with `ALTER TABLE MODIFY QUERY` |
| `--full-refresh` | Recreates everything with optional catchup | Recreates MV only. Use `repopulate_from_mvs_on_full_refresh` on target table for atomic rebuild |
| Schema changes | Controlled by `on_schema_change` | Target table: `on_schema_change` (defaults to `fail`). MV: uses `ALTER TABLE MODIFY QUERY` |

### Full refresh with explicit targets {#explicit-target-full-refresh}

When using `--full-refresh` with explicit target tables, you have two options:

**Option 1: Refresh MVs only (default)**

Each MV is dropped and recreated. If `catchup=True`, the MV backfills data from its source.

```sql
-- models/page_events_aggregator.sql
{{ config(
    materialized='materialized_view',
    catchup=True  -- Will backfill after recreation
) }}
{{ materialization_target_table(ref('events_daily')) }}
...
```

**Option 2: Atomic table rebuild using MVs**

Set `repopulate_from_mvs_on_full_refresh=True` on the target table. This will:
1. Create a new temporary table
2. Execute INSERT-SELECT using each MV's SQL
3. Atomically swap the tables

```sql
-- models/events_daily.sql
{{
    config(
        materialized='table',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)',
        repopulate_from_mvs_on_full_refresh=True
    )
}}
...
```

:::warning
When using `repopulate_from_mvs_on_full_refresh`, ensure all MVs are created before running `--full-refresh` on the target table, as it uses the MV definitions from ClickHouse.
:::

### Changing the target table {#explicit-target-changing}

You cannot change the target table of an MV without a `--full-refresh`. If you try to run `dbt run` after changing the `materialization_target_table()` reference, the build will fail with an error message indicating that the target has changed.

To change the target:
1. Update the `materialization_target_table()` call
2. Run `dbt run --full-refresh -s your_mv_model`

### Migrating from implicit to explicit target {#migration-implicit-to-explicit}

If you have existing materialized view models using the implicit target approach and want to migrate to the explicit target approach, follow these steps:

**1. Create the target table model**

Create a new model file with `materialized='table'` that defines the same schema as the current MV target table. Use a `WHERE 0` clause to create an empty table:

```sql
-- models/events_daily.sql
{{
    config(
        materialized='table',
        engine='MergeTree()',
        order_by='(event_date, event_type)'
    )
}}

SELECT
    toDate(now()) AS event_date,
    '' AS event_type,
    toUInt64(0) AS total
WHERE 0
```

**2. Update your MV models**

Add the `materialization_target_table()` macro call to each MV model, pointing it to the new target table. If you were previously using the `UNION ALL` comment-marker syntax for multiple MVs, split them into separate model files:

```sql
-- Before (implicit target, single model with UNION ALL):
--mv1:begin
select a, b, c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a, b, c from {{ source('raw', 'table_2') }}
--mv2:end
```

```sql
-- After (explicit target, separate model files):

-- models/mv1.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

select a, b, c from {{ source('raw', 'table_1') }}
```

```sql
-- models/mv2.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

select a, b, c from {{ source('raw', 'table_2') }}
```

**3. Run with `--full-refresh`**

Deploy the new target table first, then recreate the MVs:

```bash
dbt run --full-refresh -s events_daily mv1 mv2
```

:::note
The old target table (created by the implicit target approach) will not be automatically dropped. You may need to clean it up manually after verifying the migration was successful.
:::

## Refreshable Materialized Views {#refreshable-materialized-views}

[Refreshable Materialized Views](/materialized-view/refreshable-materialized-view) are a special type of materialized view in ClickHouse that periodically re-executes the query and stores the result, similar to how materialized views work in other databases. This is useful for scenarios where you want periodic snapshots or aggregations rather than real-time insert triggers.

:::tip
Refreshable materialized views can be used with **both** the [implicit target](#implicit-target) and [explicit target](#explicit-target) approaches. The `refreshable` config is independent of how the target table is managed.
:::

To use a refreshable materialized view, add a `refreshable` config object to your MV model with the following options:

| Option                | Description                                                                                                                                                              | Required | Default Value |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------------|
| refresh_interval      | The interval clause (required)                                                                                                                                           | Yes      |               |
| randomize             | The randomization clause, will appear after `RANDOMIZE FOR`                                                                                                              |          |               |
| append                | If set to `True`, each refresh inserts rows into the table without deleting existing rows. The insert is not atomic, just like a regular INSERT SELECT.                  |          | False         |
| depends_on            | A dependencies list for the refreshable mv. Please provide the dependencies in the following format `{schema}.{view_name}`                                               |          |               |
| depends_on_validation | Whether to validate the existence of the dependencies provided in `depends_on`. In case a dependency doesn't contain a schema, the validation occurs on schema `default` |          | False         |

### Example with implicit target {#refreshable-implicit-example}

```python
{{
    config(
        materialized='materialized_view',
        engine='MergeTree()',
        order_by='(event_date)',
        refreshable={
            "interval": "EVERY 5 MINUTE",
            "randomize": "1 MINUTE",
            "append": True,
            "depends_on": ['schema.depend_on_model'],
            "depends_on_validation": True
        }
    )
}}

SELECT
    toStartOfDay(event_time) AS event_date,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date
```

### Example with explicit target {#refreshable-explicit-example}

```python
{{
    config(
        materialized='materialized_view',
        refreshable={
            "interval": "EVERY 1 HOUR",
            "append": False
        }
    )
}}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date, event_type
```

### Limitations {#refreshable-limitations}

* When creating a refreshable materialized view (MV) in ClickHouse that has a dependency, ClickHouse does not throw an
  error if the specified dependency does not exist at the time of creation. Instead, the refreshable MV remains in an
  inactive state, waiting for the dependency to be satisfied before it starts processing updates or refreshing.
  This behavior is by design, but it may lead to delays in data availability if the required dependency is not addressed
  promptly. Users are advised to ensure all dependencies are correctly defined and exist before creating a refreshable
  materialized view.
* As of today, there is no actual "dbt linkage" between the mv and its dependencies, therefore the creation order is not
  guaranteed.
* The refreshable feature was not tested with multiple mvs directing to the same target model.
