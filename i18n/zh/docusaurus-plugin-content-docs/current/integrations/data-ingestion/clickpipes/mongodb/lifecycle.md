---
sidebar_label: 'MongoDB ClickPipe 的生命周期'
description: '各种 ClickPipe 状态及其含义'
slug: /integrations/clickpipes/mongodb/lifecycle
title: 'MongoDB ClickPipe 的生命周期'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# MongoDB ClickPipe 的生命周期 \{#lifecycle\}

本文档介绍 MongoDB ClickPipe 在其生命周期中的各个阶段、可能处于的不同状态以及这些状态所代表的含义。

## 预配置 \{#provisioning\}

当你点击“Create ClickPipe”按钮时，会创建一个处于 `Provisioning` 状态的 ClickPipe。预配置过程用于为该服务启动和准备运行 ClickPipes 所需的底层基础设施，并为该 ClickPipe 注册一些初始元数据。由于同一服务中的 ClickPipes 共享计算资源，你创建第二个 ClickPipe 时会比第一个快得多——因为基础设施已经就绪。

## 设置 \{#setup\}

在 pipe 资源创建完成后，它会进入 `Setup` 状态。在该状态下，我们会创建目标 ClickHouse 表。

## Snapshot \{#snapshot\}

一旦完成设置，我们就进入 `Snapshot` 状态（除非这是一个仅 CDC 的 pipe，此时会直接切换到 `Running`）。`Snapshot`、`Initial Snapshot` 和更常见的 `Initial Load` 是可以互换使用的术语。在该状态下，我们会对源 MongoDB 集合进行快照，并将其加载到 ClickHouse 中。oplog 的保留策略应当覆盖初始加载所需的时间。当触发重新同步（resync）或向现有 pipe 中添加新表时，pipe 也会进入 `Snapshot` 状态。

## 运行状态 \{#running\}

一旦初始加载完成，管道就会进入 `Running` 状态（除非它是仅用于快照的管道，在这种情况下会切换到 `Completed`）。此时管道开始执行 CDC（Change Data Capture，变更数据捕获）。在该状态下，我们开始将源 MongoDB 集群中的变更以流式方式传输到 ClickHouse。有关控制 CDC 的信息，请参阅[控制 CDC 的文档](./sync_control)。

## 已暂停 \{#paused\}

一旦 pipe 进入 `Running` 状态，即可将其暂停。这将停止 CDC（变更数据捕获）进程，并使 pipe 进入 `Paused` 状态。在该状态下，不会从源 MongoDB 拉取新数据，但 ClickHouse 中已有的数据将保持不变。可以从该状态恢复 pipe 的运行。

## 暂停 \{#pausing\}

:::note
该状态即将上线。如果你在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，建议现在就为该状态添加支持，以确保在其发布后你的集成能够继续正常工作。
:::
当你点击 Pause 按钮时，pipe 会进入 `Pausing` 状态。此状态是一个过渡状态，表示我们正在停止 CDC 进程。一旦 CDC 进程完全停止，pipe 将进入 `Paused` 状态。

## 修改中 \{#modifying\}

:::note
此状态即将上线。如果你正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，建议现在就为它添加支持，以确保在该状态发布后，你的集成能够继续正常工作。
:::
目前，该状态表示管道正在删除表。

## 重新同步 \{#resync\}

:::note
此状态即将可用。如果你在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，建议现在就为其添加支持，以确保在该功能发布后，你的集成可以继续正常工作。
:::
此状态表示 pipe 正处于重新同步阶段，在该阶段中，它正在将 _resync 表与原始表进行原子交换。关于重新同步的更多信息，请参阅[重新同步文档](./resync)。

## 已完成 \{#completed\}

此状态适用于仅快照管道，表示快照已完成且无需再执行任何操作。

## 失败 \{#failed\}

如果管道中出现不可恢复的错误，它会进入 `Failed` 状态。你可以联系支持团队，或通过[重新同步](./resync)管道来从该状态恢复。