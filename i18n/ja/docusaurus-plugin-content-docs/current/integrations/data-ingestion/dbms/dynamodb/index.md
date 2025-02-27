---
sidebar_label: DynamoDB
sidebar_position: 10
slug: /integrations/dynamodb
description: ClickPipesを使用してClickHouseをDynamoDBに接続できます。
keywords: [clickhouse, DynamoDB, connect, integrate, table]
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# DynamoDBからClickHouseへのCDC

<ExperimentalBadge/>

このページでは、ClickPipesを使用してDynamoDBからClickHouseへのCDCをセットアップする方法を説明します。この統合には2つのコンポーネントがあります：
1. S3 ClickPipesを介した初期スナップショット
2. Kinesis ClickPipesを介したリアルタイム更新

データは`ReplacingMergeTree`に取り込まれます。このテーブルエンジンは、更新操作が適用されることを許可するため、CDCシナリオで一般的に使用されます。このパターンに関する詳細は、以下のブログ記事で確認できます：

* [PostgreSQLとClickHouseを用いた変更データキャプチャ（CDC） - パート1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [PostgreSQLとClickHouseを用いた変更データキャプチャ（CDC） - パート2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. Kinesisストリームのセットアップ {#1-set-up-kinesis-stream}

まず、DynamoDBテーブルでKinesisストリームを有効にして、リアルタイムでの変更をキャプチャする必要があります。これはスナップショットを作成する前に行う必要があり、データを見逃さないようにするためです。
AWSガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html)にあります。

![DynamoDB Kinesis Stream](../images/dynamodb-kinesis-stream.png)

## 2. スナップショットの作成 {#2-create-the-snapshot}

次に、DynamoDBテーブルのスナップショットを作成します。これはAWSのS3へのエクスポートを介して達成できます。AWSガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)にあります。
**DynamoDB JSON形式で「フルエクスポート」を実行する必要があります。**

![DynamoDB S3 Export](../images/dynamodb-s3-export.png)

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

データがネストされた形式になっていることに注意してください。このデータをClickHouseにロードする前にフラット化する必要があります。これは、ClickHouseのMaterialized View内で`JSONExtract`関数を使用して行うことができます。

3つのテーブルを作成します：
1. DynamoDBからの生データを保存するテーブル
2. 最終的なフラット化データを保存するテーブル（宛先テーブル）
3. データをフラット化するためのMaterialized View

上記の例のDynamoDBデータに対するClickHouseのテーブルは次のようになります：

```sql
/* スナップショットテーブル */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* 最終的なフラット化データのテーブル */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* 最終的なフラット化データのテーブル */
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
- このテーブルは`ReplacingMergeTree`テーブルでなければなりません。
- テーブルには`version`カラムを持つ必要があります。
  - 後のステップで、Kinesisストリームの`ApproximateCreationDateTime`フィールドを`version`カラムにマッピングします。
- テーブルはパーティションキーをソートキーとして使用する必要があります（`ORDER BY`で指定されます）。
  - 同じソートキーを持つ行は、`version`カラムに基づいて重複排除されます。

### スナップショットClickPipeの作成 {#create-the-snapshot-clickpipe}
これで、S3からClickHouseにスナップショットデータをロードするClickPipeを作成できます。S3 ClickPipeガイドは[こちら](/integrations/data-ingestion/clickpipes/object-storage.md)を参照してくださいが、次の設定を使用してください：

- **取り込みパス**: エクスポートされたjsonファイルのS3内のパスを特定する必要があります。そのパスは次のようになります：

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **フォーマット**: JSONEachRow
- **テーブル**: あなたのスナップショットテーブル（例：上記の`default.snapshot`）

作成後、スナップショットおよび宛先テーブルへのデータのポピュレーションが始まります。次のステップに進む前にスナップショットのロードが完了するのを待つ必要はありません。

## 4. Kinesis ClickPipeの作成 {#4-create-the-kinesis-clickpipe}

次に、Kinesisストリームからのリアルタイムの変更をキャプチャするためにKinesis ClickPipeをセットアップできます。Kinesis ClickPipeガイドは[こちら](/integrations/data-ingestion/clickpipes/kinesis.md)を参照してくださいが、次の設定を使用してください：

- **ストリーム**: ステップ1で使用したKinesisストリーム
- **テーブル**: あなたの宛先テーブル（例：上記の`default.destination`）
- **オブジェクトをフラット化**: true
- **カラムマッピング**:
  - `ApproximateCreationDateTime`: `version`
  - その他のフィールドを適切な宛先カラムにマッピングします（以下のように）

![DynamoDB カラムのマッピング](../images/dynamodb-map-columns.png) 

## 5. クリーンアップ（オプション） {#5-cleanup-optional}

スナップショットClickPipeが完了したら、スナップショットテーブルとマテリアライズドビューを削除できます。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
