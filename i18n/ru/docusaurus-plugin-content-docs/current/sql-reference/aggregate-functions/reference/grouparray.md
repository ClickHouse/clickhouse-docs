---
slug: '/sql-reference/aggregate-functions/reference/grouparray'
sidebar_position: 139
description: 'Создает массив значений аргументов. Значения могут быть добавлены'
title: groupArray
doc_type: reference
---
# groupArray

Синтаксис: `groupArray(x)` или `groupArray(max_size)(x)`

Создает массив значений аргументов. 
Значения могут добавляться в массив в любом (неопределенном) порядке.

Вторая версия (с параметром `max_size`) ограничивает размер результирующего массива до `max_size` элементов. Например, `groupArray(1)(x)` эквивалентно `[any (x)]`.

В некоторых случаях вы все еще можете полагаться на порядок выполнения. Это относится к случаям, когда `SELECT` поступает из подзапроса, который использует `ORDER BY`, если результат подзапроса достаточно мал.

**Пример**

```text
SELECT * FROM default.ck;

┌─id─┬─name─────┐
│  1 │ zhangsan │
│  1 │ ᴺᵁᴸᴸ     │
│  1 │ lisi     │
│  2 │ wangwu   │
└────┴──────────┘

```

Запрос:

```sql
SELECT id, groupArray(10)(name) FROM default.ck GROUP BY id;
```

Результат:

```text
┌─id─┬─groupArray(10)(name)─┐
│  1 │ ['zhangsan','lisi']  │
│  2 │ ['wangwu']           │
└────┴──────────────────────┘
```

Функция groupArray удалит значение ᴺᵁᴸᴸ на основе вышеуказанных результатов.

- Псевдоним: `array_agg`.