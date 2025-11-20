---
title: '暂停和恢复 MySQL ClickPipe'
description: '暂停和恢复 MySQL ClickPipe'
sidebar_label: '暂停表'
slug: /integrations/clickpipes/mysql/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

在某些场景下，暂停 MySQL ClickPipe 会很有用。例如，您可能希望在数据保持静止时对现有数据运行一些分析，或者正在对 MySQL 进行升级。以下是暂停和恢复 MySQL ClickPipe 的方法。


## 暂停 MySQL ClickPipe 的步骤 {#pause-clickpipe-steps}

1. 在"数据源"选项卡中,点击您要暂停的 MySQL ClickPipe。
2. 前往 **Settings** 选项卡。
3. 点击 **Pause** 按钮。

<Image img={pause_button} border size='md' />

4. 将弹出确认对话框。再次点击 Pause。

<Image img={pause_dialog} border size='md' />

4. 前往 **Metrics** 选项卡。
5. 大约 5 秒后(或刷新页面后),管道状态应显示为 **Paused**。

<Image img={pause_status} border size='md' />


## 恢复 MySQL ClickPipe 的步骤 {#resume-clickpipe-steps}

1. 在"数据源"选项卡中,点击您希望恢复的 MySQL ClickPipe。镜像的初始状态应为 **Paused**(已暂停)。
2. 前往 **Settings**(设置)选项卡。
3. 点击 **Resume**(恢复)按钮。

<Image img={resume_button} border size='md' />

4. 将出现一个确认对话框。再次点击"Resume"(恢复)。

<Image img={resume_dialog} border size='md' />

5. 前往 **Metrics**(指标)选项卡。
6. 大约 5 秒后(或刷新页面后),管道的状态应变为 **Running**(运行中)。
