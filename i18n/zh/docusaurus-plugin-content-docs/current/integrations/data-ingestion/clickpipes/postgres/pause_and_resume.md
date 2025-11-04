---
'title': '暂停和恢复一个 Postgres ClickPipe'
'description': '暂停和恢复一个 Postgres ClickPipe'
'sidebar_label': '暂停表'
'slug': '/integrations/clickpipes/postgres/pause_and_resume'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

在某些情况下，暂停 Postgres ClickPipe 将是有用的。例如，您可能希望对处于静态状态的现有数据进行一些分析。或者，您可能正在对 Postgres 进行升级。以下是如何暂停和恢复 Postgres ClickPipe 的步骤。

## 暂停 Postgres ClickPipe 的步骤 {#pause-clickpipe-steps}

1. 在数据源选项卡中，点击您希望暂停的 Postgres ClickPipe。
2. 转到 **设置** 选项卡。
3. 点击 **暂停** 按钮。

<Image img={pause_button} border size="md"/>

4. 将出现一个确认对话框。再次点击暂停。

<Image img={pause_dialog} border size="md"/>

4. 转到 **指标** 选项卡。
5. 大约 5 秒后（并且在页面刷新时），管道的状态应该是 **已暂停**。

:::warning
暂停 Postgres ClickPipe 不会暂停复制槽的增长。
:::

<Image img={pause_status} border size="md"/>

## 恢复 Postgres ClickPipe 的步骤 {#resume-clickpipe-steps}
1. 在数据源选项卡中，点击您希望恢复的 Postgres ClickPipe。此时镜像的状态应为 **已暂停**。
2. 转到 **设置** 选项卡。
3. 点击 **恢复** 按钮。

<Image img={resume_button} border size="md"/>

4. 将出现一个确认对话框。再次点击恢复。

<Image img={resume_dialog} border size="md"/>

5. 转到 **指标** 选项卡。
6. 大约 5 秒后（并且在页面刷新时），管道的状态应该是 **正在运行**。
