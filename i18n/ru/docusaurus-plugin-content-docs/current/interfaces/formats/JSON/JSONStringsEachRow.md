---
alias: []
description: 'Документация для формата JSONStringsEachRow'
input_format: false
keywords: ['JSONStringsEachRow']
output_format: true
slug: /interfaces/formats/JSONStringsEachRow
title: 'JSONStringsEachRow'
---

| Вход  | Выход | Псевдоним |
|-------|-------|-----------|
| ✗     | ✔     |           |

## Описание {#description}

Отличается от [`JSONEachRow`](./JSONEachRow.md) только тем, что поля данных выводятся в виде строк, а не в типизированных значениях JSON.

## Пример использования {#example-usage}

```json
{"num":"42","str":"hello","arr":"[0,1]"}
{"num":"43","str":"hello","arr":"[0,1,2]"}
{"num":"44","str":"hello","arr":"[0,1,2,3]"}
```

## Настройки формата {#format-settings}
