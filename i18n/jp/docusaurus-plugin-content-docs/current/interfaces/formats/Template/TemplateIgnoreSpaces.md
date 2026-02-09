---
alias: []
description: 'TemplateIgnoreSpaces フォーマットのドキュメント'
input_format: true
keywords: ['TemplateIgnoreSpaces']
output_format: false
slug: /interfaces/formats/TemplateIgnoreSpaces
title: 'TemplateIgnoreSpaces'
doc_type: 'reference'
---

| 入力 | 出力 | 別名 |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 \{#description\}

[`Template`] と似ていますが、入力ストリーム内のデリミタと値の間にある空白文字をスキップします。  
ただし、フォーマット文字列に空白文字が含まれている場合、その空白文字は入力ストリーム内にも存在している必要があります。  
また、空白を無視するために、あるデリミタを複数の部分に分割する目的で空のプレースホルダー（`${}` または `${:None}`）を指定することもできます。  
このようなプレースホルダーは、空白文字をスキップする場合にのみ使用されます。  
すべての行で列の値の順序が同じであれば、このフォーマットを使って `JSON` を読み込むことも可能です。

:::note
このフォーマットは入力専用です。
:::

## 使用例 \{#example-usage\}

以下のリクエストを使用すると、[JSON](/interfaces/formats/JSON) 形式の出力例からデータを挿入できます。

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

## フォーマット設定 \{#format-settings\}