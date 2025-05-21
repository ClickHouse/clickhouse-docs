---
'title': '暂停和恢复 PostgreSQL ClickPipe'
'description': '暂停和恢复 PostgreSQL ClickPipe'
'sidebar_label': '暂停表'
'slug': '/integrations/clickpipes/postgres/pause_and_resume'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

在某些情况下，暂停一个 Postgres ClickPipe 是有用的。例如，您可能想要在静态状态下对现有数据进行一些分析，或者您可能在对 Postgres 进行升级。下面是如何暂停和恢复 Postgres ClickPipe 的方法。

## 暂停 Postgres ClickPipe 的步骤 {#pause-clickpipe-steps}

1. 在数据源标签中，点击您希望暂停的 Postgres ClickPipe。
2. 转到 **设置** 标签。
3. 点击 **暂停** 按钮。
<br/>

<Image img={pause_button} border size="md"/>

4. 将出现一个确认对话框。再次点击暂停。
<br/>

<Image img={pause_dialog} border size="md"/>

5. 转到 **指标** 标签。
6. 大约在 5 秒后（以及在页面刷新时），管道的状态应该是 **暂停**。
<br/>

<Image img={pause_status} border size="md"/>

## 恢复 Postgres ClickPipe 的步骤 {#resume-clickpipe-steps}

1. 在数据源标签中，点击您希望恢复的 Postgres ClickPipe。镜像的状态最初应该是 **暂停**。
2. 转到 **设置** 标签。
3. 点击 **恢复** 按钮。
<br/>

<Image img={resume_button} border size="md"/>

4. 将出现一个确认对话框。再次点击恢复。
<br/>

<Image img={resume_dialog} border size="md"/>

5. 转到 **指标** 标签。
6. 大约在 5 秒后（以及在页面刷新时），管道的状态应该是 **运行中**。
