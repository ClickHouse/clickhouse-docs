---
description: 'Расчитывает список уникальных путей, хранящихся в колонке JSON.'
sidebar_position: 216
slug: /sql-reference/aggregate-functions/reference/distinctjsonpaths
title: 'distinctJSONPaths'
---


# distinctJSONPaths

Расчитывает список уникальных путей, хранящихся в колонке [JSON](../../data-types/newjson.md).

**Синтаксис**

```sql
distinctJSONPaths(json)
```

**Аргументы**

- `json` — [JSON](../../data-types/newjson.md) колонка.

**Возвращаемое значение**

- Отсортированный список путей [Array(String)](../../data-types/array.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS test_json;
CREATE TABLE test_json(json JSON) ENGINE = Memory;
INSERT INTO test_json VALUES ('{"a" : 42, "b" : "Hello"}'), ('{"b" : [1, 2, 3], "c" : {"d" : {"e" : "2020-01-01"}}}'), ('{"a" : 43, "c" : {"d" : {"f" : [{"g" : 42}]}}}')
```

```sql
SELECT distinctJSONPaths(json) FROM test_json;
```

Результат:

```reference
┌─distinctJSONPaths(json)───┐
│ ['a','b','c.d.e','c.d.f'] │
└───────────────────────────┘
```


# distinctJSONPathsAndTypes

Расчитывает список уникальных путей и их типов, хранящихся в колонке [JSON](../../data-types/newjson.md).

**Синтаксис**

```sql
distinctJSONPathsAndTypes(json)
```

**Аргументы**

- `json` — [JSON](../../data-types/newjson.md) колонка.

**Возвращаемое значение**

- Отсортированная карта путей и типов [Map(String, Array(String))](../../data-types/map.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS test_json;
CREATE TABLE test_json(json JSON) ENGINE = Memory;
INSERT INTO test_json VALUES ('{"a" : 42, "b" : "Hello"}'), ('{"b" : [1, 2, 3], "c" : {"d" : {"e" : "2020-01-01"}}}'), ('{"a" : 43, "c" : {"d" : {"f" : [{"g" : 42}]}}}')
```

```sql
SELECT distinctJSONPathsAndTypes(json) FROM test_json;
```

Результат:

```reference
┌─distinctJSONPathsAndTypes(json)───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'a':['Int64'],'b':['Array(Nullable(Int64))','String'],'c.d.e':['Date'],'c.d.f':['Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))']} │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Примечание**

Если объявление JSON содержит пути с указанными типами, эти пути всегда будут включены в результат функций `distinctJSONPaths/distinctJSONPathsAndTypes`, даже если входные данные не содержат значений для этих путей.

```sql
DROP TABLE IF EXISTS test_json;
CREATE TABLE test_json(json JSON(a UInt32)) ENGINE = Memory;
INSERT INTO test_json VALUES ('{"b" : "Hello"}'), ('{"b" : "World", "c" : [1, 2, 3]}');
```

```sql
SELECT json FROM test_json;
```

```text
┌─json──────────────────────────────────┐
│ {"a":0,"b":"Hello"}                   │
│ {"a":0,"b":"World","c":["1","2","3"]} │
└───────────────────────────────────────┘
```

```sql
SELECT distinctJSONPaths(json) FROM test_json;
```

```text
┌─distinctJSONPaths(json)─┐
│ ['a','b','c']           │
└─────────────────────────┘
```

```sql
SELECT distinctJSONPathsAndTypes(json) FROM test_json;
```

```text
┌─distinctJSONPathsAndTypes(json)────────────────────────────────┐
│ {'a':['UInt32'],'b':['String'],'c':['Array(Nullable(Int64))']} │
└────────────────────────────────────────────────────────────────┘
```
