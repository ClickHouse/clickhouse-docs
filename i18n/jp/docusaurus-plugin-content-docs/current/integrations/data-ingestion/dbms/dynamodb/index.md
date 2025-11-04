---
'sidebar_label': 'DynamoDB'
'sidebar_position': 10
'slug': '/integrations/dynamodb'
'description': 'ClickPipes を使用すると、ClickHouse と DynamoDB を接続できます。'
'keywords':
- 'DynamoDB'
'title': 'DynamoDB から ClickHouse への CDC'
'show_related_blogs': true
'doc_type': 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';


# DynamoDBからClickHouseへのCDC

<ExperimentalBadge/>

このページでは、ClickPipesを使用してDynamoDBからClickHouseへのCDCを設定する方法について説明します。この統合には2つのコンポーネントがあります：
1. S3 ClickPipesを介した初期スナップショット
2. Kinesis ClickPipesを介したリアルタイム更新

データは `ReplacingMergeTree` に取り込まれます。このテーブルエンジンは、更新操作が適用されるCDCシナリオで一般的に使用されます。このパターンに関する詳細は、以下のブログ記事を参照してください：

* [PostgreSQLとClickHouseによる変更データキャプチャ (CDC) - パート1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [PostgreSQLとClickHouseによる変更データキャプチャ (CDC) - パート2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. Kinesisストリームの設定 {#1-set-up-kinesis-stream}

まず、DynamoDBテーブルでリアルタイムの変更をキャプチャするためにKinesisストリームを有効にします。スナップショットを作成する前にこれを行うことで、データを見逃すことを避けることができます。
AWSガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html)にあります。

<Image img={dynamodb_kinesis_stream} size="lg" alt="DynamoDB Kinesis Stream" border/>

## 2. スナップショットを作成する {#2-create-the-snapshot}

次に、DynamoDBテーブルのスナップショットを作成します。これはAWSエクスポートを使用してS3に達成できます。AWSガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)にあります。
**DynamoDB JSON形式で「フルエクスポート」を行う必要があります。**

<Image img={dynamodb_s3_export} size="md" alt="DynamoDB S3 Export" border/>

## 3. スナップショットをClickHouseにロードする {#3-load-the-snapshot-into-clickhouse}

### 必要なテーブルを作成する {#create-necessary-tables}

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

データがネストされた形式であることに注意してください。このデータをClickHouseにロードする前にフラット化する必要があります。これは、ClickHouseのマテリアライズドビューの`JSONExtract`関数を使用して行うことができます。

3つのテーブルを作成したいと思います：
1. DynamoDBからの生データを保存するテーブル
2. 最終的なフラット化されたデータを保存するテーブル（宛先テーブル）
3. データをフラット化するためのマテリアライズドビュー

上記のDynamoDBデータの例に対して、ClickHouseのテーブルは次のようになります：

```sql
/* Snapshot table */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* Table for final flattened data */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* Table for final flattened data */
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
  - 後のステップでは、Kinesisストリームの`ApproximateCreationDateTime`フィールドを`version`カラムにマッピングします。
- テーブルは、ソートキーとしてパーティションキーを使用する必要があります（`ORDER BY`で指定）
  - 同じソートキーを持つ行は`version`カラムに基づいて重複排除されます。

### スナップショットClickPipeを作成する {#create-the-snapshot-clickpipe}
S3からClickHouseにスナップショットデータをロードするためのClickPipeを作成できます。S3 ClickPipeガイドは[こちら](/integrations/data-ingestion/clickpipes/object-storage.md)に従ってくださいが、次の設定を使用してください：

- **インジェストパス**：エクスポートされたjsonファイルのS3内のパスを特定する必要があります。パスは次のようになります：

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **フォーマット**：JSONEachRow
- **テーブル**：スナップショットテーブル（例：上記の `default.snapshot`）

作成が完了すると、スナップショットテーブルと宛先テーブルにデータが含まれ始めます。次のステップに進む前にスナップショットのロードが完了するまで待つ必要はありません。

## 4. Kinesis ClickPipeを作成する {#4-create-the-kinesis-clickpipe}

次に、Kinesisストリームからのリアルタイムの変更をキャプチャするためのKinesis ClickPipeを設定できます。Kinesis ClickPipeガイドは[こちら](/integrations/data-ingestion/clickpipes/kinesis.md)に従ってくださいが、次の設定を使用してください：

- **ストリーム**：ステップ1で使用されたKinesisストリーム
- **テーブル**：宛先テーブル（例：上記の `default.destination`）
- **オブジェクトのフラット化**：true
- **カラムマッピング**：
  - `ApproximateCreationDateTime`: `version`
  - その他のフィールドを適切な宛先カラムにマッピングする（下記のように）

<Image img={dynamodb_map_columns} size="md" alt="DynamoDB Map Columns" border/>

## 5. クリーンアップ（オプション） {#5-cleanup-optional}

スナップショットClickPipeが完了したら、スナップショットテーブルとマテリアライズドビューを削除できます。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
