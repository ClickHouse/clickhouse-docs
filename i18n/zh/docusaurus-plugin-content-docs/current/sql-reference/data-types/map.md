---
'description': 'ClickHouse 中 Map 数据类型的文档'
'sidebar_label': 'Map(K, V)'
'sidebar_position': 36
'slug': '/sql-reference/data-types/map'
'title': 'Map(K, V)'
'doc_type': 'reference'
---


# Map(K, V)

数据类型 `Map(K, V)` 存储键值对。

与其他数据库不同，ClickHouse 中的映射不是唯一的，即一个映射可以包含两个具有相同键的元素。
（原因是映射在内部实现为 `Array(Tuple(K, V))`。）

您可以使用语法 `m[k]` 获取映射 `m` 中键 `k` 的值。
此外，`m[k]` 会扫描该映射，即该操作的运行时间与映射的大小成线性关系。

**参数**

- `K` — 映射键的类型。任意类型，但不能是 [Nullable](../../sql-reference/data-types/nullable.md) 和 [LowCardinality](../../sql-reference/data-types/lowcardinality.md) 嵌套于 [Nullable](../../sql-reference/data-types/nullable.md) 类型。
- `V` — 映射值的类型。任意类型。

**示例**

创建一个包含映射类型列的表：

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':1, 'key2':10}), ({'key1':2,'key2':20}), ({'key1':3,'key2':30});
```

选择 `key2` 值：

```sql
SELECT m['key2'] FROM tab;
```

结果：

```text
┌─arrayElement(m, 'key2')─┐
│                      10 │
│                      20 │
│                      30 │
└─────────────────────────┘
```

如果请求的键 `k` 不在映射中，`m[k]` 返回值类型的默认值，例如，整数类型返回 `0`，字符串类型返回 `''`。
要检查键是否存在于映射中，可以使用函数 [mapContains](../../sql-reference/functions/tuple-map-functions#mapcontains)。

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':100}), ({});
SELECT m['key1'] FROM tab;
```

结果：

```text
┌─arrayElement(m, 'key1')─┐
│                     100 │
│                       0 │
└─────────────────────────┘
```

## 将元组转换为映射 {#converting-tuple-to-map}

类型为 `Tuple()` 的值可以通过函数 [CAST](/sql-reference/functions/type-conversion-functions#cast) 转换为类型为 `Map()` 的值：

**示例**

查询：

```sql
SELECT CAST(([1, 2, 3], ['Ready', 'Steady', 'Go']), 'Map(UInt8, String)') AS map;
```

结果：

```text
┌─map───────────────────────────┐
│ {1:'Ready',2:'Steady',3:'Go'} │
└───────────────────────────────┘
```

## 读取映射的子列 {#reading-subcolumns-of-map}

为避免读取整个映射，您可以在某些情况下使用子列 `keys` 和 `values`。

**示例**

查询：

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE = Memory;
INSERT INTO tab VALUES (map('key1', 1, 'key2', 2, 'key3', 3));

SELECT m.keys FROM tab; --   same as mapKeys(m)
SELECT m.values FROM tab; -- same as mapValues(m)
```

结果：

```text
┌─m.keys─────────────────┐
│ ['key1','key2','key3'] │
└────────────────────────┘

┌─m.values─┐
│ [1,2,3]  │
└──────────┘
```

**另见**

- [map()](/sql-reference/functions/tuple-map-functions#map) 函数
- [CAST()](/sql-reference/functions/type-conversion-functions#cast) 函数
- [-Map组合器用于Map数据类型](../aggregate-functions/combinators.md#-map)

## 相关内容 {#related-content}

- 博客: [使用ClickHouse构建可观察性解决方案 - 第2部分 - 跟踪](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
