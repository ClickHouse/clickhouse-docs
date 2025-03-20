---
title: 'JSONStringsEachRowWithProgress'
slug: '/interfaces/formats/JSONStringsEachRowWithProgress'
keywords: ['JSONStringsEachRowWithProgress']
---

## Описание {#description}

Отличается от `JSONEachRow`/`JSONStringsEachRow` тем, что ClickHouse также предоставляет информацию о ходе выполнения в виде JSON значений.

## Пример использования {#example-usage}

```json
{"row":{"num":42,"str":"hello","arr":[0,1]}}
{"row":{"num":43,"str":"hello","arr":[0,1,2]}}
{"row":{"num":44,"str":"hello","arr":[0,1,2,3]}}
{"progress":{"read_rows":"3","read_bytes":"24","written_rows":"0","written_bytes":"0","total_rows_to_read":"3"}}
```

## Настройки формата {#format-settings}
