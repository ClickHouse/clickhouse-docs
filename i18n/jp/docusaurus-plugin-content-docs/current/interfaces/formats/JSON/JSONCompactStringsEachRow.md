---
'alias': []
'description': 'JSONCompactStringsEachRowフォーマットのドキュメント'
'input_format': true
'keywords':
- 'JSONCompactStringsEachRow'
'output_format': true
'slug': '/interfaces/formats/JSONCompactStringsEachRow'
'title': 'JSONCompactStringsEachRow'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

データフィールドが型付きJSON値ではなく文字列として出力される点を除いて、 [`JSONCompactEachRow`](./JSONCompactEachRow.md) とは異なります。

## 使用例 {#example-usage}

例:

```json
["42", "hello", "[0,1]"]
["43", "hello", "[0,1,2]"]
["44", "hello", "[0,1,2,3]"]
```

## フォーマット設定 {#format-settings}
