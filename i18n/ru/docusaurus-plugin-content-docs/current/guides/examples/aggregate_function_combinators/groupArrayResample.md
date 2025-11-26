---
slug: '/examples/aggregate-function-combinators/groupArrayResample'
title: 'groupArrayResample'
description: 'Пример использования комбинатора Resample с функцией groupArray'
keywords: ['groupArray', 'Resample', 'комбинатор', 'примеры', 'groupArrayResample']
sidebar_label: 'groupArrayResample'
doc_type: 'reference'
---



# groupArrayResample {#grouparrayresample}



## Описание {#description}

Комбинатор [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
может быть применён к агрегатной функции [`groupArray`](/sql-reference/aggregate-functions/reference/sum),
чтобы разделить диапазон заданного ключевого столбца на фиксированное количество интервалов (`N`) 
и сформировать результирующий массив, выбирая по одному представительному значению 
(соответствующему минимальному ключу) из точек данных, попадающих в каждый интервал.
Он формирует укрупнённое (downsampled) представление данных вместо сбора всех значений.



## Пример использования

Рассмотрим пример. Мы создадим таблицу, содержащую столбцы `name`, `age` и
`wage` сотрудников, и вставим в неё некоторые данные:

```sql
CREATE TABLE employee_data 
(
    name String,
    age UInt8,
    wage Float32
) ENGINE = MergeTree()
ORDER BY tuple()

INSERT INTO employee_data (name, age, wage) VALUES
    ('John', 16, 10.0),
    ('Alice', 30, 15.0),
    ('Mary', 35, 8.0),
    ('Evelyn', 48, 11.5),
    ('David', 62, 9.9),
    ('Brian', 60, 16.0);
```

Получим имена людей, возраст которых лежит в интервалах `[30,60)`
и `[60,75)`. Поскольку мы используем целочисленное представление возраста, мы получаем значения возраста в интервалах
`[30, 59]` и `[60,74]`.

Чтобы агрегировать имена в массив, используем агрегатную функцию `groupArray`.
Она принимает один аргумент. В нашем случае это столбец с именем. Функция `groupArrayResample`
должна использовать столбец с возрастом, чтобы агрегировать имена по возрасту. Чтобы задать
необходимые интервалы, передаём `30`, `75`, `30` в качестве аргументов функции `groupArrayResample`:

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM employee_data
```

```response
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```


## См. также {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Комбинатор Resample`](/sql-reference/aggregate-functions/combinators#-resample)
