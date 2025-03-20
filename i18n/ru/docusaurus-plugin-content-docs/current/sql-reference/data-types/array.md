---
slug: /sql-reference/data-types/array
sidebar_position: 32
sidebar_label: Array(T)
---


# Array(T)

Массив элементов типа `T`, начинающийся с индекса массива 1. `T` может быть любым типом данных, включая массив.

## Создание массива {#creating-an-array}

Вы можете использовать функцию для создания массива:

``` sql
array(T)
```

Также можно использовать квадратные скобки.

``` sql
[]
```

Пример создания массива:

``` sql
SELECT array(1, 2) AS x, toTypeName(x)
```

``` text
┌─x─────┬─toTypeName(array(1, 2))─┐
│ [1,2] │ Array(UInt8)            │
└───────┴─────────────────────────┘
```

``` sql
SELECT [1, 2] AS x, toTypeName(x)
```

``` text
┌─x─────┬─toTypeName([1, 2])─┐
│ [1,2] │ Array(UInt8)       │
└───────┴────────────────────┘
```

## Работа с типами данных {#working-with-data-types}

При создании массива на лету, ClickHouse автоматически определяет тип аргумента как наименьший тип данных, который может хранить все перечисленные аргументы. Если есть какие-либо [Nullable](/sql-reference/data-types/nullable) или буквальные [NULL](/operations/settings/formats#input_format_null_as_default) значения, тип элемента массива также становится [Nullable](../../sql-reference/data-types/nullable.md).

Если ClickHouse не может определить тип данных, он генерирует исключение. Например, это происходит, когда вы пытаетесь создать массив с строками и числами одновременно (`SELECT array(1, 'a')`).

Примеры автоматического определения типа данных:

``` sql
SELECT array(1, 2, NULL) AS x, toTypeName(x)
```

``` text
┌─x──────────┬─toTypeName(array(1, 2, NULL))─┐
│ [1,2,NULL] │ Array(Nullable(UInt8))        │
└────────────┴───────────────────────────────┘
```

Если вы попытаетесь создать массив несовместимых типов данных, ClickHouse выбросит исключение:

``` sql
SELECT array(1, 'a')
```

``` text
Получено исключение от сервера (версия 1.1.54388):
Код: 386. DB::Exception: Получено от localhost:9000, 127.0.0.1. DB::Exception: Для типов UInt8, String нет супертипа, потому что некоторые из них являются String/FixedString, а некоторые - нет.
```

## Размер массива {#array-size}

Можно узнать размер массива, используя подколонку `size0` без чтения всей колонки. Для многомерных массивов можно использовать `sizeN-1`, где `N` - требуемая размерность.

**Пример**

Запрос:

```sql
CREATE TABLE t_arr (`arr` Array(Array(Array(UInt32)))) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO t_arr VALUES ([[[12, 13, 0, 1],[12]]]);

SELECT arr.size0, arr.size1, arr.size2 FROM t_arr;
```

Результат:

``` text
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

```test
┌─arr.field1─┬─toTypeName(arr.field1)─┬─arr.field2────────────────┬─toTypeName(arr.field2)─┐
│ [1,2]      │ Array(UInt32)          │ ['Hello','World']         │ Array(String)          │
│ [3,4,5]    │ Array(UInt32)          │ ['This','is','subcolumn'] │ Array(String)          │
└────────────┴────────────────────────┴───────────────────────────┴────────────────────────┘
```
