---
slug: /cloud/managed-postgres/faq
sidebar_label: '常见问题'
title: 'Managed Postgres 常见问题解答'
description: '关于 ClickHouse Managed Postgres 的常见问题解答'
keywords: ['托管 Postgres 常见问题解答', 'Postgres 问题', '指标', '扩展', '迁移', 'terraform', 'pgbouncer', '预处理语句']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.faq-beta" />

## 监控和指标 \{#monitoring-and-metrics\}

### 如何访问我的 Managed Postgres 实例的指标？ \{#metrics-access\}

可以在 ClickHouse Cloud 控制台中，通过 Managed Postgres 实例的 **Monitoring** 选项卡直接监控 CPU、内存、IOPS 和存储使用情况。

此外，可以在 **Query Insights** 选项卡中查看 [Query Performance Insights](https://clickhouse.com/blog/postgres-query-insights-clickhouse-cloud)，详细分析您的查询。

## 备份与恢复 \{#backup-and-recovery\}

### 提供哪些备份选项？ \{#backup-options\}

Managed Postgres 包含每日自动备份以及持续的 WAL 归档，使你可以在 7 天保留期内的任意时间点执行时间点恢复。备份存储在 S3 中。

有关备份频率、保留期以及如何执行时间点恢复的完整说明，请参阅 [备份与恢复](/cloud/managed-postgres/backup-and-restore) 文档。

## 基础设施和自动化 \{#infrastructure-and-automation\}

### Managed Postgres 是否支持 Terraform？ \{#terraform-support\}

Managed Postgres 当前尚不支持 Terraform。我们建议使用 ClickHouse Cloud 控制台或 [OpenAPI](openapi.md) 来创建和管理实例。

## 扩展与配置 \{#extensions-and-configuration\}

### 支持哪些扩展？ \{#extensions-supported\}

Managed Postgres 提供 90 多种 PostgreSQL 扩展，包括 PostGIS、pgvector、pg&#95;cron 等常用扩展。有关所有可用扩展及其安装说明的完整列表，请参阅 [扩展](/cloud/managed-postgres/extensions) 文档。

### 我可以自定义 PostgreSQL 配置参数吗？ \{#config-customization\}

可以，您可以通过控制台中的 **Settings** 选项卡修改 PostgreSQL 和 PgBouncer 的配置参数。有关可用参数以及如何更改它们的详细信息，请参阅 [Settings](/cloud/managed-postgres/settings) 文档。

:::tip
如果您需要目前尚不支持的参数，请联系 [support](https://clickhouse.com/support/program) 提交请求。
:::

## 连接池 \{#connection-pooling\}

### 为什么我会通过 PgBouncer 看到 `prepared statement does not exist` 错误？ \{#prepared-statement-errors\}

Managed Postgres 以 **事务池化** 模式运行 PgBouncer。在这种模式下，后端 Postgres 连接只会在单个事务期间分配给客户端，随后便会返回连接池——同一客户端的下一笔事务可能会落到不同的后端上。

这会导致**服务端预处理语句**失效，因为这类语句会绑定到执行 `PREPARE` (或扩展查询 `Parse`) 的特定后端上。当对应的 `EXECUTE` 落到另一个后端时，就会出现如下错误：

```text
ERROR:  prepared statement "..." does not exist
ERROR:  unnamed prepared statement does not exist
```

通常可追溯到这一根本原因的症状包括：

* `prepared statement does not exist` 错误突增，尤其是在回填或高并发写入期间
* 看似“静默失败”的插入——语句报错后，驱动会重试，结果一个批次最终可能只部分生效，甚至被丢弃
* 返回值类型错误 (例如，将 `BIGINT` 列解码成 `float64` 位模式) ——当缓存的客户端执行计划在一个从未收到对应 `Parse` 的后端上复用过时的类型/格式代码时，就会发生这种情况

**修复方法：在驱动中禁用服务端预处理语句。** 具体开关取决于所使用的客户端库：

| Driver                           | Setting                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| **pgx** (Go)                     | `statement_cache_capacity=0` 和 `default_query_exec_mode=exec` (或 `simple_protocol`) |
| **psycopg3** (Python)            | `prepare_threshold=None`                                                            |
| **asyncpg** (Python)             | `statement_cache_size=0`                                                            |
| **JDBC** (Java)                  | `prepareThreshold=0`                                                                |
| **node-postgres / pg** (Node.js) | 不要向 `query()` 传入 `name` (命名查询会变成服务端预处理语句)                                           |

如果你的工作负载依赖预处理语句，请**直接连接到 PostgreSQL** (端口 5432) ，而不是使用 PgBouncer 连接池——直接连接能够正常支持预处理语句。有关如何在连接池端点和直连端点之间进行选择的详细信息，请参阅 [Connection](/cloud/managed-postgres/connection)。

### PgBouncer 中的“max_client_conn”设置是什么意思？它与 Postgres 中的 `max_connections` 有什么关系？ \{#pgbouncer-vs-pg-connections\}

它们控制的是不同的内容：

* **Postgres `max_connections`** 用于限制 PostgreSQL 自身的 **后端** 连接数。这是开销较大的那个数值——每个后端都会占用内存和一个进程槽位。
* **PgBouncer `max_client_conn`** 用于限制在连接池中可同时打开的 **客户端** 连接数。PgBouncer 会将大量客户端连接复用到数量少得多的后端连接上。

典型的 Managed Postgres 实例通常会配置为：PgBouncer 可接受的 **客户端连接数大约是 Postgres 后端连接数的 10 倍** (例如，5000 个客户端 / 500 个后端) 。如果你在连接池处看到连接错误，那么相比触及表面上的客户端连接上限，更有可能是达到了每个池的后端限制 (`default_pool_size`) 。

## 数据库功能 \{#database-capabilities\}

### 我可以创建多个数据库和 schema 吗？ \{#multiple-databases-schemas\}

可以。Managed Postgres 提供完整的原生 PostgreSQL 功能，包括在单个实例中支持多个数据库和 schema。可以使用标准 PostgreSQL 命令来创建和管理数据库与 schema。

### 是否支持基于角色的访问控制（RBAC）？ \{#rbac-support\}

你对托管的 Postgres 实例拥有完全的超级用户访问权限，因此可以使用标准的 PostgreSQL 命令来创建角色并管理权限。

:::note
带有控制台集成功能的增强型 RBAC 计划于今年推出。
:::

## 升级 \{#upgrades\}

### PostgreSQL 版本升级如何处理？ \{#version-upgrades\}

次要版本和主要版本升级都通过故障切换机制完成，通常只会导致几秒钟的停机时间。你可以配置维护时间窗口来控制升级的应用时间。完整说明请参阅 [Upgrades](/cloud/managed-postgres/upgrades) 文档。

## 迁移 \{#migration\}

### 可用于迁移到 Managed Postgres 的工具有哪些？ \{#migration-tools\}

Managed Postgres 支持多种迁移方法：

- **pg_dump 和 pg_restore**：适用于较小的数据库或一次性迁移。请参阅 [pg_dump 和 pg_restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore) 指南。
- **逻辑复制（Logical replication）**：适用于需要将停机时间降到最低的较大数据库。请参阅 [Logical replication](/cloud/managed-postgres/migrations/logical-replication) 指南。
- **PeerDB**：适用于从其他 Postgres 源进行基于 CDC 的复制。请参阅 [PeerDB 迁移](/cloud/managed-postgres/migrations/peerdb) 指南。

:::note
全托管的迁移体验即将推出。
:::