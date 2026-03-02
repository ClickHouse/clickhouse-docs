---
title: 'MySQL ClickPipe の同期を制御する'
description: 'MySQL ClickPipe の同期を制御するためのドキュメント'
slug: /integrations/clickpipes/mysql/sync_control
sidebar_label: '同期の制御'
keywords: ['MySQL ClickPipe', 'ClickPipe 同期の制御', 'MySQL CDC（変更データキャプチャ）レプリケーション', 'ClickHouse MySQL コネクタ', 'ClickHouse へのデータベース同期']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

このドキュメントでは、ClickPipe が **CDC（Running）モード** のときに MySQL ClickPipe の同期を制御する方法を説明します。


## 概要 \{#overview\}

Database ClickPipes は、ソースデータベースからのプル処理と、ターゲットデータベースへのプッシュ処理という 2 つの並行プロセスからなるアーキテクチャになっています。プル処理は同期設定によって制御されており、その設定でデータをどれくらいの頻度でプルするか、また一度にどれだけのデータをプルするかが定義されます。ここで「一度に」とは 1 バッチを意味します。ClickPipe はデータをバッチごとにプルおよびプッシュするためです。

MySQL ClickPipe の同期を制御する主な方法は 2 つあります。以下のいずれかの設定が有効になると、ClickPipe はプッシュを開始します。

### 同期間隔 \{#interval\}

パイプの同期間隔は、ClickPipe がソースデータベースからレコードをプルする時間（秒）です。ClickHouse に取得したデータをプッシュする時間は、この間隔には含まれません。

デフォルトは **1 分** です。
同期間隔には任意の正の整数値を設定できますが、10 秒以上に設定することを推奨します。

### プルバッチサイズ \{#batch-size\}

プルバッチサイズは、ClickPipe がソースデータベースから 1 回のバッチで取得するレコード数です。ここでのレコードとは、そのパイプの対象となっているテーブルに対して実行された insert、update、delete を指します。

デフォルトは **100,000** レコードです。
安全な最大値は 1,000 万です。

### 例外：ソース側の長時間実行トランザクション \{#transactions\}

トランザクションがソースデータベース上で実行されると、ClickPipe はそのトランザクションの COMMIT を受信するまで待機してから、処理を先に進めます。この挙動により、同期間隔とプル バッチサイズの両方の設定は**上書き**されます。

### 同期設定の構成 \{#configuring\}

ClickPipe を新規作成する場合や既存の ClickPipe を編集する場合に、同期間隔と pull バッチサイズを設定できます。
ClickPipe を作成する際は、以下に示すように、作成ウィザードの 2 番目のステップでこれらの設定を行います。

<Image img={create_sync_settings} alt="Create sync settings" size="md"/>

既存の ClickPipe を編集する場合は、対象の ClickPipe の **Settings** タブを開き、パイプを一時停止してから、ここで **Configure** をクリックします。

<Image img={edit_sync_button} alt="Edit sync button" size="md"/>

これにより同期設定用のフライアウトが開き、同期間隔と pull バッチサイズを変更できます。

<Image img={edit_sync_settings} alt="Edit sync settings" size="md"/>

### 同期制御の挙動の監視 \{#monitoring\}

各バッチの処理にどれくらい時間がかかったかは、ClickPipe の **Metrics** タブにある **CDC Syncs** テーブルで確認できます。ここでの所要時間にはデータをプッシュする時間が含まれるほか、取り込む行がない場合に ClickPipe が待機している時間も含まれます。

<Image img={cdc_syncs} alt="CDC Syncs テーブル" size="md"/>