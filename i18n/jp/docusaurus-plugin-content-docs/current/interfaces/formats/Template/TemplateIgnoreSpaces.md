---
'alias': []
'description': 'TemplateIgnoreSpaces フォーマットのドキュメント'
'input_format': true
'keywords':
- 'TemplateIgnoreSpaces'
'output_format': false
'slug': '/interfaces/formats/TemplateIgnoreSpaces'
'title': 'TemplateIgnoreSpaces'
'doc_type': 'reference'
---

| 入力 | 出力 | エイリアス |
|------|------|-----------|
| ✔    | ✗    |           |

## 説明 {#description}

[`Template`]と似ていますが、入力ストリームの区切り文字と値の間のホワイトスペース文字をスキップします。
ただし、フォーマット文字列にホワイトスペース文字が含まれている場合、これらの文字は入力ストリームに期待されます。
また、空のプレースホルダー（`${}`または`${:None}`）を指定して、一部の区切り文字を別々の部分に分割し、それらの間のスペースを無視することも可能です。
このようなプレースホルダーは、ホワイトスペース文字をスキップするためだけに使用されます。
列の値がすべての行で同じ順序を持つ場合、このフォーマットを使用して`JSON`を読み取ることができます。

:::note
このフォーマットは入力のみに適しています。
:::

## 使用例 {#example-usage}

以下のリクエストは、フォーマット[JSON](/interfaces/formats/JSON)の出力例からデータを挿入するために使用できます：

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
