---
description: 'JSONEachRowフォーマットのドキュメント'
keywords: ['JSONEachRow']
slug: /interfaces/formats/JSONEachRow
title: 'JSONEachRow'
---

## 説明 {#description}

このフォーマットでは、ClickHouseは各行を区切られた改行区切りのJSONオブジェクトとして出力します。別名: `JSONLines`, `NDJSON`。

## 例 {#example-usage}

例:

```json
{"num":42,"str":"hello","arr":[0,1]}
{"num":43,"str":"hello","arr":[0,1,2]}
{"num":44,"str":"hello","arr":[0,1,2,3]}
```

データをインポートする際、未知の名前のカラムは、[input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)が1に設定されている場合にスキップされます。

## フォーマット設定 {#format-settings}
