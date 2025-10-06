---
'alias': []
'description': 'JSONフォーマットに関するDocumentation'
'input_format': true
'keywords':
- 'JSON'
'output_format': true
'slug': '/interfaces/formats/JSON'
'title': 'JSON'
'doc_type': 'reference'
---


| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`JSON`フォーマットは、データをJSON形式で読み込み、出力します。

`JSON`フォーマットは以下を返します：

| パラメータ                    | 説明                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `meta`                       | カラム名とタイプ。                                                                                                                                                                                                                        |
| `data`                       | データテーブル                                                                                                                                                                                                                            |
| `rows`                       | 出力行の合計数。                                                                                                                                                                                                                          |
| `rows_before_limit_at_least` | LIMITなしであった場合の行数の下限推定。クエリがLIMITを含む場合にのみ出力されます。この推定は、制限変換前のクエリパイプラインで処理されたデータブロックから計算されますが、その後制限変換によって破棄されることがあります。クエリパイプラインでブロックが制限変換に到達しなかった場合、それらは推定に参加しません。|
| `statistics`                 | `elapsed`、`rows_read`、`bytes_read`などの統計。                                                                                                                                                                                        |
| `totals`                     | 総値（WITH TOTALSを使用している場合）。                                                                                                                                                                                                    |
| `extremes`                   | 極値（extremesが1に設定されている場合）。                                                                                                                                                                                                |

`JSON`タイプはJavaScriptと互換性があります。これを確保するために、一部の文字は追加でエスケープされます：
- スラッシュ`/`は`\/`としてエスケープされます。
- 一部のブラウザで破損する代替行の改行`U+2028`と`U+2029`は、`\uXXXX`としてエスケープされます。
- ASCII制御文字はエスケープされます：バックスペース、フォームフィード、ラインフィード、キャリッジリターン、そして水平タブはそれぞれ`\b`、`\f`、`\n`、`\r`、`\t`で置き換えられ、残りの00-1F範囲のバイトも`\uXXXX`シーケンスを使用してエスケープされます。
- 無効なUTF-8シーケンスは置換文字�に変更され、出力テキストは有効なUTF-8シーケンスで構成されます。

JavaScriptとの互換性のために、Int64およびUInt64整数はデフォルトで二重引用符で囲まれます。
引用符を除去するには、設定パラメーター[`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)を`0`に設定します。

ClickHouseは[NULL](/sql-reference/syntax.md)をサポートしており、JSON出力では`null`として表示されます。出力に`+nan`、`-nan`、`+inf`、`-inf`値を有効にするには、[output_format_json_quote_denormals](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)を`1`に設定します。

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

JSON入力フォーマットについて、[`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata)が`1`に設定されている場合、入力データのメタデータにあるタイプが、テーブルの対応するカラムのタイプと比較されます。

## 関連項目 {#see-also}

- [JSONEachRow](/interfaces/formats/JSONEachRow)フォーマット
- [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)設定
