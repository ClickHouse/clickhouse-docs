---
description: 'Применяет побитовое `AND` к последовательности чисел.'
sidebar_position: 147
slug: /sql-reference/aggregate-functions/reference/groupbitand
title: 'groupBitAnd'
doc_type: 'reference'
---

# groupBitAnd

Применяет побитовое `AND` к ряду чисел.

```sql
groupBitAnd(expr)
```

**Аргументы**

`expr` – выражение, результатом вычисления которого является значение типа `UInt*` или `Int*`.

**Возвращаемое значение**

Значение типа `UInt*` или `Int*`.

**Пример**

Тестовые данные:

```text
двоичная   десятичная
00101100 = 44
00011100 = 28
00001101 = 13
01010101 = 85
```

Запрос:

```sql
SELECT groupBitAnd(num) FROM t
```

где `num` — столбец с тестовыми данными.

Результат:

```text
двоичная   десятичная
00000100 = 4
```
