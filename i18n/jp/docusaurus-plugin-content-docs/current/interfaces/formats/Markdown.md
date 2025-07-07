---
'description': 'Markdown formatの文書'
'keywords':
- 'Markdown'
'slug': '/interfaces/formats/Markdown'
'title': 'Markdown'
---



## 説明 {#description}

[Markdown](https://en.wikipedia.org/wiki/Markdown) 形式を使用して結果をエクスポートすることで、`.md` ファイルに貼り付ける準備が整った出力を生成できます。

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

## フォーマット設定 {#format-settings}
