---
slug: /sql-reference/table-functions/fuzzJSON
sidebar_position: 75
sidebar_label: fuzzJSON
title: 'fuzzJSON'
description: '扰动具有随机变化的 JSON 字符串。'
---


# fuzzJSON 表函数

扰动具有随机变化的 JSON 字符串。

``` sql
fuzzJSON({ named_collection [, option=value [,..]] | json_str[, random_seed] })
```

**参数**

- `named_collection` - 一个 [命名集合](sql-reference/statements/create/named-collection.md)。
- `option=value` - 命名集合的可选参数及其值。
 - `json_str` (字符串) - 表示以 JSON 格式结构化数据的源字符串。
 - `random_seed` (UInt64) - 手动随机种子，用于生成稳定的结果。
 - `reuse_output` (布尔值) - 将模糊处理的输出作为下一个模糊器的输入重复使用。
 - `malform_output` (布尔值) - 生成一个无法被解析为 JSON 对象的字符串。
 - `max_output_length` (UInt64) - 生成或扰动的 JSON 字符串的最大允许长度。
 - `probability` (Float64) - 扰动 JSON 字段（一个键值对）的概率。必须在 [0, 1] 范围内。
 - `max_nesting_level` (UInt64) - JSON 数据中嵌套结构的最大允许深度。
 - `max_array_size` (UInt64) - JSON 数组的最大允许大小。
 - `max_object_size` (UInt64) - JSON 对象的单一层次上允许的字段最大数量。
 - `max_string_value_length` (UInt64) - 字符串值的最大长度。
 - `min_key_length` (UInt64) - 最小键长度。应至少为 1。
 - `max_key_length` (UInt64) - 最大键长度。应大于或等于 `min_key_length`（如有指定）。

**返回值**

一个包含扰动 JSON 字符串的单列表对象。

## 使用示例 {#usage-example}

``` sql
CREATE NAMED COLLECTION json_fuzzer AS json_str='{}';
SELECT * FROM fuzzJSON(json_fuzzer) LIMIT 3;
```

``` text
{"52Xz2Zd4vKNcuP2":true}
{"UPbOhOQAdPKIg91":3405264103600403024}
{"X0QUWu8yT":[]}
```

``` sql
SELECT * FROM fuzzJSON(json_fuzzer, json_str='{"name" : "value"}', random_seed=1234) LIMIT 3;
```

``` text
{"key":"value", "mxPG0h1R5":"L-YQLv@9hcZbOIGrAn10%GA"}
{"BRE3":true}
{"key":"value", "SWzJdEJZ04nrpSfy":[{"3Q23y":[]}]}
```

``` sql
SELECT * FROM fuzzJSON(json_fuzzer, json_str='{"students" : ["Alice", "Bob"]}', reuse_output=true) LIMIT 3;
```

``` text
{"students":["Alice", "Bob"], "nwALnRMc4pyKD9Krv":[]}
{"students":["1rNY5ZNs0wU&82t_P", "Bob"], "wLNRGzwDiMKdw":[{}]}
{"xeEk":["1rNY5ZNs0wU&82t_P", "Bob"], "wLNRGzwDiMKdw":[{}, {}]}
```

``` sql
SELECT * FROM fuzzJSON(json_fuzzer, json_str='{"students" : ["Alice", "Bob"]}', max_output_length=512) LIMIT 3;
```

``` text
{"students":["Alice", "Bob"], "BREhhXj5":true}
{"NyEsSWzJdeJZ04s":["Alice", 5737924650575683711, 5346334167565345826], "BjVO2X9L":true}
{"NyEsSWzJdeJZ04s":["Alice", 5737924650575683711, 5346334167565345826], "BjVO2X9L":true, "k1SXzbSIz":[{}]}
```

``` sql
SELECT * FROM fuzzJSON('{"id":1}', 1234) LIMIT 3;
```

``` text
{"id":1, "mxPG0h1R5":"L-YQLv@9hcZbOIGrAn10%GA"}
{"BRjE":16137826149911306846}
{"XjKE":15076727133550123563}
```

``` sql
SELECT * FROM fuzzJSON(json_nc, json_str='{"name" : "FuzzJSON"}', random_seed=1337, malform_output=true) LIMIT 3;
```

``` text
U"name":"FuzzJSON*"SpByjZKtr2VAyHCO"falseh
{"name"keFuzzJSON, "g6vVO7TCIk":jTt^
{"DBhz":YFuzzJSON5}
```
