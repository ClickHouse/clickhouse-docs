---
sidebar_label: 'DynamoDB'
sidebar_position: 10
slug: /integrations/dynamodb
description: 'ClickPipes を使用すると、ClickHouse と DynamoDB を接続できます。'
keywords: ['DynamoDB']
title: 'DynamoDB から ClickHouse への CDC（変更データキャプチャ）'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import dynamodb_kinesis_stream from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-kinesis-stream.png';
import dynamodb_s3_export from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-s3-export.png';
import dynamodb_map_columns from '@site/static/images/integrations/data-ingestion/dbms/dynamodb/dynamodb-map-columns.png';
import Image from '@theme/IdealImage';

# DynamoDB から ClickHouse への CDC \\{#cdc-from-dynamodb-to-clickhouse\\}

このページでは、ClickPipes を使用して DynamoDB から ClickHouse への CDC を設定する方法を説明します。この連携は、次の 2 つのコンポーネントから構成されます。

1. S3 ClickPipes による初期スナップショット
2. Kinesis ClickPipes によるリアルタイム更新

データは `ReplacingMergeTree` に取り込まれます。このテーブルエンジンは、更新操作を反映できるようにするために、CDC シナリオで一般的に使用されます。このパターンの詳細は、次のブログ記事で確認できます。

* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 1](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1?loc=docs-rockest-migrations)
* [Change Data Capture (CDC) with PostgreSQL and ClickHouse - Part 2](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2?loc=docs-rockest-migrations)

## 1. Kinesis ストリームをセットアップする \\{#1-set-up-kinesis-stream\\}

まず、DynamoDB テーブルで Kinesis ストリームを有効にして、変更をリアルタイムで取り込めるようにします。スナップショットを作成する前にこの設定を行うことで、データの取りこぼしを防ぎます。
AWS のガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/kds.html)を参照してください。

<Image img={dynamodb_kinesis_stream} size="lg" alt="DynamoDB Kinesis Stream" border/>

## 2. スナップショットを作成する \\{#2-create-the-snapshot\\}

次に、DynamoDB テーブルのスナップショットを作成します。これは、AWS から S3 へのエクスポートで実行できます。AWS のガイドは[こちら](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)を参照してください。
**DynamoDB JSON 形式で「Full export（フルエクスポート）」を実行してください。**

<Image img={dynamodb_s3_export} size="md" alt="DynamoDB S3 Export" border/>

## 3. スナップショットを ClickHouse に読み込む \\{#3-load-the-snapshot-into-clickhouse\\}

### 必要なテーブルを作成する \\{#create-necessary-tables\\}

DynamoDB からのスナップショットデータは次のような形式になります:

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

データがネストされた形式になっていることがわかります。このデータを ClickHouse にロードする前にフラット化する必要があります。これは、ClickHouse の `JSONExtract` 関数を materialized view 内で使用することで実現できます。

ここでは次の 3 つのテーブルを作成します。

1. DynamoDB からの生データを保存するテーブル
2. フラット化後の最終データを保存するテーブル（宛先テーブル）
3. データをフラット化するための materialized view

上記の DynamoDB データの例では、ClickHouse のテーブルは次のようになります。

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

宛先テーブルには、いくつかの要件を満たす必要があります。

* このテーブルは `ReplacingMergeTree` テーブルである必要があります
* テーブルには `version` カラムが必要です
  * 後続の手順で、Kinesis ストリームの `ApproximateCreationDateTime` フィールドを `version` カラムにマッピングします。
* テーブルは、パーティションキーをソートキー（`ORDER BY` で指定）として使用する必要があります
  * 同じソートキーを持つ行は、`version` カラムに基づいて重複排除されます。

### スナップショット用 ClickPipe を作成する \\{#create-the-snapshot-clickpipe\\}

これで、S3 から ClickHouse へスナップショットデータをロードするための ClickPipe を作成できます。S3 ClickPipe ガイドは[こちら](/integrations/clickpipes/object-storage/s3/overview)を参照し、以下の設定を使用してください。

* **Ingest path**: S3 にエクスポートされた JSON ファイルのパスを特定する必要があります。パスは次のような形式になります。

```text
https://{bucket}.s3.amazonaws.com/{prefix}/AWSDynamoDB/{export-id}/data/*
```

* **Format**: JSONEachRow
* **Table**: スナップショット用のテーブル（例: 上記の例では `default.snapshot`）

作成が完了すると、スナップショットテーブルと宛先テーブルへのデータ投入が始まります。次のステップに進む前に、スナップショットのロード完了を待つ必要はありません。

## 4. Kinesis ClickPipe を作成する \\{#4-create-the-kinesis-clickpipe\\}

ここでは、Kinesis ストリームからのリアルタイムでの変更をキャプチャするための Kinesis ClickPipe をセットアップします。Kinesis ClickPipe ガイドは[こちら](/integrations/data-ingestion/clickpipes/kinesis.md)に従いますが、次の設定を使用してください。

- **Stream**: ステップ 1 で使用した Kinesis ストリーム
- **Table**: 宛先テーブル（例: 上記の例では `default.destination`）
- **Flatten object**: true
- **Column mappings**:
  - `ApproximateCreationDateTime`: `version`
  - 他のフィールドは、以下に示すように適切な宛先カラムにマッピングします

<Image img={dynamodb_map_columns} size="md" alt="DynamoDB カラムのマッピング" border/>

## 5. クリーンアップ（任意） \\{#5-cleanup-optional\\}

スナップショット ClickPipe の処理が完了したら、スナップショットテーブルと materialized view を削除して構いません。

```sql
DROP TABLE IF EXISTS "default"."snapshot";
DROP TABLE IF EXISTS "default"."snapshot_clickpipes_error";
DROP VIEW IF EXISTS "default"."snapshot_mv";
```
