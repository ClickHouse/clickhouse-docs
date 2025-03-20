---
title: TemplateIgnoreSpaces
slug: /interfaces/formats/TemplateIgnoreSpaces
keywords: [TemplateIgnoreSpaces]
input_format: true
output_format: false
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

[`Template`]に似ていますが、入力ストリーム内の区切り文字と値の間の空白文字をスキップします。 
ただし、フォーマット文字列に空白文字が含まれている場合、これらの文字は入力ストリームで期待されます。 
また、ある区切り文字を分割してその間のスペースを無視するための空のプレースホルダー（`${}`または`${:None}`）を指定することも可能です。 
これらのプレースホルダーは空白文字をスキップするためだけに使用されます。
すべての行でカラムの値の順序が同じであれば、このフォーマットを使用して`JSON`を読み取ることもできます。

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
