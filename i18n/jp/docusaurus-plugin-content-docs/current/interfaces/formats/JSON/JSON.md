---
alias: []
description: 'JSON フォーマットに関するドキュメント'
input_format: true
keywords: ['JSON']
output_format: true
slug: /interfaces/formats/JSON
title: 'JSON'
doc_type: 'reference'
---

| Input | Output | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |



## 説明 {#description}

`JSON`フォーマットは、JSON形式でデータを読み取り、出力します。

`JSON`フォーマットは以下を返します:

| パラメータ                    | 説明                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta`                       | カラム名と型。                                                                                                                                                                                                                                                                                                                                                                                         |
| `data`                       | データテーブル                                                                                                                                                                                                                                                                                                                                                                                                     |
| `rows`                       | 出力行の総数。                                                                                                                                                                                                                                                                                                                                                                                                |
| `rows_before_limit_at_least` | LIMITがない場合に存在したであろう行数の下限推定値。クエリにLIMITが含まれている場合のみ出力されます。この推定値は、limit変換の前にクエリパイプラインで処理されたデータブロックから計算されますが、その後limit変換によって破棄される可能性があります。ブロックがクエリパイプライン内でlimit変換に到達しなかった場合、それらは推定に含まれません。 |
| `statistics`                 | `elapsed`、`rows_read`、`bytes_read`などの統計情報。                                                                                                                                                                                                                                                                                                                                                        |
| `totals`                     | 合計値(WITH TOTALSを使用する場合)。                                                                                                                                                                                                                                                                                                                                                                          |
| `extremes`                   | 極値(extremesが1に設定されている場合)。                                                                                                                                                                                                                                                                                                                                                                    |

`JSON`型はJavaScriptと互換性があります。これを保証するため、一部の文字は追加でエスケープされます:

- スラッシュ`/`は`\/`としてエスケープされます
- 一部のブラウザで問題を引き起こす代替改行文字`U+2028`と`U+2029`は`\uXXXX`としてエスケープされます。
- ASCII制御文字はエスケープされます:バックスペース、フォームフィード、ラインフィード、キャリッジリターン、水平タブは`\b`、`\f`、`\n`、`\r`、`\t`に置き換えられ、00-1Fの範囲の残りのバイトは`\uXXXX`シーケンスを使用します。
- 無効なUTF-8シーケンスは置換文字�に変更されるため、出力テキストは有効なUTF-8シーケンスで構成されます。

JavaScriptとの互換性のため、Int64およびUInt64整数はデフォルトで二重引用符で囲まれます。
引用符を削除するには、設定パラメータ[`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)を`0`に設定できます。

ClickHouseは[NULL](/sql-reference/syntax.md)をサポートしており、JSON出力では`null`として表示されます。出力で`+nan`、`-nan`、`+inf`、`-inf`の値を有効にするには、[output_format_json_quote_denormals](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)を`1`に設定してください。


## 使用例 {#example-usage}

例:

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase WITH TOTALS ORDER BY c DESC LIMIT 5 FORMAT JSON
```

```json
{
  "meta": [
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

  "data": [
    {
      "num": 42,
      "str": "hello",
      "arr": [0, 1]
    },
    {
      "num": 43,
      "str": "hello",
      "arr": [0, 1, 2]
    },
    {
      "num": 44,
      "str": "hello",
      "arr": [0, 1, 2, 3]
    }
  ],

  "rows": 3,

  "rows_before_limit_at_least": 3,

  "statistics": {
    "elapsed": 0.001137687,
    "rows_read": 3,
    "bytes_read": 24
  }
}
```


## フォーマット設定 {#format-settings}

JSON入力フォーマットでは、設定[`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata)を`1`に設定すると、入力データのメタデータに含まれる型がテーブルの対応するカラムの型と比較されます。


## 関連項目 {#see-also}

- [JSONEachRow](/interfaces/formats/JSONEachRow) 形式
- [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows) 設定
