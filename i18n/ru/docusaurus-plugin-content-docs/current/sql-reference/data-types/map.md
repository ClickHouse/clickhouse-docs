---
description: 'Документация по типу данных Map в ClickHouse'
sidebar_label: 'Map(K, V)'
sidebar_position: 36
slug: /sql-reference/data-types/map
title: 'Map(K, V)'
doc_type: 'reference'
---



# Map(K, V)

Тип данных `Map(K, V)` хранит пары ключ-значение.

В отличие от других баз данных, в ClickHouse элементы типа Map не обязаны иметь уникальные ключи, т.е. Map может содержать два элемента с одинаковым ключом.
(Причина в том, что Map внутренне реализован как `Array(Tuple(K, V))`.)

Можно использовать синтаксис `m[k]` для получения значения по ключу `k` в Map `m`.
При этом `m[k]` последовательно просматривает Map, т.е. время выполнения операции линейно зависит от размера Map.

**Параметры**

* `K` — Тип ключей Map. Произвольный тип, за исключением [Nullable](../../sql-reference/data-types/nullable.md) и [LowCardinality](../../sql-reference/data-types/lowcardinality.md) с вложенным типом [Nullable](../../sql-reference/data-types/nullable.md).
* `V` — Тип значений Map. Произвольный тип.

**Примеры**

Создание таблицы со столбцом типа Map:

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':1, 'key2':10}), ({'key1':2,'key2':20}), ({'key1':3,'key2':30});
```

Чтобы выбрать значения `key2`:

```sql
SELECT m['key2'] FROM tab;
```

Результат:

```text
┌─arrayElement(m, 'key2')─┐
│                      10 │
│                      20 │
│                      30 │
└─────────────────────────┘
```

Если запрошенный ключ `k` отсутствует в отображении (map), `m[k]` возвращает значение по умолчанию для типа значения, например `0` для целочисленных типов и `''` для строковых типов.
Чтобы проверить, существует ли ключ в отображении, можно использовать функцию [mapContains](../../sql-reference/functions/tuple-map-functions#mapcontains).

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE=Memory;
INSERT INTO tab VALUES ({'key1':100}), ({});
SELECT m['key1'] FROM tab;
```

Результат:

```text
┌─arrayElement(m, 'key1')─┐
│                     100 │
│                       0 │
└─────────────────────────┘
```


## Преобразование Tuple в Map {#converting-tuple-to-map}

Значения типа `Tuple()` можно преобразовать в значения типа `Map()` с помощью функции [CAST](/sql-reference/functions/type-conversion-functions#cast):

**Пример**

Запрос:

```sql
SELECT CAST(([1, 2, 3], ['Ready', 'Steady', 'Go']), 'Map(UInt8, String)') AS map;
```

Результат:

```text
┌─map───────────────────────────┐
│ {1:'Ready',2:'Steady',3:'Go'} │
└───────────────────────────────┘
```


## Чтение подстолбцов Map {#reading-subcolumns-of-map}

Чтобы избежать чтения всей структуры map, в некоторых случаях можно использовать подстолбцы `keys` и `values`.

**Пример**

Запрос:

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE = Memory;
INSERT INTO tab VALUES (map('key1', 1, 'key2', 2, 'key3', 3));

SELECT m.keys FROM tab; --   аналогично mapKeys(m)
SELECT m.values FROM tab; -- аналогично mapValues(m)
```

Результат:

```text
┌─m.keys─────────────────┐
│ ['key1','key2','key3'] │
└────────────────────────┘

┌─m.values─┐
│ [1,2,3]  │
└──────────┘
```

**См. также**

- Функция [map()](/sql-reference/functions/tuple-map-functions#map)
- Функция [CAST()](/sql-reference/functions/type-conversion-functions#cast)
- [Комбинатор -Map для типа данных Map](../aggregate-functions/combinators.md#-map)


## Связанный контент {#related-content}

- Блог: [Построение решения для наблюдаемости с ClickHouse — Часть 2: Трассировки](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
