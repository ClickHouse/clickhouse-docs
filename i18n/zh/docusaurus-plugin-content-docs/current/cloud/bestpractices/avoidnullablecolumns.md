---
slug: /cloud/bestpractices/avoid-nullable-columns
sidebar_label: 避免 Nullable 列
title: 避免 Nullable 列
---

[`Nullable` 列](/sql-reference/data-types/nullable/) (例如 `Nullable(String)`) 会创建一个单独的 `UInt8` 类型的列。每当用户处理一个可空列时，必须处理这个附加列。这导致额外的存储空间使用，并几乎总是会对性能产生负面影响。

为了避免使用 `Nullable` 列，请考虑为该列设置默认值。例如，代替：

```sql
CREATE TABLE default.sample
(
    `x` Int8,
    # highlight-next-line
    `y` Nullable(Int8)
)
ENGINE = MergeTree
ORDER BY x
```
可以使用

```sql
CREATE TABLE default.sample2
(
    `x` Int8,
    # highlight-next-line
    `y` Int8 DEFAULT 0
)
ENGINE = MergeTree
ORDER BY x
```

:::note
请考虑您的使用场景，默认值可能不合适。
:::
