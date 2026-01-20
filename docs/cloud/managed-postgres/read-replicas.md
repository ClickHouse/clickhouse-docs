---
slug: /cloud/managed-postgres/read-replicas
sidebar_label: 'Read Replicas'
title: 'Read Replicas'
description: 'Scale read-heavy workloads with read replicas in ClickHouse Managed Postgres'
keywords: ['read replicas', 'scalability', 'read scaling', 'postgres replicas', 'horizontal scaling']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge/>

Read replicas allow you to create one or more copies of your primary Managed Postgres database. These replicas continuously follow your primary database using PostgreSQL's native replication to stay up to date with changes. You can create read replicas from the **Read Replica** view of your instance.

{/* TODO(kaushik-ubi): Screenshot of read replica view
    Path: /static/images/cloud/managed-postgres/read-replicas.png */}

## Why use read replicas {#why-use-read-replicas}

### Scalability {#scalability}

Read replicas allow you to scale your database horizontally by distributing read-heavy workloads across multiple dedicated instances. This is particularly valuable for reporting queries, analytics processing, and real-time dashboards that would otherwise compete with your production traffic for resources.

### Isolation {#isolation}

By directing analytical and business intelligence queries to read replicas, you keep your primary instance focused and responsive for write operations and critical transactional workloads. This separation improves overall system performance and predictability. It also means you don't need to grant write access to analytical or reporting tools—they can operate safely against a replica with no risk of accidental data modification.

### Business continuity {#business-continuity}

Read replicas can play a critical role in disaster recovery. If your primary database fails, a read replica can be promoted to primary, minimizing downtime and data loss. This provides an additional layer of resilience beyond your high availability standbys.
