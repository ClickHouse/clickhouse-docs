---
description: 'Битовые или агрегатные вычисления из столбца без знака целого числа, возвращают
  кардинальность типа UInt64, если добавить суффикс -State, то вернуть объект [bitmap](../../../sql-reference/functions/bitmap-functions.md)'
sidebar_position: 148
slug: /sql-reference/aggregate-functions/reference/groupbitmap
title: 'groupBitmap'
---


# groupBitmap

Битовые или агрегатные вычисления из столбца без знака целого числа, возвращают кардинальность типа UInt64, если добавить суффикс -State, то вернуть [объект bitmap](../../../sql-reference/functions/bitmap-functions.md).

```sql
groupBitmap(expr)
```

**Аргументы**

`expr` – Выражение, которое приводит к типу `UInt*`.

**Возвращаемое значение**

Значение типа `UInt64`.

**Пример**

Тестовые данные:

```text
UserID
1
1
2
3
```

Запрос:

```sql
SELECT groupBitmap(UserID) as num FROM t
```

Результат:

```text
num
3
```
