---
sidebar_label: 'MongoDB から ClickHouse へのデータ取り込み'
description: 'MongoDB を ClickHouse Cloud にシームレスに接続する方法を説明します。'
slug: /integrations/clickpipes/mongodb
title: 'MongoDB から ClickHouse へのデータ取り込み（CDC を使用）'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mongodb_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-tile.png'
import mongodb_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-connection-details.png'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# MongoDB から ClickHouse へのデータ取り込み（CDC の利用）

<BetaBadge/>

:::info
ClickPipes を使用して MongoDB から ClickHouse Cloud へデータを取り込む機能は、現在パブリックベータです。
:::

:::note
ClickHouse Cloud のコンソールおよびドキュメントでは、MongoDB に関して「table」と「collection」は同義として使用されます。
:::

ClickPipes を使用すると、MongoDB データベースから ClickHouse Cloud にデータを取り込むことができます。ソースとなる MongoDB データベースは、オンプレミス環境にホストされていても、MongoDB Atlas などのサービスを利用してクラウド上にホストされていてもかまいません。



## 前提条件 {#prerequisites}

開始する前に、MongoDBデータベースがレプリケーション用に正しく設定されていることを確認する必要があります。設定手順はMongoDBのデプロイ方法によって異なるため、以下の該当するガイドを参照してください：

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [汎用MongoDB](./mongodb/source/generic)

ソースMongoDBデータベースのセットアップが完了したら、ClickPipeの作成に進むことができます。


## ClickPipeの作成 {#create-your-clickpipe}

ClickHouse Cloudアカウントにログインしていることを確認してください。アカウントをお持ちでない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

1. ClickHouse Cloudコンソールで、ClickHouse Cloudサービスに移動します。

<Image img={cp_service} alt='ClickPipesサービス' size='lg' border />

2. 左側のメニューから`Data Sources`ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt='インポートの選択' size='lg' border />

3. `MongoDB CDC`タイルを選択します。

<Image img={mongodb_tile} alt='MongoDBの選択' size='lg' border />

### ソースMongoDBデータベース接続の追加 {#add-your-source-mongodb-database-connection}

4. 前提条件のステップで設定したソースMongoDBデータベースの接続詳細を入力します。

   :::info
   接続詳細の追加を開始する前に、ファイアウォールルールでClickPipes IPアドレスをホワイトリストに登録していることを確認してください。[ClickPipes IPアドレスのリスト](../index.md#list-of-static-ips)は次のページで確認できます。
   詳細については、[このページの上部](#prerequisites)にリンクされているソースMongoDBセットアップガイドを参照してください。
   :::

   <Image
     img={mongodb_connection_details}
     alt='接続詳細の入力'
     size='lg'
     border
   />

接続詳細を入力したら、`Next`をクリックします。

#### 詳細設定の構成 {#advanced-settings}

必要に応じて詳細設定を構成できます。各設定の簡単な説明を以下に示します:

- **Sync interval**: ClickPipesがソースデータベースの変更をポーリングする間隔です。これは宛先ClickHouseサービスに影響を与えるため、コストを重視するユーザーには、この値を高めに設定すること(`3600`以上)を推奨します。
- **Pull batch size**: 1回のバッチで取得する行数です。これはベストエフォート設定であり、すべてのケースで保証されるわけではありません。
- **Snapshot number of tables in parallel**: 初期スナップショット中に並列で取得されるテーブルの数です。多数のテーブルがあり、並列で取得されるテーブルの数を制御したい場合に便利です。

### テーブルの構成 {#configure-the-tables}

5. ここでClickPipeの宛先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成できます。

   <Image
     img={select_destination_db}
     alt='宛先データベースの選択'
     size='lg'
     border
   />

6. ソースMongoDBデータベースからレプリケートするテーブルを選択できます。テーブルを選択する際、宛先ClickHouseデータベースでテーブル名を変更することもできます。

### 権限の確認とClickPipeの開始 {#review-permissions-and-start-the-clickpipe}

7. 権限ドロップダウンから「Full access」ロールを選択し、「Complete Setup」をクリックします。

   <Image img={ch_permissions} alt='権限の確認' size='lg' border />


## 次のステップ {#whats-next}

MongoDBからClickHouse CloudへデータをレプリケートするためのClickPipeの設定が完了したら、最適なパフォーマンスを実現するためのデータのクエリとモデリングに集中できます。


## 注意事項 {#caveats}

このコネクタを使用する際の注意事項は以下の通りです:

- MongoDB バージョン 5.1.0 以上が必要です。
- CDC には MongoDB のネイティブ Change Streams API を使用しており、MongoDB の oplog に依存してリアルタイムの変更をキャプチャします。
- MongoDB のドキュメントは、デフォルトで JSON 型として ClickHouse にレプリケートされます。これにより柔軟なスキーマ管理が可能になり、ClickHouse の豊富な JSON 演算子をクエリや分析に使用できます。JSON データのクエリについて詳しくは[こちら](https://clickhouse.com/docs/sql-reference/data-types/newjson)をご覧ください。
- セルフサービスでの PrivateLink 設定は現在利用できません。AWS をご利用で PrivateLink が必要な場合は、db-integrations-support@clickhouse.com までご連絡いただくか、サポートチケットを作成してください。有効化のサポートをいたします。
