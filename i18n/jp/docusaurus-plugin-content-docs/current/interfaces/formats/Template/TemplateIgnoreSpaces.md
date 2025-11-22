---
alias: []
description: 'TemplateIgnoreSpaces フォーマットに関するドキュメント'
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



## Description {#description}

[`Template`]と似ていますが、入力ストリーム内の区切り文字と値の間の空白文字をスキップします。
ただし、フォーマット文字列に空白文字が含まれている場合、入力ストリームにもこれらの文字が存在することが期待されます。
また、空のプレースホルダー(`${}`または`${:None}`)を指定することで、区切り文字を個別の部分に分割し、それらの間のスペースを無視できます。
このようなプレースホルダーは、空白文字をスキップする目的でのみ使用されます。
すべての行で列の値が同じ順序である場合、このフォーマットを使用して`JSON`を読み取ることができます。

:::note
このフォーマットは入力専用です。
:::


## 使用例 {#example-usage}

以下のリクエストを使用して、[JSON](/interfaces/formats/JSON)フォーマットの出力例からデータを挿入できます：

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
