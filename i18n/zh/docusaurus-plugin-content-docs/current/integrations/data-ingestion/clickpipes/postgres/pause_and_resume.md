---
title: '暂停和恢复 Postgres ClickPipe'
description: '暂停和恢复 Postgres ClickPipe'
sidebar_label: '暂停表'
slug: /integrations/clickpipes/postgres/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: '核心'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

在某些场景下，暂停 Postgres ClickPipe 会很有用。例如，你可能希望在数据保持静态时对现有数据进行分析，或者正在对 Postgres 进行升级。下面介绍如何暂停和恢复 Postgres ClickPipe。

## 暂停 Postgres ClickPipe 的步骤 \\{#pause-clickpipe-steps\\}

1. 在 **Data Sources** 选项卡中，点击你想暂停的 Postgres ClickPipe。
2. 前往 **Settings** 选项卡。
3. 点击 **Pause** 按钮。

<Image img={pause_button} border size="md"/>

4. 会弹出一个确认对话框。再次点击 **Pause**。

<Image img={pause_dialog} border size="md"/>

4. 前往 **Metrics** 选项卡。
5. 大约 5 秒后（或刷新页面后），该管道的状态应变为 **Paused**。

:::warning
暂停 Postgres ClickPipe 并不会停止 replication slot 的增长。
:::

<Image img={pause_status} border size="md"/>

## 恢复 Postgres ClickPipe 的步骤 \\{#resume-clickpipe-steps\\}

1. 在 **Data Sources** 选项卡中，点击要恢复的 Postgres ClickPipe。此时对应镜像的状态应为 **Paused**。
2. 前往 **Settings** 选项卡。
3. 点击 **Resume** 按钮。

<Image img={resume_button} border size="md"/>

4. 会弹出一个确认对话框。再次点击 **Resume**。

<Image img={resume_dialog} border size="md"/>

5. 前往 **Metrics** 选项卡。
6. 大约 5 秒后（或刷新页面后），该 ClickPipe 的状态应变为 **Running**。