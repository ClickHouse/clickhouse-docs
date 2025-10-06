---
'title': 'Postgres ClickPipeの一時停止と再開'
'description': 'Postgres ClickPipeの一時停止と再開'
'sidebar_label': 'テーブルの一時停止'
'slug': '/integrations/clickpipes/postgres/pause_and_resume'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

Postgres ClickPipeを一時停止することが有益なシナリオがあります。たとえば、静的な状態で既存データに対していくつかの分析を実行したい場合や、Postgresのアップグレードを行っている場合です。以下は、Postgres ClickPipeを一時停止および再開する方法です。

## Postgres ClickPipeを一時停止する手順 {#pause-clickpipe-steps}

1. データソースタブで、一時停止したいPostgres ClickPipeをクリックします。
2. **設定**タブに移動します。
3. **一時停止**ボタンをクリックします。

<Image img={pause_button} border size="md"/>

4. 確認のためのダイアログボックスが表示されるはずです。もう一度、一時停止をクリックします。

<Image img={pause_dialog} border size="md"/>

4. **メトリクス**タブに移動します。
5. 約5秒後（およびページを更新したときも）、パイプのステータスは**一時停止**になります。

:::warning
Postgres ClickPipeを一時停止しても、レプリケーションスロットの成長は一時停止されません。
:::

<Image img={pause_status} border size="md"/>

## Postgres ClickPipeを再開する手順 {#resume-clickpipe-steps}
1. データソースタブで、再開したいPostgres ClickPipeをクリックします。ミラーのステータスは最初は**一時停止**のはずです。
2. **設定**タブに移動します。
3. **再開**ボタンをクリックします。

<Image img={resume_button} border size="md"/>

4. 確認のためのダイアログボックスが表示されるはずです。もう一度、再開をクリックします。

<Image img={resume_dialog} border size="md"/>

5. **メトリクス**タブに移動します。
6. 約5秒後（およびページを更新したときも）、パイプのステータスは**実行中**になります。
