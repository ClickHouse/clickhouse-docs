---
'description': '对 JSON 字符串进行随机变化。'
'sidebar_label': 'fuzzJSON'
'sidebar_position': 75
'slug': '/sql-reference/table-functions/fuzzJSON'
'title': 'fuzzJSON'
'doc_type': 'reference'
---


# fuzzJSON 表函数

通过随机变体扰动 JSON 字符串。

## 语法 {#syntax}

```sql
fuzzJSON({ named_collection [, option=value [,..]] | json_str[, random_seed] })
```

## 参数 {#arguments}

| 参数                                 | 描述                                                                                      |
|--------------------------------------|-------------------------------------------------------------------------------------------|
| `named_collection`                   | 一个 [NAMED COLLECTION](sql-reference/statements/create/named-collection.md)。             |
| `option=value`                       | 命名集合的可选参数及其值。                                                               |
| `json_str` (字符串)                  | 表示结构化数据的 JSON 格式的源字符串。                                                   |
| `random_seed` (UInt64)               | 用于生成稳定结果的手动随机种子。                                                         |
| `reuse_output` (布尔值)             | 将一个模糊处理过程的输出重用作为下一个模糊器的输入。                                     |
| `malform_output` (布尔值)           | 生成一个无法解析为 JSON 对象的字符串。                                                   |
| `max_output_length` (UInt64)         | 生成或扰动的 JSON 字符串的最大允许长度。                                                 |
| `probability` (Float64)              | 模糊 JSON 字段（键值对）的概率。必须在 [0, 1] 范围内。                                   |
| `max_nesting_level` (UInt64)         | JSON 数据中嵌套结构的最大允许深度。                                                     |
| `max_array_size` (UInt64)            | JSON 数组的最大允许大小。                                                                |
| `max_object_size` (UInt64)           | 单个 JSON 对象的一层中字段的最大允许数。                                                |
| `max_string_value_length` (UInt64)   | 字符串值的最大长度。                                                                      |
| `min_key_length` (UInt64)            | 最小键长度。应至少为 1。                                                                |
| `max_key_length` (UInt64)            | 最大键长度。如果指定，应大于或等于 `min_key_length`。                                   |

## 返回值 {#returned_value}

一个表对象，包含一个包含扰动 JSON 字符串的单列。

## 使用示例 {#usage-example}

```sql
CREATE NAMED COLLECTION json_fuzzer AS json_str='{}';
SELECT * FROM fuzzJSON(json_fuzzer) LIMIT 3;
```

```text
{"52Xz2Zd4vKNcuP2":true}
{"UPbOhOQAdPKIg91":3405264103600403024}
{"X0QUWu8yT":[]}
```

```sql
SELECT * FROM fuzzJSON(json_fuzzer, json_str='{"name" : "value"}', random_seed=1234) LIMIT 3;
```

```text
{"key":"value", "mxPG0h1R5":"L-YQLv@9hcZbOIGrAn10%GA"}
{"BRE3":true}
{"key":"value", "SWzJdEJZ04nrpSfy":[{"3Q23y":[]}]}
```

```sql
SELECT * FROM fuzzJSON(json_fuzzer, json_str='{"students" : ["Alice", "Bob"]}', reuse_output=true) LIMIT 3;
```

```text
{"students":["Alice", "Bob"], "nwALnRMc4pyKD9Krv":[]}
{"students":["1rNY5ZNs0wU&82t_P", "Bob"], "wLNRGzwDiMKdw":[{}]}
{"xeEk":["1rNY5ZNs0wU&82t_P", "Bob"], "wLNRGzwDiMKdw":[{}, {}]}
```

```sql
SELECT * FROM fuzzJSON(json_fuzzer, json_str='{"students" : ["Alice", "Bob"]}', max_output_length=512) LIMIT 3;
```

```text
{"students":["Alice", "Bob"], "BREhhXj5":true}
{"NyEsSWzJdeJZ04s":["Alice", 5737924650575683711, 5346334167565345826], "BjVO2X9L":true}
{"NyEsSWzJdeJZ04s":["Alice", 5737924650575683711, 5346334167565345826], "BjVO2X9L":true, "k1SXzbSIz":[{}]}
```

```sql
SELECT * FROM fuzzJSON('{"id":1}', 1234) LIMIT 3;
```

```text
{"id":1, "mxPG0h1R5":"L-YQLv@9hcZbOIGrAn10%GA"}
{"BRjE":16137826149911306846}
{"XjKE":15076727133550123563}
```

```sql
SELECT * FROM fuzzJSON(json_nc, json_str='{"name" : "FuzzJSON"}', random_seed=1337, malform_output=true) LIMIT 3;
```

```text
U"name":"FuzzJSON*"SpByjZKtr2VAyHCO"falseh
{"name"keFuzzJSON, "g6vVO7TCIk":jTt^
{"DBhz":YFuzzJSON5}
```
