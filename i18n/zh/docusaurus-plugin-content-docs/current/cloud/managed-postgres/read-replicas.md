---
slug: /cloud/managed-postgres/read-replicas
sidebar_label: '只读副本'
title: '只读副本'
description: '在 ClickHouse Managed Postgres 中使用只读副本扩展读密集型工作负载'
keywords: ['只读副本', '可扩展性', '读取扩展', 'Postgres 副本', '水平扩展']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge />

读取副本允许你为主托管 Managed Postgres 数据库创建一个或多个副本。这些副本通过 PostgreSQL 原生复制机制持续跟随主数据库，以保持与最新变更同步。你可以在实例的 **Read Replica** 视图中创建读取副本。


## 为什么要使用只读副本 \{#why-use-read-replicas\}

### 可扩展性 \{#scalability\}

只读副本通过将读密集型负载分布到多个专用实例上，使你能够横向扩展数据库。对于报表查询、分析处理以及实时仪表盘而言，这一点尤为重要，否则它们会与生产流量争夺资源。

### 隔离 \{#isolation\}

通过将分析和商业智能查询定向到只读副本，您可以让主实例专注且高效地处理写入操作和关键事务型工作负载。这种隔离可提升整体系统性能和可预测性。同时，您也无需为分析或报表工具授予写权限——它们可以安全地在副本上运行，而不存在意外修改数据的风险。

### 业务连续性 \{#business-continuity\}

只读副本在灾难恢复中可以发挥关键作用。如果主数据库发生故障，可以将某个只读副本提升为主库，从而将停机时间和数据丢失降到最低。这在高可用备用实例之外，提供了额外一层弹性保障。

## 只读副本的工作原理 \{#how-read-replicas-work\}

Managed Postgres 中的只读副本采用 WAL 传输架构（WAL shipping），而不是流式复制（streaming replication）。这一设计旨在尽量减少对主库的影响。

### 从对象存储进行 WAL 传输 \{#wal-shipping-from-object-storage\}

当主数据库处理事务时，它会生成预写日志（Write-Ahead Log，WAL）记录。这些 WAL 段文件会持续归档到对象存储（S3）。只读副本从对象存储中获取并重放这些 WAL 段文件，以与主库保持同步。

这种架构不同于[高可用备用节点](/cloud/managed-postgres/high-availability)，后者通过与主库的直接连接进行流式复制。

### 我们为何选择这种方案 \{#why-we-chose-this-approach\}

我们有意将只读副本设计为从对象存储中读取 WAL，而不是作为流式备用节点直接连接到主库。此方案在只读副本与主数据库之间提供了完全隔离：

- **主库零复制开销**：只读副本不与主库保持流式连接，因此不会给关键业务负载增加任何 CPU、内存或网络负载。
- **独立扩缩容**：你可以按需增加或删除只读副本，而不会对主库性能产生任何影响。
- **网络隔离**：只读副本在其独立的网络环境中运行，并使用独立的连接端点。

### 复制延迟特性 \{#replication-lag-characteristics\}

这种架构的权衡在于复制延迟。WAL 段会以固定间隔从主节点归档（通常每 60 秒一次，或当某个段被写满时，以先发生者为准）。这意味着在正常情况下，只读副本相对于主节点可能会滞后几十秒。

对于大多数读扩展场景——报表、分析、仪表盘——这种延迟是可以接受的。如果你的应用需要近实时读取，请考虑能否将查询直接指向主节点，或者在这一时间窗口内的最终一致性是否足以满足你的需求。