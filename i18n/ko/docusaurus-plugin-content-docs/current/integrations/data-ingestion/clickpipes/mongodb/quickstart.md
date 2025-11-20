---
'title': 'ClickHouse에서 JSON 작업하기'
'sidebar_label': 'JSON으로 작업하기'
'slug': '/integrations/clickpipes/mongodb/quickstart'
'description': 'ClickPipes를 통해 MongoDB에서 ClickHouse로 복제된 JSON 데이터로 작업하는 일반적인 패턴'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mongodb'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---


# Working with JSON in ClickHouse

이 가이드는 ClickPipes를 통해 MongoDB에서 ClickHouse로 복제된 JSON 데이터 작업을 위한 일반 패턴을 제공합니다.

MongoDB에서 고객 주문을 추적하기 위해 `t1`이라는 컬렉션을 만들었다고 가정해 보겠습니다:

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

MongoDB CDC 커넥터는 기본 JSON 데이터 유형을 사용하여 MongoDB 문서를 ClickHouse로 복제합니다. ClickHouse의 복제된 테이블 `t1`에는 다음 행이 포함됩니다:

```shell
Row 1:
──────
_id:                "68a4df4b9fe6c73b541703b0"
doc:                {"_id":"68a4df4b9fe6c73b541703b0","customer_id":"98765","items":[{"category":"electronics","price":149.99},{"category":"accessories","price":24.99}],"order_date":"2025-08-19T20:32:11.705Z","order_id":"ORD-001234","shipping":{"city":"Seattle","cost":19.99,"method":"express"},"status":"completed","total_amount":299.97}
_peerdb_synced_at:  2025-08-19 20:50:42.005000000
_peerdb_is_deleted: 0
_peerdb_version:    0
```

## Table schema {#table-schema}

복제된 테이블은 다음 표준 스키마를 사용합니다:

```shell
┌─name───────────────┬─type──────────┐
│ _id                │ String        │
│ doc                │ JSON          │
│ _peerdb_synced_at  │ DateTime64(9) │
│ _peerdb_version    │ Int64         │
│ _peerdb_is_deleted │ Int8          │
└────────────────────┴───────────────┘
```

- `_id`: MongoDB의 기본 키
- `doc`: JSON 데이터 유형으로 복제된 MongoDB 문서
- `_peerdb_synced_at`: 행이 마지막으로 동기화된 시간을 기록합니다
- `_peerdb_version`: 행의 버전을 추적하며, 행이 업데이트되거나 삭제될 때 증가합니다
- `_peerdb_is_deleted`: 행이 삭제되었는지 여부를 표시합니다

### ReplacingMergeTree table engine {#replacingmergetree-table-engine}

ClickPipes는 `ReplacingMergeTree` 테이블 엔진 패밀리를 사용하여 MongoDB 컬렉션을 ClickHouse에 매핑합니다. 이 엔진을 사용하면 업데이트가 특정 기본 키(`_id`)에 대해 문서의 새로운 버전(`_peerdb_version`)을 가진 삽입으로 모델링되어 업데이트, 대체 및 삭제를 버전화된 삽입으로 효율적으로 처리할 수 있습니다. 

`ReplacingMergeTree`는 중복 항목을 백그라운드에서 비동기적으로 제거합니다. 같은 행에 대해 중복 항목이 없도록 보장하려면 [`FINAL` modifier](/sql-reference/statements/select/from#final-modifier)를 사용하십시오. 예를 들어:

```sql
SELECT * FROM t1 FINAL;
```

### Handling deletes {#handling-deletes}

MongoDB에서 삭제는 `_peerdb_is_deleted` 컬럼을 사용하여 삭제된 것으로 표시된 새로운 행으로 전파됩니다. 일반적으로 쿼리에서 이를 필터링하려고 합니다:

```sql
SELECT * FROM t1 FINAL WHERE _peerdb_is_deleted = 0;
```

각 쿼리에서 필터를 지정하는 대신 삭제된 행을 자동으로 필터링하는 행 수준 정책을 생성할 수도 있습니다:

```sql
CREATE ROW POLICY policy_name ON t1
FOR SELECT USING _peerdb_is_deleted = 0;
```

## Querying JSON data {#querying-json-data}

점 표기법을 사용하여 JSON 필드를 직접 쿼리할 수 있습니다:

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

점 표기법을 사용하여 _중첩 객체 필드_를 쿼리할 때는 [`^`](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-sub-objects-as-sub-columns) 연산자를 추가해야 합니다:

```sql title="Query"
SELECT doc.^shipping as shipping_info FROM t1;
```

```shell title="Result"
┌─shipping_info──────────────────────────────────────┐
│ {"city":"Seattle","cost":19.99,"method":"express"} │
└────────────────────────────────────────────────────┘
```

### Dynamic type {#dynamic-type}

ClickHouse에서는 JSON의 각 필드가 `Dynamic` 유형을 가집니다. 동적 유형은 ClickHouse가 사전 지식 없이도 모든 유형의 값을 저장할 수 있게 합니다. `toTypeName` 함수를 사용하여 이를 확인할 수 있습니다:

```sql title="Query"
SELECT toTypeName(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type────┐
│ Dynamic │
└─────────┘
```

필드의 기본 데이터 유형을 조사하려면 `dynamicType` 함수를 사용할 수 있습니다. 참고로 같은 필드 이름에 대해 다른 행에서 다른 데이터 유형이 있을 수 있습니다:

```sql title="Query"
SELECT dynamicType(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type──┐
│ Int64 │
└───────┘
```

[정규 함수](https://clickhouse.com/docs/sql-reference/functions/regular-functions)는 동적 유형에서도 일반 컬럼과 같이 작동합니다:

**예제 1: 날짜 파싱**

```sql title="Query"
SELECT parseDateTimeBestEffortOrNull(doc.order_date) AS order_date FROM t1;
```

```shell title="Result"
┌─order_date──────────┐
│ 2025-08-19 20:32:11 │
└─────────────────────┘
```

**예제 2: 조건 논리**

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

**예제 3: 배열 작업**

```sql title="Query"
SELECT length(doc.items) AS item_count FROM t1;
```

```shell title="Result"
┌─item_count─┐
│          2 │
└────────────┘
```

### Field casting {#field-casting}

ClickHouse의 [집계 함수](https://clickhouse.com/docs/sql-reference/aggregate-functions/combinators)는 동적 유형에 직접적으로 작동하지 않습니다. 예를 들어, 동적 유형에서 직접 `sum` 함수를 사용하려고 하면 다음과 같은 오류가 발생합니다:

```sql
SELECT sum(doc.shipping.cost) AS shipping_cost FROM t1;
-- DB::Exception: Illegal type Dynamic of argument for aggregate function sum. (ILLEGAL_TYPE_OF_ARGUMENT)
```

집계 함수를 사용하려면 필드를 적절한 유형으로 `CAST` 함수나 `::` 구문을 사용하여 캐스팅하십시오:

```sql title="Query"
SELECT sum(doc.shipping.cost::Float32) AS shipping_cost FROM t1;
```

```shell title="Result"
┌─shipping_cost─┐
│         19.99 │
└───────────────┘
```

:::note
동적 유형에서 기본 데이터 유형( `dynamicType`으로 결정됨)으로 캐스팅하는 것은 ClickHouse가 내부적으로 해당 값을 기본 유형으로 이미 저장하고 있기 때문에 매우 성능이 좋습니다.
:::

## Flattening JSON {#flattening-json}

### Normal view {#normal-view}

JSON 테이블 위에 정규 뷰를 생성하여 데이터를 관계형 테이블처럼 쿼리하기 위한 평탄화/캐스팅/변환 논리를 캡슐화할 수 있습니다. 정규 뷰는 쿼리 자체만 저장하므로 경량입니다. 예를 들어:

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

이 뷰는 다음 스키마를 가집니다:

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

이제 평탄화된 테이블을 쿼리하는 것과 비슷하게 뷰를 쿼리할 수 있습니다:

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

### Refreshable materialized view {#refreshable-materialized-view}

[Refreshable Materialized Views](https://clickhouse.com/docs/materialized-view/refreshable-materialized-view)를 생성할 수 있으며, 이 뷰를 통해 행을 중복 제거하는 쿼리 실행을 예약할 수 있고, 결과를 평탄화된 목적 테이블에 저장할 수 있습니다. 매번 예약된 새로 고침 시, 목적 테이블이 최신 쿼리 결과로 대체됩니다.

이 방법의 주요 장점은 `FINAL` 키워드를 사용하는 쿼리가 새로 고침 중에 한 번만 실행되므로, 목적 테이블에서 이후 쿼리에 `FINAL`을 사용할 필요가 없다는 점입니다.

단점은 목적 테이블의 데이터가 최신 새로 고침 시점까지만 최신이라는 것입니다. 많은 사용 사례에서는 몇 분에서 몇 시간 사이의 새로 고침 간격이 데이터 신선도와 쿼리 성능 사이의 적절한 균형을 제공합니다.

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

이제 `FINAL` 수정자 없이 테이블 `flattened_t1`을 직접 쿼리할 수 있습니다:

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

### Incremental materialized view {#incremental-materialized-view}

실시간으로 평탄화된 컬럼에 접근하려면 [Incremental Materialized Views](https://clickhouse.com/docs/materialized-view/incremental-materialized-view)를 생성할 수 있습니다. 테이블에 빈번한 업데이트가 있다면, 매 업데이트가 병합을 유발하므로 물리화된 뷰에서 `FINAL` 수정자를 사용하는 것은 권장되지 않습니다. 대신, 물리화된 뷰 위에 정규 뷰를 구축하여 쿼리 시 데이터의 중복을 제거할 수 있습니다.

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

이제 뷰 `flattened_t1_final`을 다음과 같이 쿼리할 수 있습니다:

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
