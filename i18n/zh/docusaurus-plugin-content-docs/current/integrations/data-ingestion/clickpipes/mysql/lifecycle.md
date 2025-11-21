---
sidebar_label: 'MySQL ClickPipe 的生命周期'
description: '各种管道状态及其含义'
slug: /integrations/clickpipes/mysql/lifecycle
title: 'MySQL ClickPipe 的生命周期'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', '数据摄取', '实时同步']
---



# MySQL ClickPipe 的生命周期 {#lifecycle}

本文档介绍 MySQL ClickPipe 的各个阶段、可能的不同状态及其含义。注意:本文档同样适用于 MariaDB。


## 资源配置 {#provisioning}

当您点击"创建 ClickPipe"按钮时,ClickPipe 将以 `Provisioning` 状态创建。资源配置过程会启动用于运行该服务 ClickPipes 的底层基础设施,并为管道注册初始元数据。由于同一服务内的 ClickPipes 共享计算资源,因此创建第二个 ClickPipe 的速度会比第一个快得多——因为基础设施已经部署完成。


## 设置 {#setup}

管道配置完成后,将进入 `Setup` 状态。在此状态下,系统会创建目标 ClickHouse 表,同时获取并记录源表的表定义。


## 快照 {#snapshot}

设置完成后,管道将进入 `Snapshot` 状态(除非是仅 CDC 的管道,此类管道会直接转换到 `Running` 状态)。`Snapshot`、`Initial Snapshot` 和 `Initial Load`(更常用)这些术语可以互换使用。在此状态下,系统会对源 MySQL 表进行快照并将数据加载到 ClickHouse 中。二进制日志的保留设置应充分考虑初始加载所需的时间。有关初始加载的更多信息,请参阅[并行初始加载文档](./parallel_initial_load)。当触发重新同步或向现有管道添加新表时,管道也会进入 `Snapshot` 状态。


## 运行中 {#running}

初始加载完成后,管道进入 `Running` 状态(除非是仅快照管道,此类管道将转换为 `Completed` 状态)。此时管道开始执行 `Change-Data Capture`(变更数据捕获)。在此状态下,系统开始从源数据库读取二进制日志,并批量将数据同步到 ClickHouse。有关控制 CDC 的信息,请参阅[控制 CDC 的文档](./sync_control)。


## 已暂停 {#paused}

当管道处于 `Running` 状态时,可以将其暂停。这将停止 CDC 进程,管道将进入 `Paused` 状态。在此状态下,不会从源数据库拉取新数据,但 ClickHouse 中的现有数据保持完整。可以从此状态恢复管道。


## Pausing {#pausing}

:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi),建议现在就添加对该状态的支持,以确保发布后您的集成能够继续正常工作。
:::
当您点击暂停按钮时,管道将进入 `Pausing` 状态。这是一个过渡状态,表示系统正在停止 CDC 进程。CDC 进程完全停止后,管道将进入 `Paused` 状态。
:::


## 修改中 {#modifying}

:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi),请考虑现在就添加对其的支持,以确保在发布后您的集成能够继续正常工作。
:::
目前,此状态表示管道正在删除表。


## 重新同步 {#resync}

:::note
此状态即将推出。如果您正在使用我们的 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi),建议现在就添加对该状态的支持,以确保发布后您的集成能够继续正常工作。
:::
此状态表示管道正处于重新同步阶段,正在执行 \_resync 表与原始表的原子交换操作。有关重新同步的更多信息,请参阅[重新同步文档](./resync)。


## 已完成 {#completed}

此状态适用于仅快照模式的管道,表示快照已完成,无需执行更多操作。


## 失败 {#failed}

如果管道中出现不可恢复的错误,它将进入 `Failed` 状态。您可以联系技术支持或[重新同步](./resync)管道以从该状态恢复。
