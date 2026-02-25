---
sidebar_label: 'MySQL ClickPipe 的生命周期'
description: '各类 ClickPipe 状态及其含义'
slug: /integrations/clickpipes/mysql/lifecycle
title: 'MySQL ClickPipe 的生命周期'
doc_type: 'guide'
keywords: ['clickpipes', 'MySQL', 'CDC', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# MySQL ClickPipe 的生命周期 \{#lifecycle\}

本文档介绍 MySQL ClickPipe 在生命周期中的各个阶段、可能出现的不同状态及其含义。请注意，这同样适用于 MariaDB。

## 预配 \{#provisioning\}

当你点击 Create ClickPipe 按钮时，会创建一个处于 `Provisioning` 状态的 ClickPipe。预配过程会启动并配置用于在该服务中运行 ClickPipes 的底层基础设施，并为该管道注册一些初始元数据。由于同一服务中的 ClickPipes 共享计算资源，你的第二个 ClickPipe 会比第一个创建得快得多——因为相关基础设施已经就绪。

## 设置 \{#setup\}

在管道预配完成后，它会进入 `Setup` 状态。在此状态下，我们会创建目标 ClickHouse 表。同时，我们也会在这里获取并记录源表的表结构定义。

## 快照 \{#snapshot\}

完成设置后，系统会进入 `Snapshot` 状态（除非这是一个仅 CDC 的 pipe，此时会直接进入 `Running` 状态）。`Snapshot`、`Initial Snapshot` 和更常见的 `Initial Load` 这几个术语可以互换使用。在该状态下，我们会对源 MySQL 表进行快照，并将其加载到 ClickHouse 中。二进制日志的保留设置应充分考虑完成初始加载所需的时间。有关初始加载的更多信息，请参阅[并行初始加载文档](./parallel_initial_load)。当触发重新同步（resync）或者在已有 pipe 中新增表时，该 pipe 也会进入 `Snapshot` 状态。

## 运行中 \{#running\}

初始加载完成后，管道会进入 `Running` 状态（除非它是仅快照的管道，在这种情况下会转变为 `Completed`）。此时，管道开始执行 `Change-Data Capture`。在该状态下，我们开始从源数据库读取二进制日志，并分批将数据同步到 ClickHouse。有关控制 CDC（变更数据捕获）的信息，请参阅[控制 CDC 的文档](./sync_control)。

## 已暂停 \{#paused\}

一旦管道进入 `Running` 状态，即可将其暂停。此操作会停止 CDC（变更数据捕获）流程，管道将进入 `Paused` 状态。在该状态下，不会再从源数据库拉取新的数据，但 ClickHouse 中已有的数据将保持不变。可以在此状态下恢复管道。

## 暂停 \{#pausing\}

:::note
此状态即将推出。如果你在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，建议现在就为其添加支持，以确保在该状态发布后，你的集成仍能正常工作。
:::
当你点击 Pause 按钮时，管道会进入 `Pausing` 状态。这是一个过渡状态，此时我们正在停止 CDC（变更数据捕获）进程。一旦 CDC（变更数据捕获）进程完全停止，管道将进入 `Paused` 状态。

## 修改中 \{#modifying\}

:::note
此状态即将可用。如果你正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，建议现在就为其添加支持，以确保在该功能发布后，你的集成可以继续正常工作。
:::
当前，该状态表示管道正在执行删除表的操作。

## 重新同步 \{#resync\}

:::note
此状态即将提供。如果你在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，建议现在就为其添加支持，以确保在该功能发布后你的集成能持续正常工作。
:::
此状态表示管道正处于重新同步阶段，在该阶段它会将 _resync 表与原始表进行原子交换。有关重新同步的更多信息，请参阅[重新同步文档](./resync)。

## 已完成 \{#completed\}

此状态适用于仅限快照的管道，表示快照已完成且没有更多需要执行的工作。

## 失败 \{#failed\}

如果 pipe 中出现不可恢复的错误，它会进入 `Failed` 状态。您可以联系技术支持，或者[重新同步](./resync)该 pipe 以从这种状态中恢复。