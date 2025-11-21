[`Nullable` 列](/sql-reference/data-types/nullable/)（例如 `Nullable(String)`）会创建一个单独的 `UInt8` 类型列。每次用户使用 Nullable 列时，都必须处理这个额外的列。这会带来额外的存储开销，并且几乎总是会对性能产生负面影响。

为了避免使用 `Nullable` 列，可以考虑为该列设置默认值。例如，可以使用以下方式来替代：

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

用法

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

请根据您的使用场景进行评估，默认值可能并不适用。
