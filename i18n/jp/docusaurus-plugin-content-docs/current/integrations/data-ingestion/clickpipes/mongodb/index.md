---
'sidebar_label': 'MongoDBからClickHouseへのデータ取り込み'
'description': 'MongoDBをClickHouse Cloudにシームレスに接続する方法を説明します。'
'slug': '/integrations/clickpipes/mongodb'
'title': 'MongoDBからClickHouseへのデータ取り込み（CDCを使用）'
'doc_type': 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mongodb_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-tile.png'
import mongodb_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-connection-details.png'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# MongoDBからClickHouseへのデータの取り込み（CDCを使用）

<BetaBadge/>

:::info
ClickPipesを介してMongoDBからClickHouse Cloudへのデータの取り込みは公開ベータ版です。
:::

:::note
ClickHouse Cloudのコンソールおよびドキュメントでは、MongoDBの「テーブル」と「コレクション」は互換的に使用されています。
:::

ClickPipesを使用してMongoDBデータベースからClickHouse Cloudにデータを取り込むことができます。ソースのMongoDBデータベースは、オンプレミスまたはMongoDB Atlasのようなサービスを使用してクラウドにホストできます。

## 前提条件 {#prerequisites}

開始するには、まずMongoDBデータベースが正しくレプリケーションのために設定されていることを確認する必要があります。設定手順はMongoDBのデプロイ方法によって異なるため、以下の関連ガイドに従ってください：

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [一般的なMongoDB](./mongodb/source/generic)

ソースのMongoDBデータベースがセットアップされたら、ClickPipeの作成を続けることができます。

## ClickPipeを作成する {#create-your-clickpipe}

ClickHouse Cloudアカウントにログインしていることを確認してください。まだアカウントがない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

1. ClickHouse Cloudのコンソールで、ClickHouse Cloudサービスに移動します。

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. 左側のメニューから`Data Sources`ボタンを選択し、「ClickPipeの設定」をクリックします。

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. `MongoDB CDC`タイルを選択します。

<Image img={mongodb_tile} alt="Select MongoDB" size="lg" border/>

### ソースMongoDBデータベース接続を追加する {#add-your-source-mongodb-database-connection}

4. 前提条件のステップで設定したソースMongoDBデータベースの接続詳細を入力します。

   :::info
   接続詳細を追加する前に、ClickPipesのIPアドレスがファイアウォールルールでホワイトリストに登録されていることを確認してください。次のページには[ClickPipesのIPアドレスのリスト](../index.md#list-of-static-ips)があります。
   詳細については、このページの[上部](#prerequisites)にリンクされているソースMongoDB設定ガイドを参照してください。
   :::

   <Image img={mongodb_connection_details} alt="Fill in connection details" size="lg" border/>

接続詳細が入力されたら、`Next`をクリックします。

#### 詳細設定を構成する {#advanced-settings}

必要に応じて詳細設定を構成できます。各設定の簡単な説明は以下の通りです：

- **同期間隔**: ClickPipesがソースデータベースをポーリングする間隔です。これは、コストに敏感なユーザーにとって、宛先のClickHouseサービスに影響を与えるため、値を高く（`3600`以上）保つことをお勧めします。
- **取得バッチサイズ**: 一度に取得する行の数です。これは最善の努力による設定であり、すべてのケースで尊重されるわけではありません。
- **初期スナップショットで並行して取得するテーブル数**: 初期スナップショット中に並行して取得されるテーブルの数です。多数のテーブルがある場合に、並行して取得するテーブルの数を制御するのに便利です。

### テーブルを構成する {#configure-the-tables}

5. ここでClickPipeの宛先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成できます。

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

6. ソースMongoDBデータベースからレプリケートしたいテーブルを選択できます。テーブルを選択する際に、宛先のClickHouseデータベースでテーブルの名前を変更することもできます。

### 権限を確認し、ClickPipeを開始する {#review-permissions-and-start-the-clickpipe}

7. 権限のドロップダウンから「フルアクセス」ロールを選択し、「設定を完了」をクリックします。

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

## 次は何ですか？ {#whats-next}

MongoDBからClickHouse CloudへのデータをレプリケートするClickPipeを設定したら、データを最適なパフォーマンスでクエリおよびモデル化する方法に集中できます。

## 注意事項 {#caveats}

このコネクタを使用するときに注意すべきいくつかの注意事項があります：

- MongoDBのバージョンは5.1.0以上が必要です。
- CDCのためにMongoDBのネイティブなChange Streams APIを使用します。これはMongoDBのoplogに依存してリアルタイムの変更をキャプチャします。
- MongoDBのドキュメントはデフォルトでJSONタイプとしてClickHouseにレプリケートされます。これにより柔軟なスキーマ管理が可能になり、ClickHouseの豊富なJSON演算子を使用してクエリおよび分析が行えます。JSONデータのクエリについての詳細は[こちら](https://clickhouse.com/docs/sql-reference/data-types/newjson)を参照してください。
- セルフサービスのPrivateLink設定は現在利用できません。AWSでPrivateLinkが必要な場合は、db-integrations-support@clickhouse.comにお問い合わせいただくか、サポートチケットを作成してください。私たちはそれを有効にするために協力します。
