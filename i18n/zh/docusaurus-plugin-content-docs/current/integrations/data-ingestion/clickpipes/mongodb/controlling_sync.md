---
title: '控制 MongoDB ClickPipe 的同步'
description: '用于控制 MongoDB ClickPipe 同步的文档'
slug: /integrations/clickpipes/mongodb/sync_control
sidebar_label: '控制同步'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: '核心'
  - category: 'clickpipes'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

本文档介绍当 ClickPipe 处于 **CDC（Running）模式** 时如何控制 MongoDB ClickPipe 的同步。

## 概览 {#overview}

数据库类 ClickPipe 的架构由两个并行流程组成——从源数据库拉取数据以及向目标数据库推送数据。拉取流程由一个同步配置控制，该配置定义了应当多久拉取一次数据，以及每次应拉取多少数据。这里的“每次”指的是一个批次——因为 ClickPipe 是按批次拉取和推送数据的。

控制 MongoDB ClickPipe 同步的方式有两种主要途径。当下述任一设置生效时，ClickPipe 就会开始推送数据。

### 同步间隔 {#interval}

管道的同步间隔是 ClickPipe 从源数据库拉取记录所持续的时间（以秒为单位）。将已有数据推送到 ClickHouse 所需的时间不计入该间隔。

默认值为 **1 分钟**。
同步间隔可以设置为任意正整数值，但建议保持在 10 秒以上。

### 拉取批量大小 {#batch-size}

拉取批量大小是指 ClickPipe 在一个批次中从源数据库拉取的记录数量。这里的记录是指在属于该管道的集合上执行的插入、更新和删除操作。

默认值为 **100,000** 条记录。
推荐的安全上限为 1000 万。

### 配置同步设置 {#configuring}

可以在创建 ClickPipe 时或编辑现有 ClickPipe 时设置同步间隔和拉取批量大小。
在创建 ClickPipe 时，这些设置会出现在创建向导的第二步，如下所示：

<Image img={create_sync_settings} alt="创建同步设置" size="md"/>

在编辑现有 ClickPipe 时，可以前往该管道的 **Settings** 选项卡，先暂停管道，然后点击此处的 **Configure**：

<Image img={edit_sync_button} alt="编辑同步按钮" size="md"/>

此操作会打开一个包含同步设置的侧边弹层，可以在其中修改同步间隔和拉取批量大小：

<Image img={edit_sync_settings} alt="编辑同步设置" size="md"/>

### 监控同步控制行为 {#monitoring}

可以在 ClickPipe 的 **Metrics** 选项卡中的 **CDC Syncs** 表里查看每个批次的耗时。请注意，这里的持续时间包含推送时间；另外，如果没有新记录写入，ClickPipe 会等待，这段等待时间也会计入持续时间。

<Image img={cdc_syncs} alt="CDC Syncs 表" size="md"/>