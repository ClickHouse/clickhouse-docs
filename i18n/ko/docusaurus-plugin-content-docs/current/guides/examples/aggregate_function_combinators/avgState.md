---
'slug': '/examples/aggregate-function-combinators/avgState'
'title': 'avgState'
'description': 'avgState 조합기를 사용하는 예제'
'keywords':
- 'avg'
- 'state'
- 'combinator'
- 'examples'
- 'avgState'
'sidebar_label': 'avgState'
'doc_type': 'reference'
---


# avgState {#avgState}

## 설명 {#description}

[`State`](/sql-reference/aggregate-functions/combinators#-state) 조합자는 
[`avg`](/sql-reference/aggregate-functions/reference/avg) 
함수에 적용되어 `AggregateFunction(avg, T)` 유형의 중간 상태를 생성합니다. 여기서 
`T`는 평균을 위한 지정된 유형입니다.

## 예제 사용법 {#example-usage}

이번 예제에서는 `AggregateFunction` 유형을 사용하여 
웹사이트 트래픽 데이터를 집계하기 위해 `avgState` 함수를 어떻게 사용할 수 있는지 살펴보겠습니다.

먼저 웹사이트 트래픽 데이터의 소스 테이블을 생성합니다:

```sql
CREATE TABLE raw_page_views
(
    page_id UInt32,
    page_name String,
    response_time_ms UInt32,  -- Page response time in milliseconds
    viewed_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (page_id, viewed_at);
```

평균 응답 시간을 저장할 집계 테이블을 생성합니다. `avg`는 간단한 
`SimpleAggregateFunction` 유형을 사용할 수 없음을 유의하세요. 이는 복잡한 
상태(합계와 수)를 요구하기 때문입니다. 따라서 우리는 `AggregateFunction` 유형을 사용합니다:

```sql
CREATE TABLE page_performance
(
    page_id UInt32,
    page_name String,
    avg_response_time AggregateFunction(avg, UInt32)  -- Stores the state needed for avg calculation
)
ENGINE = AggregatingMergeTree()
ORDER BY page_id;
```

새 데이터에 대한 삽입 트리거 역할을 하여 위에서 정의한 대상 테이블에 
중간 상태 데이터를 저장할 증분 물리화된 뷰를 생성합니다:

```sql
CREATE MATERIALIZED VIEW page_performance_mv
TO page_performance
AS SELECT
    page_id,
    page_name,
    avgState(response_time_ms) AS avg_response_time  -- Using -State combinator
FROM raw_page_views
GROUP BY page_id, page_name;
```

소스 테이블에 최초 데이터를 삽입하여 디스크에 파트를 만듭니다:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
    (1, 'Homepage', 120),
    (1, 'Homepage', 135),
    (2, 'Products', 95),
    (2, 'Products', 105),
    (3, 'About', 80),
    (3, 'About', 90);
```

보다 많은 데이터를 삽입하여 디스크에 두 번째 파트를 생성합니다:

```sql
INSERT INTO raw_page_views (page_id, page_name, response_time_ms) VALUES
(1, 'Homepage', 150),
(2, 'Products', 110),
(3, 'About', 70),
(4, 'Contact', 60),
(4, 'Contact', 65);
```

대상 테이블 `page_performance`를 살펴보세요:

```sql
SELECT 
    page_id,
    page_name,
    avg_response_time,
    toTypeName(avg_response_time)
FROM page_performance
```

```response
┌─page_id─┬─page_name─┬─avg_response_time─┬─toTypeName(avg_response_time)──┐
│       1 │ Homepage  │ �                 │ AggregateFunction(avg, UInt32) │
│       2 │ Products  │ �                 │ AggregateFunction(avg, UInt32) │
│       3 │ About     │ �                 │ AggregateFunction(avg, UInt32) │
│       1 │ Homepage  │ �                 │ AggregateFunction(avg, UInt32) │
│       2 │ Products  │ n                 │ AggregateFunction(avg, UInt32) │
│       3 │ About     │ F                 │ AggregateFunction(avg, UInt32) │
│       4 │ Contact   │ }                 │ AggregateFunction(avg, UInt32) │
└─────────┴───────────┴───────────────────┴────────────────────────────────┘
```

`avg_response_time` 컬럼이 `AggregateFunction(avg, UInt32)` 유형이며 
중간 상태 정보를 저장하고 있음을 유의하세요. 또한 `avg_response_time`에 대한 
행 데이터는 우리의 사용에 유용하지 않으며 `�, n, F, }`와 같은 이상한 문자들이 
보입니다. 이는 터미널이 이진 데이터를 텍스트로 표시하려고 시도하기 때문입니다. 
이유는 `AggregateFunction` 유형이 인간이 읽을 수 있도록 최적화된 것이 아니라 
효율적인 저장과 계산을 위해 이진 형식으로 상태를 저장하기 때문입니다. 이 이진 
상태는 평균을 계산하는 데 필요한 모든 정보를 포함하고 있습니다.

이를 사용하기 위해 `Merge` 조합자를 사용합니다:

```sql
SELECT
    page_id,
    page_name,
    avgMerge(avg_response_time) AS average_response_time_ms
FROM page_performance
GROUP BY page_id, page_name
ORDER BY page_id;
```

이제 올바른 평균을 볼 수 있습니다:

```response
┌─page_id─┬─page_name─┬─average_response_time_ms─┐
│       1 │ Homepage  │                      135 │
│       2 │ Products  │       103.33333333333333 │
│       3 │ About     │                       80 │
│       4 │ Contact   │                     62.5 │
└─────────┴───────────┴──────────────────────────┘
```

## 관련 문서 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`State`](/sql-reference/aggregate-functions/combinators#-state)
