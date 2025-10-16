---
'title': '暂停和恢复 MongoDB ClickPipe'
'description': '暂停和恢复 MongoDB ClickPipe'
'sidebar_label': '暂停表'
'slug': '/integrations/clickpipes/mongodb/pause_and_resume'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

在某些场景中，暂停 MongoDB ClickPipe 是很有用的。例如，您可能希望在静态状态下对现有数据进行一些分析，或者您可能正在对 MongoDB 进行升级。以下是如何暂停和恢复 MongoDB ClickPipe 的步骤。

## 暂停 MongoDB ClickPipe 的步骤 {#pause-clickpipe-steps}

1. 在数据源选项卡中，点击您希望暂停的 MongoDB ClickPipe。
2. 前往 **设置** 选项卡。
3. 点击 **暂停** 按钮。

<Image img={pause_button} border size="md"/>

4. 应出现一个确认对话框。再次点击暂停。

<Image img={pause_dialog} border size="md"/>

5. 前往 **指标** 选项卡。
6. 等待管道状态变为 **暂停**。

<Image img={pause_status} border size="md"/>

## 恢复 MongoDB ClickPipe 的步骤 {#resume-clickpipe-steps}
1. 在数据源选项卡中，点击您希望恢复的 MongoDB ClickPipe。镜像的状态最初应该为 **暂停**。
2. 前往 **设置** 选项卡。
3. 点击 **恢复** 按钮。

<Image img={resume_button} border size="md"/>

4. 应出现一个确认对话框。再次点击恢复。

<Image img={resume_dialog} border size="md"/>

5. 前往 **指标** 选项卡。
6. 等待管道状态变为 **运行**。
