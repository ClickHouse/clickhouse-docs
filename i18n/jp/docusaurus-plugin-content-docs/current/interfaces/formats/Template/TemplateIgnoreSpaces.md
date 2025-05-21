---
alias: []
description: 'TemplateIgnoreSpacesフォーマットのドキュメント'
input_format: true
keywords: ['TemplateIgnoreSpaces']
output_format: false
slug: /interfaces/formats/TemplateIgnoreSpaces
title: 'TemplateIgnoreSpaces'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

[`Template`] に似ていますが、入力ストリーム内のデリミタと値の間のホワイトスペース文字をスキップします。  
ただし、フォーマット文字列にホワイトスペース文字が含まれている場合、これらの文字は入力ストリームで期待されます。  
また、空のプレースホルダー（`${}` または `${:None}`）を指定して、一部のデリミタを別のパーツに分割し、その間のスペースを無視することができます。  
このようなプレースホルダーはホワイトスペース文字をスキップするためだけに使用されます。  
列の値がすべての行で同じ順序である場合、`JSON` をこのフォーマットを使用して読み込むことができます。

:::note
このフォーマットは入力専用です。
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
