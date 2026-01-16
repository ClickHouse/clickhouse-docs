---
sidebar_label: 'MySQL ClickPipe 的生命周期'
description: '各种 ClickPipe 状态及其含义'
slug: /integrations/clickpipes/mysql/lifecycle
title: 'MySQL ClickPipe 的生命周期'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# MySQL ClickPipe 的生命周期 \\{#lifecycle\\}

本文档介绍 MySQL ClickPipe 的各个阶段、可能出现的不同状态以及这些状态的含义。请注意，这同样适用于 MariaDB。

## 预配 \\{#provisioning\\}

当你点击 Create ClickPipe 按钮时，会创建一个处于 `Provisioning` 状态的 ClickPipe。预配过程中，我们会为该服务启动运行 ClickPipes 所需的底层基础设施，并为该管道注册一些初始元数据。由于同一服务中的 ClickPipes 共享计算资源，你创建第二个 ClickPipe 的速度会比第一个快得多——因为基础设施已经就绪。

## 设置 \\{#setup\\}

当管道预配完成后，它会进入 `Setup` 状态。在该状态下，我们会创建目标 ClickHouse 表，同时获取并记录您的源表的表定义。

## Snapshot \\{#snapshot\\}

完成配置后，pipe 会进入 `Snapshot` 状态（除非这是一个仅 CDC 的 pipe，此时会直接进入 `Running` 状态）。`Snapshot`、`Initial Snapshot` 和更常见的 `Initial Load` 是可以互换使用的术语。在该状态下，我们会对源 MySQL 表创建快照，并将其加载到 ClickHouse 中。二进制日志的保留设置应当考虑到初始加载所需的时间。有关初始加载的更多信息，请参阅[并行初始加载文档](./parallel_initial_load)。当触发重新同步（resync）或向现有 pipe 中添加新表时，该 pipe 也会进入 `Snapshot` 状态。

## 运行中 \\{#running\\}

初始加载完成后，管道会进入 `Running` 状态（除非它是仅快照管道，在这种情况下会切换到 `Completed` 状态）。此时，管道开始执行 `Change-Data Capture`。在该状态下，我们开始从源数据库读取二进制日志，并将数据批量同步到 ClickHouse。有关控制 CDC 的信息，请参见[CDC 控制文档](./sync_control)。

## 已暂停 \\{#paused\\}

一旦 pipe 进入 `Running` 状态，就可以将其暂停。这会停止 CDC 进程，pipe 会进入 `Paused` 状态。在该状态下，不会再从源数据库拉取新的数据，但 ClickHouse 中已有的数据会保持不变。你可以在该状态下恢复运行该 pipe。

## 暂停 \\{#pausing\\}

:::note
此状态即将推出。如果你正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在就为其添加支持，以确保在该功能发布后，你的集成仍能正常工作。
:::
当你点击 Pause 按钮时，管道会进入 `Pausing` 状态。`Pausing` 是一个过渡状态，表示我们正在停止 CDC（变更数据捕获）进程。一旦 CDC 进程完全停止，管道将进入 `Paused` 状态。

## 修改中 \\{#modifying\\}

:::note
此状态即将上线。如果你正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，建议现在就为其添加支持，以确保在该状态发布后，你的集成依然可以正常工作。
:::
目前，该状态表示管道正在删除表。

## 重新同步 \\{#resync\\}
:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，建议现在就为其添加支持，以确保在该状态发布后，您的集成仍能正常工作。
:::
此状态表示 pipe 处于重新同步阶段，在该阶段它会在 `_resync` 表与原始表之间执行一次原子交换操作。关于重新同步的更多信息，请参阅[重新同步文档](./resync)。

## 已完成 \\{#completed\\}

此状态适用于仅快照的 pipe，表示快照已完成，且不再有待处理的工作。

## 失败 \\{#failed\\}

如果管道中出现不可恢复的错误，它会进入 `Failed` 状态。你可以联系支持团队，或[重新同步](./resync)管道以从该状态恢复。