---
title: JSON
slug: /interfaces/formats/JSON
keywords: [JSON]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`JSON`フォーマットは、データをJSON形式で読み込み、出力します。

`JSON`フォーマットは以下を返します：

| パラメータ                    | 説明                                                                                                                                                                                                                                |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `meta`                       | カラム名とタイプ。                                                                                                                                                                                                                    |
| `data`                       | データテーブル                                                                                                                                                                                                                                |
| `rows`                       | 出力行の総数。                                                                                                                                                                                                           |
| `rows_before_limit_at_least` | LIMITがなかった場合に存在したであろう最小限の行数。クエリにLIMITが含まれている場合のみ出力されます。クエリに`GROUP BY`が含まれている場合、rows_before_limit_at_leastは`LIMIT`なしで存在したであろう正確な行数です。 |
| `statistics`                 | `elapsed`、`rows_read`、`bytes_read`などの統計。                                                                                                                                                                                   |
| `totals`                     | 合計値（WITH TOTALSを使用している場合）。                                                                                                                                                                                                     |
| `extremes`                   | 極端な値（extremesが1に設定されている場合）。                                                                                                                                                                                               |

`JSON`タイプはJavaScriptと互換性があります。そのため、いくつかの文字は追加でエスケープされます：
- スラッシュ`/`は`\/`としてエスケープされます。
- 一部のブラウザで問題を起こす代替行区切り`U+2028`および`U+2029`は`\uXXXX`としてエスケープされます。
- ASCII制御文字（バックスペース、フォームフィード、ラインフィード、キャリッジリターン、水平タブ）はそれぞれ`\b`、`\f`、`\n`、`\r`、`\t`で置き換えられ、00-1F範囲内の残りのバイトは`\uXXXX`シーケンスでエスケープされます。
- 無効なUTF-8シーケンスは置換文字�に変更され、出力テキストは有効なUTF-8シーケンスとなります。

JavaScriptとの互換性のために、Int64およびUInt64整数はデフォルトで二重引用符で囲まれます。
引用符を除去するには、設定パラメータ[`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)を`0`に設定します。

ClickHouseは[NULL](/sql-reference/syntax.md)をサポートしており、これはJSON出力で`null`として表示されます。出力で`+nan`、`-nan`、`+inf`、`-inf`の値を有効にするには、[output_format_json_quote_denormals](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)を`1`に設定します。

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

JSON入力フォーマットの場合、設定[`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata)が`1`に設定されていると、
入力データのメタデータからのタイプがテーブルの対応するカラムのタイプと比較されます。

## 関連情報 {#see-also}

- [JSONEachRow](/interfaces/formats/JSONEachRow)フォーマット
- [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)設定
