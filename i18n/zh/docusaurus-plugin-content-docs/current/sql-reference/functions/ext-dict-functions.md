---
description: '字典相关函数文档'
sidebar_label: '字典'
slug: /sql-reference/functions/ext-dict-functions
title: '字典相关函数'
doc_type: 'reference'
---

# 用于处理字典的函数 {#functions-for-working-with-dictionaries}

:::note
对于使用 [DDL 查询](../../sql-reference/statements/create/dictionary.md) 创建的字典，`dict_name` 参数必须完整写为 `<database>.<dict_name>`。否则，将使用当前数据库。
:::

有关连接和配置字典的更多信息，请参阅 [Dictionaries](../../sql-reference/dictionaries/index.md)。

## dictGet、dictGetOrDefault、dictGetOrNull {#dictget-dictgetordefault-dictgetornull}

从字典中检索值。

```sql
dictGet('dict_name', attr_names, id_expr)
dictGetOrDefault('dict_name', attr_names, id_expr, default_value_expr)
dictGetOrNull('dict_name', attr_name, id_expr)
```

**参数**

* `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
* `attr_names` — 字典列的名称（[字符串字面量](/sql-reference/syntax#string)），或由列名组成的元组 [Tuple](/sql-reference/data-types/tuple)（[字符串字面量](/sql-reference/syntax#string)）。
* `id_expr` — 键值。[Expression](/sql-reference/syntax#expressions) 返回与字典键类型相同的值，或返回 [Tuple](../data-types/tuple.md) 类型的值，视字典配置而定。
* `default_value_expr` — 当字典中不包含具有 `id_expr` 键的行时返回的值。[Expression](/sql-reference/syntax#expressions) 或 [Tuple](../data-types/tuple.md)([Expression](/sql-reference/syntax#expressions))，返回值（或一组值）的数据类型与为 `attr_names` 属性配置的数据类型一致。

**返回值**

* 如果 ClickHouse 能按[该属性的数据类型](/sql-reference/dictionaries#dictionary-key-and-fields)成功解析该属性，这些函数会返回与 `id_expr` 对应的字典属性值。

* 如果在字典中找不到与 `id_expr` 对应的键，则：

  * `dictGet` 返回字典配置中为该属性指定的 `<null_value>` 元素的内容。
  * `dictGetOrDefault` 返回作为 `default_value_expr` 参数传入的值。
  * `dictGetOrNull` 在字典中未找到键时返回 `NULL`。

如果 ClickHouse 无法解析属性值或属性值与属性数据类型不匹配,ClickHouse 将抛出异常。

**简单键字典示例**

创建一个文本文件 `ext-dict-test.csv`,包含以下内容:

```text
1,1
2,2
```

第一列是 `id`,第二列是 `c1`。

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

创建一个文本文件 `ext-dict-mult.csv`,包含以下内容:

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

执行查询：

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

* [字典（Dictionaries）](../../sql-reference/dictionaries/index.md)


## dictHas {#dicthas}

检查字典中是否存在某个键。

```sql
dictHas('dict_name', id_expr)
```

**参数**

* `dict_name` — 字典的名称。[字符串字面量](/sql-reference/syntax#string)。
* `id_expr` — 键值。[表达式](/sql-reference/syntax#expressions)，返回字典键类型的值，或根据字典配置返回 [Tuple](../data-types/tuple.md) 类型的值。

**返回值**

* 键不存在时为 0。[UInt8](../data-types/int-uint.md)。
* 键存在时为 1。[UInt8](../data-types/int-uint.md)。


## dictGetHierarchy {#dictgethierarchy}

创建一个数组，包含[层级字典](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries)中某个键的所有父项。

**语法**

```sql
dictGetHierarchy('dict_name', key)
```

**参数**

* `dict_name` — 字典名。[String literal](/sql-reference/syntax#string)。
* `key` — 键值。返回 [UInt64](../data-types/int-uint.md) 类型值的[表达式](/sql-reference/syntax#expressions)。

**返回值**

* 该键对应的父键。[Array(UInt64)](../data-types/array.md)。


## dictIsIn {#dictisin}

在字典的完整层级链中检查某个键的祖先。

```sql
dictIsIn('dict_name', child_id_expr, ancestor_id_expr)
```

**参数**

* `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
* `child_id_expr` — 要检查的键。[表达式](/sql-reference/syntax#expressions)，返回 [UInt64](../data-types/int-uint.md) 类型的值。
* `ancestor_id_expr` — `child_id_expr` 键的假定祖先。[表达式](/sql-reference/syntax#expressions)，返回 [UInt64](../data-types/int-uint.md) 类型的值。

**返回值**

* 若 `child_id_expr` 不是 `ancestor_id_expr` 的子节点，则返回 0。[UInt8](../data-types/int-uint.md)。
* 若 `child_id_expr` 是 `ancestor_id_expr` 的子节点，或 `child_id_expr` 即为 `ancestor_id_expr`，则返回 1。[UInt8](../data-types/int-uint.md)。


## dictGetChildren {#dictgetchildren}

返回第一层子节点的索引数组。它是 [dictGetHierarchy](#dictgethierarchy) 的逆向变换。

**语法**

```sql
dictGetChildren(dict_name, key)
```

**参数**

* `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
* `key` — 键值。[表达式](/sql-reference/syntax#expressions)，返回 [UInt64](../data-types/int-uint.md) 类型的值。

**返回值**

* 该键的第一层子节点。[Array](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**示例**

考虑如下层级字典：

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```

一级子节点：

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

返回所有后代，相当于对 [dictGetChildren](#dictgetchildren) 函数递归调用 `level` 次的结果。

**语法**

```sql
dictGetDescendants(dict_name, key, level)
```

**参数**

* `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
* `key` — 键值。[表达式](/sql-reference/syntax#expressions)，返回 [UInt64](../data-types/int-uint.md) 类型的值。
* `level` — 层级。如果 `level = 0`，则返回该键直到最底层的所有后代。[UInt8](../data-types/int-uint.md)。

**返回值**

* 指定键的所有后代。[Array](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**示例**

考虑如下层级字典：

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```

所有子节点：

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

第一层子节点：

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

对于每个键，从[正则表达式树字典](../../sql-reference/dictionaries/index.md#regexp-tree-dictionary)中获取与之匹配的所有节点的属性值。

除返回 `Array(T)` 类型而非 `T` 之外，此函数的行为与 [`dictGet`](#dictget-dictgetordefault-dictgetornull) 相同。

**语法**

```sql
dictGetAll('dict_name', attr_names, id_expr[, limit])
```

**参数**

* `dict_name` — 字典名称。[String literal](/sql-reference/syntax#string)。
* `attr_names` — 字典中列的名称，[String literal](/sql-reference/syntax#string)，或列名的元组，[Tuple](/sql-reference/data-types/tuple)（[String literal](/sql-reference/syntax#string)）。
* `id_expr` — 键的值。[Expression](/sql-reference/syntax#expressions)，返回字典键类型值的数组，或者根据字典配置返回 [Tuple](/sql-reference/data-types/tuple) 类型的值。
* `limit` - 每个返回数组中值的最大数量。发生截断时，子节点优先于父节点；在其他情况下，会遵循为 regexp 树字典定义的列表顺序。如果未指定，则数组长度不受限制。

**返回值**

* 如果 ClickHouse 能够按照字典中为该属性定义的数据类型成功解析该属性，则返回一个数组，数组中包含字典属性值，这些值对应于由 `attr_names` 指定的每个属性的 `id_expr`。

* 如果字典中没有与 `id_expr` 对应的键，则返回空数组。

如果 ClickHouse 无法解析该属性的值，或者该值与属性的数据类型不匹配，则会抛出异常。

**示例**

考虑以下 regexp 树字典：

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
# /var/lib/clickhouse/user_files/regexp_tree.yaml {#varlibclickhouseuser_filesregexp_treeyaml}
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

获取最多 2 个匹配的值：

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2);
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2)─┐
│ ['foo_attr','bar_attr']                          │
└──────────────────────────────────────────────────┘
```


## dictGetKeys {#dictgetkeys}

返回其属性等于指定值的字典键。对于单个属性，这是 [`dictGet`](#dictget-dictgetordefault-dictgetornull) 的逆向操作。

**语法**

```sql
dictGetKeys('dict_name', 'attr_name', value_expr);
```

**参数**

* `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
* `attr_name` — 字典属性列名称。[字符串字面量](/sql-reference/syntax#string)。
* `value_expr` — 用于与属性进行匹配的值。[表达式](/sql-reference/syntax#expressions)，必须可以转换为该属性的数据类型。

**返回值**

* 对于单键字典：返回属性等于 `value_expr` 的键组成的数组。[Array(T)](../data-types/array.md)，其中 `T` 为字典键的数据类型。

* 对于多键字典：返回属性等于 `value_expr` 的键元组数组。[Array](../data-types/array.md)([Tuple(T1, T2, ...)](../data-types/tuple.md))，其中每个 `Tuple` 按顺序包含字典的键列。

* 如果在字典中找不到与 `value_expr` 对应的属性值，则返回空数组。

如果 ClickHouse 无法解析属性的值，或者该值无法转换为属性的数据类型，则会抛出异常。

**示例**

考虑以下字典：

```txt
 ┌─id─┬─level──┐
 │  1 │ low    │
 │  2 │ high   │
 │  3 │ medium │
 │  4 │ high   │
 └────┴────────┘
```

现在来获取所有级别为 `high` 的 ID：

```sql
SELECT dictGetKeys('levels', 'level', 'high') AS ids;
```

```text
 ┌─ids───┐
 │ [4,2] │
 └───────┘
```

:::note
使用 `max_reverse_dictionary_lookup_cache_size_bytes` 设置来限制 `dictGetKeys` 在每个查询中使用的反向查找缓存大小。该缓存为每个属性值存储序列化的键元组，以避免在同一查询内重复扫描字典。缓存不会在查询之间持久化。当达到限制时，条目将按 LRU 策略进行淘汰。对于大型字典、输入基数较低且工作集可以被缓存完全容纳的场景，此设置最为有效。将其设置为 `0` 可禁用缓存。

另外，如果 `attr_name` 列的所有唯一值都可以被缓存完全容纳，那么在大多数情况下，函数的执行时间应当与输入行数呈线性关系，只需额外进行少量的字典扫描。
:::


## 其他函数 {#other-functions}

ClickHouse 支持一些专用函数，这些函数可以在不受字典配置影响的情况下，将字典属性值转换为特定数据类型。

函数：

* `dictGetInt8`, `dictGetInt16`, `dictGetInt32`, `dictGetInt64`
* `dictGetUInt8`, `dictGetUInt16`, `dictGetUInt32`, `dictGetUInt64`
* `dictGetFloat32`, `dictGetFloat64`
* `dictGetDate`
* `dictGetDateTime`
* `dictGetUUID`
* `dictGetString`
* `dictGetIPv4`, `dictGetIPv6`

所有这些函数都有带 `OrDefault` 后缀的变体。例如，`dictGetDateOrDefault`。

语法：

```sql
dictGet[Type]('dict_name', 'attr_name', id_expr)
dictGet[Type]OrDefault('dict_name', 'attr_name', id_expr, default_value_expr)
```

**参数**

* `dict_name` — 字典名称。[字符串字面量](/sql-reference/syntax#string)。
* `attr_name` — 字典中列的名称。[字符串字面量](/sql-reference/syntax#string)。
* `id_expr` — 键的值。[表达式](/sql-reference/syntax#expressions)，根据字典配置返回 [UInt64](../data-types/int-uint.md) 或 [Tuple](../data-types/tuple.md) 类型的值。
* `default_value_expr` — 当字典中不包含键为 `id_expr` 的行时返回的值。[表达式](/sql-reference/syntax#expressions)，返回的数据类型为 `attr_name` 属性所配置的数据类型。

**返回值**

* 如果 ClickHouse 能够按照[属性的数据类型](/sql-reference/dictionaries#dictionary-key-and-fields)成功解析该属性，函数将返回与 `id_expr` 对应的字典属性值。

* 如果字典中不存在请求的 `id_expr`，则：

  * `dictGet[Type]` 返回在字典配置中为该属性指定的 `<null_value>` 元素的内容。
  * `dictGet[Type]OrDefault` 返回作为 `default_value_expr` 参数传入的值。

如果 ClickHouse 无法解析该属性的值，或该值与属性的数据类型不匹配，则会抛出异常。


## 示例字典 {#example-dictionary}

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

  向输入表插入数据：

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
  <summary>分层字典示例</summary>

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

  -- 0（根）
  -- └── 1（第 1 层 - 节点 1）
  --     ├── 2（第 2 层 - 节点 2）
  --     │   ├── 4（第 3 层 - 节点 4）
  --     │   └── 5（第 3 层 - 节点 5）
  --     └── 3（第 2 层 - 节点 3）
  --         └── 6（第 3 层 - 节点 6）
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
  下列标签内的内容会在文档框架构建过程中，
  被 system.functions 生成的文档所替换。
  请不要修改或删除这些标签。
  参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
