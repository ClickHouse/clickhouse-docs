---
'alias': []
'description': 'TemplateIgnoreSpaces フォーマットのドキュメンテーション'
'input_format': true
'keywords':
- 'TemplateIgnoreSpaces'
'output_format': false
'slug': '/interfaces/formats/TemplateIgnoreSpaces'
'title': 'TemplateIgnoreSpaces'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

[`Template`] に似ていますが、入力ストリーム内の区切り文字と値の間のホワイトスペースをスキップします。ただし、フォーマット文字列にホワイトスペース文字が含まれている場合は、これらの文字が入力ストリームに存在することが期待されます。また、空のプレースホルダー（`${}` または `${:None}`）を指定して、いくつかの区切り文字を別々の部分に分割し、それらの間のスペースを無視させることもできます。これらのプレースホルダーはホワイトスペース文字をスキップするためのみに使用されます。すべての行でカラムの値の順序が同じであれば、このフォーマットを使用して `JSON` を読み込むことも可能です。

:::note
このフォーマットは入力にのみ適しています。
:::

## 使用例 {#example-usage}

次のリクエストは、フォーマット [JSON](/interfaces/formats/JSON) の出力例からデータを挿入するために使用できます：

```sql
INSERT INTO table_name 
SETTINGS
    format_template_resultset = '/some/path/resultset.format',
    format_template_row = '/some/path/row.format',
    format_template_rows_between_delimiter = ','
FORMAT TemplateIgnoreSpaces
```

```text title="/some/path/resultset.format"
{${}"meta"${}:${:JSON},${}"data"${}:${}[${data}]${},${}"totals"${}:${:JSON},${}"extremes"${}:${:JSON},${}"rows"${}:${:JSON},${}"rows_before_limit_at_least"${}:${:JSON}${}}
```

```text title="/some/path/row.format"
{${}"SearchPhrase"${}:${}${phrase:JSON}${},${}"c"${}:${}${cnt:JSON}${}}
```

## フォーマット設定 {#format-settings}
