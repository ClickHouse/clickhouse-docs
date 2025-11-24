---
'description': 'Tuple 맵 함수에 대한 문서'
'sidebar_label': '지도'
'slug': '/sql-reference/functions/tuple-map-functions'
'title': '맵 함수'
'doc_type': 'reference'
---


## map {#map}

키-값 쌍으로부터 [Map(key, value)](../data-types/map.md) 타입의 값을 생성합니다.

**구문**

```sql
map(key1, value1[, key2, value2, ...])
```

**인수**

- `key_n` — 맵 항목의 키. [Map](../data-types/map.md) 키 타입으로 지원되는 모든 타입.
- `value_n` — 맵 항목의 값. [Map](../data-types/map.md) 값 타입으로 지원되는 모든 타입.

**반환 값**

- `key:value` 쌍을 포함하는 맵. [Map(key, value)](../data-types/map.md).

**예제**

쿼리:

```sql
SELECT map('key1', number, 'key2', number * 2) FROM numbers(3);
```

결과:

```text
┌─map('key1', number, 'key2', multiply(number, 2))─┐
│ {'key1':0,'key2':0}                              │
│ {'key1':1,'key2':2}                              │
│ {'key1':2,'key2':4}                              │
└──────────────────────────────────────────────────┘
```

## mapFromArrays {#mapfromarrays}

키 배열 또는 맵과 값 배열 또는 맵으로부터 맵을 생성합니다.

이 함수는 구문 `CAST([...], 'Map(key_type, value_type)')`의 편리한 대안입니다.
예를 들어, 다음을 작성하는 대신
- `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')`, 또는
- `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

다음과 같이 작성할 수 있습니다: `mapFromArrays(['aa', 'bb'], [4, 5])`.

**구문**

```sql
mapFromArrays(keys, values)
```

별칭: `MAP_FROM_ARRAYS(keys, values)`

**인수**

- `keys` — [Array](../data-types/array.md) 또는 [Map](../data-types/map.md)로부터 맵을 생성할 키 배열 또는 맵. `keys`가 배열인 경우, NULL 값을 포함하지 않는 한 `Array(Nullable(T))` 또는 `Array(LowCardinality(Nullable(T)))` 타입을 허용합니다.
- `values`  - [Array](../data-types/array.md) 또는 [Map](../data-types/map.md)로부터 맵을 생성할 값 배열 또는 맵.

**반환 값**

- 키 배열 및 값 배열/맵으로 구성된 맵.

**예제**

쿼리:

```sql
SELECT mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
```

결과:

```response
┌─mapFromArrays(['a', 'b', 'c'], [1, 2, 3])─┐
│ {'a':1,'b':2,'c':3}                       │
└───────────────────────────────────────────┘
```

`mapFromArrays`는 또한 [Map](../data-types/map.md) 타입의 인수를 허용합니다. 이들은 실행 중에 튜플 배열로 캐스트됩니다.

```sql
SELECT mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))
```

결과:

```response
┌─mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))─┐
│ {1:('a',1),2:('b',2),3:('c',3)}                       │
└───────────────────────────────────────────────────────┘
```

```sql
SELECT mapFromArrays(map('a', 1, 'b', 2, 'c', 3), [1, 2, 3])
```

결과:

```response
┌─mapFromArrays(map('a', 1, 'b', 2, 'c', 3), [1, 2, 3])─┐
│ {('a',1):1,('b',2):2,('c',3):3}                       │
└───────────────────────────────────────────────────────┘
```

## extractKeyValuePairs {#extractkeyvaluepairs}

키-값 쌍의 문자열을 [Map(String, String)](../data-types/map.md)으로 변환합니다.
파싱은 노이즈에 대해 관대합니다 (예: 로그 파일).
입력 문자열의 키-값 쌍은 키 다음에 키-값 구분자가 오고, 그 뒤에 값이 옵니다.
키-값 쌍은 쌍 구분자로 분리됩니다.
키와 값은 인용될 수 있습니다.

**구문**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character[, unexpected_quoting_character_strategy]]])
```

별칭:
- `str_to_map`
- `mapFromString`

**인수**

- `data` - 키-값 쌍을 추출할 문자열. [String](../data-types/string.md) 또는 [FixedString](../data-types/fixedstring.md).
- `key_value_delimiter` - 키와 값을 구분하는 단일 문자. 기본값은 `:`입니다. [String](../data-types/string.md) 또는 [FixedString](../data-types/fixedstring.md).
- `pair_delimiters` - 쌍을 구분하는 문자 집합. 기본값은 ` `, `,` 및 `;`입니다. [String](../data-types/string.md) 또는 [FixedString](../data-types/fixedstring.md).
- `quoting_character` - 인용 문자로 사용되는 단일 문자. 기본값은 `"`입니다. [String](../data-types/string.md) 또는 [FixedString](../data-types/fixedstring.md).
- `unexpected_quoting_character_strategy` - `read_key` 및 `read_value` 단계 중 예상치 못한 곳에서 인용 문자를 처리하기 위한 전략. 가능한 값: "invalid", "accept" 및 "promote". Invalid는 키/값을 버리고 `WAITING_KEY` 상태로 돌아갑니다. Accept는 이를 일반 문자로 처리합니다. Promote는 `READ_QUOTED_{KEY/VALUE}` 상태로 전환하여 다음 문자부터 시작합니다.

**반환 값**

- 키-값 쌍의 배열입니다. 타입: [Map(String, String)](../data-types/map.md)

**예제**

쿼리

```sql
SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') AS kv
```

결과:

```Result:
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

인용 문자로 단일 따옴표 `'`를 사용할 때:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') AS kv
```

결과:

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

unexpected_quoting_character_strategy 예제:

unexpected_quoting_character_strategy=invalid

```sql
SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'INVALID') AS kv;
```

```text
┌─kv────────────────┐
│ {'abc':'5'}  │
└───────────────────┘
```

```sql
SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'INVALID') AS kv;
```

```text
┌─kv──┐
│ {}  │
└─────┘
```

unexpected_quoting_character_strategy=accept

```sql
SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'ACCEPT') AS kv;
```

```text
┌─kv────────────────┐
│ {'name"abc':'5'}  │
└───────────────────┘
```

```sql
SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'ACCEPT') AS kv;
```

```text
┌─kv─────────────────┐
│ {'name"abc"':'5'}  │
└────────────────────┘
```

unexpected_quoting_character_strategy=promote

```sql
SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'PROMOTE') AS kv;
```

```text
┌─kv──┐
│ {}  │
└─────┘
```

```sql
SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'PROMOTE') AS kv;
```

```text
┌─kv───────────┐
│ {'abc':'5'}  │
└──────────────┘
```

이스케이프 시퀀스는 이스케이프 시퀀스 지원 없이:

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

결과:

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

`toString`으로 직렬화된 맵 문자열 키-값 쌍을 복원하려면:

```sql
SELECT
    map('John', '33', 'Paula', '31') AS m,
    toString(m) AS map_serialized,
    extractKeyValuePairs(map_serialized, ':', ',', '\'') AS map_restored
FORMAT Vertical;
```

결과:

```response
Row 1:
──────
m:              {'John':'33','Paula':'31'}
map_serialized: {'John':'33','Paula':'31'}
map_restored:   {'John':'33','Paula':'31'}
```

## extractKeyValuePairsWithEscaping {#extractkeyvaluepairswithescaping}

`extractKeyValuePairs`와 동일하지만 이스케이프를 지원합니다.

지원되는 이스케이프 시퀀스: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` 및 `\0`.
비표준 이스케이프 시퀀스는 그대로 반환됩니다 (백슬래시 포함) 단, 다음 중 하나이면 제외됩니다:
`\\`, `'`, `"`, `backtick`, `/`, `=` 또는 ASCII 제어 문자 (c &lt;= 31).

이 함수는 사전 이스케이프 및 후속 이스케이프가 적합하지 않은 경우의 사용례에 적합합니다. 예를 들어 다음과 같은 입력 문자열을 고려해보세요: `a: "aaaa\"bbb"`. 예상 출력은: `a: aaaa\"bbbb`.
- 사전 이스케이프: 사전 이스케이프를 적용하면: `a: "aaaa"bbb"`가 출력되고 `extractKeyValuePairs`는 `a: aaaa`를 출력합니다.
- 후속 이스케이프: `extractKeyValuePairs`는 `a: aaaa\`를 출력하고 후속 이스케이프를 적용하면 그대로 유지됩니다.

키의 선행 이스케이프 시퀀스는 생략되며 값의 경우 유효하지 않은 것으로 간주됩니다.

**예제**

이스케이프 시퀀스가 이스케이프 시퀀스 지원이 활성화된 경우:

```sql
SELECT extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') AS kv
```

결과:

```response
┌─kv────────────────┐
│ {'age':'a\n\n\0'} │
└───────────────────┘
```

## mapAdd {#mapadd}

모든 키를 수집하고 해당 값을 합산합니다.

**구문**

```sql
mapAdd(arg1, arg2 [, ...])
```

**인수**

인수는 두 [arrays](/sql-reference/data-types/array)로 된 [maps](../data-types/map.md) 또는 [tuples](/sql-reference/data-types/tuple)이며, 첫 번째 배열의 항목은 키를 나타내고 두 번째 배열은 각 키에 대한 값을 포함합니다. 모든 키 배열은 동일한 타입이어야 하며, 모든 값 배열은 하나의 타입으로 승격될 수 있는 항목을 포함해야 합니다 ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges), 또는 [Float64](/sql-reference/data-types/float)). 공통 승격 타입이 결과 배열에 대한 타입으로 사용됩니다.

**반환 값**

- 인수에 따라 반환되는 하나의 [map](../data-types/map.md) 또는 [tuple](/sql-reference/data-types/tuple)입니다. 첫 번째 배열은 정렬된 키를 포함하고 두 번째 배열은 해당 값을 포함합니다.

**예제**

`Map` 타입의 쿼리:

```sql
SELECT mapAdd(map(1,1), map(1,1));
```

결과:

```text
┌─mapAdd(map(1, 1), map(1, 1))─┐
│ {1:2}                        │
└──────────────────────────────┘
```

튜플로 쿼리:

```sql
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1])) AS res, toTypeName(res) AS type;
```

결과:

```text
┌─res───────────┬─type───────────────────────────────┐
│ ([1,2],[2,2]) │ Tuple(Array(UInt8), Array(UInt64)) │
└───────────────┴────────────────────────────────────┘
```

## mapSubtract {#mapsubtract}

모든 키를 수집하고 해당 값을 빼냅니다.

**구문**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**인수**

인수는 두 [arrays](/sql-reference/data-types/array)로 된 [maps](../data-types/map.md) 또는 [tuples](/sql-reference/data-types/tuple)이며, 첫 번째 배열의 항목은 키를 나타내고 두 번째 배열은 각 키에 대한 값을 포함합니다. 모든 키 배열은 동일한 타입이어야 하며, 모든 값 배열은 하나의 타입으로 승격될 수 있는 항목을 포함해야 합니다 ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) 또는 [Float64](/sql-reference/data-types/float)). 공통 승격 타입이 결과 배열에 대한 타입으로 사용됩니다.

**반환 값**

- 인수에 따라 반환되는 하나의 [map](../data-types/map.md) 또는 [tuple](/sql-reference/data-types/tuple)입니다. 첫 번째 배열은 정렬된 키를 포함하고 두 번째 배열은 해당 값을 포함합니다.

**예제**

`Map` 타입의 쿼리:

```sql
SELECT mapSubtract(map(1,1), map(1,1));
```

결과:

```text
┌─mapSubtract(map(1, 1), map(1, 1))─┐
│ {1:0}                             │
└───────────────────────────────────┘
```

튜플 맵으로 쿼리:

```sql
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) AS res, toTypeName(res) AS type;
```

결과:

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```

## mapPopulateSeries {#mappopulateseries}

정수 키를 가진 맵에서 누락된 키-값 쌍을 채웁니다.
키를 최대값을 초과하도록 확장할 수 있도록 최대 키를 지정할 수 있습니다.
보다 구체적으로 이 함수는 키가 가장 작은 값에서 가장 큰 값(또는 지정된 경우 `max` 인수)까지 1의 간격으로 형성된 시리즈인 맵을 반환하며, 그에 해당하는 값을 포함합니다.
키에 대한 값이 지정되지 않으면 기본 값이 사용됩니다.
키가 반복될 경우, 첫 번째 값 (출현 순서에서)만 해당 키와 연관됩니다.

**구문**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

배열 인수의 경우 각 행의 `keys`와 `values`의 요소 수는 동일해야 합니다.

**인수**

인수는 [Maps](../data-types/map.md) 또는 두 개의 [Arrays](/sql-reference/data-types/array)이며, 첫 번째 및 두 번째 배열은 각 키에 대한 키와 값을 포함합니다.

매핑된 배열:

- `map` — 정수 키가 있는 맵. [Map](../data-types/map.md).

또는

- `keys` — 키의 배열. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
- `values` — 값의 배열. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
- `max` — 최대 키 값. 선택 사항. [Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges).

**반환 값**

- 인수에 따라 [Map](../data-types/map.md) 또는 두 [Arrays](/sql-reference/data-types/array)의 [Tuple](/sql-reference/data-types/tuple): 정렬된 순서의 키와 해당 키의 값.

**예제**

`Map` 타입의 쿼리:

```sql
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6);
```

결과:

```text
┌─mapPopulateSeries(map(1, 10, 5, 20), 6)─┐
│ {1:10,2:0,3:0,4:0,5:20,6:0}             │
└─────────────────────────────────────────┘
```

매핑된 배열로 쿼리:

```sql
SELECT mapPopulateSeries([1,2,4], [11,22,44], 5) AS res, toTypeName(res) AS type;
```

결과:

```text
┌─res──────────────────────────┬─type──────────────────────────────┐
│ ([1,2,3,4,5],[11,22,0,44,0]) │ Tuple(Array(UInt8), Array(UInt8)) │
└──────────────────────────────┴───────────────────────────────────┘
```

## mapKeys {#mapkeys}

주어진 맵의 키를 반환합니다.

이 함수는 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 설정을 활성화하여 최적화할 수 있습니다.
설정이 활성화된 경우, 이 함수는 전체 맵 대신에 [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) 하위 열만 읽습니다.
쿼리 `SELECT mapKeys(m) FROM table`는 `SELECT m.keys FROM table`로 변환됩니다.

**구문**

```sql
mapKeys(map)
```

**인수**

- `map` — 맵. [Map](../data-types/map.md).

**반환 값**

- `map`의 모든 키를 포함하는 배열입니다. [Array](../data-types/array.md).

**예제**

쿼리:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapKeys(a) FROM tab;
```

결과:

```text
┌─mapKeys(a)────────────┐
│ ['name','age']        │
│ ['number','position'] │
└───────────────────────┘
```

## mapContains {#mapcontains}

주어진 키가 주어진 맵에 포함되어 있는지 반환합니다.

**구문**

```sql
mapContains(map, key)
```

별칭: `mapContainsKey(map, key)`

**인수**

- `map` — 맵. [Map](../data-types/map.md).
- `key` — 키. 타입은 `map`의 키 타입과 일치해야 합니다.

**반환 값**

- `map`에 `key`가 포함되면 `1`, 그렇지 않으면 `0`입니다. [UInt8](../data-types/int-uint.md).

**예제**

쿼리:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapContains(a, 'name') FROM tab;

```

결과:

```text
┌─mapContains(a, 'name')─┐
│                      1 │
│                      0 │
└────────────────────────┘
```

## mapContainsKeyLike {#mapcontainskeylike}

**구문**

```sql
mapContainsKeyLike(map, pattern)
```

**인수**
- `map` — 맵. [Map](../data-types/map.md).
- `pattern`  - 일치할 문자열 패턴.

**반환 값**

- `map`에 `key`가 지정된 패턴처럼 포함되면 `1`, 그렇지 않으면 `0`입니다.

**예제**

쿼리:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsKeyLike(a, 'a%') FROM tab;
```

결과:

```text
┌─mapContainsKeyLike(a, 'a%')─┐
│                           1 │
│                           0 │
└─────────────────────────────┘
```

## mapExtractKeyLike {#mapextractkeylike}

문자열 키가 있는 맵과 LIKE 패턴을 주면, 이 함수는 패턴과 일치하는 요소가 있는 맵을 반환합니다.

**구문**

```sql
mapExtractKeyLike(map, pattern)
```

**인수**

- `map` — 맵. [Map](../data-types/map.md).
- `pattern`  - 일치할 문자열 패턴.

**반환 값**

- 지정된 패턴과 일치하는 요소가 포함된 맵. 패턴과 일치하는 요소가 없으면 빈 맵이 반환됩니다.

**예제**

쿼리:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractKeyLike(a, 'a%') FROM tab;
```

결과:

```text
┌─mapExtractKeyLike(a, 'a%')─┐
│ {'abc':'abc'}              │
│ {}                         │
└────────────────────────────┘
```

## mapValues {#mapvalues}

주어진 맵의 값을 반환합니다.

이 함수는 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 설정을 활성화하여 최적화할 수 있습니다.
설정이 활성화된 경우, 이 함수는 전체 맵 대신에 [values](/sql-reference/data-types/map#reading-subcolumns-of-map) 하위 열만 읽습니다.
쿼리 `SELECT mapValues(m) FROM table`는 `SELECT m.values FROM table`로 변환됩니다.

**구문**

```sql
mapValues(map)
```

**인수**

- `map` — 맵. [Map](../data-types/map.md).

**반환 값**

- `map`의 모든 값을 포함하는 배열입니다. [Array](../data-types/array.md).

**예제**

쿼리:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapValues(a) FROM tab;
```

결과:

```text
┌─mapValues(a)─────┐
│ ['eleven','11']  │
│ ['twelve','6.0'] │
└──────────────────┘
```

## mapContainsValue {#mapcontainsvalue}

주어진 값이 주어진 맵에 포함되어 있는지 반환합니다.

**구문**

```sql
mapContainsValue(map, value)
```

별칭: `mapContainsValue(map, value)`

**인수**

- `map` — 맵. [Map](../data-types/map.md).
- `value` — 값. 타입은 `map`의 값 타입과 일치해야 합니다.

**반환 값**

- `map`에 `value`가 포함되면 `1`, 그렇지 않으면 `0`입니다. [UInt8](../data-types/int-uint.md).

**예제**

쿼리:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapContainsValue(a, '11') FROM tab;

```

결과:

```text
┌─mapContainsValue(a, '11')─┐
│                         1 │
│                         0 │
└───────────────────────────┘
```

## mapContainsValueLike {#mapcontainsvaluelike}

**구문**

```sql
mapContainsValueLike(map, pattern)
```

**인수**
- `map` — 맵. [Map](../data-types/map.md).
- `pattern`  - 일치할 문자열 패턴.

**반환 값**

- `map`에 `value`가 지정된 패턴처럼 포함되면 `1`, 그렇지 않으면 `0`입니다.

**예제**

쿼리:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsValueLike(a, 'a%') FROM tab;
```

결과:

```text
┌─mapContainsV⋯ke(a, 'a%')─┐
│                        1 │
│                        0 │
└──────────────────────────┘
```

## mapExtractValueLike {#mapextractvaluelike}

문자열 값이 있는 맵과 LIKE 패턴을 주면, 이 함수는 패턴과 일치하는 요소가 있는 맵을 반환합니다.

**구문**

```sql
mapExtractValueLike(map, pattern)
```

**인수**

- `map` — 맵. [Map](../data-types/map.md).
- `pattern`  - 일치할 문자열 패턴.

**반환 값**

- 지정된 패턴과 일치하는 요소가 포함된 맵. 패턴과 일치하는 요소가 없으면 빈 맵이 반환됩니다.

**예제**

쿼리:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractValueLike(a, 'a%') FROM tab;
```

결과:

```text
┌─mapExtractValueLike(a, 'a%')─┐
│ {'abc':'abc'}                │
│ {}                           │
└──────────────────────────────┘
```

## mapApply {#mapapply}

맵의 각 요소에 함수를 적용합니다.

**구문**

```sql
mapApply(func, map)
```

**인수**

- `func` — [람다 함수](/sql-reference/functions/overview#higher-order-functions).
- `map` — [Map](../data-types/map.md).

**반환 값**

- 원본 맵에서 `func(map1[i], ..., mapN[i])`을 적용하여 얻은 맵을 반환합니다.

**예제**

쿼리:

```sql
SELECT mapApply((k, v) -> (k, v * 10), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

결과:

```text
┌─r─────────────────────┐
│ {'key1':0,'key2':0}   │
│ {'key1':10,'key2':20} │
│ {'key1':20,'key2':40} │
└───────────────────────┘
```

## mapFilter {#mapfilter}

각 맵 요소에 함수를 적용하여 맵을 필터링합니다.

**구문**

```sql
mapFilter(func, map)
```

**인수**

- `func`  - [람다 함수](/sql-reference/functions/overview#higher-order-functions).
- `map` — [Map](../data-types/map.md).

**반환 값**

- `func(map1[i], ..., mapN[i])`가 0이 아닌 값인 맵의 요소만 포함하는 맵을 반환합니다.

**예제**

쿼리:

```sql
SELECT mapFilter((k, v) -> ((v % 2) = 0), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

결과:

```text
┌─r───────────────────┐
│ {'key1':0,'key2':0} │
│ {'key2':2}          │
│ {'key1':2,'key2':4} │
└─────────────────────┘
```

## mapUpdate {#mapupdate}

**구문**

```sql
mapUpdate(map1, map2)
```

**인수**

- `map1` [Map](../data-types/map.md).
- `map2` [Map](../data-types/map.md).

**반환 값**

- map2에서 해당 키의 값으로 업데이트된 map1을 반환합니다.

**예제**

쿼리:

```sql
SELECT mapUpdate(map('key1', 0, 'key3', 0), map('key1', 10, 'key2', 10)) AS map;
```

결과:

```text
┌─map────────────────────────────┐
│ {'key3':0,'key1':10,'key2':10} │
└────────────────────────────────┘
```

## mapConcat {#mapconcat}

키의 동등성을 기준으로 여러 맵을 연결합니다.
동일한 키를 가진 요소가 두 개 이상의 입력 맵에 존재하는 경우, 모든 요소가 결과 맵에 추가되지만, 오직 첫 번째 요소만 연산자 `[]`를 통해 접근할 수 있습니다.

**구문**

```sql
mapConcat(maps)
```

**인수**

-   `maps` – 임의의 수의 [Maps](../data-types/map.md).

**반환 값**

- 인수로 전달된 연결된 맵을 포함하는 맵이 반환됩니다.

**예제**

쿼리:

```sql
SELECT mapConcat(map('key1', 1, 'key3', 3), map('key2', 2)) AS map;
```

결과:

```text
┌─map──────────────────────────┐
│ {'key1':1,'key3':3,'key2':2} │
└──────────────────────────────┘
```

쿼리:

```sql
SELECT mapConcat(map('key1', 1, 'key2', 2), map('key1', 3)) AS map, map['key1'];
```

결과:

```text
┌─map──────────────────────────┬─elem─┐
│ {'key1':1,'key2':2,'key1':3} │    1 │
└──────────────────────────────┴──────┘
```

## mapExists(\[func,\], map) {#mapexistsfunc-map}

`map`에 `func(key, value)`가 0이 아닌 값을 반환하는 키-값 쌍이 하나라도 존재하면 1을 반환합니다. 그렇지 않으면 0을 반환합니다.

:::note
`mapExists`는 [고차 함수](/sql-reference/functions/overview#higher-order-functions)입니다.
첫 번째 인수로 람다 함수를 전달할 수 있습니다.
:::

**예제**

쿼리:

```sql
SELECT mapExists((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

결과:

```response
┌─res─┐
│   1 │
└─────┘
```

## mapAll(\[func,\] map) {#mapallfunc-map}

모든 키-값 쌍에 대해 `func(key, value)`가 0이 아닌 값을 반환하면 1을 반환합니다. 그렇지 않으면 0을 반환합니다.

:::note
`mapAll`은 [고차 함수](/sql-reference/functions/overview#higher-order-functions)입니다.
첫 번째 인수로 람다 함수를 전달할 수 있습니다.
:::

**예제**

쿼리:

```sql
SELECT mapAll((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

결과:

```response
┌─res─┐
│   0 │
└─────┘
```

## mapSort(\[func,\], map) {#mapsortfunc-map}

맵의 요소를 오름차순으로 정렬합니다.
`func` 함수가 지정되면, 정렬 순서는 맵의 키와 값에 적용된 `func` 함수의 결과로 결정됩니다.

**예제**

```sql
SELECT mapSort(map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

```text
┌─map──────────────────────────┐
│ {'key1':3,'key2':2,'key3':1} │
└──────────────────────────────┘
```

```sql
SELECT mapSort((k, v) -> v, map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

```text
┌─map──────────────────────────┐
│ {'key3':1,'key2':2,'key1':3} │
└──────────────────────────────┘
```

자세한 내용은 `arraySort` 함수의 [참조](https://sql-reference/functions/array-functions#arraySort)를 참조하십시오. 

## mapPartialSort {#mappartialsort}

추가 `limit` 인수를 사용하여 요소를 오름차순으로 정렬하며 부분 정렬을 허용합니다.
`func` 함수가 지정되면, 정렬 순서는 맵의 키와 값에 적용된 `func` 함수의 결과로 결정됩니다.

**구문**

```sql
mapPartialSort([func,] limit, map)
```
**인수**

- `func` – 맵의 키와 값에 적용할 선택적 함수. [람다 함수](/sql-reference/functions/overview#higher-order-functions).
- `limit` – [1..limit] 범위의 요소가 정렬됩니다. [(U)Int](../data-types/int-uint.md).
- `map` – 정렬할 맵. [Map](../data-types/map.md).

**반환 값**

- 부분적으로 정렬된 맵. [Map](../data-types/map.md).

**예제**

```sql
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k2':1,'k3':2,'k1':3}                                                    │
└───────────────────────────────────────────────────────────────────────────┘
```

## mapReverseSort(\[func,\], map) {#mapreversesortfunc-map}

맵의 요소를 내림차순으로 정렬합니다.
`func` 함수가 지정되면, 정렬 순서는 맵의 키와 값에 적용된 `func` 함수의 결과로 결정됩니다.

**예제**

```sql
SELECT mapReverseSort(map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

```text
┌─map──────────────────────────┐
│ {'key3':1,'key2':2,'key1':3} │
└──────────────────────────────┘
```

```sql
SELECT mapReverseSort((k, v) -> v, map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

```text
┌─map──────────────────────────┐
│ {'key1':3,'key2':2,'key3':1} │
└──────────────────────────────┘
```

자세한 내용은 [arrayReverseSort](/sql-reference/functions/array-functions#arrayReverseSort) 함수를 참조하십시오.

## mapPartialReverseSort {#mappartialreversesort}

추가 `limit` 인수를 사용하여 요소를 내림차순으로 정렬하며 부분 정렬을 허용합니다.
`func` 함수가 지정되면, 정렬 순서는 맵의 키와 값에 적용된 `func` 함수의 결과로 결정됩니다.

**구문**

```sql
mapPartialReverseSort([func,] limit, map)
```
**인수**

- `func` – 맵의 키와 값에 적용할 선택적 함수. [람다 함수](/sql-reference/functions/overview#higher-order-functions).
- `limit` – [1..limit] 범위의 요소가 정렬됩니다. [(U)Int](../data-types/int-uint.md).
- `map` – 정렬할 맵. [Map](../data-types/map.md).

**반환 값**

- 부분적으로 정렬된 맵. [Map](../data-types/map.md).

**예제**

```sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
