---
title: '暂停和恢复 MongoDB ClickPipe'
description: '暂停和恢复 MongoDB ClickPipe'
sidebar_label: '暂停数据表'
slug: /integrations/clickpipes/mongodb/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'MongoDB', 'CDC', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

在某些情况下，暂停 MongoDB ClickPipe 会很有帮助。例如，您可能希望在数据处于静态状态时对现有数据进行一些分析。或者，您可能需要对 MongoDB 进行升级。以下介绍如何暂停和恢复 MongoDB ClickPipe。

## 暂停 MongoDB ClickPipe 的步骤 \{#pause-clickpipe-steps\}

1. 在 Data Sources 选项卡中，点击要暂停的 MongoDB ClickPipe。
2. 前往 **Settings** 选项卡。
3. 点击 **Pause** 按钮。

<Image img={pause_button} border size="md" />

4. 此时会弹出确认对话框。再次点击 **Pause**。

<Image img={pause_dialog} border size="md" />

4. 前往 **指标** 选项卡。
5. 等待该 ClickPipe 的状态变为 **Paused**。

<Image img={pause_status} border size="md" />

## 恢复 MongoDB ClickPipe 的步骤 \{#resume-clickpipe-steps\}

1. 在 Data Sources 选项卡中，点击要恢复的 MongoDB ClickPipe。镜像任务的初始状态应为 **Paused**。
2. 前往 **Settings** 选项卡。
3. 点击 **Resume** 按钮。

<Image img={resume_button} border size="md" />

4. 弹出确认对话框。再次点击 **Resume**。

<Image img={resume_dialog} border size="md" />

5. 前往 **Metrics** 选项卡。
6. 等待 ClickPipe 状态变为 **Running**。