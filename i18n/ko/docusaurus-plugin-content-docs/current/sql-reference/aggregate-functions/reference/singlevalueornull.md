---
'description': '집계 함수 `singleValueOrNull`은 서브쿼리 연산자를 구현하는 데 사용됩니다, 예를 들어 `x = ALL
  (SELECT ...)`와 같은 경우입니다. 이 함수는 데이터에 유일한 비-NULL 값이 하나만 있는지 확인합니다.'
'sidebar_position': 184
'slug': '/sql-reference/aggregate-functions/reference/singlevalueornull'
'title': 'singleValueOrNull'
'doc_type': 'reference'
---


# singleValueOrNull

집계 함수 `singleValueOrNull`은 `x = ALL (SELECT ...)`와 같은 서브쿼리 연산자를 구현하는 데 사용됩니다. 이 함수는 데이터에 고유한 비-NULL 값이 하나만 있는지 확인합니다. 고유한 값이 하나만 있으면 해당 값을 반환하고, 값이 0개이거나 두 개 이상의 서로 다른 값이 있으면 NULL을 반환합니다.

**구문**

```sql
singleValueOrNull(x)
```

**매개변수**

- `x` — 모든 [데이터 타입](../../data-types/index.md)의 컬럼 (단, [Nullable](../../data-types/nullable.md) 타입일 수 없는 [Map](../../data-types/map.md), [Array](../../data-types/array.md) 또는 [Tuple](../../data-types/tuple) 제외).

**반환 값**

- `x`에 고유한 비-NULL 값이 하나만 있을 경우, 그 고유한 값을 반환합니다.
- 0개이거나 두 개 이상의 서로 다른 값이 있을 경우, `NULL`을 반환합니다.

**예제**

쿼리:

```sql
CREATE TABLE test (x UInt8 NULL) ENGINE=Log;
INSERT INTO test (x) VALUES (NULL), (NULL), (5), (NULL), (NULL);
SELECT singleValueOrNull(x) FROM test;
```

결과:

```response
┌─singleValueOrNull(x)─┐
│                    5 │
└──────────────────────┘
```

쿼리:

```sql
INSERT INTO test (x) VALUES (10);
SELECT singleValueOrNull(x) FROM test;
```

결과:

```response
┌─singleValueOrNull(x)─┐
│                 ᴺᵁᴸᴸ │
└──────────────────────┘
```
