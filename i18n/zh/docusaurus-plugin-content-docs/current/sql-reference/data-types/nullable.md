---
description: 'ClickHouse 中 Nullable 数据类型修饰符文档'
sidebar_label: 'Nullable(T)'
sidebar_position: 44
slug: /sql-reference/data-types/nullable
title: 'Nullable(T)'
doc_type: 'reference'
---



# Nullable(T)

允许在 `T` 类型的正常值之外，额外存储表示“缺失值”的特殊标记（[NULL](../../sql-reference/syntax.md)）。例如，类型为 `Nullable(Int8)` 的列既可以存储 `Int8` 类型的值，而没有值的行则会存储 `NULL`。

`T` 不能是以下复合数据类型之一：[Array](../../sql-reference/data-types/array.md)、[Map](../../sql-reference/data-types/map.md) 和 [Tuple](../../sql-reference/data-types/tuple.md)，但复合数据类型可以包含 `Nullable` 类型的值，例如 `Array(Nullable(Int8))`。

`Nullable` 类型的字段不能用于表索引中。

除非在 ClickHouse 服务器配置中另有指定，对于任意 `Nullable` 类型，`NULL` 是其默认值。



## 存储特性 {#storage-features}

为了在表的列中存储 `Nullable` 类型的值，ClickHouse 除了用于存储实际值的普通文件外，还会使用一个单独的 `NULL` 掩码文件。掩码文件中的条目使 ClickHouse 能够区分每一行中该数据类型的 `NULL` 值和其默认值。由于需要额外的文件，`Nullable` 列相比类似的普通列会消耗更多的存储空间。

:::note    
使用 `Nullable` 几乎总是会对性能产生负面影响，在设计数据库时请牢记这一点。
:::



## 查找 NULL

可以通过使用 `null` 子列，在无需读取整个列的情况下查找列中的 `NULL` 值。当对应的值为 `NULL` 时返回 `1`，否则返回 `0`。

**示例**

查询：

```sql
CREATE TABLE nullable (`n` Nullable(UInt32)) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO nullable VALUES (1) (NULL) (2) (NULL);

SELECT n.null FROM nullable;
```

结果：

```text
┌─n.null─┐
│      0 │
│      1 │
│      0 │
│      1 │
└────────┘
```


## 使用示例

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE TinyLog
```

```sql
INSERT INTO t_null VALUES (1, NULL), (2, 3)
```

```sql
SELECT x + y FROM t_null
```

```text
┌─plus(x, y)─┐
│       ᴺᵁᴸᴸ │
│          5 │
└────────────┘
```
