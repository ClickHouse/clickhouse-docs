---
title: '暂停和恢复 MongoDB ClickPipe'
description: '暂停和恢复 MongoDB ClickPipe'
sidebar_label: '暂停表'
slug: /integrations/clickpipes/mongodb/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '数据摄取', '实时同步']
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

在某些场景下，暂停 MongoDB ClickPipe 会很有用。例如，您可能希望对静态状态下的现有数据进行分析，或者您可能正在对 MongoDB 进行升级。以下是暂停和恢复 MongoDB ClickPipe 的方法。


## 暂停 MongoDB ClickPipe 的步骤 {#pause-clickpipe-steps}

1. 在 Data Sources 选项卡中,点击您要暂停的 MongoDB ClickPipe。
2. 进入 **Settings** 选项卡。
3. 点击 **Pause** 按钮。

<Image img={pause_button} border size='md' />

4. 将弹出确认对话框。再次点击 Pause。

<Image img={pause_dialog} border size='md' />

5. 进入 **Metrics** 选项卡。
6. 等待管道状态变为 **Paused**。

<Image img={pause_status} border size='md' />


## 恢复 MongoDB ClickPipe 的步骤 {#resume-clickpipe-steps}

1. 在"数据源"选项卡中,点击您希望恢复的 MongoDB ClickPipe。镜像的初始状态应为 **Paused**。
2. 前往 **Settings** 选项卡。
3. 点击 **Resume** 按钮。

<Image img={resume_button} border size='md' />

4. 将弹出确认对话框。再次点击 Resume。

<Image img={resume_dialog} border size='md' />

5. 前往 **Metrics** 选项卡。
6. 等待管道状态变为 **Running**。
