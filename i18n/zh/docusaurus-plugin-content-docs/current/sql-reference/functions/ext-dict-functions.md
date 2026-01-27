---
description: '字典相关函数文档'
sidebar_label: '字典'
slug: /sql-reference/functions/ext-dict-functions
title: '字典相关函数'
doc_type: 'reference'
---

# 用于处理字典的函数 \{#functions-for-working-with-dictionaries\}

:::note
对于使用 [DDL 查询](../../sql-reference/statements/create/dictionary.md) 创建的字典，`dict_name` 参数必须完整写为 `<database>.<dict_name>`。否则，将使用当前数据库。
:::

有关连接和配置字典的更多信息，请参阅 [Dictionaries](../../sql-reference/dictionaries/index.md)。

## 示例字典 \{#example-dictionary\}

本节中的示例使用以下字典。您可以在 ClickHouse 中创建这些字典，以便运行后文所述函数的示例。

<details>
<summary>用于 dictGet&lt;T&gt; 和 dictGet&lt;T&gt;OrDefault 函数的示例字典</summary>

```sql
-- 创建包含所有所需数据类型的表
CREATE TABLE all_types_test (
    `id` UInt32,
    
    -- String 类型
    `String_value` String,
    
    -- 无符号整数类型
    `UInt8_value` UInt8,
    `UInt16_value` UInt16,
    `UInt32_value` UInt32,
    `UInt64_value` UInt64,
    
    -- 有符号整数类型
    `Int8_value` Int8,
    `Int16_value` Int16,
    `Int32_value` Int32,
    `Int64_value` Int64,
    
    -- 浮点类型
    `Float32_value` Float32,
    `Float64_value` Float64,
    
    -- 日期/时间类型
    `Date_value` Date,
    `DateTime_value` DateTime,
    
    -- 网络类型
    `IPv4_value` IPv4,
    `IPv6_value` IPv6,
    
    -- UUID 类型
    `UUID_value` UUID
) ENGINE = MergeTree() 
ORDER BY id;
```
```sql
-- 插入测试数据
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
-- 创建字典
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
<summary>用于 dictGetAll 的示例字典</summary>

创建一个表来存储 regexp tree 字典的数据：

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

向表中插入数据：

```sql
INSERT INTO regexp_os 
SELECT *
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/' ||
    'user_agent_regex/regexp_os.csv'
);
```

创建 regexp tree 字典：

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
  <summary>范围键字典示例</summary>

  创建输入表：

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

  向输入表中插入数据：

  ```sql
  INSERT INTO range_key_dictionary_source_table VALUES(1, toDate('2019-05-20'), toDate('2019-05-20'), 'First', 'First');
  INSERT INTO range_key_dictionary_source_table VALUES(2, toDate('2019-05-20'), toDate('2019-05-20'), 'Second', NULL);
  INSERT INTO range_key_dictionary_source_table VALUES(3, toDate('2019-05-20'), toDate('2019-05-20'), 'Third', 'Third');
  ```

  创建字典：

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
  <summary>复合键字典示例</summary>

  创建源表：

  ```sql
  CREATE TABLE dict_mult_source
  (
  id UInt32,
  c1 UInt32,
  c2 String
  ) ENGINE = Memory;
  ```

  向源表中插入数据：

  ```sql
  INSERT INTO dict_mult_source VALUES
  (1, 1, '1'),
  (2, 2, '2'),
  (3, 3, '3');
  ```

  创建字典：

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
  <summary>层级字典示例</summary>

  创建源表：

  ```sql
  CREATE TABLE hierarchy_source
  (
    id UInt64,
    parent_id UInt64,
    name String
  ) ENGINE = Memory;
  ```

  向源表中插入数据：

  ```sql
  INSERT INTO hierarchy_source VALUES
  (0, 0, 'Root'),
  (1, 0, 'Level 1 - Node 1'),
  (2, 1, 'Level 2 - Node 2'),
  (3, 1, 'Level 2 - Node 3'),
  (4, 2, 'Level 3 - Node 4'),
  (5, 2, 'Level 3 - Node 5'),
  (6, 3, 'Level 3 - Node 6');

  -- 0（Root）
  -- └── 1（Level 1 - Node 1）
  --     ├── 2（Level 2 - Node 2）
  --     │   ├── 4（Level 3 - Node 4）
  --     │   └── 5（Level 3 - Node 5）
  --     └── 3（Level 2 - Node 3）
  --         └── 6（Level 3 - Node 6）
  ```

  创建字典：

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
  下方标签内的内容会在文档框架构建时，
  被替换为由 system.functions 生成的文档。请勿修改或删除这些标签。
  详见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }


## dictGet \{#dictGet\}

自 v18.16 版本引入

从字典中检索值。

**语法**

```sql
dictGet('dict_name', attr_names, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_names` — 字典中列的名称，或由列名组成的元组。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键值。返回 UInt64/Tuple(T) 的表达式。[`UInt64`](/sql-reference/data-types/int-uint) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

如果找到键，则返回与 id&#95;expr 对应的字典属性的值。
如果未找到键，则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

**示例**

**获取单个属性**

```sql title=Query
SELECT dictGet('ext_dict_test', 'c1', toUInt64(1)) AS val
```

```response title=Response
1
```

**多个属性**

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

引入于：v23.5

将字典属性值转换为 `All` 数据类型，与字典配置无关。

**语法**

```sql
dictGetAll(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性的值，
否则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

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

自 v21.4 引入

返回第一层子节点的索引数组。它是 [dictGetHierarchy](#dictGetHierarchy) 的逆运算。

**语法**

```sql
dictGetChildren(dict_name, key)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `key` — 要检查的键。[`const String`](/sql-reference/data-types/string)

**返回值**

返回该键的第一层子节点。[`Array(UInt64)`](/sql-reference/data-types/array)

**示例**

**获取字典的第一层子节点**

```sql title=Query
SELECT dictGetChildren('hierarchical_dictionary', 2);
```

```response title=Response
┌─dictGetChild⋯ionary', 2)─┐
│ [4,5]                    │
└──────────────────────────┘
```


## dictGetDate \{#dictGetDate\}

自 v1.1 引入

将字典属性值转换为 `Date` 数据类型，而不受字典配置的影响。

**语法**

```sql
dictGetDate(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。一个返回字典键类型的值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析属性值，或该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

```sql title=Query
SELECT dictGetDate('all_types_dict', 'Date_value', 1)
```

```response title=Response
┌─dictGetDate(⋯_value', 1)─┐
│               2020-01-01 │
└──────────────────────────┘
```


## dictGetDateOrDefault \{#dictGetDateOrDefault\}

自 v1.1 引入

将字典属性值转换为 `Date` 数据类型，而不受字典配置影响；如果未找到键，则返回提供的默认值。

**语法**

```sql
dictGetDateOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含键为 `id_expr` 的行时返回的默认值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回作为 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析属性的值，或该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

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

自 v1.1 版本引入。

将字典属性值转换为 `DateTime` 数据类型，而不受字典配置方式的影响。

**语法**

```sql
dictGetDateTime(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。一个返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回在字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性的值，或该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

```sql title=Query
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1)
```

```response title=Response
┌─dictGetDateT⋯_value', 1)─┐
│      2024-01-15 10:30:00 │
└──────────────────────────┘
```


## dictGetDateTimeOrDefault \{#dictGetDateTimeOrDefault\}

引入版本：v1.1

将字典属性值转换为 `DateTime` 数据类型（无论字典如何配置），如果未找到键，则返回提供的默认值。

**语法**

```sql
dictGetDateTimeOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含键为 `id_expr` 的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回作为 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析属性值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

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

引入自：v21.4

返回所有后代，相当于递归调用 [`dictGetChildren`](#dictGetChildren) 函数 `level` 次。

**语法**

```sql
dictGetDescendants(dict_name, key, level)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `key` — 要检查的键。[`const String`](/sql-reference/data-types/string)
* `level` — 要检查的层级。层级深度。如果 `level = 0`，则返回直到最深层级的所有后代。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

返回该键的所有后代。[`Array(UInt64)`](/sql-reference/data-types/array)

**示例**

**获取字典第一层级的子节点**

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

自 v1.1 起引入

无论字典配置如何，都将字典属性值转换为 `Float32` 数据类型。

**语法**

```sql
dictGetFloat32(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典的名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列（属性）的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析该属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

```sql title=Query
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1)
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│               -123.123   │
└──────────────────────────┘
```


## dictGetFloat32OrDefault \{#dictGetFloat32OrDefault\}

引入版本：v1.1

将字典属性值转换为 `Float32` 数据类型（无论字典如何配置），如果未找到该键，则返回提供的默认值。

**语法**

```sql
dictGetFloat32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键值。返回字典键类型的值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含键为 `id_expr` 的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回作为 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析该属性的值，或该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

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

自 v1.1 引入

将字典属性的值转换为 `Float64` 数据类型，而不受字典配置的影响。

**语法**

```sql
dictGetFloat64(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中属性（列）的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。一个返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetFloat64('all_types_dict', 'Float64_value', 1)
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│                 -123.123 │
└──────────────────────────┘
```


## dictGetFloat64OrDefault \{#dictGetFloat64OrDefault\}

自 v1.1 版本引入

将字典属性值转换为 `Float64` 数据类型，而不受字典配置影响；如果未找到键，则返回提供的默认值。

**语法**

```sql
dictGetFloat64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键。返回字典键类型的值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含键为 `id_expr` 的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回作为 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析该属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

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

自 v1.1 引入

创建一个数组，包含层次结构[字典](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries)中某个 key 的所有父节点。

**语法**

```sql
dictGetHierarchy(dict_name, key)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `key` — 键值。[`const String`](/sql-reference/data-types/string)

**返回值**

返回该键对应的所有父节点。[`Array(UInt64)`](/sql-reference/data-types/array)

**示例**

**获取某个键的层级结构**

```sql title=Query
SELECT dictGetHierarchy('hierarchical_dictionary', 5)
```

```response title=Response
┌─dictGetHiera⋯ionary', 5)─┐
│ [5,2,1]                  │
└──────────────────────────┘
```


## dictGetIPv4 \{#dictGetIPv4\}

引入版本：v1.1

将字典属性的值转换为 `IPv4` 数据类型，无论字典如何配置。

**语法**

```sql
dictGetIPv4(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键值。一个返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值；
否则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析属性的值，或该值与属性数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

```sql title=Query
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1)
```

```response title=Response
┌─dictGetIPv4('all_⋯ 'IPv4_value', 1)─┐
│ 192.168.0.1                         │
└─────────────────────────────────────┘
```


## dictGetIPv4OrDefault \{#dictGetIPv4OrDefault\}

引入自：v23.1

将字典属性值转换为 `IPv4` 数据类型，而不受字典配置影响；若未找到该键，则返回指定的默认值。

**语法**

```sql
dictGetIPv4OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含键等于 `id_expr` 的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回作为 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

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

自 v23.1 起引入

将字典属性的值转换为 `IPv6` 数据类型，而不受字典配置的影响。

**语法**

```sql
dictGetIPv6(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键值。返回字典键类型的值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析属性值，或该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

```sql title=Query
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1)
```

```response title=Response
┌─dictGetIPv6('all_⋯ 'IPv6_value', 1)─┐
│ 2001:db8:85a3::8a2e:370:7334        │
└─────────────────────────────────────┘
```


## dictGetIPv6OrDefault \{#dictGetIPv6OrDefault\}

自 v23.1 引入

将字典属性值转换为 `IPv6` 数据类型，而不受字典配置影响；如果未找到键，则返回提供的默认值。

**语法**

```sql
dictGetIPv6OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含键为 `id_expr` 的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性的值，
否则返回作为 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

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

自 v1.1 起引入

将字典属性值转换为 `Int16` 数据类型，不受字典配置影响。

**语法**

```sql
dictGetInt16(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列（属性）的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键值。一个返回字典键类型的值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析属性值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetInt16('all_types_dict', 'Int16_value', 1)
```

```response title=Response
┌─dictGetInt16⋯_value', 1)─┐
│                    -5000 │
└──────────────────────────┘
```


## dictGetInt16OrDefault \{#dictGetInt16OrDefault\}

自 v1.1 起提供

将字典属性值转换为 `Int16` 数据类型，不受字典配置影响；如果未找到指定键，则返回提供的默认值。

**语法**

```sql
dictGetInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含键为 `id_expr` 的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回字典中与 `id_expr` 对应的属性值，
否则返回作为 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

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

自 v1.1 引入

将字典属性值转换为 `Int32` 数据类型，而不受字典配置的影响。

**语法**

```sql
dictGetInt32(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型的值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回在字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

```sql title=Query
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1)
```

```response title=Response
┌─dictGetInt32⋯_value', 1)─┐
│                -1000000  │
└──────────────────────────┘
```


## dictGetInt32OrDefault \{#dictGetInt32OrDefault\}

引入版本：v1.1

将字典属性值转换为 `Int32` 数据类型，而不受字典配置影响；如果未找到该键，则返回提供的默认值。

**语法**

```sql
dictGetInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含键为 `id_expr` 的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回通过参数 `default_value_expr` 传入的值。

:::note
如果 ClickHouse 无法解析属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

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

自 v1.1 起引入

将字典的属性值转换为 `Int64` 数据类型，而不受字典配置方式的影响。

**语法**

```sql
dictGetInt64(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列（属性）的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键值。返回字典键类型的值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析属性值，或该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetInt64('all_types_dict', 'Int64_value', 1)
```

```response title=Response
┌─dictGetInt64⋯_value', 1)───┐
│       -9223372036854775807 │
└────────────────────────────┘
```


## dictGetInt64OrDefault \{#dictGetInt64OrDefault\}

自 v1.1 起引入

将字典属性值转换为 `Int64` 数据类型（无论字典如何配置），如果未找到该键，则返回提供的默认值。

**语法**

```sql
dictGetInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含键为 `id_expr` 的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回传入的 `default_value_expr` 参数的值。

:::note
如果 ClickHouse 无法解析属性值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

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

引入版本：v1.1

将字典属性值转换为 `Int8` 数据类型，无论字典如何配置。

**语法**

```sql
dictGetInt8(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析该属性的值，或该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

```sql title=Query
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1)
```

```response title=Response
┌─dictGetInt8(⋯_value', 1)─┐
│                     -100 │
└──────────────────────────┘
```


## dictGetInt8OrDefault \{#dictGetInt8OrDefault\}

引入于：v1.1

将字典属性值转换为 `Int8` 数据类型，不受字典配置影响；如果找不到键，则返回提供的默认值。

**语法**

```sql
dictGetInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含键为 `id_expr` 的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性的值，
否则返回作为 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

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

引入版本：v25.12

返回字典中属性值等于指定值的键（或键集合）。这是在单个属性上的函数 `dictGet` 的反向操作。

使用设置项 `max_reverse_dictionary_lookup_cache_size_bytes` 来限制每个查询中 `dictGetKeys` 使用的反向查找缓存大小。
该缓存为每个属性值存储序列化后的键元组，以避免在同一查询中重复扫描字典。
该缓存不会在不同查询之间持久化。当达到上限时，将按最近最少使用（LRU）策略淘汰条目。
在处理大型字典且输入基数较低、工作集可以放入缓存时效果最佳。将其设置为 `0` 可禁用缓存。

**语法**

```sql
dictGetKeys('dict_name', 'attr_name', value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 要匹配的属性名。[`String`](/sql-reference/data-types/string)
* `value_expr` — 用于与属性值进行匹配的值。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

对于单键字典：返回属性值等于 `value_expr` 的键数组。对于多键字典：返回属性值等于 `value_expr` 的键元组数组。如果字典中不存在属性值为 `value_expr` 的记录，则返回空数组。如果 ClickHouse 无法解析属性值，或该值无法转换为该属性的数据类型，则会抛出异常。

**示例**

**示例用法**

```sql title=Query
SELECT dictGetKeys('task_id_to_priority_dictionary', 'priority_level', 'high') AS ids;
```

```response title=Response
┌─ids───┐
│ [4,2] │
└───────┘
```


## dictGetOrDefault \{#dictGetOrDefault\}

自 v18.16 起引入

用于从字典中获取值；如果未找到指定键，则返回默认值。

**语法**

```sql
dictGetOrDefault('dict_name', attr_names, id_expr, default_value)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_names` — 字典中列的名称，或列名构成的元组。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键。返回 UInt64/Tuple(T) 的表达式。[`UInt64`](/sql-reference/data-types/int-uint) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value` — 当未找到键时要返回的默认值。其类型必须与该属性的数据类型匹配。

**返回值**

如果找到了键，则返回与 `id_expr` 对应的字典属性值。
如果未找到键，则返回提供的 `default_value`。

**示例**

**获取带默认值的属性值**

```sql title=Query
SELECT dictGetOrDefault('ext_dict_mult', 'c1', toUInt64(999), 0) AS val
```

```response title=Response
0
```


## dictGetOrNull \{#dictGetOrNull\}

引入版本：v21.4

从字典中获取值，如果未找到该键则返回 NULL。

**语法**

```sql
dictGetOrNull('dict_name', 'attr_name', id_expr)
```

**参数**

* `dict_name` — 字典名称。字符串字面量。 - `attr_name` — 要获取的列名。字符串字面量。 - `id_expr` — 键值。返回字典键类型值的表达式。

**返回值**

如果找到键，则返回与 `id_expr` 对应的字典属性的值。
如果未找到键，则返回 `NULL`。

**示例**

**使用范围键字典的示例**

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

自 v1.1 起提供

将字典属性值转换为 `String` 数据类型，而不受字典配置的影响。

**语法**

```sql
dictGetString(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典的名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型的值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析该属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

```sql title=Query
SELECT dictGetString('all_types_dict', 'String_value', 1)
```

```response title=Response
┌─dictGetString(⋯_value', 1)─┐
│ test string                │
└────────────────────────────┘
```


## dictGetStringOrDefault \{#dictGetStringOrDefault\}

自 v1.1 起引入

将字典属性值转换为 `String` 数据类型，而不受字典配置影响；如果未找到指定键，则返回提供的默认值。

**语法**

```sql
dictGetStringOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含键为 `id_expr` 的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回通过 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析属性值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

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

引入于：v1.1

将字典属性值转换为 `UInt16` 数据类型，不受字典配置影响。

**语法**

```sql
dictGetUInt16(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典的名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型的值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetUInt16('all_types_dict', 'UInt16_value', 1)
```

```response title=Response
┌─dictGetUInt1⋯_value', 1)─┐
│                     5000 │
└──────────────────────────┘
```


## dictGetUInt16OrDefault \{#dictGetUInt16OrDefault\}

自 v1.1 起提供

将字典属性值转换为 `UInt16` 数据类型，而不受字典配置的影响；如果未找到该键，则返回指定的默认值。

**语法**

```sql
dictGetUInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列（属性）的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键值表达式。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不存在以 `id_expr` 为键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回作为 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

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

引入版本：v1.1

将字典的属性值转换为 `UInt32` 数据类型，而不受字典配置的影响。

**语法**

```sql
dictGetUInt32(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。一个返回字典键类型值或元组值（取决于字典配置）的表达式。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值；
否则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果无法解析属性的值，或该值与属性的数据类型不匹配，ClickHouse 会抛出异常。
:::

**示例**

**用法示例**

```sql title=Query
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1)
```

```response title=Response
┌─dictGetUInt3⋯_value', 1)─┐
│                  1000000 │
└──────────────────────────┘
```


## dictGetUInt32OrDefault \{#dictGetUInt32OrDefault\}

引入版本：v1.1

将字典属性值转换为 `UInt32` 数据类型，而不受字典配置影响；如果未找到该 key，则返回提供的默认值。

**语法**

```sql
dictGetUInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型的值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性的值，
否则返回作为 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

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

自 v1.1 版本引入

将字典属性值转换为 `UInt64` 数据类型，而不受字典配置的影响。

**语法**

```sql
dictGetUInt64(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型的值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值；
否则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析该属性的值，或该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1)
```

```response title=Response
┌─dictGetUInt6⋯_value', 1)─┐
│      9223372036854775807 │
└──────────────────────────┘
```


## dictGetUInt64OrDefault \{#dictGetUInt64OrDefault\}

自 v1.1 引入

将字典属性值转换为 `UInt64` 数据类型，而不受字典配置影响；如果未找到该键，则返回提供的默认值。

**语法**

```sql
dictGetUInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含键为 `id_expr` 的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回作为 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析属性值，或该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

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

自 v1.1 版本引入

将字典属性的值转换为 `UInt8` 数据类型，与字典配置无关。

**语法**

```sql
dictGetUInt8(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典的名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列（属性）的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值；否则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetUInt8('all_types_dict', 'UInt8_value', 1)
```

```response title=Response
┌─dictGetUInt8⋯_value', 1)─┐
│                      100 │
└──────────────────────────┘
```


## dictGetUInt8OrDefault \{#dictGetUInt8OrDefault\}

自 v1.1 版本引入

将字典属性值转换为 `UInt8` 数据类型，而不受字典配置影响；如果未找到键，则返回提供的默认值。

**语法**

```sql
dictGetUInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键值。返回字典键类型的值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回通过 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析该属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

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

引入于：v1.1

将字典属性值转换为 `UUID` 数据类型，无论字典如何配置。

**语法**

```sql
dictGetUUID(dict_name, attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型的值或元组类型值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，
否则返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。

:::note
如果 ClickHouse 无法解析属性值，或该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetUUID('all_types_dict', 'UUID_value', 1)
```

```response title=Response
┌─dictGetUUID(⋯_value', 1)─────────────┐
│ 123e4567-e89b-12d3-a456-426614174000 │
└──────────────────────────────────────┘
```


## dictGetUUIDOrDefault \{#dictGetUUIDOrDefault\}

自 v1.1 起引入

将字典属性值转换为 `UUID` 数据类型，且与字典的具体配置无关；如果未找到该键，则返回提供的默认值。

**语法**

```sql
dictGetUUIDOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典的名称。[`String`](/sql-reference/data-types/string)
* `attr_name` — 字典中列的名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — 键的值。返回字典键类型的值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — 当字典中不包含键为 `id_expr` 的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性的值，
否则返回作为 `default_value_expr` 参数传入的值。

:::note
如果 ClickHouse 无法解析该属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。
:::

**示例**

**用法示例**

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

引入版本：v1.1

检查给定键是否存在于字典中。

**语法**

```sql
dictHas('dict_name', id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `id_expr` — 键的值。[`const String`](/sql-reference/data-types/string)

**返回值**

如果键存在则返回 `1`，否则返回 `0`。[`UInt8`](/sql-reference/data-types/int-uint)

**示例**

**检查字典中某个键是否存在**

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

引入自：v1.1

在字典的整个层级链中检查某个键的祖先关系。

**语法**

```sql
dictIsIn(dict_name, child_id_expr, ancestor_id_expr)
```

**参数**

* `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
* `child_id_expr` — 要检查的键。[`String`](/sql-reference/data-types/string)
* `ancestor_id_expr` — `child_id_expr` 键的假定祖先（节点）。[`const String`](/sql-reference/data-types/string)

**返回值**

如果 `child_id_expr` 不是 `ancestor_id_expr` 的子节点，则返回 `0`；如果 `child_id_expr` 是 `ancestor_id_expr` 的子节点，或与 `ancestor_id_expr` 相同，则返回 `1`。[`UInt8`](/sql-reference/data-types/int-uint)

**示例**

**检查层级关系**

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
