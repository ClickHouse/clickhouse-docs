---
'description': 'Markdown形式のドキュメント'
'keywords':
- 'Markdown'
'slug': '/interfaces/formats/Markdown'
'title': 'Markdown'
'doc_type': 'reference'
---

## 説明 {#description}

結果を[Markdown](https://en.wikipedia.org/wiki/Markdown)形式でエクスポートして、`.md`ファイルに貼り付ける準備が整った出力を生成することができます。

Markdownテーブルは自動的に生成され、GithubのようなMarkdown対応プラットフォームで使用することができます。この形式は出力にのみ使用されます。

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
