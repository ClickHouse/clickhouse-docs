---
title: 'MySQL ClickPipe の一時停止と再開'
description: 'MySQL ClickPipe の一時停止と再開'
sidebar_label: 'テーブルの一時停止'
slug: /integrations/clickpipes/mysql/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

MySQL ClickPipe を一時停止できると便利なケースがいくつかあります。たとえば、既存データを静的な状態のまま分析したい場合や、MySQL のアップグレードを実行している場合などです。ここでは、MySQL ClickPipe を一時停止および再開する方法を説明します。


## MySQL ClickPipeを一時停止する手順 {#pause-clickpipe-steps}

1. Data Sourcesタブで、一時停止したいMySQL ClickPipeをクリックします。
2. **Settings**タブに移動します。
3. **Pause**ボタンをクリックします。

<Image img={pause_button} border size='md' />

4. 確認用のダイアログボックスが表示されます。再度Pauseをクリックします。

<Image img={pause_dialog} border size='md' />

4. **Metrics**タブに移動します。
5. 約5秒後(またはページを更新した際)、パイプのステータスが**Paused**になります。

<Image img={pause_status} border size='md' />


## MySQL ClickPipeを再開する手順 {#resume-clickpipe-steps}

1. Data Sourcesタブで、再開したいMySQL ClickPipeをクリックします。ミラーのステータスは初期状態では**Paused**になっています。
2. **Settings**タブに移動します。
3. **Resume**ボタンをクリックします。

<Image img={resume_button} border size='md' />

4. 確認用のダイアログボックスが表示されます。再度**Resume**をクリックします。

<Image img={resume_dialog} border size='md' />

5. **Metrics**タブに移動します。
6. 約5秒後(ページを更新した場合も同様)、パイプのステータスが**Running**になります。
