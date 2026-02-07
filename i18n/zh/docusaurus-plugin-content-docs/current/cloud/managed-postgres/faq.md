---
slug: /cloud/managed-postgres/faq
sidebar_label: '常见问题'
title: 'Managed Postgres 常见问题解答'
description: '关于 ClickHouse Managed Postgres 的常见问题解答'
keywords: ['托管 Postgres 常见问题解答', 'Postgres 问题', '指标', '扩展', '迁移', 'terraform']
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="faq" />


## 监控和指标 \{#monitoring-and-metrics\}

### 如何访问我的 Managed Postgres 实例的指标？ \{#metrics-access\}

可以在 ClickHouse Cloud 控制台中，通过 Managed Postgres 实例的 **Monitoring** 选项卡直接监控 CPU、内存、IOPS 和存储使用情况。

:::note
用于详细查询分析的 Query Performance Insights 功能即将上线。
:::

## 备份与恢复 \{#backup-and-recovery\}

### 提供哪些备份选项？ \{#backup-options\}

Managed Postgres 包含每日自动备份以及持续的 WAL 归档，使你可以在 7 天保留期内的任意时间点执行时间点恢复。备份存储在 S3 中。

有关备份频率、保留期以及如何执行时间点恢复的完整说明，请参阅 [备份与恢复](/cloud/managed-postgres/backup-and-restore) 文档。

## 基础设施和自动化 \{#infrastructure-and-automation\}

### Managed Postgres 是否支持 Terraform？ \{#terraform-support\}

Managed Postgres 当前尚不支持 Terraform。我们建议使用 ClickHouse Cloud 控制台来创建和管理实例。

## 扩展与配置 \{#extensions-and-configuration\}

### 支持哪些扩展？ \{#extensions-supported\}

托管 Postgres 提供 100 多种 PostgreSQL 扩展，包括 PostGIS、pgvector、pg_cron 等常用扩展。有关所有可用扩展及其安装说明的完整列表，请参阅 [扩展](/cloud/managed-postgres/extensions) 文档。

### 我可以自定义 PostgreSQL 配置参数吗？ \{#config-customization\}

可以，您可以通过控制台中的 **Settings** 选项卡修改 PostgreSQL 和 PgBouncer 的配置参数。有关可用参数以及如何更改它们的详细信息，请参阅 [Settings](/cloud/managed-postgres/settings) 文档。

:::tip
如果您需要目前尚不支持的参数，请联系 [support](https://clickhouse.com/support/program) 提交请求。
:::

## 数据库功能 \{#database-capabilities\}

### 我可以创建多个数据库和 schema 吗？ \{#multiple-databases-schemas\}

可以。Managed Postgres 提供完整的原生 PostgreSQL 功能，包括在单个实例中支持多个数据库和 schema。可以使用标准 PostgreSQL 命令来创建和管理数据库与 schema。

### 是否支持基于角色的访问控制（RBAC）？ \{#rbac-support\}

你对托管的 Postgres 实例拥有完全的超级用户访问权限，因此可以使用标准的 PostgreSQL 命令来创建角色并管理权限。

:::note
带有控制台集成功能的增强型 RBAC 计划于今年推出。
:::

## 迁移 \{#migration\}

### 可用于迁移到 Managed Postgres 的工具有哪些？ \{#migration-tools\}

Managed Postgres 支持多种迁移方法：

- **pg_dump 和 pg_restore**：适用于较小的数据库或一次性迁移。请参阅 [pg_dump 和 pg_restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore) 指南。
- **逻辑复制（Logical replication）**：适用于需要将停机时间降到最低的较大数据库。请参阅 [Logical replication](/cloud/managed-postgres/migrations/logical-replication) 指南。
- **PeerDB**：适用于从其他 Postgres 源进行基于 CDC 的复制。请参阅 [PeerDB 迁移](/cloud/managed-postgres/migrations/peerdb) 指南。

:::note
全托管的迁移体验即将推出。
:::