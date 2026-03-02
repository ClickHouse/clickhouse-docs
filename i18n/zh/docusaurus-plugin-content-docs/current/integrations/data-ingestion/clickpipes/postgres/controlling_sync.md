---
title: '控制 Postgres ClickPipe 的同步'
description: '用于控制 Postgres ClickPipe 同步的指南'
slug: /integrations/clickpipes/postgres/sync_control
sidebar_label: '同步控制'
keywords: ['同步控制', 'Postgres', 'clickpipes', '批处理大小', '同步间隔']
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

本文档介绍如何在 ClickPipe 处于 **CDC（运行中）模式** 时控制 Postgres ClickPipe 的同步。


## 概览 \{#overview\}

Database ClickPipes 的架构包含两个并行流程——从源数据库拉取数据，以及向目标数据库推送数据。拉取流程由一个同步配置控制，该配置定义了数据应当多长时间拉取一次，以及每次应当拉取多少数据。这里的“每次”是指一个批次——因为 ClickPipe 是以批次的方式拉取和推送数据的。

有两种主要方式可以控制 Postgres ClickPipe 的同步。当下列任一设置被触发时，ClickPipe 将开始向目标数据库推送数据。

### 同步间隔 \{#interval\}

管道的同步间隔是指 ClickPipe 从源数据库拉取记录的时间长度（以秒为单位）。将已有数据推送到 ClickHouse 所花费的时间不包含在该间隔内。

默认值为 **1 分钟**。
同步间隔可以设置为任意正整数值，但建议将其设置为大于 10 秒。

### 拉取批次大小 \{#batch-size\}

拉取批次大小是指 ClickPipe 在一次批量操作中从源数据库拉取的记录数量。这里的记录是指在属于该 ClickPipe 的表上执行的插入、更新和删除操作。

默认值为 **100,000** 条记录。
安全的最大值为 1,000 万。

### 一个例外：源端的长时间运行事务 \{#transactions\}

当在源数据库上运行事务时，ClickPipe 会一直等待，直到接收到该事务的 COMMIT 之后才会继续执行。此行为会**覆盖** sync interval 和 pull batch size 设置。

### 配置同步设置 \{#configuring\}

在创建 ClickPipe 或编辑现有 ClickPipe 时，你可以设置同步间隔和拉取批次大小。
创建 ClickPipe 时，这些设置会显示在创建向导的第二步，如下所示：

<Image img={create_sync_settings} alt="创建同步设置" size="md"/>

编辑现有 ClickPipe 时，你可以前往该管道的 **Settings** 选项卡，先暂停该管道，然后点击此处的 **Configure**：

<Image img={edit_sync_button} alt="编辑同步按钮" size="md"/>

这会打开一个包含同步设置的侧边弹出面板，你可以在其中修改同步间隔和拉取批次大小：

<Image img={edit_sync_settings} alt="编辑同步设置" size="md"/>

### 调整同步设置以缓解 replication slot 增长 \{#tweaking\}

下面介绍如何使用这些设置来处理 CDC 管道中较大的 replication slot。
将数据推送到 ClickHouse 的耗时与从源数据库拉取数据的耗时之间并非线性关系，可以利用这一点来缩小较大的 replication slot。
通过同时增加同步间隔和拉取批次大小，ClickPipe 会一次性从源数据库拉取大量数据，然后再将其推送到 ClickHouse。

### 监控同步控制行为 \{#monitoring\}

你可以在 ClickPipe 的 **Metrics** 选项卡下的 **CDC Syncs** 表中查看每个同步批次的耗时。请注意，此处的耗时包含推送时间；如果一段时间内没有新的行数据写入，ClickPipe 会等待，这段等待时间也会计入耗时。

<Image img={cdc_syncs} alt="CDC Syncs 表" size="md"/>