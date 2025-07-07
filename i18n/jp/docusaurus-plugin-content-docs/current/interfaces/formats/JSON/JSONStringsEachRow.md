---
'alias': []
'description': 'JSONStringsEachRow フォーマットのドキュメント'
'input_format': false
'keywords':
- 'JSONStringsEachRow'
'output_format': true
'slug': '/interfaces/formats/JSONStringsEachRow'
'title': 'JSONStringsEachRow'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

[`JSONEachRow`](./JSONEachRow.md) との違いは、データフィールドが型付きの JSON 値ではなく、文字列で出力される点です。

## 例の使用法 {#example-usage}

```json
{"num":"42","str":"hello","arr":"[0,1]"}
{"num":"43","str":"hello","arr":"[0,1,2]"}
{"num":"44","str":"hello","arr":"[0,1,2,3]"}
```

## フォーマット設定 {#format-settings}
