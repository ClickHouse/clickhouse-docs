---
slug: /cloud/reference/shared-catalog
sidebar_label: 'Shared Catalog'
title: 'Shared Catalog and Shared Database Engine'
keywords: ['SharedCatalog', 'SharedDatabaseEngine']
description: 'Describes the Shared Catalog component and the Shared database engine in ClickHouse Cloud'
doc_type: 'reference'
---

# Shared catalog and shared database engine {#shared-catalog-and-shared-database-engine}

**Available exclusively in ClickHouse Cloud (and first party partner cloud services)**

Shared Catalog is a cloud-native component responsible for replicating metadata and DDL operations of databases and tables that use stateless engines across replicas in ClickHouse Cloud. It enables consistent and centralized state management for these objects, ensuring metadata consistency even in dynamic or partially offline environments.

Shared Catalog does **not replicate tables themselves**, but ensures that all replicas have a consistent view of the database and table definitions by replicating DDL queries and metadata.

It supports replication of the following database engines:

- Shared
- PostgreSQL
- MySQL
- DataLakeCatalog

## Architecture and metadata storage {#architecture-and-metadata-storage}

All metadata and DDL query history in Shared Catalog is stored centrally in ZooKeeper. Nothing is persisted on local disk. This architecture ensures:

- Consistent state across all replicas
- Statelessness of compute nodes
- Fast, reliable replica bootstrapping

## Shared database engine {#shared-database-engine}

The **Shared database engine** works in conjunction with Shared Catalog to manage databases whose tables use **stateless table engines** such as `SharedMergeTree`. These table engines do not write persistent state to disk and are compatible with dynamic compute environments.

Shared database engine builds on and improves the behavior of the Replicated database engine while offering additional guarantees and operational benefits.

### Key benefits {#key-benefits}

- **Atomic CREATE TABLE ... AS SELECT**
  Table creation and data insertion are executed atomically—either the entire operation completes, or the table is not created at all.

- **RENAME TABLE between databases**
  Enables atomic movement of tables across databases:
  ```sql
  RENAME TABLE db1.table TO db2.table;
  ```

- **Automatic table recovery with UNDROP TABLE**
  Dropped tables are retained for a default period of 8 hours and can be restored:
  ```sql
  UNDROP TABLE my_table;
  ```
  The retention window is configurable via server settings.

- **Improved compute-compute separation**
  Unlike the Replicated database engine, which requires all replicas to be online to process a DROP query, Shared Catalog performs centralized metadata deletion. This allows operations to succeed even when some replicas are offline.

- **Automatic metadata replication**
  Shared Catalog ensures that database definitions are automatically replicated to all servers on startup. Operators do not need to manually configure or synchronize metadata on new instances.

- **Centralized, versioned metadata state**
  Shared Catalog stores a single source of truth in ZooKeeper. When a replica starts, it fetches the latest state and applies the diff to reach consistency. During query execution, the system can wait for other replicas to reach at least the required version of metadata to ensure correctness.

## Usage in ClickHouse Cloud {#usage-in-clickhouse-cloud}

For end users, using Shared Catalog and the Shared database engine requires no additional configuration. Database creation is the same as always:

```sql
CREATE DATABASE my_database;
```

ClickHouse Cloud automatically assigns the Shared database engine to databases. Any tables created within such a database using stateless engines will automatically benefit from Shared Catalog’s replication and coordination capabilities.

## Summary {#summary}

Shared Catalog and the Shared database engine provide:

- Reliable and automatic metadata replication for stateless engines
- Stateless compute with no local metadata persistence
- Atomic operations for complex DDL
- Improved support for elastic, ephemeral, or partially offline compute environments
- Seamless usage for ClickHouse Cloud users

These capabilities make Shared Catalog the foundation for scalable, cloud-native metadata management in ClickHouse Cloud.
