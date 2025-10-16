---
'title': 'MySQL ClickPipe の同期制御'
'description': 'MySQL ClickPipe の同期を制御するためのドキュメント'
'slug': '/integrations/clickpipes/mysql/sync_control'
'sidebar_label': '同期制御'
'doc_type': 'guide'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

この文書は、ClickPipeが**CDC（実行中）モード**にあるときに、MySQL ClickPipeの同期を制御する方法を説明しています。

## 概要 {#overview}

データベースのClickPipesは、ソースデータベースからデータをプルし、ターゲットデータベースにプッシュする2つの並行プロセスからなるアーキテクチャを持っています。プルプロセスは、データをどのくらいの頻度でプルし、1回にどれだけのデータをプルするかを定義する同期設定によって制御されます。「1回に」とは、バッチを意味します。ClickPipeはバッチでデータをプルしてプッシュします。

MySQL ClickPipeの同期を制御する主な方法は2つあります。以下の設定のいずれかが有効になると、ClickPipeはプッシュを開始します。

### 同期間隔 {#interval}

パイプの同期間隔は、ClickPipeがソースデータベースからレコードをプルする時間（秒単位）を示します。ClickHouseにプッシュするまでの時間はこの間隔には含まれません。

デフォルトは**1分**です。
同期間隔は任意の正の整数値に設定できますが、10秒以上を維持することが推奨されます。

### プルバッチサイズ {#batch-size}

プルバッチサイズは、ClickPipeがソースデータベースから1回のバッチでプルするレコード数です。レコードとは、パイプの一部であるテーブルで行われた挿入、更新、および削除を意味します。

デフォルトは**100,000**レコードです。
安全な最大値は1000万です。

### 例外：ソースでの長期間のトランザクション {#transactions}

ソースデータベースでトランザクションが実行されると、ClickPipeはトランザクションのCOMMITを受信するまで待機します。これは、**同期間隔**と**プルバッチサイズ**の両方を上書きします。

### 同期設定の構成 {#configuring}

ClickPipeを作成する際や既存のClickPipeを編集する際に、同期間隔とプルバッチサイズを設定できます。
ClickPipeを作成する際には、作成ウィザードの2番目のステップで見ることができます。以下のように示されています：

<Image img={create_sync_settings} alt="同期設定の作成" size="md"/>

既存のClickPipeを編集する場合は、パイプの**設定**タブに移動し、パイプを一時停止してから**構成**をクリックします：

<Image img={edit_sync_button} alt="同期ボタンの編集" size="md"/>

ここで同期設定が表示され、同期間隔とプルバッチサイズを変更できます：

<Image img={edit_sync_settings} alt="同期設定の編集" size="md"/>

### 同期制御の動作の監視 {#monitoring}

ClickPipeの**メトリクス**タブにある**CDC Syncs**テーブルで、各バッチにかかる時間を確認できます。ここでの時間にはプッシュ時間も含まれ、行が入らない場合はClickPipeが待機し、その待機時間も期間に含まれます。

<Image img={cdc_syncs} alt="CDC Syncsテーブル" size="md"/>
