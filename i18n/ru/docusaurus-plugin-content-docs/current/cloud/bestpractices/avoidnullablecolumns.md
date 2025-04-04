---
slug: /cloud/bestpractices/avoid-nullable-columns
sidebar_label: 'Избегайте Nullable колонок'
title: 'Избегайте Nullable колонок'
description: 'Страница, описывающая, почему следует избегать Nullable колонок'
---

[`Nullable` колонка](/sql-reference/data-types/nullable/) (например, `Nullable(String)`) создает отдельную колонку типа `UInt8`. Эта дополнительная колонка должна обрабатываться каждый раз, когда пользователь работает с nullable колонкой. Это приводит к дополнительному использованию места для хранения и почти всегда негативно сказывается на производительности.

Чтобы избежать `Nullable` колонок, рассмотрите возможность установки значения по умолчанию для этой колонки. Например, вместо:

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
Обратите внимание на ваш случай использования, значение по умолчанию может быть неуместным.
:::
