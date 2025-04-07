---
description: 'Документация для типа данных Array в ClickHouse'
sidebar_label: 'Array(T)'
sidebar_position: 32
slug: /sql-reference/data-types/array
title: 'Array(T)'
---


# Array(T)

Массив элементов типа `T`, начиная с индекса 1. `T` может быть любым типом данных, включая массив.

## Создание массива {#creating-an-array}

Вы можете использовать функцию для создания массива:

```sql
array(T)
```

Вы также можете использовать квадратные скобки.

```sql
[]
```

Пример создания массива:

```sql
SELECT array(1, 2) AS x, toTypeName(x)
```

```text
┌─x─────┬─toTypeName(array(1, 2))─┐
│ [1,2] │ Array(UInt8)            │
└───────┴─────────────────────────┘
```

```sql
SELECT [1, 2] AS x, toTypeName(x)
```

```text
┌─x─────┬─toTypeName([1, 2])─┐
│ [1,2] │ Array(UInt8)       │
└───────┴────────────────────┘
```

## Работа с типами данных {#working-with-data-types}

При создании массива на лету, ClickHouse автоматически определяет тип аргумента как самый узкий тип данных, который может хранить все перечисленные аргументы. Если имеются какие-либо значения [Nullable](/sql-reference/data-types/nullable) или литеральные [NULL](/operations/settings/formats#input_format_null_as_default), тип элемента массива также становится [Nullable](../../sql-reference/data-types/nullable.md).

Если ClickHouse не смог определить тип данных, генерируется исключение. Это происходит, например, при попытке создать массив со строками и числами одновременно (`SELECT array(1, 'a')`).

Примеры автоматического определения типа данных:

```sql
SELECT array(1, 2, NULL) AS x, toTypeName(x)
```

```text
┌─x──────────┬─toTypeName(array(1, 2, NULL))─┐
│ [1,2,NULL] │ Array(Nullable(UInt8))        │
└────────────┴───────────────────────────────┘
```

Если вы попытаетесь создать массив с несовместимыми типами данных, ClickHouse выдаст исключение:

```sql
SELECT array(1, 'a')
```

```text
Received exception from server (version 1.1.54388):
Code: 386. DB::Exception: Received from localhost:9000, 127.0.0.1. DB::Exception: There is no supertype for types UInt8, String because some of them are String/FixedString and some of them are not.
```

## Размер массива {#array-size}

Можно определить размер массива, используя подколонку `size0`, не читая всю колонку. Для многомерных массивов можно воспользоваться `sizeN-1`, где `N` — это нужное измерение.

**Пример**

Запрос:

```sql
CREATE TABLE t_arr (`arr` Array(Array(Array(UInt32)))) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO t_arr VALUES ([[[12, 13, 0, 1],[12]]]);

SELECT arr.size0, arr.size1, arr.size2 FROM t_arr;
```

Результат:

```text
┌─arr.size0─┬─arr.size1─┬─arr.size2─┐
│         1 │ [2]       │ [[4,1]]   │
└───────────┴───────────┴───────────┘
```

## Чтение вложенных подколонок из массива {#reading-nested-subcolumns-from-array}

Если вложенный тип `T` внутри `Array` имеет подколонки (например, если это [именованный кортеж](./tuple.md)), вы можете читать его подколонки из типа `Array(T)` с теми же именами подколонок. Тип подколонки будет `Array` типа оригинальной подколонки.

**Пример**

```sql
CREATE TABLE t_arr (arr Array(Tuple(field1 UInt32, field2 String))) ENGINE = MergeTree ORDER BY tuple();
INSERT INTO t_arr VALUES ([(1, 'Hello'), (2, 'World')]), ([(3, 'This'), (4, 'is'), (5, 'subcolumn')]);
SELECT arr.field1, toTypeName(arr.field1), arr.field2, toTypeName(arr.field2) from t_arr;
```

```text
┌─arr.field1─┬─toTypeName(arr.field1)─┬─arr.field2────────────────┬─toTypeName(arr.field2)─┐
│ [1,2]      │ Array(UInt32)          │ ['Hello','World']         │ Array(String)          │
│ [3,4,5]    │ Array(UInt32)          │ ['This','is','subcolumn'] │ Array(String)          │
└────────────┴────────────────────────┴───────────────────────────┴────────────────────────┘
```
