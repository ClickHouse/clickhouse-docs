---
title: '控制 Postgres ClickPipe 的同步'
description: '控制 Postgres ClickPipe 同步的文档'
slug: /integrations/clickpipes/postgres/sync_control
sidebar_label: '同步控制'
keywords: ['同步控制', 'postgres', 'clickpipes', '批处理大小', '同步间隔']
doc_type: 'guide'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

本文档介绍了当 ClickPipe 处于 **CDC(运行中)模式**时,如何控制 Postgres ClickPipe 的同步。


## 概述 {#overview}

数据库 ClickPipes 的架构由两个并行进程组成——从源数据库拉取数据和向目标数据库推送数据。拉取进程由同步配置控制,该配置定义了数据拉取的频率以及每次拉取的数据量。这里的"每次"指的是一个批次——因为 ClickPipe 以批次方式拉取和推送数据。

控制 Postgres ClickPipe 同步的方式主要有两种。当以下任一设置条件满足时,ClickPipe 将开始推送数据。

### 同步间隔 {#interval}

管道的同步间隔是 ClickPipe 从源数据库拉取记录的时间长度(以秒为单位)。将数据推送到 ClickHouse 所需的时间不包含在此间隔内。

默认值为 **1 分钟**。
同步间隔可以设置为任何正整数值,但建议保持在 10 秒以上。

### 拉取批次大小 {#batch-size}

拉取批次大小是 ClickPipe 在单个批次中从源数据库拉取的记录数。这里的记录是指在管道所包含的表上执行的插入、更新和删除操作。

默认值为 **100,000** 条记录。
安全的最大值为 1000 万条。

### 例外情况:源数据库上的长时间运行事务 {#transactions}

当在源数据库上运行事务时,ClickPipe 会等待直到收到事务的 COMMIT 后才继续执行。这将**覆盖**同步间隔和拉取批次大小的设置。

### 配置同步设置 {#configuring}

您可以在创建 ClickPipe 或编辑现有 ClickPipe 时设置同步间隔和拉取批次大小。
创建 ClickPipe 时,可以在创建向导的第二步中看到这些设置,如下所示:

<Image img={create_sync_settings} alt='创建同步设置' size='md' />

编辑现有 ClickPipe 时,您可以转到管道的 **Settings** 选项卡,暂停管道,然后点击此处的 **Configure**:

<Image img={edit_sync_button} alt='编辑同步按钮' size='md' />

这将打开一个包含同步设置的弹出面板,您可以在其中更改同步间隔和拉取批次大小:

<Image img={edit_sync_settings} alt='编辑同步设置' size='md' />

### 调整同步设置以应对复制槽增长 {#tweaking}

下面我们讨论如何使用这些设置来处理 CDC 管道的大型复制槽。
推送到 ClickHouse 的时间与从源数据库拉取的时间并非线性扩展关系。可以利用这一特性来减小大型复制槽的大小。
通过同时增加同步间隔和拉取批次大小,ClickPipe 将一次性从源数据库拉取大量数据,然后将其推送到 ClickHouse。

### 监控同步控制行为 {#monitoring}

您可以在 ClickPipe 的 **Metrics** 选项卡中的 **CDC Syncs** 表中查看每个批次所需的时间。请注意,此处的持续时间包括推送时间,并且如果没有传入的行,ClickPipe 会进入等待状态,等待时间也包含在持续时间内。

<Image img={cdc_syncs} alt='CDC Syncs 表' size='md' />
