---
title: 'Postgres ClickPipeの一時停止と再開'
description: 'Postgres ClickPipeの一時停止と再開'
sidebar_label: 'テーブルの一時停止'
slug: /integrations/clickpipes/postgres/pause_and_resume
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'


Postgres ClickPipeを一時停止することが有用なシナリオがあります。例えば、静的な状態の既存データに対して分析を実行したい場合や、Postgresのアップグレードを行う場合です。以下は、Postgres ClickPipeを一時停止および再開する方法です。

## Postgres ClickPipeを一時停止する手順 {#pause-clickpipe-steps}

1. データソースタブで、一時停止したいPostgres ClickPipeをクリックします。
2. **設定**タブに移動します。
3. **一時停止**ボタンをクリックします。
<br/>

<Image img={pause_button} border size="md"/>

4. 確認用のダイアログボックスが表示されます。もう一度一時停止をクリックします。
<br/>

<Image img={pause_dialog} border size="md"/>

5. **メトリクス**タブに移動します。
6. 約5秒後（およびページをリフレッシュすると）、パイプのステータスが**一時停止**として表示されるはずです。
<br/>

<Image img={pause_status} border size="md"/>

## Postgres ClickPipeを再開する手順 {#resume-clickpipe-steps}
1. データソースタブで、再開したいPostgres ClickPipeをクリックします。ミラーのステータスは最初は**一時停止**になっています。
2. **設定**タブに移動します。
3. **再開**ボタンをクリックします。
<br/>

<Image img={resume_button} border size="md"/>

4. 確認用のダイアログボックスが表示されます。もう一度再開をクリックします。
<br/>

<Image img={resume_dialog} border size="md"/>

5. **メトリクス**タブに移動します。
6. 約5秒後（およびページをリフレッシュすると）、パイプのステータスが**稼働中**として表示されるはずです。
