---
slug: /sql-reference/data-types/nullable
sidebar_position: 44
sidebar_label: Nullable(T)
---


# Nullable(T)

允许在正常的 `T` 允许的值旁边存储特殊标记 ([NULL](../../sql-reference/syntax.md))，表示“缺失的值”。例如，一个 `Nullable(Int8)` 类型的列可以存储 `Int8` 类型的值，而没有值的行将存储 `NULL`。

`T` 不能是任何复合数据类型，如 [Array](../../sql-reference/data-types/array.md)、[Map](../../sql-reference/data-types/map.md) 和 [Tuple](../../sql-reference/data-types/tuple.md)，但复合数据类型可以包含 `Nullable` 类型的值，例如 `Array(Nullable(Int8))`。

`Nullable` 类型的字段不能包括在表索引中。

除非在 ClickHouse 服务器配置中另有指定，否则 `NULL` 是所有 `Nullable` 类型的默认值。

## Storage Features {#storage-features}

要在表列中存储 `Nullable` 类型的值，ClickHouse 使用一个单独的文件和一个包含值的普通文件，文件中包含 `NULL` 掩码。掩码文件中的条目允许 ClickHouse 区分每个表行中的 `NULL` 和相应数据类型的默认值。由于有了额外的文件，与类似的普通列相比，`Nullable` 列消耗了额外的存储空间。

:::note    
使用 `Nullable` 几乎总会对性能产生负面影响，请在设计数据库时记住这一点。
:::

## Finding NULL {#finding-null}

可以通过使用 `null` 子列来查找列中的 `NULL` 值，而无需读取整个列。如果相应的值为 `NULL`，则返回 `1`，否则返回 `0`。

**示例**

查询：

``` sql
CREATE TABLE nullable (`n` Nullable(UInt32)) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO nullable VALUES (1) (NULL) (2) (NULL);

SELECT n.null FROM nullable;
```

结果：

``` text
┌─n.null─┐
│      0 │
│      1 │
│      0 │
│      1 │
└────────┘
```

## Usage Example {#usage-example}

``` sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE TinyLog
```

``` sql
INSERT INTO t_null VALUES (1, NULL), (2, 3)
```

``` sql
SELECT x + y FROM t_null
```

``` text
┌─plus(x, y)─┐
│       ᴺᵁᴸᴸ │
│          5 │
└────────────┘
```
