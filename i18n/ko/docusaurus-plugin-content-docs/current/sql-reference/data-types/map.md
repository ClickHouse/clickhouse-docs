---
description: 'ClickHouse의 맵(Map) 데이터 타입 문서'
sidebar_label: 'Map(K, V)'
sidebar_position: 36
slug: /sql-reference/data-types/map
title: 'Map(K, V)'
doc_type: 'reference'
---

# Map(K, V) \{#mapk-v\}

데이터 타입 `Map(K, V)`은 key-value 쌍을 저장합니다.

다른 데이터베이스와 달리 ClickHouse에서 맵은 유일(unique)하지 않습니다. 즉, 하나의 맵에 동일한 키를 가진 두 개의 요소가 포함될 수 있습니다.
(이는 맵이 내부적으로 `Array(Tuple(K, V))`로 구현되어 있기 때문입니다.)

맵 `m`에서 키 `k`에 대한 값을 얻기 위해 `m[k]` 구문을 사용할 수 있습니다.
또한 `m[k]`는 맵 전체를 스캔하므로, 연산 시간은 맵 크기에 비례하여 선형적으로 증가합니다.

**파라미터**

* `K` — 맵 키(Map keys)의 타입입니다. [Nullable](../../sql-reference/data-types/nullable.md) 타입 및 [Nullable](../../sql-reference/data-types/nullable.md) 타입과 중첩된 [LowCardinality](../../sql-reference/data-types/lowcardinality.md) 타입을 제외한 임의의 타입입니다.
* `V` — 맵 값(Map values)의 타입입니다. 임의의 타입입니다.

**예시**

맵 타입 컬럼을 가진 테이블을 생성합니다:

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':1, 'key2':10}), ({'key1':2,'key2':20}), ({'key1':3,'key2':30});
```

`key2` 값을 선택하려면:

```sql
SELECT m['key2'] FROM tab;
```

결과:

```text
┌─arrayElement(m, 'key2')─┐
│                      10 │
│                      20 │
│                      30 │
└─────────────────────────┘
```

요청한 키 `k`가 맵에 포함되어 있지 않으면 `m[k]`는 값 타입의 기본값을 반환합니다. 예를 들어 정수 타입은 `0`, 문자열 타입은 `''`을(를) 반환합니다.
맵에 키가 존재하는지 확인하려면 [mapContains](/sql-reference/functions/tuple-map-functions#mapContainsKey) 함수를 사용할 수 있습니다.

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':100}), ({});
SELECT m['key1'] FROM tab;
```

결과:

```text
┌─arrayElement(m, 'key1')─┐
│                     100 │
│                       0 │
└─────────────────────────┘
```


## Tuple을 맵(Map)으로 변환하기 \{#converting-tuple-to-map\}

`Tuple()` 타입의 값은 함수 [CAST](/sql-reference/functions/type-conversion-functions#CAST)를 사용하여 `Map()` 타입의 값으로 형변환할 수 있습니다.

**예시**

쿼리:

```sql
SELECT CAST(([1, 2, 3], ['Ready', 'Steady', 'Go']), 'Map(UInt8, String)') AS map;
```

결과:

```text
┌─map───────────────────────────┐
│ {1:'Ready',2:'Steady',3:'Go'} │
└───────────────────────────────┘
```


## Map 서브컬럼 읽기 \{#reading-subcolumns-of-map\}

전체 맵을 모두 읽지 않도록, 상황에 따라 서브컬럼 `keys`와 `values`를 사용할 수 있습니다.

**예제**

쿼리:

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE = Memory;
INSERT INTO tab VALUES (map('key1', 1, 'key2', 2, 'key3', 3));

SELECT m.keys FROM tab; --   same as mapKeys(m)
SELECT m.values FROM tab; -- same as mapValues(m)
```

결과:

```text
┌─m.keys─────────────────┐
│ ['key1','key2','key3'] │
└────────────────────────┘

┌─m.values─┐
│ [1,2,3]  │
└──────────┘
```

**참고**

* [map()](/sql-reference/functions/tuple-map-functions#map) 함수
* [CAST()](/sql-reference/functions/type-conversion-functions#CAST) 함수
* [Map 데이터 타입용 -Map 콤비네이터](../aggregate-functions/combinators.md#-map)


## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse로 관측성 솔루션 구축하기 - 2부: 트레이스](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)