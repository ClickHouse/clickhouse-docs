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

| Input | Output | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |



## 説明 {#description}

`Values`形式は、すべての行を括弧で囲んで出力します。

- 行はカンマで区切られ、最後の行の後にはカンマは付きません。
- 括弧内の値もカンマで区切られます。
- 数値は引用符なしの10進数形式で出力されます。
- 配列は角括弧で出力されます。
- 文字列、日付、および日時は引用符で囲んで出力されます。
- エスケープ規則と解析は[TabSeparated](TabSeparated/TabSeparated.md)形式と同様です。

フォーマット時には余分なスペースは挿入されませんが、解析時にはスペースが許可され、スキップされます(配列値内のスペースは許可されません)。
[`NULL`](/sql-reference/syntax.md)は`NULL`として表現されます。

`Values`形式でデータを渡す際にエスケープする必要がある最小限の文字セット:

- 単一引用符
- バックスラッシュ

これは`INSERT INTO t VALUES ...`で使用される形式ですが、クエリ結果のフォーマットにも使用できます。


## 使用例 {#example-usage}


## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                     | 説明                                                                                                                                                                                   | デフォルト |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                     | ストリーミングパーサーでフィールドを解析できない場合、SQLパーサーを実行してSQL式として解釈を試みます。                                                                               | `true`  |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | ストリーミングパーサーでフィールドを解析できない場合、SQLパーサーを実行してSQL式のテンプレートを推定し、テンプレートを使用してすべての行を解析した後、すべての行の式を解釈します。 | `true`  |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)           | テンプレートを使用して式を解析および解釈する際、オーバーフローや精度の問題を回避するためにリテラルの実際の型をチェックします。                                                       | `true`  |
