---
slug: /cloud/managed-postgres/monitoring/metrics
sidebar_label: '指标参考'
title: 'Managed Postgres 指标参考'
description: 'Managed Postgres Prometheus 端点暴露的完整指标列表'
keywords: ['Managed Postgres', '指标', 'Prometheus', '参考', '可观测性']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

# 指标参考 \{#metrics-reference\}

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.monitoring-metrics-beta" />

本页面列出了
[Managed Postgres Prometheus 端点](/cloud/managed-postgres/monitoring/prometheus)
暴露的所有指标。
有关设置和身份验证，请参阅 [Prometheus 端点] 页面。

## 常用标签 \{#common-labels\}

每个指标都带有以下标签：

| 标签                      | 说明             |
| ----------------------- | -------------- |
| `clickhouse_org`        | 组织 ID          |
| `postgres_service`      | Postgres 服务 ID |
| `postgres_service_name` | Postgres 服务名称  |

某些指标还会添加一个表示其细分维度的标签 (例如，
CPU 指标中的 `mode`、连接指标中的 `state`，以及数据库大小中的
`database`) 。这些标签会与对应的各项指标一并列出。

## 信息指标 \{#information-metric\}

`PostgresServiceInfo` 是一个值始终等于 `1` 的 gauge 指标，其标签中包含
服务的当前状态和版本。可使用它将状态与其他指标进行连接，或在服务
离开 `running` 状态时触发告警。

| Metric                | Type  | 额外标签                          | Description            |
| --------------------- | ----- | ------------------------------------- | ---------------------- |
| `PostgresServiceInfo` | gauge | `postgres_status`, `postgres_version` | 每个服务对应一条时间序列；值始终为 `1`。 |

`postgres_status` 表示服务当前的生命周期状态
(例如 `running`、`creating`、`stopped`) 。`postgres_version`
表示 Postgres 的主版本号 (例如 `17`、`18`) 。

## 容量 \{#capacity\}

为服务预配的静态限制。只有在
调整服务规格时，这些限制才会变化。

| 指标                                 | 类型    | 单位    | 描述              |
| ---------------------------------- | ----- | ----- | --------------- |
| `PostgresServer_CPUCores`          | gauge | cores | 分配给服务的 CPU 核心数。 |
| `PostgresServer_MemoryLimitBytes`  | gauge | bytes | 分配给服务的内存。       |
| `PostgresServer_StorageLimitBytes` | gauge | bytes | 分配给服务的存储容量。     |

## 资源利用率 \{#resource-utilization\}

| 指标                                     | 类型  | 额外标签   | 描述                                                                                |
| -------------------------------------- | --- | ------ | --------------------------------------------------------------------------------- |
| `PostgresServer_CPUSeconds_Total`      | 计数器 | `mode` | 已消耗的 CPU 时间，按模式划分：`user`、`system`、`iowait`、`softirq`、`steal`、`irq`、`nice`、`idle`。 |
| `PostgresServer_MemoryUsedPercent`     | gauge  |        | 已用内存，占 `PostgresServer_MemoryLimitBytes` 的百分比。                                    |
| `PostgresServer_MemoryCachePercent`    | gauge  |        | 缓存和缓冲区占用的内存，占总内存的百分比。                                                             |
| `PostgresServer_FilesystemUsedPercent` | gauge  |        | 已用文件系统空间，占总存储空间的百分比。                                                              |

如需按百分比计算 CPU 使用率，请计算
`PostgresServer_CPUSeconds_Total` 在所关注模式上的速率，并
除以 `PostgresServer_CPUCores`。

## 磁盘与网络 I/O \{#io\}

| 指标                                          | 类型      | 单位    | 描述           |
| ------------------------------------------- | ------- | ----- | ------------ |
| `PostgresServer_DiskReads_Total`            | counter | ops   | 已完成的磁盘读操作次数。 |
| `PostgresServer_DiskWrites_Total`           | counter | ops   | 已完成的磁盘写操作次数。 |
| `PostgresServer_NetworkReceiveBytes_Total`  | counter | bytes | 通过网络接收的字节数。  |
| `PostgresServer_NetworkTransmitBytes_Total` | counter | bytes | 通过网络发送的字节数。  |

## 数据库活动 \{#database-activity\}

自服务启动以来的累计counter。使用 `rate()` 或 `irate()` 将其转换为每秒速率值。

| 指标                                            | 类型  | 描述       |
| --------------------------------------------- | --- | -------- |
| `PostgresServer_TuplesFetched_Total`          | counter | 查询获取的行数。 |
| `PostgresServer_TuplesInserted_Total`         | counter | 已插入的行数。  |
| `PostgresServer_TuplesUpdated_Total`          | counter | 已更新的行数。  |
| `PostgresServer_TuplesDeleted_Total`          | counter | 已删除的行数。  |
| `PostgresServer_TransactionsCommitted_Total`  | counter | 已提交的事务数。 |
| `PostgresServer_TransactionsRolledBack_Total` | counter | 已回滚的事务数。 |
| `PostgresServer_Deadlocks_Total`              | counter | 检测到的死锁数。 |

## 连接、缓存和数据库大小 \{#connections-cache-size\}

| 指标                                 | 类型    | 额外标签       | 描述                                                    |
| ---------------------------------- | ----- | ---------- | ----------------------------------------------------- |
| `PostgresServer_ActiveConnections` | gauge | `state`    | 按状态划分的连接数 (例如 `active`、`idle`) 。                      |
| `PostgresServer_CacheHitRatio`     | gauge |            | 缓冲区缓存命中率：从缓存提供的块占访问块总数的百分比。                           |
| `PostgresServer_DatabaseSizeBytes` | gauge | `database` | 各数据库的磁盘大小 (以字节为单位) 。包括默认的 `postgres` 数据库以及任何用户创建的数据库。 |

## 相关页面 \{#related\}

* [Prometheus endpoint] — 配置、身份验证和抓取
* [Dashboard](/cloud/managed-postgres/monitoring/dashboard) — Cloud Console 内置图表
* [OpenAPI 指南](/cloud/managed-postgres/openapi) — 创建 API 密钥
  以及查找组织 ID 和服务 ID

[Prometheus endpoint]: /cloud/managed-postgres/monitoring/prometheus