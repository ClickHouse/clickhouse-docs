---
slug: '/interfaces/formats/JSONEachRowWithProgress'
description: 'Документация для формата JSONEachRowWithProgress'
title: JSONEachRowWithProgress
keywords: ['JSONEachRowWithProgress']
doc_type: reference
input_format: false
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## Описание {#description}

Отличается от [`JSONEachRow`](./JSONEachRow.md)/[`JSONStringsEachRow`](./JSONStringsEachRow.md) тем, что ClickHouse также будет выдавать информацию о прогрессе в виде JSON значений.

## Пример использования {#example-usage}

```json
{"row":{"num":42,"str":"hello","arr":[0,1]}}
{"row":{"num":43,"str":"hello","arr":[0,1,2]}}
{"row":{"num":44,"str":"hello","arr":[0,1,2,3]}}
{"progress":{"read_rows":"3","read_bytes":"24","written_rows":"0","written_bytes":"0","total_rows_to_read":"3"}}
```

## Настройки формата {#format-settings}