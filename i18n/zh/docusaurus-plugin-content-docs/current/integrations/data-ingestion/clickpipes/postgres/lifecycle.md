---
sidebar_label: 'Postgres ClickPipe 的生命周期'
description: '各种 ClickPipe 状态及其含义'
slug: /integrations/clickpipes/postgres/lifecycle
title: 'Postgres ClickPipe 的生命周期'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
---



# Postgres ClickPipe 的生命周期 {#lifecycle}

本文档介绍 Postgres ClickPipe 的各个阶段、可能出现的不同状态，以及这些状态所代表的含义。



## 预配置 {#provisioning}

当你点击 Create ClickPipe 按钮时，会创建一个处于 `Provisioning` 状态的 ClickPipe。预配置过程会为该服务启动运行 ClickPipes 所需的底层基础设施，并为该 ClickPipe 注册一些初始元数据。由于同一服务内的 ClickPipes 共享计算资源，你的第二个 ClickPipe 的创建速度会比第一个快得多——因为所需的基础设施已经就绪。



## 设置 {#setup}

在管道配置完成后，它会进入 `Setup` 状态。在该状态下，我们会创建目标 ClickHouse 表，并获取并记录源表的表定义。



## Snapshot {#snapshot}

完成配置后，我们会进入 `Snapshot` 状态（除非这是一个仅 CDC 的 pipe，此时会直接进入 `Running` 状态）。`Snapshot`、`Initial Snapshot` 和更常见的 `Initial Load` 这几个术语可以互换使用。在该状态下，我们会对源数据库中的表进行快照，并将其加载到 ClickHouse 中。此过程不使用逻辑复制，但会在此步骤创建 replication slot，因此你的 `max_slot_wal_keep_size` 和存储参数应考虑到初始加载期间该 slot 可能产生的增长。关于初始加载的更多信息，请参阅[并行初始加载文档](./parallel_initial_load)。当触发 resync 或向现有 pipe 中添加新表时，pipe 也会进入 `Snapshot` 状态。



## 运行 {#running}

初始加载完成后，pipe 会进入 `Running` 状态（除非它是仅快照的 pipe，此时会进入 `Completed` 状态）。在这个阶段，pipe 开始执行 CDC（变更数据捕获）。在该状态下，我们会从源数据库启动到 ClickHouse 的逻辑复制。有关控制 CDC 的信息，请参阅[CDC 控制文档](./sync_control)。



## 已暂停 {#paused}

pipe 进入 `Running` 状态后，即可将其暂停。这会停止 CDC 过程，并使 pipe 进入 `Paused` 状态。在该状态下，不会再从源数据库拉取新数据，但 ClickHouse 中已有数据保持不变。你可以在此状态下恢复该 pipe。



## 暂停 {#pausing}

:::note
该状态即将推出。如果当前正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，建议现在就为其添加支持，以确保在该功能发布后，集成能够继续正常工作。
:::
当你点击 Pause 按钮时，管道会进入 `Pausing` 状态。此状态是一个过渡状态，表示系统正在停止 CDC 进程。一旦 CDC 进程完全停止，管道将进入 `Paused` 状态。



## 修改中 {#modifying}
:::note
此状态即将可用。如果你正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，建议现在就添加对它的支持，以确保在该状态发布后，你的集成能够继续正常工作。
:::
当前，该状态表示该 pipe 正在删除表。



## 重新同步 {#resync}
:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)，请考虑现在就为其添加支持，以确保在该功能发布后，您的集成依然可以正常工作。
:::
此状态表示管道处于重新同步阶段，此时正在在 _resync 表与原始表之间执行原子级切换。有关重新同步的更多信息，请参阅[重新同步文档](./resync)。



## 已完成 {#completed}

此状态适用于仅用于快照的 pipe，表示快照已完成，且不再有任何需要执行的工作。



## 失败 {#failed}

如果管道中出现不可恢复的错误，它将进入 `Failed` 状态。您可以联系技术支持，或[重新同步](./resync)管道以从该状态恢复。
