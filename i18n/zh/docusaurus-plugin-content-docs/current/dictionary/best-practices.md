---
slug: /dictionary/best-practices
title: '字典最佳实践'
sidebar_label: '最佳实践'
description: '有关如何选择字典布局、何时使用字典而非 JOIN，以及如何监控字典使用情况的指南。'
doc_type: 'guide'
keywords: ['字典', '字典', '布局', 'dictGet', 'JOIN', 'hashed', 'flat', '性能']
---

# 字典最佳实践 \{#dictionary-best-practices\}

本页面介绍了选择合适字典布局的实用建议，帮助您了解字典何时优于 JOIN (以及何时并非如此) ，以及如何监控字典的使用情况。

如需了解字典的基础介绍和示例，请参阅[字典主指南](/dictionary)。

## 何时使用字典而不是 JOIN \{#when-to-use-dictionaries-vs-joins\}

当 JOIN 的一侧是可放入内存的查找表时，字典的效果最佳。使用标准 JOIN 时，ClickHouse 会先基于右侧构建哈希表，再用左侧进行探测——即使其中大多数行之后会被 `WHERE` 条件过滤掉。虽然较新版本 (24.12+) 在很多情况下会在 JOIN 之前下推过滤条件，但这并不总能消除这部分开销。使用字典时，你可以内联调用 `dictGet`，因此只有已经通过过滤的行才会执行查找。

不过，`dictGet` 并不总是最佳选择。如果你需要对表中很大比例的行调用 `dictGet`——例如，在 `WHERE` 条件中使用 `dictGet('dict', 'elevation', id) > 1800`——那么使用带原生索引的常规列可能更合适。对于常规列，ClickHouse 可以使用 `PREWHERE` 跳过 granule；但 `dictGet` 是逐行求值的，没有索引支持。

经验法则如下：

* 当查找键已可用，且需要替代针对小型维度表的 JOIN 时，请使用字典。
* 当需要在大量行上按查找到的值进行过滤时，请使用常规列和索引。

## 选择布局 \{#choosing-a-layout\}

`LAYOUT` 子句用于控制字典的内部数据结构。所有可用布局都记录在[布局参考](/sql-reference/statements/create/dictionary/layouts#storing-dictionaries-in-memory)中。

选择布局时，请遵循以下准则：

* **`flat`** — 速度最快的布局 (简单的数组偏移查找) ，但键必须为 `UInt64`，且默认上限为 500,000 (`max_array_size`) 。最适合小到中型表中单调递增的整数键。稀疏的键分布 (例如键值分别为 1 和 500,000) 会浪费内存，因为数组大小是按最大键值分配的。如果你碰到了 500k 上限，通常就说明该切换到 `hashed_array` 了。
* **`hashed_array`** — 适用于大多数使用场景的推荐默认布局。它将属性存储在数组中，并用哈希表将键映射到数组索引。速度几乎与 `hashed` 一样快，但内存效率更高，尤其是在属性较多时。
* **`hashed`** — 将整个字典存储在哈希表中。在属性很少时，它可能比 `hashed_array` 更快；但随着属性数量增加，内存消耗也会更高。
* **`complex_key_hashed` / `complex_key_hashed_array`** — 当键无法转换为 `UInt64` 时使用 (例如 `String` 键) 。它们在性能取舍上与各自的非复杂键版本相同。
* **`sparse_hashed`** — 相比 `hashed`，以更多 CPU 开销换取更低的内存占用。它很少是最佳选择——只有在仅有单个属性时才比较高效。大多数情况下，`hashed_array` 更合适。
* **`cache` / `ssd_cache`** — 只缓存频繁访问的键。当完整数据集无法装入内存时，这种布局很有用；但在缓存未命中时，查找可能会回源。不建议用于对延迟敏感的工作负载。
* **`direct`** — 每次查找都直接查询源，不做任何内存存储。适用于数据变化过于频繁、不适合缓存，或字典大到无法放入内存的情况。

## 监控字典使用情况 \{#monitoring-dictionary-usage\}

通过 [`system.dictionaries`](/operations/system-tables/dictionaries) 表跟踪内存占用和健康状态：

```sql
SELECT
    name,
    status,
    element_count,
    formatReadableSize(bytes_allocated) AS size,
    query_count,
    hit_rate,
    found_rate,
    last_exception
FROM system.dictionaries
```

关键列：

* `bytes_allocated` — 字典占用的内存。字典以未压缩形式存储数据，因此该值可能会明显大于压缩后的表大小。
* `hit_rate` 和 `found_rate` — 可用于评估 `cache` 布局的有效性。
* `last_exception` — 当字典加载或刷新失败时，请检查此项。
