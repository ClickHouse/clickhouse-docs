---
slug: /sql-reference/aggregate-functions/reference/grouparray
sidebar_position: 139
title: 'groupArray'
description: 'Создает массив значений аргумента. Значения могут добавляться в массив в любом (неопределенном) порядке.'
---


# groupArray

Синтаксис: `groupArray(x)` или `groupArray(max_size)(x)`

Создает массив значений аргумента.
Значения могут добавляться в массив в любом (неопределенном) порядке.

Вторая версия (с параметром `max_size`) ограничивает размер результирующего массива до `max_size` элементов. Например, `groupArray(1)(x)` эквивалентен `[any (x)]`.

В некоторых случаях вы все еще можете полагаться на порядок выполнения. Это применимо к случаям, когда `SELECT` идет из подзапроса, использующего `ORDER BY`, если результат подзапроса достаточно мал.

**Пример**

``` text
SELECT * FROM default.ck;

┌─id─┬─name─────┐
│  1 │ zhangsan │
│  1 │ ᴺᵁᴸᴸ     │
│  1 │ lisi     │
│  2 │ wangwu   │
└────┴──────────┘

```

Запрос:

``` sql
select id, groupArray(10)(name) from default.ck group by id;
```

Результат:

``` text
┌─id─┬─groupArray(10)(name)─┐
│  1 │ ['zhangsan','lisi']  │
│  2 │ ['wangwu']           │
└────┴──────────────────────┘
```

Функция groupArray удалит значение ᴺᵁᴸᴸ на основе приведенных выше результатов.

- Псевдоним: `array_agg`.
