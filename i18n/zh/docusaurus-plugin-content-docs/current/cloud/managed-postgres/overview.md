---
slug: /cloud/managed-postgres
title: '托管 Postgres'
description: '基于 NVMe 存储构建的快速、可扩展企业级 Postgres，原生集成 ClickHouse，用于实时分析'
keywords: ['托管 Postgres', 'PostgreSQL', '云数据库', 'Postgres 服务', 'NVMe Postgres', 'ClickHouse 集成']
doc_type: '指南'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="overview" />

ClickHouse Managed Postgres 是一款面向企业的托管 Postgres 服务，专为高性能和高可扩展性而构建。依托与计算节点物理同机部署的 NVMe 存储，相比使用 EBS 等网络附加存储的替代方案，对于受磁盘限制的工作负载，最高可提供 10 倍的性能提升。

该服务由 ClickHouse 与 [Ubicloud](https://www.ubicloud.com/) 合作打造，后者的创始团队曾在 Citus Data、Heroku 和 Microsoft 交付世界级 Postgres，拥有卓越的实践记录。Managed Postgres 解决了快速增长的应用常见的性能挑战：摄取与更新变慢、vacuum 操作缓慢、尾延迟增加，以及由于磁盘 IOPS 受限导致的 WAL 峰值等问题。

{/* TODO: 展示 Postgres 与 ClickHouse 集成的架构示意图
    Path: /static/images/cloud/managed-postgres/architecture-overview.png */}


## 基于 NVMe 的性能 \{#nvme-performance\}

大多数托管 Postgres 服务使用的是诸如 Amazon EBS 之类的网络连接存储，每次磁盘访问都需要一次网络往返。这会引入以毫秒计的延迟，并限制 IOPS，从而在写入密集或 I/O 密集型工作负载中形成瓶颈。

托管 Postgres 使用直接物理连接到与数据库同一台服务器上的 NVMe 存储。这一架构差异带来了：

- **微秒级的磁盘延迟**，而非毫秒级
- **本地 IOPS 理论上不设上限**，不受网络瓶颈影响
- **在相同成本下，对受磁盘限制工作负载可实现最高 10 倍的性能提升**

对于主要受磁盘 IOPS 和延迟限制的 Postgres 工作负载，这将转化为更快的摄取、更快速的 VACUUM 操作、更低的尾延迟，以及在高负载下更加可预测的性能表现。

## 原生 ClickHouse 集成 \{#clickhouse-integration\}

托管的 Postgres 能与 ClickHouse 原生集成，将事务数据与分析能力整合在一起，而无需构建复杂的 ETL 流水线。

### 将 Postgres 复制到 ClickHouse \{#postgres-replication\}

使用 [ClickPipes 中的 Postgres CDC（变更数据捕获）连接器](/integrations/clickpipes/postgres) 将 Postgres 数据复制到 ClickHouse。该连接器同时负责初始加载和持续的增量同步，并已在数百家企业客户每月迁移数百 TB 数据的场景中得到充分验证。

### pg_clickhouse：统一查询层 \{#pg-clickhouse\}

每个 Managed Postgres 实例都自带 [`pg_clickhouse`](https://github.com/ClickHouse/pg_clickhouse) 扩展，它使你能够直接从 Postgres 查询 ClickHouse。你的应用程序可以将 Postgres 作为同时面向事务和分析的统一查询层，而无需连接多个数据库。

该扩展为 ClickHouse 提供了全面的查询下推能力，以实现高效执行，包括对过滤、连接、半连接、聚合和函数的支持。目前，在 22 个 TPC-H 查询中，有 14 个可以完全下推到 ClickHouse，相比在标准 Postgres 中运行相同查询，性能提升可超过 60 倍。

## 企业级可靠性 \{#enterprise-reliability\}

托管 Postgres 提供生产环境工作负载所需的可靠性和安全特性。

### 高可用性 \{#high-availability\}

使用基于仲裁的复制，在不同可用区中配置多达两个备用副本。这些备用副本专用于保障高可用性并实现自动故障切换，确保数据库在发生故障后能够快速恢复。若要进行读扩展，可以预配单独的[只读副本](/cloud/managed-postgres/read-replicas)。有关配置详情，请参阅[高可用性](/cloud/managed-postgres/high-availability)页面。

### 备份和恢复 \{#backups\}

每个实例都提供自动备份，支持实例派生（fork）和时间点恢复（point-in-time recovery）。备份基于 [WAL-G](https://github.com/wal-g/wal-g) 运行，这是一款知名的开源工具，用于执行完整备份并将 WAL 日志持续归档到对象存储中。

### 安全与合规性 \{#security-compliance\}

Managed Postgres 的设计旨在满足与 ClickHouse Cloud 相同的安全标准：

- **身份验证**：支持 SAML/SSO
- **网络安全**：IP 白名单、静态存储和传输过程中的加密（TLS 1.3）
- **访问控制**：为数据库管理提供完整的超级用户访问权限

### 开源基础 \{#open-source\}

Postgres 和 ClickHouse 都是拥有庞大且活跃社区的开源数据库。集成组件（包括 `pg_clickhouse` 扩展和由 PeerDB 驱动的 CDC 复制）同样是开源的。这样的基础避免了厂商锁定，使您对自己的数据技术栈拥有完全掌控权，并在长期内保持高度灵活性。