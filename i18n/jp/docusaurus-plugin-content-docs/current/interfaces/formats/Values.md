---
'alias': []
'description': '値の形式のドキュメント'
'input_format': true
'keywords':
- 'Values'
'output_format': true
'slug': '/interfaces/formats/Values'
'title': 'Values'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`Values` フォーマットは、各行をカッコ内に表示します。

- 行はカンマで区切られ、最後の行の後にはカンマが付きません。
- カッコ内の値もカンマで区切られます。
- 数値は引用符なしで小数形式で出力されます。
- 配列は角括弧内に出力されます。
- 文字列、日付、及び時間付きの日付は引用符内に出力されます。
- エスケープルールと解析は [TabSeparated](TabSeparated/TabSeparated.md) フォーマットに似ています。

フォーマット中は余分なスペースは挿入されませんが、解析中は許可され、スキップされます（配列の値内のスペースは許可されていません）。 
[`NULL`](/sql-reference/syntax.md) は `NULL` として表されます。

`Values` フォーマットでデータを渡す際にエスケープする必要がある最低限の文字セットは次の通りです：
- シングルクォート
- バックスラッシュ

これは `INSERT INTO t VALUES ...` で使用されるフォーマットですが、クエリ結果のフォーマットにも使用できます。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                      | 説明                                                                                                                                                                                           | デフォルト |
|---------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| [`input_format_values_interpret_expressions`](../../operations/settings/settings-formats.md/#input_format_values_interpret_expressions)                | フィールドがストリーミングパーサーによって解析できなかった場合、SQLパーサーを実行し、SQL式として解釈を試みます。                                                                      | `true`    |
| [`input_format_values_deduce_templates_of_expressions`](../../operations/settings/settings-formats.md/#input_format_values_deduce_templates_of_expressions) | フィールドがストリーミングパーサーによって解析できなかった場合、SQLパーサーを実行し、SQL式のテンプレートを推測し、そのテンプレートを使用してすべての行を解析し、その後すべての行の式を解釈しようとします。 | `true`    |
| [`input_format_values_accurate_types_of_literals`](../../operations/settings/settings-formats.md/#input_format_values_accurate_types_of_literals)      | テンプレートを使用して式を解析および解釈する際に、リテラルの実際の型を確認して、オーバーフローや精度の問題を避けます。                                                            | `true`    |
