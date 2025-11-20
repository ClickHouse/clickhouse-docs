[`Nullable` 列](/sql-reference/data-types/nullable/)（例如 `Nullable(String)`）会创建一个单独的 `UInt8` 类型列。每次用户使用 Nullable 列时，都必须处理这个额外的列。这会导致额外的存储空间占用，并且几乎总是会对性能产生负面影响。

为避免使用 `Nullable` 列，可以考虑为该列设置一个默认值。例如，可以这样做，而不是：

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

请根据自身的使用场景进行判断；默认值可能并不适用。
