[`Nullable` column](/sql-reference/data-types/nullable/) (например, `Nullable(String)`) создает отдельный столбец типа `UInt8`. Этот дополнительный столбец приходится обрабатывать каждый раз, когда пользователь работает со столбцом Nullable. Это приводит к дополнительному расходу дискового пространства и почти всегда негативно влияет на производительность.

Чтобы избежать столбцов `Nullable`, рассмотрите возможность задания значения по умолчанию для этого столбца. Например, вместо:

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

использовать

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
