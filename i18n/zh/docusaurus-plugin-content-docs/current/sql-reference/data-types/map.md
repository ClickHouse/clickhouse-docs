---
description: 'ClickHouse 中 Map 数据类型文档'
sidebar_label: 'Map(K, V)'
sidebar_position: 36
slug: /sql-reference/data-types/map
title: 'Map(K, V)'
doc_type: 'reference'
---

# Map(K, V) {#mapk-v}

数据类型 `Map(K, V)` 用于存储键值对。

与其他数据库不同，在 ClickHouse 中 Map 中的键不要求唯一，也就是说，一个 Map 可以包含两个具有相同键的元素。
（这是因为 Map 在内部实现为 `Array(Tuple(K, V))`。）

你可以使用语法 `m[k]` 来获取 Map `m` 中键 `k` 对应的值。
同时，`m[k]` 会顺序扫描整个 Map，即该操作的运行时间与 Map 的大小成线性关系。

**参数**

* `K` — Map 键的类型。除 [Nullable](../../sql-reference/data-types/nullable.md) 和嵌套了 [Nullable](../../sql-reference/data-types/nullable.md) 类型的 [LowCardinality](../../sql-reference/data-types/lowcardinality.md) 之外，可以是任意类型。
* `V` — Map 值的类型。可以是任意类型。

**示例**

创建一个包含 Map 类型列的表：

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':1, 'key2':10}), ({'key1':2,'key2':20}), ({'key1':3,'key2':30});
```

若要选择 `key2` 的值：

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

如果访问的键 `k` 不在 map 中，`m[k]` 会返回该值类型的默认值，例如整数类型为 `0`，字符串类型为 `''`。
要检查某个键是否存在于 map 中，可以使用函数 [mapContains](../../sql-reference/functions/tuple-map-functions#mapcontains)。

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

## 将 Tuple 转换为 Map {#converting-tuple-to-map}

类型为 `Tuple()` 的值可以通过函数 [CAST](/sql-reference/functions/type-conversion-functions#cast) 转换为 `Map()` 类型的值：

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

## 读取 Map 的子列 {#reading-subcolumns-of-map}

在某些情况下，为了避免读取整个 Map，你可以使用 `keys` 和 `values` 这两个子列。

**示例**

查询：

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE = Memory;
INSERT INTO tab VALUES (map('key1', 1, 'key2', 2, 'key3', 3));

SELECT m.keys FROM tab; --   等同于 mapKeys(m)
SELECT m.values FROM tab; -- 等同于 mapValues(m)
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

**另请参阅**

* [map()](/sql-reference/functions/tuple-map-functions#map) 函数
* [CAST()](/sql-reference/functions/type-conversion-functions#cast) 函数
* [用于 Map 数据类型的 -Map 组合器](../aggregate-functions/combinators.md#-map)

## 相关内容 {#related-content}

- 博客：[使用 ClickHouse 构建可观测性解决方案 - 第 2 部分 - 链路追踪](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
