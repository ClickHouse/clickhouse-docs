---
slug: /use-cases/data-lake/lakekeeper-catalog
sidebar_label: 'Lakekeeper Catalog'
title: 'Lakekeeper Catalog'
pagination_prev: null
pagination_next: null
description: 'In this guide, we will walk you through the steps to query
 your data using ClickHouse and the Lakekeeper Catalog.'
keywords: ['Lakekeeper', 'REST', 'Tabular', 'Data Lake', 'Iceberg']
show_related_blogs: true
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

:::note
Integration with the Lakekeeper Catalog works with Iceberg tables only.
This integration supports both AWS S3 and other cloud storage providers.
:::

ClickHouse supports integration with multiple catalogs (Unity, Glue, REST, Polaris, etc.). This guide will walk you through the steps to query your data using ClickHouse and the [Lakekeeper](https://github.com/lakekeeper/lakekeeper) catalog.

Lakekeeper is an open-source REST catalog implementation for Apache Iceberg that provides:
- **REST API** compliance with the Iceberg REST catalog specification
- **Multi-tenant** support for managing multiple warehouses
- **Cloud storage** integration with S3-compatible storage
- **Production-ready** deployment capabilities

:::note
As this feature is experimental, you will need to enable it using:
`SET allow_experimental_database_iceberg = 1;`
:::

## Local Development Setup {#local-development-setup}

For local development and testing, you can use a containerized Lakekeeper setup. This approach is ideal for learning, prototyping, and development environments.

### Prerequisites {#local-prerequisites}

1. **Docker and Docker Compose**: Ensure Docker is installed and running
2. **Sample Setup**: You can use the Lakekeeper docker-compose setup

### Setting up Local Lakekeeper Catalog {#setting-up-local-lakekeeper-catalog}

You can use the official Lakekeeper docker-compose setup which provides a complete environment with Lakekeeper, PostgreSQL metadata backend, and MinIO for object storage.

**Step 1:** Create a new folder in which to run the example, then create a file `docker-compose.yml` with the following configuration:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: lakekeeper-postgres
    environment:
      POSTGRES_USER: iceberg
      POSTGRES_PASSWORD: iceberg
      POSTGRES_DB: iceberg
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - iceberg_net

  minio:
    image: minio/minio:latest
    container_name: lakekeeper-minio
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: password
      MINIO_DOMAIN: minio
    ports:
      - "9001:9001"
      - "9000:9000"
    command: ["server", "/data", "--console-address", ":9001"]
    volumes:
      - minio_data:/data
    networks:
      - iceberg_net

  # Initialize MinIO with required buckets
  mc:
    image: minio/mc:latest
    container_name: lakekeeper-mc
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      until (/usr/bin/mc config host add minio http://minio:9000 admin password) do echo '...waiting...' && sleep 1; done;
      /usr/bin/mc mb minio/warehouse;
      /usr/bin/mc policy set public minio/warehouse;
      exit 0;
      "
    networks:
      - iceberg_net

  lakekeeper:
    image: lakekeeper/lakekeeper:latest
    container_name: lakekeeper-catalog
    depends_on:
      - postgres
      - minio
    environment:
      LAKEKEEPER__PG_ENCRYPTION_KEY: "abcdefghijklmnopqrstuvwxyz123456"
      LAKEKEEPER__PG_DATABASE_URL_READ: "postgresql://iceberg:iceberg@postgres:5432/iceberg"
      LAKEKEEPER__PG_DATABASE_URL_WRITE: "postgresql://iceberg:iceberg@postgres:5432/iceberg"
      LAKEKEEPER__STORAGE__S3__ENDPOINT: "http://minio:9000"
      LAKEKEEPER__STORAGE__S3__ACCESS_KEY_ID: "admin"
      LAKEKEEPER__STORAGE__S3__SECRET_ACCESS_KEY: "password"
      LAKEKEEPER__STORAGE__S3__REGION: "us-east-1"
      LAKEKEEPER__STORAGE__S3__BUCKET: "warehouse"
      LAKEKEEPER__STORAGE__S3__PATH_STYLE_ACCESS: "true"
    ports:
      - "8080:8080"
    networks:
      - iceberg_net

  clickhouse:
    image: clickhouse/clickhouse-server:head
    container_name: lakekeeper-clickhouse
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

volumes:
  postgres_data:
  minio_data:

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
docker-compose logs -f lakekeeper
```

**Step 4:** Verify that Lakekeeper is running by checking the catalog status:

```bash
curl http://localhost:8080/v1/config
```

You should see a JSON response indicating the catalog configuration.

:::note
The Lakekeeper setup requires that the MinIO buckets be created first. The `mc` service in the docker-compose file handles this initialization. Make sure all services are healthy before attempting to query them through ClickHouse.
:::

### Connecting to Local Lakekeeper Catalog {#connecting-to-local-lakekeeper-catalog}

Connect to your ClickHouse container:

```bash
docker exec -it lakekeeper-clickhouse clickhouse-client
```

Then create the database connection to the Lakekeeper catalog:

```sql
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE lakekeeper_demo
ENGINE = DataLakeCatalog('http://lakekeeper:8080/v1', '', '')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/warehouse', 
    warehouse = 'demo'
```

## Creating Sample Data {#creating-sample-data}

Before querying tables, let's create some sample data using a simple Python script or by using the Iceberg Python library to create tables in Lakekeeper.

**Step 1:** Create a simple table using the REST API:

```bash
# First, create a namespace (database)
curl -X POST http://localhost:8080/v1/namespaces \
  -H "Content-Type: application/json" \
  -d '{"namespace": ["demo"], "properties": {}}'

# Then create a table (this is a simplified example - in practice you would use Iceberg clients)
```

:::note
For production use, you would typically use Iceberg-compatible tools like Apache Spark, PyIceberg, or other Iceberg clients to create and populate tables. The Lakekeeper catalog acts as the metadata layer that coordinates table operations.
:::

## Querying Lakekeeper catalog tables using ClickHouse {#querying-lakekeeper-catalog-tables-using-clickhouse}

Now that the connection is in place, you can start querying via the Lakekeeper catalog. For example:

```sql
USE lakekeeper_demo;

SHOW TABLES;
```

If your setup includes sample data, you should see tables created in the demo namespace.

:::note
If you don't see any tables, this usually means:
1. No tables have been created in the Lakekeeper catalog yet
2. The Lakekeeper service isn't fully initialized
3. The namespace doesn't exist

You can check the Lakekeeper logs to see the catalog activity:
```bash
docker-compose logs lakekeeper
```
:::

To create and query a sample table (assuming you have created one through Iceberg clients):

```sql
-- Example query if you have created sample tables
SELECT count(*) FROM `demo.sample_table`;
```

:::note Backticks required
Backticks are required because ClickHouse doesn't support more than one namespace.
:::

To inspect a table DDL (if available):

```sql
SHOW CREATE TABLE `demo.sample_table`;
```

## Loading data from your Data Lake into ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

If you need to load data from the Lakekeeper catalog into ClickHouse, start by creating a local ClickHouse table that matches your Iceberg table schema:

```sql
-- Example table structure - adjust based on your actual Iceberg table schema
CREATE TABLE local_sample_table
(
    `id` Int64,
    `name` String,
    `timestamp` DateTime64(6),
    `value` Float64
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (id, timestamp);
```

Then load the data from your Lakekeeper catalog table via an `INSERT INTO SELECT`:

```sql
INSERT INTO local_sample_table 
SELECT * FROM lakekeeper_demo.`demo.sample_table`;
```

## Managing the Lakekeeper Catalog {#managing-lakekeeper-catalog}

### Accessing the MinIO Console

You can access the MinIO console at `http://localhost:9001` using:
- Username: `admin`
- Password: `password`

### Monitoring Lakekeeper

Lakekeeper provides REST endpoints for monitoring and management:

```bash
# Check catalog health
curl http://localhost:8080/health

# List namespaces
curl http://localhost:8080/v1/namespaces

# Get catalog configuration
curl http://localhost:8080/v1/config
```

### Cleanup

To stop and remove all containers:

```bash
docker-compose down -v
```

This will remove all containers and their associated volumes, including the PostgreSQL metadata and MinIO data.

## Production Considerations {#production-considerations}

When deploying Lakekeeper in production:

1. **Security**: Configure proper authentication and authorization
2. **Persistence**: Use persistent volumes for PostgreSQL and MinIO data
3. **High Availability**: Deploy multiple Lakekeeper instances behind a load balancer
4. **Monitoring**: Set up proper monitoring and alerting for all components
5. **Backup**: Implement backup strategies for metadata and object storage

For more information, refer to the [Lakekeeper documentation](https://github.com/lakekeeper/lakekeeper). 