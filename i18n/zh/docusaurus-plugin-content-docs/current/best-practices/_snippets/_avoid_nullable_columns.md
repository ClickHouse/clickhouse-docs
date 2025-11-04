[`Nullable` 列](/sql-reference/data-types/nullable/) (例如 `Nullable(String)`) 会创建一个额外的 `UInt8` 类型的列。每当用户处理 `Nullable` 列时，必须处理此附加列。这会导致额外的存储空间占用，并几乎总是对性能产生负面影响。

为了避免使用 `Nullable` 列，请考虑为该列设置默认值。例如，代替：

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
使用

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

考虑您的用例，默认值可能不合适。
