---
title: 'MongoDB ClickPipe の同期を制御する'
description: 'MongoDB ClickPipe の同期を制御する方法を説明するドキュメント'
slug: /integrations/clickpipes/mongodb/sync_control
sidebar_label: '同期の制御'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'データインジェスト', 'リアルタイム同期']
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

このドキュメントでは、MongoDB ClickPipe が **CDC（Running）モード** のときに、その同期を制御する方法について説明します。


## 概要 {#overview}

Database ClickPipes は、ソースデータベースからのプル処理とターゲットデータベースへのプッシュ処理という 2 つの並列プロセスで構成されるアーキテクチャを採用しています。プル処理は同期設定によって制御され、この設定で、どのくらいの頻度でデータをプルするか、また一度にどれくらいのデータをプルするかを定義します。ここで「一度に」とは 1 つのバッチを意味します。ClickPipe はデータをバッチ単位でプルおよびプッシュするためです。

MongoDB ClickPipe の同期を制御する主な方法は 2 つあります。以下のいずれかの設定が有効になると、ClickPipe はプッシュを開始します。

### 同期間隔 {#interval}

パイプの同期間隔は、ClickPipe がソースデータベースからレコードをプルする時間（秒）です。ClickHouse に対してプルしたデータをプッシュするための時間は、この間隔には含まれません。

デフォルトは **1 分** です。
同期間隔には任意の正の整数値を設定できますが、10 秒以上に設定することを推奨します。

### プルバッチサイズ {#batch-size}

プルバッチサイズは、ClickPipe が 1 回のバッチでソースデータベースからプルするレコード数です。ここでいうレコードとは、そのパイプの対象となっているコレクションに対して行われた insert、update、delete のことです。

デフォルトは **100,000** レコードです。
安全な最大値は 1,000 万です。

### 同期設定の構成 {#configuring}

同期間隔とプルバッチサイズは、ClickPipe の作成時または既存の ClickPipe の編集時に設定できます。
ClickPipe を作成する場合、以下のように作成ウィザードの 2 番目のステップで設定が表示されます。

<Image img={create_sync_settings} alt="同期設定の作成" size="md"/>

既存の ClickPipe を編集する場合は、そのパイプの **Settings** タブに移動し、パイプを一時停止してから、ここで **Configure** をクリックします。

<Image img={edit_sync_button} alt="同期設定編集ボタン" size="md"/>

これにより同期設定のフライアウトパネルが開き、そこで同期間隔とプルバッチサイズを変更できます。

<Image img={edit_sync_settings} alt="同期設定の編集" size="md"/>

### 同期制御の動作の監視 {#monitoring}

各バッチにどのくらい時間がかかっているかは、ClickPipe の **Metrics** タブにある **CDC Syncs** テーブルで確認できます。ここでの所要時間にはプッシュ時間が含まれる点に注意してください。また、受信する行がない場合、ClickPipe は待機し、その待機時間も所要時間に含まれます。

<Image img={cdc_syncs} alt="CDC Syncs テーブル" size="md"/>
