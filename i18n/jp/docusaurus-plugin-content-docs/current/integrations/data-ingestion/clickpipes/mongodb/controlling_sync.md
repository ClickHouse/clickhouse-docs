---
'title': 'MongoDB ClickPipeの同期制御'
'description': 'MongoDB ClickPipeの同期を制御するためのドキュメント'
'slug': '/integrations/clickpipes/mongodb/sync_control'
'sidebar_label': '同期の制御'
'doc_type': 'guide'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

この文書では、ClickPipeが**CDC (Running) モード**にあるときにMongoDB ClickPipeの同期を制御する方法について説明します。

## 概要 {#overview}

データベース ClickPipeは、ソースデータベースからのデータ取得とターゲットデータベースへのデータ送信の2つの並行プロセスで構成されたアーキテクチャを持っています。データ取得プロセスは、データをどのくらいの頻度で取得し、一度にどのくらいのデータを取得するかを定義する同期設定によって制御されます。「一度に」とは、一つのバッチを意味します - ClickPipeはデータをバッチ単位で取得し送信します。

MongoDB ClickPipeの同期を制御する主な方法は2つあります。以下の設定のいずれかが発動すると、ClickPipeはデータの送信を開始します。

### 同期間隔 {#interval}

パイプの同期間隔とは、ClickPipeがソースデータベースからレコードを取得する時間（秒単位）です。ClickHouseにデータを送信する時間はこの間隔には含まれません。

デフォルトは**1分**です。
同期間隔は任意の正の整数値に設定できますが、10秒以上に保つことが推奨されます。

### 取り込みバッチサイズ {#batch-size}

取り込みバッチサイズは、ClickPipeがソースデータベースから一度に取得するレコードの数です。レコードとは、パイプの一部であるコレクションに対して行われた挿入、更新、および削除を意味します。

デフォルトは**100,000**レコードです。
安全な最大値は1000万です。

### 同期設定の構成 {#configuring}

ClickPipeを作成する際や既存のClickPipeを編集する際に、同期間隔と取り込みバッチサイズを設定できます。
ClickPipeを作成する際は、作成ウィザードの第2ステップでそれを見ることができます。以下のように表示されます：

<Image img={create_sync_settings} alt="同期設定の作成" size="md"/>

既存のClickPipeを編集する場合は、パイプの**設定**タブに移動し、パイプを一時停止してから**構成**をクリックします：

<Image img={edit_sync_button} alt="同期ボタンの編集" size="md"/>

これにより、同期設定を変更できるフライアウトが開き、同期間隔と取り込みバッチサイズを変更できます：

<Image img={edit_sync_settings} alt="同期設定を編集" size="md"/>

### 同期制御の動作監視 {#monitoring}

各バッチにかかる時間は、ClickPipeの**メトリクス**タブ内の**CDC Syncs**テーブルで確認できます。ここでの期間にはプッシュ時間が含まれ、受信する行がない場合、ClickPipeは待機し、その待機時間も期間に含まれます。

<Image img={cdc_syncs} alt="CDC Syncsテーブル" size="md"/>
