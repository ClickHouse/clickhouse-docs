---
slug: /use-cases/data-lake/nessie-catalog
sidebar_label: 'Nessie catalog'
title: 'Nessie catalog'
pagination_prev: null
pagination_next: null
description: 'In this guide, we will walk you through the steps to query
 your data using ClickHouse and the Nessie Catalog.'
keywords: ['Nessie', 'REST', 'Transactional', 'Data Lake', 'Iceberg', 'Git-like']
show_related_blogs: true
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

:::note
Integration with the Nessie Catalog works with Iceberg tables only.
This integration supports both AWS S3 and other cloud storage providers.
:::

ClickHouse supports integration with multiple catalogs (Unity, Glue, REST, Polaris, etc.). This guide will walk you through the steps to query your data using ClickHouse and the [Nessie](https://projectnessie.org/) catalog.

Nessie is an open-source transactional catalog for data lakes that provides:
- **Git-inspired** data version control with branches and commits
- **Cross-table transactions** and visibility guarantees
- **REST API** compliance with the Iceberg REST catalog specification
- **Open data lake** approach supporting Hive, Spark, Dremio, Trino, and more
- **Production-ready** deployment on Docker or Kubernetes

:::note
As this feature is experimental, you will need to enable it using:
`SET allow_experimental_database_iceberg = 1;`
:::

## Local Development Setup {#local-development-setup}

For local development and testing, you can use a containerized Nessie setup. This approach is ideal for learning, prototyping, and development environments.

### Prerequisites {#local-prerequisites}

1. **Docker and Docker Compose**: Ensure Docker is installed and running
2. **Sample Setup**: You can use the official Nessie docker-compose setup

### Setting up Local Nessie Catalog {#setting-up-local-nessie-catalog}

You can use the official [Nessie docker-compose setup](https://projectnessie.org/guides/setting-up/) which provides a complete environment with Nessie, in-memory version store, and MinIO for object storage.

**Step 1:** Create a new folder in which to run the example, then create a file `docker-compose.yml` with the following configuration:

```yaml
version: '3.8'

services:
  nessie:
    image: ghcr.io/projectnessie/nessie:latest
    ports:
      - "19120:19120"
    environment:
      - nessie.version.store.type=IN_MEMORY
      - nessie.catalog.default-warehouse=warehouse
      - nessie.catalog.warehouses.warehouse.location=s3://my-bucket/
      - nessie.catalog.service.s3.default-options.endpoint=http://minio:9000/
      - nessie.catalog.service.s3.default-options.access-key=urn:nessie-secret:quarkus:nessie.catalog.secrets.access-key
      - nessie.catalog.service.s3.default-options.path-style-access=true
      - nessie.catalog.service.s3.default-options.auth-type=STATIC
      - nessie.catalog.secrets.access-key.name=admin
      - nessie.catalog.secrets.access-key.secret=password
      - nessie.catalog.service.s3.default-options.region=us-east-1
      - nessie.server.authentication.enabled=false
    depends_on:
      minio:
        condition: service_healthy
    networks:
      - iceberg_net

  minio:
    image: quay.io/minio/minio
    ports:
      - "9002:9000"
      - "9003:9001"
    environment:
      - MINIO_ROOT_USER=admin
      - MINIO_ROOT_PASSWORD=password
      - MINIO_REGION=us-east-1
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 10s
      retries: 5
      start_period: 30s
    entrypoint: >
      /bin/sh -c "
      minio server /data --console-address ':9001' &
      sleep 10;
      mc alias set myminio http://localhost:9000 admin password;
      mc mb myminio/my-bucket --ignore-existing;
      tail -f /dev/null"
    networks:
      - iceberg_net

  clickhouse:
    image: clickhouse/clickhouse-server:head
    container_name: nessie-clickhouse
    user: '0:0'  # Ensures root permissions
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - clickhouse_data:/var/lib/clickhouse
      - ./clickhouse/data_import:/var/lib/clickhouse/data_import  # Mount dataset folder
    networks:
      - iceberg_net
    environment:
      - CLICKHOUSE_DB=default
      - CLICKHOUSE_USER=default
      - CLICKHOUSE_DO_NOT_CHOWN=1
      - CLICKHOUSE_PASSWORD=
    depends_on:
      nessie:
        condition: service_started
      minio:
        condition: service_healthy

volumes:
  clickhouse_data:

networks:
  iceberg_net:
    driver: bridge
```

**Step 2:** Run the following command to start the services:

```bash
docker compose up -d
```

**Step 3:** Wait for all services to be ready. You can check the logs:

```bash
docker-compose logs -f
```

:::note
The Nessie setup uses an in-memory version store and requires that sample data be loaded into the Iceberg tables first. Make sure the environment has created and populated the tables before attempting to query them through ClickHouse.
:::

### Connecting to Local Nessie Catalog {#connecting-to-local-nessie-catalog}

Connect to your ClickHouse container:

```bash
docker exec -it nessie-clickhouse clickhouse-client
```

Then create the database connection to the Nessie catalog:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE demo
ENGINE = DataLakeCatalog('http://nessie:19120/iceberg', 'admin', 'password')
SETTINGS catalog_type = 'rest', storage_endpoint = 'http://minio:9002/my-bucket', warehouse = 'warehouse'
```

## Querying Nessie catalog tables using ClickHouse {#querying-nessie-catalog-tables-using-clickhouse}

Now that the connection is in place, you can start querying via the Nessie catalog. For example:

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
1. The environment hasn't created the sample tables yet
2. The Nessie catalog service isn't fully initialized
3. The sample data loading process hasn't completed

You can check the Nessie logs to see the catalog activity:
```bash
docker-compose logs nessie
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
│ ENGINE = Iceberg('http://localhost:9002/my-bucket/default/taxis/', 'admin', '[HIDDEN]')      │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Loading data from your Data Lake into ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

If you need to load data from the Nessie catalog into ClickHouse, start by creating a local ClickHouse table:

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

Then load the data from your Nessie catalog table via an `INSERT INTO SELECT`:

```sql
INSERT INTO taxis 
SELECT * FROM demo.`default.taxis`;
```
