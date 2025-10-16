---
'title': 'ClickHouseでのJSON作業'
'sidebar_label': 'JSONの作業'
'slug': '/integrations/clickpipes/mongodb/quickstart'
'description': 'MongoDBからClickHouseへClickPipesを介して複製されたJSONデータでの一般的なパターン'
'doc_type': 'guide'
---


# JSONをClickHouseで扱う

このガイドでは、MongoDBからClickHouseにClickPipesを通じてレプリケートされたJSONデータを扱うための一般的なパターンを提供します。

MongoDBで顧客の注文を追跡するために`t1`というコレクションを作成したとしましょう：

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

MongoDB CDCコネクターはMongoDBのドキュメントをClickHouseにレプリケートする際、ネイティブのJSONデータ型を使用します。ClickHouseのレプリケートされたテーブル`t1`は次のような行を含みます：

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

レプリケートされたテーブルは以下の標準スキーマを使用します：

```shell
┌─name───────────────┬─type──────────┐
│ _id                │ String        │
│ doc                │ JSON          │
│ _peerdb_synced_at  │ DateTime64(9) │
│ _peerdb_version    │ Int64         │
│ _peerdb_is_deleted │ Int8          │
└────────────────────┴───────────────┘
```

- `_id`: MongoDBからの主キー
- `doc`: JSONデータ型としてレプリケートされたMongoDBドキュメント
- `_peerdb_synced_at`: 行が最後に同期された日時を記録
- `_peerdb_version`: 行のバージョンを追跡; 行が更新または削除されると増加
- `_peerdb_is_deleted`: 行が削除されたかどうかを示すフラグ

### ReplacingMergeTreeテーブルエンジン {#replacingmergetree-table-engine}

ClickPipesはMongoDBのコレクションをClickHouseに`ReplacingMergeTree`テーブルエンジンファミリーを使用してマップします。このエンジンを使うと、更新は指定された主キー（`_id`）のドキュメントの新しいバージョン（`_peerdb_version`）として挿入としてモデル化されるため、更新、置き換え、および削除をバージョン付き挿入として効率的に処理できます。

`ReplacingMergeTree`はバックグラウンドで非同期に重複データをクリアします。同じ行に対する重複を排除するには、[`FINAL`修飾子](/sql-reference/statements/select/from#final-modifier)を使用してください。例えば：

```sql
SELECT * FROM t1 FINAL;
```

### 削除の処理 {#handling-deletes}

MongoDBからの削除は、`_peerdb_is_deleted`カラムを使用して削除されたとマークされた新しい行として伝播されます。通常、これらをクエリでフィルターすることを望むでしょう：

```sql
SELECT * FROM t1 FINAL WHERE _peerdb_is_deleted = 0;
```

特定のクエリにフィルターを指定する代わりに、削除された行を自動的にフィルターする行レベルポリシーを作成することもできます：

```sql
CREATE ROW POLICY policy_name ON t1
FOR SELECT USING _peerdb_is_deleted = 0;
```

## JSONデータのクエリ {#querying-json-data}

ドット構文を使用してJSONフィールドを直接クエリできます：

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

ドット構文を使用して_ネストされたオブジェクトフィールド_をクエリする際は、[`^`](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-sub-objects-as-sub-columns)演算子を追加してください：

```sql title="Query"
SELECT doc.^shipping as shipping_info FROM t1;
```

```shell title="Result"
┌─shipping_info──────────────────────────────────────┐
│ {"city":"Seattle","cost":19.99,"method":"express"} │
└────────────────────────────────────────────────────┘
```

### 動的型 {#dynamic-type}

ClickHouseでは、JSON内の各フィールドは`Dynamic`型を持っています。動的型により、ClickHouseはあらかじめ型を知らなくても任意の型の値を保存できます。`toTypeName`関数でこれを確認できます：

```sql title="Query"
SELECT toTypeName(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type────┐
│ Dynamic │
└─────────┘
```

フィールドの基礎となるデータ型を調べるには、`dynamicType`関数を使用して確認できます。同じフィールド名に対して異なる行で異なるデータ型があることもあります：

```sql title="Query"
SELECT dynamicType(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type──┐
│ Int64 │
└───────┘
```

[通常の関数](https://clickhouse.com/docs/sql-reference/functions/regular-functions)は、通常のカラムと同様に動的型でも動作します：

**例1: 日付の解析**

```sql title="Query"
SELECT parseDateTimeBestEffortOrNull(doc.order_date) AS order_date FROM t1;
```

```shell title="Result"
┌─order_date──────────┐
│ 2025-08-19 20:32:11 │
└─────────────────────┘
```

**例2: 条件ロジック**

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

### フィールドキャスティング {#field-casting}

ClickHouseの[集約関数](https://clickhouse.com/docs/sql-reference/aggregate-functions/combinators)は動的型と直接連携しません。例えば、動的型に対して`sum`関数を直接使用しようとすると、次のようなエラーが発生します：

```sql
SELECT sum(doc.shipping.cost) AS shipping_cost FROM t1;
-- DB::Exception: Illegal type Dynamic of argument for aggregate function sum. (ILLEGAL_TYPE_OF_ARGUMENT)
```

集約関数を使用するには、`CAST`関数または`::`構文を使用してフィールドを適切な型にキャストします：

```sql title="Query"
SELECT sum(doc.shipping.cost::Float32) AS shipping_cost FROM t1;
```

```shell title="Result"
┌─shipping_cost─┐
│         19.99 │
└───────────────┘
```

:::note
動的型から基礎となるデータ型（`dynamicType`で決定される）へのキャスティングは非常に高効率です。ClickHouseはすでに内部で基礎となる型に値を保存しています。
:::

## JSONのフラット化 {#flattening-json}

### 通常のビュー {#normal-view}

JSONテーブルの上に通常のビューを作成して、フラット化/キャスト/変換のロジックをカプセル化し、リレーショナルテーブルに似たデータをクエリできます。通常のビューは軽量で、クエリ自体のみを保存し、基礎となるデータは保存しません。例えば：

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

このビューは次のスキーマを持ちます：

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

これで、平坦化されたテーブルをクエリするかのようにビューをクエリできます：

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

[リフレッシュ可能なマテリアライズドビュー](https://clickhouse.com/docs/materialized-view/refreshable-materialized-view)を作成することで、重複行を除去し、その結果をフラットな宛先テーブルに格納するためのクエリ実行をスケジュールできます。各スケジュールされたリフレッシュの際に、宛先テーブルは最新のクエリ結果で置き換えられます。

この方法の主な利点は、`FINAL`キーワードを使用したクエリがリフレッシュ中に一度だけ実行されるため、宛先テーブルに対してその後のクエリが`FINAL`を使用する必要がなくなることです。

欠点は、宛先テーブルのデータが最も最近のリフレッシュに基づいた最新のものでしかないということです。多くのユースケースでは、数分から数時間の範囲のリフレッシュ間隔がデータの新鮮さとクエリパフォーマンスのバランスを提供します。

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

これで、`FINAL`修飾子なしで`flattened_t1`テーブルを直接クエリできます：

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

フラットなカラムにリアルタイムでアクセスしたい場合、[増分マテリアライズドビュー](https://clickhouse.com/docs/materialized-view/incremental-materialized-view)を作成できます。テーブルに頻繁な更新がある場合、マテリアライズドビュー内で`FINAL`修飾子を使用することは推奨されません。すべての更新がマージを引き起こすためです。代わりに、マテリアライズドビューの上に通常のビューを構築することで、クエリ時にデータを重複排除できます。

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

これで、ビュー`flattened_t1_final`を次のようにクエリできます：

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
