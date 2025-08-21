---
slug: /use-cases/data-lake/rest-catalog
sidebar_label: 'REST Catalog'
title: 'REST Catalog'
pagination_prev: null
pagination_next: null
description: 'In this guide, we will walk you through the steps to query
 your data using ClickHouse and the REST Catalog.'
keywords: ['REST', 'Tabular', 'Data Lake', 'Iceberg']
show_related_blogs: true
doc_type: how-to
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

:::note
Integration with the REST Catalog works with Iceberg tables only.
This integration supports both AWS S3 and other cloud storage providers.
:::

ClickHouse supports integration with multiple catalogs (Unity, Glue, REST, Polaris, etc.). This guide will walk you through the steps to query your data using ClickHouse and the [REST Catalog](https://github.com/apache/iceberg/blob/main/open-api/rest-catalog-open-api.yaml/) specification.

The REST Catalog is a standardized API specification for Iceberg catalogs, supported by various platforms including:
- **Local development environments** (using docker-compose setups)
- **Managed services** like Tabular.io
- **Self-hosted** REST catalog implementations

:::note
As this feature is experimental, you will need to enable it using:
`SET allow_experimental_database_iceberg = 1;`
:::

## Local Development Setup {#local-development-setup}

For local development and testing, you can use a containerized REST catalog setup. This approach is ideal for learning, prototyping, and development environments.

### Prerequisites {#local-prerequisites}

1. **Docker and Docker Compose**: Ensure Docker is installed and running
2. **Sample Setup**: You can use various docker-compose setups (see Alternative Docker Images below)

### Setting up Local REST Catalog {#setting-up-local-rest-catalog}

You can use various containerized REST catalog implementations such as **[Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io)** which provides a complete Spark + Iceberg + REST catalog environment with docker-compose, making it ideal for testing Iceberg integrations.

**Step 1:** Create a new folder in which to run the example, then create a file `docker-compose.yml` with the configuration from [Databricks docker-spark-iceberg](https://github.com/databricks/docker-spark-iceberg/blob/main/docker-compose.yml?ref=blog.min.io).

**Step 2:** Next, create a file `docker-compose.override.yml` and place the following ClickHouse container configuration into it:

```yaml
version: '3.8'

services:
  clickhouse:
    image: clickhouse/clickhouse-server:25.5.6
    container_name: clickhouse
    user: '0:0'  # Ensures root permissions
    ports:
      - "8123:8123"
      - "9002:9000"
    volumes:
      - ./clickhouse:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import  # Mount dataset folder
    networks:
      - iceberg_net
    environment:
      - CLICKHOUSE_DB=default
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_DO_NOT_CHOWN=1
      - CLICKHOUSE_PASSWORD=
```

**Step 3:** Run the following command to start the services:

```bash
docker compose up
```

**Step 4:** Wait for all services to be ready. You can check the logs:

```bash
docker-compose logs -f
```

:::note
The REST catalog setup requires that sample data be loaded into the Iceberg tables first. Make sure the Spark environment has created and populated the tables before attempting to query them through ClickHouse. The availability of tables depends on the specific docker-compose setup and sample data loading scripts.
:::

### Connecting to Local REST Catalog {#connecting-to-local-rest-catalog}

Connect to your ClickHouse container:

```bash
docker exec -it clickhouse clickhouse-client
```

Then create the database connection to the REST catalog:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```

## Querying REST catalog tables using ClickHouse {#querying-rest-catalog-tables-using-clickhouse}

Now that the connection is in place, you can start querying via the REST catalog. For example:

```sql
USE demo;

SHOW TABLES;
```

If your setup includes sample data (such as the taxi dataset), you should see tables like:

```sql title="Response"
┌─name──────────┐
│ default.taxis │
└───────────────┘
```

:::note
If you don't see any tables, this usually means:
1. The Spark environment hasn't created the sample tables yet
2. The REST catalog service isn't fully initialized
3. The sample data loading process hasn't completed

You can check the Spark logs to see the table creation progress:
```bash
docker-compose logs spark
```
:::

To query a table (if available):

```sql
SELECT count(*) FROM `default.taxis`;
```

```sql title="Response"
┌─count()─┐
│ 2171187 │
└─────────┘
```

:::note Backticks required
Backticks are required because ClickHouse doesn't support more than one namespace.
:::

To inspect the table DDL:

```sql
SHOW CREATE TABLE `default.taxis`;
```

```sql title="Response"
┌─statement─────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE demo.`default.taxis`                                                             │
│ (                                                                                             │
│     `VendorID` Nullable(Int64),                                                               │
│     `tpep_pickup_datetime` Nullable(DateTime64(6)),                                           │
│     `tpep_dropoff_datetime` Nullable(DateTime64(6)),                                          │
│     `passenger_count` Nullable(Float64),                                                      │
│     `trip_distance` Nullable(Float64),                                                        │
│     `RatecodeID` Nullable(Float64),                                                           │
│     `store_and_fwd_flag` Nullable(String),                                                    │
│     `PULocationID` Nullable(Int64),                                                           │
│     `DOLocationID` Nullable(Int64),                                                           │
│     `payment_type` Nullable(Int64),                                                           │
│     `fare_amount` Nullable(Float64),                                                          │
│     `extra` Nullable(Float64),                                                                │
│     `mta_tax` Nullable(Float64),                                                              │
│     `tip_amount` Nullable(Float64),                                                           │
│     `tolls_amount` Nullable(Float64),                                                         │
│     `improvement_surcharge` Nullable(Float64),                                                │
│     `total_amount` Nullable(Float64),                                                         │
│     `congestion_surcharge` Nullable(Float64),                                                 │
│     `airport_fee` Nullable(Float64)                                                           │
│ )                                                                                             │
│ ENGINE = Iceberg('http://minio:9000/lakehouse/warehouse/default/taxis/', 'admin', '[HIDDEN]') │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Loading data from your Data Lake into ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

If you need to load data from the REST catalog into ClickHouse, start by creating a local ClickHouse table:

```sql
CREATE TABLE taxis
(
    `VendorID` Int64,
    `tpep_pickup_datetime` DateTime64(6),
    `tpep_dropoff_datetime` DateTime64(6),
    `passenger_count` Float64,
    `trip_distance` Float64,
    `RatecodeID` Float64,
    `store_and_fwd_flag` String,
    `PULocationID` Int64,
    `DOLocationID` Int64,
    `payment_type` Int64,
    `fare_amount` Float64,
    `extra` Float64,
    `mta_tax` Float64,
    `tip_amount` Float64,
    `tolls_amount` Float64,
    `improvement_surcharge` Float64,
    `total_amount` Float64,
    `congestion_surcharge` Float64,
    `airport_fee` Float64
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(tpep_pickup_datetime)
ORDER BY (VendorID, tpep_pickup_datetime, PULocationID, DOLocationID);
```

Then load the data from your REST catalog table via an `INSERT INTO SELECT`:

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
