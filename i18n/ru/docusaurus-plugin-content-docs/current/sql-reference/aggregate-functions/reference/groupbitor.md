---
description: 'Применяет побитовую операцию `OR` к последовательности чисел.'
sidebar_position: 152
slug: /sql-reference/aggregate-functions/reference/groupbitor
title: 'groupBitOr'
doc_type: 'reference'
---

# groupBitOr {#groupbitor}

Применяет операцию побитового `OR` к последовательности чисел.

```sql
groupBitOr(expr)
```

**Аргументы**

`expr` – выражение, результатом которого является значение типа `UInt*` или `Int*`.

**Возвращаемое значение**

Значение типа `UInt*` или `Int*`.

**Пример**

Тестовые данные:

```text
двоичное   десятичное
00101100 = 44
00011100 = 28
00001101 = 13
01010101 = 85
```

Запрос:

```sql
SELECT groupBitOr(num) FROM t
```

Где `num` — столбец с тестовыми данными.

Результат:

```text
двоичное   десятичное
01111101 = 125
```
