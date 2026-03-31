---
title: '暂停和恢复 MySQL ClickPipe'
description: '暂停和恢复 MySQL ClickPipe'
sidebar_label: '暂停与恢复'
slug: /integrations/clickpipes/mysql/pause_and_resume
doc_type: 'guide'
keywords: ['ClickPipes', 'MySQL', 'CDC（变更数据捕获）', '数据摄取', '实时同步']
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

在某些情况下，暂停 MySQL ClickPipe 会很有用。例如，您可能希望在数据保持静态的状态下，对现有数据运行一些分析。或者，您可能正在对 MySQL 进行升级。以下说明如何暂停和恢复 MySQL ClickPipe。

## 暂停 MySQL ClickPipe 的步骤 \{#pause-clickpipe-steps\}

1. 在 Data Sources 选项卡中，点击要暂停的 MySQL ClickPipe。
2. 前往 **设置** 选项卡。
3. 点击 **Pause** 按钮。

<Image img={pause_button} border size="md" />

4. 此时会弹出确认对话框。再次点击 Pause。

<Image img={pause_dialog} border size="md" />

4. 前往 **指标** 选项卡。
5. 大约在 5 秒后 (以及页面刷新后) ，该管道的状态应显示为 **Paused**。

<Image img={pause_status} border size="md" />

## 恢复 MySQL ClickPipe 的步骤 \{#resume-clickpipe-steps\}

1. 在“Data Sources”选项卡中，点击要恢复的 MySQL ClickPipe。其镜像状态起初应为 **Paused**。
2. 前往 **设置** 选项卡。
3. 点击 **Resume** 按钮。

<Image img={resume_button} border size="md" />

4. 弹出确认对话框。再次点击 **Resume**。

<Image img={resume_dialog} border size="md" />

5. 前往 **指标** 选项卡。
6. 大约5秒后 (以及页面刷新后) ，该管道的状态应变为 **Running**。