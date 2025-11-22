---
description: 'Bitmap- или агрегатные вычисления для столбца беззнакового целого, возвращают мощность множества типа UInt64; при добавлении суффикса -State возвращается объект bitmap'
sidebar_position: 148
slug: /sql-reference/aggregate-functions/reference/groupbitmap
title: 'groupBitmap'
doc_type: 'reference'
---

# groupBitmap

Выполняет bitmap- или агрегатные вычисления по столбцу беззнакового целочисленного типа и возвращает мощность множества (cardinality) типа UInt64. Если добавить суффикс `-State`, то функция возвращает [объект bitmap](../../../sql-reference/functions/bitmap-functions.md).

```sql
groupBitmap(expr)
```

**Аргументы**

`expr` – выражение, результат которого имеет тип `UInt*`.

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
