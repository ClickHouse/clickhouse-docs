---
title: 'ClickHouse에서 JSON 데이터 다루기'
sidebar_label: 'JSON 데이터 다루기'
slug: /integrations/clickpipes/mongodb/quickstart
description: 'ClickPipes를 통해 MongoDB에서 ClickHouse로 복제된 JSON 데이터를 다루기 위한 일반적인 패턴'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# ClickHouse에서 JSON 사용하기 \{#working-with-json-in-clickhouse\}

이 가이드는 ClickPipes를 통해 MongoDB에서 ClickHouse로 복제된 JSON 데이터를 다루기 위한 일반적인 패턴을 제공합니다.

MongoDB에 고객 주문을 추적하기 위한 `t1` 컬렉션을 생성했다고 가정합니다.

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

MongoDB CDC Connector는 네이티브 JSON 데이터 타입을 사용하여 MongoDB 문서를 ClickHouse로 복제합니다. ClickHouse의 복제된 테이블 `t1`에는 다음과 같은 행이 저장됩니다.

```shell
Row 1:
──────
_id:                "68a4df4b9fe6c73b541703b0"
doc:                {"_id":"68a4df4b9fe6c73b541703b0","customer_id":"98765","items":[{"category":"electronics","price":149.99},{"category":"accessories","price":24.99}],"order_date":"2025-08-19T20:32:11.705Z","order_id":"ORD-001234","shipping":{"city":"Seattle","cost":19.99,"method":"express"},"status":"completed","total_amount":299.97}
_peerdb_synced_at:  2025-08-19 20:50:42.005000000
_peerdb_is_deleted: 0
_peerdb_version:    0
```


## 테이블 스키마 \{#table-schema\}

복제된 테이블(Replicated Table)은 다음 표준 스키마를 사용합니다.

```shell
┌─name───────────────┬─type──────────┐
│ _id                │ String        │
│ doc                │ JSON          │
│ _peerdb_synced_at  │ DateTime64(9) │
│ _peerdb_version    │ Int64         │
│ _peerdb_is_deleted │ Int8          │
└────────────────────┴───────────────┘
```

* `_id`: MongoDB의 기본 키
* `doc`: JSON 데이터 타입으로 복제된 MongoDB 문서
* `_peerdb_synced_at`: 해당 행이 마지막으로 동기화된 시점을 기록합니다.
* `_peerdb_version`: 행의 버전을 추적하며, 행이 업데이트되거나 삭제될 때 증가합니다.
* `_peerdb_is_deleted`: 행이 삭제되었는지 여부를 표시합니다.


### ReplacingMergeTree 테이블 엔진 \{#replacingmergetree-table-engine\}

ClickPipes는 MongoDB 컬렉션을 ClickHouse에 매핑할 때 `ReplacingMergeTree` 테이블 엔진 계열을 사용합니다. 이 엔진에서는 업데이트가 특정 기본 키(`_id`)에 대해 더 최신 버전(`_peerdb_version`)의 문서를 삽입하는 방식으로 표현되며, 버전 정보가 포함된 insert로 업데이트, 교체, 삭제를 효율적으로 처리할 수 있습니다.

`ReplacingMergeTree`는 백그라운드에서 비동기적으로 중복을 제거합니다. 동일한 행에 대해 중복이 발생하지 않도록 보장하려면 [`FINAL` 수정자](/sql-reference/statements/select/from#final-modifier)를 사용하십시오. 예를 들어:

```sql
SELECT * FROM t1 FINAL;
```


### 삭제 처리 \{#handling-deletes\}

MongoDB에서 발생한 삭제는 `_peerdb_is_deleted` 컬럼에 삭제 여부가 표시된 새로운 행으로 전파됩니다. 일반적으로 쿼리에서 이러한 행을 필터링하는 것이 권장됩니다:

```sql
SELECT * FROM t1 FINAL WHERE _peerdb_is_deleted = 0;
```

각 쿼리마다 필터를 지정하는 대신, 삭제된 행을 자동으로 필터링하는 행 수준 정책(row-level policy)을 생성할 수도 있습니다.

```sql
CREATE ROW POLICY policy_name ON t1
FOR SELECT USING _peerdb_is_deleted = 0;
```


## JSON 데이터 쿼리하기 \{#querying-json-data\}

점(dot) 표기법을 사용하여 JSON 필드를 직접 쿼리할 수 있습니다:

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

점 표기법을 사용해 *중첩 객체 필드*를 쿼리할 때는 [`^`](https://clickhouse.com/docs/sql-reference/data-types/newjson#reading-json-sub-objects-as-sub-columns) 연산자를 반드시 추가해야 합니다:

```sql title="Query"
SELECT doc.^shipping as shipping_info FROM t1;
```

```shell title="Result"
┌─shipping_info──────────────────────────────────────┐
│ {"city":"Seattle","cost":19.99,"method":"express"} │
└────────────────────────────────────────────────────┘
```


### Dynamic 타입 \{#dynamic-type\}

ClickHouse에서 각 JSON 필드는 `Dynamic` 타입을 가집니다. Dynamic 타입을 사용하면 ClickHouse가 타입을 미리 알지 못하더라도 어떤 타입의 값이든 저장할 수 있습니다. `toTypeName` 함수로 이를 확인할 수 있습니다:

```sql title="Query"
SELECT toTypeName(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type────┐
│ Dynamic │
└─────────┘
```

필드의 실제 데이터 타입을 확인하려면 `dynamicType` FUNCTION을 사용할 수 있습니다. 동일한 필드 이름이라도 서로 다른 행에서 서로 다른 데이터 타입을 가질 수 있다는 점에 유의하십시오.

```sql title="Query"
SELECT dynamicType(doc.customer_id) AS type FROM t1;
```

```shell title="Result"
┌─type──┐
│ Int64 │
└───────┘
```

[일반 함수](https://clickhouse.com/docs/sql-reference/functions/regular-functions)는 동적 타입에서도 일반 컬럼과 마찬가지로 동작합니다:

**예제 1: 날짜 파싱**

```sql title="Query"
SELECT parseDateTimeBestEffortOrNull(doc.order_date) AS order_date FROM t1;
```

```shell title="Result"
┌─order_date──────────┐
│ 2025-08-19 20:32:11 │
└─────────────────────┘
```

**예제 2: 조건부 로직**

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

**예제 3: 배열 연산**

```sql title="Query"
SELECT length(doc.items) AS item_count FROM t1;
```

```shell title="Result"
┌─item_count─┐
│          2 │
└────────────┘
```


### 필드 캐스팅 \{#field-casting\}

ClickHouse의 [Aggregation functions](https://clickhouse.com/docs/sql-reference/aggregate-functions/combinators)는 동적 타입(dynamic type)과는 직접적으로 동작하지 않습니다. 예를 들어, 동적 타입에 `sum` 함수를 바로 사용하려고 하면 다음과 같은 오류가 발생합니다.

```sql
SELECT sum(doc.shipping.cost) AS shipping_cost FROM t1;
-- DB::Exception: Illegal type Dynamic of argument for aggregate function sum. (ILLEGAL_TYPE_OF_ARGUMENT)
```

집계 함수를 사용하려면 `CAST` 함수 또는 `::` 구문을 사용해 필드를 적절한 타입으로 변환합니다.

```sql title="Query"
SELECT sum(doc.shipping.cost::Float32) AS shipping_cost FROM t1;
```

```shell title="Result"
┌─shipping_cost─┐
│         19.99 │
└───────────────┘
```

:::note
`dynamicType`로 결정되는 기본 데이터 타입으로 dynamic 타입에서 캐스팅하는 작업은 매우 효율적입니다. ClickHouse는 내부적으로 이미 값을 해당 기본 타입으로 저장하고 있기 때문입니다.
:::


## JSON 평탄화 \{#flattening-json\}

### 일반 뷰 \{#normal-view\}

JSON 테이블을 기반으로 일반 뷰를 생성하여 평탄화/캐스팅/변환 로직을 캡슐화하면, 관계형 테이블과 유사한 방식으로 데이터를 쿼리할 수 있습니다. 일반 뷰는 원본 데이터가 아니라 쿼리 자체만 저장하므로 가볍습니다. 예를 들면 다음과 같습니다:

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

이 VIEW의 스키마는 다음과 같습니다:

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

이제 평탄화된 테이블을 쿼리할 때와 마찬가지 방식으로 VIEW를 쿼리할 수 있습니다:

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


### 갱신 가능 구체화 뷰 \{#refreshable-materialized-view\}

[갱신 가능 구체화 뷰(Refreshable Materialized Views)](https://clickhouse.com/docs/materialized-view/refreshable-materialized-view)를 생성하면, 행 중복 제거를 위한 쿼리 실행을 일정에 따라 수행하고 그 결과를 평탄화된 대상 테이블에 저장할 수 있습니다. 각 예약된 갱신 시마다 대상 테이블은 최신 쿼리 결과로 대체됩니다.

이 방법의 핵심적인 장점은 `FINAL` 키워드를 사용하는 쿼리가 각 갱신 시 한 번만 실행되므로, 이후 대상 테이블에 대한 쿼리에서 `FINAL`을 사용할 필요가 없다는 점입니다.

단점은 대상 테이블의 데이터가 가장 최근 갱신 시점까지만 최신 상태를 유지한다는 것입니다. 많은 사용 사례에서 수 분에서 수 시간 단위의 갱신 주기는 데이터 신선도와 쿼리 성능 간의 적절한 균형을 제공합니다.

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

이제 `FINAL` 수정자를 사용하지 않고 `flattened_t1` 테이블을 바로 쿼리할 수 있습니다.

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


### 증분형 materialized view \{#incremental-materialized-view\}

실시간으로 평탄화된 컬럼에 접근하려면 [증분형 materialized view(Incremental Materialized View)](https://clickhouse.com/docs/materialized-view/incremental-materialized-view)를 생성할 수 있습니다. 테이블에 업데이트가 자주 발생하는 경우, 매 업데이트마다 머지 작업이 실행되므로 materialized view에서 `FINAL` 수정자를 사용하는 것은 권장되지 않습니다. 대신 materialized view 위에 일반 VIEW를 생성하여 쿼리 시점에 데이터 중복 제거를 수행할 수 있습니다.

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

이제 VIEW `flattened_t1_final`을(를) 다음과 같이 쿼리할 수 있습니다:

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
