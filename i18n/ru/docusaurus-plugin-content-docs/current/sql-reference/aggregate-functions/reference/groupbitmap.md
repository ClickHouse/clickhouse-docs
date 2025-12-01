---
description: 'Битовые или агрегатные вычисления по беззнаковому целочисленному столбцу. Возвращают мощность множества типа UInt64, а при добавлении суффикса -State — объект bitmap.'
sidebar_position: 148
slug: /sql-reference/aggregate-functions/reference/groupbitmap
title: 'groupBitmap'
doc_type: 'reference'
---

# groupBitmap {#groupbitmap}

Выполняет Bitmap- или агрегатные вычисления по беззнаковому целочисленному столбцу и возвращает мощность множества (кардинальность) в виде значения типа UInt64. Если добавить суффикс `-State`, функция вернёт [bitmap-объект](../../../sql-reference/functions/bitmap-functions.md).

```sql
groupBitmap(expr)
```

**Аргументы**

`expr` – выражение, результатом которого является значение типа `UInt*`.

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
