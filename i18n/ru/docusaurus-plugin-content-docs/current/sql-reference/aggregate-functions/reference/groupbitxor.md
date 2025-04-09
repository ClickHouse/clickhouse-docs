---
description: 'Применяет побитовый `XOR` для серии чисел.'
sidebar_position: 153
slug: /sql-reference/aggregate-functions/reference/groupbitxor
title: 'groupBitXor'
---


# groupBitXor

Применяет побитовый `XOR` для серии чисел.

```sql
groupBitXor(expr)
```

**Аргументы**

`expr` – Выражение, которое приводит к типу `UInt*` или `Int*`.

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
SELECT groupBitXor(num) FROM t
```

Где `num` - это колонка с тестовыми данными.

Результат:

```text
binary     decimal
01101000 = 104
```
