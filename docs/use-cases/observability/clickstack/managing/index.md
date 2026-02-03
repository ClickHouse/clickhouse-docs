---
slug: /use-cases/observability/clickstack/managing
title: 'Managing ClickStack'
pagination_prev: null
pagination_next: null
sidebar_label: 'Managing ClickStack'
description: 'Managing ClickStack'
doc_type: 'guide'
keywords: ['managing ClickStack', 'performance', 'materialized views', 'admin commands']
---

This section describes how to manage ClickStack.

## Admin guides

| Section | Description |
|--------|-------------|
| [Basic administration](/use-cases/observability/clickstack/admin) | An introduction to performing common administrative tasks in ClickStack. |
| [Going to production](/use-cases/observability/clickstack/production) | Recommended steps and best practices before running ClickStack in production. |
| [Materialized views](/use-cases/observability/clickstack/materialized_views) | A detailed guide to using materialized views in ClickStack to accelerate query performance. |
| [Performance tuning](/use-cases/observability/clickstack/performance_tuning) | A comprehensive guide to tuning ClickStack for large-scale workloads. |

## Core ClickHouse concepts

 Most ClickStack management tasks require familiarity with the underlying ClickHouse database. We recommend reviewing the following core ClickHouse concepts outlined below before performing administrative or performance-related operations.

| Concept | Description |
|---------|-------------|
| **Tables** | How ClickStack data sources map to underlying ClickHouse tables. ClickHouse tables primarily use the [MergeTree](/engines/table-engines/mergetree-family/mergetree) engine. |
| **Parts** | How data is written as immutable parts and merged over time. |
| **Partitions** | Logical groupings of table parts that simplify data management, querying, and optimization. |
| **Merges** | The background process that combines parts to reduce the number of parts queried and maintain performance. |
| **Granules** | The smallest unit of data read and pruned during query execution. |
| **Primary (ordering) keys** | How the `ORDER BY` key defines on-disk data layout, compression, and query pruning behavior. |

These concepts are fundamental to ClickHouse performance and will help you make informed administrative decisions when managing ClickStack.
