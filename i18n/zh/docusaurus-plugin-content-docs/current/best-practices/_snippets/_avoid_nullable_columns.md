---
{}
---



[`Nullable` 列](/sql-reference/data-types/nullable/) (例如 `Nullable(String)`) 会创建一个独立的 `UInt8` 类型的列。每次用户处理 `Nullable` 列时，都必须处理这个额外的列。这会导致额外的存储空间使用，并且几乎总是对性能产生负面影响。

为了避免使用 `Nullable` 列，可以考虑为该列设置默认值。例如, 不要使用：

```sql
CREATE TABLE default.sample
(
    `x` Int8,
    -- highlight-next-line
    `y` Nullable(Int8)
)
ENGINE = MergeTree
ORDER BY x
```
而是使用

```sql
CREATE TABLE default.sample2
(
    `x` Int8,
    -- highlight-next-line
    `y` Int8 DEFAULT 0
)
ENGINE = MergeTree
ORDER BY x
```

考虑到您的用例，设置默认值可能不合适。
