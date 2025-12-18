---
title: 'ClickHouse での JSON の扱い方'
sidebar_label: 'JSON の扱い方'
slug: /integrations/clickpipes/mongodb/quickstart
description: 'MongoDB から ClickPipes 経由で ClickHouse にレプリケートされた JSON データを扱うための一般的なパターン'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'データインジェスト', 'リアルタイム同期']
---

# ClickHouse での JSON の取り扱い {#working-with-json-in-clickhouse}

このガイドでは、MongoDB から ClickPipes 経由で ClickHouse にレプリケートされた JSON データを扱う際の、一般的なパターンを説明します。

たとえば、顧客の注文を追跡するために、MongoDB に `t1` コレクションを作成したとします。

```javascript
db.t1.insertOne({
  "order_id": "ORD-001234",
  "customer_id": 98765,
  "status": "completed",
  "total_amount": 299.97,
  "order_date": new Date(),
  "shipping": {
    "method": "express",
    "city": "Seattle",
    "cost": 19.99
  },
  "items": [
    {
      "category": "electronics",
      "price": 149.99
    },
    {
      "category": "accessories",
      "price": 24.99
    }
  ]
})
```

MongoDB CDC Connector は、ClickHouse のネイティブ JSON データ型を使用して MongoDB ドキュメントを ClickHouse にレプリケートします。ClickHouse にレプリケートされたテーブル `t1` には、次のような行が含まれます。

```shell
Row 1:
──────
_id:                "68a4df4b9fe6c73b541703b0"
doc:                {"_id":"68a4df4b9fe6c73b541703b0","customer_id":"98765","items":[{"category":"electronics","price":149.99},{"category":"accessories","price":24.99}],"order_date":"2025-08-19T20:32:11.705Z","order_id":"ORD-001234","shipping":{"city":"Seattle","cost":19.99,"method":"express"},"status":"completed","total_amount":299.97}
_peerdb_synced_at:  2025-08-19 20:50:42.005000000
_peerdb_is_deleted: 0
_peerdb_version:    0
```

## テーブルスキーマ {#table-schema}

レプリケートされたテーブルは、以下の標準スキーマを使用します。

```shell
┌─name───────────────┬─type──────────┐
│ _id                │ String        │
│ doc                │ JSON          │
│ _peerdb_synced_at  │ DateTime64(9) │
│ _peerdb_version    │ Int64         │
│ _peerdb_is_deleted │ Int8          │
└────────────────────┴───────────────┘
```

* `_id`: MongoDB のプライマリキー
* `doc`: JSON データ型としてレプリケートされた MongoDB ドキュメント
* `_peerdb_synced_at`: 行が最後に同期された時刻を記録
* `_peerdb_version`: 行のバージョンを追跡し、行が更新または削除されるとインクリメントされる
* `_peerdb_is_deleted`: 行が削除されているかどうかを示す

### ReplacingMergeTree テーブルエンジン {#replacingmergetree-table-engine}

ClickPipes は、MongoDB コレクションを `ReplacingMergeTree` テーブルエンジンファミリーを使用して ClickHouse にマッピングします。このエンジンでは、特定のプライマリキー（`_id`）に対して、ドキュメントのより新しいバージョン（`_peerdb_version`）を持つ挿入として更新を表現し、更新・置換・削除をバージョン付き挿入として効率的に処理できます。

`ReplacingMergeTree` はバックグラウンドで非同期に重複を削除します。同一行に対して重複が存在しないことを保証するには、[`FINAL` モディファイア](/sql-reference/statements/select/from#final-modifier) を使用します。たとえば次のようになります。

```sql
SELECT * FROM t1 FINAL;
```

### 削除の扱い {#handling-deletes}

MongoDB からの削除は、`_peerdb_is_deleted` カラムで削除済みとしてマークされた新しい行として伝播されます。クエリでは通常、これらをフィルターで除外します。

```sql
SELECT * FROM t1 FINAL WHERE _peerdb_is_deleted = 0;
```

各クエリごとにフィルター条件を指定する代わりに、行レベルのポリシーを作成して削除済みの行を自動的に除外することもできます。

```sql
CREATE ROW POLICY policy_name ON t1
FOR SELECT USING _peerdb_is_deleted = 0;
```

## JSONデータのクエリ {#querying-json-data}

ドット構文を使用して、JSONフィールドを直接クエリできます。

```sql title="Query"
SELECT
    doc.order_id,
    doc.shipping.method
FROM t1;
```

```shell title="Result"
┌-─doc.order_id─┬─doc.shipping.method─┐
│ ORD-001234    │ express             │
└───────────────┴─────────────────────┘
```

ドット構文で *ネストされたオブジェクトのフィールド* をクエリする場合は、必ず [`^`](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-sub-objects-as-sub-columns) 演算子を追加してください。

```sql title="Query"
SELECT doc.^shipping as shipping_info FROM t1;
```

```shell title="Result"
┌─shipping_info──────────────────────────────────────┐
│ {"city":"Seattle","cost":19.99,"method":"express"} │
└────────────────────────────────────────────────────┘
```

### Dynamic 型 {#dynamic-type}

ClickHouse では、JSON の各フィールドは `Dynamic` 型になります。Dynamic 型を使うと、事前に型を知っておくことなく、任意の型の値を ClickHouse に保存できます。これは `toTypeName` 関数で確認できます。

```sql title="Query"
SELECT toTypeName(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type────┐
│ Dynamic │
└─────────┘
```

フィールドに対して実際に使用されているデータ型を確認するには、`dynamicType` 関数を使用します。同じフィールド名でも、行ごとに異なるデータ型を持つ場合があることに注意してください。

```sql title="Query"
SELECT dynamicType(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type──┐
│ Int64 │
└───────┘
```

[Regular functions](https://clickhouse.com/docs/sql-reference/functions/regular-functions) は、通常のカラムと同様に dynamic 型に対しても利用できます。

**例 1: 日付のパース**

```sql title="Query"
SELECT parseDateTimeBestEffortOrNull(doc.order_date) AS order_date FROM t1;
```

```shell title="Result"
┌─order_date──────────┐
│ 2025-08-19 20:32:11 │
└─────────────────────┘
```

**例 2: 条件付きロジック**

```sql title="Query"
SELECT multiIf(
    doc.total_amount < 100, 'less_than_100',
    doc.total_amount < 1000, 'less_than_1000',
    '1000+') AS spendings
FROM t1;
```

```shell title="Result"
┌─spendings──────┐
│ less_than_1000 │
└────────────────┘
```

**例3: 配列操作**

```sql title="Query"
SELECT length(doc.items) AS item_count FROM t1;
```

```shell title="Result"
┌─item_count─┐
│          2 │
└────────────┘
```

### フィールドのキャスト {#field-casting}

ClickHouse の[集約関数](https://clickhouse.com/docs/sql-reference/aggregate-functions/combinators)は、dynamic 型を直接扱うことはできません。たとえば、dynamic 型に対して `sum` 関数を直接使用しようとすると、次のエラーが発生します。

```sql
SELECT sum(doc.shipping.cost) AS shipping_cost FROM t1;
-- DB::Exception: Illegal type Dynamic of argument for aggregate function sum. (ILLEGAL_TYPE_OF_ARGUMENT)
```

集約関数を使用するには、`CAST` 関数または `::` 構文を使ってフィールドを適切な型にキャストします。

```sql title="Query"
SELECT sum(doc.shipping.cost::Float32) AS shipping_cost FROM t1;
```

```shell title="Result"
┌─shipping_cost─┐
│         19.99 │
└───────────────┘
```

:::note
`dynamicType` によって決定される基になるデータ型への dynamic 型からのキャストは非常に高パフォーマンスです。これは、ClickHouse が内部的に、値をすでにその基になる型で保存しているためです。
:::

## JSON のフラット化 {#flattening-json}

### 通常ビュー {#normal-view}

JSON テーブルに対して通常ビューを作成し、フラット化／キャスト／変換ロジックをカプセル化することで、リレーショナルテーブルと同様の形式でデータをクエリできるようにできます。通常ビューは基盤となるデータではなくクエリ自体のみを保存するため、軽量です。例えば次のように作成できます:

```sql
CREATE VIEW v1 AS
SELECT
    CAST(doc._id, 'String') AS object_id,
    CAST(doc.order_id, 'String') AS order_id,
    CAST(doc.customer_id, 'Int64') AS customer_id,
    CAST(doc.status, 'String') AS status,
    CAST(doc.total_amount, 'Decimal64(2)') AS total_amount,
    CAST(parseDateTime64BestEffortOrNull(doc.order_date, 3), 'DATETIME(3)') AS order_date,
    doc.^shipping AS shipping_info,
    doc.items AS items
FROM t1 FINAL
WHERE _peerdb_is_deleted = 0;
```

このビューのスキーマは次のとおりです。

```shell
┌─name────────────┬─type───────────┐
│ object_id       │ String         │
│ order_id        │ String         │
│ customer_id     │ Int64          │
│ status          │ String         │
│ total_amount    │ Decimal(18, 2) │
│ order_date      │ DateTime64(3)  │
│ shipping_info   │ JSON           │
│ items           │ Dynamic        │
└─────────────────┴────────────────┘
```

これで、このビューに対しても、フラット化されたテーブルと同じ要領でクエリを実行できます。

```sql
SELECT
    customer_id,
    sum(total_amount)
FROM v1
WHERE shipping_info.city = 'Seattle'
GROUP BY customer_id
ORDER BY customer_id DESC
LIMIT 10;
```

### リフレッシュ可能なマテリアライズドビュー {#refreshable-materialized-view}

[リフレッシュ可能なマテリアライズドビュー](https://clickhouse.com/docs/materialized-view/refreshable-materialized-view)を作成できます。これにより、行の重複排除を行うクエリの実行をスケジューリングし、その結果をフラット化された宛先テーブルに保存できます。各リフレッシュのたびに、宛先テーブルは最新のクエリ結果で置き換えられます。

この方法の主な利点は、`FINAL` キーワードを使用するクエリがリフレッシュ時に1回だけ実行されるため、その後の宛先テーブルに対するクエリで `FINAL` を使用する必要がなくなることです。

一方の欠点として、宛先テーブル内のデータは最新のリフレッシュ時点までしか反映されません。多くのユースケースでは、数分から数時間程度のリフレッシュ間隔にすることで、データの鮮度とクエリ性能のバランスをうまく取ることができます。

```sql
CREATE TABLE flattened_t1 (
    `_id` String,
    `order_id` String,
    `customer_id` Int64,
    `status` String,
    `total_amount` Decimal(18, 2),
    `order_date` DateTime64(3),
    `shipping_info` JSON,
    `items` Dynamic
)
ENGINE = ReplacingMergeTree()
PRIMARY KEY _id
ORDER BY _id;

CREATE MATERIALIZED VIEW rmv REFRESH EVERY 1 HOUR TO flattened_t1 AS
SELECT 
    CAST(doc._id, 'String') AS _id,
    CAST(doc.order_id, 'String') AS order_id,
    CAST(doc.customer_id, 'Int64') AS customer_id,
    CAST(doc.status, 'String') AS status,
    CAST(doc.total_amount, 'Decimal64(2)') AS total_amount,
    CAST(parseDateTime64BestEffortOrNull(doc.order_date, 3), 'DATETIME(3)') AS order_date,
    doc.^shipping AS shipping_info,
    doc.items AS items
FROM t1 FINAL
WHERE _peerdb_is_deleted = 0;
```

これで `FINAL` 修飾子なしでテーブル `flattened_t1` を直接クエリできるようになりました。

```sql
SELECT
    customer_id,
    sum(total_amount)
FROM flattened_t1
WHERE shipping_info.city = 'Seattle'
GROUP BY customer_id
ORDER BY customer_id DESC
LIMIT 10;
```

### 増分マテリアライズドビュー {#incremental-materialized-view}

フラット化されたカラムにリアルタイムでアクセスしたい場合は、[増分マテリアライズドビュー](https://clickhouse.com/docs/materialized-view/incremental-materialized-view) を作成できます。テーブルに頻繁に更新が行われる場合は、更新のたびにマージが発生するため、マテリアライズドビューで `FINAL` 修飾子を使用することは推奨されません。代わりに、マテリアライズドビューの上に通常のビューを作成し、クエリ時にデータの重複排除を行うようにします。

```sql
CREATE TABLE flattened_t1 (
    `_id` String,
    `order_id` String,
    `customer_id` Int64,
    `status` String,
    `total_amount` Decimal(18, 2),
    `order_date` DateTime64(3),
    `shipping_info` JSON,
    `items` Dynamic,
    `_peerdb_version` Int64,
    `_peerdb_synced_at` DateTime64(9),
    `_peerdb_is_deleted` Int8
)
ENGINE = ReplacingMergeTree()
PRIMARY KEY _id
ORDER BY _id;

CREATE MATERIALIZED VIEW imv TO flattened_t1 AS
SELECT 
    CAST(doc._id, 'String') AS _id,
    CAST(doc.order_id, 'String') AS order_id,
    CAST(doc.customer_id, 'Int64') AS customer_id,
    CAST(doc.status, 'String') AS status,
    CAST(doc.total_amount, 'Decimal64(2)') AS total_amount,
    CAST(parseDateTime64BestEffortOrNull(doc.order_date, 3), 'DATETIME(3)') AS order_date,
    doc.^shipping AS shipping_info,
    doc.items,
    _peerdb_version,
    _peerdb_synced_at,   
    _peerdb_is_deleted
FROM t1;

CREATE VIEW flattened_t1_final AS
SELECT * FROM flattened_t1 FINAL WHERE _peerdb_is_deleted = 0;
```

これで、`flattened_t1_final` ビューを次のようにクエリできます。

```sql
SELECT
    customer_id,
    sum(total_amount)
FROM flattened_t1_final
AND shipping_info.city = 'Seattle'
GROUP BY customer_id
ORDER BY customer_id DESC
LIMIT 10;
```
