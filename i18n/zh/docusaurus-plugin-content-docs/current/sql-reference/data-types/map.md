---
description: 'ClickHouse 中 Map 数据类型文档'
sidebar_label: 'Map(K, V)'
sidebar_position: 36
slug: /sql-reference/data-types/map
title: 'Map(K, V)'
doc_type: 'reference'
---

# Map(K, V) \{#mapk-v\}

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

要查询 `key2` 的值：

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
要检查某个键是否存在于 map 中，可以使用函数 [mapContains](/sql-reference/functions/tuple-map-functions#mapContainsKey)。

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


## 将 Tuple 转换为 Map \{#converting-tuple-to-map\}

类型为 `Tuple()` 的值可以通过函数 [CAST](/sql-reference/functions/type-conversion-functions#CAST) 转换为 `Map()` 类型的值：

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


## 读取 Map 的子列 \{#reading-subcolumns-of-map\}

在某些情况下，为了避免读取整个 Map，你可以使用 `keys` 和 `values` 这两个子列。

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


## MergeTree 中的 Map 分桶序列化 \{#bucketed-map-serialization\}

默认情况下，MergeTree 中的 `Map` 列以单个 `Array(Tuple(K, V))` 流的形式存储。
使用 `m['key']` 读取单个键时，需要扫描整个列——也就是每一行中的所有键值对——即使只需要一个键也是如此。
对于包含大量不同键的映射，这会成为性能瓶颈。

分桶序列化 (`with_buckets`) 会根据键的哈希值，将键值对拆分为多个彼此独立的子流 (存储桶) 。
当查询访问 `m['key']` 时，只会从磁盘读取包含该键的那个存储桶，跳过其他所有存储桶。

### 启用分桶序列化 \{#enabling-bucketed-serialization\}

```sql
CREATE TABLE tab (id UInt64, m Map(String, UInt64))
ENGINE = MergeTree ORDER BY id
SETTINGS
    map_serialization_version = 'with_buckets',
    max_buckets_in_map = 32,
    map_buckets_strategy = 'sqrt';
```

为避免插入操作变慢，您可以对零级 parts (在 `INSERT` 时创建) 保留 `basic` 序列化，并且仅对已合并parts使用 `with_buckets`：

```sql
CREATE TABLE tab (id UInt64, m Map(String, UInt64))
ENGINE = MergeTree ORDER BY id
SETTINGS
    map_serialization_version = 'with_buckets',
    map_serialization_version_for_zero_level_parts = 'basic',
    max_buckets_in_map = 32,
    map_buckets_strategy = 'sqrt';
```


### 工作原理 \{#how-it-works\}

当数据parts以 `with_buckets` 序列化方式写入时：

1. 根据数据块统计信息计算每行的平均键数。
2. 存储桶的数量由配置的策略决定 (参阅 [设置](#bucketed-map-settings)) 。
3. 通过对键进行哈希，每个键值对都会被分配到某个存储桶：`bucket = hash(key) % num_buckets`。
4. 每个存储桶都作为独立的子流存储，拥有各自的键、值和偏移量。
5. `buckets_info` 元数据流会记录存储桶数量及统计信息。

当查询读取特定键 (`m['key']`) 时，优化器会将该表达式重写为键子列 (`m.key_<serialized_key>`) 。
序列化层会计算请求的键属于哪个存储桶，并且只从磁盘读取这一个存储桶。

读取完整 Map 时 (例如 `SELECT m`) ，会读取所有存储桶，并将其重新组装为原始 Map。由于读取和合并多个子流的开销，这比 `basic` 序列化更慢。

:::note
使用 `with_buckets` 序列化时，Map 值内部键的顺序可能与原始插入顺序不同。键会按哈希分布到各个存储桶中，并按存储桶顺序而非插入顺序重新组装。使用 `basic` 序列化时，插入的 Map 中的键顺序会被保持。
:::

不同 parts 之间的存储桶数量可能不同。合并存储桶数量不同的 parts 时，新parts的存储桶数量会根据合并后的统计信息重新计算。采用 `basic` 和 `with_buckets` 序列化的 parts 可以在同一张表中共存，并会被透明地合并。

### 设置 \{#bucketed-map-settings\}

| 设置项                                              | 默认值     | 描述                                                                                                                                                                                                |
| ------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map_serialization_version`                      | `basic` | `Map` 列的序列化格式。`basic` 将数据存储为单个数组流。`with_buckets` 会将键拆分到多个存储桶中，以加快单键读取。                                                                                                                          |
| `map_serialization_version_for_zero_level_parts` | `basic` | 零级 parts (由 `INSERT` 创建) 的序列化格式。这样可以让插入时继续使用 `basic` 以避免写入开销，同时让已合并parts使用 `with_buckets`。                                                                                                       |
| `max_buckets_in_map`                             | `32`    | 存储桶数量的上限。实际数量取决于 `map_buckets_strategy`。允许的最大值为 256。                                                                                                                                            |
| `map_buckets_strategy`                           | `sqrt`  | 根据 map 平均大小计算存储桶数量的策略：`constant` — 始终使用 `max_buckets_in_map`；`sqrt` — 使用 `round(coefficient * sqrt(avg_size))`；`linear` — 使用 `round(coefficient * avg_size)`。结果会被限制在 `[1, max_buckets_in_map]` 范围内。 |
| `map_buckets_coefficient`                        | `1.0`   | `sqrt` 和 `linear` 策略使用的乘数。策略为 `constant` 时会忽略此值。                                                                                                                                                  |
| `map_buckets_min_avg_size`                       | `32`    | 启用分桶所需的每行平均键数下限。如果平均值低于此阈值，则无论其他设置如何，都只使用单个存储桶。设为 `0` 可禁用该阈值。                                                                                                                               |

### 性能权衡 \{#performance-trade-offs\}

下表概述了在不同 Map 大小下 (每行 10 到 10,000 个键) ，`with_buckets` 相比 `basic` 序列化的性能影响。存储桶数量由 `sqrt` 策略确定，最大为 32。具体数值取决于键/值类型、数据分布和硬件。

| 操作                                             | 10 个键       | 100 个键      | 1,000 个键    | 10,000 个键   | 说明                                                                      |
| ---------------------------------------------- | ----------- | ----------- | ----------- | ----------- | ----------------------------------------------------------------------- |
| **单键查找** (`m['key']`)                          | 快 1.6–3.2 倍 | 快 4.5–7.7 倍 | 快 16–39 倍   | 快 21–49 倍   | 只需读取一个存储桶，而不必读取整列。                                                      |
| **5 个键查找**                                     | ~1x         | 快 1.5–3.1 倍 | 快 2.9–8.3 倍 | 快 4.5–6.7 倍 | 每个键读取各自所在的存储桶；某些存储桶可能重叠。                                              |
| **PREWHERE** (`SELECT m WHERE m['key'] = ...`) | 快 1.5–3.0 倍 | 快 2.9–7.3 倍 | 快 5.3–31 倍  | 快 20–45 倍   | PREWHERE 过滤只读取一个存储桶；仅对匹配的行读取完整 Map。加速效果取决于选择性——匹配的粒度块越少，完整 Map 的 I/O 就越少。 |
| **完整 Map 扫描** (`SELECT m`)                     | 慢 ~2 倍      | 慢 ~2 倍      | 慢 ~2 倍      | 慢 ~2 倍      | 必须读取并重新组装所有存储桶。                                                         |
| **INSERT**                                     | 慢 1.5–2.5 倍 | 慢 1.5–2.5 倍 | 慢 1.5–2.5 倍 | 慢 1.5–2.5 倍 | 对键进行哈希并写入多个子流会带来额外开销。                                                   |

### 建议 \{#recommendations\}

* **小型 map (平均 &lt; 32 个键) ：** 保持使用 `basic` 序列化。对于小型 map，分桶的额外开销并不值得。默认值 `map_buckets_min_avg_size = 32` 会自动应用这一规则。
* **中型 map (32–100 个键) ：** 如果查询经常访问单个键，请使用采用 `sqrt` 策略的 `with_buckets`。对于单键查找，速度可提升 4–8 倍。
* **大型 map (100+ 个键) ：** 使用 `with_buckets`。单键查找速度可提升 16–49 倍。可考虑设置 `map_serialization_version_for_zero_level_parts = 'basic'`，以使插入速度接近基准水平。
* **工作负载以完整 map 扫描为主：** 保持使用 `basic`。分桶序列化会使完整扫描的开销增加约 2 倍。
* **混合工作负载 (部分键查找，部分完整扫描) ：** 使用 `with_buckets`，并将零级 parts 设为 `basic`。`PREWHERE` 优化只会读取与过滤器相关的桶，然后仅对匹配的行读取完整 map，因此可显著提升整体速度。

### 其他方案 \{#map-alternatives\}

如果分桶 `Map` 序列化不适合您的用例，还可以采用另外两种方法来提升键级访问性能：

#### 使用 JSON 数据类型 \{#using-the-json-data-type\}

[JSON](/sql-reference/data-types/newjson) 数据类型会将每个高频路径存储为单独的动态子列。超过 `max_dynamic_paths` 限制的路径会进入[共享数据结构](/sql-reference/data-types/newjson#shared-data-structure)，该结构可使用 `advanced` 序列化来优化单路径读取。有关 `advanced` 序列化的详细说明，请参阅这篇[博客文章](https://clickhouse.com/blog/json-data-type-gets-even-better)。

| 方面         | 采用分存储桶的 `Map`                         | `JSON`                                                      |
| ---------- | ------------------------------------- | ----------------------------------------------------------- |
| 单个键读取      | 读取一个存储桶 (其中可能包含其他键) 。该存储桶中的所有键值对都会被反序列化。 | 高频路径可直接从动态子列中读取。低频路径会进入共享数据；使用 `advanced` 序列化时，只会读取目标路径的数据。 |
| 值类型        | 所有值共享同一种类型 `V`                        | 每个路径都可以有自己的类型。没有类型提示的路径使用 `Dynamic`。                        |
| skip 索引支持  | 适用于在 `mapKeys`/`mapValues` 上创建的某些索引类型 | skip 索引只能在特定路径子列上创建，不能同时对所有路径/值创建。                          |
| 整列读取       | 由于需要重新组装存储桶，比 `basic` 大约慢 2 倍         | 会有 `Dynamic` 类型编码和路径重建带来的额外开销。                              |
| 存储开销       | 额外元数据极少                               | 更高，因为需要存储 `Dynamic` 类型编码、路径名称，以及 `advanced` 序列化中的额外元数据。     |
| schema 灵活性 | 在创建表时固定键和值的类型                         | 完全动态——键和值类型可因行而异。可为已知路径声明类型提示。                              |

当不同键需要不同的值类型、各行之间的键集合差异很大，或者已知某些键会被频繁访问并且可以声明为类型化路径以便直接访问子列时，请使用 `JSON`。

#### 手动分片到多个 Map 列中 \{#manual-sharding-into-multiple-map-columns\}

您可以在应用层根据键的 hash，手动将单个 `Map` 拆分到多个列中：

```sql
CREATE TABLE tab (
    id UInt64,
    m0 Map(String, UInt64),
    m1 Map(String, UInt64),
    m2 Map(String, UInt64),
    m3 Map(String, UInt64)
) ENGINE = MergeTree ORDER BY id;
```

插入时，将每个键值对路由到列 `m{hash(key) % 4}`。查询时，从对应的特定列读取：`m{hash('target_key') % 4}['target_key']`。

| 方面        | 带存储桶的 `Map`             | 手动分片                               |
| --------- | ----------------------- | ---------------------------------- |
| 易用性       | 透明——由存储引擎处理             | 需要应用层路由逻辑来执行插入和查询                  |
| 垂直合并      | 尚不支持——所有存储桶都属于同一列       | 支持——每个 `Map` 列都是独立列，可以进行垂直合并       |
| schema 变更 | 存储桶数量会按每个parts自动适配      | 修改分片数量需要重写数据或新增列                   |
| 查询语法      | `m['key']` 可直接使用        | 必须计算正确的列：`m0['key']`、`m1['key']` 等 |
| 存储桶粒度     | 以parts为单位，并会根据数据统计信息自动调整 | 在建表时固定                             |

当垂直合并对于减少包含许多列的表在合并期间的内存使用非常重要时，或者当分片数量必须固定并显式控制时，手动分片更有优势。对于大多数用例，自动分桶序列化更简单，也已足够。

**另请参阅**

* [map()](/sql-reference/functions/tuple-map-functions#map) 函数
* [CAST()](/sql-reference/functions/type-conversion-functions#CAST) 函数
* [用于 Map 数据类型的 -Map 组合器](../aggregate-functions/combinators.md#-map)


## 相关内容 \{#related-content\}

- 博客：[使用 ClickHouse 构建可观测性解决方案 - 第 2 部分 - 链路追踪](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)