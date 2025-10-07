---
'title': '暂停和恢复 MySQL ClickPipe'
'description': '暂停和恢复 MySQL ClickPipe'
'sidebar_label': '暂停表'
'slug': '/integrations/clickpipes/mysql/pause_and_resume'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

在某些情况下，暂停 MySQL ClickPipe 会很有用。例如，您可能希望对静态状态下的现有数据进行一些分析。或者，您可能正在对 MySQL 进行升级。以下是如何暂停和恢复 MySQL ClickPipe 的步骤。

## 暂停 MySQL ClickPipe 的步骤 {#pause-clickpipe-steps}

1. 在数据源选项卡中，点击您希望暂停的 MySQL ClickPipe。
2. 进入 **设置** 选项卡。
3. 点击 **暂停** 按钮。

<Image img={pause_button} border size="md"/>

4. 应该会出现一个确认对话框。再次点击暂停。

<Image img={pause_dialog} border size="md"/>

4. 进入 **指标** 选项卡。
5. 在大约 5 秒后（以及页面刷新时），管道的状态应为 **已暂停**。

<Image img={pause_status} border size="md"/>

## 恢复 MySQL ClickPipe 的步骤 {#resume-clickpipe-steps}
1. 在数据源选项卡中，点击您希望恢复的 MySQL ClickPipe。镜像的初始状态应为 **已暂停**。
2. 进入 **设置** 选项卡。
3. 点击 **恢复** 按钮。

<Image img={resume_button} border size="md"/>

4. 应该会出现一个确认对话框。再次点击恢复。

<Image img={resume_dialog} border size="md"/>

5. 进入 **指标** 选项卡。
6. 在大约 5 秒后（以及页面刷新时），管道的状态应为 **运行中**。
