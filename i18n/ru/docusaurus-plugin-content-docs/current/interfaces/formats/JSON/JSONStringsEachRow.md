---
title: 'JSONStringsEachRow'
slug: '/interfaces/formats/JSONStringsEachRow'
keywords: ['JSONStringsEachRow']
input_format: false
output_format: true
alias: []
---

| Входные данные | Выходные данные | Псевдоним |
|-------|--------|-------|
| ✗     | ✔      |       |

## Описание {#description}

Отличается от [`JSONEachRow`](./JSONEachRow.md) только тем, что поля данных выводятся в строковом формате, а не в типизированных JSON значениях.

## Пример использования {#example-usage}

```json
{"num":"42","str":"hello","arr":"[0,1]"}
{"num":"43","str":"hello","arr":"[0,1,2]"}
{"num":"44","str":"hello","arr":"[0,1,2,3]"}
```

## Настройки формата {#format-settings}
