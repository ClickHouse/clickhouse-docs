---
'description': 'ClickHouse에서 Map 데이터 유형에 대한 문서'
'sidebar_label': 'Map(K, V)'
'sidebar_position': 36
'slug': '/sql-reference/data-types/map'
'title': 'Map(K, V)'
'doc_type': 'reference'
---


# Map(K, V)

데이터 유형 `Map(K, V)`는 키-값 쌍을 저장합니다.

다른 데이터베이스와 달리 ClickHouse의 맵은 고유하지 않으며, 즉 맵은 동일한 키를 가진 두 개의 요소를 포함할 수 있습니다.  
(그 이유는 맵이 내부적으로 `Array(Tuple(K, V))`로 구현되어 있기 때문입니다.)

구문 `m[k]`를 사용하여 맵 `m`의 키 `k`에 대한 값을 얻을 수 있습니다.  
또한, `m[k]`는 맵을 스캔하며, 즉 이 작업의 런타임은 맵의 크기에 대해 선형입니다.

**매개변수**

- `K` — 맵 키의 유형. [Nullable](../../sql-reference/data-types/nullable.md) 및 [LowCardinality](../../sql-reference/data-types/lowcardinality.md) 중첩된 [Nullable](../../sql-reference/data-types/nullable.md) 유형을 제외한 임의의 유형입니다.
- `V` — 맵 값의 유형. 임의의 유형입니다.

**예제**

맵 유형의 컬럼을 가진 테이블 생성:

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':1, 'key2':10}), ({'key1':2,'key2':20}), ({'key1':3,'key2':30});
```

`key2` 값을 선택하기 위해:

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

요청된 키 `k`가 맵에 포함되어 있지 않으면, `m[k]`는 값 유형의 기본값을 반환합니다. 예를 들어, 정수 유형의 경우 `0`이고, 문자열 유형의 경우 `''`입니다.  
맵에서 키의 존재 여부를 확인하려면 [mapContains](../../sql-reference/functions/tuple-map-functions#mapcontains) 함수를 사용할 수 있습니다.

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

## Tuple을 Map으로 변환하기 {#converting-tuple-to-map}

`Tuple()` 유형의 값은 [CAST](/sql-reference/functions/type-conversion-functions#cast) 함수를 사용하여 `Map()` 유형의 값으로 변환할 수 있습니다.

**예제**

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

## 맵의 서브컬럼 읽기 {#reading-subcolumns-of-map}

전체 맵을 읽지 않도록 하기 위해, 경우에 따라 서브컬럼 `keys`와 `values`를 사용할 수 있습니다.

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

- [map()](/sql-reference/functions/tuple-map-functions#map) 함수
- [CAST()](/sql-reference/functions/type-conversion-functions#cast) 함수
- [-Map 조합기 Map 데이터 유형에 대한](../aggregate-functions/combinators.md#-map)

## 관련 콘텐츠 {#related-content}

- 블로그: [ClickHouse로 가시성 솔루션 구축하기 - 2부 - 추적](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
