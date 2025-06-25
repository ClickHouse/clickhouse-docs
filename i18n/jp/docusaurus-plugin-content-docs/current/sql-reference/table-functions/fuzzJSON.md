---
'description': 'Perturbs a JSON string with random variations.'
'sidebar_label': 'fuzzJSON'
'sidebar_position': 75
'slug': '/sql-reference/table-functions/fuzzJSON'
'title': 'fuzzJSON'
---




# fuzzJSON テーブル関数

ランダムな変化を伴う JSON 文字列を変化させます。

## 構文 {#syntax}

```sql
fuzzJSON({ named_collection [, option=value [,..]] | json_str[, random_seed] })
```

## 引数 {#arguments}

| 引数                               | 説明                                                                                       |
|------------------------------------|---------------------------------------------------------------------------------------------|
| `named_collection`                 | [NAMED COLLECTION](sql-reference/statements/create/named-collection.md)。                     |
| `option=value`                     | Named collection のオプションパラメータとその値。                                         |
| `json_str` (String)                | JSON 形式の構造化データを表すソース文字列。                                               |
| `random_seed` (UInt64)             | 安定した結果を得るための手動ランダムシード。                                               |
| `reuse_output` (boolean)           | フェザリングプロセスからの出力を次のフェザーの入力として再利用します。                         |
| `malform_output` (boolean)         | JSON オブジェクトとして解析できない文字列を生成します。                                    |
| `max_output_length` (UInt64)       | 生成されたまたは変化させた JSON 文字列の最大許可長。                                       |
| `probability` (Float64)            | JSON フィールド（キー・バリューペア）をフェザリングする確率。範囲は [0, 1] にします。      |
| `max_nesting_level` (UInt64)       | JSON データ内のネストされた構造の最大許可深度。                                        |
| `max_array_size` (UInt64)          | JSON 配列の最大許可サイズ。                                                           |
| `max_object_size` (UInt64)         | 単一レベルの JSON オブジェクト内のフィールド数の最大許可数。                             |
| `max_string_value_length` (UInt64) | 文字列値の最大長。                                                                      |
| `min_key_length` (UInt64)          | 最小キー長。少なくとも 1 である必要があります。                                          |
| `max_key_length` (UInt64)          | 最大キー長。指定されている場合、`min_key_length` 以上でなければなりません。               |

## 戻り値 {#returned_value}

変化させた JSON 文字列を含む単一列のテーブルオブジェクト。

## 使用例 {#usage-example}

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

