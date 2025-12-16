---
alias: []
description: 'Values 形式に関するドキュメント'
input_format: true
keywords: ['Values']
output_format: true
slug: /interfaces/formats/Values
title: 'Values'
doc_type: 'guide'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |



## 説明 {#description}

`Values` 形式は、各行を丸括弧で囲んで出力します。

- 行同士はカンマで区切られ、最後の行の後にはカンマは付きません。
- 丸括弧内の値もカンマ区切りです。
- 数値は、引用符なしの 10 進数形式で出力されます。
- 配列は角括弧で出力されます。
- 文字列、日付、および日時は引用符で囲んで出力されます。
- エスケープ規則とパースは [TabSeparated](TabSeparated/TabSeparated.md) 形式と同様です。

フォーマット時には余分なスペースは挿入されませんが、パース時には（配列要素内のスペースを除き）スペースがあっても許可され、スキップされます。  
[`NULL`](/sql-reference/syntax.md) は `NULL` として表現されます。

`Values` 形式でデータを渡す際に、最低限エスケープが必要な文字は次のとおりです。
- シングルクォート
- バックスラッシュ

この形式は `INSERT INTO t VALUES ...` で使用されますが、クエリ結果のフォーマットにも使用できます。



## 使用例 {#example-usage}



## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                       | 説明                                                                                                                                                                                             | 既定値 |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                     | フィールドをストリーミングパーサーで解析できなかった場合、SQL パーサーを実行し、SQL 式として解釈しようとします。                                                                                 | `true` |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | フィールドをストリーミングパーサーで解析できなかった場合、SQL パーサーを実行して SQL 式のテンプレートを推定し、そのテンプレートを使ってすべての行の解析を試みたうえで、全行について式を解釈します。 | `true` |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)           | テンプレートを使用して式を解析および解釈する際に、リテラルの実際の型を確認し、オーバーフローや精度の問題を回避します。                                                                           | `true` |
