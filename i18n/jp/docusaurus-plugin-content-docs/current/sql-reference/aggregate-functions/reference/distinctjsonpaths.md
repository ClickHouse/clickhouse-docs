---
description: 'JSON 列に格納された一意なパスの一覧を算出します。'
sidebar_position: 216
slug: /sql-reference/aggregate-functions/reference/distinctjsonpaths
title: 'distinctJSONPaths'
doc_type: 'reference'
---

# distinctJSONPaths {#distinctjsonpaths}

[JSON](../../data-types/newjson.md) カラムに保存されているパスのうち、一意なもののリストを返します。

**構文**

```sql
distinctJSONPaths(json)
```

**引数**

* `json` — [JSON](../../data-types/newjson.md) 列。

**返される値**

* ソート済みのパスのリスト [Array(String)](../../data-types/array.md)。

**例**

クエリ:

```sql
DROP TABLE IF EXISTS test_json;
CREATE TABLE test_json(json JSON) ENGINE = Memory;
INSERT INTO test_json VALUES ('{"a" : 42, "b" : "Hello"}'), ('{"b" : [1, 2, 3], "c" : {"d" : {"e" : "2020-01-01"}}}'), ('{"a" : 43, "c" : {"d" : {"f" : [{"g" : 42}]}}}')
```

```sql
SELECT distinctJSONPaths(json) FROM test_json;
```

結果:

```reference
┌─distinctJSONPaths(json)───┐
│ ['a','b','c.d.e','c.d.f'] │
└───────────────────────────┘
```

# distinctJSONPathsAndTypes {#distinctjsonpathsandtypes}

[JSON](../../data-types/newjson.md) 列に保存されている一意なパスとその型の一覧を取得します。

**構文**

```sql
distinctJSONPathsAndTypes(json)
```

**引数**

* `json` — [JSON](../../data-types/newjson.md) 型の列。

**戻り値**

* パスと型の対応を表すソート済みマップ [Map(String, Array(String))](../../data-types/map.md)。

**例**

クエリ:

```sql
DROP TABLE IF EXISTS test_json;
CREATE TABLE test_json(json JSON) ENGINE = Memory;
INSERT INTO test_json VALUES ('{"a" : 42, "b" : "Hello"}'), ('{"b" : [1, 2, 3], "c" : {"d" : {"e" : "2020-01-01"}}}'), ('{"a" : 43, "c" : {"d" : {"f" : [{"g" : 42}]}}}')
```

```sql
SELECT distinctJSONPathsAndTypes(json) FROM test_json;
```

結果：

```reference
┌─distinctJSONPathsAndTypes(json)───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'a':['Int64'],'b':['Array(Nullable(Int64))','String'],'c.d.e':['Date'],'c.d.f':['Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))']} │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**注記**

JSON 宣言に型が指定されているパスが含まれている場合、入力データにそのパスの値が存在しない場合でも、これらのパスは常に `distinctJSONPaths/distinctJSONPathsAndTypes` 関数の結果に含まれます。

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
