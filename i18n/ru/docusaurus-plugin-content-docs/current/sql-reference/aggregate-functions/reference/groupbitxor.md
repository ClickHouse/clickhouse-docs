---
slug: /sql-reference/aggregate-functions/reference/groupbitxor
sidebar_position: 153
title: 'groupBitXor'
description: 'Applies bit-wise `XOR` for series of numbers.'
---


# groupBitXor

Применяет побитовый `XOR` для последовательности чисел.

``` sql
groupBitXor(expr)
```

**Arguments**

`expr` – Выражение, которое возвращает тип `UInt*` или `Int*`.

**Return value**

Значение типа `UInt*` или `Int*`.

**Example**

Тестовые данные:

``` text
binary     decimal
00101100 = 44
00011100 = 28
00001101 = 13
01010101 = 85
```

Запрос:

``` sql
SELECT groupBitXor(num) FROM t
```

Где `num` – это колонка с тестовыми данными.

Результат:

``` text
binary     decimal
01101000 = 104
```
