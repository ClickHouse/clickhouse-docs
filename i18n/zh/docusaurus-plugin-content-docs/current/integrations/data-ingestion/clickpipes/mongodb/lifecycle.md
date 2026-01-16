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

# MongoDB ClickPipe 的生命周期 \\{#lifecycle\\}

本文档介绍 MongoDB ClickPipe 生命周期的各个阶段、可能出现的不同状态及其含义。

## 预配 \\{#provisioning\\}

当你点击 Create ClickPipe 按钮时，会创建一个处于 `Provisioning` 状态的 ClickPipe。预配过程会启动用于在该服务中运行 ClickPipes 的底层基础设施，并为该管道注册一些初始元数据。由于同一服务中的 ClickPipes 会共享计算资源，你的第二个 ClickPipe 会比第一个创建得快得多——因为基础设施已经就绪。

## 设置 \\{#setup\\}

在 pipe 配置完成后，它会进入 `Setup` 状态。在该状态下，我们会创建目标 ClickHouse 表。

## 快照 \\{#snapshot\\}

设置完成后，我们会进入 `Snapshot` 状态（除非这是一个仅 CDC 的管道，在那种情况下会直接切换到 `Running`）。`Snapshot`、`Initial Snapshot` 和更常见的 `Initial Load` 是可以互换使用的术语。在该状态下，我们会对源端 MongoDB 集合进行一次快照，并将其加载到 ClickHouse 中。oplog 的保留设置应当涵盖初始加载所需的时间。当触发重新同步（resync）或在现有管道中添加新表时，该管道也会进入 `Snapshot` 状态。

## 运行中 \\{#running\\}

初始加载完成后，管道会进入 `Running` 状态（除非它是仅快照管道，在那种情况下会进入 `Completed` 状态）。此时，管道开始执行 `Change Data Capture`（CDC，变更数据捕获）。在该状态下，我们开始以流式方式将源 MongoDB 集群中的变更传输到 ClickHouse。有关控制 CDC 的信息，请参阅[控制 CDC 的文档](./sync_control)。

## 已暂停 \\{#paused\\}

一旦 pipe 进入 `Running` 状态，就可以将其暂停。暂停后会停止 CDC 进程，pipe 将进入 `Paused` 状态。在该状态下，不会再从源 MongoDB 拉取新数据，但 ClickHouse 中已有的数据会保持不变。可以在该状态下恢复 pipe 的运行。

## 暂停 \\{#pausing\\}

:::note
此状态即将上线。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在就为该状态添加支持，以确保在该状态发布后，您的集成仍能正常运行。
:::
当您点击 “Pause” 按钮时，管道会进入 `Pausing` 状态。这是一个过渡状态，此时我们正在停止 CDC 进程。一旦 CDC 进程完全停止，管道将进入 `Paused` 状态。

## 修改中 \\{#modifying\\}

:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在就为其添加支持，以确保在该状态发布后，您的集成仍能正常工作。
:::
当前，该状态表示管道正在移除表。

## 重新同步 \\{#resync\\}

:::note
此状态即将上线。如果你正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在就为其添加支持，以确保在该功能发布后你的集成可以继续正常工作。
:::
此状态表示该 pipe 正处于重新同步阶段，在该阶段中会将 _resync 表与原始表进行原子级切换。关于重新同步的更多信息，请参阅[重新同步文档](./resync)。

## 已完成 \\{#completed\\}

此状态适用于仅快照类型的 pipe，表示快照已完成且没有更多需要执行的工作。

## 失败 \\{#failed\\}

如果管道中发生不可恢复的错误，它会进入 `Failed` 状态。你可以联系支持团队，或者[重新同步](./resync)管道来从该状态恢复。