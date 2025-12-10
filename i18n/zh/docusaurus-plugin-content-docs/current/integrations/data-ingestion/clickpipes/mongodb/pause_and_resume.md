---
title: '暂停与恢复 MongoDB ClickPipe'
description: '暂停与恢复 MongoDB ClickPipe'
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

在某些场景下，暂停 MongoDB ClickPipe 会很有用。例如，你可能希望在数据保持静态时对现有数据进行分析，或者正在对 MongoDB 执行升级操作。下面介绍如何暂停和恢复 MongoDB ClickPipe。


## 暂停 MongoDB ClickPipe 的步骤 {#pause-clickpipe-steps}

1. 在 **Data Sources** 选项卡中，点击要暂停的 MongoDB ClickPipe。
2. 前往 **Settings** 选项卡。
3. 点击 **Pause** 按钮。

<Image img={pause_button} border size="md"/>

4. 将弹出一个确认对话框。再次点击 **Pause**。

<Image img={pause_dialog} border size="md"/>

4. 前往 **Metrics** 选项卡。
5. 等待该 ClickPipe 的状态变为 **Paused**。

<Image img={pause_status} border size="md"/>



## 恢复 MongoDB ClickPipe 的步骤 {#resume-clickpipe-steps}
1. 在 **Data Sources** 选项卡中，单击要恢复的 MongoDB ClickPipe。此时镜像的状态最初应为 **Paused**。
2. 转到 **Settings** 选项卡。
3. 单击 **Resume** 按钮。

<Image img={resume_button} border size="md"/>

4. 会弹出一个确认对话框，再次单击 **Resume**。

<Image img={resume_dialog} border size="md"/>

5. 转到 **Metrics** 选项卡。
6. 等待管道状态变为 **Running**。
