---
alias: []
description: 'Документация для формата JSONCompactEachRow'
input_format: true
keywords: ['JSONCompactEachRow']
output_format: true
slug: /interfaces/formats/JSONCompactEachRow
title: 'JSONCompactEachRow'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Отличается от [`JSONEachRow`](./JSONEachRow.md) только тем, что строки данных выводятся как массивы, а не как объекты.

## Пример использования {#example-usage}

Пример:

```json
[42, "hello", [0,1]]
[43, "hello", [0,1,2]]
[44, "hello", [0,1,2,3]]
```

## Настройки формата {#format-settings}
