[`Nullable` column](/sql-reference/data-types/nullable/) (например, `Nullable(String)`) создает отдельный столбец типа `UInt8`. Этот дополнительный столбец обрабатывается при каждом обращении к столбцу Nullable. Это ведет к дополнительному потреблению дискового пространства и почти всегда негативно сказывается на производительности.

Чтобы избежать столбцов типа `Nullable`, задайте для них значение по умолчанию. Например, вместо:

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

использование

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

Учтите свой сценарий использования: значение по умолчанию может оказаться неподходящим.
