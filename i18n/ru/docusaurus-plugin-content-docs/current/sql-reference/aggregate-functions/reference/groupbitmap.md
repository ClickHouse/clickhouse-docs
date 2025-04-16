---
description: 'Вычисления битовых карт или агрегатов из колонки с беззнаковыми целыми числами, возвращает
  кардинальность типа UInt64, если добавить суффикс -State, то возвращает объект [битовой карты](../../../sql-reference/functions/bitmap-functions.md)'
sidebar_position: 148
slug: /sql-reference/aggregate-functions/reference/groupbitmap
title: 'groupBitmap'
---


# groupBitmap

Вычисления битовых карт или агрегатов из колонки с беззнаковыми целыми числами, возвращает кардинальность типа UInt64, если добавить суффикс -State, то возвращает [объект битовой карты](../../../sql-reference/functions/bitmap-functions.md).

```sql
groupBitmap(expr)
```

**Аргументы**

`expr` – Выражение, которое возвращает тип `UInt*`.

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
