---
'title': 'MySQL ClickPipeの一時停止と再開'
'description': 'MySQL ClickPipeの一時停止と再開'
'sidebar_label': 'テーブルを一時停止'
'slug': '/integrations/clickpipes/mysql/pause_and_resume'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

MySQL ClickPipeを一時停止する必要があるシナリオがあります。たとえば、静的な状態の既存データに対して分析を実行したい場合や、MySQLのアップグレードを行っている場合です。ここでは、MySQL ClickPipeを一時停止および再開する方法を説明します。

## MySQL ClickPipeを一時停止する手順 {#pause-clickpipe-steps}

1. データソースタブで、一時停止したいMySQL ClickPipeをクリックします。
2. **設定**タブに移動します。
3. **一時停止**ボタンをクリックします。

<Image img={pause_button} border size="md"/>

4. 確認のためのダイアログボックスが表示されるはずです。再度「一時停止」をクリックします。

<Image img={pause_dialog} border size="md"/>

4. **メトリクス**タブに移動します。
5. 約5秒後（またはページを再読み込みすると）、パイプのステータスが**一時停止**になるはずです。

<Image img={pause_status} border size="md"/>

## MySQL ClickPipeを再開する手順 {#resume-clickpipe-steps}
1. データソースタブで、再開したいMySQL ClickPipeをクリックします。ミラーのステータスは最初は**一時停止**のはずです。
2. **設定**タブに移動します。
3. **再開**ボタンをクリックします。

<Image img={resume_button} border size="md"/>

4. 確認のためのダイアログボックスが表示されるはずです。再度「再開」をクリックします。

<Image img={resume_dialog} border size="md"/>

5. **メトリクス**タブに移動します。
6. 約5秒後（またはページを再読み込みすると）、パイプのステータスが**実行中**になるはずです。
