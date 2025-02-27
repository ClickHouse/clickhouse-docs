---
title : TemplateIgnoreSpaces
slug: /interfaces/formats/TemplateIgnoreSpaces
keywords : [TemplateIgnoreSpaces]
input_format: true
output_format: false
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

[`Template`]に似ていますが、入力ストリーム内のデリミタと値の間の空白文字をスキップします。
ただし、フォーマット文字列に空白文字が含まれている場合、これらの文字は入力ストリームに予期されます。
デリミタの間の空白を無視するために、空のプレースホルダー（`${}`または`${:None}`）を指定することも可能です。
このようなプレースホルダーは、空白文字をスキップするためのみに使用されます。
すべての行で列の値の順序が同じであれば、このフォーマットを使用して`JSON`を読み取ることも可能です。

:::note
このフォーマットは入力用のみです。
:::

## 使用例 {#example-usage}

以下のリクエストは、フォーマット[JSON](/interfaces/formats/JSON)の出力例からデータを挿入するために使用できます。

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
