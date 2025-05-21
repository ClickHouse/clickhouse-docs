---
alias: []
description: 'JSONフォーマットに関するドキュメント'
input_format: true
keywords: ['JSON']
output_format: true
slug: /interfaces/formats/JSON
title: 'JSON'
---

| 入力 | 出力 | エイリアス |
|------|------|-----------|
| ✔    | ✔    |           |

## 説明 {#description}

`JSON`フォーマットは、データをJSON形式で読み込み、出力します。

`JSON`フォーマットは以下を返します：

| パラメーター                    | 説明                                                                                                                                                                                                                  |
|---------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `meta`                          | カラム名と型。                                                                                                                                                                                                      |
| `data`                          | データテーブル                                                                                                                                                                                                      |
| `rows`                          | 出力行の合計数。                                                                                                                                                                                                     |
| `rows_before_limit_at_least`    | LIMITなしで存在していたであろう最小行数。クエリにLIMITが含まれている場合のみ出力されます。クエリに`GROUP BY`が含まれている場合、rows_before_limit_at_leastは`LIMIT`なしで存在していた行の正確な数です。                      |
| `statistics`                    | `elapsed`、`rows_read`、`bytes_read`などの統計情報。                                                                                                                                                               |
| `totals`                        | 合計値（WITH TOTALSを使用する場合）。                                                                                                                                                                               |
| `extremes`                      | 極値（極値が1に設定されている場合）。                                                                                                                                                                               |

`JSON`型はJavaScriptと互換性があります。これを保証するために、一部の文字は追加でエスケープされます：
- スラッシュ `/` は `\/` にエスケープされます。
- 行を分割する代替の改行コード `U+2028` および `U+2029` は `\uXXXX` にエスケープされます。 
- ASCII制御文字はエスケープされます：バックスペース、フォームフィード、ラインフィード、キャリッジリターン、水平タブはそれぞれ `\b`、`\f`、`\n`、`\r`、`\t` に置き換えられ、00-1F範囲内の残りのバイトは `\uXXXX` シーケンスを使用して置き換えられます。
- 無効なUTF-8シーケンスは置換文字 � に変更されるため、出力テキストは有効なUTF-8シーケンスで構成されます。

JavaScriptとの互換性のために、Int64およびUInt64整数はデフォルトでダブルクォートで囲まれます。
クォートを取り除くには、設定パラメーター [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers) を `0` に設定します。

ClickHouseは[NULL](/sql-reference/syntax.md)をサポートしており、これはJSON出力で `null` として表示されます。出力に `+nan`、`-nan`、`+inf`、`-inf` の値を有効にするには、[output_format_json_quote_denormals](/operations/settings/settings-formats.md/#output_format_json_quote_denormals) を `1` に設定します。

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

JSON入力フォーマットに対して、設定 [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) が `1` に設定されている場合、入力データのメタデータからの型がテーブルの対応するカラムの型と比較されます。

## 他の情報 {#see-also}

- [JSONEachRow](/interfaces/formats/JSONEachRow) フォーマット
- [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows) 設定
