---
'description': 'JSONEachRowフォーマットのドキュメント'
'keywords':
- 'JSONEachRow'
'slug': '/interfaces/formats/JSONEachRow'
'title': 'JSONEachRow'
---



## 説明 {#description}

このフォーマットでは、ClickHouseは各行を別々の、改行区切りのJSONオブジェクトとして出力します。別名: `JSONLines`, `NDJSON`.

## 使用例 {#example-usage}

例:

```json
{"num":42,"str":"hello","arr":[0,1]}
{"num":43,"str":"hello","arr":[0,1,2]}
{"num":44,"str":"hello","arr":[0,1,2,3]}
```

データをインポートする際に、設定が [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) を 1 に設定されている場合、名前が不明なカラムはスキップされます。

## フォーマット設定 {#format-settings}
