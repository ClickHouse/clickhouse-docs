---
slug: /cloud/managed-postgres
title: '托管 Postgres'
description: '由 NVMe 存储提供支持的快速、可扩展、企业级 Postgres，并与 ClickHouse 原生集成以实现实时分析'
keywords: ['托管 Postgres', 'postgresql', '云数据库', 'Postgres 服务', 'NVMe Postgres', 'ClickHouse 集成']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge />

ClickHouse Managed Postgres 是一款面向企业的托管 Postgres 服务，专为高性能和大规模场景而构建。依托与计算节点物理同机部署的 NVMe 存储，相较于使用类似 EBS 这类网络附加存储的方案，对于受磁盘限制的工作负载可提供高达 10 倍的性能提升。

该产品与 [Ubicloud](https://www.ubicloud.com/) 联合构建，Ubicloud 的创始团队曾在 Citus Data、Heroku 和 Microsoft 交付世界级 Postgres，拥有丰富的相关经验。Managed Postgres 旨在解决高速增长应用常见的性能挑战：摄取与更新变慢、VACUUM 变慢、尾延迟升高，以及由于磁盘 IOPS 受限而导致的 WAL 峰值等问题。

{/* TODO: 展示 Postgres 与 ClickHouse 集成的架构图
    路径：/static/images/cloud/managed-postgres/architecture-overview.png */}


## 基于 NVMe 的性能 \{#nvme-performance\}

大多数托管 Postgres 服务使用网络附加存储（如 Amazon EBS），每次磁盘访问都需要一次网络往返。这会引入以毫秒计的延迟并限制 IOPS，从而在写入密集型或 I/O 密集型工作负载中造成瓶颈。

托管 Postgres 使用物理上与数据库位于同一台服务器的 NVMe 存储。这一架构差异带来：

- **微秒级磁盘延迟**，而非毫秒级
- **本地 IOPS 基本不受限制**，不存在网络瓶颈
- **在相同成本下最高可达 10 倍的性能提升**，显著加速受磁盘限制的工作负载

对于主要受磁盘 IOPS 和延迟限制的 Postgres 工作负载，这意味着更快的数据摄取、更快速完成 vacuum、更低的尾部延迟，以及在高负载下更可预测的性能表现。

## 原生 ClickHouse 集成 \{#clickhouse-integration\}

托管版 Postgres 可与 ClickHouse 原生集成，将事务处理与分析能力无缝结合，而无需构建复杂的 ETL 管道。

### Postgres 到 ClickHouse 的复制 \{#postgres-replication\}

使用 [ClickPipes 中的 Postgres CDC 连接器](/integrations/clickpipes/postgres) 将 Postgres 数据复制到 ClickHouse。该连接器同时负责初始加载和持续增量同步，已在数百家企业客户的生产环境中充分验证，每月可稳定迁移数百 TB 级数据。

### pg_clickhouse：统一查询层 \{#pg-clickhouse\}

每个 Managed Postgres 实例都预装了 [`pg_clickhouse`](https://github.com/ClickHouse/pg_clickhouse) 扩展，它允许你直接从 Postgres 查询 ClickHouse。应用可以将 Postgres 作为同时处理事务和分析的统一查询层，而无需连接多个数据库。

该扩展为 ClickHouse 提供了全面的查询下推能力，以实现高效执行，包括对过滤、连接、半连接、聚合和函数的支持。目前，在 22 条 TPC-H 查询中有 14 条能够完全下推到 ClickHouse，相比在标准 Postgres 中运行相同查询，性能提升超过 60 倍。

## 企业级可靠性 \{#enterprise-reliability\}

托管 Postgres 提供生产环境工作负载所需的可靠性和安全功能。

### 高可用性 \{#high-availability\}

使用基于仲裁的复制，在不同可用区中配置多达两个备用副本。这些备用副本专用于高可用性和自动故障切换，确保数据库在发生故障时能够快速恢复。若需扩展读性能，可另外配置单独的[只读副本](/cloud/managed-postgres/read-replicas)。配置详情请参阅[高可用性](/cloud/managed-postgres/high-availability)页面。

### 备份与恢复 \{#backups\}

每个实例都自带自动备份功能，支持创建分支副本（fork）和时间点恢复（PITR）。备份基于 [WAL-G](https://github.com/wal-g/wal-g) 运行，这是一个广泛使用的开源工具，用于执行完整备份并将持续生成的 WAL 归档到对象存储中。

### 安全性与合规性 \{#security-compliance\}

Managed Postgres 旨在满足与 ClickHouse Cloud 相同的安全标准：

- **身份验证**：支持 SAML/SSO
- **网络安全**：IP 允许列表、静态数据和传输中数据加密（TLS 1.3）
- **访问控制**：为数据库管理提供完整的超级用户（superuser）访问权限

### 开源基础 \{#open-source\}

Postgres 和 ClickHouse 都是拥有庞大且活跃社区的开源数据库。集成组件（包括 `pg_clickhouse` 扩展以及由 PeerDB 驱动的 CDC 复制）同样是开源的。这样的基础避免了厂商锁定风险，使你可以对数据技术栈保持完全掌控，并在长期内保持高度灵活性。