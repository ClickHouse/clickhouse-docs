---
title: '暂停和恢复 Postgres ClickPipe'
description: '暂停和恢复 Postgres ClickPipe'
sidebar_label: '暂停表'
slug: /integrations/clickpipes/postgres/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

在某些情况下，暂停 Postgres ClickPipe 会很有用。例如，您可能希望在数据保持静态状态时，对现有数据进行分析，或者您可能正在对 Postgres 执行升级操作。以下是暂停和恢复 Postgres ClickPipe 的方法。


## 暂停 Postgres ClickPipe 的步骤 {#pause-clickpipe-steps}

1. 在数据源选项卡中,点击您要暂停的 Postgres ClickPipe。
2. 前往 **设置** 选项卡。
3. 点击 **暂停** 按钮。

<Image img={pause_button} border size='md' />

4. 将弹出确认对话框。再次点击暂停。

<Image img={pause_dialog} border size='md' />

4. 前往 **指标** 选项卡。
5. 大约 5 秒后(或刷新页面后),管道状态应显示为 **已暂停**。

:::warning
暂停 Postgres ClickPipe 不会停止复制槽的增长。
:::

<Image img={pause_status} border size='md' />


## 恢复 Postgres ClickPipe 的步骤 {#resume-clickpipe-steps}

1. 在"数据源"选项卡中,点击您要恢复的 Postgres ClickPipe。镜像的初始状态应为 **已暂停**。
2. 前往 **设置** 选项卡。
3. 点击 **恢复** 按钮。

<Image img={resume_button} border size='md' />

4. 将弹出确认对话框。再次点击"恢复"。

<Image img={resume_dialog} border size='md' />

5. 前往 **指标** 选项卡。
6. 大约 5 秒后(或刷新页面后),管道状态应变为 **运行中**。
