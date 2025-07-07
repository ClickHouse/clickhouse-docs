---
'title': '暂停和恢复 Postgres ClickPipe'
'description': '暂停和恢复 Postgres ClickPipe'
'sidebar_label': '暂停表'
'slug': '/integrations/clickpipes/postgres/pause_and_resume'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

There are scenarios where it would be useful to pause a Postgres ClickPipe. For example, you may want to run some analytics on existing data in a static state. Or, you might be performing upgrades on Postgres. Here is how you can pause and resume a Postgres ClickPipe.

## Steps to pause a Postgres ClickPipe {#pause-clickpipe-steps}

1. 在数据源标签中，点击您希望暂停的 Postgres ClickPipe。
2. 转到 **设置** 标签。
3. 点击 **暂停** 按钮。
<br/>

<Image img={pause_button} border size="md"/>

4. 将出现确认对话框。再次点击暂停。
<br/>

<Image img={pause_dialog} border size="md"/>

4. 转到 **指标** 标签。
5. 在大约 5 秒后（也可以在页面刷新时），管道的状态应为 **已暂停**。
<br/>

<Image img={pause_status} border size="md"/>

## Steps to resume a Postgres ClickPipe {#resume-clickpipe-steps}
1. 在数据源标签中，点击您希望恢复的 Postgres ClickPipe。镜像的状态应该最初显示为 **已暂停**。
2. 转到 **设置** 标签。
3. 点击 **恢复** 按钮。
<br/>

<Image img={resume_button} border size="md"/>

4. 将出现确认对话框。再次点击恢复。
<br/>

<Image img={resume_dialog} border size="md"/>

5. 转到 **指标** 标签。
6. 在大约 5 秒后（也可以在页面刷新时），管道的状态应为 **运行中**。
