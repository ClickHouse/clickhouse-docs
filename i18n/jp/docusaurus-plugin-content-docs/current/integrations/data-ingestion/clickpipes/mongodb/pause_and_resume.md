---
title: 'MongoDB ClickPipe の一時停止と再開'
description: 'MongoDB ClickPipe の一時停止と再開'
sidebar_label: 'テーブルの一時停止'
slug: /integrations/clickpipes/mongodb/pause_and_resume
doc_type: 'guide'
keywords: ['ClickPipes', 'MongoDB', 'CDC', 'データのインジェスト', 'リアルタイム同期']
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

MongoDB ClickPipe を一時停止できると便利な状況がいくつかあります。たとえば、既存データを静的な状態のままで分析したい場合があります。また、MongoDB のアップグレード作業を行っている場合もあるでしょう。ここでは、MongoDB ClickPipe を一時停止および再開する方法を説明します。

## MongoDB ClickPipe を一時停止する手順 {#pause-clickpipe-steps}

1. **Data Sources** タブで、一時停止したい MongoDB ClickPipe をクリックします。
2. **Settings** タブを開きます。
3. **Pause** ボタンをクリックします。

<Image img={pause_button} border size="md"/>

4. 確認ダイアログボックスが表示されるので、もう一度 **Pause** をクリックします。

<Image img={pause_dialog} border size="md"/>

4. **Metrics** タブを開きます。
5. ClickPipe のステータスが **Paused** になるまで待ちます。

<Image img={pause_status} border size="md"/>

## MongoDB ClickPipe を再開する手順 {#resume-clickpipe-steps}

1. **Data Sources** タブで、再開したい MongoDB ClickPipe をクリックします。ミラーのステータスは最初は **Paused** になっています。
2. **Settings** タブに移動します。
3. **Resume** ボタンをクリックします。

<Image img={resume_button} border size="md"/>

4. 確認ダイアログが表示されるので、もう一度 **Resume** をクリックします。

<Image img={resume_dialog} border size="md"/>

5. **Metrics** タブに移動します。
6. ClickPipe のステータスが **Running** になるまで待ちます。