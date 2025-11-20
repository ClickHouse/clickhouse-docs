---
title: '控制 MongoDB ClickPipe 的同步'
description: '关于如何控制 MongoDB ClickPipe 同步的文档'
slug: /integrations/clickpipes/mongodb/sync_control
sidebar_label: '控制同步'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

本文档介绍在 ClickPipe 处于 **CDC（Running）模式** 时如何控制 MongoDB ClickPipe 的同步。


## 概述 {#overview}

数据库 ClickPipes 的架构由两个并行进程组成——从源数据库拉取数据和向目标数据库推送数据。拉取进程由同步配置控制,该配置定义了数据拉取的频率以及每次拉取的数据量。这里的"每次"指的是一个批次——因为 ClickPipe 以批次方式拉取和推送数据。

控制 MongoDB ClickPipe 同步有两种主要方式。当以下任一设置条件满足时,ClickPipe 将开始推送数据。

### 同步间隔 {#interval}

管道的同步间隔是 ClickPipe 从源数据库拉取记录的时长(以秒为单位)。将已拉取数据推送到 ClickHouse 所需的时间不包含在此间隔内。

默认值为 **1 分钟**。
同步间隔可以设置为任意正整数值,但建议保持在 10 秒以上。

### 拉取批次大小 {#batch-size}

拉取批次大小是 ClickPipe 在单个批次中从源数据库拉取的记录数。这里的记录是指对管道所包含集合执行的插入、更新和删除操作。

默认值为 **100,000** 条记录。
安全的最大值为 1000 万条。

### 配置同步设置 {#configuring}

您可以在创建 ClickPipe 或编辑现有 ClickPipe 时设置同步间隔和拉取批次大小。
创建 ClickPipe 时,可以在创建向导的第二步中看到这些设置,如下所示:

<Image img={create_sync_settings} alt='创建同步设置' size='md' />

编辑现有 ClickPipe 时,您可以转到管道的 **Settings** 选项卡,暂停管道,然后点击此处的 **Configure**:

<Image img={edit_sync_button} alt='编辑同步按钮' size='md' />

这将打开一个包含同步设置的弹出面板,您可以在其中更改同步间隔和拉取批次大小:

<Image img={edit_sync_settings} alt='编辑同步设置' size='md' />

### 监控同步控制行为 {#monitoring}

您可以在 ClickPipe 的 **Metrics** 选项卡中的 **CDC Syncs** 表中查看每个批次所需的时长。请注意,此处的持续时间包括推送时间,并且如果没有新数据传入,ClickPipe 会进入等待状态,等待时间也包含在持续时间内。

<Image img={cdc_syncs} alt='CDC Syncs 表' size='md' />
