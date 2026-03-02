---
title: 'MongoDB ClickPipe の同期の制御'
description: 'MongoDB ClickPipe の同期を制御する方法についてのドキュメント'
slug: /integrations/clickpipes/mongodb/sync_control
sidebar_label: '同期の制御'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

このドキュメントでは、ClickPipe が **CDC（Running）モード** で動作している場合に、MongoDB ClickPipe の同期を制御する方法について説明します。


## 概要 \{#overview\}

Database ClickPipes のアーキテクチャは、ソースデータベースからのプルとターゲットデータベースへのプッシュという 2 つの並行プロセスで構成されています。プル処理は同期構成によって制御されており、どのくらいの頻度でデータをプルするか、また一度にどれだけのデータをプルするかが定義されます。ここで「一度に」とは 1 バッチを意味します。ClickPipe はデータをバッチ単位でプルおよびプッシュするためです。

MongoDB ClickPipe の同期を制御する主な方法は 2 つあります。以下のいずれかの設定条件を満たすと、ClickPipe はプッシュを開始します。

### 同期間隔 \{#interval\}

パイプの同期間隔は、ClickPipe がソースデータベースからレコードを取得する時間（秒）です。ClickHouse へデータをプッシュするのにかかる時間は、この間隔には含まれません。

デフォルトは **1 分** です。
同期間隔には任意の正の整数値を設定できますが、10 秒以上に保つことを推奨します。

### プルバッチサイズ \{#batch-size\}

プルバッチサイズは、ClickPipe がソースデータベースから 1 回のバッチで取得するレコード数です。ここでいうレコードとは、そのパイプに含まれるコレクションに対して実行された insert、update、delete を指します。

デフォルトは **100,000** レコードです。
安全な最大値は 1,000 万レコードです。

### 同期設定の構成 \{#configuring\}

ClickPipe を作成する際、または既存の ClickPipe を編集する際に、同期間隔とプルのバッチサイズを設定できます。
ClickPipe を新規作成する場合は、以下のように作成ウィザードの 2 番目のステップでこれらの設定が表示されます。

<Image img={create_sync_settings} alt="Create sync settings" size="md"/>

既存の ClickPipe を編集する場合は、そのパイプの **Settings** タブを開き、パイプを一時停止してから、ここで **Configure** をクリックします。

<Image img={edit_sync_button} alt="Edit sync button" size="md"/>

すると同期設定用のフライアウトパネルが開き、同期間隔とプルのバッチサイズを変更できます。

<Image img={edit_sync_settings} alt="Edit sync settings" size="md"/>

### 同期制御の動作の監視 \{#monitoring\}

各バッチの処理にどれくらい時間がかかっているかは、ClickPipe の **Metrics** タブにある **CDC Syncs** テーブルで確認できます。ここでの時間にはデータのプッシュに要する時間も含まれており、新しい行が到着しない場合には ClickPipe が待機し、その待機時間も同様に含まれます。

<Image img={cdc_syncs} alt="CDC Syncs table" size="md"/>