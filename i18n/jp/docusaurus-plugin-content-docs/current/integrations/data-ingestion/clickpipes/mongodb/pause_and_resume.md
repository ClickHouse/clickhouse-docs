---
'title': 'MongoDB ClickPipeの一時停止と再開'
'description': 'MongoDB ClickPipeの一時停止と再開'
'sidebar_label': 'テーブルを一時停止'
'slug': '/integrations/clickpipes/mongodb/pause_and_resume'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

MongoDB ClickPipeを一時停止することが有用なシナリオがあります。たとえば、静的な状態で既存のデータに対して分析を実行したい場合や、MongoDBのアップグレードを行っている場合です。以下は、MongoDB ClickPipeを一時停止および再開する方法です。

## MongoDB ClickPipeを一時停止する手順 {#pause-clickpipe-steps}

1. データソースタブで、一時停止したいMongoDB ClickPipeをクリックします。
2. **設定**タブに移動します。
3. **一時停止**ボタンをクリックします。

<Image img={pause_button} border size="md"/>

4. 確認のためのダイアログボックスが表示されます。再度、一時停止をクリックします。

<Image img={pause_dialog} border size="md"/>

5. **メトリック**タブに移動します。
6. パイプのステータスが**一時停止**になるのを待ちます。

<Image img={pause_status} border size="md"/>

## MongoDB ClickPipeを再開する手順 {#resume-clickpipe-steps}
1. データソースタブで、再開したいMongoDB ClickPipeをクリックします。ミラーのステータスは最初は**一時停止**である必要があります。
2. **設定**タブに移動します。
3. **再開**ボタンをクリックします。

<Image img={resume_button} border size="md"/>

4. 確認のためのダイアログボックスが表示されます。再度、再開をクリックします。

<Image img={resume_dialog} border size="md"/>

5. **メトリック**タブに移動します。
6. パイプのステータスが**実行中**になるのを待ちます。
