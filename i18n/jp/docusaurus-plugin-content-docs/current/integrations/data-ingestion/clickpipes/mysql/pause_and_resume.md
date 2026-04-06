---
title: 'MySQL ClickPipe の一時停止と再開'
description: 'MySQL ClickPipe の一時停止と再開'
sidebar_label: 'テーブルの一時停止'
slug: /integrations/clickpipes/mysql/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'CDC', 'データインジェスト', 'リアルタイム同期']
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

MySQL ClickPipe を一時停止すると便利な場面があります。たとえば、既存のデータを変化のない状態で分析したい場合です。あるいは、MySQL のアップグレードを行っている場合もあります。以下では、MySQL ClickPipe を一時停止してから再開する方法を説明します。

## MySQL ClickPipe を一時停止する手順 \{#pause-clickpipe-steps\}

1. **Data Sources** タブで、一時停止する MySQL ClickPipe をクリックします。
2. **Settings** タブに移動します。
3. **Pause** ボタンをクリックします。

<Image img={pause_button} border size="md" />

4. 確認ダイアログが表示されるので、もう一度 **Pause** をクリックします。

<Image img={pause_dialog} border size="md" />

4. **Metrics** タブに移動します。
5. 約 5 秒後 (またはページを更新すると) 、パイプのステータスが **Paused** になります。

<Image img={pause_status} border size="md" />

## MySQL ClickPipe を再開する手順 \{#resume-clickpipe-steps\}

1. **Data Sources** タブで、再開する MySQL ClickPipe をクリックします。最初は、ミラーのステータスが **Paused** になっているはずです。
2. **Settings** タブに移動します。
3. **Resume** ボタンをクリックします。

<Image img={resume_button} border size="md" />

4. 確認ダイアログが表示されます。再度 **Resume** をクリックします。

<Image img={resume_dialog} border size="md" />

5. **Metrics** タブに移動します。
6. 約 5 秒後 (またはページを更新すると) 、パイプのステータスが **Running** になるはずです。