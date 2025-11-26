[`Nullable` 列](/sql-reference/data-types/nullable/)（例如 `Nullable(String)`）会创建一个单独的 `UInt8` 类型的列。每当用户对 Nullable 列进行操作时，都必须处理这个额外的列。这会占用额外的存储空间，并且几乎总会对性能产生负面影响。

为避免使用 `Nullable` 列，可以考虑为该列设置一个默认值。例如，可以使用以下方式来替代：

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

请结合你的使用场景进行评估，默认值可能并不适用。
