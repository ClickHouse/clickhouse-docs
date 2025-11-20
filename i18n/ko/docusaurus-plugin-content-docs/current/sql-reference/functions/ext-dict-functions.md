---
'description': '딕셔너리 작업을 위한 함수에 대한 Documentation'
'sidebar_label': 'Dictionaries'
'slug': '/sql-reference/functions/ext-dict-functions'
'title': '딕셔너리 작업을 위한 함수'
'doc_type': 'reference'
---



# 딕셔너리 작업을 위한 함수

:::note
[DDL 쿼리](../../sql-reference/statements/create/dictionary.md)를 사용하여 생성된 딕셔너리에 대해서는 `dict_name` 매개변수를 `<database>.<dict_name>`과 같이 완전히 지정해야 합니다. 그렇지 않으면 현재 데이터베이스가 사용됩니다.
:::

딕셔너리에 연결하고 구성하는 방법에 대한 정보는 [Dictionaries](../../sql-reference/dictionaries/index.md)를 참조하세요.

## dictGet, dictGetOrDefault, dictGetOrNull {#dictget-dictgetordefault-dictgetornull}

딕셔너리에서 값을 검색합니다.

```sql
dictGet('dict_name', attr_names, id_expr)
dictGetOrDefault('dict_name', attr_names, id_expr, default_value_expr)
dictGetOrNull('dict_name', attr_name, id_expr)
```

**인수**

- `dict_name` — 딕셔너리의 이름. [문자열 리터럴](/sql-reference/syntax#string).
- `attr_names` — 딕셔너리의 컬럼 이름, [문자열 리터럴](/sql-reference/syntax#string), 또는 컬럼 이름들의 튜플, [Tuple](/sql-reference/data-types/tuple)([문자열 리터럴](/sql-reference/syntax#string)).
- `id_expr` — 키 값. 딕셔너리 구성을 기반으로 딕셔너리 키 유형 값을 반환하는 [표현식](/sql-reference/syntax#expressions) 또는 [Tuple](../data-types/tuple.md)-유형 값을 반환합니다.
- `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 경우 반환되는 값. [표현식](/sql-reference/syntax#expressions) 또는 [Tuple](../data-types/tuple.md)([표현식](/sql-reference/syntax#expressions)), `attr_names` 속성에 대해 구성된 데이터 유형에서 값(또는 값들)을 반환합니다.

**반환 값**

- ClickHouse가 [속성의 데이터 유형](/sql-reference/dictionaries#dictionary-key-and-fields)에서 속성을 성공적으로 구문 분석하면, 함수는 `id_expr`에 해당하는 딕셔너리 속성의 값을 반환합니다.

- 딕셔너리에 `id_expr`에 해당하는 키가 없으면:

        - `dictGet`은 딕셔너리 구성에서 속성을 위해 지정된 `<null_value>` 요소의 내용을 반환합니다.
        - `dictGetOrDefault`는 `default_value_expr` 매개변수로 전달된 값을 반환합니다.
        - `dictGetOrNull`은 키가 딕셔너리에서 발견되지 않은 경우 `NULL`을 반환합니다.

ClickHouse는 속성의 값을 구문 분석할 수 없거나 값이 속성 데이터 유형과 일치하지 않으면 예외를 발생시킵니다.

**단순 키 딕셔너리에 대한 예**

다음 내용을 포함하여 `ext-dict-test.csv`라는 텍스트 파일을 만듭니다:

```text
1,1
2,2
```

첫 번째 컬럼은 `id`, 두 번째 컬럼은 `c1`입니다.

딕셔너리 구성:

```xml
<clickhouse>
    <dictionary>
        <name>ext-dict-test</name>
        <source>
            <file>
                <path>/path-to/ext-dict-test.csv</path>
                <format>CSV</format>
            </file>
        </source>
        <layout>
            <flat />
        </layout>
        <structure>
            <id>
                <name>id</name>
            </id>
            <attribute>
                <name>c1</name>
                <type>UInt32</type>
                <null_value></null_value>
            </attribute>
        </structure>
        <lifetime>0</lifetime>
    </dictionary>
</clickhouse>
```

쿼리 실행:

```sql
SELECT
    dictGetOrDefault('ext-dict-test', 'c1', number + 1, toUInt32(number * 10)) AS val,
    toTypeName(val) AS type
FROM system.numbers
LIMIT 3;
```

```text
┌─val─┬─type───┐
│   1 │ UInt32 │
│   2 │ UInt32 │
│  20 │ UInt32 │
└─────┴────────┘
```

**복합 키 딕셔너리에 대한 예**

다음 내용을 포함하여 `ext-dict-mult.csv`라는 텍스트 파일을 만듭니다:

```text
1,1,'1'
2,2,'2'
3,3,'3'
```

첫 번째 컬럼은 `id`, 두 번째는 `c1`, 세 번째는 `c2`입니다.

딕셔너리 구성:

```xml
<clickhouse>
    <dictionary>
        <name>ext-dict-mult</name>
        <source>
            <file>
                <path>/path-to/ext-dict-mult.csv</path>
                <format>CSV</format>
            </file>
        </source>
        <layout>
            <flat />
        </layout>
        <structure>
            <id>
                <name>id</name>
            </id>
            <attribute>
                <name>c1</name>
                <type>UInt32</type>
                <null_value></null_value>
            </attribute>
            <attribute>
                <name>c2</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>
        </structure>
        <lifetime>0</lifetime>
    </dictionary>
</clickhouse>
```

쿼리 실행:

```sql
SELECT
    dictGet('ext-dict-mult', ('c1','c2'), number + 1) AS val,
    toTypeName(val) AS type
FROM system.numbers
LIMIT 3;
```

```text
┌─val─────┬─type──────────────────┐
│ (1,'1') │ Tuple(UInt8, String)  │
│ (2,'2') │ Tuple(UInt8, String)  │
│ (3,'3') │ Tuple(UInt8, String)  │
└─────────┴───────────────────────┘
```

**범위 키 딕셔너리에 대한 예**

입력 테이블:

```sql
CREATE TABLE range_key_dictionary_source_table
(
    key UInt64,
    start_date Date,
    end_date Date,
    value String,
    value_nullable Nullable(String)
)
ENGINE = TinyLog();

INSERT INTO range_key_dictionary_source_table VALUES(1, toDate('2019-05-20'), toDate('2019-05-20'), 'First', 'First');
INSERT INTO range_key_dictionary_source_table VALUES(2, toDate('2019-05-20'), toDate('2019-05-20'), 'Second', NULL);
INSERT INTO range_key_dictionary_source_table VALUES(3, toDate('2019-05-20'), toDate('2019-05-20'), 'Third', 'Third');
```

딕셔너리 생성:

```sql
CREATE DICTIONARY range_key_dictionary
(
    key UInt64,
    start_date Date,
    end_date Date,
    value String,
    value_nullable Nullable(String)
)
PRIMARY KEY key
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() TABLE 'range_key_dictionary_source_table'))
LIFETIME(MIN 1 MAX 1000)
LAYOUT(RANGE_HASHED())
RANGE(MIN start_date MAX end_date);
```

쿼리 실행:

```sql
SELECT
    (number, toDate('2019-05-20')),
    dictHas('range_key_dictionary', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value_nullable', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', ('value', 'value_nullable'), number, toDate('2019-05-20'))
FROM system.numbers LIMIT 5 FORMAT TabSeparated;
```
결과:

```text
(0,'2019-05-20')        0       \N      \N      (NULL,NULL)
(1,'2019-05-20')        1       First   First   ('First','First')
(2,'2019-05-20')        1       Second  \N      ('Second',NULL)
(3,'2019-05-20')        1       Third   Third   ('Third','Third')
(4,'2019-05-20')        0       \N      \N      (NULL,NULL)
```

**참고**

- [Dictionaries](../../sql-reference/dictionaries/index.md)

## dictHas {#dicthas}

딕셔너리에 키가 존재하는지 확인합니다.

```sql
dictHas('dict_name', id_expr)
```

**인수**

- `dict_name` — 딕셔너리의 이름. [문자열 리터럴](/sql-reference/syntax#string).
- `id_expr` — 키 값. [표현식](/sql-reference/syntax#expressions)으로 딕셔너리 키 유형 값을 반환하거나 딕셔너리 구성에 따라 [Tuple](../data-types/tuple.md)-유형 값을 반환합니다.

**반환 값**

- 키가 없으면 0을 반환합니다. [UInt8](../data-types/int-uint.md).
- 키가 있으면 1을 반환합니다. [UInt8](../data-types/int-uint.md).

## dictGetHierarchy {#dictgethierarchy}

[계층적 딕셔너리](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries)에서 키의 모든 부모를 포함하는 배열을 생성합니다.

**구문**

```sql
dictGetHierarchy('dict_name', key)
```

**인수**

- `dict_name` — 딕셔너리의 이름. [문자열 리터럴](/sql-reference/syntax#string).
- `key` — 키 값. [표현식](/sql-reference/syntax#expressions)으로 [UInt64](../data-types/int-uint.md)-유형 값을 반환합니다.

**반환 값**

- 키의 부모들. [Array(UInt64)](../data-types/array.md).

## dictIsIn {#dictisin}

딕셔너리에서 키의 전체 계층 체인을 통해 조상을 확인합니다.

```sql
dictIsIn('dict_name', child_id_expr, ancestor_id_expr)
```

**인수**

- `dict_name` — 딕셔너리의 이름. [문자열 리터럴](/sql-reference/syntax#string).
- `child_id_expr` — 확인할 키. [표현식](/sql-reference/syntax#expressions)으로 [UInt64](../data-types/int-uint.md)-유형 값을 반환합니다.
- `ancestor_id_expr` — `child_id_expr` 키의 주장된 조상. [표현식](/sql-reference/syntax#expressions)으로 [UInt64](../data-types/int-uint.md)-유형 값을 반환합니다.

**반환 값**

- `child_id_expr`가 `ancestor_id_expr`의 자식이 아니면 0을 반환합니다. [UInt8](../data-types/int-uint.md).
- `child_id_expr`가 `ancestor_id_expr`의 자식이거나 `child_id_expr`가 `ancestor_id_expr`이면 1을 반환합니다. [UInt8](../data-types/int-uint.md).

## dictGetChildren {#dictgetchildren}

첫 번째 수준의 자식을 인덱스 배열로 반환합니다. 이는 [dictGetHierarchy](#dictgethierarchy)에 대한 역 변환입니다.

**구문**

```sql
dictGetChildren(dict_name, key)
```

**인수**

- `dict_name` — 딕셔너리의 이름. [문자열 리터럴](/sql-reference/syntax#string).
- `key` — 키 값. [표현식](/sql-reference/syntax#expressions)으로 [UInt64](../data-types/int-uint.md)-유형 값을 반환합니다.

**반환 값**

- 키에 대한 첫 번째 수준 후손. [Array](../data-types/array.md)([UInt64](../data-types/int-uint.md)).

**예제**

계층적 딕셔너리를 고려합니다:

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```

첫 번째 수준의 자식:

```sql
SELECT dictGetChildren('hierarchy_flat_dictionary', number) FROM system.numbers LIMIT 4;
```

```text
┌─dictGetChildren('hierarchy_flat_dictionary', number)─┐
│ [1]                                                  │
│ [2,3]                                                │
│ [4]                                                  │
│ []                                                   │
└──────────────────────────────────────────────────────┘
```

## dictGetDescendant {#dictgetdescendant}

[dictGetChildren](#dictgetchildren) 함수가 `level` 번 재귀적으로 적용된 것처럼 모든 후손을 반환합니다.

**구문**

```sql
dictGetDescendants(dict_name, key, level)
```

**인수**

- `dict_name` — 딕셔너리의 이름. [문자열 리터럴](/sql-reference/syntax#string).
- `key` — 키 값. [표현식](/sql-reference/syntax#expressions)으로 [UInt64](../data-types/int-uint.md)-유형 값을 반환합니다.
- `level` — 계층 수준. `level = 0`일 경우 끝까지 모든 후손을 반환합니다. [UInt8](../data-types/int-uint.md).

**반환 값**

- 키에 대한 후손. [Array](../data-types/array.md)([UInt64](../data-types/int-uint.md)).

**예제**

계층적 딕셔너리를 고려합니다:

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```
모든 후손:

```sql
SELECT dictGetDescendants('hierarchy_flat_dictionary', number) FROM system.numbers LIMIT 4;
```

```text
┌─dictGetDescendants('hierarchy_flat_dictionary', number)─┐
│ [1,2,3,4]                                               │
│ [2,3,4]                                                 │
│ [4]                                                     │
│ []                                                      │
└─────────────────────────────────────────────────────────┘
```

첫 번째 수준 후손:

```sql
SELECT dictGetDescendants('hierarchy_flat_dictionary', number, 1) FROM system.numbers LIMIT 4;
```

```text
┌─dictGetDescendants('hierarchy_flat_dictionary', number, 1)─┐
│ [1]                                                        │
│ [2,3]                                                      │
│ [4]                                                        │
│ []                                                         │
└────────────────────────────────────────────────────────────┘
```

## dictGetAll {#dictgetall}

[정규 표현식 트리 딕셔너리](../../sql-reference/dictionaries/index.md#regexp-tree-dictionary)에서 각 키에 일치하는 모든 노드의 속성 값을 검색합니다.

값의 유형이 `Array(T)`로 반환되며 `T` 대신, 이 함수는 [`dictGet`](#dictget-dictgetordefault-dictgetornull)와 유사하게 작동합니다.

**구문**

```sql
dictGetAll('dict_name', attr_names, id_expr[, limit])
```

**인수**

- `dict_name` — 딕셔너리의 이름. [문자열 리터럴](/sql-reference/syntax#string).
- `attr_names` — 딕셔너리의 컬럼 이름, [문자열 리터럴](/sql-reference/syntax#string), 또는 컬럼 이름들의 튜플, [Tuple](/sql-reference/data-types/tuple)([문자열 리터럴](/sql-reference/syntax#string)).
- `id_expr` — 키 값. [표현식](/sql-reference/syntax#expressions)으로 배열 형태의 딕셔너리 키 유형 값을 반환하거나 [Tuple](/sql-reference/data-types/tuple)-유형 값을 반환합니다. 딕셔너리 구성에 따라 달라집니다.
- `limit` - 반환되는 각 값 배열의 최대 길이. 자식을 우선적으로 처리하고 있습니다. 자식 노드는 부모 노드보다 우선하며, 그렇지 않은 경우 정규 표현식 트리 딕셔너리에 대한 정의된 순서가 존중됩니다. 지정하지 않으면 배열의 길이는 무제한입니다.

**반환 값**

- ClickHouse가 딕셔너리에서 속성을 성공적으로 구문 분석하면, 각 속성의 `attr_names`에 대해 `id_expr`에 해당하는 딕셔너리 속성 값의 배열을 반환합니다.

- 딕셔너리에 `id_expr`에 해당하는 키가 없으면 빈 배열을 반환합니다.

ClickHouse는 속성의 값을 구문 분석할 수 없거나 값이 속성 데이터 유형과 일치하지 않으면 예외를 발생시킵니다.

**예제**

다음 정규 표현식 트리 딕셔너리를 고려합니다:

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    tag String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
...
```

```yaml

# /var/lib/clickhouse/user_files/regexp_tree.yaml
- regexp: 'foo'
  tag: 'foo_attr'
- regexp: 'bar'
  tag: 'bar_attr'
- regexp: 'baz'
  tag: 'baz_attr'
```

모든 일치하는 값 얻기:

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz');
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz')─┐
│ ['foo_attr','bar_attr','baz_attr']            │
└───────────────────────────────────────────────┘
```

최대 2개의 일치하는 값 얻기:

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2);
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2)─┐
│ ['foo_attr','bar_attr']                          │
└──────────────────────────────────────────────────┘
```

## 기타 함수 {#other-functions}

ClickHouse는 딕셔너리 구성과 관계없이 딕셔너리 속성 값을 특정 데이터 유형으로 변환하는 전문 함수를 지원합니다.

함수:

- `dictGetInt8`, `dictGetInt16`, `dictGetInt32`, `dictGetInt64`
- `dictGetUInt8`, `dictGetUInt16`, `dictGetUInt32`, `dictGetUInt64`
- `dictGetFloat32`, `dictGetFloat64`
- `dictGetDate`
- `dictGetDateTime`
- `dictGetUUID`
- `dictGetString`
- `dictGetIPv4`, `dictGetIPv6`

이 모든 함수는 `OrDefault` 수정이 있습니다. 예를 들어, `dictGetDateOrDefault`.

구문:

```sql
dictGet[Type]('dict_name', 'attr_name', id_expr)
dictGet[Type]OrDefault('dict_name', 'attr_name', id_expr, default_value_expr)
```

**인수**

- `dict_name` — 딕셔너리의 이름. [문자열 리터럴](/sql-reference/syntax#string).
- `attr_name` — 딕셔너리의 컬럼 이름. [문자열 리터럴](/sql-reference/syntax#string).
- `id_expr` — 키 값. [표현식](/sql-reference/syntax#expressions)으로 [UInt64](../data-types/int-uint.md) 또는 [Tuple](../data-types/tuple.md)-유형 값을 반환합니다. 딕셔너리 구성에 따라 달라집니다.
- `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 경우 반환되는 값. [표현식](/sql-reference/syntax#expressions)으로 `attr_name` 속성에 대해 구성된 데이터 유형에서 값을 반환합니다.

**반환 값**

- ClickHouse가 [속성의 데이터 유형](/sql-reference/dictionaries#dictionary-key-and-fields)에서 속성을 성공적으로 구문 분석하면, 함수는 `id_expr`에 해당하는 딕셔너리 속성 값을 반환합니다.

- 요청한 `id_expr`가 딕셔너리에 없으면:

        - `dictGet[Type]`는 딕셔너리 구성에서 속성을 위해 지정된 `<null_value>` 요소의 내용을 반환합니다.
        - `dictGet[Type]OrDefault`는 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

ClickHouse는 속성의 값을 구문 분석할 수 없거나 값이 속성 데이터 유형과 일치하지 않으면 예외를 발생시킵니다.

## 예제 딕셔너리 {#example-dictionary}

이 섹션의 예제는 다음과 같은 딕셔너리를 사용합니다. ClickHouse에서 이들을 생성하여 아래 설명된 함수의 예제를 실행할 수 있습니다.

<details>
<summary>dictGet\<T\> 및 dictGet\<T\>OrDefault 함수에 대한 예제 딕셔너리</summary>

```sql
-- Create table with all the required data types
CREATE TABLE all_types_test (
    `id` UInt32,

    -- String type
    `String_value` String,

    -- Unsigned integer types
    `UInt8_value` UInt8,
    `UInt16_value` UInt16,
    `UInt32_value` UInt32,
    `UInt64_value` UInt64,

    -- Signed integer types
    `Int8_value` Int8,
    `Int16_value` Int16,
    `Int32_value` Int32,
    `Int64_value` Int64,

    -- Floating point types
    `Float32_value` Float32,
    `Float64_value` Float64,

    -- Date/time types
    `Date_value` Date,
    `DateTime_value` DateTime,

    -- Network types
    `IPv4_value` IPv4,
    `IPv6_value` IPv6,

    -- UUID type
    `UUID_value` UUID
) ENGINE = MergeTree() 
ORDER BY id;
```
```sql
-- Insert test data
INSERT INTO all_types_test VALUES
(
    1,                              -- id
    'ClickHouse',                   -- String
    100,                            -- UInt8
    5000,                           -- UInt16
    1000000,                        -- UInt32
    9223372036854775807,            -- UInt64
    -100,                           -- Int8
    -5000,                          -- Int16
    -1000000,                       -- Int32
    -9223372036854775808,           -- Int64
    123.45,                         -- Float32
    987654.123456,                  -- Float64
    '2024-01-15',                   -- Date
    '2024-01-15 10:30:00',          -- DateTime
    '192.168.1.1',                  -- IPv4
    '2001:db8::1',                  -- IPv6
    '550e8400-e29b-41d4-a716-446655440000' -- UUID
)
```

```sql
-- Create dictionary
CREATE DICTIONARY all_types_dict
(
    id UInt32,
    String_value String,
    UInt8_value UInt8,
    UInt16_value UInt16,
    UInt32_value UInt32,
    UInt64_value UInt64,
    Int8_value Int8,
    Int16_value Int16,
    Int32_value Int32,
    Int64_value Int64,
    Float32_value Float32,
    Float64_value Float64,
    Date_value Date,
    DateTime_value DateTime,
    IPv4_value IPv4,
    IPv6_value IPv6,
    UUID_value UUID
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT 9000 USER 'default' TABLE 'all_types_test' DB 'default'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 600);
```
</details>

<details>
<summary>dictGetAll에 대한 예제 딕셔너리</summary>

정규 표현식 트리 딕셔너리의 데이터를 저장할 테이블을 생성합니다:

```sql
CREATE TABLE regexp_os(
    id UInt64,
    parent_id UInt64,
    regexp String,
    keys Array(String),
    values Array(String)
)
ENGINE = Memory;
```

테이블에 데이터 삽입:

```sql
INSERT INTO regexp_os 
SELECT *
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/' ||
    'user_agent_regex/regexp_os.csv'
);
```

정규 표현식 트리 딕셔너리 생성:

```sql
CREATE DICTIONARY regexp_tree
(
    regexp String,
    os_replacement String DEFAULT 'Other',
    os_v1_replacement String DEFAULT '0',
    os_v2_replacement String DEFAULT '0',
    os_v3_replacement String DEFAULT '0',
    os_v4_replacement String DEFAULT '0'
)
PRIMARY KEY regexp
SOURCE(CLICKHOUSE(TABLE 'regexp_os'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(REGEXP_TREE);
```
</details>

<details>
<summary>범위 키 딕셔너리에 대한 예제</summary>

입력 테이블 생성:

```sql
CREATE TABLE range_key_dictionary_source_table
(
    key UInt64,
    start_date Date,
    end_date Date,
    value String,
    value_nullable Nullable(String)
)
ENGINE = TinyLog();
```

입력 테이블에 데이터 삽입:

```sql
INSERT INTO range_key_dictionary_source_table VALUES(1, toDate('2019-05-20'), toDate('2019-05-20'), 'First', 'First');
INSERT INTO range_key_dictionary_source_table VALUES(2, toDate('2019-05-20'), toDate('2019-05-20'), 'Second', NULL);
INSERT INTO range_key_dictionary_source_table VALUES(3, toDate('2019-05-20'), toDate('2019-05-20'), 'Third', 'Third');
```

딕셔너리 생성:

```sql
CREATE DICTIONARY range_key_dictionary
(
    key UInt64,
    start_date Date,
    end_date Date,
    value String,
    value_nullable Nullable(String)
)
PRIMARY KEY key
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() TABLE 'range_key_dictionary_source_table'))
LIFETIME(MIN 1 MAX 1000)
LAYOUT(RANGE_HASHED())
RANGE(MIN start_date MAX end_date);
```
</details>

<details>
<summary>복합 키 딕셔너리에 대한 예제</summary>

소스 테이블 생성: 

```sql
CREATE TABLE dict_mult_source
(
id UInt32,
c1 UInt32,
c2 String
) ENGINE = Memory;
```

소스 테이블에 데이터 삽입:

```sql
INSERT INTO dict_mult_source VALUES
(1, 1, '1'),
(2, 2, '2'),
(3, 3, '3');
```

딕셔너리 생성:

```sql
CREATE DICTIONARY ext_dict_mult
(
    id UInt32,
    c1 UInt32,
    c2 String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT 9000 USER 'default' TABLE 'dict_mult_source' DB 'default'))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 0);
```
</details>

<details>
<summary>계층적 딕셔너리에 대한 예제</summary>

소스 테이블 생성:

```sql
CREATE TABLE hierarchy_source
(
  id UInt64,
  parent_id UInt64,
  name String
) ENGINE = Memory;
```

소스 테이블에 데이터 삽입:

```sql
INSERT INTO hierarchy_source VALUES
(0, 0, 'Root'),
(1, 0, 'Level 1 - Node 1'),
(2, 1, 'Level 2 - Node 2'),
(3, 1, 'Level 2 - Node 3'),
(4, 2, 'Level 3 - Node 4'),
(5, 2, 'Level 3 - Node 5'),
(6, 3, 'Level 3 - Node 6');

-- 0 (Root)
-- └── 1 (Level 1 - Node 1)
--     ├── 2 (Level 2 - Node 2)
--     │   ├── 4 (Level 3 - Node 4)
--     │   └── 5 (Level 3 - Node 5)
--     └── 3 (Level 2 - Node 3)
--         └── 6 (Level 3 - Node 6)
```

딕셔너리 생성:

```sql
CREATE DICTIONARY hierarchical_dictionary
(
    id UInt64,
    parent_id UInt64 HIERARCHICAL,
    name String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT 9000 USER 'default' TABLE 'hierarchy_source' DB 'default'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 600);
```
</details>

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
