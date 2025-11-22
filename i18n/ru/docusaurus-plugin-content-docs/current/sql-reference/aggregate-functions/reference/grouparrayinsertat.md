---
description: 'Вставляет значение в массив по указанному индексу.'
sidebar_position: 140
slug: /sql-reference/aggregate-functions/reference/grouparrayinsertat
title: 'groupArrayInsertAt'
doc_type: 'reference'
---

# groupArrayInsertAt

Вставляет значение в массив в указанную позицию.

**Синтаксис**

```sql
groupArrayInsertAt(default_x, size)(x, pos)
```

Если в одном запросе в одну и ту же позицию вставляется несколько значений, функция ведет себя следующим образом:

* Если запрос выполняется в одном потоке, используется первое из вставленных значений.
* Если запрос выполняется в нескольких потоках, результирующим значением будет одно из вставленных значений, какое именно — не определено.

**Аргументы**

* `x` — значение для вставки. [Выражение](/sql-reference/syntax#expressions), результатом которого является один из [поддерживаемых типов данных](../../../sql-reference/data-types/index.md).
* `pos` — позиция, в которую должен быть вставлен указанный элемент `x`. Нумерация индексов в массиве начинается с нуля. [UInt32](/sql-reference/data-types/int-uint#integer-ranges).
* `default_x` — значение по умолчанию для подстановки в пустые позиции. Необязательный параметр. [Выражение](/sql-reference/syntax#expressions), результатом которого является тип данных, заданный для параметра `x`. Если `default_x` не определен, используются [значения по умолчанию](/sql-reference/statements/create/table).
* `size` — длина результирующего массива. Необязательный параметр. При использовании этого параметра необходимо также указать значение по умолчанию `default_x`. [UInt32](/sql-reference/data-types/int-uint#integer-ranges).

**Возвращаемое значение**

* Массив со вставленными значениями.

Тип: [Array](/sql-reference/data-types/array).

**Пример**

Запрос:

```sql
SELECT groupArrayInsertAt(toString(number), number * 2) FROM numbers(5);
```

Результат:

```text
┌─groupArrayInsertAt(toString(number), multiply(number, 2))─┐
│ ['0','','1','','2','','3','','4']                         │
└───────────────────────────────────────────────────────────┘
```

Запрос:

```sql
SELECT groupArrayInsertAt('-')(toString(number), number * 2) FROM numbers(5);
```

Результат:

```text
┌─groupArrayInsertAt('-')(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2','-','3','-','4']                          │
└────────────────────────────────────────────────────────────────┘
```

Запрос:

```sql
SELECT groupArrayInsertAt('-', 5)(toString(number), number * 2) FROM numbers(5);
```

Результат:

```text
┌─groupArrayInsertAt('-', 5)(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2']                                             │
└───────────────────────────────────────────────────────────────────┘
```

Многопоточная вставка элементов в одну и ту же позицию.

Запрос:

```sql
SELECT groupArrayInsertAt(number, 0) FROM numbers_mt(10) SETTINGS max_block_size = 1;
```

В результате этого запроса вы получите случайное целое число из диапазона `[0, 9]`. Например:

```text
┌─groupArrayInsertAt(number, 0)─┐
│ [7]                           │
└───────────────────────────────┘
```
