---
slug: /cloud/managed-postgres/extensions
sidebar_label: 'Extensions'
title: 'PostgreSQL Extensions'
description: 'Available PostgreSQL extensions in ClickHouse Managed Postgres'
keywords: ['postgres extensions', 'postgis', 'pgvector', 'pg_cron', 'postgresql extensions']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge/>

Managed Postgres includes a curated set of extensions to extend the functionality of your database. Below is the list of available extensions and their versions.

## Installing extensions {#installing-extensions}

To install an extension, connect to your database and run:

```sql
CREATE EXTENSION extension_name;
```

To see which extensions are currently installed:

```sql
SELECT * FROM pg_extension;
```

To view all available extensions and their versions:

```sql
SELECT * FROM pg_available_extensions;
```

## Available extensions {#available-extensions}

| Extension | Version | Description |
|-----------|---------|-------------|
| `h3` | 4.2.3 | H3 bindings for PostgreSQL |
| `h3_postgis` | 4.2.3 | H3 PostGIS integration |
| `hll` | 2.19 | Type for storing HyperLogLog data |
| `hypopg` | 1.4.2 | Hypothetical indexes for PostgreSQL |
| `ip4r` | 2.4 | IPv4 and IPv6 range index types |
| `mysql_fdw` | 1.2 | Foreign data wrapper for querying a MySQL server |
| `orafce` | 4.16 | Functions and operators that emulate a subset of functions and packages from the Oracle RDBMS |
| `pg_clickhouse` | 0.1 | Interfaces to query ClickHouse databases from PostgreSQL |
| `pg_cron` | 1.6 | Job scheduler for PostgreSQL |
| `pg_hint_plan` | 1.8.0 | Optimizer hints for PostgreSQL |
| `pg_ivm` | 1.13 | Incremental view maintenance on PostgreSQL |
| `pg_partman` | 5.3.1 | Extension to manage partitioned tables by time or ID |
| `pg_repack` | 1.5.3 | Reorganize tables in PostgreSQL databases with minimal locks |
| `pg_similarity` | 1.0 | Support similarity queries |
| `pgaudit` | 18.0 | Provides auditing functionality |
| `pglogical` | 2.4.6 | PostgreSQL Logical Replication |
| `pgrouting` | 4.0.0 | pgRouting Extension |
| `pgtap` | 1.3.4 | Unit testing for PostgreSQL |
| `plpgsql_check` | 2.8 | Extended check for plpgsql functions |
| `postgis` | 3.6.1 | PostGIS geometry and geography spatial types and functions |
| `postgis_raster` | 3.6.1 | PostGIS raster types and functions |
| `postgis_sfcgal` | 3.6.1 | PostGIS SFCGAL functions |
| `postgis_tiger_geocoder` | 3.6.1 | PostGIS tiger geocoder and reverse geocoder |
| `postgis_topology` | 3.6.1 | PostGIS topology spatial types and functions |
| `address_standardizer` | 3.6.1 | Used to parse an address into constituent elements. Generally used to support geocoding address normalization step. |
| `address_standardizer_data_us` | 3.6.1 | Address Standardizer US dataset example |
| `prefix` | 1.2.0 | Prefix Range module for PostgreSQL |
| `semver` | 0.41.0 | Semantic version data type |
| `unit` | 7 | SI units extension |
| `vector` | 0.8.1 | Vector data type and ivfflat and hnsw access methods |

## pg_clickhouse extension {#pg-clickhouse}

The `pg_clickhouse` extension is pre-installed on every Managed Postgres instance. It allows you to query ClickHouse databases directly from PostgreSQL, enabling a unified query layer for both transactions and analytics.

See the [pg_clickhouse documentation](/integrations/pg_clickhouse) for setup instructions and usage details.
