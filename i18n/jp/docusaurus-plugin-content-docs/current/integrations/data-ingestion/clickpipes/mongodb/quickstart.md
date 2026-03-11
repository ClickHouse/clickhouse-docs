---
title: 'ClickHouse における JSON の扱い'
sidebar_label: 'JSON の扱い'
slug: /integrations/clickpipes/mongodb/quickstart
description: 'ClickPipes を使用して MongoDB から ClickHouse へレプリケーションされた JSON データを扱う際の一般的なパターン'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# ClickHouse での JSON の扱い方 \{#working-with-json-in-clickhouse\}

このガイドでは、ClickPipes を使用して MongoDB から ClickHouse にレプリケートされた JSON データを扱う際の一般的なパターンを紹介します。

MongoDB に顧客注文を追跡するためのコレクション `t1` を作成したとします。

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

MongoDB CDC Connector は、ネイティブ JSON データ型を使用して MongoDB のドキュメントを ClickHouse にレプリケートします。ClickHouse 上のレプリケートされたテーブル `t1` には、次の行が含まれます。

```shell
Row 1:
──────
_id:                "68a4df4b9fe6c73b541703b0"
doc:                {"_id":"68a4df4b9fe6c73b541703b0","customer_id":"98765","items":[{"category":"electronics","price":149.99},{"category":"accessories","price":24.99}],"order_date":"2025-08-19T20:32:11.705Z","order_id":"ORD-001234","shipping":{"city":"Seattle","cost":19.99,"method":"express"},"status":"completed","total_amount":299.97}
_peerdb_synced_at:  2025-08-19 20:50:42.005000000
_peerdb_is_deleted: 0
_peerdb_version:    0
```

## テーブルスキーマ \{#table-schema\}

レプリカテーブルは次の標準的なスキーマを使用します。

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
* `doc`: JSON データ型として複製された MongoDB ドキュメント
* `_peerdb_synced_at`: 行が最後に同期された時刻を記録します
* `_peerdb_version`: 行のバージョンを追跡します。行が更新または削除されるたびにインクリメントされます
* `_peerdb_is_deleted`: 行が削除済みかどうかを示します

### ReplacingMergeTree テーブルエンジン \{#replacingmergetree-table-engine\}

ClickPipes は MongoDB のコレクションを ClickHouse にマッピングする際に、`ReplacingMergeTree` テーブルエンジンファミリーを使用します。このエンジンでは、更新は特定のプライマリキー (`_id`) に対するドキュメントの新しいバージョン (`_peerdb_version`) を持つ INSERT として表現され、バージョン付き INSERT として更新・置換・削除を効率的に処理できるようになります。

`ReplacingMergeTree` は、重複をバックグラウンドで非同期に削除します。同じ行に対する重複が存在しないことを保証するには、[`FINAL` 修飾子](/sql-reference/statements/select/from#final-modifier) を使用します。例えば次のとおりです。

```sql
SELECT * FROM t1 FINAL;
```

### 削除の扱い \{#handling-deletes\}

MongoDB での削除は、`_peerdb_is_deleted` カラムに削除フラグが立てられた新しい行として反映されます。通常、クエリではこれらを除外する条件を指定します。

```sql
SELECT * FROM t1 FINAL WHERE _peerdb_is_deleted = 0;
```

各クエリでフィルターを指定する代わりに、行レベルのポリシーを作成して削除された行を自動的に除外することもできます。

```sql
CREATE ROW POLICY policy_name ON t1
FOR SELECT USING _peerdb_is_deleted = 0;
```

## JSON データのクエリ \{#querying-json-data\}

ドット記法を使用して JSON フィールドを直接クエリできます。

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

ドット構文で *ネストされたオブジェクトフィールド* をクエリする場合は、[`^`](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-sub-objects-as-sub-columns) 演算子を必ず追加してください。

```sql title="Query"
SELECT doc.^shipping as shipping_info FROM t1;
```

```shell title="Result"
┌─shipping_info──────────────────────────────────────┐
│ {"city":"Seattle","cost":19.99,"method":"express"} │
└────────────────────────────────────────────────────┘
```

### Dynamic 型 \{#dynamic-type\}

ClickHouse では、JSON 内の各フィールドは `Dynamic` 型です。Dynamic 型により、ClickHouse は型を事前に把握していなくても、あらゆる型の値を保存できます。`toTypeName` 関数を使って、これを確認できます。

```sql title="Query"
SELECT toTypeName(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type────┐
│ Dynamic │
└─────────┘
```

フィールドの実際のデータ型を確認するには、`dynamicType` 関数で確認できます。なお、同じフィールド名でも、行によって異なるデータ型を持つ場合があることに注意してください。

```sql title="Query"
SELECT dynamicType(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type──┐
│ Int64 │
└───────┘
```

[Regular functions](https://clickhouse.com/docs/sql-reference/functions/regular-functions) は、通常のカラムと同様に、Dynamic 型に対しても利用できます。

**例 1: 日付の解析**

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

**例 3: 配列操作**

```sql title="Query"
SELECT length(doc.items) AS item_count FROM t1;
```

```shell title="Result"
┌─item_count─┐
│          2 │
└────────────┘
```

### フィールドのキャスト \{#field-casting\}

ClickHouse の [集約関数](https://clickhouse.com/docs/sql-reference/aggregate-functions/combinators) は dynamic 型をそのまま扱うことはできません。たとえば、dynamic 型に対して `sum` 関数を直接使用しようとすると、次のようなエラーが発生します。

```sql
SELECT sum(doc.shipping.cost) AS shipping_cost FROM t1;
-- DB::Exception: Illegal type Dynamic of argument for aggregate function sum. (ILLEGAL_TYPE_OF_ARGUMENT)
```

集約関数を使用するには、`CAST` 関数または `::` 構文を使って、フィールドを適切な型にキャストします。

```sql title="Query"
SELECT sum(doc.shipping.cost::Float32) AS shipping_cost FROM t1;
```

```shell title="Result"
┌─shipping_cost─┐
│         19.99 │
└───────────────┘
```

:::note
`dynamicType` によって決定される基礎となるデータ型への Dynamic 型からのキャストは、ClickHouse が内部的にすでに値をその基礎となる型で保持しているため、非常に高パフォーマンスです。
:::

## JSON のフラット化 \{#flattening-json\}

### 通常のビュー \{#normal-view\}

JSON テーブルに対して通常のビューを作成し、フラット化や型変換／その他の変換ロジックをカプセル化することで、リレーショナルテーブルと同様にデータをクエリできるようにできます。通常のビューは、基盤となるデータではなくクエリ自体のみを保存するため、軽量です。例えば次のとおりです。

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

このVIEWのスキーマは次のとおりです。

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

これで、フラット化したテーブルに対して行うのと同じ要領で、このビューにクエリを実行できます。

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

### リフレッシャブルmaterialized view \{#refreshable-materialized-view\}

[Refreshable Materialized Views](https://clickhouse.com/docs/materialized-view/refreshable-materialized-view) を作成することで、クエリの実行をスケジュールし、行の重複を排除したうえで、その結果をフラット化された宛先テーブルに保存できます。スケジュールされた各リフレッシュのたびに、宛先テーブルは最新のクエリ結果で置き換えられます。

この方法の主な利点は、`FINAL` キーワードを使用するクエリがリフレッシュ時に一度だけ実行されるため、その後の宛先テーブルに対するクエリでは `FINAL` を使用する必要がない点です。

欠点として、宛先テーブル内のデータは、最新のリフレッシュ時点の状態までしか更新されません。多くのユースケースでは、数分から数時間のリフレッシュ間隔により、データの鮮度とクエリ性能のバランスが良好になります。

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

これで、`FINAL` 修飾子を付けずに `flattened_t1` テーブルを直接クエリできます。

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

### インクリメンタルmaterialized view \{#incremental-materialized-view\}

フラット化されたカラムにリアルタイムでアクセスしたい場合は、[インクリメンタルmaterialized view](https://clickhouse.com/docs/materialized-view/incremental-materialized-view) を作成できます。テーブルに頻繁に更新がある場合、更新のたびにマージがトリガーされるため、materialized view で `FINAL` 修飾子を使用することは推奨されません。代わりに、materialized view の上に通常のビューを作成し、クエリ時にデータの重複排除を行うことができます。

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

これで、次のように `flattened_t1_final` VIEW に対してクエリを実行できます。

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
