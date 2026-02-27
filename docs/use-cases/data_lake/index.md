---
description: 'Use ClickHouse to query, accelerate, and analyze data in lakehouse formats such as Apache Iceberg, Delta Lake, Apache Hudi, and Apache Paimon.'
pagination_prev: null
pagination_next: use-cases/data_lake/getting-started/index
slug: /use-cases/data-lake
title: 'Data Lakehouse'
keywords: ['data lake', 'lakehouse', 'iceberg', 'delta lake', 'hudi', 'paimon', 'glue', 'unity', 'rest', 'OneLake']
doc_type: 'landing-page'
---

ClickHouse integrates with open lakehouse table formats, including [Apache Iceberg](/engines/table-engines/integrations/iceberg), [Delta Lake](/engines/table-engines/integrations/deltalake), [Apache Hudi](/engines/table-engines/integrations/hudi), and [Apache Paimon](/sql-reference/table-functions/paimon). This allows users to connect ClickHouse to data already stored in these formats across object storage, combining the analytical power of ClickHouse with their existing data lake infrastructure.

## Why use ClickHouse with lakehouse formats? {#why-clickhouse-uses-lake-formats}

### Query existing data in place {#querying-data-in-place}

ClickHouse can query lakehouse tables directly in object storage without duplicating data. Organizations standardized on Iceberg, Delta Lake, Hudi, or Paimon can point ClickHouse at existing tables and immediately use its SQL dialect, analytical functions, and efficient native Parquet reader. At the same time, tools like [clickhouse-local](/operations/utilities/clickhouse-local) and [chDB](/chdb) enable exploratory, ad hoc analysis across more than 70 file formats in remote storage, allowing users to interactively explore lakehouse datasets with no infrastructure setup.

Users can achieve this with either direct reading, using [table functions and table engines](/use-cases/data-lake/getting-started/querying-directly), or by [connecting to a data catalogue](/use-cases/data-lake/getting-started/connecting-catalogs).

### Real-time analytical workloads with ClickHouse {#real-time-with-clickhouse}

For workloads that demand high concurrency and low-latency responses, users can load data from lakehouse formats into ClickHouse's [MergeTree](/engines/table-engines/mergetree-family/mergetree) engine. This provides a real-time analytics layer on top of data that originates in a data lake, supporting dashboards, operational reporting, and other latency-sensitive workloads that benefit from MergeTree columnar storage and indexing capabilities.

See the getting started guide for [accelerating analytics with MergeTree](/use-cases/data-lake/getting-started/accelerating-analytics).

## Capabilities {#capabilities}

### Read data directly {#read-data-directly}

ClickHouse provides [table functions](/sql-reference/table-functions) and [engines](/engines/table-engines/integrations) for reading lakehouse formats directly on object storage. Functions such as [`iceberg()`](/sql-reference/table-functions/iceberg), [`deltaLake()`](/sql-reference/table-functions/deltalake), [`hudi()`](/sql-reference/table-functions/hudi), and [`paimon()`](/sql-reference/table-functions/paimon) allow users to query lake format tables from within a SQL statement without any prior configuration. Versions of these functions exist for most common object stores, such as S3, Azure Blob Storage, and GCS. These functions also have equivalent table engines which can be used to create tables within ClickHouse which reference underlying lake formats object storage - thus making querying more convenient.

See our getting started guide for [querying directly](/use-cases/data-lake/getting-started/querying-directly), or by [connecting to a data catalogue](/use-cases/data-lake/getting-started/connecting-catalogs).

### Expose catalogs as databases {#expose-catalogs-as-databases}

Using the [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) database engine, users can connect ClickHouse to an external catalog and expose it as a database. Tables registered in the catalog appear as tables within ClickHouse, enabling the full range of ClickHouse SQL syntax and analytical functions to be used transparently. This means users can query, join, and aggregate across catalog-managed tables as if they were native ClickHouse tables, benefiting from ClickHouse's query optimization, parallel execution, and reading capabilities.

Supported catalogs include:

| Catalog | Guide |
|---------|-------|
| AWS Glue | [Glue Catalog guide](/use-cases/data-lake/glue-catalog) |
| Databricks Unity Catalog | [Unity Catalog guide](/use-cases/data-lake/unity-catalog) |
| Iceberg REST Catalog | [REST Catalog guide](/use-cases/data-lake/rest-catalog) |
| Lakekeeper | [Lakekeeper Catalog guide](/use-cases/data-lake/lakekeeper-catalog) |
| Project Nessie | [Nessie Catalog guide](/use-cases/data-lake/nessie-catalog) |
| Microsoft OneLake | [OneLake Catalog guide](/use-cases/data-lake/onelake-catalog) |

See the getting started guide for [connecting to catalogs](/use-cases/data-lake/getting-started/connecting-catalogs).

### Write back to lakehouse formats {#write-back-to-lakehouse-formats}

ClickHouse supports writing data back to lakehouse formats, which is relevant in scenarios such as:

- **Real-time to long-term storage** - Data transits through ClickHouse as a real-time analytics layer, and users need to offload results to Iceberg or other formats for durable, cost-effective long-term storage.
- **Reverse ETL** - Users perform transformations inside ClickHouse using materialized views or scheduled queries and wish to persist the results into lakehouse tables for consumption by other tools in the data ecosystem.

See the getting started guide for [writing to data lakes](/use-cases/data-lake/getting-started/writing-data).

## Next steps {#next-steps}

Ready to try it out? The [Getting Started guide](/use-cases/data-lake/getting-started) walks through querying lakehouse formats directly, connecting to a catalog, loading data into MergeTree for fast analytics, and writing results back - all in a single end-to-end workflow.
