---
slug: '/examples/aggregate-function-combinators/avgResample'
title: 'avgResample'
description: 'Пример использования комбинатора Resample с avg'
keywords: ['avg', 'Resample', 'combinator', 'examples', 'avgResample']
sidebar_label: 'avgResample'
doc_type: 'reference'
---



# countResample {#countResample}



## Описание {#description}

Комбинатор [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
может быть применён к агрегатной функции [`count`](/sql-reference/aggregate-functions/reference/count)
для подсчёта значений указанного ключевого столбца в фиксированном количестве
интервалов (`N`).



## Пример использования

### Базовый пример

Рассмотрим пример. Мы создадим таблицу, в которой будут храниться `name`, `age` и
`wage` сотрудников, и вставим в неё некоторые данные:

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
    ('Иван', 16, 10.0),
    ('Алиса', 30, 15.0),
    ('Мария', 35, 8.0),
    ('Евелина', 48, 11.5),
    ('Давид', 62, 9.9),
    ('Брайан', 60, 16.0);
```

Получим среднюю заработную плату людей, чей возраст лежит в интервалах `[30,60)`
и `[60,75)` (`[` — граница, не включающая значение, а `)` — включающая). Поскольку мы используем
целочисленное представление возраста, мы получим значения возраста в интервалах
`[30, 59]` и `[60,74]`. Для этого применим комбинатор `Resample`
к агрегатной функции `avg`.

```sql
WITH avg_wage AS
(
    SELECT avgResample(30, 75, 30)(wage, age) AS original_avg_wage
    FROM employee_data
)
SELECT
    arrayMap(x -> round(x, 3), original_avg_wage) AS avg_wage_rounded
FROM avg_wage;
```

```response
┌─avg_wage_rounded─┐
│ [11.5,12.95]     │
└──────────────────┘
```


## См. также {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [комбинатор `Resample`](/sql-reference/aggregate-functions/combinators#-resample)
