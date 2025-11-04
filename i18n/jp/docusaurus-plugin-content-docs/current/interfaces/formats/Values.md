---
'alias': []
'description': 'ValuesフォーマットのDocumentation'
'input_format': true
'keywords':
- 'Values'
'output_format': true
'slug': '/interfaces/formats/Values'
'title': 'Values'
'doc_type': 'guide'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`Values` フォーマットは各行を括弧で印刷します。

- 行はカンマで区切られ、最後の行の後にはカンマがありません。
- 括弧内の値もカンマで区切られます。
- 数字は引用符なしの十進法形式で出力されます。
- 配列は角括弧で出力されます。
- 文字列、日付、および時間付きの日付は引用符で出力されます。
- エスケープルールおよびパースは [TabSeparated](TabSeparated/TabSeparated.md) フォーマットに似ています。

フォーマット中には余分なスペースは挿入されませんが、パース中には許可されていてスキップされます（配列内の値のスペースは許可されません）。
[`NULL`](/sql-reference/syntax.md) は `NULL` として表現されます。

`Values` フォーマットでデータを渡す際にエスケープする必要がある最小の文字セットは次の通りです：
- シングルクオート
- バックスラッシュ

これは `INSERT INTO t VALUES ...` で使用されるフォーマットですが、クエリ結果のフォーマットにも使用できます。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                     | 説明                                                                                                                                                                                   | デフォルト |
|---------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                     | フィールドがストリーミングパーサーによって解析できない場合、SQLパーサーを実行し、SQL式として解釈を試みます。                                                                               | `true`    |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | フィールドがストリーミングパーサーによって解析できない場合、SQLパーサーを実行し、SQL式のテンプレートを推測し、すべての行をそのテンプレートを使用して解析し、その後すべての行の式を解釈します。 | `true`    |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)           | テンプレートを使用して式を解析および解釈する際、リテラルの実際の型を確認してオーバーフローや精度の問題を避けます。                                                               | `true`    |
