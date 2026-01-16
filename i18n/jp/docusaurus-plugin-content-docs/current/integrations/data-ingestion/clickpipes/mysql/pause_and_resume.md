---
title: 'MySQL ClickPipe の一時停止と再開'
description: 'MySQL ClickPipe の一時停止と再開'
sidebar_label: 'テーブルの一時停止'
slug: /integrations/clickpipes/mysql/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

MySQL ClickPipe を一時停止できると便利な場面がいくつかあります。たとえば、既存データを静的な状態で分析したい場合や、MySQL のアップグレード作業を行う場合などです。ここでは、MySQL ClickPipe を一時停止および再開する方法を説明します。

## MySQL ClickPipe を一時停止する手順 \\{#pause-clickpipe-steps\\}

1. **Data Sources** タブで、一時停止したい MySQL ClickPipe をクリックします。
2. **Settings** タブに移動します。
3. **Pause** ボタンをクリックします。

<Image img={pause_button} border size="md"/>

4. 確認ダイアログが表示されるので、もう一度 **Pause** をクリックします。

<Image img={pause_dialog} border size="md"/>

4. **Metrics** タブに移動します。
5. 約 5 秒後（ページを再読み込みした場合も同様）、パイプのステータスが **Paused** になっていることを確認できます。

<Image img={pause_status} border size="md"/>

## MySQL ClickPipe を再開する手順 \\{#resume-clickpipe-steps\\}

1. **Data Sources** タブで、再開したい MySQL ClickPipe をクリックします。ミラーのステータスは最初は **Paused** になっているはずです。
2. **Settings** タブに移動します。
3. **Resume** ボタンをクリックします。

<Image img={resume_button} border size="md"/>

4. 確認ダイアログが表示されるので、もう一度 **Resume** をクリックします。

<Image img={resume_dialog} border size="md"/>

5. **Metrics** タブに移動します。
6. 約 5 秒後（またはページを更新した場合）、ClickPipe のステータスが **Running** になっていることを確認します。