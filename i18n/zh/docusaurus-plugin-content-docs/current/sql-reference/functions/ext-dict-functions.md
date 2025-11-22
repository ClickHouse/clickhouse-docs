---
description: '用于操作字典的函数文档'
sidebar_label: '字典'
slug: /sql-reference/functions/ext-dict-functions
title: '用于操作字典的函数'
doc_type: 'reference'
---



# 用于操作字典的函数

:::note
对于使用 [DDL 查询](../../sql-reference/statements/create/dictionary.md) 创建的字典，`dict_name` 参数必须完整写成 `<database>.<dict_name>`。否则，将使用当前数据库。
:::

有关如何连接和配置字典的信息，请参阅[字典](../../sql-reference/dictionaries/index.md)。



## dictGet、dictGetOrDefault、dictGetOrNull {#dictget-dictgetordefault-dictgetornull}

从字典中检索值。

```sql
dictGet('dict_name', attr_names, id_expr)
dictGetOrDefault('dict_name', attr_names, id_expr, default_value_expr)
dictGetOrNull('dict_name', attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
- `attr_names` — 字典列的名称，[字符串字面量](/sql-reference/syntax#string)，或列名元组，[Tuple](/sql-reference/data-types/tuple)([字符串字面量](/sql-reference/syntax#string))。
- `id_expr` — 键值。返回字典键类型值或 [Tuple](../data-types/tuple.md) 类型值的[表达式](/sql-reference/syntax#expressions)，具体取决于字典配置。
- `default_value_expr` — 当字典中不包含具有 `id_expr` 键的行时返回的值。[表达式](/sql-reference/syntax#expressions)或 [Tuple](../data-types/tuple.md)([表达式](/sql-reference/syntax#expressions))，返回为 `attr_names` 属性配置的数据类型的值（或多个值）。

**返回值**

- 如果 ClickHouse 成功按照[属性的数据类型](/sql-reference/dictionaries#dictionary-key-and-fields)解析属性，函数将返回与 `id_expr` 对应的字典属性值。

- 如果字典中不存在与 `id_expr` 对应的键，则：

        - `dictGet` 返回字典配置中为该属性指定的 `<null_value>` 元素的内容。
        - `dictGetOrDefault` 返回作为 `default_value_expr` 参数传递的值。
        - `dictGetOrNull` 在字典中未找到键时返回 `NULL`。

如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配，则会抛出异常。

**简单键字典示例**

创建一个包含以下内容的文本文件 `ext-dict-test.csv`：

```text
1,1
2,2
```

第一列是 `id`，第二列是 `c1`。

配置字典：

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

执行查询：

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

**复合键字典示例**

创建一个包含以下内容的文本文件 `ext-dict-mult.csv`：

```text
1,1,'1'
2,2,'2'
3,3,'3'
```

第一列是 `id`，第二列是 `c1`，第三列是 `c2`。

配置字典：


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

执行查询：

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

**范围键字典示例**

输入表：

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

执行该查询：

```sql
SELECT
    (number, toDate('2019-05-20')),
    dictHas('range_key_dictionary', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value_nullable', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', ('value', 'value_nullable'), number, toDate('2019-05-20'))
FROM system.numbers LIMIT 5 FORMAT TabSeparated;
```

结果：

```text
(0,'2019-05-20')        0       \N      \N      (NULL,NULL)
(1,'2019-05-20')        1       First   First   ('First','First')
(2,'2019-05-20')        1       Second  \N      ('Second',NULL)
(3,'2019-05-20')        1       Third   Third   ('Third','Third')
(4,'2019-05-20')        0       \N      \N      (NULL,NULL)
```

**另请参阅**

* [Dictionaries](../../sql-reference/dictionaries/index.md)


## dictHas {#dicthas}

检查字典中是否存在指定的键。

```sql
dictHas('dict_name', id_expr)
```

**参数**

- `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
- `id_expr` — 键值。[表达式](/sql-reference/syntax#expressions),根据字典配置返回字典键类型值或 [Tuple](../data-types/tuple.md) 类型值。

**返回值**

- 0,表示键不存在。[UInt8](../data-types/int-uint.md)。
- 1,表示键存在。[UInt8](../data-types/int-uint.md)。


## dictGetHierarchy {#dictgethierarchy}

创建一个数组,包含[层次字典](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries)中指定键的所有父级。

**语法**

```sql
dictGetHierarchy('dict_name', key)
```

**参数**

- `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
- `key` — 键值。返回 [UInt64](../data-types/int-uint.md) 类型值的[表达式](/sql-reference/syntax#expressions)。

**返回值**

- 该键的父级。[Array(UInt64)](../data-types/array.md)。


## dictIsIn {#dictisin}

通过字典中的完整层级链检查键的祖先关系。

```sql
dictIsIn('dict_name', child_id_expr, ancestor_id_expr)
```

**参数**

- `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
- `child_id_expr` — 要检查的键。返回 [UInt64](../data-types/int-uint.md) 类型值的[表达式](/sql-reference/syntax#expressions)。
- `ancestor_id_expr` — `child_id_expr` 键的推定祖先。返回 [UInt64](../data-types/int-uint.md) 类型值的[表达式](/sql-reference/syntax#expressions)。

**返回值**

- 0,如果 `child_id_expr` 不是 `ancestor_id_expr` 的子节点。[UInt8](../data-types/int-uint.md)。
- 1,如果 `child_id_expr` 是 `ancestor_id_expr` 的子节点,或者 `child_id_expr` 就是 `ancestor_id_expr`。[UInt8](../data-types/int-uint.md)。


## dictGetChildren {#dictgetchildren}

以索引数组的形式返回第一级子节点。这是 [dictGetHierarchy](#dictgethierarchy) 的逆向转换。

**语法**

```sql
dictGetChildren(dict_name, key)
```

**参数**

- `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
- `key` — 键值。返回 [UInt64](../data-types/int-uint.md) 类型值的[表达式](/sql-reference/syntax#expressions)。

**返回值**

- 该键的第一级子节点。[Array](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**示例**

考虑以下层级字典:

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```

第一级子节点:

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

返回所有后代节点,效果等同于递归调用 [dictGetChildren](#dictgetchildren) 函数 `level` 次。

**语法**

```sql
dictGetDescendants(dict_name, key, level)
```

**参数**

- `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
- `key` — 键值。返回 [UInt64](../data-types/int-uint.md) 类型值的[表达式](/sql-reference/syntax#expressions)。
- `level` — 层级深度。若 `level = 0` 则返回所有后代节点直到末端。[UInt8](../data-types/int-uint.md)。

**返回值**

- 该键的后代节点。[Array](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**示例**

考虑以下层级字典:

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```

所有后代节点:

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

第一级后代节点:

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

检索[正则表达式树字典](../../sql-reference/dictionaries/index.md#regexp-tree-dictionary)中与每个键匹配的所有节点的属性值。

除了返回 `Array(T)` 类型的值而非 `T` 类型外,该函数的行为与 [`dictGet`](#dictget-dictgetordefault-dictgetornull) 类似。

**语法**

```sql
dictGetAll('dict_name', attr_names, id_expr[, limit])
```

**参数**

- `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
- `attr_names` — 字典的列名,[字符串字面量](/sql-reference/syntax#string),或列名元组,[Tuple](/sql-reference/data-types/tuple)([字符串字面量](/sql-reference/syntax#string))。
- `id_expr` — 键值。根据字典配置返回字典键类型值数组或 [Tuple](/sql-reference/data-types/tuple) 类型值的[表达式](/sql-reference/syntax#expressions)。
- `limit` — 返回的每个值数组的最大长度。截断时,子节点优先于父节点,否则遵循正则表达式树字典定义的列表顺序。如果未指定,数组长度不受限制。

**返回值**

- 如果 ClickHouse 成功按照字典中定义的属性数据类型解析属性,则针对 `attr_names` 指定的每个属性,返回与 `id_expr` 对应的字典属性值数组。

- 如果字典中不存在与 `id_expr` 对应的键,则返回空数组。

如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,则会抛出异常。

**示例**

考虑以下正则表达式树字典:

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

获取所有匹配值：

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz');
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz')─┐
│ ['foo_attr','bar_attr','baz_attr']            │
└───────────────────────────────────────────────┘
```

最多获取 2 个匹配值：

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2);
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2)─┐
│ ['foo_attr','bar_attr']                          │
└──────────────────────────────────────────────────┘
```


## dictGetKeys {#dictgetkeys}

返回属性值等于指定值的字典键。这是对单个属性执行 [`dictGet`](#dictget-dictgetordefault-dictgetornull) 的逆操作。

**语法**

```sql
dictGetKeys('dict_name', 'attr_name', value_expr);
```

**参数**

- `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
- `attr_name` — 字典的属性列名称。[字符串字面量](/sql-reference/syntax#string)。
- `value_expr` — 要与属性匹配的值。可转换为属性数据类型的[表达式](/sql-reference/syntax#expressions)。

**返回值**

- 对于单键字典:返回属性值等于 `value_expr` 的键数组。[Array(T)](../data-types/array.md),其中 `T` 是字典键的数据类型。

- 对于多键字典:返回属性值等于 `value_expr` 的键元组数组。[Array](../data-types/array.md)([Tuple(T1, T2, ...)](../data-types/tuple.md)),其中每个 `Tuple` 按顺序包含字典的键列。

- 如果字典中不存在与 `value_expr` 对应的属性值,则返回空数组。

如果无法解析属性值或该值无法转换为属性数据类型,ClickHouse 将抛出异常。

**示例**

考虑以下字典:

```txt
 ┌─id─┬─level──┐
 │  1 │ low    │
 │  2 │ high   │
 │  3 │ medium │
 │  4 │ high   │
 └────┴────────┘
```

现在获取所有 level 为 `high` 的 id:

```sql
SELECT dictGetKeys('levels', 'level', 'high') AS ids;
```

```text
 ┌─ids───┐
 │ [4,2] │
 └───────┘
```

:::note
使用设置 `max_reverse_dictionary_lookup_cache_size_bytes` 来限制 `dictGetKeys` 使用的每查询反向查找缓存的大小。该缓存为每个属性值存储序列化的键元组,以避免在同一查询中重复扫描字典。该缓存不会在查询之间持久化。当达到限制时,将使用 LRU 算法淘汰条目。这对于大型字典最有效,尤其是当输入具有低基数且工作集适合缓存时。设置为 `0` 可禁用缓存。

此外,如果 `attr_name` 列的唯一值能够放入缓存,那么在大多数情况下,函数的执行时间应该与输入行数呈线性关系,再加上少量的字典扫描。
:::


## 其他函数 {#other-functions}

ClickHouse 支持专用函数,无论字典配置如何,都可以将字典属性值转换为特定的数据类型。

函数:

- `dictGetInt8`, `dictGetInt16`, `dictGetInt32`, `dictGetInt64`
- `dictGetUInt8`, `dictGetUInt16`, `dictGetUInt32`, `dictGetUInt64`
- `dictGetFloat32`, `dictGetFloat64`
- `dictGetDate`
- `dictGetDateTime`
- `dictGetUUID`
- `dictGetString`
- `dictGetIPv4`, `dictGetIPv6`

所有这些函数都有 `OrDefault` 变体。例如 `dictGetDateOrDefault`。

语法:

```sql
dictGet[Type]('dict_name', 'attr_name', id_expr)
dictGet[Type]OrDefault('dict_name', 'attr_name', id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
- `attr_name` — 字典列名称。[字符串字面量](/sql-reference/syntax#string)。
- `id_expr` — 键值。根据字典配置,返回 [UInt64](../data-types/int-uint.md) 或 [Tuple](../data-types/tuple.md) 类型值的[表达式](/sql-reference/syntax#expressions)。
- `default_value_expr` — 当字典中不包含具有 `id_expr` 键的行时返回的值。返回为 `attr_name` 属性配置的数据类型值的[表达式](/sql-reference/syntax#expressions)。

**返回值**

- 如果 ClickHouse 成功按照[属性的数据类型](/sql-reference/dictionaries#dictionary-key-and-fields)解析属性,函数将返回与 `id_expr` 对应的字典属性值。

- 如果字典中不存在请求的 `id_expr`,则:

        - `dictGet[Type]` 返回字典配置中为该属性指定的 `<null_value>` 元素的内容。
        - `dictGet[Type]OrDefault` 返回作为 `default_value_expr` 参数传递的值。

如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,则会抛出异常。


## 示例字典 {#example-dictionary}

本节示例使用以下字典。您可以在 ClickHouse 中创建这些字典来运行下述函数的示例。

<details>
<summary>dictGet\<T\> 和 dictGet\<T\>OrDefault 函数的示例字典</summary>

```sql
-- 创建包含所有必需数据类型的表
CREATE TABLE all_types_test (
    `id` UInt32,

    -- 字符串类型
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

    -- 浮点数类型
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
    'ClickHouse',                   -- 字符串
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
    '2024-01-15',                   -- 日期
    '2024-01-15 10:30:00',          -- 日期时间
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
<summary>dictGetAll 函数的示例字典</summary>

创建表以存储正则表达式树字典的数据:

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

向表中插入数据:

```sql
INSERT INTO regexp_os
SELECT *
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/' ||
    'user_agent_regex/regexp_os.csv'
);
```

创建正则表达式树字典:

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

创建输入表:

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

向输入表中插入数据:


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

向源表插入数据：

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

向源表插入数据：

```sql
INSERT INTO hierarchy_source VALUES
(0, 0, 'Root'),
(1, 0, 'Level 1 - Node 1'),
(2, 1, 'Level 2 - Node 2'),
(3, 1, 'Level 2 - Node 3'),
(4, 2, 'Level 3 - Node 4'),
(5, 2, 'Level 3 - Node 5'),
(6, 3, 'Level 3 - Node 6');

-- 0 (根节点)
-- └── 1 (第1层 - 节点1)
--     ├── 2 (第2层 - 节点2)
--     │   ├── 4 (第3层 - 节点4)
--     │   └── 5 (第3层 - 节点5)
--     └── 3 (第2层 - 节点3)
--         └── 6 (第3层 - 节点6)
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

<!--
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->


<!--AUTOGENERATED_START-->

## dictGet {#dictGet}

引入版本:v18.16

从字典中检索值。

**语法**

```sql
dictGet('dict_name', attr_names, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_names` — 字典列名称,或列名称元组。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回 UInt64/Tuple(T) 的表达式。[`UInt64`](/sql-reference/data-types/int-uint) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

如果找到键,则返回与 id_expr 对应的字典属性值。
如果未找到键,则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

**示例**

**检索单个属性**

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


## dictGetAll {#dictGetAll}

引入版本:v23.5

将字典属性值转换为 `All` 数据类型,不受字典配置影响。

**语法**

```sql
dictGetAll(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT
    'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36' AS user_agent,

    -- 这将匹配所有适用的模式
    dictGetAll('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS all_matches,

    -- 这仅返回第一个匹配项
    dictGet('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS first_match;
```

```response title=Response
┌─user_agent─────────────────────────────────────────────────────┬─all_matches─────────────────────────────┬─first_match─┐
│ Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36 │ ['Android','Android','Android','Linux'] │ Android     │
└────────────────────────────────────────────────────────────────┴─────────────────────────────────────────┴─────────────┘
```


## dictGetChildren {#dictGetChildren}

引入版本:v21.4

以索引数组的形式返回第一级子节点。这是 [dictGetHierarchy](#dictgethierarchy) 的逆向转换。

**语法**

```sql
dictGetChildren(dict_name, key)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `key` — 要检查的键。[`const String`](/sql-reference/data-types/string)

**返回值**

返回指定键的第一级子节点。[`Array(UInt64)`](/sql-reference/data-types/array)

**示例**

**获取字典的第一级子节点**

```sql title=Query
SELECT dictGetChildren('hierarchical_dictionary', 2);
```

```response title=Response
┌─dictGetChild⋯ionary', 2)─┐
│ [4,5]                    │
└──────────────────────────┘
```


## dictGetDate {#dictGetDate}

引入版本:v1.1

将字典属性值转换为 `Date` 数据类型,不受字典配置影响。

**语法**

```sql
dictGetDate(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetDate('all_types_dict', 'Date_value', 1)
```

```response title=Response
┌─dictGetDate(⋯_value', 1)─┐
│               2020-01-01 │
└──────────────────────────┘
```


## dictGetDateOrDefault {#dictGetDateOrDefault}

引入版本:v1.1

将字典属性值转换为 `Date` 数据类型(无论字典配置如何),如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetDateOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回作为 `default_value_expr` 参数传递的值。

:::note
如果无法解析属性值或值与属性数据类型不匹配,ClickHouse 将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetDate('all_types_dict', 'Date_value', 1);

-- 对于不存在的键,返回提供的默认值
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

引入版本:v1.1

将字典属性值转换为 `DateTime` 数据类型,不受字典配置影响。

**语法**

```sql
dictGetDateTime(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
:::

**示例**

**使用示例**

```sql title=查询
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1)
```

```response title=响应
┌─dictGetDateT⋯_value', 1)─┐
│      2024-01-15 10:30:00 │
└──────────────────────────┘
```


## dictGetDateTimeOrDefault {#dictGetDateTimeOrDefault}

引入版本:v1.1

将字典属性值转换为 `DateTime` 数据类型(不受字典配置影响),如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetDateTimeOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典中不包含 `id_expr` 键对应的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回 `default_value_expr` 参数传递的值。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1);

-- 对于不存在的键,返回提供的默认值
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

引入版本：v21.4

返回所有后代节点，效果等同于递归调用 [`dictGetChildren`](#dictGetChildren) 函数 `level` 次。

**语法**

```sql
dictGetDescendants(dict_name, key, level)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `key` — 要查询的键。[`const String`](/sql-reference/data-types/string)
- `level` — 层级深度。如果 `level = 0` 则返回所有后代节点直到末端。[`UInt8`](/sql-reference/data-types/int-uint)

**返回值**

返回指定键的后代节点。[`Array(UInt64)`](/sql-reference/data-types/array)

**示例**

**获取字典的第二级后代节点**

```sql title=查询
-- 考虑以下层级字典：
-- 0 (根节点)
-- └── 1 (第 1 级 - 节点 1)
--     ├── 2 (第 2 级 - 节点 2)
--     │   ├── 4 (第 3 级 - 节点 4)
--     │   └── 5 (第 3 级 - 节点 5)
--     └── 3 (第 2 级 - 节点 3)
--         └── 6 (第 3 级 - 节点 6)

SELECT dictGetDescendants('hierarchical_dictionary', 0, 2)
```

```response title=响应
┌─dictGetDesce⋯ary', 0, 2)─┐
│ [3,2]                    │
└──────────────────────────┘
```


## dictGetFloat32 {#dictGetFloat32}

引入版本:v1.1

将字典属性值转换为 `Float32` 数据类型,不受字典配置影响。

**语法**

```sql
dictGetFloat32(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1)
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│               -123.123   │
└──────────────────────────┘
```


## dictGetFloat32OrDefault {#dictGetFloat32OrDefault}

引入版本:v1.1

将字典属性值转换为 `Float32` 数据类型(无论字典配置如何),如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetFloat32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回作为 `default_value_expr` 参数传递的值。

:::note
如果无法解析属性值或值与属性数据类型不匹配,ClickHouse 将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1);

-- 对于不存在的键,返回提供的默认值 (-1.0)
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

引入版本:v1.1

将字典属性值转换为 `Float64` 数据类型,不受字典配置影响。

**语法**

```sql
dictGetFloat64(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
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


## dictGetFloat64OrDefault {#dictGetFloat64OrDefault}

引入版本:v1.1

将字典属性值转换为 `Float64` 数据类型(无论字典配置如何),如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetFloat64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回作为 `default_value_expr` 参数传递的值。

:::note
如果无法解析属性值或值与属性数据类型不匹配,ClickHouse 将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetFloat64('all_types_dict', 'Float64_value', 1);

-- 对于不存在的键,返回提供的默认值 (nan)
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

引入版本：v1.1

创建一个数组，包含[层次字典](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries)中指定键的所有父级。

**语法**

```sql
dictGetHierarchy(dict_name, key)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `key` — 键值。[`const String`](/sql-reference/data-types/string)

**返回值**

返回该键的所有父级。[`Array(UInt64)`](/sql-reference/data-types/array)

**示例**

**获取键的层次结构**

```sql title=Query
SELECT dictGetHierarchy('hierarchical_dictionary', 5)
```

```response title=Response
┌─dictGetHiera⋯ionary', 5)─┐
│ [5,2,1]                  │
└──────────────────────────┘
```


## dictGetIPv4 {#dictGetIPv4}

引入版本：v1.1

将字典属性值转换为 `IPv4` 数据类型，不受字典配置影响。

**语法**

```sql
dictGetIPv4(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配，将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1)
```

```response title=Response
┌─dictGetIPv4('all_⋯ 'IPv4_value', 1)─┐
│ 192.168.0.1                         │
└─────────────────────────────────────┘
```


## dictGetIPv4OrDefault {#dictGetIPv4OrDefault}

引入版本：v23.1

将字典属性值转换为 `IPv4` 数据类型（无论字典配置如何），如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetIPv4OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，否则返回作为 `default_value_expr` 参数传递的值。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1);

-- 对于不存在的键，返回提供的默认值
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

引入版本：v23.1

将字典属性值转换为 `IPv6` 数据类型，不受字典配置影响。

**语法**

```sql
dictGetIPv6(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配，将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1)
```

```response title=Response
┌─dictGetIPv6('all_⋯ 'IPv6_value', 1)─┐
│ 2001:db8:85a3::8a2e:370:7334        │
└─────────────────────────────────────┘
```


## dictGetIPv6OrDefault {#dictGetIPv6OrDefault}

引入版本:v23.1

将字典属性值转换为 `IPv6` 数据类型(无论字典配置如何),如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetIPv6OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回作为 `default_value_expr` 参数传递的值。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1);

-- 对于不存在的键,返回提供的默认值
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

引入版本:v1.1

将字典属性值转换为 `Int16` 数据类型,不受字典配置影响。

**语法**

```sql
dictGetInt16(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
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


## dictGetInt16OrDefault {#dictGetInt16OrDefault}

引入版本:v1.1

将字典属性值转换为 `Int16` 数据类型(无论字典配置如何),如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回作为 `default_value_expr` 参数传递的值。

:::note
如果无法解析属性值或值与属性数据类型不匹配,ClickHouse 将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetInt16('all_types_dict', 'Int16_value', 1);

-- 对于不存在的键,返回提供的默认值 (-1)
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

引入版本:v1.1

将字典属性值转换为 `Int32` 数据类型,不受字典配置影响。

**语法**

```sql
dictGetInt32(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1)
```

```response title=Response
┌─dictGetInt32⋯_value', 1)─┐
│                -1000000  │
└──────────────────────────┘
```


## dictGetInt32OrDefault {#dictGetInt32OrDefault}

引入版本:v1.1

将字典属性值转换为 `Int32` 数据类型(无论字典配置如何),如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回作为 `default_value_expr` 参数传递的值。

:::note
如果无法解析属性值或值与属性数据类型不匹配,ClickHouse 将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1);

-- 对于不存在的键,返回提供的默认值 (-1)
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

引入版本:v1.1

将字典属性值转换为 `Int64` 数据类型,不受字典配置影响。

**语法**

```sql
dictGetInt64(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
:::

**示例**

**使用示例**

```sql title=查询
SELECT dictGetInt64('all_types_dict', 'Int64_value', 1)
```

```response title=响应
┌─dictGetInt64⋯_value', 1)───┐
│       -9223372036854775807 │
└────────────────────────────┘
```


## dictGetInt64OrDefault {#dictGetInt64OrDefault}

引入版本:v1.1

将字典属性值转换为 `Int64` 数据类型(无论字典配置如何),如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回作为 `default_value_expr` 参数传递的值。

:::note
如果无法解析属性值或值与属性数据类型不匹配,ClickHouse 将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetInt64('all_types_dict', 'Int64_value', 1);

-- 对于不存在的键,返回提供的默认值 (-1)
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

引入版本:v1.1

将字典属性值转换为 `Int8` 数据类型,不受字典配置影响。

**语法**

```sql
dictGetInt8(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1)
```

```response title=Response
┌─dictGetInt8(⋯_value', 1)─┐
│                     -100 │
└──────────────────────────┘
```


## dictGetInt8OrDefault {#dictGetInt8OrDefault}

引入版本:v1.1

将字典属性值转换为 `Int8` 数据类型(无论字典配置如何),如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回作为 `default_value_expr` 参数传递的值。

:::note
如果无法解析属性值或值与属性数据类型不匹配,ClickHouse 将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1);

-- 对于不存在的键,返回提供的默认值 (-1)
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

引入版本：v25.11

返回属性值等于指定值的字典键。这是对单个属性执行 `dictGet` 函数的逆操作。

使用 `max_reverse_dictionary_lookup_cache_size_bytes` 设置来限制 `dictGetKeys` 所使用的每查询反向查找缓存的大小。
该缓存为每个属性值存储序列化的键元组，以避免在同一查询内重复扫描字典。
缓存不会跨查询持久化。当达到限制时，将使用 LRU 算法淘汰条目。
当输入具有低基数且工作集能够容纳在缓存中时，这对大型字典最为有效。设置为 `0` 可禁用缓存。

**语法**

```sql
dictGetKeys('dict_name', 'attr_name', value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 要匹配的属性。[`String`](/sql-reference/data-types/string)
- `value_expr` — 要与属性进行匹配的值。[`Expression`](/sql-reference/data-types/special-data-types/expression)

**返回值**

对于单键字典：返回属性等于 `value_expr` 的键数组。对于多键字典：返回属性等于 `value_expr` 的键元组数组。如果字典中不存在与 `value_expr` 对应的属性，则返回空数组。如果 ClickHouse 无法解析属性值或该值无法转换为属性数据类型，则会抛出异常。

**示例**


## dictGetOrDefault {#dictGetOrDefault}

引入版本:v18.16

从字典中检索值,当键不存在时返回默认值。

**语法**

```sql
dictGetOrDefault('dict_name', attr_names, id_expr, default_value)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_names` — 字典的列名称,或列名称元组。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回 UInt64/Tuple(T) 的表达式。[`UInt64`](/sql-reference/data-types/int-uint) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value` — 键不存在时返回的默认值。类型必须与属性的数据类型匹配。

**返回值**

如果找到键,返回与 `id_expr` 对应的字典属性值。
如果未找到键,返回提供的 `default_value`。

**示例**

**获取带默认值的值**

```sql title=查询
SELECT dictGetOrDefault('ext_dict_mult', 'c1', toUInt64(999), 0) AS val
```

```response title=响应
0
```


## dictGetOrNull {#dictGetOrNull}

引入版本:v21.4

从字典中检索值,如果未找到键则返回 NULL。

**语法**

```sql
dictGetOrNull('dict_name', 'attr_name', id_expr)
```

**参数**

- `dict_name` — 字典名称。字符串字面量。
- `attr_name` — 要检索的列名称。字符串字面量。
- `id_expr` — 键值。返回字典键类型值的表达式。

**返回值**

如果找到键,则返回与 `id_expr` 对应的字典属性值。
如果未找到键,则返回 `NULL`。

**示例**

**使用范围键字典的示例**

```sql title=查询
SELECT
    (number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value', number, toDate('2019-05-20')),
FROM system.numbers LIMIT 5 FORMAT TabSeparated;
```

```response title=响应
(0,'2019-05-20')  \N
(1,'2019-05-20')  First
(2,'2019-05-20')  Second
(3,'2019-05-20')  Third
(4,'2019-05-20')  \N
```


## dictGetString {#dictGetString}

引入版本:v1.1

将字典属性值转换为 `String` 数据类型,不受字典配置影响。

**语法**

```sql
dictGetString(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
:::

**示例**

**使用示例**

```sql title=查询
SELECT dictGetString('all_types_dict', 'String_value', 1)
```

```response title=响应
┌─dictGetString(⋯_value', 1)─┐
│ test string                │
└────────────────────────────┘
```


## dictGetStringOrDefault {#dictGetStringOrDefault}

引入版本:v1.1

将字典属性值转换为 `String` 数据类型(无论字典配置如何),如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetStringOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回作为 `default_value_expr` 参数传递的值。

:::note
如果无法解析属性值或值与属性数据类型不匹配,ClickHouse 将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetString('all_types_dict', 'String_value', 1);

-- 对于不存在的键,返回提供的默认值
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

引入版本:v1.1

将字典属性值转换为 `UInt16` 数据类型,不受字典配置影响。

**语法**

```sql
dictGetUInt16(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
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


## dictGetUInt16OrDefault {#dictGetUInt16OrDefault}

引入版本：v1.1

将字典属性值转换为 `UInt16` 数据类型（无论字典配置如何），如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetUInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，否则返回作为 `default_value_expr` 参数传递的值。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配，则会抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetUInt16('all_types_dict', 'UInt16_value', 1);

-- 对于不存在的键，返回提供的默认值 (0)
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

引入版本:v1.1

将字典属性值转换为 `UInt32` 数据类型,不受字典配置影响。

**语法**

```sql
dictGetUInt32(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1)
```

```response title=Response
┌─dictGetUInt3⋯_value', 1)─┐
│                  1000000 │
└──────────────────────────┘
```


## dictGetUInt32OrDefault {#dictGetUInt32OrDefault}

引入版本：v1.1

将字典属性值转换为 `UInt32` 数据类型（不受字典配置影响），如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetUInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含 `id_expr` 键对应的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，否则返回 `default_value_expr` 参数传递的值。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配，将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1);

-- 对于不存在的键，返回提供的默认值 (0)
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

引入版本：v1.1

将字典属性值转换为 `UInt64` 数据类型，不受字典配置影响。

**语法**

```sql
dictGetUInt64(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配，将抛出异常。
:::

**示例**

**使用示例**

```sql title=查询
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1)
```

```response title=响应
┌─dictGetUInt6⋯_value', 1)─┐
│      9223372036854775807 │
└──────────────────────────┘
```


## dictGetUInt64OrDefault {#dictGetUInt64OrDefault}

引入版本：v1.1

无论字典配置如何，都将字典属性值转换为 `UInt64` 数据类型，如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetUInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，否则返回 `default_value_expr` 参数传递的值。

:::note
如果无法解析属性值或值与属性数据类型不匹配，ClickHouse 将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1);

-- 对于不存在的键，返回提供的默认值 (0)
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

引入版本：v1.1

将字典属性值转换为 `UInt8` 数据类型，无论字典如何配置。

**语法**

```sql
dictGetUInt8(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式（取决于字典配置）。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值，否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配，则会抛出异常。
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


## dictGetUInt8OrDefault {#dictGetUInt8OrDefault}

引入版本:v1.1

将字典属性值转换为 `UInt8` 数据类型(无论字典配置如何),如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetUInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回 `default_value_expr` 参数传递的值。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,则会抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetUInt8('all_types_dict', 'UInt8_value', 1);

-- 对于不存在的键,返回提供的默认值 (0)
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

引入版本:v1.1

将字典属性值转换为 `UUID` 数据类型,不受字典配置影响。

**语法**

```sql
dictGetUUID(dict_name, attr_name, id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回字典配置中为该属性指定的 `<null_value>` 元素内容。

:::note
如果 ClickHouse 无法解析属性值或该值与属性数据类型不匹配,将抛出异常。
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


## dictGetUUIDOrDefault {#dictGetUUIDOrDefault}

引入版本:v1.1

将字典属性值转换为 `UUID` 数据类型(无论字典配置如何),如果未找到键则返回提供的默认值。

**语法**

```sql
dictGetUUIDOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `attr_name` — 字典列名称。[`String`](/sql-reference/data-types/string) 或 [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — 键值。返回字典键类型值或元组值的表达式(取决于字典配置)。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — 当字典不包含具有 `id_expr` 键的行时返回的值。[`Expression`](/sql-reference/data-types/special-data-types/expression) 或 [`Tuple(T)`](/sql-reference/data-types/tuple)

**返回值**

返回与 `id_expr` 对应的字典属性值,否则返回作为 `default_value_expr` 参数传递的值。

:::note
如果无法解析属性值或值与属性数据类型不匹配,ClickHouse 将抛出异常。
:::

**示例**

**使用示例**

```sql title=Query
-- 对于存在的键
SELECT dictGetUUID('all_types_dict', 'UUID_value', 1);

-- 对于不存在的键,返回提供的默认值
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

引入版本：v1.1

检查字典中是否存在指定的键。

**语法**

```sql
dictHas('dict_name', id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `id_expr` — 键值。[`const String`](/sql-reference/data-types/string)

**返回值**

如果键存在则返回 `1`,否则返回 `0`。[`UInt8`](/sql-reference/data-types/int-uint)

**示例**

**检查字典中是否存在某个键**

```sql title=Query
-- 考虑以下层级字典：
-- 0 (根节点)
-- └── 1 (第1层 - 节点1)
--     ├── 2 (第2层 - 节点2)
--     │   ├── 4 (第3层 - 节点4)
--     │   └── 5 (第3层 - 节点5)
--     └── 3 (第2层 - 节点3)
--         └── 6 (第3层 - 节点6)

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

引入版本:v1.1

检查字典中某个键通过完整层级链的祖先关系。

**语法**

```sql
dictIsIn(dict_name, child_id_expr, ancestor_id_expr)
```

**参数**

- `dict_name` — 字典名称。[`String`](/sql-reference/data-types/string)
- `child_id_expr` — 待检查的键。[`String`](/sql-reference/data-types/string)
- `ancestor_id_expr` — `child_id_expr` 键的推定祖先。[`const String`](/sql-reference/data-types/string)

**返回值**

如果 `child_id_expr` 不是 `ancestor_id_expr` 的子节点,返回 `0`;如果 `child_id_expr` 是 `ancestor_id_expr` 的子节点或 `child_id_expr` 本身就是 `ancestor_id_expr`,返回 `1`。[`UInt8`](/sql-reference/data-types/int-uint)

**示例**

**检查层级关系**

```sql title=Query
-- 有效的层级关系
SELECT dictIsIn('hierarchical_dictionary', 6, 3)

-- 无效的层级关系
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

<!--AUTOGENERATED_END-->
