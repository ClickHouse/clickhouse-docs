---
alias: []
description: 'Документация для формата JSONCompactStringsEachRow'
input_format: true
keywords: ['JSONCompactStringsEachRow']
output_format: true
slug: /interfaces/formats/JSONCompactStringsEachRow
title: 'JSONCompactStringsEachRow'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Отличается от [`JSONCompactEachRow`](./JSONCompactEachRow.md) тем, что поля данных выводятся как строки, а не как типизированные значения JSON.

## Пример использования {#example-usage}

Пример:

```json
["42", "hello", "[0,1]"]
["43", "hello", "[0,1,2]"]
["44", "hello", "[0,1,2,3]"]
```

## Настройки формата {#format-settings}
