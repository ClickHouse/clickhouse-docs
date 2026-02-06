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

:::note
This materialization is experimental. For general materialization concepts and shared configurations, see the [Materializations](/integrations/dbt/materializations) page.
:::

A `materialized_view` materialization should be a `SELECT` from an existing (source) table. The adapter will create a
target table with the model name
and a ClickHouse MATERIALIZED VIEW with the name `<model_name>_mv`. Unlike PostgreSQL, a ClickHouse materialized view is
not "static" (and has
no corresponding REFRESH operation). Instead, it acts as an "insert trigger", and will insert new rows into the target
table using the defined `SELECT`
"transformation" in the view definition on rows inserted into the source table. See the [test file](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)
for an introductory example
of how to use this functionality.

## Multiple materialized views {#multiple-materialized-views}

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

## How to iterate the target table schema {#how-to-iterate-the-target-table-schema}
Starting with dbt-clickhouse version 1.9.8, you can control how the target table schema is iterated when `dbt run` encounters different columns in the MV's SQL.

By default, dbt will not apply any changes to the target table (`ignore` setting value), but you can change this setting to follow the same behavior as the `on_schema_change` config [in incremental models](https://docs.getdbt.com/docs/build/incremental-models#what-if-the-columns-of-my-incremental-model-change).

Also, you can use this setting as a safety mechanism. If you set it to `fail`, the build will fail if the columns in the MV's SQL differ from the target table that was created by the first `dbt run`.

```jinja2
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    on_schema_change='fail'
)}}
```

## Data catch-up {#data-catch-up}

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

## Refreshable Materialized Views {#refreshable-materialized-views}

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

## External Target Table (Experimental) {#external-target-table}

:::note
This feature is experimental and available starting from dbt-clickhouse version 1.9.x. The API may change based on community feedback.
:::

By default, dbt-clickhouse creates and manages both the target table and the materialized view(s) within a single model. This approach has some limitations:

- All resources (target table + MVs) share the same configuration
- The MV SQL is used to infer the target table schema
- Multiple MVs pointing to the same table must be defined together using `UNION ALL` syntax

The **external target table** feature allows you to define the target table separately as a regular `table` materialization and then reference it from your materialized view models. This provides more flexibility and follows dbt's philosophy of 1:1 resource mapping.

### Benefits {#external-target-benefits}

- **Separate configurations**: Target table and MVs can have different engines, settings, and configurations
- **Cleaner model organization**: Each resource is defined in its own file
- **Better readability**: No need for `UNION ALL` with comment markers
- **Individual resource management**: Each MV can be managed independently
- **Explicit schema definition**: Target table schema is defined explicitly, not inferred

### Usage {#external-target-usage}

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

### Configuration Options {#external-target-configuration}

When using external target tables, the following configurations apply:

**On the target table (`materialized='table'`):**

| Option | Description | Default |
|--------|-------------|---------|
| `on_schema_change` | How to handle schema changes when the table is used by dbt-managed MVs. Set to `fail` by default for tables with MVs pointing to them. | `fail` (when MVs exist) |
| `repopulate_from_mvs_on_full_refresh` | On `--full-refresh`, instead of running the table's SQL, rebuild the table by executing INSERT-SELECTs using the SQL from all MVs pointing to it. | `False` |

**On the materialized view (`materialized='materialized_view'`):**

| Option | Description | Default |
|--------|-------------|---------|
| `catchup` | Whether to backfill historical data when the MV is created. | `True` |

### Behavior Comparison {#external-target-behavior}

| Operation | Standard MV | External Target MV |
|-----------|-------------|-------------------|
| First `dbt run` | Creates target table + MV(s) | Creates MV with `TO` clause (target table must exist) |
| Subsequent `dbt run` | All resources managed together | MV updated with `ALTER TABLE MODIFY QUERY` |
| `--full-refresh` | Recreates everything with optional catchup | Recreates MV only. Use `repopulate_from_mvs_on_full_refresh` on target table for atomic rebuild |
| Schema changes | Controlled by `on_schema_change` | Target table: `on_schema_change` (defaults to `fail`). MV: uses `ALTER TABLE MODIFY QUERY` |

### Full Refresh with External Targets {#external-target-full-refresh}

When using `--full-refresh` with external target tables, you have two options:

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

### Changing the Target Table {#external-target-changing}

You cannot change the target table of an MV without a `--full-refresh`. If you try to run `dbt run` after changing the `materialization_target_table()` reference, the build will fail with an error message indicating that the target has changed.

To change the target:
1. Update the `materialization_target_table()` call
2. Run `dbt run --full-refresh -s your_mv_model`

### Migration from Standard MVs {#external-target-migration}

To migrate from the standard MV approach to external target tables:

1. **Create the target table model** with the same schema as your current MV target
2. **Update your MV models** to use `materialization_target_table()`
3. **Run with `--full-refresh`** to recreate the MVs with `TO` clauses

:::note
The old target table (created by the standard MV approach) will not be automatically dropped. You may need to clean it up manually after verifying the migration.
:::
