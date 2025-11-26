---
alias: []
description: 'JSON 形式のドキュメント'
input_format: true
keywords: ['JSON']
output_format: true
slug: /interfaces/formats/JSON
title: 'JSON'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |



## 説明 {#description}

`JSON` フォーマットは、データを JSON 形式で読み取りおよび出力します。 

`JSON` フォーマットは、以下の内容を返します。 

| Parameter                    | Description                                                                                                                                                                                                                                |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `meta`                       | 列名とデータ型。                                                                                                                                                                                                                           |
| `data`                       | データ本体。                                                                                                                                                                                                                               |
| `rows`                       | 出力行の総数。                                                                                                                                                                                                                             |
| `rows_before_limit_at_least` | LIMIT がなかった場合の行数の下限推定値。クエリに LIMIT が含まれる場合にのみ出力されます。この推定値は、リミット変換前にクエリパイプラインで処理されたデータブロックから計算されますが、その後リミット変換によって破棄されることがあります。クエリパイプラインでデータブロックがリミット変換に到達しなかった場合、それらは推定には含まれません。 |
| `statistics`                 | `elapsed`、`rows_read`、`bytes_read` などの統計情報。                                                                                                                                                                                       |
| `totals`                     | （WITH TOTALS を使用した場合の）合計値。                                                                                                                                                                                                   |
| `extremes`                   | （extremes が 1 に設定されている場合の）極値。                                                                                                                                                                                             |

`JSON` 型は JavaScript と互換性があります。そのため、いくつかの文字が追加でエスケープされます。 
- スラッシュ `/` は `\/` にエスケープされます。
- 一部のブラウザで問題を起こす代替改行文字 `U+2028` および `U+2029` は `\uXXXX` としてエスケープされます。 
- ASCII 制御文字はエスケープされます。バックスペース、フォームフィード、ラインフィード、キャリッジリターン、および水平タブはそれぞれ `\b`、`\f`、`\n`、`\r`、`\t` に置き換えられ、それ以外の 00-1F 範囲のバイトも `\uXXXX` シーケンスとして出力されます。 
- 無効な UTF-8 シーケンスは置換文字 `�` に変換されるため、出力テキストは有効な UTF-8 シーケンスのみで構成されます。 

JavaScript との互換性のため、Int64 および UInt64 の整数はデフォルトで二重引用符で囲まれます。 
引用符を外すには、設定パラメータ [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers) を `0` に設定します。

ClickHouse は [NULL](/sql-reference/syntax.md) をサポートしており、JSON 出力では `null` として表示されます。出力で `+nan`、`-nan`、`+inf`、`-inf` の値を有効にするには、[`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals) を `1` に設定します。



## 使用例

例：

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase WITH TOTALS ORDER BY c DESC LIMIT 5 FORMAT JSON
```

```json
{
        "meta":
        [
                {
                        "name": "num",
                        "type": "Int32"
                },
                {
                        "name": "str",
                        "type": "String"
                },
                {
                        "name": "arr",
                        "type": "Array(UInt8)"
                }
        ],

        "data":
        [
                {
                        "num": 42,
                        "str": "hello",
                        "arr": [0,1]
                },
                {
                        "num": 43,
                        "str": "hello",
                        "arr": [0,1,2]
                },
                {
                        "num": 44,
                        "str": "hello",
                        "arr": [0,1,2,3]
                }
        ],

        "rows": 3,

        "rows_before_limit_at_least": 3,

        "statistics":
        {
                "elapsed": 0.001137687,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```


## フォーマット設定 {#format-settings}

JSON 入力フォーマットの場合、設定 [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) が `1` に設定されていると、入力データ内のメタデータに含まれる型が、テーブル内の対応する列の型と照合されます。



## 関連項目 {#see-also}

- [JSONEachRow](/interfaces/formats/JSONEachRow) 形式
- [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows) 設定
