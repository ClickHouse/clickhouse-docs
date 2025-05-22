---
'title': '暂停和恢复Postgres ClickPipe'
'description': '暂停和恢复Postgres ClickPipe'
'sidebar_label': '暂停表'
'slug': '/integrations/clickpipes/postgres/pause_and_resume'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

在某些情况下，暂停 Postgres ClickPipe 可能会很有用。例如，您可能想对现有数据进行一些分析，使其处于静态状态。或者，您可能正在对 Postgres 进行升级。以下是如何暂停和恢复 Postgres ClickPipe 的步骤。

## 暂停 Postgres ClickPipe 的步骤 {#pause-clickpipe-steps}

1. 在数据源选项卡中，点击您希望暂停的 Postgres ClickPipe。
2. 转到 **设置** 选项卡。
3. 点击 **暂停** 按钮。
<br/>

<Image img={pause_button} border size="md"/>

4. 应该会出现一个确认对话框。再次点击暂停。
<br/>

<Image img={pause_dialog} border size="md"/>

5. 转到 **指标** 选项卡。
6. 大约 5 秒后（以及页面刷新时），管道的状态应该为 **已暂停**。
<br/>

<Image img={pause_status} border size="md"/>

## 恢复 Postgres ClickPipe 的步骤 {#resume-clickpipe-steps}
1. 在数据源选项卡中，点击您希望恢复的 Postgres ClickPipe。镜像的状态最初应该为 **已暂停**。
2. 转到 **设置** 选项卡。
3. 点击 **恢复** 按钮。
<br/>

<Image img={resume_button} border size="md"/>

4. 应该会出现一个确认对话框。再次点击恢复。
<br/>

<Image img={resume_dialog} border size="md"/>

5. 转到 **指标** 选项卡。
6. 大约 5 秒后（以及页面刷新时），管道的状态应该为 **运行中**。
