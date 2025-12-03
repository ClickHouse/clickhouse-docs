---
alias: []
description: 'JSON 形式に関するドキュメント'
input_format: true
keywords: ['JSON']
output_format: true
slug: /interfaces/formats/JSON
title: 'JSON'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`JSON` フォーマットは、JSON 形式でデータの読み取りおよび出力を行います。

`JSON` フォーマットは次の内容を返します。

| Parameter                    | Description                                                                                                                                                                                                                                |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `meta`                       | 列名と型。                                                                                                                                                                                                                                  |
| `data`                       | データテーブル。                                                                                                                                                                                                                           |
| `rows`                       | 出力される行数の合計。                                                                                                                                                                                                                     |
| `rows_before_limit_at_least` | `LIMIT` がなかった場合に存在し得る行数の下限推定値。クエリに `LIMIT` が含まれている場合にのみ出力されます。この推定値は、limit 変換の実行前にクエリパイプラインで処理されたデータブロックから計算されますが、その後 limit 変換によって破棄される可能性があります。クエリパイプラインでデータブロックが limit 変換に到達しなかった場合、それらは推定に含まれません。 |
| `statistics`                 | `elapsed`、`rows_read`、`bytes_read` などの統計情報。                                                                                                                                                                                       |
| `totals`                     | （`WITH TOTALS` を使用している場合の）合計値。                                                                                                                                                                                             |
| `extremes`                   | （`extremes` が 1 に設定されている場合の）極値。                                                                                                                                                                                           |

`JSON` 型は JavaScript と互換性があります。この互換性を確保するため、いくつかの文字は追加でエスケープされます。

- スラッシュ `/` は `\/` としてエスケープされます。
- 一部のブラウザで問題を引き起こす代替改行文字 `U+2028` および `U+2029` は `\uXXXX` としてエスケープされます。
- ASCII 制御文字はエスケープされます。バックスペース、フォームフィード、ラインフィード、キャリッジリターン、および水平タブはそれぞれ `\b`、`\f`、`\n`、`\r`、`\t` に置き換えられ、さらに 00-1F の範囲の残りのバイトは `\uXXXX` シーケンスで表現されます。
- 無効な UTF-8 シーケンスは代替文字 � に置き換えられ、出力テキストが有効な UTF-8 シーケンスのみで構成されるようにします。

JavaScript との互換性のため、Int64 および UInt64 整数はデフォルトで二重引用符で囲まれます。
引用符を削除するには、設定パラメータ [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers) を `0` に設定します。

ClickHouse は [NULL](/sql-reference/syntax.md) をサポートしており、JSON 出力では `null` として表示されます。出力で `+nan`、`-nan`、`+inf`、`-inf` の値を有効にするには、[`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals) を `1` に設定します。

## 使用例 {#example-usage}

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

JSON 入力フォーマットの場合、[`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) 設定が `1` に設定されていると、入力データ内のメタデータに含まれる型が、テーブル内の対応する列の型と照合されます。

## 関連項目 {#see-also}

- [JSONEachRow](/interfaces/formats/JSONEachRow) フォーマット
- [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows) 設定