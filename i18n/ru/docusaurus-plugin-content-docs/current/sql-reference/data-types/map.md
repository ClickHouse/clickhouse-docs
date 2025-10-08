---
slug: '/sql-reference/data-types/map'
sidebar_label: 'Map(K, V)'
sidebar_position: 36
description: 'Документация для типа данных Map в ClickHouse'
title: 'Map(K, V)'
doc_type: reference
---
# Map(K, V)

Тип данных `Map(K, V)` хранит пары ключ-значение.

В отличие от других баз данных, в ClickHouse карты не уникальны, то есть карта может содержать два элемента с одинаковым ключом.
(Причина этого заключается в том, что карты внутренне реализованы как `Array(Tuple(K, V))`.)

Вы можете использовать синтаксис `m[k]`, чтобы получить значение для ключа `k` в карте `m`.
Также `m[k]` сканирует карту, то есть время выполнения этой операции линейно зависимо от размера карты.

**Параметры**

- `K` — Тип ключей Map. Произвольный тип, за исключением [Nullable](../../sql-reference/data-types/nullable.md) и [LowCardinality](../../sql-reference/data-types/lowcardinality.md), вложенных с [Nullable](../../sql-reference/data-types/nullable.md) типами.
- `V` — Тип значений Map. Произвольный тип.

**Примеры**

Создайте таблицу со столбцом типа map:

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

Если запрашиваемый ключ `k` не содержится в карте, `m[k]` возвращает значение по умолчанию для данного типа, например `0` для целочисленных типов и `''` для строковых типов.
Чтобы проверить, существует ли ключ в карте, вы можете использовать функцию [mapContains](../../sql-reference/functions/tuple-map-functions#mapcontains).

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

Значения типа `Tuple()` могут быть приведены к значениям типа `Map()` с использованием функции [CAST](/sql-reference/functions/type-conversion-functions#cast):

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

## Чтение подколонок Map {#reading-subcolumns-of-map}

Чтобы избежать чтения всей карты, вы можете использовать подколонки `keys` и `values` в некоторых случаях.

**Пример**

Запрос:

```sql
CREATE TABLE tab (m Map(String, UInt64)) ENGINE = Memory;
INSERT INTO tab VALUES (map('key1', 1, 'key2', 2, 'key3', 3));

SELECT m.keys FROM tab; --   same as mapKeys(m)
SELECT m.values FROM tab; -- same as mapValues(m)
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
- [-Map комбинатор для типа данных Map](../aggregate-functions/combinators.md#-map)

## Связанное содержимое {#related-content}

- Блог: [Создание решения для мониторинга с ClickHouse - Часть 2 - Трассы](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)