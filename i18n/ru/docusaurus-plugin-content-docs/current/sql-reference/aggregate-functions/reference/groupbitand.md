---
description: 'Применяет побитовый `AND` для ряда чисел.'
sidebar_position: 147
slug: /sql-reference/aggregate-functions/reference/groupbitand
title: 'groupBitAnd'
---


# groupBitAnd

Применяет побитовый `AND` для ряда чисел.

```sql
groupBitAnd(expr)
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
SELECT groupBitAnd(num) FROM t
```

Где `num` – это столбец с тестовыми данными.

Результат:

```text
binary     decimal
00000100 = 4
```
