---
title: 'Postgres ClickPipe の同期を制御する'
description: 'Postgres ClickPipe の同期制御について説明するドキュメント'
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

このドキュメントでは、ClickPipe が **CDC（Running）モード** のときに、Postgres 用 ClickPipe の同期を制御する方法について説明します。


## 概要 \{#overview\}

Database ClickPipes のアーキテクチャは、ソースデータベースからのプル処理とターゲットデータベースへのプッシュ処理という 2 つの並行プロセスで構成されています。プル処理は、データをどの程度の頻度で取得するか、また 1 回あたりにどれくらいの量のデータを取得するかを定義する同期設定によって制御されます。ここで「1 回あたり」とは 1 バッチを意味します。ClickPipe はデータをバッチ単位でプルおよびプッシュするためです。

Postgres ClickPipe の同期を制御する主な方法は 2 つあります。以下のいずれかの設定条件を満たすと、ClickPipe はプッシュ処理を開始します。

### 同期間隔 \{#interval\}

パイプの同期間隔は、ClickPipe がソースデータベースからレコードを取得する時間（秒）です。ClickHouse へのプッシュ処理に要する時間は、この間隔には含まれません。

デフォルトは **1 分** です。
同期間隔には任意の正の整数値を設定できますが、10 秒以上に設定することを推奨します。

### Pull batch size \{#batch-size\}

Pull バッチサイズとは、ClickPipe がソースデータベースから 1 回のバッチで取得するレコード数を指します。ここでのレコードとは、パイプの対象となっているテーブルに対して行われた INSERT、UPDATE、DELETE のことです。

デフォルトは **100,000** レコードです。
安全な最大値は 1,000 万です。

### 例外: ソース側での長時間実行のトランザクション \{#transactions\}

トランザクションがソースデータベースで実行されている場合、ClickPipe はそのトランザクションの `COMMIT` を受信するまで先に進まずに待機します。この挙動により、同期間隔とプルバッチサイズの両方の設定が**上書き**されます。

### 同期設定の構成 \{#configuring\}

ClickPipe を新規作成する場合や既存の ClickPipe を編集する場合に、同期間隔と pull バッチサイズを設定できます。
ClickPipe を作成する場合は、以下に示すとおり作成ウィザードの 2 番目のステップで表示されます。

<Image img={create_sync_settings} alt="Create sync settings" size="md"/>

既存の ClickPipe を編集する場合は、そのパイプの **Settings** タブを開き、パイプを一時停止してから、ここで **Configure** をクリックします。

<Image img={edit_sync_button} alt="Edit sync button" size="md"/>

これにより同期設定のフライアウトパネルが開き、同期間隔と pull バッチサイズを変更できます。

<Image img={edit_sync_settings} alt="Edit sync settings" size="md"/>

### レプリケーションスロットの肥大化を抑えるための同期設定の調整 \{#tweaking\}

CDC パイプで大きなレプリケーションスロットが発生した場合に、これらの設定をどのように活用して対処するかを説明します。
ClickHouse へのプッシュに要する時間は、ソースデータベースからのプルに要する時間と線形には比例しません。この特性を利用することで、大きなレプリケーションスロットのサイズを削減できます。
`sync interval` と `pull batch size` の両方を増やすことで、ClickPipe は一度に大量のデータをソースデータベースからプルし、その後 ClickHouse へプッシュするようになります。

### 同期制御の挙動の監視 \{#monitoring\}

各バッチにどれくらい時間がかかっているかは、ClickPipe の **Metrics** タブにある **CDC Syncs** テーブルで確認できます。ここでの時間にはデータのプッシュに要する時間が含まれることに注意してください。また、受信する行がない場合は ClickPipe が待機し、その待機時間もこの時間に含まれます。

<Image img={cdc_syncs} alt="CDC Syncs テーブル" size="md"/>