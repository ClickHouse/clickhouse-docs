---
description: '사전(Dictionary)을 다루는 함수에 대한 문서'
sidebar_label: '사전(Dictionary)'
slug: /sql-reference/functions/ext-dict-functions
title: '사전(Dictionary)을 다루는 함수'
doc_type: 'reference'
---

# 딕셔너리 작업용 함수 \{#functions-for-working-with-dictionaries\}

:::note
[DDL 쿼리](../statements/create/dictionary/overview.md)로 생성된 딕셔너리의 경우 `dict_name` 매개변수는 `<database>.<dict_name>` 형식으로 완전하게 지정해야 합니다. 그렇지 않으면 현재 데이터베이스가 사용됩니다.
:::

딕셔너리 연결 및 설정에 대한 자세한 내용은 [Dictionaries](../statements/create/dictionary/overview.md)를 참조하십시오.

## 예시 딕셔너리 \{#example-dictionary\}

이 섹션의 예시에서는 다음 딕셔너리를 사용합니다. 아래에 설명된 함수 예제를 실행하려면 ClickHouse에서 이 딕셔너리를 생성해야 합니다.

<details>
<summary>dictGet&lt;T&gt; 및 dictGet&lt;T&gt;OrDefault 함수용 예시 딕셔너리</summary>

```sql
-- 필요한 모든 데이터 타입을 포함하는 테이블 생성
CREATE TABLE all_types_test (
    `id` UInt32,
    
    -- String 타입
    `String_value` String,
    
    -- 부호 없는 정수 타입
    `UInt8_value` UInt8,
    `UInt16_value` UInt16,
    `UInt32_value` UInt32,
    `UInt64_value` UInt64,
    
    -- 부호 있는 정수 타입
    `Int8_value` Int8,
    `Int16_value` Int16,
    `Int32_value` Int32,
    `Int64_value` Int64,
    
    -- 부동 소수점 타입
    `Float32_value` Float32,
    `Float64_value` Float64,
    
    -- 날짜/시간 타입
    `Date_value` Date,
    `DateTime_value` DateTime,
    
    -- 네트워크 타입
    `IPv4_value` IPv4,
    `IPv6_value` IPv6,
    
    -- UUID 타입
    `UUID_value` UUID
) ENGINE = MergeTree() 
ORDER BY id;
```
```sql
-- 테스트 데이터 삽입
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
-- 딕셔너리 생성
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
<summary>dictGetAll용 예시 딕셔너리</summary>

regexp 트리 딕셔너리의 데이터를 저장할 테이블을 생성합니다.

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

테이블에 데이터를 삽입합니다.

```sql
INSERT INTO regexp_os 
SELECT *
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/' ||
    'user_agent_regex/regexp_os.csv'
);
```

regexp 트리 딕셔너리를 생성합니다.

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
  <summary>범위 키 딕셔너리 예시</summary>

  입력 테이블을 생성합니다.

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

  입력 테이블에 데이터를 삽입합니다.

  ```sql
  INSERT INTO range_key_dictionary_source_table VALUES(1, toDate('2019-05-20'), toDate('2019-05-20'), 'First', 'First');
  INSERT INTO range_key_dictionary_source_table VALUES(2, toDate('2019-05-20'), toDate('2019-05-20'), 'Second', NULL);
  INSERT INTO range_key_dictionary_source_table VALUES(3, toDate('2019-05-20'), toDate('2019-05-20'), 'Third', 'Third');
  ```

  딕셔너리를 생성합니다.

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
  <summary>복합 키 딕셔너리 예시</summary>

  소스 테이블을 생성합니다.

  ```sql
  CREATE TABLE dict_mult_source
  (
  id UInt32,
  c1 UInt32,
  c2 String
  ) ENGINE = Memory;
  ```

  소스 테이블에 데이터를 삽입합니다.

  ```sql
  INSERT INTO dict_mult_source VALUES
  (1, 1, '1'),
  (2, 2, '2'),
  (3, 3, '3');
  ```

  딕셔너리를 생성합니다.

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
  <summary>계층형 딕셔너리 예시</summary>

  소스 테이블을 생성합니다.

  ```sql
  CREATE TABLE hierarchy_source
  (
    id UInt64,
    parent_id UInt64,
    name String
  ) ENGINE = Memory;
  ```

  소스 테이블에 데이터를 삽입합니다.

  ```sql
  INSERT INTO hierarchy_source VALUES
  (0, 0, 'Root'),
  (1, 0, 'Level 1 - Node 1'),
  (2, 1, 'Level 2 - Node 2'),
  (3, 1, 'Level 2 - Node 3'),
  (4, 2, 'Level 3 - Node 4'),
  (5, 2, 'Level 3 - Node 5'),
  (6, 3, 'Level 3 - Node 6');

  -- 0 (루트)
  -- └── 1 (레벨 1 - 노드 1)
  --     ├── 2 (레벨 2 - 노드 2)
  --     │   ├── 4 (레벨 3 - 노드 4)
  --     │   └── 5 (레벨 3 - 노드 5)
  --     └── 3 (레벨 2 - 노드 3)
  --         └── 6 (레벨 3 - 노드 6)
  ```

  딕셔너리를 생성합니다.

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

{/* 
  아래 태그 안의 내용은 문서 프레임워크를 빌드할 때 
  system.functions에서 생성된 문서로 대체됩니다. 태그를 수정하거나 제거하지 마십시오.
  자세한 내용은 https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md 를 참조하십시오.
  */ }

{/*AUTOGENERATED_START*/ }


## dictGet \{#dictGet\}

도입된 버전: v18.16

딕셔너리에서 값을 조회합니다.

**구문**

```sql
dictGet('dict_name', attr_names, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_names` — 딕셔너리 컬럼 이름 또는 컬럼 이름의 튜플. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. `UInt64/Tuple(T)`를 반환하는 식. [`UInt64`](/sql-reference/data-types/int-uint) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

키를 찾으면 `id_expr`에 해당하는 딕셔너리 속성 값을 반환합니다.
키를 찾지 못하면, 딕셔너리 설정에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

**예시**

**단일 속성 조회**

```sql title=Query
SELECT dictGet('ext_dict_test', 'c1', toUInt64(1)) AS val
```

```response title=Response
1
```

**다중 속성**

```sql title=Query
SELECT
    dictGet('ext_dict_mult', ('c1','c2'), number + 1) AS val,
    toTypeName(val) AS type
FROM system.numbers
LIMIT 3;
```

```response title=Response
┌─val─────┬─type───────────┐
│ (1,'1') │ Tuple(        ↴│
│         │↳    c1 UInt32,↴│
│         │↳    c2 String) │
│ (2,'2') │ Tuple(        ↴│
│         │↳    c1 UInt32,↴│
│         │↳    c2 String) │
│ (3,'3') │ Tuple(        ↴│
│         │↳    c1 UInt32,↴│
│         │↳    c2 String) │
└─────────┴────────────────┘
```


## dictGetAll \{#dictGetAll\}

도입된 버전: v23.5

딕셔너리 구성과 관계없이 딕셔너리 속성 값을 `All` 데이터 유형으로 변환합니다.

**구문**

```sql
dictGetAll(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리의 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 식입니다(딕셔너리 설정에 따라 달라집니다). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하고,
그렇지 않으면 딕셔너리 설정에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT
    'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36' AS user_agent,

    -- This will match ALL applicable patterns
    dictGetAll('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS all_matches,

    -- This returns only the first match
    dictGet('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS first_match;
```

```response title=Response
┌─user_agent─────────────────────────────────────────────────────┬─all_matches─────────────────────────────┬─first_match─┐
│ Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36 │ ['Android','Android','Android','Linux'] │ Android     │
└────────────────────────────────────────────────────────────────┴─────────────────────────────────────────┴─────────────┘
```


## dictGetChildren \{#dictGetChildren\}

도입 버전: v21.4

첫 번째 수준 자식들을 인덱스 배열로 반환합니다. [dictGetHierarchy](#dictGetHierarchy)의 역변환입니다.

**구문**

```sql
dictGetChildren(dict_name, key)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `key` — 확인할 키. [`const String`](/sql-reference/data-types/string)

**반환 값**

지정된 키의 1단계 자식 항목을 반환합니다. [`Array(UInt64)`](/sql-reference/data-types/array)

**예시**

**딕셔너리에서 1단계 자식 항목 가져오기**

```sql title=Query
SELECT dictGetChildren('hierarchical_dictionary', 2);
```

```response title=Response
┌─dictGetChild⋯ionary', 2)─┐
│ [4,5]                    │
└──────────────────────────┘
```


## dictGetDate \{#dictGetDate\}

도입된 버전: v1.1

딕셔너리 속성 값을 딕셔너리 설정과 관계없이 `Date` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetDate(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입 값 또는 튜플 값을 반환하는 식(딕셔너리 설정에 따라 달라집니다). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 대응하는 딕셔너리 속성 값을 반환하며,
그렇지 않으면 딕셔너리 설정에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetDate('all_types_dict', 'Date_value', 1)
```

```response title=Response
┌─dictGetDate(⋯_value', 1)─┐
│               2020-01-01 │
└──────────────────────────┘
```


## dictGetDateOrDefault \{#dictGetDateOrDefault\}

도입 버전: v1.1

딕셔너리 설정과 관계없이 딕셔너리 속성 값을 `Date` 데이터 유형으로 변환하거나, 키를 찾을 수 없는 경우 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetDateOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입 값 또는 튜플 값을 반환하는 식(딕셔너리 설정에 따라 다름). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값(들). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환합니다.
해당 값이 없으면 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetDate('all_types_dict', 'Date_value', 1);

-- for key which does not exist, returns the provided default value
SELECT dictGetDateOrDefault('all_types_dict', 'Date_value', 999, toDate('1970-01-01'));
```

```response title=Response
┌─dictGetDate(⋯_value', 1)─┐
│               2024-01-15 │
└──────────────────────────┘
┌─dictGetDateO⋯70-01-01'))─┐
│               1970-01-01 │
└──────────────────────────┘
```


## dictGetDateTime \{#dictGetDateTime\}

도입 버전: v1.1

딕셔너리 구성과 관계없이 딕셔너리 속성 값을 `DateTime` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetDateTime(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 표현식(딕셔너리 설정에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
해당 값이 없으면 딕셔너리 설정에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 ClickHouse가 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1)
```

```response title=Response
┌─dictGetDateT⋯_value', 1)─┐
│      2024-01-15 10:30:00 │
└──────────────────────────┘
```


## dictGetDateTimeOrDefault \{#dictGetDateTimeOrDefault\}

도입 버전: v1.1

딕셔너리 설정과 무관하게 딕셔너리 속성 값을 `DateTime` 데이터 형식으로 변환하며, 키를 찾을 수 없는 경우에는 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetDateTimeOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 표현식(딕셔너리 설정에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환할 값. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않은 경우 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1);

-- for key which does not exist, returns the provided default value
SELECT dictGetDateTimeOrDefault('all_types_dict', 'DateTime_value', 999, toDateTime('1970-01-01 00:00:00'));
```

```response title=Response
┌─dictGetDateT⋯_value', 1)─┐
│      2024-01-15 10:30:00 │
└──────────────────────────┘
┌─dictGetDateT⋯0:00:00'))──┐
│      1970-01-01 00:00:00 │
└──────────────────────────┘
```


## dictGetDescendants \{#dictGetDescendants\}

도입 버전: v21.4

[`dictGetChildren`](#dictGetChildren) FUNCTION을 `level` 단계만큼 재귀적으로 적용한 것과 같이 모든 하위 요소를 반환합니다.

**구문**

```sql
dictGetDescendants(dict_name, key, level)
```

**인자**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `key` — 확인할 키. [`const String`](/sql-reference/data-types/string)
* `level` — 확인할 계층 수준. `level = 0`이면 마지막까지 모든 하위 항목을 반환합니다. [`UInt8`](/sql-reference/data-types/int-uint)

**반환 값**

해당 키의 하위 항목들을 반환합니다. [`Array(UInt64)`](/sql-reference/data-types/array)

**예시**

**딕셔너리에서 1단계 자식 가져오기**

```sql title=Query
-- consider the following hierarchical dictionary:
-- 0 (Root)
-- └── 1 (Level 1 - Node 1)
--     ├── 2 (Level 2 - Node 2)
--     │   ├── 4 (Level 3 - Node 4)
--     │   └── 5 (Level 3 - Node 5)
--     └── 3 (Level 2 - Node 3)
--         └── 6 (Level 3 - Node 6)

SELECT dictGetDescendants('hierarchical_dictionary', 0, 2)
```

```response title=Response
┌─dictGetDesce⋯ary', 0, 2)─┐
│ [3,2]                    │
└──────────────────────────┘
```


## dictGetFloat32 \{#dictGetFloat32\}

도입 버전: v1.1

딕셔너리 속성 값을 딕셔너리 설정과 무관하게 `Float32` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetFloat32(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입 값 또는 튜플 값을 반환하는 표현식(딕셔너리 구성에 따라 다름). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않은 경우 딕셔너리 구성에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 ClickHouse가 예외를 던집니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1)
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│               -123.123   │
└──────────────────────────┘
```


## dictGetFloat32OrDefault \{#dictGetFloat32OrDefault\}

도입된 버전: v1.1

딕셔너리(Dictionary) 설정과 관계없이 딕셔너리 속성 값을 `Float32` 데이터 타입으로 변환하거나, 키가 존재하지 않으면 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetFloat32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입 값 또는 튜플 값을 반환하는 표현식(딕셔너리 구성에 따라 다름). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
해당하는 값이 없으면 `default_value_expr` 인수로 전달된 값을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않는 경우 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1);

-- for key which does not exist, returns the provided default value (-1.0)
SELECT dictGetFloat32OrDefault('all_types_dict', 'Float32_value', 999, -1.0);
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│                   123.45 │
└──────────────────────────┘
┌─dictGetFloat⋯e', 999, -1)─┐
│                       -1  │
└───────────────────────────┘
```


## dictGetFloat64 \{#dictGetFloat64\}

도입 버전: v1.1

딕셔너리 구성과 상관없이 딕셔너리 속성 값을 `Float64` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetFloat64(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입 값 또는 튜플 값을 반환하는 표현식(딕셔너리 구성에 따라 달라집니다). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않은 경우 딕셔너리 구성에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱하지 못하거나 값이 속성 데이터 타입과 일치하지 않는 경우 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetFloat64('all_types_dict', 'Float64_value', 1)
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│                 -123.123 │
└──────────────────────────┘
```


## dictGetFloat64OrDefault \{#dictGetFloat64OrDefault\}

도입 버전: v1.1

딕셔너리 구성과 관계없이 딕셔너리 속성 값을 `Float64` 데이터 타입으로 변환하거나, 키를 찾을 수 없으면 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetFloat64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 식(딕셔너리 설정에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환할 값. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않은 경우 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 그 값이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetFloat64('all_types_dict', 'Float64_value', 1);

-- for key which does not exist, returns the provided default value (nan)
SELECT dictGetFloat64OrDefault('all_types_dict', 'Float64_value', 999, nan);
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│            987654.123456 │
└──────────────────────────┘
┌─dictGetFloat⋯, 999, nan)─┐
│                      nan │
└──────────────────────────┘
```


## dictGetHierarchy \{#dictGetHierarchy\}

도입 버전: v1.1

[계층 딕셔너리](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries)에서 주어진 키의 모든 부모를 포함하는 배열을 반환합니다.

**구문**

```sql
dictGetHierarchy(dict_name, key)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `key` — 키 값. [`const String`](/sql-reference/data-types/string)

**반환 값**

키의 상위(부모) 항목을 반환합니다. [`Array(UInt64)`](/sql-reference/data-types/array)

**예시**

**키의 계층 구조 가져오기**

```sql title=Query
SELECT dictGetHierarchy('hierarchical_dictionary', 5)
```

```response title=Response
┌─dictGetHiera⋯ionary', 5)─┐
│ [5,2,1]                  │
└──────────────────────────┘
```


## dictGetIPv4 \{#dictGetIPv4\}

도입 버전: v1.1

딕셔너리 속성 값을 딕셔너리 설정과 관계없이 `IPv4` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetIPv4(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입 값 또는 튜플 값을 반환하는 식(딕셔너리 구성에 따라 달라집니다). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
해당하지 않는 경우 딕셔너리 구성에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1)
```

```response title=Response
┌─dictGetIPv4('all_⋯ 'IPv4_value', 1)─┐
│ 192.168.0.1                         │
└─────────────────────────────────────┘
```


## dictGetIPv4OrDefault \{#dictGetIPv4OrDefault\}

도입된 버전: v23.1

딕셔너리 설정과 관계없이 딕셔너리 속성 값을 `IPv4` 데이터 형식으로 변환하며, 키가 존재하지 않으면 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetIPv4OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 표현식(딕셔너리 구성에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하고,
그렇지 않으면 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 ClickHouse는 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1);

-- for key which does not exist, returns the provided default value
SELECT dictGetIPv4OrDefault('all_types_dict', 'IPv4_value', 999, toIPv4('0.0.0.0'));
```

```response title=Response
┌─dictGetIPv4('all_⋯ 'IPv4_value', 1)─┐
│ 192.168.0.1                         │
└─────────────────────────────────────┘
┌─dictGetIPv4OrDefa⋯0.0.0.0'))─┐
│ 0.0.0.0                      │
└──────────────────────────────┘
```


## dictGetIPv6 \{#dictGetIPv6\}

도입 버전: v23.1

딕셔너리의 속성 값을 딕셔너리 설정과 무관하게 `IPv6` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetIPv6(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 식(딕셔너리 구성에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환값**

`id_expr`에 대응하는 딕셔너리 속성 값을 반환하며,
해당하지 않는 경우 딕셔너리 구성에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1)
```

```response title=Response
┌─dictGetIPv6('all_⋯ 'IPv6_value', 1)─┐
│ 2001:db8:85a3::8a2e:370:7334        │
└─────────────────────────────────────┘
```


## dictGetIPv6OrDefault \{#dictGetIPv6OrDefault\}

도입된 버전: v23.1

딕셔너리 구성과 관계없이 딕셔너리 속성 값을 `IPv6` 데이터 타입으로 변환하거나, 키가 존재하지 않으면 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetIPv6OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 표현식(딕셔너리 설정에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성의 값을 반환하며,
그렇지 않으면 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않는 경우 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1);

-- for key which does not exist, returns the provided default value
SELECT dictGetIPv6OrDefault('all_types_dict', 'IPv6_value', 999, '::1'::IPv6);
```

```response title=Response
┌─dictGetIPv6('all_⋯ 'IPv6_value', 1)─┐
│ 2001:db8:85a3::8a2e:370:7334        │
└─────────────────────────────────────┘
┌─dictGetIPv6OrDefa⋯:1'::IPv6)─┐
│ ::1                          │
└──────────────────────────────┘
```


## dictGetInt16 \{#dictGetInt16\}

도입 버전: v1.1

딕셔너리 구성과 관계없이 딕셔너리 속성 값을 `Int16` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetInt16(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입 값 또는 튜플 값을 반환하는 표현식(딕셔너리 구성에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환합니다.
해당 값이 없으면 딕셔너리 구성에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 ClickHouse는 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetInt16('all_types_dict', 'Int16_value', 1)
```

```response title=Response
┌─dictGetInt16⋯_value', 1)─┐
│                    -5000 │
└──────────────────────────┘
```


## dictGetInt16OrDefault \{#dictGetInt16OrDefault\}

도입된 버전: v1.1

딕셔너리 설정과 관계없이 딕셔너리 속성 값을 `Int16` 데이터 타입으로 변환하거나, 키가 존재하지 않을 경우 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 형식의 값을 반환하는 표현식(딕셔너리 구성에 따라 다름). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
해당하지 않는 경우 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 ClickHouse는 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetInt16('all_types_dict', 'Int16_value', 1);

-- for key which does not exist, returns the provided default value (-1)
SELECT dictGetInt16OrDefault('all_types_dict', 'Int16_value', 999, -1);
```

```response title=Response
┌─dictGetInt16⋯_value', 1)─┐
│                    -5000 │
└──────────────────────────┘
┌─dictGetInt16⋯', 999, -1)─┐
│                       -1 │
└──────────────────────────┘
```


## dictGetInt32 \{#dictGetInt32\}

v1.1에 도입되었습니다.

딕셔너리 속성 값을 딕셔너리 설정과 관계없이 `Int32` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetInt32(dict_name, attr_name, id_expr)
```

**인자**

* `dict_name` — 딕셔너리의 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 식(딕셔너리 설정에 따라 다름). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않은 경우 딕셔너리 설정에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
ClickHouse는 속성 값을 구문 분석할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1)
```

```response title=Response
┌─dictGetInt32⋯_value', 1)─┐
│                -1000000  │
└──────────────────────────┘
```


## dictGetInt32OrDefault \{#dictGetInt32OrDefault\}

도입 버전: v1.1

딕셔너리 구성과 관계없이 딕셔너리 속성 값을 `Int32` 데이터 타입으로 변환하며, 키가 존재하지 않으면 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 식(딕셔너리 설정에 따라 달라집니다). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값입니다. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
해당 값이 없으면 `default_value_expr` 인수로 전달된 값을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성의 데이터 타입과 일치하지 않는 경우 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1);

-- for key which does not exist, returns the provided default value (-1)
SELECT dictGetInt32OrDefault('all_types_dict', 'Int32_value', 999, -1);
```

```response title=Response
┌─dictGetInt32⋯_value', 1)─┐
│                -1000000  │
└──────────────────────────┘
┌─dictGetInt32⋯', 999, -1)─┐
│                       -1 │
└──────────────────────────┘
```


## dictGetInt64 \{#dictGetInt64\}

도입: v1.1

딕셔너리 속성 값을 딕셔너리 구성과 관계없이 `Int64` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetInt64(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 표현식(딕셔너리 설정에 따라 다름). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않으면 딕셔너리 설정에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않는 경우 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetInt64('all_types_dict', 'Int64_value', 1)
```

```response title=Response
┌─dictGetInt64⋯_value', 1)───┐
│       -9223372036854775807 │
└────────────────────────────┘
```


## dictGetInt64OrDefault \{#dictGetInt64OrDefault\}

도입된 버전: v1.1

딕셔너리 구성과 관계없이 딕셔너리 속성 값을 `Int64` 데이터 유형으로 변환하거나, 키를 찾을 수 없으면 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 식(딕셔너리 설정에 따라 다름). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값(들). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않은 경우 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않을 때 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetInt64('all_types_dict', 'Int64_value', 1);

-- for key which does not exist, returns the provided default value (-1)
SELECT dictGetInt64OrDefault('all_types_dict', 'Int64_value', 999, -1);
```

```response title=Response
┌─dictGetInt64⋯_value', 1)─┐
│     -9223372036854775808 │
└──────────────────────────┘
┌─dictGetInt64⋯', 999, -1)─┐
│                       -1 │
└──────────────────────────┘
```


## dictGetInt8 \{#dictGetInt8\}

도입된 버전: v1.1

딕셔너리 속성 값을 딕셔너리 구성과 관계없이 `Int8` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetInt8(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리(Dictionary) 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 식(딕셔너리 구성에 따라 다름). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성(attribute) 값을 반환하며,
그렇지 않은 경우 딕셔너리 구성에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값의 타입이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1)
```

```response title=Response
┌─dictGetInt8(⋯_value', 1)─┐
│                     -100 │
└──────────────────────────┘
```


## dictGetInt8OrDefault \{#dictGetInt8OrDefault\}

도입된 버전: v1.1

딕셔너리 구성과 관계없이 딕셔너리 속성 값을 `Int8` 데이터 타입으로 변환하거나, 키를 찾을 수 없는 경우 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인자**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 식(딕셔너리 구성에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않은 경우 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성의 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1);

-- for key which does not exist, returns the provided default value (-1)
SELECT dictGetInt8OrDefault('all_types_dict', 'Int8_value', 999, -1);
```

```response title=Response
┌─dictGetInt8(⋯_value', 1)─┐
│                     -100 │
└──────────────────────────┘
┌─dictGetInt8O⋯', 999, -1)─┐
│                       -1 │
└──────────────────────────┘
```


## dictGetKeys \{#dictGetKeys\}

도입 버전: v25.12

지정한 값과 같은 속성을 가진 딕셔너리 키를 반환합니다. 단일 속성에 대해서 `dictGet` 함수의 역방향 기능을 수행합니다.

`dictGetKeys`에서 사용하는 쿼리별 역조회 캐시의 크기를 제한하려면 `max_reverse_dictionary_lookup_cache_size_bytes` 설정을 사용합니다.
캐시는 동일한 쿼리 내에서 딕셔너리를 다시 스캔하지 않도록, 각 속성 값에 대한 직렬화된 키 튜플을 저장합니다.
캐시는 쿼리 간에는 유지되지 않습니다. 제한에 도달하면 항목은 LRU 방식으로 제거됩니다.
입력의 낮은 카디널리티를 가지며 작업 집합이 캐시에 적재될 수 있을 때, 대규모 딕셔너리에서 가장 효과적입니다. 캐시를 비활성화하려면 `0`으로 설정합니다.

**구문**

```sql
dictGetKeys('dict_name', 'attr_name', value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름입니다. [`String`](/sql-reference/data-types/string)
* `attr_name` — 일치시킬 속성입니다. [`String`](/sql-reference/data-types/string)
* `value_expr` — 해당 속성과 비교할 값입니다. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**반환 값**

단일 키 딕셔너리의 경우: 속성 값이 `value_expr`와 같은 키들의 배열을 반환합니다. 다중 키 딕셔너리의 경우: 속성 값이 `value_expr`와 같은 키 튜플들의 배열을 반환합니다. 딕셔너리에 `value_expr`에 해당하는 속성이 없으면 빈 배열을 반환합니다. ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성의 데이터 타입으로 변환될 수 없는 경우 예외를 발생시킵니다.

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetKeys('task_id_to_priority_dictionary', 'priority_level', 'high') AS ids;
```

```response title=Response
┌─ids───┐
│ [4,2] │
└───────┘
```


## dictGetOrDefault \{#dictGetOrDefault\}

도입된 버전: v18.16

딕셔너리에서 값을 조회하며, 키가 존재하지 않으면 기본값을 반환합니다.

**구문**

```sql
dictGetOrDefault('dict_name', attr_names, id_expr, default_value)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_names` — 딕셔너리의 컬럼 이름 또는 컬럼 이름 튜플. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. `UInt64/Tuple(T)`를 반환하는 표현식. [`UInt64`](/sql-reference/data-types/int-uint) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value` — 키를 찾을 수 없을 때 반환할 기본값. 타입은 해당 속성의 데이터 타입과 일치해야 합니다.

**반환 값**

키가 존재하는 경우 `id_expr`에 해당하는 딕셔너리 속성의 값을 반환합니다.
키가 존재하지 않는 경우 제공된 `default_value`를 반환합니다.

**예시**

**기본값을 사용한 값 조회**

```sql title=Query
SELECT dictGetOrDefault('ext_dict_mult', 'c1', toUInt64(999), 0) AS val
```

```response title=Response
0
```


## dictGetOrNull \{#dictGetOrNull\}

도입된 버전: v21.4

딕셔너리에서 값을 조회하며, 키가 존재하지 않으면 NULL을 반환합니다.

**구문**

```sql
dictGetOrNull('dict_name', 'attr_name', id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름입니다. 문자열 리터럴입니다. - `attr_name` — 조회할 컬럼 이름입니다. 문자열 리터럴입니다. - `id_expr` — 키 값입니다. 딕셔너리 키 타입의 값을 반환하는 식입니다.

**반환 값**

키를 찾으면 `id_expr`에 해당하는 딕셔너리 속성 값을 반환합니다.
키를 찾지 못하면 `NULL`을 반환합니다.

**예시**

**범위 키 딕셔너리를 사용하는 예시**

```sql title=Query
SELECT
    (number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value', number, toDate('2019-05-20')),
FROM system.numbers LIMIT 5 FORMAT TabSeparated;
```

```response title=Response
(0,'2019-05-20')  \N
(1,'2019-05-20')  First
(2,'2019-05-20')  Second
(3,'2019-05-20')  Third
(4,'2019-05-20')  \N
```


## dictGetString \{#dictGetString\}

도입 버전: v1.1

딕셔너리 속성 값을 딕셔너리 구성과 무관하게 `String` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetString(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 표현식(딕셔너리 구성에 따라 결정됨). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
해당 값이 없으면 딕셔너리 구성에서 해당 속성에 대해 지정한 `<null_value>` 요소의 내용을 반환합니다.

:::note
속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 ClickHouse는 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetString('all_types_dict', 'String_value', 1)
```

```response title=Response
┌─dictGetString(⋯_value', 1)─┐
│ test string                │
└────────────────────────────┘
```


## dictGetStringOrDefault \{#dictGetStringOrDefault\}

도입 버전: v1.1

딕셔너리 구성과 관계없이 딕셔너리 속성 값을 `String` 데이터 타입으로 변환하거나, 키를 찾을 수 없으면 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetStringOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리의 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 표현식입니다(딕셔너리 구성에 따라 달라집니다). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값입니다. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않은 경우 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetString('all_types_dict', 'String_value', 1);

-- for key which does not exist, returns the provided default value
SELECT dictGetStringOrDefault('all_types_dict', 'String_value', 999, 'default');
```

```response title=Response
┌─dictGetString(⋯_value', 1)─┐
│ test string                │
└────────────────────────────┘
┌─dictGetStringO⋯ 999, 'default')─┐
│ default                         │
└─────────────────────────────────┘
```


## dictGetUInt16 \{#dictGetUInt16\}

도입 버전: v1.1

딕셔너리 설정과 관계없이 딕셔너리 속성 값을 `UInt16` 데이터 유형으로 변환합니다.

**구문**

```sql
dictGetUInt16(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리 컬럼의 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 식(딕셔너리 설정에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
해당하는 값이 없으면 딕셔너리 설정에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성의 데이터 타입과 일치하지 않으면 예외를 던집니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetUInt16('all_types_dict', 'UInt16_value', 1)
```

```response title=Response
┌─dictGetUInt1⋯_value', 1)─┐
│                     5000 │
└──────────────────────────┘
```


## dictGetUInt16OrDefault \{#dictGetUInt16OrDefault\}

도입 버전: v1.1

딕셔너리 설정과 관계없이 딕셔너리 속성 값을 `UInt16` 데이터 타입으로 변환하거나, 키가 존재하지 않는 경우 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetUInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 식(딕셔너리 구성에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않으면 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성의 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetUInt16('all_types_dict', 'UInt16_value', 1);

-- for key which does not exist, returns the provided default value (0)
SELECT dictGetUInt16OrDefault('all_types_dict', 'UInt16_value', 999, 0);
```

```response title=Response
┌─dictGetUInt1⋯_value', 1)─┐
│                     5000 │
└──────────────────────────┘
┌─dictGetUInt1⋯e', 999, 0)─┐
│                        0 │
└──────────────────────────┘
```


## dictGetUInt32 \{#dictGetUInt32\}

도입된 버전: v1.1

딕셔너리 속성 값을 딕셔너리 설정과 관계없이 `UInt32` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetUInt32(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 식(딕셔너리 구성에 따라 다름). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성의 값을 반환하며,
해당하는 값이 없으면 딕셔너리 구성에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
ClickHouse는 속성 값을 구문 분석할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1)
```

```response title=Response
┌─dictGetUInt3⋯_value', 1)─┐
│                  1000000 │
└──────────────────────────┘
```


## dictGetUInt32OrDefault \{#dictGetUInt32OrDefault\}

도입 버전: v1.1

딕셔너리 설정과 관계없이 딕셔너리 속성 값을 `UInt32` 데이터 타입으로 변환하거나, 키가 존재하지 않는 경우 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetUInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입 값 또는 튜플 값을 반환하는 표현식(딕셔너리 설정에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
해당 값이 없으면 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않는 경우 예외를 던집니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1);

-- for key which does not exist, returns the provided default value (0)
SELECT dictGetUInt32OrDefault('all_types_dict', 'UInt32_value', 999, 0);
```

```response title=Response
┌─dictGetUInt3⋯_value', 1)─┐
│                  1000000 │
└──────────────────────────┘
┌─dictGetUInt3⋯e', 999, 0)─┐
│                        0 │
└──────────────────────────┘
```


## dictGetUInt64 \{#dictGetUInt64\}

도입 버전: v1.1

딕셔너리 속성 값을 딕셔너리 설정과 관계없이 `UInt64` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetUInt64(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 표현식(딕셔너리 구성에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않은 경우 딕셔너리 구성에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않는 경우 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1)
```

```response title=Response
┌─dictGetUInt6⋯_value', 1)─┐
│      9223372036854775807 │
└──────────────────────────┘
```


## dictGetUInt64OrDefault \{#dictGetUInt64OrDefault\}

도입 버전: v1.1

딕셔너리 설정과 관계없이 딕셔너리 속성 값을 `UInt64` 데이터 타입으로 변환하거나, 키를 찾을 수 없는 경우 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetUInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입 값 또는 튜플 값을 반환하는 식(딕셔너리 설정에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않은 경우 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
ClickHouse가 속성 값을 구문 분석할 수 없거나 값이 속성의 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1);

-- for key which does not exist, returns the provideddefault value (0)
SELECT dictGetUInt64OrDefault('all_types_dict', 'UInt64_value', 999, 0);
```

```response title=Response
┌─dictGetUInt6⋯_value', 1)─┐
│      9223372036854775807 │
└──────────────────────────┘
┌─dictGetUInt6⋯e', 999, 0)─┐
│                        0 │
└──────────────────────────┘
```


## dictGetUInt8 \{#dictGetUInt8\}

도입 버전: v1.1

딕셔너리 구성과 무관하게 딕셔너리 속성 값을 `UInt8` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetUInt8(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입 값 또는 튜플 값을 반환하는 식입니다(딕셔너리 설정에 따라 결정됨). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않으면 딕셔너리 설정에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetUInt8('all_types_dict', 'UInt8_value', 1)
```

```response title=Response
┌─dictGetUInt8⋯_value', 1)─┐
│                      100 │
└──────────────────────────┘
```


## dictGetUInt8OrDefault \{#dictGetUInt8OrDefault\}

도입: v1.1

딕셔너리 구성과 관계없이 딕셔너리 속성 값을 `UInt8` 데이터 형식으로 변환하거나, 키를 찾을 수 없는 경우 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetUInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리의 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 표현식(딕셔너리 구성에 따라 다름). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성의 값을 반환하며,
해당 값이 없으면 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetUInt8('all_types_dict', 'UInt8_value', 1);

-- for key which does not exist, returns the provided default value (0)
SELECT dictGetUInt8OrDefault('all_types_dict', 'UInt8_value', 999, 0);
```

```response title=Response
┌─dictGetUInt8⋯_value', 1)─┐
│                      100 │
└──────────────────────────┘
┌─dictGetUInt8⋯e', 999, 0)─┐
│                        0 │
└──────────────────────────┘
```


## dictGetUUID \{#dictGetUUID\}

도입: v1.1

딕셔너리 구성과 관계없이 딕셔너리 속성 값을 `UUID` 데이터 타입으로 변환합니다.

**구문**

```sql
dictGetUUID(dict_name, attr_name, id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입의 값 또는 튜플 값을 반환하는 식(딕셔너리 설정에 따라 다름). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않으면 딕셔너리 설정에서 해당 속성에 대해 지정된 `<null_value>` 요소의 내용을 반환합니다.

:::note
ClickHouse는 속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
SELECT dictGetUUID('all_types_dict', 'UUID_value', 1)
```

```response title=Response
┌─dictGetUUID(⋯_value', 1)─────────────┐
│ 123e4567-e89b-12d3-a456-426614174000 │
└──────────────────────────────────────┘
```


## dictGetUUIDOrDefault \{#dictGetUUIDOrDefault\}

도입 버전: v1.1

딕셔너리 속성 값을 딕셔너리 설정과 무관하게 `UUID` 데이터 타입으로 변환하거나, 키가 존재하지 않으면 제공된 기본값을 반환합니다.

**구문**

```sql
dictGetUUIDOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `attr_name` — 딕셔너리 컬럼 이름. [`String`](/sql-reference/data-types/string) 또는 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 키 값. 딕셔너리 키 타입 값 또는 튜플 값을 반환하는 표현식(딕셔너리 구성에 따라 달라짐). [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 딕셔너리에 `id_expr` 키를 가진 행이 없을 때 반환되는 값. [`Expression`](/sql-reference/data-types/special-data-types/expression) 또는 [`Tuple(T)`](/sql-reference/data-types/tuple)

**반환 값**

`id_expr`에 해당하는 딕셔너리 속성 값을 반환하며,
그렇지 않은 경우 `default_value_expr` 매개변수로 전달된 값을 반환합니다.

:::note
속성 값을 파싱할 수 없거나 값이 속성 데이터 타입과 일치하지 않으면 ClickHouse가 예외를 발생시킵니다.
:::

**예시**

**사용 예시**

```sql title=Query
-- for key which exists
SELECT dictGetUUID('all_types_dict', 'UUID_value', 1);

-- for key which does not exist, returns the provided default value
SELECT dictGetUUIDOrDefault('all_types_dict', 'UUID_value', 999, '00000000-0000-0000-0000-000000000000'::UUID);
```

```response title=Response
┌─dictGetUUID('all_t⋯ 'UUID_value', 1)─┐
│ 550e8400-e29b-41d4-a716-446655440000 │
└──────────────────────────────────────┘
┌─dictGetUUIDOrDefa⋯000000000000'::UUID)─┐
│ 00000000-0000-0000-0000-000000000000   │
└────────────────────────────────────────┘
```


## dictHas \{#dictHas\}

도입된 버전: v1.1

딕셔너리에 키가 존재하는지 확인합니다.

**구문**

```sql
dictHas('dict_name', id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `id_expr` — 키 값. [`const String`](/sql-reference/data-types/string)

**반환값**

키가 존재하면 `1`, 존재하지 않으면 `0`을 반환합니다. [`UInt8`](/sql-reference/data-types/int-uint)

**예시**

**딕셔너리에서 키 존재 여부 확인**

```sql title=Query
-- consider the following hierarchical dictionary:
-- 0 (Root)
-- └── 1 (Level 1 - Node 1)
--     ├── 2 (Level 2 - Node 2)
--     │   ├── 4 (Level 3 - Node 4)
--     │   └── 5 (Level 3 - Node 5)
--     └── 3 (Level 2 - Node 3)
--         └── 6 (Level 3 - Node 6)

SELECT dictHas('hierarchical_dictionary', 2);
SELECT dictHas('hierarchical_dictionary', 7);
```

```response title=Response
┌─dictHas('hie⋯ionary', 2)─┐
│                        1 │
└──────────────────────────┘
┌─dictHas('hie⋯ionary', 7)─┐
│                        0 │
└──────────────────────────┘
```


## dictIsIn \{#dictIsIn\}

도입 버전: v1.1

딕셔너리의 전체 계층 체인에서 키의 상위 항목을 검사합니다.

**문법**

```sql
dictIsIn(dict_name, child_id_expr, ancestor_id_expr)
```

**인수**

* `dict_name` — 딕셔너리 이름. [`String`](/sql-reference/data-types/string)
* `child_id_expr` — 확인할 키. [`String`](/sql-reference/data-types/string)
* `ancestor_id_expr` — `child_id_expr` 키의 추정 상위 항목. [`const String`](/sql-reference/data-types/string)

**반환 값**

`child_id_expr`가 `ancestor_id_expr`의 하위 항목이 아니면 `0`을, `child_id_expr`가 `ancestor_id_expr`의 하위 항목이거나 `child_id_expr`가 `ancestor_id_expr`인 경우 `1`을 반환합니다. [`UInt8`](/sql-reference/data-types/int-uint)

**예시**

**계층 관계 확인**

```sql title=Query
-- valid hierarchy
SELECT dictIsIn('hierarchical_dictionary', 6, 3)

-- invalid hierarchy
SELECT dictIsIn('hierarchical_dictionary', 3, 5)
```

```response title=Response
┌─dictIsIn('hi⋯ary', 6, 3)─┐
│                        1 │
└──────────────────────────┘
┌─dictIsIn('hi⋯ary', 3, 5)─┐
│                        0 │
└──────────────────────────┘
```

{/*AUTOGENERATED_END*/ }
