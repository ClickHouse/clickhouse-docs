---
slug: '/examples/aggregate-function-combinators/countResample'
title: 'countResample'
description: 'Пример использования комбинатора Resample с функцией count'
keywords: ['count', 'Resample', 'combinator', 'examples', 'countResample']
sidebar_label: 'countResample'
doc_type: 'reference'
---

# countResample \\{#countResample\\}

## Описание \\{#description\\}

Комбинатор [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
можно применить к агрегатной функции [`count`](/sql-reference/aggregate-functions/reference/count),
чтобы подсчитать значения заданного ключевого столбца по фиксированному числу
интервалов (`N`).

## Пример использования \\{#example-usage\\}

### Базовый пример \\{#basic-example\\}

Рассмотрим пример. Мы создадим таблицу, которая будет содержать `name`, `age` и
`wage` сотрудников, и вставим в неё несколько записей:

```sql
CREATE TABLE employee_data 
(
    name String,
    age UInt8,
    wage Float32
) 
ENGINE = MergeTree()
ORDER BY tuple()

INSERT INTO employee_data (name, age, wage) VALUES
    ('John', 16, 10.0),
    ('Alice', 30, 15.0),
    ('Mary', 35, 8.0),
    ('Evelyn', 48, 11.5),
    ('David', 62, 9.9),
    ('Brian', 60, 16.0);
```

Посчитаем всех людей, чей возраст лежит в интервалах `[30,60)`
и `[60,75)`. Поскольку мы используем целочисленное представление возраста, фактически получаем возраста в
интервалах `[30, 59]` и `[60,74]`. Для этого применим комбинатор `Resample`
к `count`.

```sql
SELECT countResample(30, 75, 30)(name, age) AS amount FROM employee_data
```

```response
┌─amount─┐
│ [3,2]  │
└────────┘
```

## См. также \\{#see-also\\}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Комбинатор Resample`](/sql-reference/aggregate-functions/combinators#-resample)
