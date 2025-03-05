---
title: 値
slug: /interfaces/formats/Values
keywords: [Values]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`Values` フォーマットは、すべての行を括弧内に表示します。

- 行はカンマで区切られ、最後の行の後にはカンマがありません。
- 括弧内の値もカンマで区切られています。
- 数字は引用符なしの10進法形式で出力されます。
- 配列は角括弧内に出力されます。
- 文字列、日付、日時のある日付は引用符内に出力されます。
- エスケープルールとパースは [TabSeparated](TabSeparated/TabSeparated.md) フォーマットに似ています。

フォーマット中に余分なスペースは挿入されませんが、パース中は許可され、スキップされます（ただし、配列値内のスペースは許可されません）。 
[`NULL`](/sql-reference/syntax.md) は `NULL` として表現されます。

`Values` フォーマットでデータを渡す際にエスケープする必要がある最小限の文字セット:
- シングルクォート
- バックスラッシュ

これは `INSERT INTO t VALUES ...` で使用されるフォーマットですが、クエリ結果のフォーマットにも使用できます。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                     | 説明                                                                                                                                                                                   | デフォルト |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                     | フィールドがストリーミングパーサーによってパースできなかった場合、SQLパーサーを実行し、SQL式として解釈しようとします。                                                                               | `true`  |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | フィールドがストリーミングパーサーによってパースできなかった場合、SQLパーサーを実行し、SQL式のテンプレートを推論し、すべての行をテンプレートを使ってパースし、その後すべての行のために式を解釈しようとします。 | `true`  |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)           | テンプレートを使用して式をパースおよび解釈する際に、リテラルの実際のタイプを確認して、オーバーフローや精度の問題を回避します。                                                       | `true`  |
