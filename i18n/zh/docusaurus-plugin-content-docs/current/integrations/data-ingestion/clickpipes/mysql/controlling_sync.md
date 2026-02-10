---
title: '控制 MySQL ClickPipe 同步'
description: '关于如何控制 MySQL ClickPipe 同步的文档'
slug: /integrations/clickpipes/mysql/sync_control
sidebar_label: '控制同步'
keywords: ['MySQL ClickPipe', 'ClickPipe 同步控制', 'MySQL CDC 复制', 'ClickHouse MySQL 连接器', '数据库与 ClickHouse 的同步']
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

本文档介绍在 MySQL ClickPipe 处于 **CDC（运行）模式** 时，如何控制其同步。

## 概览 \{#overview\}

数据库类 ClickPipes 的架构由两个并行流程组成——从源数据库拉取数据以及向目标数据库推送数据。拉取流程由同步配置控制，该配置定义了应该多长时间拉取一次数据，以及每次应该拉取多少数据。这里的“每次”指的是一个批次——因为 ClickPipe 是按批次拉取和推送数据的。

控制 MySQL ClickPipe 同步主要有两种方式。当下面任一设置生效时，ClickPipe 就会开始推送。

### 同步间隔 \{#interval\}

管道的同步间隔是 ClickPipe 从源数据库拉取记录所持续的时间长度（以秒为单位）。将已有数据推送到 ClickHouse 所花费的时间不计入这个间隔。

默认值为 **1 分钟**。
同步间隔可以设置为任意正整数值，但建议保持在 10 秒以上。

### 拉取批次大小 \{#batch-size\}

拉取批次大小是 ClickPipe 在一个批次中从源数据库拉取的记录数。这里的记录是指对属于该管道的表执行的插入、更新和删除操作。

默认值为 **100,000** 条记录。
比较安全的最大值为 1000 万。

### 例外情况：源端长事务 \{#transactions\}

当在源数据库上执行一个事务时，ClickPipe 会在收到该事务的 COMMIT 之前一直等待，然后才继续处理。这样会**覆盖**同步间隔和拉取批次大小这两个设置。

### 配置同步设置 \{#configuring\}

在创建 ClickPipe 时，或者编辑已有 ClickPipe 时，你可以设置同步间隔和拉取批次大小。
在创建 ClickPipe 时，它会出现在创建向导的第二步，如下所示：

<Image img={create_sync_settings} alt="创建同步设置" size="md"/>

在编辑已有 ClickPipe 时，你可以进入该管道的 **Settings** 选项卡，先暂停管道，然后点击此处的 **Configure**：

<Image img={edit_sync_button} alt="编辑同步按钮" size="md"/>

这会打开一个包含同步设置的侧边面板，你可以在其中修改同步间隔和拉取批次大小：

<Image img={edit_sync_settings} alt="编辑同步设置" size="md"/>

### 监控同步控制行为 \{#monitoring\}

你可以在 ClickPipe 的 **Metrics** 选项卡中的 **CDC Syncs** 表中查看每个批次所花费的时间。请注意，这里的时长包括推送时间；另外，如果没有新行到达，ClickPipe 会等待，这段等待时间也会被计入时长。

<Image img={cdc_syncs} alt="CDC Syncs 表" size="md"/>