---
alias: ['MD']
description: 'Markdown 形式のドキュメント'
keywords: ['Markdown']
slug: /interfaces/formats/Markdown
title: 'Markdown'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      | `MD`  |



## 説明 {#description}

結果を [Markdown](https://en.wikipedia.org/wiki/Markdown) 形式でエクスポートし、`.md` ファイルにそのまま貼り付けられる出力を生成できます。

Markdown 形式のテーブルは自動的に生成され、GitHub などの Markdown 対応プラットフォームで利用できます。この形式は出力専用です。



## 使用例 {#example-usage}

```sql
SELECT
    number,
    number * 2
FROM numbers(5)
FORMAT Markdown
```

```results
| number | multiply(number, 2) |
|-:|-:|
| 0 | 0 |
| 1 | 2 |
| 2 | 4 |
| 3 | 6 |
| 4 | 8 |
```


## 書式設定 {#format-settings}