---
title: 'MongoDB ClickPipe の同期の制御'
description: 'MongoDB ClickPipe の同期制御に関するドキュメント'
slug: /integrations/clickpipes/mongodb/sync_control
sidebar_label: '同期の制御'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

このドキュメントでは、ClickPipe が **CDC (Running) モード** のときに MongoDB ClickPipe の同期を制御する方法を説明します。


## 概要 {#overview}

データベースClickPipesは、ソースデータベースからのプル処理とターゲットデータベースへのプッシュ処理という2つの並列プロセスで構成されるアーキテクチャを持っています。プル処理は、データをどのくらいの頻度でプルするか、および一度にどのくらいのデータをプルするかを定義する同期設定によって制御されます。「一度に」とは1バッチを意味します。ClickPipeはデータをバッチ単位でプルおよびプッシュするためです。

MongoDBのClickPipeの同期を制御する主な方法は2つあります。以下の設定のいずれかが発動すると、ClickPipeはプッシュを開始します。

### 同期間隔 {#interval}

パイプの同期間隔は、ClickPipeがソースデータベースからレコードをプルする時間(秒単位)です。ClickHouseへのプッシュにかかる時間は、この間隔には含まれません。

デフォルトは**1分**です。
同期間隔は任意の正の整数値に設定できますが、10秒以上に保つことを推奨します。

### プルバッチサイズ {#batch-size}

プルバッチサイズは、ClickPipeが1バッチでソースデータベースからプルするレコード数です。レコードとは、パイプの対象となるコレクションに対して実行された挿入、更新、削除を意味します。

デフォルトは**100,000**レコードです。
安全な最大値は1,000万です。

### 同期設定の構成 {#configuring}

ClickPipeを作成する際、または既存のClickPipeを編集する際に、同期間隔とプルバッチサイズを設定できます。
ClickPipeを作成する場合、以下に示すように作成ウィザードの2番目のステップで表示されます:

<Image img={create_sync_settings} alt='同期設定の作成' size='md' />

既存のClickPipeを編集する場合は、パイプの**Settings**タブに移動し、パイプを一時停止してから、ここで**Configure**をクリックします:

<Image img={edit_sync_button} alt='同期編集ボタン' size='md' />

これにより同期設定のフライアウトが開き、同期間隔とプルバッチサイズを変更できます:

<Image img={edit_sync_settings} alt='同期設定の編集' size='md' />

### 同期制御動作の監視 {#monitoring}

各バッチにかかる時間は、ClickPipeの**Metrics**タブにある**CDC Syncs**テーブルで確認できます。ここでの期間にはプッシュ時間が含まれており、また受信する行がない場合、ClickPipeは待機し、その待機時間も期間に含まれることに注意してください。

<Image img={cdc_syncs} alt='CDC Syncsテーブル' size='md' />
