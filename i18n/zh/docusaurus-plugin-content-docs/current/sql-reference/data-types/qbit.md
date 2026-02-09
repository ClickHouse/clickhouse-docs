---
description: 'ClickHouse 中 QBit 数据类型的文档，它通过细粒度量化支持近似向量搜索'
keywords: ['qbit', 'data type']
sidebar_label: 'QBit'
sidebar_position: 64
slug: /sql-reference/data-types/qbit
title: 'QBit 数据类型'
doc_type: 'reference'
---

`QBit` 数据类型通过重组向量的存储方式来加速近似搜索。它并非将每个向量的元素存放在一起，而是将所有向量中相同二进制位位置的数据分组存储。

这种方式在保持向量以完整精度存储的同时，允许你在查询时选择更细粒度的量化级别：读取更少的位可以减少 I/O 并加快计算，而读取更多的位可以提高精度。你可以通过量化获得因数据传输和计算量减少而带来的速度优势，同时在需要时仍然可以访问所有原始数据。

要声明一个 `QBit` 类型的列，请使用以下语法：

```sql
column_name QBit(element_type, dimension)
```

* `element_type` – 每个向量元素的类型。支持的类型包括 `BFloat16`、`Float32` 和 `Float64`。
* `dimension` – 每个向量中的元素数量。


## 创建 QBit \{#creating-qbit\}

在表的列定义中使用 `QBit` 类型：

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


## QBit 子列 \{#qbit-subcolumns\}

`QBit` 实现了一种子列访问模式，允许访问已存储向量的各个位平面。每一个比特位都可以使用 `.N` 语法进行访问，其中 `N` 是该比特位的位置：

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

可访问的子列数量取决于元素类型：

* `BFloat16`：16 个子列（1–16）
* `Float32`：32 个子列（1–32）
* `Float64`：64 个子列（1–64）


## 向量搜索函数 \{#vector-search-functions\}

以下是用于向量相似度搜索且使用 `QBit` 数据类型的距离函数：

* [`L2DistanceTransposed`](../functions/distance-functions.md#L2DistanceTransposed)
* [`cosineDistanceTransposed`](../functions/distance-functions.md#cosineDistanceTransposed)