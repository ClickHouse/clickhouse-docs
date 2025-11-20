---
title: 'ClickHouse での JSON データの扱い'
sidebar_label: 'JSON データの扱い'
slug: /integrations/clickpipes/mongodb/quickstart
description: 'ClickPipes を介して MongoDB から ClickHouse にレプリケートされた JSON データを扱うための一般的なパターン'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---



# ClickHouse での JSON の扱い

このガイドでは、ClickPipes を介して MongoDB から ClickHouse にレプリケートされた JSON データを扱う際の代表的なパターンを説明します。

MongoDB で顧客の注文を追跡するためのコレクション `t1` を作成したとします。

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

MongoDB CDC Connector はネイティブな JSON データ型を使用して、MongoDB のドキュメントを ClickHouse にレプリケートします。ClickHouse のレプリケートされたテーブル `t1` には、次の行が含まれます。

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

レプリケートされたテーブルは、以下の標準スキーマを使用します：

```shell
┌─name───────────────┬─type──────────┐
│ _id                │ String        │
│ doc                │ JSON          │
│ _peerdb_synced_at  │ DateTime64(9) │
│ _peerdb_version    │ Int64         │
│ _peerdb_is_deleted │ Int8          │
└────────────────────┴───────────────┘
```

- `_id`: MongoDBのプライマリキー
- `doc`: JSON型としてレプリケートされたMongoDBドキュメント
- `_peerdb_synced_at`: 行が最後に同期された日時を記録
- `_peerdb_version`: 行のバージョンを追跡。行が更新または削除されると増分される
- `_peerdb_is_deleted`: 行が削除されているかどうかを示す

### ReplacingMergeTreeテーブルエンジン {#replacingmergetree-table-engine}

ClickPipesは、`ReplacingMergeTree`テーブルエンジンファミリーを使用してMongoDBコレクションをClickHouseにマッピングします。このエンジンでは、更新は指定されたプライマリキー（`_id`）に対するドキュメントの新しいバージョン（`_peerdb_version`）を持つ挿入としてモデル化され、更新、置換、削除をバージョン管理された挿入として効率的に処理できます。

`ReplacingMergeTree`は、バックグラウンドで非同期的に重複を削除します。同じ行の重複がないことを保証するには、[`FINAL`修飾子](/sql-reference/statements/select/from#final-modifier)を使用します。例：

```sql
SELECT * FROM t1 FINAL;
```

### 削除の処理 {#handling-deletes}

MongoDBからの削除は、`_peerdb_is_deleted`カラムを使用して削除済みとしてマークされた新しい行として伝播されます。通常、クエリでこれらをフィルタリングする必要があります：

```sql
SELECT * FROM t1 FINAL WHERE _peerdb_is_deleted = 0;
```

各クエリでフィルタを指定する代わりに、行レベルポリシーを作成して削除された行を自動的にフィルタリングすることもできます：

```sql
CREATE ROW POLICY policy_name ON t1
FOR SELECT USING _peerdb_is_deleted = 0;
```


## JSONデータのクエリ {#querying-json-data}

ドット記法を使用してJSONフィールドを直接クエリできます：

```sql title="クエリ"
SELECT
    doc.order_id,
    doc.shipping.method
FROM t1;
```

```shell title="結果"
┌-─doc.order_id─┬─doc.shipping.method─┐
│ ORD-001234    │ express             │
└───────────────┴─────────────────────┘
```

ドット記法を使用して_ネストされたオブジェクトフィールド_をクエリする場合は、[`^`](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-sub-objects-as-sub-columns)演算子を必ず追加してください：

```sql title="クエリ"
SELECT doc.^shipping as shipping_info FROM t1;
```

```shell title="結果"
┌─shipping_info──────────────────────────────────────┐
│ {"city":"Seattle","cost":19.99,"method":"express"} │
└────────────────────────────────────────────────────┘
```

### Dynamic型 {#dynamic-type}

ClickHouseでは、JSON内の各フィールドは`Dynamic`型を持ちます。Dynamic型により、ClickHouseは型を事前に知ることなく、あらゆる型の値を格納できます。これは`toTypeName`関数で確認できます：

```sql title="クエリ"
SELECT toTypeName(doc.customer_id) AS type FROM t1;
```

```shell title="結果"
┌─type────┐
│ Dynamic │
└─────────┘
```

フィールドの基底データ型を調べるには、`dynamicType`関数を使用します。なお、異なる行で同じフィールド名に対して異なるデータ型を持つことが可能です：

```sql title="クエリ"
SELECT dynamicType(doc.customer_id) AS type FROM t1;
```

```shell title="結果"
┌─type──┐
│ Int64 │
└───────┘
```

[通常の関数](https://clickhouse.com/docs/sql-reference/functions/regular-functions)は、通常のカラムと同様にDynamic型でも動作します：

**例1：日付の解析**

```sql title="クエリ"
SELECT parseDateTimeBestEffortOrNull(doc.order_date) AS order_date FROM t1;
```

```shell title="結果"
┌─order_date──────────┐
│ 2025-08-19 20:32:11 │
└─────────────────────┘
```

**例2：条件ロジック**

```sql title="クエリ"
SELECT multiIf(
    doc.total_amount < 100, 'less_than_100',
    doc.total_amount < 1000, 'less_than_1000',
    '1000+') AS spendings
FROM t1;
```

```shell title="結果"
┌─spendings──────┐
│ less_than_1000 │
└────────────────┘
```

**例3：配列操作**

```sql title="クエリ"
SELECT length(doc.items) AS item_count FROM t1;
```

```shell title="結果"
┌─item_count─┐
│          2 │
└────────────┘
```

### フィールドのキャスト {#field-casting}

ClickHouseの[集約関数](https://clickhouse.com/docs/sql-reference/aggregate-functions/combinators)は、Dynamic型に対して直接動作しません。例えば、Dynamic型に対して`sum`関数を直接使用しようとすると、次のエラーが発生します：

```sql
SELECT sum(doc.shipping.cost) AS shipping_cost FROM t1;
-- DB::Exception: Illegal type Dynamic of argument for aggregate function sum. (ILLEGAL_TYPE_OF_ARGUMENT)
```

集約関数を使用するには、`CAST`関数または`::`構文を使用してフィールドを適切な型にキャストします：

```sql title="クエリ"
SELECT sum(doc.shipping.cost::Float32) AS shipping_cost FROM t1;
```

```shell title="結果"
┌─shipping_cost─┐
│         19.99 │
└───────────────┘
```

:::note
Dynamic型から基底データ型（`dynamicType`で決定される）へのキャストは非常に高性能です。これは、ClickHouseが内部的に既に値を基底型で格納しているためです。
:::


## JSONのフラット化 {#flattening-json}

### 通常ビュー {#normal-view}

JSONテーブルの上に通常ビューを作成することで、フラット化/キャスト/変換ロジックをカプセル化し、リレーショナルテーブルと同様にデータをクエリできます。通常ビューは軽量で、クエリ自体のみを保存し、基礎となるデータは保存しません。例:

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

このビューは以下のスキーマを持ちます:

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

これで、フラット化されたテーブルをクエリするのと同様にビューをクエリできます:

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

[リフレッシュ可能なマテリアライズドビュー](https://clickhouse.com/docs/materialized-view/refreshable-materialized-view)を作成することで、行の重複排除とフラット化された宛先テーブルへの結果保存のためのクエリ実行をスケジュールできます。スケジュールされたリフレッシュごとに、宛先テーブルは最新のクエリ結果で置き換えられます。

この方法の主な利点は、`FINAL`キーワードを使用するクエリがリフレッシュ時に一度だけ実行されるため、宛先テーブルに対する後続のクエリで`FINAL`を使用する必要がなくなることです。

欠点は、宛先テーブルのデータが最新のリフレッシュ時点までしか更新されないことです。多くのユースケースでは、数分から数時間のリフレッシュ間隔が、データの鮮度とクエリパフォーマンスの適切なバランスを提供します。

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

これで、`FINAL`修飾子なしで`flattened_t1`テーブルを直接クエリできます:

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

### インクリメンタルマテリアライズドビュー {#incremental-materialized-view}

フラット化されたカラムにリアルタイムでアクセスしたい場合は、[インクリメンタルマテリアライズドビュー](https://clickhouse.com/docs/materialized-view/incremental-materialized-view)を作成できます。テーブルに頻繁な更新がある場合、マテリアライズドビューで`FINAL`修飾子を使用することは推奨されません。更新のたびにマージがトリガーされるためです。代わりに、マテリアライズドビューの上に通常ビューを構築することで、クエリ時にデータの重複排除を行うことができます。


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

これで、次のようにビュー `flattened_t1_final` をクエリできるようになりました。

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
