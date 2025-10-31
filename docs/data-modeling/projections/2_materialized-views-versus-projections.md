---
slug: /managing-data/materialized-views-versus-projections
sidebar_label: 'Materialized views vs projections'
title: 'Materialized Views versus Projections'
hide_title: false
description: 'Article comparing materialized views and projections in ClickHouse, including their use cases, performance, and limitations.'
doc_type: 'reference'
keywords: ['materialized views', 'projections', 'differences']
---

> A common question from users is when they should use materialized views versus 
projections. In this article we will explore the key differences between the two and why you 
may want to pick one over the other in certain scenarios.

## Summary of key differences {#key-differences}

The table below summarizes the key differences between materialized views and projections for various aspects of consideration.

| Aspect                                                                           | Materialized views                                                                                                                                                                                                                                                                                                                                                       | Projections                                                                                                                                                                                                                                                                                            |
|----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Data storage and location                                                        | Store their results in a **separate, explicit target table**, acting as insert triggers, on insert to a source table.                                                                                                                                                                                                                                                    | Projections create optimized data layouts that are physically **stored alongside the main table data** and are invisible to the user.                                                                                                                                                                  |
| Update mechanism                                                                 | Operate **synchronously** on `INSERT` to the source table (for incremental materialized views). Note: they can also be **scheduled** using refreshable materialized views.                                                                                                                                                                                               | **Asynchronous** updates in the background upon `INSERT` to the main table.                                                                                                                                                                                                                            |
| Query interaction                                                                | Working with Materialized Views requires querying the **target table directly**, meaning that users need to be aware of the existence of materialized views when writing queries.                                                                                                                                                                                        | Projections are **automatically selected** by ClickHouse's query optimizer, and are transparent in the sense that the user does not have to modify their queries to the table with the projection in order to utilise it. From version 25.6 it is also possible to filter by more than one projection. |
| Handling `UPDATE` / `DELETE`                                                     | **Do not automatically react** to `UPDATE` or `DELETE` operations on the source table as materialized views have no knowledge of the source table, acting only as insert triggers _to_ a source table. This can lead to potential data staleness between source and target tables and requires workarounds or periodic full refresh. (via refreshable materialized view). | By default, are **incompatible with `DELETED` rows** (especially lightweight deletes). `lightweight_mutation_projection_mode` (v24.7+) can enable compatibility.                                                                                                                                       |
| `JOIN` support                                                                   | Yes. Refreshable materialized views can be used for complex denormalization. Incremental materialized views only trigger on left-most table inserts.                                                                                                                                                                                                                     | No. `JOIN` operations are not supported within projection definitions for filtering the materialised data.                                                                                                                                                                                             |
| `WHERE` clause in definition                                                     | Yes. `WHERE` clauses can be included to filter data before materialization.                                                                                                                                                                                                                                                                                              | No. `WHERE` clauses are not supported within projection definitions for filtering the materialized data.                                                                                                                                                                                               |
| Chaining capabilities                                                            | Yes, the target table of one materialized view can be the source for another materialized view, enabling multi-stage pipelines.                                                                                                                                                                                                                                          | No. Projections cannot be chained.                                                                                                                                                                                                                                                                     |
| Applicable table engines                                                         | Can be used with various source table engines, but target tables are usually of the `MergeTree` family.                                                                                                                                                                                                                                                                  | **Only available** for `MergeTree` family table engines.                                                                                                                                                                                                                                               |
| Failure handling                                                                 | Failure during data insertion means that data is lost in the target table, leading to potential inconsistency.                                                                                                                                                                                                                                                           | Failures are handled **silently** in the background. Queries can seamlessly mix materialized and unmaterialized parts.                                                                                                                                                                                 |
| Operational overhead                                                             | Requires explicit target table creation and often manual backfilling. Managing consistency with `UPDATE`/`DELETE` increases complexity.                                                                                                                                                                                                                                  | Projections are automatically maintained and kept-in-sync and generally have a lower operational burden.                                                                                                                                                                                               |
| `FINAL` query compatibility                                                      | Generally compatible, but often require `GROUP BY` on the target table.                                                                                                                                                                                                                                                                                                  | **Do not work** with `FINAL` queries.                                                                                                                                                                                                                                                                  |
| Lazy materialization                                                             | Yes.                                                                                                                                                                                                                                                                                                                                                                     | Monitor for projection compatibility issues when using materialization features. You may need to set `query_plan_optimize_lazy_materialization = false`                                                                                                                                                |
| Parallel replicas                                                                | Yes.                                                                                                                                                                                                                                                                                                                                                                     | No.                                                                                                                                                                                                                                                                                                    |
| [`optimize_read_in_order`](/operations/settings/settings#optimize_read_in_order) | Yes.                                                                                                                                                                                                                                                                                                                                                                     | Yes.                                                                                                                                                                                                                                                                                                   |
| Lightweight updates and deletes                                                  | Yes.                                                                                                                                                                                                                                                                                                                                                                     | No.                                                                                                                                                                                                                                                                                                    |

## Comparing materialized views and projections {#choose-between}

### When to choose materialized views {#choosing-materialized-views}

You should consider using materialized views when:

- Working with **real-time ETL & multi-stage data pipelines:** You need to perform complex transformations, aggregations, or to route data as it arrives, potentially across multiple stages by chaining views.
- You require **complex denormalization**: You need to pre-join data from several sources (tables, subqueries or dictionaries) into a single, query-optimized table, especially if periodic full refreshes with the use of refreshable materialized views are acceptable.
- You want **explicit schema control**: You require a separate, distinct target table with its own schema and engine for the pre-computed results, offering greater flexibility for data modelling.
- You want to **filter at ingestion**: You need to filter data _before_ it's materialized, reducing the volume of data written to the target table.

### When to avoid materialized views {#avoid-materialized-views}

You should consider avoiding use of materialized views when:

- **Source data is frequently updated or deleted**: Without additional strategies for handling consistency between the source and target tables, incremental materialized views could become stale and inconsistent.
- **Simplicity and automatic optimization are preferred**: If you want to avoid managing separate target tables.

### When to choose projections {#choosing-projections}

You should consider using projections when:

- **Optimizing queries for a single table**: Your primary goal is to speed up queries on a single base table by providing alternative sorting orders, optimizing filters on columns which are not part of the primary-key, or pre-computing aggregations for a single table.
- You want **query transparency**: you want queries to target the original table without modification, relying on ClickHouse to pick the best data layout for a given query.

### When to avoid projections {#avoid-projections}

You should consider avoiding the use of projections when:

- **Complex data transformation or multi-stage ETL are required**: Projections do not support `JOIN` operations within their definitions, cannot be changed to build multi-step pipelines and cannot handle some SQL features like window functions or complex `CASE` statements. As such they are not suited for complex data transformation.
- **Explicit filtering of materialized data is needed**: Projections do not support `WHERE` clauses in their definition to filter the data that gets materialized into the projection itself.
- **Non-MergeTree table engines are used**: Projections are exclusively available for tables using the `MergeTree` family of engines.
- `FINAL` queries are essential: Projections do not work with `FINAL` queries, which are sometimes used for deduplication.
- You need [parallel replicas](/deployment-guides/parallel-replicas) as they are not supported with projections.

## Summary {#summary}

Materialized views and projections are both powerful tools in your toolkit for 
optimizing queries and transforming data, and in general, we recommend not to view
using them as an either/or choice. Instead, they can be used in a complementary 
manner to get the most out of your queries. As such, the choice between materialized
views and projections in ClickHouse really depends on your specific use case and
access patterns.

As a general rule of thumb, you should consider using materialized views when
you need to aggregate data from one or more source tables into a target table or
perform complex transformations at scale. Materialized views are excellent for shifting 
the work of expensive aggregations from query time to insert time. They are a 
great choice for daily or monthly rollups, real-time dashboards or data summaries. 

On the other hand, you should use projections when you need to optimize queries 
which filter on different columns than those which are used in the table's primary
key which determines the physical ordering of the data on disk. They are particularly
useful when it's no longer possible to change the primary key of a table, or when
your access patterns are more diverse than what the primary key can accommodate.
