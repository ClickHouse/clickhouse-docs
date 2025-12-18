---
description: 'Применяет операцию побитового `AND` к последовательности чисел.'
sidebar_position: 147
slug: /sql-reference/aggregate-functions/reference/groupbitand
title: 'groupBitAnd'
doc_type: 'reference'
---

# groupBitAnd {#groupbitand}

Применяет побитовое `AND` к последовательности чисел.

```sql
groupBitAnd(expr)
```

**Аргументы**

`expr` – выражение, результат которого имеет тип `UInt*` или `Int*`.

**Возвращаемое значение**

Значение типа `UInt*` или `Int*`.

**Пример**

Тестовые данные:

```text
binary     decimal
00101100 = 44
00011100 = 28
00001101 = 13
01010101 = 85
```

Запрос:

```sql
SELECT groupBitAnd(num) FROM t
```

Где `num` — столбец с тестовыми данными.

Результат:

```text
binary     decimal
00000100 = 4
```
