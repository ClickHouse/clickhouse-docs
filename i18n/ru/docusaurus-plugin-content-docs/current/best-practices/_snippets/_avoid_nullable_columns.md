[`Nullable`‑столбец](/sql-reference/data-types/nullable/) (например, `Nullable(String)`) создаёт отдельный столбец типа `UInt8`. Этот дополнительный столбец приходится обрабатывать каждый раз, когда пользователь работает со столбцом типа `Nullable`. Это приводит к дополнительному расходу места на хранение и почти всегда негативно влияет на производительность.

Чтобы избежать столбцов типа `Nullable`, рассмотрите возможность задать для них значение по умолчанию. Например, вместо:

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
