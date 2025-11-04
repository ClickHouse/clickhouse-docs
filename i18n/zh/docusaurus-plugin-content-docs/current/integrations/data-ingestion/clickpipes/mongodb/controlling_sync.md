---
'title': '控制 MongoDB ClickPipe 的同步'
'description': '文档用于控制 MongoDB ClickPipe 的同步'
'slug': '/integrations/clickpipes/mongodb/sync_control'
'sidebar_label': '控制同步'
'doc_type': 'guide'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

该文档描述了如何控制MongoDB ClickPipe的同步，当ClickPipe处于**CDC (运行）模式**时。

## 概述 {#overview}

数据库ClickPipes的架构由两个并行进程组成 - 从源数据库拉取数据和推送到目标数据库。拉取过程由同步配置控制，该配置定义了数据应每隔多长时间拉取，以及每次应拉取多少数据。我们所说的“每次”是指一批 - 因为ClickPipe以批量方式拉取和推送数据。

控制MongoDB ClickPipe同步的主要方式有两种。当以下设置之一启用时，ClickPipe将开始推送数据。

### 同步间隔 {#interval}

管道的同步间隔是ClickPipe将从源数据库拉取记录的时间（以秒为单位）。我们推送到ClickHouse的时间不包括在此间隔中。

默认值为**1分钟**。
同步间隔可以设置为任何正整数值，但建议保持在10秒以上。

### 拉取批大小 {#batch-size}

拉取批大小是ClickPipe在一次批处理中将从源数据库拉取的记录数量。记录是指在属于管道的集合中进行的插入、更新和删除操作。

默认值为**100,000**条记录。
安全的最大值为1000万。

### 配置同步设置 {#configuring}

您可以在创建ClickPipe时或编辑现有ClickPipe时设置同步间隔和拉取批大小。
在创建ClickPipe时，这些设置将在创建向导的第二步中显示，如下所示：

<Image img={create_sync_settings} alt="创建同步设置" size="md"/>

在编辑现有ClickPipe时，您可以转到管道的**设置**选项卡，暂停管道，然后单击**配置**：

<Image img={edit_sync_button} alt="编辑同步按钮" size="md"/>

这将打开一个飞出窗口，其中包含同步设置，您可以在其中更改同步间隔和拉取批大小：

<Image img={edit_sync_settings} alt="编辑同步设置" size="md"/>

### 监控同步控制行为 {#monitoring}

您可以在ClickPipe的**指标**选项卡中的**CDC Syncs**表中看到每个批处理所需的时间。请注意，这里的持续时间包括推送时间，以及如果没有行输入，ClickPipe将等待，等待时间也包括在持续时间内。

<Image img={cdc_syncs} alt="CDC Syncs 表" size="md"/>
