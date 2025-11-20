[`Nullable`-столбец](/sql-reference/data-types/nullable/) (например, `Nullable(String)`) создает отдельный столбец типа `UInt8`. Этот дополнительный столбец должен обрабатываться каждый раз, когда пользователь работает со столбцом типа Nullable. Это приводит к дополнительному использованию дискового пространства и почти всегда отрицательно сказывается на производительности.

Чтобы избежать столбцов типа `Nullable`, рассмотрите возможность задания значения по умолчанию для такого столбца. Например, вместо:

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

Учитывайте свой сценарий использования: значение по умолчанию может оказаться неподходящим.
