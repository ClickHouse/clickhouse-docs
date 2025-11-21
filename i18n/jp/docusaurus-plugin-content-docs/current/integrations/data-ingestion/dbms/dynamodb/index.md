---
sidebar_label: 'DynamoDB'
sidebar_position: 10
slug: /integrations/dynamodb
description: 'ClickPipes を使用すると、ClickHouse と DynamoDB を接続できます。'
keywords: ['DynamoDB']
title: 'DynamoDB から ClickHouse への CDC'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';


# DynamoDB から ClickHouse への CDC

<ExperimentalBadge/>

このページでは、ClickPipes を使用して DynamoDB から ClickHouse への CDC を設定する方法を説明します。この統合には 2 つのコンポーネントがあります。
1. S3 ClickPipes による初回スナップショット
2. Kinesis ClickPipes によるリアルタイム更新

データは `ReplacingMergeTree` に取り込まれます。このテーブルエンジンは、更新処理を行えるようにするため、CDC シナリオで一般的に使用されます。このパターンの詳細については、次のブログ記事を参照してください。

* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)



## 1. Kinesisストリームのセットアップ {#1-set-up-kinesis-stream}

まず、DynamoDBテーブルでKinesisストリームを有効化して、変更をリアルタイムで取得できるようにします。データの欠落を防ぐため、スナップショットを作成する前にこの設定を行ってください。
AWSガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html)にあります。

<Image
  img={dynamodb_kinesis_stream}
  size='lg'
  alt='DynamoDB Kinesisストリーム'
  border
/>


## 2. スナップショットの作成 {#2-create-the-snapshot}

次に、DynamoDBテーブルのスナップショットを作成します。これは、AWSのS3へのエクスポート機能を使用して実現できます。AWSガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)を参照してください。
**DynamoDB JSON形式で「フルエクスポート」を実行してください。**

<Image img={dynamodb_s3_export} size='md' alt='DynamoDB S3エクスポート' border />


## 3. スナップショットをClickHouseに読み込む {#3-load-the-snapshot-into-clickhouse}

### 必要なテーブルの作成 {#create-necessary-tables}

DynamoDBからのスナップショットデータは次のような形式になります:

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

データがネストされた形式であることに注目してください。ClickHouseに読み込む前に、このデータをフラット化する必要があります。これは、マテリアライズドビュー内でClickHouseの`JSONExtract`関数を使用して実行できます。

3つのテーブルを作成します:

1. DynamoDBからの生データを格納するテーブル
2. 最終的なフラット化されたデータを格納するテーブル(宛先テーブル)
3. データをフラット化するマテリアライズドビュー

上記のDynamoDBデータの例では、ClickHouseのテーブルは次のようになります:

```sql
/* スナップショットテーブル */
CREATE TABLE IF NOT EXISTS "default"."snapshot"
(
    `item` String
)
ORDER BY tuple();

/* 最終的なフラット化されたデータ用のテーブル */
CREATE MATERIALIZED VIEW IF NOT EXISTS "default"."snapshot_mv" TO "default"."destination" AS
SELECT
    JSONExtractString(item, 'id', 'S') AS id,
    JSONExtractInt(item, 'age', 'N') AS age,
    JSONExtractString(item, 'first_name', 'S') AS first_name
FROM "default"."snapshot";

/* 最終的なフラット化されたデータ用のテーブル */
CREATE TABLE IF NOT EXISTS "default"."destination" (
    "id" String,
    "first_name" String,
    "age" Int8,
    "version" Int64
)
ENGINE ReplacingMergeTree("version")
ORDER BY id;
```

宛先テーブルにはいくつかの要件があります:

- このテーブルは`ReplacingMergeTree`テーブルである必要があります
- テーブルには`version`カラムが必要です
  - 後の手順で、Kinesisストリームの`ApproximateCreationDateTime`フィールドを`version`カラムにマッピングします。
- テーブルはパーティションキーをソートキーとして使用する必要があります(`ORDER BY`で指定)
  - 同じソートキーを持つ行は、`version`カラムに基づいて重複排除されます。

### スナップショットClickPipeの作成 {#create-the-snapshot-clickpipe}

これで、S3からClickHouseにスナップショットデータを読み込むためのClickPipeを作成できます。S3 ClickPipeガイド[こちら](/integrations/clickpipes/object-storage)に従い、以下の設定を使用してください:

- **取り込みパス**: S3内のエクスポートされたjsonファイルのパスを特定する必要があります。パスは次のような形式になります:

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

- **フォーマット**: JSONEachRow
- **テーブル**: スナップショットテーブル(例: 上記の例では`default.snapshot`)

作成後、スナップショットテーブルと宛先テーブルへのデータ投入が開始されます。次の手順に進む前に、スナップショットの読み込みが完了するのを待つ必要はありません。


## 4. Kinesis ClickPipeの作成 {#4-create-the-kinesis-clickpipe}

次に、KinesisストリームからリアルタイムでデータをキャプチャするためのKinesis ClickPipeを設定します。[Kinesis ClickPipeガイド](/integrations/data-ingestion/clickpipes/kinesis.md)に従い、以下の設定を使用してください:

- **Stream**: ステップ1で使用したKinesisストリーム
- **Table**: 宛先テーブル(例: 上記の例では`default.destination`)
- **Flatten object**: true
- **Column mappings**:
  - `ApproximateCreationDateTime`: `version`
  - その他のフィールドは、以下に示すように適切な宛先カラムにマッピングします

<Image img={dynamodb_map_columns} size='md' alt='DynamoDBカラムマッピング' border />


## 5. クリーンアップ（オプション） {#5-cleanup-optional}

スナップショット ClickPipe が完了したら、スナップショットテーブルとマテリアライズドビューを削除できます。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
