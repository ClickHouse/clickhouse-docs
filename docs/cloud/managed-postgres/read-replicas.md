---
slug: /cloud/managed-postgres/read-replicas
sidebar_label: 'Read replicas'
title: 'Read replicas'
description: 'Scale read-heavy workloads with read replicas in ClickHouse Managed Postgres'
keywords: ['read replicas', 'scalability', 'read scaling', 'postgres replicas', 'horizontal scaling']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge/>

Read replicas allow you to create one or more copies of your primary Managed Postgres database. These replicas continuously follow your primary database using PostgreSQL's native replication to stay up to date with changes. You can create read replicas from the **Read Replica** view of your instance.

## Why use read replicas {#why-use-read-replicas}

### Scalability {#scalability}

Read replicas allow you to scale your database horizontally by distributing read-heavy workloads across multiple dedicated instances. This is particularly valuable for reporting queries, analytics processing, and real-time dashboards that would otherwise compete with your production traffic for resources.

### Isolation {#isolation}

By directing analytical and business intelligence queries to read replicas, you keep your primary instance focused and responsive for write operations and critical transactional workloads. This separation improves overall system performance and predictability. It also means you don't need to grant write access to analytical or reporting tools—they can operate safely against a replica with no risk of accidental data modification.

### Business continuity {#business-continuity}

Read replicas can play a critical role in disaster recovery. If your primary database fails, a read replica can be promoted to primary, minimizing downtime and data loss. This provides an additional layer of resilience beyond your high availability standbys.

## How read replicas work {#how-read-replicas-work}

Read replicas in Managed Postgres use a WAL shipping architecture rather than streaming replication. This design choice prioritizes minimizing impact on your primary database.

### WAL shipping from object storage {#wal-shipping-from-object-storage}

When your primary database processes transactions, it generates Write-Ahead Log (WAL) records. These WAL segments are continuously archived to object storage (S3). Read replicas fetch and replay these WAL segments from object storage to stay synchronized with the primary.

This architecture differs from [high availability standbys](/cloud/managed-postgres/high-availability), which use streaming replication with a direct connection to the primary.

### Why we chose this approach {#why-we-chose-this-approach}

We intentionally designed read replicas to consume WAL from object storage rather than connecting directly to the primary as streaming standbys. This approach provides complete isolation between read replicas and your primary database:

- **Zero replication overhead on primary**: Read replicas don't maintain streaming connections to the primary, so they add no CPU, memory, or network load to your mission-critical workloads.
- **Independent scaling**: You can add or remove read replicas without any impact on primary performance.
- **Network isolation**: Read replicas operate in their own network environment with separate connection endpoints.

### Replication lag characteristics {#replication-lag-characteristics}

The trade-off for this architecture is replication lag. WAL segments are archived from the primary at regular intervals (typically every 60 seconds or when a segment fills up, whichever comes first). This means read replicas may lag behind the primary by up to a few tens of seconds under normal conditions.

For most read scaling use cases—reporting, analytics, dashboards—this lag is acceptable. If your application requires near-real-time reads, consider whether the queries can be directed to the primary or whether eventual consistency within this window meets your requirements.
