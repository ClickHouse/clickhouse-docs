---
null
...
---

[`Nullable` 列](/sql-reference/data-types/nullable/)（例如 `Nullable(String)`）会创建一个额外的 `UInt8` 类型的列。每次用户处理 Nullable 列时，都必须处理这个附加列。这会导致额外的存储空间使用，并几乎总是对性能产生负面影响。

为了避免使用 `Nullable` 列，请考虑为该列设置一个默认值。例如，可以使用以下代码替代：

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
use

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

请考虑您的用例，默认值可能并不合适。
