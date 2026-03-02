---
title: '控制 MySQL ClickPipe 的同步'
description: '关于如何控制 MySQL ClickPipe 同步的文档'
slug: /integrations/clickpipes/mysql/sync_control
sidebar_label: '控制同步'
keywords: ['MySQL ClickPipe', 'ClickPipe 同步控制', 'MySQL CDC 复制', 'ClickHouse MySQL 连接器', 'ClickHouse 与 MySQL 的数据库同步']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

本文档介绍在 ClickPipe 处于 **CDC（Running）模式** 时如何控制 MySQL ClickPipe 的同步过程。


## 概览 \{#overview\}

Database ClickPipes 的架构由两个并行流程组成——从源数据库拉取数据以及向目标数据库推送数据。拉取流程由一个同步配置控制，该配置定义了拉取数据的频率以及每次拉取的数据量。这里的“每次”是指一个批次——因为 ClickPipe 是按批次拉取和推送数据的。

有两种主要方式可以控制 MySQL ClickPipe 的同步。当下面任一设置生效时，ClickPipe 将开始推送数据。

### 同步间隔 \{#interval\}

管道的同步间隔是指 ClickPipe 从源数据库拉取记录的时长（以秒为单位）。将已有数据推送到 ClickHouse 所花费的时间不包含在该间隔内。

默认值为 **1 分钟**。
同步间隔可以设置为任意正整数值，但建议保持在 10 秒以上。

### 拉取批大小 \{#batch-size\}

拉取批大小是指 ClickPipe 在一次批处理中从源数据库拉取的记录数量。记录是指对属于该 ClickPipe 的表执行的 insert、update 和 delete 操作。

默认值为 **100,000** 条记录。
安全上限为 1000 万条记录。

### 一个例外：源端的长时间运行事务 \{#transactions\}

当在源数据库上运行事务时，ClickPipe 会在接收到该事务的 COMMIT 之后才继续处理。此行为会**覆盖**同步间隔和拉取批次大小这两个设置。

### 配置同步设置 \{#configuring\}

在创建 ClickPipe 或编辑现有 ClickPipe 时，可以配置同步间隔和拉取批量大小。
在创建 ClickPipe 时，这些设置会出现在创建向导的第二步中，如下所示：

<Image img={create_sync_settings} alt="创建同步设置" size="md"/>

在编辑现有 ClickPipe 时，可以进入该管道的 **Settings** 选项卡，先暂停该管道，然后点击此处的 **Configure**：

<Image img={edit_sync_button} alt="编辑同步按钮" size="md"/>

此操作会打开一个包含同步设置的侧边弹出面板，你可以在其中修改同步间隔和拉取批量大小：

<Image img={edit_sync_settings} alt="编辑同步设置" size="md"/>

### 监控同步控制行为 \{#monitoring\}

你可以在 ClickPipe 的 **Metrics** 选项卡中的 **CDC Syncs** 表中查看每个批次的耗时。注意，这里的持续时间包含推送时间；并且如果当前没有新的行写入，ClickPipe 会等待，这段等待时间也会计入持续时间。

<Image img={cdc_syncs} alt="CDC Syncs 表" size="md"/>