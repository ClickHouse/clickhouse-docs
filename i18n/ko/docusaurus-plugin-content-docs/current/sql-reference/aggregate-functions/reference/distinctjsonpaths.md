---
'description': 'JSON 컬럼에 저장된 고유 경로 목록을 계산합니다.'
'sidebar_position': 216
'slug': '/sql-reference/aggregate-functions/reference/distinctjsonpaths'
'title': 'distinctJSONPaths'
'doc_type': 'reference'
---


# distinctJSONPaths

[JSON](../../data-types/newjson.md) 컬럼에 저장된 고유 경로 목록을 계산합니다.

**구문**

```sql
distinctJSONPaths(json)
```

**인수**

- `json` — [JSON](../../data-types/newjson.md) 컬럼.

**반환 값**

- 정렬된 경로 목록 [Array(String)](../../data-types/array.md).

**예제**

쿼리:

```sql
DROP TABLE IF EXISTS test_json;
CREATE TABLE test_json(json JSON) ENGINE = Memory;
INSERT INTO test_json VALUES ('{"a" : 42, "b" : "Hello"}'), ('{"b" : [1, 2, 3], "c" : {"d" : {"e" : "2020-01-01"}}}'), ('{"a" : 43, "c" : {"d" : {"f" : [{"g" : 42}]}}}')
```

```sql
SELECT distinctJSONPaths(json) FROM test_json;
```

결과:

```reference
┌─distinctJSONPaths(json)───┐
│ ['a','b','c.d.e','c.d.f'] │
└───────────────────────────┘
```


# distinctJSONPathsAndTypes

[JSON](../../data-types/newjson.md) 컬럼에 저장된 고유 경로와 그 유형의 목록을 계산합니다.

**구문**

```sql
distinctJSONPathsAndTypes(json)
```

**인수**

- `json` — [JSON](../../data-types/newjson.md) 컬럼.

**반환 값**

- 경로와 유형의 정렬된 맵 [Map(String, Array(String))](../../data-types/map.md).

**예제**

쿼리:

```sql
DROP TABLE IF EXISTS test_json;
CREATE TABLE test_json(json JSON) ENGINE = Memory;
INSERT INTO test_json VALUES ('{"a" : 42, "b" : "Hello"}'), ('{"b" : [1, 2, 3], "c" : {"d" : {"e" : "2020-01-01"}}}'), ('{"a" : 43, "c" : {"d" : {"f" : [{"g" : 42}]}}}')
```

```sql
SELECT distinctJSONPathsAndTypes(json) FROM test_json;
```

결과:

```reference
┌─distinctJSONPathsAndTypes(json)───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'a':['Int64'],'b':['Array(Nullable(Int64))','String'],'c.d.e':['Date'],'c.d.f':['Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))']} │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**참고**

JSON 선언에 특정 유형을 가진 경로가 포함된 경우, 이러한 경로는 입력 데이터에 이러한 경로의 값이 없더라도 항상 `distinctJSONPaths/distinctJSONPathsAndTypes` 함수의 결과에 포함됩니다.

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
