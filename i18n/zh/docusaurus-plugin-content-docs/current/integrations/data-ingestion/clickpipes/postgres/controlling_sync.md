---
title: '控制 Postgres ClickPipe 的同步'
description: '用于控制 Postgres ClickPipe 同步的指南'
slug: /integrations/clickpipes/postgres/sync_control
sidebar_label: '控制同步'
keywords: ['同步控制', 'Postgres', 'ClickPipes', '批处理大小', '同步间隔']
doc_type: 'guide'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

本文档介绍在 ClickPipe 处于 **CDC（运行中）模式** 时如何控制 Postgres ClickPipe 的同步。


## 概览 {#overview}

数据库 ClickPipes 的架构由两个并行流程组成——从源数据库拉取数据以及向目标数据库推送数据。拉取流程由同步配置控制，同步配置定义了多长时间拉取一次数据以及每次拉取多少数据。这里的“每次”指的是一个批次——因为 ClickPipe 是按批次拉取和推送数据的。

控制 Postgres ClickPipe 同步有两种主要方式。当下面任一设置生效时，ClickPipe 就会开始推送数据。

### 同步间隔 {#interval}

管道的同步间隔是 ClickPipe 从源数据库拉取记录的时间长度（以秒为单位）。将已有数据推送到 ClickHouse 所花费的时间不包含在该间隔内。

默认值为 **1 分钟**。
同步间隔可以设置为任意正整数值，但建议保持在 10 秒以上。

### 拉取批大小 {#batch-size}

拉取批大小是指 ClickPipe 在一个批次中从源数据库拉取的记录数量。这里的记录是指对属于该管道的表执行的插入、更新和删除操作。

默认值为 **100,000** 条记录。
安全的最大值为 1,000 万。

### 特例：源端的长事务 {#transactions}

当在源数据库上执行事务时，ClickPipe 会等待直到收到该事务的 COMMIT 之后才会继续推进。这会**覆盖**同步间隔和拉取批大小这两个设置。

### 配置同步设置 {#configuring}

你可以在创建 ClickPipe 时或编辑现有 ClickPipe 时设置同步间隔和拉取批大小。
在创建 ClickPipe 时，可以在创建向导的第二步中看到这些设置，如下所示：

<Image img={create_sync_settings} alt="创建同步设置" size="md"/>

在编辑现有 ClickPipe 时，你可以前往该管道的 **Settings** 选项卡，先暂停管道，然后点击这里的 **Configure**：

<Image img={edit_sync_button} alt="编辑同步按钮" size="md"/>

这会打开一个包含同步设置的侧边面板，你可以在其中更改同步间隔和拉取批大小：

<Image img={edit_sync_settings} alt="编辑同步设置" size="md"/>

### 调整同步设置以缓解 replication slot 膨胀 {#tweaking}

下面介绍如何使用这些设置来处理 CDC 管道中较大的 replication slot。
向 ClickHouse 推送数据所需的时间并不会与从源数据库拉取数据的时间线性扩展。可以利用这一点来减小较大 replication slot 的大小。
通过同时增加同步间隔和拉取批大小，ClickPipe 会在一次拉取中从源数据库获取大量数据，然后再将其推送到 ClickHouse。

### 监控同步控制行为 {#monitoring}

你可以在 ClickPipe 的 **Metrics** 选项卡中的 **CDC Syncs** 表里查看每个批次耗时多久。请注意，这里的时长包含推送时间；此外，如果没有新行到达，ClickPipe 会进行等待，这段等待时间也会计入时长之中。

<Image img={cdc_syncs} alt="CDC Syncs 表" size="md"/>
