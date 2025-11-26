---
alias: []
description: 'Документация по формату JSONEachRowWithProgress'
input_format: false
keywords: ['JSONEachRowWithProgress']
output_format: true
slug: /interfaces/formats/JSONEachRowWithProgress
title: 'JSONEachRowWithProgress'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✗     | ✔      |       |



## Описание {#description}

Отличается от [`JSONEachRow`](./JSONEachRow.md)/[`JSONStringsEachRow`](./JSONStringsEachRow.md) тем, что ClickHouse также будет выдавать информацию о ходе выполнения в формате JSON.



## Пример использования

```json
{"row":{"num":42,"str":"привет","arr":[0,1]}}
{"row":{"num":43,"str":"привет","arr":[0,1,2]}}
{"row":{"num":44,"str":"привет","arr":[0,1,2,3]}}
{"progress":{"read_rows":"3","read_bytes":"24","written_rows":"0","written_bytes":"0","total_rows_to_read":"3"}}
```


## Параметры формата {#format-settings}
