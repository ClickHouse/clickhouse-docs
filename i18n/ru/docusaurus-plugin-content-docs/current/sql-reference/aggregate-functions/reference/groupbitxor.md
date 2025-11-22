---
description: 'Применяет операцию побитового `XOR` к последовательности чисел.'
sidebar_position: 153
slug: /sql-reference/aggregate-functions/reference/groupbitxor
title: 'groupBitXor'
doc_type: 'reference'
---

# groupBitXor

Применяет операцию побитового `XOR` к последовательности чисел.

```sql
groupBitXor(expr)
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
SELECT groupBitXor(num) FROM t
```

Где `num` — столбец с тестовыми данными.

Результат:

```text
двоичная   десятичная
01101000 = 104
```
