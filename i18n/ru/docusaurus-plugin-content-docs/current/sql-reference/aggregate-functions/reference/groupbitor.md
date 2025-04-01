---
description: 'Применяет побитовый `OR` к серии чисел.'
sidebar_position: 152
slug: /sql-reference/aggregate-functions/reference/groupbitor
title: 'groupBitOr'
---


# groupBitOr

Применяет побитовый `OR` к серии чисел.

```sql
groupBitOr(expr)
```

**Аргументы**

`expr` – Выражение, которое возвращает тип `UInt*` или `Int*`.

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
SELECT groupBitOr(num) FROM t
```

Где `num` — это колонка с тестовыми данными.

Результат:

```text
binary     decimal
01111101 = 125
```
