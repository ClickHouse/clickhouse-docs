---
'description': 'ClickHouse 中 QBit 数据类型的文档，它允许对近似向量搜索进行细粒度量化'
'keywords':
- 'qbit'
- 'data type'
'sidebar_label': 'QBit'
'sidebar_position': 64
'slug': '/sql-reference/data-types/qbit'
'title': 'QBit 数据类型'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

`QBit` 数据类型重新组织了向量存储，以便进行更快速的近似搜索。它不是将每个向量的元素一起存储，而是将所有向量中相同的二进制位位置分组。这可以以全精度存储向量，同时让你选择搜索时的细粒度量化级别：读取 fewer bits 以减少 I/O 和加快计算，或者读取更多 bits 以提高准确性。你将获得量化带来的数据传输和计算的速度优势，但所有原始数据在需要时依然可用。

:::note
`QBit` 数据类型及其相关的距离函数目前仍处于实验阶段。
要启用它们，请首先运行 `SET allow_experimental_qbit_type = 1`。
如果遇到问题，请在 [ClickHouse 代码库](https://github.com/clickhouse/clickhouse/issues) 中打开一个问题。
:::

要声明一个 `QBit` 类型的列，请使用以下语法：

```sql
column_name QBit(element_type, dimension)
```

* `element_type` – 每个向量元素的类型。允许的类型有 `BFloat16`、`Float32` 和 `Float64`
* `dimension` – 每个向量中的元素数量

## 创建 QBit {#creating-qbit}

在表列定义中使用 `QBit` 类型：

```sql
CREATE TABLE test (id UInt32, vec QBit(Float32, 8)) ENGINE = Memory;
INSERT INTO test VALUES (1, [1, 2, 3, 4, 5, 6, 7, 8]), (2, [9, 10, 11, 12, 13, 14, 15, 16]);
SELECT vec FROM test ORDER BY id;
```

```text
┌─vec──────────────────────┐
│ [1,2,3,4,5,6,7,8]        │
│ [9,10,11,12,13,14,15,16] │
└──────────────────────────┘
```

## QBit 子列 {#qbit-subcolumns}

`QBit` 实现了一种子列访问模式，允许你访问存储向量的单个位平面。可以使用 `.N` 语法访问每个比特位置，其中 `N` 是比特位置：

```sql
CREATE TABLE test (id UInt32, vec QBit(Float32, 8)) ENGINE = Memory;
INSERT INTO test VALUES (1, [0, 0, 0, 0, 0, 0, 0, 0]);
INSERT INTO test VALUES (1, [-0, -0, -0, -0, -0, -0, -0, -0]);
SELECT bin(vec.1) FROM test;
```

```text
┌─bin(tupleElement(vec, 1))─┐
│ 00000000                  │
│ 11111111                  │
└───────────────────────────┘
```

可访问的子列数取决于元素类型：

* `BFloat16`: 16 个子列 (1-16)
* `Float32`: 32 个子列 (1-32)
* `Float64`: 64 个子列 (1-64)

## 向量搜索函数 {#vector-search-functions}

这些是使用 `QBit` 数据类型进行向量相似度搜索的距离函数：

* [`L2DistanceTransposed`](../functions/distance-functions.md#L2DistanceTransposed)
