---
sidebar_label: 'Postgres ClickPipe 的生命周期'
description: '各类 ClickPipe 状态及其含义'
slug: /integrations/clickpipes/postgres/lifecycle
title: 'Postgres ClickPipe 的生命周期'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# Postgres ClickPipe 的生命周期 \{#lifecycle\}

本文档介绍 Postgres ClickPipe 的不同阶段、它可能出现的各种状态，以及这些状态各自代表的含义。

## 预配置 \{#provisioning\}

当你单击 Create ClickPipe 按钮时，ClickPipe 会以 `Provisioning` 状态创建。预配置过程会启动用于在该服务中运行 ClickPipes 的底层基础设施，并为该 ClickPipe 注册一些初始元数据。由于同一服务中的 ClickPipes 计算资源是共享的，你的第二个 ClickPipe 会比第一个创建得快得多——因为基础设施已经就绪。

## 设置 \{#setup\}

在 pipe 资源创建完成后，它会进入 `Setup` 状态。在该状态下，我们会创建目标 ClickHouse 表，并获取和记录源表的表定义。

## 快照 \{#snapshot\}

完成设置后，管道会进入 `Snapshot` 状态（除非这是一个仅启用 CDC 的 pipe，此时会直接切换到 `Running`）。`Snapshot`、`Initial Snapshot` 以及更常见的 `Initial Load` 是可以互换使用的术语。在该状态下，我们会对源数据库中的表进行快照，并将其加载到 ClickHouse 中。此过程不会使用逻辑复制，但会在这一步创建 replication slot，因此你的 `max_slot_wal_keep_size` 和存储相关参数应当预留出初始加载期间 slot 增长的空间。有关初始加载的更多信息，请参阅[并行初始加载文档](./parallel_initial_load)。当触发重新同步（resync），或向现有 pipe 中添加新表时，该 pipe 也会进入 `Snapshot` 状态。

## 运行中 \{#running\}

初始加载完成后，pipe 会进入 `Running` 状态（除非它是 snapshot-only pipe，此时会转入 `Completed` 状态）。在这个阶段，pipe 会开始执行 `CDC（变更数据捕获）`。在该状态下，我们会从源数据库启动逻辑复制到 ClickHouse。有关控制 CDC 的信息，请参阅[控制 CDC 的文档](./sync_control)。

## 已暂停 \{#paused\}

一旦 pipe 进入 `Running` 状态，你就可以将其暂停。这会停止 CDC（变更数据捕获）进程，pipe 将进入 `Paused` 状态。在该状态下，不会再从源数据库拉取新的数据，但 ClickHouse 中已有的数据会保持不变。你可以在该状态下恢复 pipe 的运行。

## 暂停 \{#pausing\}

:::note
此状态即将可用。如果你正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在就为其添加支持，以确保在该功能发布后你的集成仍能正常工作。
:::
当你点击 Pause 按钮后，pipe 会进入 `Pausing` 状态。该状态是一个过渡状态，表示我们正在停止 CDC 进程。一旦 CDC 进程完全停止，pipe 将进入 `Paused` 状态。

## 修改中 \{#modifying\}

:::note
该状态即将推出。如果你正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，建议现在就为其添加支持，以确保在该功能发布时你的集成仍能正常工作。
:::
当前，这表示管道正在执行删除表的操作。

## 重新同步 \{#resync\}

:::note
此状态即将推出。如果你在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，建议现在就添加对该状态的支持，以确保在发布后你的集成能够继续正常工作。
:::
此状态表示管道正处于重新同步阶段，在该阶段中，它会在 `_resync` 表与原始表之间执行原子级切换。有关重新同步的更多信息，请参阅 [重新同步文档](./resync)。

## 已完成 \{#completed\}

此状态适用于仅快照管道，表示快照已完成且后续无工作需要执行。

## 失败 \{#failed\}

如果管道中出现不可恢复的错误，它会进入 `Failed` 状态。您可以联系支持团队，或[重新同步](./resync)该管道以从该状态恢复。