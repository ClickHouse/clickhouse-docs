---
title: '暂停和恢复 MySQL ClickPipe'
description: '暂停和恢复 MySQL ClickPipe'
sidebar_label: '暂停表'
slug: /integrations/clickpipes/mysql/pause_and_resume
doc_type: 'guide'
keywords: ['ClickPipes', 'MySQL', 'CDC', '数据摄取', '实时同步']
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

在某些情况下，暂停 MySQL ClickPipe 会很有用。例如，您可能希望在数据保持静止时对现有数据进行分析，或者正在执行 MySQL 升级操作。以下介绍如何暂停和恢复 MySQL ClickPipe。

## 暂停 MySQL ClickPipe 的步骤 \\{#pause-clickpipe-steps\\}

1. 在 **Data Sources** 选项卡中，单击要暂停的 MySQL ClickPipe。
2. 前往 **Settings** 选项卡。
3. 单击 **Pause** 按钮。

<Image img={pause_button} border size="md"/>

4. 会弹出确认对话框。再次单击 **Pause**。

<Image img={pause_dialog} border size="md"/>

4. 前往 **Metrics** 选项卡。
5. 约 5 秒后（或刷新页面后），该管道的状态应变为 **Paused**。

<Image img={pause_status} border size="md"/>

## 恢复 MySQL ClickPipe 的步骤 \\{#resume-clickpipe-steps\\}

1. 在 Data Sources 选项卡中，点击你希望恢复的 MySQL ClickPipe。镜像的状态最初应为 **Paused**。
2. 前往 **Settings** 选项卡。
3. 点击 **Resume** 按钮。

<Image img={resume_button} border size="md"/>

4. 会弹出一个确认对话框。再次点击 Resume。

<Image img={resume_dialog} border size="md"/>

5. 前往 **Metrics** 选项卡。
6. 大约 5 秒后（或刷新页面后），管道的状态应变为 **Running**。