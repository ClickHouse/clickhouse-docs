---
sidebar_label: DynamoDB
sidebar_position: 10
slug: /integrations/dynamodb
description: ClickPipesを使用してClickHouseをDynamoDBに接続します。
keywords: [clickhouse, DynamoDB, connect, integrate, table]
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';


# DynamoDBからClickHouseへのCDC

<ExperimentalBadge/>

このページでは、ClickPipesを使用してDynamoDBからClickHouseへのCDCの設定方法を説明します。この統合には2つのコンポーネントがあります：
1. S3 ClickPipesを介した初期スナップショット
2. Kinesis ClickPipesを介したリアルタイム更新

データは`ReplacingMergeTree`に取り込まれます。このテーブルエンジンは、更新操作を適用できるようにCDCシナリオで一般的に使用されます。このパターンに関する詳細は、以下のブログ記事に記載されています：

* [PostgreSQLとClickHouseによる変更データキャプチャ（CDC） - パート1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [PostgreSQLとClickHouseによる変更データキャプチャ（CDC） - パート2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. Kinesis Streamの設定 {#1-set-up-kinesis-stream}

まず、DynamoDBテーブルでKinesisストリームを有効にして、リアルタイムでの変更をキャプチャする必要があります。これは、スナップショットを作成する前に行い、データの欠落を避けるためです。
AWSガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html)にあります。

<img src={dynamodb_kinesis_stream} alt="DynamoDB Kinesis Stream"/>

## 2. スナップショットの作成 {#2-create-the-snapshot}

次に、DynamoDBテーブルのスナップショットを作成します。これは、AWSエクスポートをS3に行うことで実現できます。AWSガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)にあります。
**DynamoDB JSON形式で「フルエクスポート」を行う必要があります。**

<img src={dynamodb_s3_export} alt="DynamoDB S3 Export"/>

## 3. スナップショットをClickHouseにロードする {#3-load-the-snapshot-into-clickhouse}

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

データがネストされた形式になっていることに注意してください。このデータをClickHouseにロードする前にフラット化する必要があります。これは、Materialized View内でClickHouseの`JSONExtract`関数を使用することで行えます。

次の三つのテーブルを作成します：
1. DynamoDBからの生データを格納するテーブル
2. 最終的なフラット化されたデータを格納するテーブル（宛先テーブル）
3. データをフラット化するためのMaterialized View

上記のDynamoDBデータの例に対して、ClickHouseのテーブルは次のようになります：

```sql
/* スナップショットテーブル */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* 最終的なフラット化されたデータ用テーブル */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* 最終的なフラット化されたデータ用テーブル */
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
- このテーブルは`ReplacingMergeTree`テーブルでなければなりません
- テーブルには`version`カラムが必要です
  - 後のステップでは、Kinesisストリームからの`ApproximateCreationDateTime`フィールドを`version`カラムにマッピングします。
- テーブルはソートキーとしてパーティションキーを使用する必要があります（`ORDER BY`で指定されます）
  - 同じソートキーを持つ行は、`version`カラムに基づいて重複が排除されます。

### スナップショットClickPipeの作成 {#create-the-snapshot-clickpipe}
次に、S3からClickHouseにスナップショットデータをロードするためのClickPipeを作成できます。S3 ClickPipeガイドに従って[こちら](/integrations/data-ingestion/clickpipes/object-storage.md)を参照してくださいが、次の設定を使用してください：

- **取り込みパス**: エクスポートされたJSONファイルのS3内のパスを特定する必要があります。パスは次のようになります：

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **フォーマット**: JSONEachRow
- **テーブル**: あなたのスナップショットテーブル（上記の例では`default.snapshot`）

作成されると、データはスナップショットと宛先テーブルにポピュレートされ始めます。次のステップに進む前にスナップショットのロードが完了するのを待つ必要はありません。

## 4. Kinesis ClickPipeの作成 {#4-create-the-kinesis-clickpipe}

次に、Kinesisストリームからのリアルタイムの変更をキャプチャするためのKinesis ClickPipeを設定できます。Kinesis ClickPipeガイドに従って[こちら](/integrations/data-ingestion/clickpipes/kinesis.md)を参照してくださいが、次の設定を使用してください：

- **ストリーム**: ステップ1で使用されるKinesisストリーム
- **テーブル**: あなたの宛先テーブル（上記の例では`default.destination`）
- **オブジェクトをフラット化**: true
- **カラムマッピング**:
  - `ApproximateCreationDateTime`: `version`
  - その他のフィールドを次のように宛先カラムにマッピングします

<img src={dynamodb_map_columns} alt="DynamoDB Map Columns"/>

## 5. クリーンアップ（オプション） {#5-cleanup-optional}

スナップショットClickPipeが完了したら、スナップショットテーブルとMaterialized Viewを削除できます。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
