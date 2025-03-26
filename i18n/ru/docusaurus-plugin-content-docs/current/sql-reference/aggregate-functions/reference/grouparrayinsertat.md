---
description: 'Вставляет значение в массив на указанной позиции.'
sidebar_position: 140
slug: /sql-reference/aggregate-functions/reference/grouparrayinsertat
title: 'groupArrayInsertAt'
---


# groupArrayInsertAt

Вставляет значение в массив на указанной позиции.

**Синтаксис**

```sql
groupArrayInsertAt(default_x, size)(x, pos)
```

Если в одном запросе несколько значений вставляются на одну и ту же позицию, функция ведет себя следующим образом:

- Если запрос выполняется в одном потоке, используется первое из вставляемых значений.
- Если запрос выполняется в нескольких потоках, полученное значение будет неопределенным одним из вставленных значений.

**Аргументы**

- `x` — Значение, которое необходимо вставить. [Выражение](/sql-reference/syntax#expressions), возвращающее одно из [поддерживаемых типов данных](../../../sql-reference/data-types/index.md).
- `pos` — Позиция, на которую будет вставлен указанный элемент `x`. Нумерация индексов в массиве начинается с нуля. [UInt32](/sql-reference/data-types/int-uint#integer-ranges).
- `default_x` — Значение по умолчанию для подмены в пустых позициях. Необязательный параметр. [Выражение](/sql-reference/syntax#expressions), возвращающее тип данных, определенный для параметра `x`. Если `default_x` не задан, используются [значения по умолчанию](/sql-reference/statements/create/table).
- `size` — Длина результирующего массива. Необязательный параметр. При использовании этого параметра должно быть указано значение по умолчанию `default_x`. [UInt32](/sql-reference/data-types/int-uint#integer-ranges).

**Возвращаемое значение**

- Массив с вставленными значениями.

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

Многопоточная вставка элементов в одну позицию.

Запрос:

```sql
SELECT groupArrayInsertAt(number, 0) FROM numbers_mt(10) SETTINGS max_block_size = 1;
```

В результате этого запроса вы получите случайное целое число в диапазоне `[0,9]`. Например:

```text
┌─groupArrayInsertAt(number, 0)─┐
│ [7]                           │
└───────────────────────────────┘
```
