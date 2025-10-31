---
'description': 'JSON文字列をランダムな変化で摂動させます。'
'sidebar_label': 'fuzzJSON'
'sidebar_position': 75
'slug': '/sql-reference/table-functions/fuzzJSON'
'title': 'fuzzJSON'
'doc_type': 'reference'
---


# fuzzJSON テーブル関数

ランダムな変化を伴うJSON文字列を生成します。

## 構文 {#syntax}

```sql
fuzzJSON({ named_collection [, option=value [,..]] | json_str[, random_seed] })
```

## 引数 {#arguments}

| 引数                                 | 説明                                                                                       |
|--------------------------------------|--------------------------------------------------------------------------------------------|
| `named_collection`                   | A [NAMED COLLECTION](sql-reference/statements/create/named-collection.md).                 |
| `option=value`                       | Named collectionのオプションパラメータとその値。                                           |
| `json_str`（String）                 | 構造化されたデータをJSON形式で表現するソース文字列。                                        |
| `random_seed`（UInt64）              | 安定した結果を生成するための手動ランダムシード。                                          |
| `reuse_output`（boolean）            | 前回のファジングプロセスの出力を次のファズァの入力として再利用する。                          |
| `malform_output`（boolean）          | JSONオブジェクトとしてパースできない文字列を生成します。                                     |
| `max_output_length`（UInt64）        | 生成または変化したJSON文字列の最大許容長。                                               |
| `probability`（Float64）             | JSONフィールド（キーと値のペア）をファズする確率。0から1の範囲内でなければならない。          |
| `max_nesting_level`（UInt64）        | JSONデータ内のネストされた構造の最大許容深さ。                                           |
| `max_array_size`（UInt64）           | JSON配列の最大許容サイズ。                                                                  |
| `max_object_size`（UInt64）          | JSONオブジェクトの単一レベルにおける最大フィールド数。                                     |
| `max_string_value_length`（UInt64）  | String値の最大長。                                                                          |
| `min_key_length`（UInt64）           | 最小キー長。少なくとも1である必要があります。                                              |
| `max_key_length`（UInt64）           | 最大キー長。指定されている場合は、`min_key_length`以上である必要があります。                |

## 戻り値 {#returned_value}

変化したJSON文字列を含む単一カラムのテーブルオブジェクト。

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
```
