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
может применяться к агрегатной функции [`groupArray`](/sql-reference/aggregate-functions/reference/sum) для
разделения диапазона указанного ключевого столбца на фиксированное число интервалов (`N`)
и построения результирующего массива путём выбора одного представительного значения
(соответствующего минимальному ключу) из точек данных, попадающих в каждый интервал.
Это создаёт прореженное представление данных, а не собирает все значения.


## Пример использования {#example-usage}

Рассмотрим пример. Создадим таблицу, которая содержит имя (`name`), возраст (`age`) и зарплату (`wage`) сотрудников, и добавим в неё данные:

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

Получим имена людей, чей возраст находится в интервалах `[30,60)` и `[60,75)`. Поскольку возраст представлен целым числом, фактически получаем интервалы `[30, 59]` и `[60,74]`.

Для агрегирования имён в массив используем агрегатную функцию `groupArray`. Она принимает один аргумент — в нашем случае это столбец `name`. Функция `groupArrayResample` использует столбец `age` для группировки имён по возрасту. Чтобы задать необходимые интервалы, передаём в функцию `groupArrayResample` аргументы `30`, `75`, `30`:

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
- [Комбинатор `Resample`](/sql-reference/aggregate-functions/combinators#-resample)
