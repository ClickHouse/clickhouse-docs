---
'sidebar_label': 'DynamoDB'
'sidebar_position': 10
'slug': '/integrations/dynamodb'
'description': 'ClickPipes allows you to connect ClickHouse to DynamoDB.'
'keywords':
- 'clickhouse'
- 'DynamoDB'
- 'connect'
- 'integrate'
- 'table'
'title': 'CDC from DynamoDB to ClickHouse'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';


# CDC from DynamoDB to ClickHouse

<ExperimentalBadge/>

このページでは、ClickPipesを使用してDynamoDBからClickHouseへのCDCを設定する方法について説明します。この統合には2つのコンポーネントがあります：
1. S3 ClickPipesを介した初期スナップショット
2. Kinesis ClickPipesを介したリアルタイムの更新

データは`ReplacingMergeTree`に取り込まれます。このテーブルエンジンはCDCシナリオによく使用され、更新操作を適用できるようにします。このパターンに関する詳細は、以下のブログ記事で見つかります：

* [PostgreSQLとClickHouseによる変更データキャプチャ（CDC） - パート1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [PostgreSQLとClickHouseによる変更データキャプチャ（CDC） - パート2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. Kinesis Streamの設定 {#1-set-up-kinesis-stream}

最初に、DynamoDBテーブルでKinesisストリームを有効にして、リアルタイムで変更をキャプチャします。スナップショットを作成する前にこれを行い、データの喪失を避ける必要があります。
AWSガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html)にあります。

<Image img={dynamodb_kinesis_stream} size="lg" alt="DynamoDB Kinesis Stream" border/>

## 2. スナップショットの作成 {#2-create-the-snapshot}

次に、DynamoDBテーブルのスナップショットを作成します。これは、AWSからS3へのエクスポートを通じて実行できます。AWSガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)にあります。
**DynamoDB JSONフォーマットで「フルエクスポート」を実行する必要があります。**

<Image img={dynamodb_s3_export} size="md" alt="DynamoDB S3 Export" border/>

## 3. スナップショットをClickHouseにロード {#3-load-the-snapshot-into-clickhouse}

### 必要なテーブルの作成 {#create-necessary-tables}

DynamoDBからのスナップショットデータは次のようになります：
```json
{
  "age": {
    "N": "26"
  },
  "first_name": {
    "S": "sally"
  },
  "id": {
    "S": "0A556908-F72B-4BE6-9048-9E60715358D4"
  }
}
```

データがネストされた形式になっていることに注意してください。ClickHouseにロードする前に、このデータをフラット化する必要があります。これは、ClickHouseのMaterialized Viewで`JSONExtract`関数を使用して行えます。

次の3つのテーブルを作成する必要があります：
1. DynamoDBからの生データを格納するテーブル
2. 最終的にフラット化されたデータを格納するテーブル（宛先テーブル）
3. データをフラット化するためのMaterialized View

上記の例のDynamoDBデータに対するClickHouseのテーブルは次のようになります：

```sql
/* スナップショットテーブル */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* 最終的にフラット化されたデータ用のテーブル */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* 最終的にフラット化されたデータ用のテーブル */
CREATE TABLE IF NOT EXISTS "default"."destination" (
    "id" String,
    "first_name" String,
    "age" Int8,
    "version" Int64
)
ENGINE ReplacingMergeTree("version")
ORDER BY id;
```

宛先テーブルにはいくつかの要件があります：
- このテーブルは`ReplacingMergeTree`テーブルである必要があります
- テーブルには`version`カラムが必要です
  - 後のステップで、Kinesisストリームから`ApproximateCreationDateTime`フィールドを`version`カラムにマッピングします。
- テーブルはソートキーとしてパーティションキーを使用する必要があります（`ORDER BY`で指定）
  - 同じソートキーを持つ行は`version`カラムに基づいて重複排除されます。

### スナップショットClickPipeの作成 {#create-the-snapshot-clickpipe}
次に、S3からClickHouseにスナップショットデータをロードするためのClickPipeを作成できます。S3 ClickPipeガイドに従って[こちら](/integrations/data-ingestion/clickpipes/object-storage.md)を参照してくださいが、次の設定を使用します：

- **インジェストパス**：エクスポートされたjsonファイルのS3内のパスを特定する必要があります。パスは次のようになります：

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **フォーマット**：JSONEachRow
- **テーブル**：スナップショットテーブル（例：上記の`default.snapshot`）

作成が完了すると、スナップショットテーブルと宛先テーブルにデータがポピュレートし始めます。次のステップに進む前にスナップショットのロードが完了するのを待つ必要はありません。

## 4. Kinesis ClickPipeの作成 {#4-create-the-kinesis-clickpipe}

次に、Kinesisストリームからリアルタイムで変更をキャプチャするためのKinesis ClickPipeを設定できます。Kinesis ClickPipeガイドに従って[こちら](/integrations/data-ingestion/clickpipes/kinesis.md)を参照してくださいが、次の設定を使用します：

- **ストリーム**：ステップ1で使用したKinesisストリーム
- **テーブル**：宛先テーブル（例：上記の`default.destination`）
- **オブジェクトのフラット化**：true
- **カラムマッピング**：
  - `ApproximateCreationDateTime`: `version`
  - 他のフィールドを、以下に示す宛先カラムに適切にマッピングします

<Image img={dynamodb_map_columns} size="md" alt="DynamoDB Map Columns" border/>

## 5. クリーンアップ（オプション） {#5-cleanup-optional}

スナップショットClickPipeが完了したら、スナップショットテーブルとマテリアライズドビューを削除できます。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
