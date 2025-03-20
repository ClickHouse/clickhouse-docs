---
title: Markdown
slug: /interfaces/formats/Markdown
keywords: [Markdown]
---

## 説明 {#description}

結果を [Markdown](https://en.wikipedia.org/wiki/Markdown) 形式でエクスポートして、`.md` ファイルにペーストできる出力を生成できます。

マークダウンテーブルは自動的に生成され、Github のようなマークダウン対応プラットフォームで使用できます。この形式は出力専用です。

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

## 形式設定 {#format-settings}
