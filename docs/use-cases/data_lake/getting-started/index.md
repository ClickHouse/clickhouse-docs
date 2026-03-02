---
title: 'Getting started with lakehouse table formats'
sidebar_label: 'Getting started'
slug: /use-cases/data-lake/getting-started
sidebar_position: 1
pagination_prev: use-cases/data_lake/index
pagination_next: use-cases/data_lake/getting-started/querying-directly
description: 'A hands-on introduction to querying, accelerating, and writing back data in lakehouse formats with ClickHouse.'
keywords: ['data lake', 'lakehouse', 'getting started', 'iceberg', 'delta lake', 'hudi', 'paimon']
doc_type: 'guide'
---

This guide provides a hands-on walkthrough of the core capabilities ClickHouse offers for working with lakehouse table formats.

## Querying data in place {#querying-data-in-place}

ClickHouse can act as a query engine over lakehouse formats stored in object storage. Without duplicating data, users can point ClickHouse at existing Iceberg, Delta Lake, Hudi, or Paimon tables and begin querying immediately, whether to power a production workload or to explore data interactively. This can be done through direct reads using table functions and table engines, or by connecting to a data catalog.

- [Querying lakehouse formats directly](/use-cases/data-lake/getting-started/querying-directly) — Use ClickHouse table functions to read Iceberg, Delta Lake, Hudi, and Paimon tables in object storage without any prior setup.
- [Connecting to a data catalog](/use-cases/data-lake/getting-started/connecting-catalogs) — Expose a catalog as a ClickHouse database and query its tables using standard SQL.

## Accelerating analytics {#accelerating-analytics}

For workloads that demand low-latency responses and high concurrency, loading data from lakehouse formats into ClickHouse's MergeTree engine provides dramatically better performance. It's use of a sparse primary index, skip indices, and columnar storage allow queries that take seconds over Parquet files to complete in milliseconds.

- [Accelerating analytics with MergeTree](/use-cases/data-lake/getting-started/accelerating-analytics) - Load data from a catalog into a MergeTree table and achieve ~40x query speedups.

## Writing data back {#writing-data-back}

Data can also flow from ClickHouse back into lakehouse formats. Whether offloading aged data to long-term storage or publishing the results of transformations for downstream consumption, ClickHouse can write to Iceberg tables in object storage.

- [Writing data to lakehouse formats](/use-cases/data-lake/getting-started/writing-data) - Write raw data and aggregated results from ClickHouse into Iceberg tables using `INSERT INTO SELECT`.
