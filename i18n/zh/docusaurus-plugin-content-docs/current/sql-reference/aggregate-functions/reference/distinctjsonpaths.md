---
'description': '计算存储在 JSON 列中的不同路径列表。'
'sidebar_position': 216
'slug': '/sql-reference/aggregate-functions/reference/distinctjsonpaths'
'title': 'distinctJSONPaths'
---


# distinctJSONPaths

计算存储在 [JSON](../../data-types/newjson.md) 列中的不同路径的列表。

**语法**

```sql
distinctJSONPaths(json)
```

**参数**

- `json` — [JSON](../../data-types/newjson.md) 列。

**返回值**

- 排序后的路径列表 [Array(String)](../../data-types/array.md)。

**示例**

查询：

```sql
DROP TABLE IF EXISTS test_json;
CREATE TABLE test_json(json JSON) ENGINE = Memory;
INSERT INTO test_json VALUES ('{"a" : 42, "b" : "Hello"}'), ('{"b" : [1, 2, 3], "c" : {"d" : {"e" : "2020-01-01"}}}'), ('{"a" : 43, "c" : {"d" : {"f" : [{"g" : 42}]}}}')
```

```sql
SELECT distinctJSONPaths(json) FROM test_json;
```

结果：

```reference
┌─distinctJSONPaths(json)───┐
│ ['a','b','c.d.e','c.d.f'] │
└───────────────────────────┘
```


# distinctJSONPathsAndTypes

计算存储在 [JSON](../../data-types/newjson.md) 列中的不同路径及其类型的列表。

**语法**

```sql
distinctJSONPathsAndTypes(json)
```

**参数**

- `json` — [JSON](../../data-types/newjson.md) 列。

**返回值**

- 排序后的路径和类型映射 [Map(String, Array(String))](../../data-types/map.md)。

**示例**

查询：

```sql
DROP TABLE IF EXISTS test_json;
CREATE TABLE test_json(json JSON) ENGINE = Memory;
INSERT INTO test_json VALUES ('{"a" : 42, "b" : "Hello"}'), ('{"b" : [1, 2, 3], "c" : {"d" : {"e" : "2020-01-01"}}}'), ('{"a" : 43, "c" : {"d" : {"f" : [{"g" : 42}]}}}')
```

```sql
SELECT distinctJSONPathsAndTypes(json) FROM test_json;
```

结果：

```reference
┌─distinctJSONPathsAndTypes(json)───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'a':['Int64'],'b':['Array(Nullable(Int64))','String'],'c.d.e':['Date'],'c.d.f':['Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))']} │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**注意**

如果 JSON 声明包含指定类型的路径，即使输入数据没有这些路径的值，这些路径也将始终包含在 `distinctJSONPaths/distinctJSONPathsAndTypes` 函数的结果中。

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
