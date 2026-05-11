---
title: '控制 MongoDB ClickPipe 的同步'
description: '用于控制 MongoDB ClickPipe 同步行为的文档'
slug: /integrations/clickpipes/mongodb/sync_control
sidebar_label: '同步控制'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

本文档介绍在 ClickPipe 处于 **CDC (Running) 模式** 时，如何控制 MongoDB ClickPipe 的同步。


## 概览 \{#overview\}

Database ClickPipes 的架构由两个并行流程组成——从源数据库拉取数据以及向目标数据库推送数据。拉取流程由一个同步配置控制，该配置定义了应当多长时间拉取一次数据，以及每次应拉取多少数据。这里的“每次”指的是一个批次——因为 ClickPipe 是以批次方式拉取和推送数据的。

有两种主要方式可以控制 MongoDB ClickPipe 的同步。当以下任一设置条件满足时，ClickPipe 将开始推送数据。

### 同步间隔 \{#interval\}

管道的同步间隔是指 ClickPipe 从源数据库拉取记录所持续的时间（以秒为单位）。将已拉取的数据推送到 ClickHouse 所花费的时间不包含在该间隔内。

默认值为 **1 分钟**。
同步间隔可以设置为任意正整数值，但建议保持在 10 秒以上。

### 拉取批次大小 \{#batch-size\}

拉取批次大小是指 ClickPipe 在一次批处理中从源数据库拉取的记录数量。这里的记录是指对属于该 ClickPipe 的集合所执行的插入、更新和删除操作。

默认值为 **100,000** 条记录。
建议的安全最大值为 1,000 万条记录。

### 配置同步设置 \{#configuring\}

在创建 ClickPipe 或编辑现有 ClickPipe 时，可以配置同步间隔和拉取批次大小。
在创建 ClickPipe 时，这些设置会显示在创建向导的第二步，如下所示：

<Image img={create_sync_settings} alt="Create sync settings" size="md"/>

在编辑现有 ClickPipe 时，可以进入该管道的 **Settings** 选项卡，先暂停该管道，然后点击此处的 **Configure**：

<Image img={edit_sync_button} alt="Edit sync button" size="md"/>

此操作会打开一个包含同步设置的侧边弹出面板，你可以在其中修改同步间隔和拉取批次大小：

<Image img={edit_sync_settings} alt="Edit sync settings" size="md"/>

### 监控同步控制行为 \{#monitoring\}

你可以在 ClickPipe 的 **Metrics** 选项卡中的 **CDC Syncs** 表中查看每个批次所用的时间。请注意，这里的持续时间包括推送时间；此外，如果没有新的行写入，ClickPipe 会等待，这段等待时间也会计入持续时间中。

<Image img={cdc_syncs} alt="CDC Syncs 表" size="md"/>