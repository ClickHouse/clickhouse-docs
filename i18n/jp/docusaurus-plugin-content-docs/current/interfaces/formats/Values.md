---
alias: []
description: '値フォーマットに関するドキュメント'
input_format: true
keywords: ['Values']
output_format: true
slug: /interfaces/formats/Values
title: 'Values'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`Values` フォーマットは、各行を括弧内に印刷します。

- 行はコンマで区切られ、最後の行の後にはコンマがありません。
- 括弧の中の値もコンマで区切られています。
- 数字は引用符なしの10進数形式で出力されます。
- 配列は角括弧で出力されます。
- 文字列、日付、時間付きの日付は引用符で出力されます。
- エスケープルールとパースは、[TabSeparated](TabSeparated/TabSeparated.md) フォーマットに似ています。

フォーマット中に余分なスペースは挿入されませんが、パース中は許可され、スキップされます（配列の値の内部のスペースは許可されません）。
[`NULL`](/sql-reference/syntax.md) は `NULL` として表されます。

`Values` フォーマットでデータを渡す際にエスケープする必要がある最小限の文字セットは次の通りです：
- シングルクォート
- バックスラッシュ

これは `INSERT INTO t VALUES ...` で使用されるフォーマットですが、クエリ結果のフォーマットにも使用できます。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                     | 説明                                                                                                                                                                                   | デフォルト |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                     | フィールドがストリーミングパーサーによってパースできなかった場合、SQLパーサーを実行してそれをSQL式として解釈しようとします。                                                                               | `true`  |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | フィールドがストリーミングパーサーによってパースできなかった場合、SQLパーサーを実行してSQL式のテンプレートを推測し、このテンプレートを使って全行をパースした後、全行に対して式を解釈しようとします。 | `true`  |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)           | テンプレートを使用して式をパースおよび解釈する際に、リテラルの実際のタイプを確認して、オーバーフローや精度の問題を回避します。                                                       | `true`  |
