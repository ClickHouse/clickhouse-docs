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
- **We found some problems related to limitations to the `ref()` function**: We need to use it to reference models between them but it can only be used to reference upstream models, not downstream. This causes some problems for this implementation. We have created an issue in the dbt-core repo and we are currently talking with them [to look for possible solutions (dbt-labs/dbt-core#12319)](https://github.com/dbt-labs/dbt-core/issues/12319):
  - When `ref()` is called from inside the config block, it returns the current model, not the one shared. This blocks us from defining it in the config() section, forcing us to use a comment to add this dependency. We are following the same pattern as defined in the dbt docs with [the "--depends_on:" approach](https://docs.getdbt.com/reference/dbt-jinja-functions/ref#forcing-dependencies).
  - `ref()` works for us as it forces the target table to be created first, but in the dependency chart in the generated documentation, the target table will be drawn as another upstream dependency, not downstream, making it a bit difficult to understand.
  - `unit-test` also forces us to define some data for the target table even when the idea is not to read from it. The workaround is just to leave the data for this table empty.


### Usage {#explicit-target-usage}

**Step 1: Define the target table as a regular table model**

Model `events_daily.sql`:
```sql
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
This is the workaround we mention in the limitations section. You may loss some dbt validations here, but the schema will still be checked at ClickHouse level.

**Step 2: Define materialized views pointing to the target table**

For example, you can define different MVs in different models like this, even pointing to the same target table. Note the new `{{ materialization_target_table(ref('events_daily')) }}` macro call, which configures the target table for the MV.

Model `page_events_aggregator.sql`:
```sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'page_events') }}
GROUP BY event_date, event_type
```

Model `mobile_events_aggregator.sql`:
```sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'mobile_events') }}
GROUP BY event_date, event_type
```

### Configuration options {#explicit-target-configuration}

When using explicit target tables, the following configurations apply:

**On the target table (`materialized='table'`):**

| Option | Description | Default |
|--------|-------------|---------|
| `on_schema_change` | How to handle schema changes when the table is used by dbt-managed MVs. Set to `fail` by default for tables with MVs pointing to them. Follows the same behavior as the `on_schema_change` config [in incremental models](https://docs.getdbt.com/docs/build/incremental-models#what-if-the-columns-of-my-incremental-model-change).| A `materialized='table'` model will behave as usual if it doesn't have MVs pointing to it. If it does, it will be configured with `on_schema_change='fail'` to protect the data from the MVs. |
| `repopulate_from_mvs_on_full_refresh` | On `--full-refresh`, instead of running the table's SQL, rebuild the table by executing INSERT-SELECTs using the SQL from all MVs pointing to it. | `False` |

**On the materialized view (`materialized='materialized_view'`):**

| Option | Description | Default |
|--------|-------------|---------|
| `catchup` | Whether to backfill historical data when the MV is created. | `True` |

:::note
You'll usually only want to set `catchup` to `True` in MVs or `repopulate_from_mvs_on_full_refresh` to `True` in their target tables. If you set both to `True`, it may duplicate data.
:::

### Behavior comparison between implicit and explicit target approaches{#explicit-target-behavior}

| Operation | Current implementation | New implementation |
| --- | --- | --- |
| First dbt run | All resources created | All resources created |
| Next dbt run |  **Individual resources cannot be managed, all happen together:**<br /><br />**target table**: <br /> changes managed with the `on_schema_change` setting. By default it has the setting `ignore` so new columns are not processed.<br /><br />**MVs**: all updated with `alter table modify query` operations | **Changes can be applied individually:<br /><br />target table**: <br />automatic detection to know if they are target tables from dbt defined MVs. If they are, the columns evolution is managed by default with the `on_schema_change` setting with `fail` value so it will fail if columns changes. We added this default value as a protection layer<br /><br />**MVs**: Their SQL gets updated with `alter table modify query` operations. |
| dbt run --full-refresh | **Individual resources cannot be managed, all happen together:<br /><br />target table**: <br />target table recreated empty. `catchup` available to configure a backfill with the SQL of all the MVs together. `catchup` is `True` by default<br /><br />**MVs**: all get recreated. | **Changes will be applied individually:<br /><br />target table:** will be recreated as usual.<br /><br />**MVs**: drop and recreate. `catchup` available for an initial backfill. `catchup` is `True` by default. <br /><br />**Note: During the process, the target table will be empty or partially loaded until the MVs are recreated. To avoid this, check the next section about how to iterate the target table.**|

### Full refresh with explicit targets {#explicit-target-full-refresh}

When using `--full-refresh`, explicit target tables will be recreated (so you may loss data if ingestion is happening during this process). This will behave in different ways depending on your configurations:

**Option 1: default `--full-refresh` behavior. All gets recreated, but during the recreation of the MVs, the target table will be empty or partially loaded.**

All gets dropped and recreated. If you want to reinsert the data using the MVs SQL, keep the setting `catchup=True`:

```sql
-- models/page_events_aggregator.sql
{{ config(
    materialized='materialized_view',
    catchup=True  -- this is the default value so you don't need to actully set it.
) }}
{{ materialization_target_table(ref('events_daily')) }}
...
```

**Option 2: I want to recreate the target table and I don't want to read empty data while the MVs are being recreated.**

If you need to update the sql of the MVs first, you can set in them `catchup=False` and then do a `dbt run` or `dbt run --full-refresh` on the MVs. Make sure that the MVs are created before running `--full-refresh` on the target table, as it uses the MV definitions from ClickHouse.

Set `repopulate_from_mvs_on_full_refresh=True` on the target table model. On a `dbt run --full-refresh`, this will:
1. Create a new temporary table
2. Execute INSERT-SELECT using each MV's SQL
3. Atomically swap the tables

So the users of your table will not see empty data while the MVs are being recreated.

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

### Changing the target table {#explicit-target-changing}

You cannot change the target table of an MV without a `--full-refresh`. If you try to run a regular `dbt run` after changing the `materialization_target_table()` reference, the build will fail with an error message indicating that the target has changed.

To change the target:
1. Update the `materialization_target_table()` call
2. Run `dbt run --full-refresh -s your_mv_model`


### Migrating from implicit to explicit target {#migration-implicit-to-explicit}

If you have existing materialized view models using the implicit target approach and want to migrate to the explicit target approach, follow these steps:

**1. Create the target table model**

Create a new model file with `materialized='table'` that defines the same schema as the current MV target table. Use a `WHERE 0` clause to create an empty table. Use the same name as the current implicit materialized view model. You'll be able to use this model now to iterate the target table.
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

Create new models that will include each the MV SQL and the `materialization_target_table()` macro call pointing to the new target table. If you were previously using the `UNION ALL` remove that part and the comments.

For the model names you'll have to follow this naming convention:
- if only one MV was defined, this will have the name: `<old_model_name>_mv`
- if multiple MVs were defined, each will have the name: `<old_model_name>_mv_<name_in_comments>`


Before in `my_model.sql` (implicit target, single model with UNION ALL):
```sql
--mv1:begin
select a, b, c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a, b, c from {{ source('raw', 'table_2') }}
--mv2:end
```

After (explicit target, separate model files):
```sql
-- models/my_model_mv_mv1.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

select a, b, c from {{ source('raw', 'table_1') }}
```

```sql
-- models/my_model_mv_mv2.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

select a, b, c from {{ source('raw', 'table_2') }}
```

**3. Iterate them as needed following the instructions in the [explicit target](#explicit-target) section.**


## Behavior during active ingestion {#behavior-during-active-ingestion}

Because ClickHouse materialized views act as **insert triggers**, they only capture data while they exist. If a materialized view is dropped and recreated (e.g. during a `--full-refresh`), any rows inserted into the source table during that window will **not** be processed by the MV. This is referred to as the MV being "blind."

Additionally, the **catchup** (both from the MV's `catchup` or from the target table's `repopulate_from_mvs_on_full_refresh`) process runs an `INSERT INTO ... SELECT` using the MV's SQL. If inserts into the source table are happening at the same time, the catch-up query may include rows that the MV has already processed (or will process right after being created), potentially causing **duplicate data** in the target table. Using a deduplicating engine such as `ReplacingMergeTree` on the target table mitigates this risk.

The following table summarizes the safety of each operation when inserts are actively happening on the source table.

### Implicit target operations {#ingestion-implicit-target}

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| First `dbt run` | 1. Create target table<br/>2. Insert data (if `catchup=True`)<br/>3. Create MV(s) | ⚠️ **MV is blind between steps 1 and 3.** Any rows inserted into the source during this window are not captured. |
| Subsequent `dbt run` | `ALTER TABLE ... MODIFY QUERY` | ✅ Safe. The MV is updated atomically. |
| `dbt run --full-refresh` | 1. Create backup table<br/>2. Insert data (if `catchup=True`)<br/>3. Drop MV(s)<br/>4. Exchange tables<br/>5. Recreate MV(s) | ⚠️ **MV is blind during recreation.** Data inserted into the source between steps 3 and 5 will not appear in the new target table. |

### Explicit target operations {#ingestion-explicit-target}

**Materialized view models:**

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| First `dbt run` | 1. Create MV (with `TO` clause)<br/>2. Run catch-up (if `catchup=True`) | ✅ MV is created first, so new inserts are captured immediately.<br/>⚠️ **Catch-up may duplicate data** — the backfill query can overlap with rows already being processed by the MV. Safe if using a deduplicating engine (e.g. `ReplacingMergeTree`). |
| Subsequent `dbt run` | `ALTER TABLE ... MODIFY QUERY` | ✅ Safe. The MV is updated atomically. |
| `dbt run --full-refresh` on MVs | 1. Drop and recreate MV<br/>2. Run catch-up (if `catchup=True`) | ⚠️ **MV is blind during recreation** (between drop and create).<br/>⚠️ **Catch-up may duplicate data** if inserts are happening concurrently. |

**Target table model:**

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| `dbt run` | Schema changes applied if `on_schema_change` is configured | ✅ Safe. No data movement. |
| `dbt run --full-refresh` (default) | Recreate the table (leaves it empty) | ⚠️ **Target table is empty** until MVs backfill it. MVs continue inserting into the new table once it exists. |
| `dbt run --full-refresh` with `repopulate_from_mvs_on_full_refresh=True` | 1. Create backup table<br/>2. Insert data using each MV's SQL<br/>3. Exchange tables atomically | ⚠️ **MV is blind during recreation.** Data inserted between steps 1 and 3 will not appear in the new table. **This may change in next versions**|

:::tip Recommendations for production environments with active ingestion
- **Pause the ingestion during dbt operations if possible**: This will make all operations safe and no data will be lost.
- **Use a deduplicating engine if possible** (e.g. `ReplacingMergeTree`) on the target table to handle potential duplicates from catch-up overlaps.
- **Prefer `ALTER TABLE ... MODIFY QUERY`** (regular `dbt run` without `--full-refresh`) when possible — this is always safe.
- **Be aware of problematic windows** during dbt operations.
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
