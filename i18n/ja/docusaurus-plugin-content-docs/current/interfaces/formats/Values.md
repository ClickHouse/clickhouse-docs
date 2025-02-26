---
title: 値
slug: /interfaces/formats/Values
keywords: [値]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|------|------|------------|
| ✔    | ✔    |            |

## 説明 {#description}

`Values` フォーマットは、各行を括弧内に印刷します。

- 行はカンマで区切られ、最後の行の後にカンマはありません。
- 括弧内の値もカンマ区切りです。
- 数字は引用符なしの十進法形式で出力されます。
- 配列は角括弧内に出力されます。
- 文字列、日付、および日時は引用符内に出力されます。
- エスケープルールとパーシングは、[TabSeparated](TabSeparated/TabSeparated.md) フォーマットに類似しています。

フォーマット中に余分なスペースは挿入されませんが、パーシング中には許可され、スキップされます（配列の値内のスペースは許可されません）。
[`NULL`](/sql-reference/syntax.md) は `NULL` として表現されます。

`Values` フォーマットでデータを渡す際にエスケープする必要がある最小限の文字セット：
- シングルクォート
- バックスラッシュ

これは `INSERT INTO t VALUES ...` で使用される形式ですが、クエリ結果のフォーマットにも使用できます。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                     | 説明                                                                                                                                                                                   | デフォルト |
|---------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                   | ストリーミングパーサーでフィールドを解析できなかった場合、SQLパーサーを実行し、SQL式として解釈しようとします。                                                                          | `true`     |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | ストリーミングパーサーでフィールドを解析できなかった場合、SQLパーサーを実行し、SQL式のテンプレートを推測し、すべての行をテンプレートを使用して解析し、すべての行の式を解釈しようとします。 | `true`     |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)         | テンプレートを使用して式を解析および解釈する際、リテラルの実際の型を確認し、オーバーフローや精度の問題を避けるために検査します。                                                           | `true`     |
