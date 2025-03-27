---
slug: /cloud/bestpractices/avoid-nullable-columns
sidebar_label: 'Избегайте Nullable столбцов'
title: 'Избегайте Nullable столбцов'
description: 'Страница, описывающая, почему следует избегать Nullable столбцов'
---

[`Nullable` столбец](/sql-reference/data-types/nullable/) (например, `Nullable(String)`) создает отдельный столбец типа `UInt8`. Этот дополнительный столбец должен обрабатываться каждый раз, когда пользователь работает с nullable столбцом. Это приводит к дополнительному использованию пространства для хранения и почти всегда негативно сказывается на производительности.

Чтобы избежать `Nullable` столбцов, рассмотрите возможность установки значения по умолчанию для этого столбца. Например, вместо:

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
используйте

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

:::note
Рассмотрите ваш случай использования, значение по умолчанию может быть неуместным.
:::
