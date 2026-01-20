---
slug: /cloud/managed-postgres/overview
sidebar_label: 'Overview'
title: 'Managed Postgres'
description: 'Fast, scalable, enterprise-grade Postgres backed by NVMe storage with native ClickHouse integration for real-time analytics'
keywords: ['managed postgres', 'postgresql', 'cloud database', 'postgres service', 'nvme postgres', 'clickhouse integration']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge/>

ClickHouse Managed Postgres is an enterprise-grade managed Postgres service built for performance and scale. Backed by NVMe storage that is physically colocated with compute, it delivers up to 10X faster performance for workloads that are disk-bound compared to alternatives using network-attached storage like EBS.

Built in partnership with [Ubicloud](https://www.ubicloud.com/), whose founding team has a track record of delivering world-class Postgres at Citus Data, Heroku, and Microsoft, Managed Postgres solves the performance challenges that fast-growing applications commonly face: slower ingestion and updates, slow vacuums, increased tail latency, and WAL spikes caused by limited disk IOPS.

{/* TODO: Architecture diagram showing Postgres + ClickHouse integration
    Path: /static/images/cloud/managed-postgres/architecture-overview.png */}

## NVMe-powered performance {#nvme-performance}

Most managed Postgres services use network-attached storage like Amazon EBS, which requires a network round trip for every disk access. This introduces latency measured in milliseconds and limits IOPS, creating bottlenecks for write-heavy or I/O-intensive workloads.

Managed Postgres uses NVMe storage that is physically attached to the same server as your database. This architectural difference delivers:

- **Microsecond-level disk latency** instead of milliseconds
- **Unlimited local IOPS** without network bottlenecks
- **Up to 10X faster performance** for disk-bound workloads at the same cost

For Postgres workloads that are primarily throttled by disk IOPS and latency, this translates to faster ingestion, quicker vacuums, lower tail latency, and more predictable performance under load.

## Native ClickHouse integration {#clickhouse-integration}

Managed Postgres integrates natively with ClickHouse to bring transactions and analytics together without complex ETL pipelines.

### Postgres to ClickHouse replication {#postgres-replication}

Replicate your Postgres data to ClickHouse using the [Postgres CDC connector in ClickPipes](/integrations/clickpipes/postgres). The connector handles both initial load and continuous incremental sync, and is battle-tested by hundreds of enterprise customers moving hundreds of terabytes per month.

### pg_clickhouse: unified query layer {#pg-clickhouse}

Every Managed Postgres instance comes with the [`pg_clickhouse`](https://github.com/ClickHouse/pg_clickhouse) extension, which lets you query ClickHouse directly from Postgres. Your application can use Postgres as a unified query layer for both transactions and analytics, without needing to connect to multiple databases.

The extension provides comprehensive query pushdown to ClickHouse for efficient execution, including support for filters, joins, semi-joins, aggregations, and functions. Currently, 14 of 22 TPC-H queries are fully pushed down, delivering over 60X performance improvements compared to running the same queries in standard Postgres.

## Enterprise-grade reliability {#enterprise-reliability}

Managed Postgres provides the reliability and security features that production workloads require.

### High availability {#high-availability}

Configure up to two standby replicas across different availability zones using quorum-based replication. These standbys are dedicated to high availability and automatic failover, ensuring your database recovers quickly from failures. For read scaling, you can provision separate [read replicas](/cloud/managed-postgres/read-replicas). See the [High availability](/cloud/managed-postgres/high-availability) page for configuration details.

### Backups and recovery {#backups}

Every instance includes automatic backups that support forks and point-in-time recovery. Backups run on [WAL-G](https://github.com/wal-g/wal-g), a well-known open-source tool that handles full backups and continuous WAL archiving to object storage.

### Security and compliance {#security-compliance}

Managed Postgres is built to meet the same security standards as ClickHouse Cloud:

- **Authentication**: SAML/SSO support
- **Network security**: IP allow-listing, encryption at rest and in transit (TLS 1.3)
- **Access control**: Full superuser access for database administration

### Open source foundation {#open-source}

Both Postgres and ClickHouse are open-source databases with large, thriving communities. The integration components, including the `pg_clickhouse` extension and the CDC replication powered by PeerDB, are also open source. This foundation ensures no vendor lock-in, giving you full control and long-term flexibility over your data stack.
