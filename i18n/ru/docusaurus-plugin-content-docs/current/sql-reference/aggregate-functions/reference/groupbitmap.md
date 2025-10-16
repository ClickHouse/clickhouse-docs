---
slug: '/sql-reference/aggregate-functions/reference/groupbitmap'
sidebar_position: 148
description: 'Битовая карта или агрегатные вычисления из столбца без знака целого'
title: groupBitmap
doc_type: reference
---
# groupBitmap

Битовая карта или агрегатные вычисления из колонки беззнакового целого числа, возвращает кардинальность типа UInt64. Если добавить суффикс -State, то возвращает [объект битовой карты](../../../sql-reference/functions/bitmap-functions.md).

```sql
groupBitmap(expr)
```

**Аргументы**

`expr` – выражение, которое приводит к типу `UInt*`.

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
SELECT groupBitmap(UserID) AS num FROM t
```

Результат:

```text
num
3
```