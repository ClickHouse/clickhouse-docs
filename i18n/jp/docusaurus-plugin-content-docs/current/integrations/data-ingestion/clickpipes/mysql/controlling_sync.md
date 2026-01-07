---
title: 'MySQL ClickPipe の同期の制御'
description: 'MySQL ClickPipe の同期を制御する方法について説明するドキュメント'
slug: /integrations/clickpipes/mysql/sync_control
sidebar_label: '同期の制御'
keywords: ['MySQL ClickPipe', 'ClickPipe 同期制御', 'MySQL CDC レプリケーション', 'ClickHouse MySQL コネクタ', 'ClickHouse へのデータベース同期']
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

本ドキュメントでは、ClickPipe が **CDC（Running）モード** の場合に、MySQL ClickPipe の同期を制御する方法について説明します。

## 概要 {#overview}

データベース向け ClickPipes のアーキテクチャは、ソースデータベースからのプル処理と、ターゲットデータベースへのプッシュ処理という 2 つの並行したプロセスで構成されています。プル処理は、どのくらいの頻度で、そして一度にどれだけのデータをプルするかを定義する同期設定によって制御されます。ここで「一度に」とは 1 バッチを意味します。ClickPipe はデータをバッチ単位でプルおよびプッシュするためです。

MySQL ClickPipe の同期を制御する主な方法は 2 つあります。以下のいずれかの設定条件を満たすと、ClickPipe はプッシュを開始します。

### 同期間隔 {#interval}

パイプの同期間隔は、ClickPipe がソースデータベースからレコードをプルする時間（秒単位）です。ClickHouse へプッシュするためにかかる時間は、この間隔には含まれません。

デフォルトは **1 分** です。
同期間隔には任意の正の整数値を設定できますが、10 秒以上に保つことを推奨します。

### プルバッチサイズ {#batch-size}

プルバッチサイズは、ClickPipe が 1 回のバッチでソースデータベースからプルするレコード数です。ここでのレコードとは、そのパイプの対象となっているテーブルに対して行われた INSERT、UPDATE、DELETE を指します。

デフォルトは **100,000** レコードです。
安全な最大値は 1,000 万件です。

### 例外: ソース側の長時間実行トランザクション {#transactions}

ソースデータベース上でトランザクションが実行されている場合、ClickPipe はそのトランザクションの COMMIT を受信するまで待機し、その後で次に進みます。この挙動により、同期間隔とプルバッチサイズの両方が**上書き**されます。

### 同期設定の構成 {#configuring}

同期間隔とプルバッチサイズは、ClickPipe の作成時、または既存の ClickPipe の編集時に設定できます。
ClickPipe を作成する際は、以下のように作成ウィザードの 2 番目のステップで設定を確認できます。

<Image img={create_sync_settings} alt="同期設定の作成" size="md"/>

既存の ClickPipe を編集する場合は、そのパイプの **Settings** タブに移動し、パイプを一時停止してから、ここで **Configure** をクリックします。

<Image img={edit_sync_button} alt="同期設定編集ボタン" size="md"/>

これにより同期設定用のフライアウトが開き、同期間隔とプルバッチサイズを変更できます。

<Image img={edit_sync_settings} alt="同期設定を編集" size="md"/>

### 同期制御の挙動の監視 {#monitoring}

各バッチにどのくらい時間がかかったかは、ClickPipe の **Metrics** タブにある **CDC Syncs** テーブルで確認できます。ここでの所要時間にはプッシュ時間も含まれます。また、行が流入してこない場合、ClickPipe は待機し、その待機時間も所要時間に含まれます。

<Image img={cdc_syncs} alt="CDC Syncs テーブル" size="md"/>