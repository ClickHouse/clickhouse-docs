---
'title': '控制 Postgres ClickPipe 的同步'
'description': '用于控制 Postgres ClickPipe 同步的文档'
'slug': '/integrations/clickpipes/postgres/sync_control'
'sidebar_label': '控制同步'
'doc_type': 'guide'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

This document describes how to control the sync of a Postgres ClickPipe when the ClickPipe is in **CDC (Running) mode**.

## Overview {#overview}

Database ClickPipes have an architecture that consists of two parallel processes - pulling from the source database and pushing to the target database. The pulling process is controlled by a sync configuration that defines how often the data should be pulled and how much data should be pulled at a time. By "at a time", we mean one batch - since the ClickPipe pulls and pushes data in batches.

There are two main ways to control the sync of a Postgres ClickPipe. The ClickPipe will start pushing when one of the below settings kicks in.

### Sync interval {#interval}

管道的同步间隔是 ClickPipe 从源数据库拉取记录的时间量（以秒为单位）。推送的数据到 ClickHouse 的时间不包括在这个间隔内。

默认值是 **1分钟**。
同步间隔可以设置为任何正整数值，但建议保持在10秒以上。

### Pull batch size {#batch-size}

拉取批次大小是 ClickPipe 在一个批次中从源数据库拉取的记录数量。记录包括在管道中表上进行的插入、更新和删除。

默认情况下为 **100,000** 条记录。
安全的最大值是 1000 万。

### An exception: Long-running transactions on source {#transactions}

当在源数据库上运行事务时，ClickPipe 会等待直到收到该事务的 COMMIT 后才继续。这将 **覆盖** 同步间隔和拉取批次大小。

### Configuring sync settings {#configuring}

您可以在创建 ClickPipe 时或编辑现有 ClickPipe 时设置同步间隔和拉取批次大小。
在创建 ClickPipe 时，可以在创建向导的第二步看到，如下所示：

<Image img={create_sync_settings} alt="Create sync settings" size="md"/>

在编辑现有 ClickPipe 时，您可以前往管道的 **设置** 标签，暂停管道，然后点击这里的 **配置**：

<Image img={edit_sync_button} alt="Edit sync button" size="md"/>

这将打开一个侧边栏，显示同步设置，您可以在这里更改同步间隔和拉取批次大小：

<Image img={edit_sync_settings} alt="Edit sync settings" size="md"/>

### Tweaking the sync settings to help with replication slot growth {#tweaking}

让我们讨论如何使用这些设置来处理 CDC 管道的大型复制槽。
推送到 ClickHouse 的时间不会随从源数据库拉取的时间线性缩放。这可以利用来减小大型复制槽的大小。
通过增加同步间隔和拉取批次大小，ClickPipe 将一次性从源数据库拉取大量数据，然后再推送到 ClickHouse。

### Monitoring sync control behaviour {#monitoring}
您可以在 ClickPipe 的 **指标** 标签中的 **CDC Syncs** 表中查看每个批次所花费的时间。请注意，这里的持续时间包括推送时间，并且如果没有传入行，ClickPipe 会等待，等待时间也包括在持续时间内。

<Image img={cdc_syncs} alt="CDC Syncs table" size="md"/>
