---
slug: /sql-reference/aggregate-functions/reference/groupbitand
sidebar_position: 147
title: 'groupBitAnd'
description: 'Применяет побитовую операцию `AND` для серии чисел.'
---


# groupBitAnd

Применяет побитовую операцию `AND` для серии чисел.

``` sql
groupBitAnd(expr)
```

**Аргументы**

`expr` – Выражение, которое выводит тип `UInt*` или `Int*`.

**Возвращаемое значение**

Значение типа `UInt*` или `Int*`.

**Пример**

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
SELECT groupBitAnd(num) FROM t
```

Где `num` - это колонка с тестовыми данными.

Результат:

``` text
binary     decimal
00000100 = 4
```
