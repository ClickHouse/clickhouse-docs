---
title: 'Postgres ClickPipe の同期を制御する'
description: 'Postgres ClickPipe の同期を制御するためのガイド'
slug: /integrations/clickpipes/postgres/sync_control
sidebar_label: '同期の制御'
keywords: ['同期制御', 'postgres', 'clickpipes', 'バッチサイズ', '同期間隔']
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

このドキュメントでは、ClickPipe が **CDC（実行中）モード**のときに Postgres ClickPipe の同期を制御する方法を説明します。

## 概要 {#overview}

データベース用 ClickPipes のアーキテクチャは、ソースデータベースからのプル処理とターゲットデータベースへのプッシュ処理という 2 つの並列プロセスで構成されています。プル処理は、データをどのくらいの頻度で、そして一度にどのくらいの量をプルするかを定義する同期設定（sync configuration）によって制御されます。ここで「一度に」とは 1 バッチを意味します。ClickPipe はデータをバッチ単位でプルおよびプッシュするためです。

Postgres ClickPipe の同期を制御する主な方法は 2 つあります。ClickPipe は、以下のいずれかの設定条件を満たしたタイミングでプッシュを開始します。

### 同期間隔 {#interval}

パイプの同期間隔は、ClickPipe がソースデータベースからレコードをプルする時間（秒）です。ClickHouse へプッシュする時間は、この間隔には含まれません。

デフォルトは **1 分** です。
同期間隔は任意の正の整数値に設定できますが、10 秒以上に保つことを推奨します。

### プルバッチサイズ {#batch-size}

プルバッチサイズは、ClickPipe が 1 バッチでソースデータベースからプルするレコード数です。ここでいうレコードとは、パイプの対象テーブルに対して実行された insert、update、delete を指します。

デフォルトは **100,000** レコードです。
安全な上限は 1,000 万 レコードです。

### 例外: ソース側の長時間実行トランザクション {#transactions}

トランザクションがソースデータベース上で実行されている場合、ClickPipe はそのトランザクションの COMMIT を受信するまで処理を進めずに待機します。この動作は、同期間隔とプルバッチサイズの両方よりも優先されます。

### 同期設定の構成 {#configuring}

同期間隔とプルバッチサイズは、ClickPipe の作成時または既存の ClickPipe の編集時に設定できます。
ClickPipe の作成時には、以下のように作成ウィザードの 2 番目のステップで表示されます。

<Image img={create_sync_settings} alt="同期設定の作成" size="md"/>

既存の ClickPipe を編集する場合は、そのパイプの **Settings** タブに移動し、パイプを一時停止してから、ここで **Configure** をクリックします。

<Image img={edit_sync_button} alt="同期設定編集ボタン" size="md"/>

これにより同期設定のフライアウトパネルが開き、同期間隔とプルバッチサイズを変更できます。

<Image img={edit_sync_settings} alt="同期設定を編集" size="md"/>

### レプリケーションスロットの肥大化対策として同期設定を調整する {#tweaking}

ここでは、CDC パイプのレプリケーションスロットが大きくなった場合の対処として、これらの設定をどのように利用するかを説明します。
ClickHouse へのプッシュ時間は、ソースデータベースからのプル時間に対して比例して増えるわけではありません。この特性を利用して、大きなレプリケーションスロットのサイズを削減できます。
同期間隔とプルバッチサイズの両方を増やすことで、ClickPipe はソースデータベースから一度に大量のデータをプルし、その後 ClickHouse へプッシュします。

### 同期制御の動作監視 {#monitoring}

各バッチにどのくらい時間がかかっているかは、ClickPipe の **Metrics** タブにある **CDC Syncs** テーブルで確認できます。ここに表示される duration にはプッシュ時間が含まれる点に注意してください。また、受信行がない場合、ClickPipe は待機し、その待機時間も duration に含まれます。

<Image img={cdc_syncs} alt="CDC Syncs テーブル" size="md"/>