---
alias: []
description: 'Документация для формата JSONEachRowWithProgress'
input_format: false
keywords: ['JSONEachRowWithProgress']
output_format: true
slug: /interfaces/formats/JSONEachRowWithProgress
title: 'JSONEachRowWithProgress'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## Description {#description}

Отличается от [`JSONEachRow`](./JSONEachRow.md)/[`JSONStringsEachRow`](./JSONStringsEachRow.md) тем, что ClickHouse также будет предоставлять информацию о прогрессе в качестве значений JSON.

## Example Usage {#example-usage}

```json
{"row":{"num":42,"str":"hello","arr":[0,1]}}
{"row":{"num":43,"str":"hello","arr":[0,1,2]}}
{"row":{"num":44,"str":"hello","arr":[0,1,2,3]}}
{"progress":{"read_rows":"3","read_bytes":"24","written_rows":"0","written_bytes":"0","total_rows_to_read":"3"}}
```

## Format Settings {#format-settings}
