---
description: 'GenerateRandom 表引擎根据给定的表结构生成随机数据。'
sidebar_label: 'GenerateRandom'
sidebar_position: 140
slug: /engines/table-engines/special/generate
title: 'GenerateRandom 表引擎'
doc_type: 'reference'
---

# GenerateRandom 表引擎 {#generaterandom-table-engine}

`GenerateRandom` 表引擎根据给定的表结构生成随机数据。

使用示例：

- 在测试中用于填充可复现的大规模表数据。
- 为模糊测试（fuzzing）生成随机输入。

## 在 ClickHouse Server 中的使用 {#usage-in-clickhouse-server}

```sql
ENGINE = GenerateRandom([random_seed [,max_string_length [,max_array_length]]])
```

`max_array_length` 和 `max_string_length` 参数分别指定在生成的数据中，所有数组或 map 列以及字符串的最大长度。

`Generate` 表引擎仅支持 `SELECT` 查询。

它支持所有可以存储在表中的 [DataTypes](../../../sql-reference/data-types/index.md)，`AggregateFunction` 类型除外。

## 示例 {#example}

**1.** 创建 `generate_engine_table` 表：

```sql
CREATE TABLE generate_engine_table (name String, value UInt32) ENGINE = GenerateRandom(1, 5, 3)
```

**2.** 查询数据：

```sql
SELECT * FROM generate_engine_table LIMIT 3
```

```text
┌─name─┬──────value─┐
│ c4xJ │ 1412771199 │
│ r    │ 1791099446 │
│ 7#$  │  124312908 │
└──────┴────────────┘
```

## 实现细节 {#details-of-implementation}

- 不支持：
  - `ALTER`
  - `SELECT ... SAMPLE`
  - `INSERT`
  - 索引
  - 复制
