---
slug: /sql-reference/aggregate-functions/reference/groupbitmap
sidebar_position: 148
title: "groupBitmap"
description: "Битовая карта или агрегатные вычисления из колонки без знака, возвращает кардинальность типа UInt64, если добавить суффикс -State, то возвращает [объект битовой карты](../../../sql-reference/functions/bitmap-functions.md)."
---


# groupBitmap

Битовая карта или агрегатные вычисления из колонки без знака, возвращает кардинальность типа UInt64, если добавить суффикс -State, то возвращает [объект битовой карты](../../../sql-reference/functions/bitmap-functions.md).

``` sql
groupBitmap(expr)
```

**Аргументы**

`expr` – Выражение, которое возвращает тип `UInt*`.

**Возвращаемое значение**

Значение типа `UInt64`.

**Пример**

Тестовые данные:

``` text
UserID
1
1
2
3
```

Запрос:

``` sql
SELECT groupBitmap(UserID) as num FROM t
```

Результат:

``` text
num
3
```
