---
description: 'Создает массив значений аргумента. Значения могут добавляться в массив
  в произвольном (неопределённом) порядке.'
sidebar_position: 139
slug: /sql-reference/aggregate-functions/reference/grouparray
title: 'groupArray'
doc_type: 'reference'
---

# groupArray

Синтаксис: `groupArray(x)` или `groupArray(max_size)(x)`

Создает массив значений аргумента.
Значения могут добавляться в массив в любом (недетерминированном) порядке.

Вторая версия (с параметром `max_size`) ограничивает размер результирующего массива числом элементов `max_size`. Например, `groupArray(1)(x)` эквивалентен `[any (x)]`.

В некоторых случаях вы все же можете рассчитывать на сохранение порядка выполнения. Это относится к ситуациям, когда `SELECT` выполняется над подзапросом с `ORDER BY`, если результат подзапроса достаточно мал.

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

Функция groupArray будет удалять значения ᴺᵁᴸᴸ в соответствии с приведёнными выше результатами.

* Псевдоним: `array_agg`.
