---
description: '辞書操作用の関数に関するドキュメント'
sidebar_label: '辞書'
slug: /sql-reference/functions/ext-dict-functions
title: '辞書操作用の関数'
doc_type: 'reference'
---

# 辞書を扱う関数 {#functions-for-working-with-dictionaries}

:::note
[DDL クエリ](../../sql-reference/statements/create/dictionary.md)で作成された辞書の場合、`dict_name` パラメーターは `<database>.<dict_name>` のように完全修飾名で指定する必要があります。省略した場合は、現在のデータベースが使用されます。
:::

辞書の接続と設定の方法については、[辞書](../../sql-reference/dictionaries/index.md)を参照してください。

## 例となる辞書 {#example-dictionary}

このセクションの例では、次の辞書を使用します。以下で説明する関数の例を実行するには、これらを ClickHouse で作成してください。

<details>
<summary>dictGet&lt;T&gt; および dictGet&lt;T&gt;OrDefault 関数用の例となる辞書</summary>

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
<summary>dictGetAll 用の例となる辞書</summary>

regexp ツリー辞書用のデータを保存するテーブルを作成します：

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

テーブルにデータを挿入します：

```sql
INSERT INTO regexp_os 
SELECT *
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/' ||
    'user_agent_regex/regexp_os.csv'
);
```

regexp ツリー辞書を作成します：

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
  <summary>範囲キー Dictionary の例</summary>

  入力テーブルを作成します：

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

  データを入力テーブルに挿入します：

  ```sql
INSERT INTO range_key_dictionary_source_table VALUES(1, toDate('2019-05-20'), toDate('2019-05-20'), 'First', 'First');
INSERT INTO range_key_dictionary_source_table VALUES(2, toDate('2019-05-20'), toDate('2019-05-20'), 'Second', NULL);
INSERT INTO range_key_dictionary_source_table VALUES(3, toDate('2019-05-20'), toDate('2019-05-20'), 'Third', 'Third');
```

  Dictionary を作成します：

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
  <summary>複合キー Dictionary の例</summary>

  ソーステーブルを作成します：

  ```sql
CREATE TABLE dict_mult_source
(
id UInt32,
c1 UInt32,
c2 String
) ENGINE = Memory;
```

  データをソーステーブルに挿入します：

  ```sql
INSERT INTO dict_mult_source VALUES
(1, 1, '1'),
(2, 2, '2'),
(3, 3, '3');
```

  Dictionary を作成します：

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
  <summary>階層型 Dictionary の例</summary>

  ソーステーブルを作成します：

  ```sql
CREATE TABLE hierarchy_source
(
  id UInt64,
  parent_id UInt64,
  name String
) ENGINE = Memory;
```

  データをソーステーブルに挿入します：

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

  Dictionary を作成します：

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
  以下のタグ内の内容は、ドキュメントフレームワークのビルド時に
  system.functions から生成されたドキュメントで置き換えられます。タグを変更したり削除したりしないでください。
  詳細は次を参照してください: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

## dictGet {#dictGet}

導入バージョン: v18.16

Dictionary から値を取得します。

**構文**

```sql
dictGet('dict_name', attr_names, id_expr)
```

**引数**

* `dict_name` — Dictionary の名前。[`String`](/sql-reference/data-types/string)
* `attr_names` — Dictionary のカラム名、またはカラム名のタプル。[`String`](/sql-reference/data-types/string) または [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — キーの値。`UInt64` または `Tuple(T)` を返す式。[`UInt64`](/sql-reference/data-types/int-uint) または [`Tuple(T)`](/sql-reference/data-types/tuple)

**戻り値**

キーが見つかった場合、`id_expr` に対応する Dictionary の属性値を返します。
キーが見つからない場合、その属性に対して Dictionary の設定で指定された `<null_value>` 要素の内容を返します。

**例**

**単一の属性を取得する**

```sql title=Query
SELECT dictGet('ext_dict_test', 'c1', toUInt64(1)) AS val
```

```response title=Response
1
```

**Multiple attributes**

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



## dictGetAll {#dictGetAll}

Introduced in: v23.5

Converts a dictionary attribute value to `All` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetAll(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT
    'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36' AS user_agent,

    -- 該当するすべてのパターンにマッチします
    dictGetAll('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS all_matches,

    -- 最初にマッチしたもののみを返します
    dictGet('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS first_match;
```

```response title=Response
┌─user_agent─────────────────────────────────────────────────────┬─all_matches─────────────────────────────┬─first_match─┐
│ Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36 │ ['Android','Android','Android','Linux'] │ Android     │
└────────────────────────────────────────────────────────────────┴─────────────────────────────────────────┴─────────────┘
```



## dictGetChildren {#dictGetChildren}

Introduced in: v21.4


Returns first-level children as an array of indexes. It is the inverse transformation for [dictGetHierarchy](#dictGetHierarchy).


**Syntax**

```sql
dictGetChildren(dict_name, key)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `key` — Key to be checked. [`const String`](/sql-reference/data-types/string)


**Returned value**

Returns the first-level descendants for the key. [`Array(UInt64)`](/sql-reference/data-types/array)

**Examples**

**Get the first-level children of a dictionary**

```sql title=Query
SELECT dictGetChildren('hierarchical_dictionary', 2);
```

```response title=Response
┌─dictGetChild⋯ionary', 2)─┐
│ [4,5]                    │
└──────────────────────────┘
```



## dictGetDate {#dictGetDate}

Introduced in: v1.1

Converts a dictionary attribute value to `Date` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetDate(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetDate('all_types_dict', 'Date_value', 1)
```

```response title=Response
┌─dictGetDate(⋯_value', 1)─┐
│               2020-01-01 │
└──────────────────────────┘
```



## dictGetDateOrDefault {#dictGetDateOrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `Date` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetDateOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetDate('all_types_dict', 'Date_value', 1);

-- 存在しないキーの場合、指定されたデフォルト値を返す
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



## dictGetDateTime {#dictGetDateTime}

Introduced in: v1.1

Converts a dictionary attribute value to `DateTime` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetDateTime(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1)
```

```response title=Response
┌─dictGetDateT⋯_value', 1)─┐
│      2024-01-15 10:30:00 │
└──────────────────────────┘
```



## dictGetDateTimeOrDefault {#dictGetDateTimeOrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `DateTime` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetDateTimeOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1);

-- 存在しないキーの場合、指定されたデフォルト値を返す
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



## dictGetDescendants {#dictGetDescendants}

Introduced in: v21.4


Returns all descendants as if the [`dictGetChildren`](#dictGetChildren) function were applied `level` times recursively.


**Syntax**

```sql
dictGetDescendants(dict_name, key, level)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `key` — Key to be checked. [`const String`](/sql-reference/data-types/string)
- `level` — Key to be checked. Hierarchy level. If `level = 0` returns all descendants to the end. [`UInt8`](/sql-reference/data-types/int-uint)


**Returned value**

Returns the descendants for the key. [`Array(UInt64)`](/sql-reference/data-types/array)

**Examples**

**Get the first-level children of a dictionary**

```sql title=Query
-- 以下の階層型Dictionaryを考えます:
-- 0 (ルート)
-- └── 1 (レベル1 - ノード1)
--     ├── 2 (レベル2 - ノード2)
--     │   ├── 4 (レベル3 - ノード4)
--     │   └── 5 (レベル3 - ノード5)
--     └── 3 (レベル2 - ノード3)
--         └── 6 (レベル3 - ノード6)

SELECT dictGetDescendants('hierarchical_dictionary', 0, 2)
```

```response title=Response
┌─dictGetDesce⋯ary', 0, 2)─┐
│ [3,2]                    │
└──────────────────────────┘
```



## dictGetFloat32 {#dictGetFloat32}

Introduced in: v1.1

Converts a dictionary attribute value to `Float32` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetFloat32(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1)
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│               -123.123   │
└──────────────────────────┘
```



## dictGetFloat32OrDefault {#dictGetFloat32OrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `Float32` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetFloat32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1);

-- 存在しないキーの場合、指定されたデフォルト値（-1.0）を返す
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



## dictGetFloat64 {#dictGetFloat64}

Introduced in: v1.1

Converts a dictionary attribute value to `Float64` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetFloat64(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetFloat64('all_types_dict', 'Float64_value', 1)
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│                 -123.123 │
└──────────────────────────┘
```



## dictGetFloat64OrDefault {#dictGetFloat64OrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `Float64` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetFloat64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- キーが存在する場合
SELECT dictGetFloat64('all_types_dict', 'Float64_value', 1);

-- キーが存在しない場合、指定されたデフォルト値（nan）を返す
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



## dictGetHierarchy {#dictGetHierarchy}

Introduced in: v1.1


Creates an array, containing all the parents of a key in the [hierarchical dictionary](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries).


**Syntax**

```sql
dictGetHierarchy(dict_name, key)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `key` — Key value. [`const String`](/sql-reference/data-types/string)


**Returned value**

Returns parents for the key. [`Array(UInt64)`](/sql-reference/data-types/array)

**Examples**

**Get hierarchy for a key**

```sql title=Query
SELECT dictGetHierarchy('hierarchical_dictionary', 5)
```

```response title=Response
┌─dictGetHiera⋯ionary', 5)─┐
│ [5,2,1]                  │
└──────────────────────────┘
```



## dictGetIPv4 {#dictGetIPv4}

Introduced in: v1.1

Converts a dictionary attribute value to `IPv4` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetIPv4(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1)
```

```response title=Response
┌─dictGetIPv4('all_⋯ 'IPv4_value', 1)─┐
│ 192.168.0.1                         │
└─────────────────────────────────────┘
```



## dictGetIPv4OrDefault {#dictGetIPv4OrDefault}

Introduced in: v23.1

Converts a dictionary attribute value to `IPv4` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetIPv4OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1);

-- 存在しないキーの場合、指定されたデフォルト値を返す
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



## dictGetIPv6 {#dictGetIPv6}

Introduced in: v23.1

Converts a dictionary attribute value to `IPv6` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetIPv6(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1)
```

```response title=Response
┌─dictGetIPv6('all_⋯ 'IPv6_value', 1)─┐
│ 2001:db8:85a3::8a2e:370:7334        │
└─────────────────────────────────────┘
```



## dictGetIPv6OrDefault {#dictGetIPv6OrDefault}

Introduced in: v23.1

Converts a dictionary attribute value to `IPv6` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetIPv6OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1);

-- 存在しないキーの場合、指定されたデフォルト値を返す
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



## dictGetInt16 {#dictGetInt16}

Introduced in: v1.1

Converts a dictionary attribute value to `Int16` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetInt16(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetInt16('all_types_dict', 'Int16_value', 1)
```

```response title=Response
┌─dictGetInt16⋯_value', 1)─┐
│                    -5000 │
└──────────────────────────┘
```



## dictGetInt16OrDefault {#dictGetInt16OrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `Int16` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- キーが存在する場合
SELECT dictGetInt16('all_types_dict', 'Int16_value', 1);

-- キーが存在しない場合、指定したデフォルト値（-1）を返す
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



## dictGetInt32 {#dictGetInt32}

Introduced in: v1.1

Converts a dictionary attribute value to `Int32` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetInt32(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1)
```

```response title=Response
┌─dictGetInt32⋯_value', 1)─┐
│                -1000000  │
└──────────────────────────┘
```



## dictGetInt32OrDefault {#dictGetInt32OrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `Int32` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- キーが存在する場合
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1);

-- キーが存在しない場合、指定したデフォルト値（-1）を返す
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



## dictGetInt64 {#dictGetInt64}

Introduced in: v1.1

Converts a dictionary attribute value to `Int64` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetInt64(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetInt64('all_types_dict', 'Int64_value', 1)
```

```response title=Response
┌─dictGetInt64⋯_value', 1)───┐
│       -9223372036854775807 │
└────────────────────────────┘
```



## dictGetInt64OrDefault {#dictGetInt64OrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `Int64` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- キーが存在する場合
SELECT dictGetInt64('all_types_dict', 'Int64_value', 1);

-- キーが存在しない場合、指定したデフォルト値（-1）を返す
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



## dictGetInt8 {#dictGetInt8}

Introduced in: v1.1

Converts a dictionary attribute value to `Int8` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetInt8(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1)
```

```response title=Response
┌─dictGetInt8(⋯_value', 1)─┐
│                     -100 │
└──────────────────────────┘
```



## dictGetInt8OrDefault {#dictGetInt8OrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `Int8` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- キーが存在する場合
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1);

-- キーが存在しない場合、指定したデフォルト値（-1）を返す
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



## dictGetKeys {#dictGetKeys}

Introduced in: v25.12


Returns the dictionary key(s) whose attribute equals the specified value. This is the inverse of the function `dictGet` on a single attribute.

Use setting `max_reverse_dictionary_lookup_cache_size_bytes` to cap the size of the per-query reverse-lookup cache used by `dictGetKeys`.
The cache stores serialized key tuples for each attribute value to avoid re-scanning the dictionary within the same query.
The cache is not persistent across queries. When the limit is reached, entries are evicted with LRU.
This is most effective with large dictionaries when the input has low cardinality and the working set fits in the cache. Set to `0` to disable caching.
    

**Syntax**

```sql
dictGetKeys('dict_name', 'attr_name', value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Attribute to match. [`String`](/sql-reference/data-types/string)
- `value_expr` — Value to match against the attribute. [`Expression`](/sql-reference/data-types/special-data-types/expression)


**Returned value**

For single key dictionaries: an array of keys whose attribute equals `value_expr`. For multi key dictionaries: an array of tuples of keys whose attribute equals `value_expr`. If there is no attribute corresponding to `value_expr` in the dictionary, then an empty array is returned. ClickHouse throws an exception if it cannot parse the value of the attribute or the value cannot be converted to the attribute data type.

**Examples**

**Sample usage**

```sql title=Query
SELECT dictGetKeys('task_id_to_priority_dictionary', 'priority_level', 'high') AS ids;
```

```response title=Response
┌─-ids──┐
│ [4,2] │
└───────┘
```



## dictGetOrDefault {#dictGetOrDefault}

Introduced in: v18.16

Retrieves values from a dictionary, with a default value if the key is not found.

**Syntax**

```sql
dictGetOrDefault('dict_name', attr_names, id_expr, default_value)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_names` — Name of the column of the dictionary, or tuple of column names. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning UInt64/Tuple(T). [`UInt64`](/sql-reference/data-types/int-uint) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value` — Default value to return if the key is not found. Type must match the attribute's data type. 

**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr` if the key is found.
If the key is not found, returns the `default_value` provided.

**Examples**

**Get value with default**

```sql title=Query
SELECT dictGetOrDefault('ext_dict_mult', 'c1', toUInt64(999), 0) AS val
```

```response title=Response
0
```



## dictGetOrNull {#dictGetOrNull}

Introduced in: v21.4

Retrieves values from a dictionary, returning NULL if the key is not found.

**Syntax**

```sql
dictGetOrNull('dict_name', 'attr_name', id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. String literal. - `attr_name` — Name of the column to retrieve. String literal. - `id_expr` — Key value. Expression returning dictionary key-type value. 

**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr` if the key is found.
If the key is not found, returns `NULL`.

**Examples**

**Example using the range key dictionary**

```sql title=Query
SELECT
    (number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value', number, toDate('2019-05-20')),
FROM system.numbers LIMIT 5 FORMAT TabSeparated;
```

```response title=Response
(0,'2019-05-20')  \N
(1,'2019-05-20')  最初
(2,'2019-05-20')  2番目
(3,'2019-05-20')  3番目
(4,'2019-05-20')  \N
```



## dictGetString {#dictGetString}

Introduced in: v1.1

Converts a dictionary attribute value to `String` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetString(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetString('all_types_dict', 'String_value', 1)
```

```response title=Response
┌─dictGetString(⋯_value', 1)─┐
│ test string                │
└────────────────────────────┘
```



## dictGetStringOrDefault {#dictGetStringOrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `String` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetStringOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- キーが存在する場合
SELECT dictGetString('all_types_dict', 'String_value', 1);

-- キーが存在しない場合、指定したデフォルト値を返す
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



## dictGetUInt16 {#dictGetUInt16}

Introduced in: v1.1

Converts a dictionary attribute value to `UInt16` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetUInt16(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetUInt16('all_types_dict', 'UInt16_value', 1)
```

```response title=Response
┌─dictGetUInt1⋯_value', 1)─┐
│                     5000 │
└──────────────────────────┘
```



## dictGetUInt16OrDefault {#dictGetUInt16OrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `UInt16` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetUInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetUInt16('all_types_dict', 'UInt16_value', 1);

-- 存在しないキーの場合、指定したデフォルト値(0)を返す
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



## dictGetUInt32 {#dictGetUInt32}

Introduced in: v1.1

Converts a dictionary attribute value to `UInt32` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetUInt32(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1)
```

```response title=Response
┌─dictGetUInt3⋯_value', 1)─┐
│                  1000000 │
└──────────────────────────┘
```



## dictGetUInt32OrDefault {#dictGetUInt32OrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `UInt32` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetUInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1);

-- 存在しないキーの場合、指定したデフォルト値(0)を返す
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



## dictGetUInt64 {#dictGetUInt64}

Introduced in: v1.1

Converts a dictionary attribute value to `UInt64` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetUInt64(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1)
```

```response title=Response
┌─dictGetUInt6⋯_value', 1)─┐
│      9223372036854775807 │
└──────────────────────────┘
```



## dictGetUInt64OrDefault {#dictGetUInt64OrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `UInt64` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetUInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- キーが存在する場合
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1);

-- キーが存在しない場合、指定されたデフォルト値 (0) を返す
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



## dictGetUInt8 {#dictGetUInt8}

Introduced in: v1.1

Converts a dictionary attribute value to `UInt8` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetUInt8(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetUInt8('all_types_dict', 'UInt8_value', 1)
```

```response title=Response
┌─dictGetUInt8⋯_value', 1)─┐
│                      100 │
└──────────────────────────┘
```



## dictGetUInt8OrDefault {#dictGetUInt8OrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `UInt8` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetUInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- 存在するキーの場合
SELECT dictGetUInt8('all_types_dict', 'UInt8_value', 1);

-- 存在しないキーの場合は、指定したデフォルト値(0)を返す
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



## dictGetUUID {#dictGetUUID}

Introduced in: v1.1

Converts a dictionary attribute value to `UUID` data type regardless of the dictionary configuration.

**Syntax**

```sql
dictGetUUID(dict_name, attr_name, id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. An expression returning a dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the content of the `<null_value>` element specified for the attribute in the dictionary configuration.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
SELECT dictGetUUID('all_types_dict', 'UUID_value', 1)
```

```response title=Response
┌─dictGetUUID(⋯_value', 1)─────────────┐
│ 123e4567-e89b-12d3-a456-426614174000 │
└──────────────────────────────────────┘
```



## dictGetUUIDOrDefault {#dictGetUUIDOrDefault}

Introduced in: v1.1

Converts a dictionary attribute value to `UUID` data type regardless of the dictionary configuration, or returns the provided default value if the key is not found.

**Syntax**

```sql
dictGetUUIDOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `attr_name` — Name of the column of the dictionary. [`String`](/sql-reference/data-types/string) or [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — Key value. Expression returning dictionary key-type value or tuple value (dictionary configuration dependent). [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — Value(s) returned if the dictionary does not contain a row with the `id_expr` key. [`Expression`](/sql-reference/data-types/special-data-types/expression) or [`Tuple(T)`](/sql-reference/data-types/tuple)


**Returned value**

Returns the value of the dictionary attribute that corresponds to `id_expr`,
otherwise returns the value passed as the `default_value_expr` parameter.

:::note
ClickHouse throws an exception if it cannot parse the value of the attribute or the value does not match the attribute data type.
:::

**Examples**

**Usage example**

```sql title=Query
-- キーが存在する場合
SELECT dictGetUUID('all_types_dict', 'UUID_value', 1);

-- キーが存在しない場合、指定したデフォルト値を返す
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



## dictHas {#dictHas}

Introduced in: v1.1

Checks whether a key is present in a dictionary.

**Syntax**

```sql
dictHas('dict_name', id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `id_expr` — Key value [`const String`](/sql-reference/data-types/string)


**Returned value**

Returns `1` if the key exists, otherwise `0`. [`UInt8`](/sql-reference/data-types/int-uint)

**Examples**

**Check for the existence of a key in a dictionary**

```sql title=Query
-- 以下の階層型Dictionaryを考えます:
-- 0 (ルート)
-- └── 1 (レベル1 - ノード1)
--     ├── 2 (レベル2 - ノード2)
--     │   ├── 4 (レベル3 - ノード4)
--     │   └── 5 (レベル3 - ノード5)
--     └── 3 (レベル2 - ノード3)
--         └── 6 (レベル3 - ノード6)

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



## dictIsIn {#dictIsIn}

Introduced in: v1.1


Checks the ancestor of a key through the whole hierarchical chain in the dictionary.


**Syntax**

```sql
dictIsIn(dict_name, child_id_expr, ancestor_id_expr)
```

**Arguments**

- `dict_name` — Name of the dictionary. [`String`](/sql-reference/data-types/string)
- `child_id_expr` — Key to be checked. [`String`](/sql-reference/data-types/string)
- `ancestor_id_expr` — Alleged ancestor of the `child_id_expr` key. [`const String`](/sql-reference/data-types/string)


**Returned value**

Returns `0` if `child_id_expr` is not a child of `ancestor_id_expr`, `1` if `child_id_expr` is a child of `ancestor_id_expr` or if `child_id_expr` is an `ancestor_id_expr`. [`UInt8`](/sql-reference/data-types/int-uint)

**Examples**

**Check hierarchical relationship**

```sql title=Query
-- 有効な階層
SELECT dictIsIn('hierarchical_dictionary', 6, 3)

-- 無効な階層
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
