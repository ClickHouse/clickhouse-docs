---
description: 'Создаёт массив значений аргумента. Значения могут быть добавлены в массив
  в произвольном (неопределённом) порядке.'
sidebar_position: 139
slug: /sql-reference/aggregate-functions/reference/grouparray
title: 'groupArray'
doc_type: 'reference'
---

# groupArray {#grouparray}

Синтаксис: `groupArray(x)` или `groupArray(max_size)(x)`

Создаёт массив значений аргумента.
Значения могут добавляться в массив в любом (произвольном) порядке.

Вторая версия (с параметром `max_size`) ограничивает размер результирующего массива `max_size` элементами. Например, `groupArray(1)(x)` эквивалентно `[any (x)]`.

В некоторых случаях вы тем не менее можете полагаться на порядок выполнения. Это относится к ситуациям, когда `SELECT` выполняется над подзапросом, использующим `ORDER BY`, и результат подзапроса достаточно мал.

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

Функция groupArray удаляет значение NULL, как показано выше.

* Псевдоним: `array_agg`.
