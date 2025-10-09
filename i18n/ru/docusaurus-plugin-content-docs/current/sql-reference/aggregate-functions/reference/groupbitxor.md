---
slug: '/sql-reference/aggregate-functions/reference/groupbitxor'
sidebar_position: 153
description: 'Применяет побитовый `XOR` для серии чисел.'
title: groupBitXor
doc_type: reference
---
# groupBitXor

Применяет побитовую `XOR` для последовательности чисел.

```sql
groupBitXor(expr)
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
SELECT groupBitXor(num) FROM t
```

Где `num` – это колонка с тестовыми данными.

Результат:

```text
binary     decimal
01101000 = 104
```