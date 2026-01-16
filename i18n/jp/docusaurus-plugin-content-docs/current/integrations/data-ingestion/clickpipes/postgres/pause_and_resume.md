---
title: 'Postgres ClickPipe の一時停止と再開'
description: 'Postgres ClickPipe の一時停止と再開'
sidebar_label: 'テーブルの一時停止'
slug: /integrations/clickpipes/postgres/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'CDC（変更データキャプチャ）', 'インジェスト', 'リアルタイム同期']
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

Postgres ClickPipe を一時的に停止したほうが便利な場合があります。たとえば、既存データに変更が加わらない静的な状態で分析を行いたい場合や、Postgres のアップグレードを実施している場合などです。ここでは、Postgres ClickPipe を一時停止および再開する方法を説明します。

## Postgres ClickPipe を一時停止する手順 \{#pause-clickpipe-steps\}

1. **Data Sources** タブで、一時停止したい Postgres ClickPipe をクリックします。
2. **Settings** タブを開きます。
3. **Pause** ボタンをクリックします。

<Image img={pause_button} border size="md"/>

4. 確認ダイアログボックスが表示されます。再度 **Pause** をクリックします。

<Image img={pause_dialog} border size="md"/>

4. **Metrics** タブを開きます。
5. 約 5 秒後（またはページを再読み込みしたとき）に、その ClickPipe のステータスが **Paused** になっていることを確認できます。

:::warning
Postgres ClickPipe を一時停止しても、`replication slot` の増加は停止しません。
:::

<Image img={pause_status} border size="md"/>

## Postgres ClickPipe を再開する手順 \{#resume-clickpipe-steps\}

1. **Data Sources** タブで、再開したい Postgres ClickPipe をクリックします。ミラーのステータスは最初は **Paused** になっているはずです。
2. **Settings** タブに移動します。
3. **Resume** ボタンをクリックします。

<Image img={resume_button} border size="md"/>

4. 確認用のダイアログボックスが表示されます。もう一度 **Resume** をクリックします。

<Image img={resume_dialog} border size="md"/>

5. **Metrics** タブに移動します。
6. 約 5 秒後（およびページをリフレッシュした場合）に、ClickPipe のステータスが **Running** になっているはずです。