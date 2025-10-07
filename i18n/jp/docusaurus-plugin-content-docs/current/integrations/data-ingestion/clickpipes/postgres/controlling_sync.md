---
'title': 'Postgres ClickPipeの同期制御'
'description': 'Postgres ClickPipeの同期を制御するためのドキュメント'
'slug': '/integrations/clickpipes/postgres/sync_control'
'sidebar_label': '同期の制御'
'doc_type': 'guide'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

このドキュメントでは、ClickPipeが**CDC (実行中) モード**にあるときのPostgres ClickPipeの同期を制御する方法について説明します。

## 概要 {#overview}

データベースのClickPipeは、ソースデータベースからデータをプルし、ターゲットデータベースにプッシュする2つの並行プロセスで構成されるアーキテクチャを持っています。プルプロセスは、データをどのくらいの頻度でプルするか、また一度にどれだけのデータをプルするかを定義した同期設定によって制御されます。「一度に」というのは、バッチを意味します ― ClickPipeはデータをバッチでプルおよびプッシュします。

Postgres ClickPipeの同期を制御する方法は主に2つあります。以下の設定のいずれかが有効になると、ClickPipeはプッシュを開始します。

### 同期間隔 {#interval}

パイプの同期間隔は、ClickPipeがソースデータベースからレコードをプルする時間（秒単位）です。ClickHouseにプッシュするための時間は、この間隔には含まれません。

デフォルトは**1分**です。
同期間隔は任意の正の整数値に設定できますが、10秒以上に保つことを推奨します。

### プルバッチサイズ {#batch-size}

プルバッチサイズは、ClickPipeが一度のバッチでソースデータベースからプルするレコードの数です。レコードとは、パイプの一部であるテーブルで行われた挿入、更新、削除を意味します。

デフォルトは**100,000**レコードです。
安全な最大値は1000万です。

### 例外：ソースでの長時間トランザクション {#transactions}

ソースデータベースでトランザクションが実行されると、ClickPipeはそのトランザクションのCOMMITを受信するまで進行を待ちます。これは、同期間隔とプルバッチサイズの**オーバーライド**を伴います。

### 同期設定の構成 {#configuring}

ClickPipeを作成するか、既存のClickPipeを編集する際に、同期間隔とプルバッチサイズを設定できます。
ClickPipeを作成する際、以下のように作成ウィザードの第2ステップで表示されます。

<Image img={create_sync_settings} alt="同期設定を作成" size="md"/>

既存のClickPipeを編集する際には、パイプの**設定**タブに移動し、パイプを一時停止した後、ここで**構成**をクリックします：

<Image img={edit_sync_button} alt="同期構成ボタンを編集" size="md"/>

これにより、同期設定が表示されるフライアウトが開き、同期間隔とプルバッチサイズを変更できます：

<Image img={edit_sync_settings} alt="同期設定を編集" size="md"/>

### レプリケーションスロットの成長に対応するための同期設定の微調整 {#tweaking}

CDCパイプの大規模なレプリケーションスロットを扱うために、これらの設定を使用する方法についてお話ししましょう。
ClickHouseへのプッシュ時間は、ソースデータベースからのプル時間と線形にスケールしません。これを活用して、大きなレプリケーションスロットのサイズを削減できます。
同期間隔とプルバッチサイズの両方を増やすことで、ClickPipeはソースデータベースから大量のデータを一度にプルし、その後ClickHouseにプッシュします。

### 同期制御の動作を監視する {#monitoring}
ClickPipeの**メトリクス**タブにある**CDC Syncs**テーブルで、各バッチにかかる時間を確認できます。ここでの時間にはプッシュ時間が含まれており、行が入ってこない場合、ClickPipeは待機し、その待機時間も期間に含まれます。

<Image img={cdc_syncs} alt="CDC Syncsテーブル" size="md"/>
