---
'title': '控制 MySQL ClickPipe 的同步'
'description': '文档用于控制 MySQL ClickPipe 的同步'
'slug': '/integrations/clickpipes/mysql/sync_control'
'sidebar_label': '控制同步'
'doc_type': 'guide'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

这份文档描述了如何控制MySQL ClickPipe的同步，当ClickPipe处于**CDC（运行中）模式**时。

## 概述 {#overview}

数据库ClickPipes的架构由两个并行进程组成 - 从源数据库提取数据和将数据推送到目标数据库。提取过程由一个同步配置控制，该配置定义了数据应多久提取一次以及每次应提取多少数据。这里的“每次”指的是一个批次 - 因为ClickPipe是以批次的方式提取和推送数据。

有两种主要方式可以控制MySQL ClickPipe的同步。ClickPipe将在以下设置之一启动推送。

### 同步间隔 {#interval}

管道的同步间隔是ClickPipe从源数据库提取记录的时间（以秒为单位）。推送到ClickHouse的时间不包括在此间隔内。

默认值为**1分钟**。 
同步间隔可以设置为任何正整数值，但建议保持在10秒以上。

### 提取批次大小 {#batch-size}

提取批次大小是ClickPipe在一个批次中从源数据库提取的记录数量。记录指的是对管道中所涉及表的插入、更新和删除操作。

默认值为**100,000**条记录。 
安全的最大值是1000万。

### 一个例外：源上长事务 {#transactions}

当源数据库上运行一个事务时，ClickPipe会等待直到收到该事务的COMMIT后才会继续。这会**覆盖**同步间隔和提取批次大小的设置。

### 配置同步设置 {#configuring}

您可以在创建ClickPipe时或编辑现有的ClickPipe时设置同步间隔和提取批次大小。 
在创建ClickPipe时，可以在创建向导的第二步看到它，如下所示：

<Image img={create_sync_settings} alt="创建同步设置" size="md"/>

在编辑现有ClickPipe时，您可以转到管道的**设置**选项卡，暂停管道，然后在此处点击**配置**：

<Image img={edit_sync_button} alt="编辑同步按钮" size="md"/>

这将打开一个飞出窗口，显示同步设置，您可以在这里更改同步间隔和提取批次大小：

<Image img={edit_sync_settings} alt="编辑同步设置" size="md"/>

### 监控同步控制行为 {#monitoring}

您可以在ClickPipe的**指标**选项卡中的**CDC Syncs**表中查看每个批次所需的时间。请注意，这里的持续时间包括推送时间，如果没有行进入，ClickPipe会等待，等待时间也包括在持续时间内。

<Image img={cdc_syncs} alt="CDC Syncs 表" size="md"/>
