---
description: 'Документация по типу данных Array в ClickHouse'
sidebar_label: 'Array(T)'
sidebar_position: 32
slug: /sql-reference/data-types/array
title: 'Array(T)'
doc_type: 'reference'
---



# Array(T)

Массив элементов типа `T` с начальным индексом, равным 1. `T` может быть любым типом данных, включая массив.



## Создание массива {#creating-an-array}

Для создания массива можно использовать функцию:

```sql
array(T)
```

Также можно использовать квадратные скобки:

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

При создании массива «на лету» ClickHouse автоматически определяет тип аргумента как наиболее узкий тип данных, способный хранить все перечисленные аргументы. Если присутствуют значения типа [Nullable](/sql-reference/data-types/nullable) или литеральные значения [NULL](/operations/settings/formats#input_format_null_as_default), тип элемента массива также становится [Nullable](../../sql-reference/data-types/nullable.md).

Если ClickHouse не может определить тип данных, генерируется исключение. Например, это происходит при попытке создать массив, содержащий одновременно строки и числа (`SELECT array(1, 'a')`).

Примеры автоматического определения типа данных:

```sql
SELECT array(1, 2, NULL) AS x, toTypeName(x)
```

```text
┌─x──────────┬─toTypeName(array(1, 2, NULL))─┐
│ [1,2,NULL] │ Array(Nullable(UInt8))        │
└────────────┴───────────────────────────────┘
```

При попытке создать массив из несовместимых типов данных ClickHouse генерирует исключение:

```sql
SELECT array(1, 'a')
```

```text
Received exception from server (version 1.1.54388):
Code: 386. DB::Exception: Received from localhost:9000, 127.0.0.1. DB::Exception: There is no supertype for types UInt8, String because some of them are String/FixedString and some of them are not.
```


## Размер массива {#array-size}

Размер массива можно определить с помощью подстолбца `size0` без чтения всего столбца. Для многомерных массивов можно использовать `sizeN-1`, где `N` — нужная размерность.

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


## Чтение вложенных подстолбцов из Array {#reading-nested-subcolumns-from-array}

Если вложенный тип `T` внутри `Array` имеет подстолбцы (например, если это [именованный кортеж](./tuple.md)), можно читать его подстолбцы из типа `Array(T)` с теми же именами подстолбцов. Тип подстолбца будет `Array` от типа исходного подстолбца.

**Пример**

```sql
CREATE TABLE t_arr (arr Array(Tuple(field1 UInt32, field2 String))) ENGINE = MergeTree ORDER BY tuple();
INSERT INTO t_arr VALUES ([(1, 'Hello'), (2, 'World')]), ([(3, 'This'), (4, 'is'), (5, 'subcolumn')]);
SELECT arr.field1, toTypeName(arr.field1), arr.field2, toTypeName(arr.field2) from t_arr;
```

```test
┌─arr.field1─┬─toTypeName(arr.field1)─┬─arr.field2────────────────┬─toTypeName(arr.field2)─┐
│ [1,2]      │ Array(UInt32)          │ ['Hello','World']         │ Array(String)          │
│ [3,4,5]    │ Array(UInt32)          │ ['This','is','subcolumn'] │ Array(String)          │
└────────────┴────────────────────────┴───────────────────────────┴────────────────────────┘
```
