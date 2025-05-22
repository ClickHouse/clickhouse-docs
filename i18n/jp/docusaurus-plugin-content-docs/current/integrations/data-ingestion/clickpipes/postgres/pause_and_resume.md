---
'title': 'Postgres ClickPipeの一時停止と再開'
'description': 'Postgres ClickPipeの一時停止と再開'
'sidebar_label': 'テーブルの一時停止'
'slug': '/integrations/clickpipes/postgres/pause_and_resume'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

There are scenarios where it would be useful to pause a Postgres ClickPipe. For example, you may want to run some analytics on existing data in a static state. Or, you might be performing upgrades on Postgres. Here is how you can pause and resume a Postgres ClickPipe.

## Steps to pause a Postgres ClickPipe {#pause-clickpipe-steps}

1. データソースタブで、停止したいPostgres ClickPipeをクリックします。
2. **設定**タブに移動します。
3. **一時停止**ボタンをクリックします。
<br/>

<Image img={pause_button} border size="md"/>

4. 確認のためのダイアログボックスが表示されます。再度、一時停止をクリックします。
<br/>

<Image img={pause_dialog} border size="md"/>

4. **メトリクス**タブに移動します。
5. 約5秒後（ページを更新すると）、パイプの状態が**一時停止**と表示されるはずです。
<br/>

<Image img={pause_status} border size="md"/>

## Steps to resume a Postgres ClickPipe {#resume-clickpipe-steps}
1. データソースタブで、再開したいPostgres ClickPipeをクリックします。ミラーの状態は最初は**一時停止**です。
2. **設定**タブに移動します。
3. **再開**ボタンをクリックします。
<br/>

<Image img={resume_button} border size="md"/>

4. 確認のためのダイアログボックスが表示されます。再度、再開をクリックします。
<br/>

<Image img={resume_dialog} border size="md"/>

5. **メトリクス**タブに移動します。
6. 約5秒後（ページを更新すると）、パイプの状態が**実行中**と表示されるはずです。
