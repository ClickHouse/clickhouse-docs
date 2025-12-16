---
description: '介绍 ClickHouse 中 QBit 数据类型的文档，该类型支持用于近似向量搜索的细粒度量化'
keywords: ['qbit', '数据类型']
sidebar_label: 'QBit'
sidebar_position: 64
slug: /sql-reference/data-types/qbit
title: 'QBit 数据类型'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge />

`QBit` 数据类型通过重新组织向量的存储方式来加速近似搜索。它不是将每个向量的所有元素存放在一起，而是把所有向量中相同二进制位的位置分组存储。
这种方式在保持向量以全精度存储的同时，允许你在查询时选择细粒度的量化级别：读取更少的比特位可减少 I/O 并加快计算，读取更多比特位则可提高精度。你既能获得量化带来的数据传输和计算开销降低的速度优势，又能在需要时访问所有原始数据。

:::note
`QBit` 数据类型及其相关的距离函数目前为实验性功能。
要启用它们，请先执行 `SET allow_experimental_qbit_type = 1`。
如果你遇到问题，请在 [ClickHouse 仓库](https://github.com/clickhouse/clickhouse/issues) 中提交 issue。
:::

要声明一个 `QBit` 类型的列，请使用以下语法：

```sql
column_name QBit(element_type, dimension)
```

* `element_type` – 每个向量元素的类型。允许的类型包括 `BFloat16`、`Float32` 和 `Float64`。
* `dimension` – 每个向量中的元素数量。

## 创建 QBit {#creating-qbit}

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

## QBit 子列 {#qbit-subcolumns}

`QBit` 实现了一种子列访问模式，允许你访问已存储向量的各个位平面。每个比特位都可以使用 `.N` 语法进行访问，其中 `N` 是该比特位的位置：

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

* `BFloat16`: 16 个子列（1-16）
* `Float32`: 32 个子列（1-32）
* `Float64`: 64 个子列（1-64）

## 向量搜索函数 {#vector-search-functions}

以下是使用 `QBit` 数据类型进行向量相似度搜索的距离函数：

* [`L2DistanceTransposed`](../functions/distance-functions.md#L2DistanceTransposed)
