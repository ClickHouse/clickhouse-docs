---
sidebar_label: 'DynamoDB'
sidebar_position: 10
slug: /integrations/dynamodb
description: 'ClickPipesを使用してClickHouseとDynamoDBを接続する方法。'
keywords: ['clickhouse', 'DynamoDB', 'connect', 'integrate', 'table']
title: 'DynamoDBからClickHouseへのCDC'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';


# DynamoDBからClickHouseへのCDC

<ExperimentalBadge/>

このページでは、ClickPipesを使用してDynamoDBからClickHouseへのCDCをセットアップする方法について説明します。この統合には2つのコンポーネントがあります：
1. S3を介した初期スナップショット ClickPipes
2. Kinesis ClickPipesを介したリアルタイム更新

データは`ReplacingMergeTree`に取り込まれます。このテーブルエンジンはCDCシナリオで一般的に使用され、更新操作が適用されることを可能にします。このパターンに関する詳細は、以下のブログ記事で確認できます：

* [PostgreSQLとClickHouseを使用した変更データキャプチャ（CDC） - 第1部](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [PostgreSQLとClickHouseを使用した変更データキャプチャ（CDC） - 第2部](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. Kinesisストリームの設定 {#1-set-up-kinesis-stream}

まず、DynamoDBテーブルでKinesisストリームを有効にし、リアルタイムでの変更をキャッチする必要があります。データを見逃すことを避けるために、スナップショットを作成する前にこれを行いたいと思います。AWSガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html)で確認できます。

<Image img={dynamodb_kinesis_stream} size="lg" alt="DynamoDB Kinesis Stream" border/>

## 2. スナップショットの作成 {#2-create-the-snapshot}

次に、DynamoDBテーブルのスナップショットを作成します。これは、AWSからS3へのエクスポートを通じて行うことができます。AWSガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)で確認できます。
**DynamoDB JSON形式で「フルエクスポート」を行うことをお勧めします。**

<Image img={dynamodb_s3_export} size="md" alt="DynamoDB S3 Export" border/>

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

データが入れ子になった形式であることに注意してください。このデータをClickHouseにロードする前にフラット化する必要があります。これは、ClickHouseのMaterialized Viewにおいて`JSONExtract`関数を使用することで実現できます。

我々は3つのテーブルを作成します：
1. DynamoDBからの生データを保存するテーブル
2. 最終的なフラットデータを保存するテーブル（宛先テーブル）
3. データをフラット化するためのMaterialized View

上記の例のDynamoDBデータに対し、ClickHouseのテーブルは次のようになります：

```sql
/* スナップショットテーブル */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* 最終的なフラットデータ用のテーブル */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* 最終的なフラットデータ用のテーブル */
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
- テーブルには`version`カラムが必要です。
  - 後のステップでは、Kinesisストリームの`ApproximateCreationDateTime`フィールドを`version`カラムにマッピングします。
- テーブルはパーティションキーをソートキーとして使用する必要があります（`ORDER BY`で指定）。
  - 同じソートキーを持つ行は`version`カラムに基づいて重複が排除されます。

### スナップショットClickPipeの作成 {#create-the-snapshot-clickpipe}
今、S3からClickHouseにスナップショットデータをロードするためのClickPipeを作成できます。S3 ClickPipeガイドに従って[こちら](/integrations/data-ingestion/clickpipes/object-storage.md)で設定を行いますが、以下の設定を使用してください：

- **取り込みパス**：エクスポートされたjsonファイルのS3内でのパスを特定する必要があります。パスは次のようになります：

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **フォーマット**：JSONEachRow
- **テーブル**：スナップショットテーブル（上記の例では`default.snapshot`）

作成が完了すると、スナップショットおよび宛先テーブルへのデータが流入し始めます。次のステップに進む前に、スナップショットのロードが完了するのを待つ必要はありません。

## 4. Kinesis ClickPipeの作成 {#4-create-the-kinesis-clickpipe}

今、Kinesisストリームからリアルタイムの変更をキャッチするためのKinesis ClickPipeを設定できます。Kinesis ClickPipeガイドに従って[こちら](/integrations/data-ingestion/clickpipes/kinesis.md)で設定を行いますが、以下の設定を使用してください：

- **ストリーム**：ステップ1で使用したKinesisストリーム
- **テーブル**：宛先テーブル（上記の例では`default.destination`）
- **オブジェクトをフラット化**：true
- **カラムマッピング**：
  - `ApproximateCreationDateTime`: `version`
  - 他のフィールドを適切な宛先カラムにマッピングします。

<Image img={dynamodb_map_columns} size="md" alt="DynamoDB Map Columns" border/>

## 5. クリーンアップ（オプション） {#5-cleanup-optional}

スナップショットClickPipeが完了したら、スナップショットテーブルとMaterialized Viewを削除できます。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
