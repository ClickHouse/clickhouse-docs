---
'description': 'Documentation for Functions for Working with Dictionaries'
'sidebar_label': '字典'
'sidebar_position': 50
'slug': '/sql-reference/functions/ext-dict-functions'
'title': 'Functions for Working with Dictionaries'
---




# 处理字典的函数

:::note
对于通过 [DDL 查询](../../sql-reference/statements/create/dictionary.md) 创建的字典，`dict_name` 参数必须完全指定，例如 `<database>.<dict_name>`。否则，将使用当前数据库。
:::

有关连接和配置字典的信息，请参见 [字典](../../sql-reference/dictionaries/index.md)。

## dictGet, dictGetOrDefault, dictGetOrNull {#dictget-dictgetordefault-dictgetornull}

从字典中检索值。

```sql
dictGet('dict_name', attr_names, id_expr)
dictGetOrDefault('dict_name', attr_names, id_expr, default_value_expr)
dictGetOrNull('dict_name', attr_name, id_expr)
```

**参数**

- `dict_name` — 字典的名称。 [字符串文字](/sql-reference/syntax#string)。
- `attr_names` — 字典列的名称， [字符串文字](/sql-reference/syntax#string)，或列名称的元组， [元组](/sql-reference/data-types/tuple)([字符串文字](/sql-reference/syntax#string)。
- `id_expr` — 键值。 [表达式](/sql-reference/syntax#expressions)，返回字典键类型的值或 [元组](../data-types/tuple.md) 类型的值，具体取决于字典配置。
- `default_value_expr` — 如果字典中不包含 `id_expr` 键的行，则返回的值。 [表达式](/sql-reference/syntax#expressions) 或 [元组](../data-types/tuple.md)([表达式](/sql-reference/syntax#expressions))，返回 `attr_names` 属性配置的数据类型中的值（或值的集合）。

**返回值**

- 如果 ClickHouse 成功解析了 [属性的数据类型](/sql-reference/dictionaries#dictionary-key-and-fields) 中的属性，函数将返回与 `id_expr` 对应的字典属性的值。

- 如果在字典中没有与 `id_expr` 对应的键，则：

        - `dictGet` 返回字典配置中为该属性指定的 `<null_value>` 元素的内容。
        - `dictGetOrDefault` 返回作为 `default_value_expr` 参数传递的值。
        - `dictGetOrNull` 在未找到键的情况下返回 `NULL`。

如果 ClickHouse 无法解析属性的值或值与属性数据类型不匹配，则会抛出异常。

**简单键字典的示例**

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

**复杂键字典的示例**

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

**范围键字典的示例**

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

**另见**

- [字典](../../sql-reference/dictionaries/index.md)

## dictHas {#dicthas}

检查字典中是否存在某个键。

```sql
dictHas('dict_name', id_expr)
```

**参数**

- `dict_name` — 字典的名称。 [字符串文字](/sql-reference/syntax#string)。
- `id_expr` — 键值。 [表达式](/sql-reference/syntax#expressions)，返回字典键类型的值或 [元组](../data-types/tuple.md) 类型的值，具体取决于字典配置。

**返回值**

- 0，如果没有键。 [UInt8](../data-types/int-uint.md)。
- 1，如果存在键。 [UInt8](../data-types/int-uint.md)。

## dictGetHierarchy {#dictgethierarchy}

创建一个数组，包含在 [层次字典](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries) 中某个键的所有父级。

**语法**

```sql
dictGetHierarchy('dict_name', key)
```

**参数**

- `dict_name` — 字典的名称。 [字符串文字](/sql-reference/syntax#string)。
- `key` — 键值。 [表达式](/sql-reference/syntax#expressions)，返回 [UInt64](../data-types/int-uint.md) 类型的值。

**返回值**

- 键的父级。 [数组(UInt64)](../data-types/array.md)。

## dictIsIn {#dictisin}

在字典中检查某个键通过整个层次链的祖先。

```sql
dictIsIn('dict_name', child_id_expr, ancestor_id_expr)
```

**参数**

- `dict_name` — 字典的名称。 [字符串文字](/sql-reference/syntax#string)。
- `child_id_expr` — 需要检查的键。 [表达式](/sql-reference/syntax#expressions)，返回 [UInt64](../data-types/int-uint.md) 类型的值。
- `ancestor_id_expr` — `child_id_expr` 键的声称祖先。 [表达式](/sql-reference/syntax#expressions)，返回 [UInt64](../data-types/int-uint.md) 类型的值。

**返回值**

- 0，如果 `child_id_expr` 不是 `ancestor_id_expr` 的子级。 [UInt8](../data-types/int-uint.md)。
- 1，如果 `child_id_expr` 是 `ancestor_id_expr` 的子级，或者如果 `child_id_expr` 是 `ancestor_id_expr`。 [UInt8](../data-types/int-uint.md)。

## dictGetChildren {#dictgetchildren}

返回第一层子级作为索引数组。这是 [dictGetHierarchy](#dictgethierarchy) 的逆变换。

**语法**

```sql
dictGetChildren(dict_name, key)
```

**参数**

- `dict_name` — 字典的名称。 [字符串文字](/sql-reference/syntax#string)。
- `key` — 键值。 [表达式](/sql-reference/syntax#expressions)，返回 [UInt64](../data-types/int-uint.md) 类型的值。

**返回值**

- 第一层子代的键。 [数组](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**示例**

考虑以下分层字典：

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```

第一层子级：

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

返回所有子代，就像应用了 `dictGetChildren` 函数 `level` 次递归一样。

**语法**

```sql
dictGetDescendants(dict_name, key, level)
```

**参数**

- `dict_name` — 字典的名称。 [字符串文字](/sql-reference/syntax#string)。
- `key` — 键值。 [表达式](/sql-reference/syntax#expressions)，返回 [UInt64](../data-types/int-uint.md) 类型的值。
- `level` — 层级。如果 `level = 0`，则返回所有子代。 [UInt8](../data-types/int-uint.md)。

**返回值**

- 键的子代。 [数组](../data-types/array.md)([UInt64](../data-types/int-uint.md))。

**示例**

考虑以下分层字典：

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```
所有子代：

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

第一层子代：

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

检索在 [正则表达式树字典](../../sql-reference/dictionaries/index.md#regexp-tree-dictionary) 中与每个键匹配的所有节点的属性值。

此函数返回类型为 `Array(T)` 的值，而不是 `T`，其余行为类似于 [`dictGet`](#dictget-dictgetordefault-dictgetornull)。

**语法**

```sql
dictGetAll('dict_name', attr_names, id_expr[, limit])
```

**参数**

- `dict_name` — 字典的名称。 [字符串文字](/sql-reference/syntax#string)。
- `attr_names` — 字典列的名称，[字符串文字](/sql-reference/syntax#string)，或列名称的元组， [元组](/sql-reference/data-types/tuple)([字符串文字](/sql-reference/syntax#string))。
- `id_expr` — 键值。 [表达式](/sql-reference/syntax#expressions)，返回字典键类型的数组值或 [元组](../data-types/tuple) 类型的值，具体取决于字典配置。
- `limit` - 返回的每个值数组的最大长度。当截断时，子节点优先于父节点，且顺序遵循正则表达式树字典中定义的列表顺序。如果未指定，数组长度不受限制。

**返回值**

- 如果 ClickHouse 成功解析了字典中定义的属性的数据类型，返回与 `id_expr` 对应的字典属性值数组。

- 如果字典中没有与 `id_expr` 对应的键，则返回一个空数组。

如果 ClickHouse 无法解析属性的值或其值与属性数据类型不匹配，则会抛出异常。

**示例**

考虑以下正则表达式树字典：

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

获取最多 2 个匹配值：

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2);
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2)─┐
│ ['foo_attr','bar_attr']                          │
└──────────────────────────────────────────────────┘
```

## 其他函数 {#other-functions}

ClickHouse 支持专门的函数，将字典属性值转换为特定数据类型，而不管字典配置如何。

函数：

- `dictGetInt8`, `dictGetInt16`, `dictGetInt32`, `dictGetInt64`
- `dictGetUInt8`, `dictGetUInt16`, `dictGetUInt32`, `dictGetUInt64`
- `dictGetFloat32`, `dictGetFloat64`
- `dictGetDate`
- `dictGetDateTime`
- `dictGetUUID`
- `dictGetString`
- `dictGetIPv4`, `dictGetIPv6`

所有这些函数都有 `OrDefault` 修改。例如，`dictGetDateOrDefault`。

语法：

```sql
dictGet[Type]('dict_name', 'attr_name', id_expr)
dictGet[Type]OrDefault('dict_name', 'attr_name', id_expr, default_value_expr)
```

**参数**

- `dict_name` — 字典的名称。 [字符串文字](/sql-reference/syntax#string)。
- `attr_name` — 字典列的名称。 [字符串文字](/sql-reference/syntax#string)。
- `id_expr` — 键值。 [表达式](/sql-reference/syntax#expressions)，返回 [UInt64](../data-types/int-uint.md) 或 [元组](../data-types/tuple.md) 类型的值，具体取决于字典配置。
- `default_value_expr` — 如果字典中不包含与 `id_expr` 键对应的行，则返回的值。 [表达式](/sql-reference/syntax#expressions)，返回 `attr_name` 属性配置的数据类型中的值。

**返回值**

- 如果 ClickHouse 成功解析了 [属性的数据类型](/sql-reference/dictionaries#dictionary-key-and-fields)，函数将返回与 `id_expr` 对应的字典属性值。

- 如果字典中没有请求的 `id_expr`，则：

        - `dictGet[Type]` 返回字典配置中为该属性指定的 `<null_value>` 元素的内容。
        - `dictGet[Type]OrDefault` 返回作为 `default_value_expr` 参数传递的值。

如果 ClickHouse 无法解析属性的值或其值与属性数据类型不匹配，则会抛出异常。
